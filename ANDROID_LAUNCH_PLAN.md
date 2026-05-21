# Crater Command — Android Launch & Ad-Monetization Roadmap

> Goal: ship Crater Command as a fun, playable **Android** game on Google Play, monetized **free + ads only**.
> Scope of this doc: how to get from the current web/PWA build to a published, ad-earning Play Store app — the packaging approach, concrete migration steps, ad design, store requirements, costs, timeline, and an honest read on revenue.
>
> Status when written: v0.8.0, branch `castle-siege-v0.8.0`. Castle Siege is mid-development (Codex). Nothing here requires touching the game logic Codex is editing — the Android work is mostly additive (a wrapper project + an ads module).

---

## TL;DR (the recommended path)

1. **Wrap the existing web game in [Capacitor](https://capacitorjs.com), not a TWA and not a rewrite.** Capacitor bundles your HTML/JS/CSS inside a native Android shell, runs fully offline, and — critically — gives you a real bridge to the **AdMob mobile SDK**. A TWA (the "easy" PWA wrapper) cannot run AdMob and is the wrong tool for ad revenue.
2. **Your codebase is already in good shape for this.** All asset paths are relative, there's no service worker to fight, assets are generated at runtime (so the app download is tiny), it's landscape-locked, and it already handles app background/foreground lifecycle. The migration is mostly mechanical.
3. **Monetize with rewarded video as the centerpiece**, interstitials at natural breaks, and (optionally) a menu-only banner. Your existing in-game economy (`$`, shop, round rewards) and the Castle Siege retry loop are ready-made, non-annoying places to put rewarded ads.
4. **Budget ~$25 (one-time) and plan for a hard scheduling gate:** a brand-new personal Play developer account must run **closed testing with ≥12 testers for 14 continuous days** before it can publish to production. Start that clock early.
5. **Set revenue expectations honestly.** Ads-only indie titles earn little until installs scale. The plan below maximizes revenue *per player* and flags what actually moves the needle (retention, rewarded-ad engagement, geography, content depth).

Realistic first-launch timeline: **~3–6 focused weeks of part-time work**, with the 14-day testing window running in parallel near the end.

---

## 1. Packaging decision: Capacitor vs TWA vs rewrite

This is the one architectural decision that everything else depends on, so it's worth being deliberate.

**Option A — Trusted Web Activity (TWA) via Bubblewrap / PWABuilder.** A TWA is a thin Chrome shell that loads your live PWA URL fullscreen. It's the lowest-effort way to get a PWA onto Play. **But it is the wrong choice here**, for one decisive reason: a TWA is just a browser tab, so you cannot run the **AdMob native mobile SDK** inside it. Your only ad option would be web ad units (AdSense-class) rendered in the page, which carry lower eCPMs, more policy friction inside an app, and no access to high-value mobile rewarded/interstitial inventory. A TWA also requires the game to be online to load. Since your entire goal is mobile ad revenue, the TWA's headline advantage (simplicity) doesn't buy you the thing you need.

**Option B — Capacitor (recommended).** Capacitor (by the Ionic team) packages your existing static web app into a native Android project. The web code runs in a system WebView, served from a local origin, so it works **offline** and needs **zero rewrite**. You get a native plugin bridge, and there's a mature, actively maintained **[`@capacitor-community/admob`](https://github.com/capacitor-community/admob)** plugin (v7.x as of early 2026) that supports banner, interstitial, and rewarded ads plus the required consent forms. This is the standard, well-trodden path for "web game → Play Store with AdMob." It also lets you reach true **immersive fullscreen** on Android — something you couldn't fully achieve on iOS Safari.

**Option C — Native rewrite or game engine (Unity/Godot).** Throws away a working, polished v0.8.0 codebase to solve a problem you don't have. Not recommended. Revisit only if you later hit WebView performance ceilings (you won't, for a Canvas artillery game) or want platform features Capacitor can't reach.

**Decision: Capacitor.** The rest of this plan assumes it.

| | TWA | **Capacitor** | Rewrite |
|---|---|---|---|
| Effort to first build | Lowest | Low–medium | Very high |
| Runs AdMob mobile SDK | ❌ No | ✅ Yes | ✅ Yes |
| Works offline | ❌ Needs network | ✅ Yes | ✅ Yes |
| Reuses current code | ✅ 100% | ✅ 100% | ❌ 0% |
| True immersive fullscreen | Partial | ✅ Yes | ✅ Yes |
| Right tool for *ad revenue* | ❌ | ✅ | ✅ (overkill) |

---

## 2. What's already working in your favor

A quick readiness audit of the current repo — these are real advantages that make Capacitor smooth:

- **All asset references are relative** (`src/main.js`, `styles.css`, `manifest.webmanifest`, `icons/...`). Capacitor serves from a local root, so nothing breaks. If a `<base href>` or any absolute `/scorched_earth_remake/...` path ever creeps in for GitHub Pages, it would break inside the app — keep paths relative.
- **No service worker registered.** Service workers can interfere with Capacitor's local server; not having one is one less thing to disable.
- **Assets are generated at runtime** (Web Audio for sound, Canvas for sprites/icons/terrain — no external image or audio files). The shipped app is therefore **tiny** (a few hundred KB of code), which means fast installs and better install→open conversion.
- **Already landscape-first** (`manifest` orientation `landscape`, an `orientationHint`, and a best-effort `screen.orientation.lock('landscape')` in `main.js`). In Capacitor you'll enforce this natively, which is more reliable than the web API.
- **App lifecycle is already handled** (`visibilitychange`, `pagehide`, `blur`, `focus`, `freeze` suspend/stop generated audio). This maps cleanly to mobile foreground/background and means audio won't keep playing when the app is backgrounded.
- **A real in-game economy already exists** (money, shop, per-round rewards, utilities). Rewarded ads have a natural "give the player currency / a second chance" hook without inventing new systems.

The net: this is close to a best-case codebase for a web→Capacitor port.

---

## 3. Phase 1 — Package with Capacitor

Goal of this phase: a `.apk`/`.aab` you can install on a real Android phone that plays exactly like the web game, offline, fullscreen, landscape.

**3.1 Prerequisites (free).** Install Node.js (you have it), **Android Studio** (includes the Android SDK, an emulator, and the JDK), and accept the SDK licenses. No Mac required for Android.

**3.2 Add Capacitor to the project.** Capacitor needs a `webDir` containing the static build. Your repo *is* the static build (no bundler), so `webDir` can point at the project root or a copied `www/` folder. Roughly:

```bash
npm init -y                       # if there's no package.json yet
npm install @capacitor/core @capacitor/cli
npx cap init "Crater Command" com.craters.command --web-dir=.
npm install @capacitor/android
npx cap add android
npx cap copy
npx cap open android              # opens Android Studio to build/run
```

Pick a real, permanent **application ID** (e.g. `com.craters.command` or your own domain reversed). It can never change after launch, so choose deliberately.

> A note on the build pipeline: a no-bundler ES-module app works fine in Capacitor (the WebView serves modules over the local origin). You *don't* need Vite/webpack. If you ever want minification, a hashed cache-bust, or to strip `?debug=1` tooling from production, a light bundler step becomes worth it — but it's optional for v1.

**3.3 Native configuration & small code touches.** These are additive and won't collide with Codex's gameplay edits:

- **Orientation:** lock to `landscape` in the Android config / manifest (and keep the web fallback). Native lock is authoritative.
- **Immersive fullscreen:** enable sticky immersive mode so the status/nav bars hide during play. Pair with `@capacitor/status-bar`. This is the payoff that the iOS PWA couldn't reach.
- **Android back button:** install `@capacitor/app` and intercept the hardware/gesture **back** event so it maps to your existing "return to menu / close overlay" behavior (your `Escape` handler) instead of abruptly killing the app. Exiting should require back-from-menu (optionally a confirm).
- **Safe areas / notches:** you already use `viewport-fit=cover` and safe-area padding; verify on a notched device.
- **Audio gesture:** mobile WebViews require a user gesture before Web Audio starts. You almost certainly already unlock on first tap (the menu buttons); just re-verify in the WebView.
- **Versioning:** Android needs an integer `versionCode` (increment on *every* upload) and a `versionName` (your `v0.8.0`). Wire `versionName` to your existing `GAME_VERSION` so your version-validation script and the store stay in sync.

**3.4 Exit criteria for Phase 1:** the app installs from an `.aab`/`.apk`, launches offline, runs landscape-locked and fullscreen, audio suspends on background and resumes on return, and back navigates correctly. No ads yet.

---

## 4. Phase 2 — Monetization: free + ads, designed not to wreck the fun

The fastest way to kill a free game's retention (and therefore its ad revenue) is intrusive ads. The model below is built around **rewarded ads the player chooses to watch**, with sparing interstitials and an optional menu-only banner. "Free + ads" done well still leans heavily on opt-in rewarded inventory, which also happens to carry the **highest eCPM** of the three formats.

**4.1 The three formats and where each belongs.**

- **Rewarded video (your money-maker — make these great).** Opt-in, full-screen, the player taps to watch in exchange for a benefit. Natural hooks that fit systems you already have:
  - *Castle Siege:* on level failure, "Watch an ad to retry with +N shots / extra ammo." This is the single best placement — high intent, high completion, directly tied to the new mode's loop.
  - *Economy:* a "Watch for $X bonus" button in the pre-round / between-round **shop**, and "Double your round reward" on the round-summary screen. You already track money and round rewards, so this is a small UI addition, not a new system.
  - *Utilities:* "Watch to refill a Shield / First Aid / Parachute" when the player is out.
  Cap rewarded availability sensibly (e.g., a few per session) and always make the reward feel worth the 15–30s.
- **Interstitial (use sparingly).** Full-screen, *not* opt-in. Show only at genuine breaks — after a Castle Siege level completes/fails, or when a match ends — and **never** mid-gameplay, never at app launch, never back-to-back. Frequency-cap hard (e.g., min ~60–90s apart and at most every 2–3 transitions). Over-using interstitials is both a retention killer and an AdMob policy risk.
- **Banner (optional, menus only).** Anchored banners on static screens (main menu, shop, summary) earn pennies but cost nothing to add. **Do not** put a banner over the live landscape battlefield — it steals scarce play area and risks accidental-click policy violations. Honestly, you can ship v1 without banners and lose almost nothing.

**4.2 AdMob + plugin setup.**

1. Create a free **AdMob** account, register the app, and create ad units (one each: rewarded, interstitial, optional banner).
2. Install and configure **[`@capacitor-community/admob`](https://github.com/capacitor-community/admob)**. Put the AdMob **App ID** in the Android manifest as the plugin requires.
3. During development, **always use Google's official test ad unit IDs / register your device as a test device.** Clicking your own live ads gets the account suspended. Swap to real unit IDs only for release builds.
4. Preload ads (request the next rewarded/interstitial ahead of the moment you'll show it) so there's no wait when the player taps.

**4.3 Consent & privacy (required — don't skip).**

- Implement the **UMP (User Messaging Platform) consent flow**: call `requestConsentInfoUpdate()` at launch and `loadAndShowConsentFormIfRequired()` so EEA/UK/Switzerland users get a compliant consent form, and add a "privacy options" entry point in settings. The Capacitor AdMob plugin exposes the consent-form methods for this. (Note: serving ads in the EEA requires a Google-certified CMP and TCF v2.3 as of March 1, 2026 — UMP satisfies this.)
- You **must publish a privacy policy** (a URL) because the ads SDK collects data (e.g., advertising ID). This is required by both Play and AdMob. A simple hosted page is fine; you already control a GitHub Pages site you can host it on.
- **Children & ad eligibility — an important monetization decision:** a cartoon tank game can read as child-appealing. If the app is classified as *primarily* child-directed under Play's Families policy, you're restricted to certified ad partners and **non-personalized** ads (lower revenue). To keep full ad monetization, target a **teen/13+** audience in the Play "target audience & content" settings and design the listing accordingly — but be truthful; misdeclaring is a suspension risk. Decide this consciously, because it directly affects eCPM.

**4.4 Exit criteria for Phase 2:** rewarded, interstitial, and (if used) banner all show with **test** IDs; rewards grant correctly only on completion; interstitials respect the frequency cap; consent form appears for EEA; a privacy policy URL is live.

---

## 5. Phase 3 — Google Play Store readiness

**5.1 Account & format.** Register a **Google Play Developer account** — a **one-time ~$25 fee**. Play requires the **Android App Bundle (`.aab`)** format and uses **Play App Signing** (Google holds the upload/signing keys). Set this up once.

**5.2 Target API level.** New apps and updates must **target Android 15 (API level 35) or higher** (in force since Aug 31, 2025). A current Capacitor + Android Studio toolchain targets this by default; just confirm `targetSdkVersion`.

**5.3 The closed-testing gate (plan around this — it's the long pole).** A **personal** developer account created after Nov 13, 2023 must run **closed testing with at least 12 testers opted in for 14 continuous days** before it can request production access. (Google lowered this from 20 to 12 testers on Dec 11, 2024.) **Organization** accounts are exempt. Practical implications:
- Line up 12 real testers early (friends, a Discord, a subreddit, a tester-exchange community). They must join your closed track and **stay opted in** for the full 14 days.
- This 14-day clock can run **in parallel** with your store-listing polish, so start it as soon as you have a stable build.
- If you can register as an **organization**, you skip this gate — weigh that against the extra verification an org account needs.

**5.4 Store listing assets.** App icon (512×512), feature graphic (1024×500), and screenshots (your landscape gameplay — show Castle Siege, the shop, a satisfying explosion). Title, short description, full description — write these for **App Store Optimization** (see §7) since organic installs are your ad-revenue fuel.

**5.5 Compliance forms.**
- **Content rating** via the IARC questionnaire (cartoon artillery → likely Everyone/Everyone 10+; answer honestly about violence).
- **Data safety form** — declare what the **ads SDK** collects (advertising ID, approximate usage data) and how it's used. Be accurate; this is cross-checked.
- **Target audience & content** — set the teen/13+ audience per the §4.3 decision.
- **Privacy policy URL** — the one you published in Phase 2.
- **`app-ads.txt`** — host it on your developer-site domain to authorize your ad inventory (reduces spoofing, protects revenue). Good practice even for a small title.

**5.6 Pre-launch report.** Play runs your build on real devices automatically and flags crashes, ANRs, and policy issues before you ship — read it and fix what it finds.

**5.7 Exit criteria for Phase 3:** account live, `.aab` uploaded to a track, listing complete, all forms submitted, 12-tester/14-day requirement satisfied (if personal account), pre-launch report clean.

---

## 6. Phase 4 — Launch & iterate

- **Staged rollout.** Release to production at a small percentage first; watch crash-free rate and reviews; ramp to 100%.
- **Switch to real ad unit IDs** and confirm the consent flow on a real EEA-region device or test.
- **Add analytics** (Firebase/GA for Android is free) so you can see retention (D1/D7), session length, and ad impressions per user — these are the levers you'll tune.
- **Mediation later (not v1).** Once you have traffic, AdMob **mediation/bidding** (adding networks like AppLovin, Unity Ads, Meta) lifts eCPM by making networks compete for each impression. Skip it at launch; revisit once you have meaningful DAU.
- **Content cadence.** More Castle Siege levels = more sessions = more ad impressions and better retention. Your campaign mode is the most direct lever on revenue you have, which is convenient given Codex is already building it.

---

## 7. Realistic revenue expectations (the honest part)

Ads-only is a **volume game**. Per-player earnings are small; the money comes from many engaged players watching (especially rewarded) ads. Setting expectations now prevents disappointment later.

**Benchmarks (rough, vary wildly by geo/season/fill):**
- **Rewarded video** eCPM: global average roughly **$8–$18**; Tier-1 (US/AU/JP) often **$13–$20+**; the wider industry quotes $10–$50. Highest of the three formats, and completion rates are very high (often 75%+) because it's opt-in.
- **Interstitial** eCPM: typically **~$3–$12**.
- **Banner** eCPM: **cents** (~$0.10–$1).
- Gaming eCPMs tend to run ~20–30% above other categories. Most apps serve a global mix, so **plan for ~70–80% of Tier-1 calculator estimates** and treat anything above as upside.

**Illustrative per-player math (your mileage will vary):** suppose an engaged player completes ~3 rewarded views and sees ~2 interstitials per active day. At ~$12 rewarded / ~$6 interstitial eCPM that's roughly `3×$0.012 + 2×$0.006 ≈ $0.048` per daily active user — call it an **ARPDAU around $0.01–$0.05** depending on geo, fill, and how compelling your rewarded hooks are.

**What that implies for scale:** at, say, $0.03 ARPDAU, **$1,000/month ≈ ~1,100 daily active users**; at $0.01 it's ~3,300 DAU. Because DAU is only a fraction of total installs (and churn is brutal in casual games), sustaining four-figure DAU typically means **tens of thousands of installs** plus decent retention. None of that is meant to discourage — it's to point the effort where it pays:

**Levers that actually move ad revenue, in order:**
1. **Retention** (D1/D7) — more return visits multiply every other number. Content depth (Castle Siege levels), progression, and feel-good juice matter most.
2. **Rewarded engagement** — make the rewards genuinely tempting and the moments well-timed (the retry-after-failure hook is gold).
3. **Geography** — Tier-1 installs are worth multiples of others; ASO and any future user acquisition should bias toward them.
4. **Install volume** — ASO first (free), paid UA only once you know your per-user economics, which ads-only rarely justifies early.
5. **Mediation** — a real eCPM uplift, but only worth wiring up once you have traffic.

A grounded first-year framing for a solo/indie ads-only title: treat early revenue as **"validation and beer money," not salary**, and let retention + content decide whether it's worth pushing on UA. If you later want materially more revenue per player, a **hybrid model** (keep ads, add a cheap "remove interstitials" IAP and optional cosmetic/level-pack purchases) usually out-earns ads-only — worth revisiting after launch even though you've chosen ads-only for v1.

---

## 8. Costs & timeline at a glance

| Item | Cost | Notes |
|---|---|---|
| Google Play Developer account | **~$25 one-time** | Required to publish |
| AdMob account | Free | Revenue share is taken from earnings |
| Capacitor + `@capacitor-community/admob` | Free / open-source | |
| Android Studio + JDK + SDK | Free | Your dev machine; no Mac needed |
| Icon / store graphics | $0 if self-made | You already generate in-game art |
| Privacy policy hosting | $0 | Host on your existing GitHub Pages site |
| 12 testers (closed testing) | $0 if you recruit them | Paid "tester-for-hire" services exist but aren't necessary |
| **Total out-of-pocket to launch** | **≈ $25** | The real cost is your time |

**Indicative timeline (part-time):**

| Phase | Calendar estimate |
|---|---|
| 1 — Capacitor packaging | ~3–7 days |
| 2 — AdMob + consent + ad placements | ~3–7 days |
| 3 — Store listing, forms, account | ~2–4 days of work… |
| 3 — …**+ 14-day closed-testing window** | runs in parallel; gates production |
| 4 — Staged launch | ~2–3 days |

So ~**3–6 weeks** wall-clock for a first public release, dominated by the mandatory 14-day testing period — which is exactly why you should start recruiting testers and running a closed track as early as Phase 2.

---

## 9. Risks, gotchas & policy landmines

- **The 12-tester / 14-day gate is the most common surprise.** It's a hard scheduling dependency for personal accounts. Start it early; an organization account avoids it.
- **AdMob policy = instant-suspension territory if violated.** Never click your own ads (use test IDs in dev), no ads obstructing gameplay, no accidental-click layouts, no interstitial at launch or back-to-back, rewarded must be opt-in. Suspensions are painful to reverse.
- **Consent is mandatory for EEA traffic.** Ship the UMP flow from day one; missing it can default your EEA requests to limited/no ads (lost revenue) or risk policy action.
- **Children/Families classification can quietly halve eCPM.** Make the teen/13+ vs child-directed call deliberately and truthfully (§4.3).
- **Target API level moves yearly.** API 35 is the floor now; expect to bump roughly annually to keep updating the app.
- **Keep paths relative.** A GitHub-Pages-only absolute subpath would work on the web but 404 inside the Capacitor app. Your CI already checks Pages-safe paths — make sure "Capacitor-safe (relative)" stays true too.
- **WebView performance:** fine for a Canvas artillery game, but test on a low-end device. Generated-at-runtime assets keep memory/download low, which helps.
- **Coordinate with Codex.** Everything above is **additive** — a new Capacitor `android/` project, a new ads module, and a few small native hooks (orientation, back button, fullscreen). It does not require editing the gameplay files Codex is changing. Do the packaging on a separate branch and merge after Castle Siege stabilizes to avoid churn.

---

## 10. Recommended next actions (in order)

1. **Decide the application ID** (permanent) and the **teen/13+ vs families** stance — both are hard to change later.
2. **Stand up the Capacitor Android project** and get an offline, landscape, fullscreen build running on a real phone (Phase 1).
3. **Create the AdMob account + test ad units**, wire in the rewarded "retry Castle Siege level" hook first (highest-value placement), then the shop/round-reward rewarded hooks, then a capped interstitial at level/match end (Phase 2).
4. **Register the Play account, publish a privacy policy, and open a closed-testing track with 12 testers** — start the 14-day clock now, in parallel with listing work (Phase 3).
5. **Polish the store listing for ASO**, pass the pre-launch report, satisfy the testing gate, then staged-rollout to production (Phases 3–4).
6. **Instrument analytics**, watch D1/D7 retention and rewarded engagement, and let those numbers decide whether to add levels, add mediation, or revisit a hybrid (ads + light IAP) model for more revenue per player.

---

### References

- Google Play closed-testing requirement (12 testers / 14 days, new personal accounts): https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play target API level requirement (API 35 since Aug 31 2025): https://developer.android.com/google/play/requirements/target-sdk
- Capacitor: https://capacitorjs.com — Ads guide: https://capacitorjs.com/docs/guides/ads
- `@capacitor-community/admob` plugin: https://github.com/capacitor-community/admob
- AdMob UMP consent / EEA requirements: https://developers.google.com/admob/android/privacy and https://support.google.com/admob/answer/13554116
- Rewarded-video eCPM benchmarks: https://www.playwire.com/blog/admob-ecpm-benchmarks-what-publishers-should-expect and https://www.businessofapps.com/ads/rewarded-video/
