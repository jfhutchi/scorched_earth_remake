import { siege_001 } from './levels/world1/siege_001.js';
import { siege_002 } from './levels/world1/siege_002.js';
import { siege_003 } from './levels/world1/siege_003.js';
import { siege_004 } from './levels/world1/siege_004.js';
import { siege_005 } from './levels/world1/siege_005.js';
import { siege_006 } from './levels/world1/siege_006.js';
import { siege_007 } from './levels/world1/siege_007.js';
import { siege_008 } from './levels/world1/siege_008.js';
import { siege_009 } from './levels/world2/siege_009.js';
import { siege_010 } from './levels/world2/siege_010.js';
import { siege_011 } from './levels/world2/siege_011.js';
import { siege_012 } from './levels/world2/siege_012.js';
import { siege_013 } from './levels/world2/siege_013.js';
import { siege_014 } from './levels/world2/siege_014.js';
import { siege_015 } from './levels/world2/siege_015.js';
import { siege_016 } from './levels/world2/siege_016.js';

const ALL_LEVELS = [
    siege_001, siege_002, siege_003, siege_004, siege_005, siege_006, siege_007, siege_008,
    siege_009, siege_010, siege_011, siege_012, siege_013, siege_014, siege_015, siege_016,
];

export const CASTLE_SIEGE_LEVELS = ALL_LEVELS.reduce((map, level) => {
    map[level.id] = level;
    return map;
}, {});

export const CASTLE_SIEGE_LEVEL_ORDER = ALL_LEVELS.map((level) => level.id);

export function getCastleSiegeLevel(levelId = 'siege_001') {
    return CASTLE_SIEGE_LEVELS[levelId] || CASTLE_SIEGE_LEVELS.siege_001;
}

export function getNextCastleSiegeLevelId(levelId) {
    const index = CASTLE_SIEGE_LEVEL_ORDER.indexOf(levelId);
    if (index === -1 || index >= CASTLE_SIEGE_LEVEL_ORDER.length - 1) return null;
    return CASTLE_SIEGE_LEVEL_ORDER[index + 1];
}
