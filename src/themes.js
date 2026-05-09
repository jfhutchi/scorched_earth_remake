export const BATTLE_THEMES = [
    {
        id: 'green',
        label: 'Green Hills',
        sky: ['#79c7ea', '#cfeef5', '#f5f6dc'],
        sun: '#ffe49c',
        haze: 'rgba(247, 237, 190, 0.28)',
        far: '#7fb4a7',
        mid: '#6aa36f',
        near: '#4e7d45',
        cloud: 'rgba(255, 255, 255, 0.72)',
        particles: 'clouds',
        terrain: {
            top: '#5eaa54',
            highlight: '#8ed06c',
            base: '#8a653e',
            mid: '#6d4b31',
            deep: '#3d2b22',
            strata: 'rgba(255, 218, 153, 0.14)',
            stones: ['#9a7b57', '#5f4d3d', '#c09b68'],
            scorch: 'rgba(42, 30, 24, 0.48)',
        },
    },
    {
        id: 'desert',
        label: 'Desert Canyon',
        sky: ['#f4a05f', '#f4cf8d', '#f6e5b8'],
        sun: '#fff1aa',
        haze: 'rgba(255, 193, 104, 0.22)',
        far: '#b56f4f',
        mid: '#a15e43',
        near: '#70412f',
        cloud: 'rgba(255, 222, 162, 0.34)',
        particles: 'dust',
        terrain: {
            top: '#d4a34f',
            highlight: '#f0ca72',
            base: '#9b633d',
            mid: '#7a4631',
            deep: '#3f2820',
            strata: 'rgba(255, 222, 142, 0.18)',
            stones: ['#c88647', '#73442e', '#e0b06a'],
            scorch: 'rgba(45, 26, 18, 0.52)',
        },
    },
    {
        id: 'snow',
        label: 'Snowy Mountains',
        sky: ['#81add3', '#c9e3f0', '#f3f6f0'],
        sun: '#f9f5d8',
        haze: 'rgba(220, 242, 255, 0.34)',
        far: '#8299a4',
        mid: '#6f8792',
        near: '#495d66',
        cloud: 'rgba(255, 255, 255, 0.64)',
        particles: 'snow',
        terrain: {
            top: '#e6f3f4',
            highlight: '#ffffff',
            base: '#6e7680',
            mid: '#515a63',
            deep: '#2d343d',
            strata: 'rgba(226, 245, 252, 0.16)',
            stones: ['#aeb7bd', '#68747d', '#d8e2e4'],
            scorch: 'rgba(32, 34, 36, 0.54)',
        },
    },
];

export function getBattleTheme(id) {
    return BATTLE_THEMES.find((theme) => theme.id === id) || BATTLE_THEMES[0];
}

export function pickBattleTheme(previousId = null) {
    if (BATTLE_THEMES.length <= 1) return BATTLE_THEMES[0];
    let theme = BATTLE_THEMES[Math.floor(Math.random() * BATTLE_THEMES.length)];
    if (theme.id === previousId) {
        const index = (BATTLE_THEMES.findIndex((candidate) => candidate.id === previousId) + 1) % BATTLE_THEMES.length;
        theme = BATTLE_THEMES[index];
    }
    return theme;
}
