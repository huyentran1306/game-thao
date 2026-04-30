"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { GameSave, PlayerData, Hero, GameSpeed, DailyQuestState } from '@/types';
import { HEROES_DATA, CAMPAIGN_STAGES, DUNGEON_FLOORS, getExpRequired, GACHA_CHESTS, DUPE_COMPENSATION, GIFT_CODES, DAILY_QUESTS, AFK_CONFIG, RARITY_CONFIG, STAR_UPGRADE_COST, rollSubStats } from '@/lib/constants';

// ─────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────
const createInitialPlayer = (): PlayerData => ({
  id: 'player_1',
  name: 'Chiến Thần',
  level: 1,
  exp: 0,
  maxExp: getExpRequired(1),
  gold: 2000,
  diamond: 300,
  totalStars: 0,
  starBoxCount: 0,
  avatarHeroId: 'thach_hai',
  gameSpeed: 1,
  speedUnlocked: false,
  essence: 0,
});

const createInitialDailyQuests = (): DailyQuestState => ({
  date: '',
  progress: {},
  claimed: {},
});

const createInitialSave = (): GameSave => ({
  player: createInitialPlayer(),
  heroes: HEROES_DATA.map(h => ({
    ...h,
    isUnlocked: ['thach_hai', 'phong_lam', 'loi_xa', 'thuy_tinh', 'am_phong'].includes(h.id),
  })),
  campaign: {},
  dungeon: {},
  worldTree: { unlockedNodes: [] },
  inventory: { equipment: [] },
  dailyQuests: createInitialDailyQuests(),
  afkSession: null,
  giftCodesUsed: [],
  lastSaved: Date.now(),
});

// Merge saved heroes with latest HEROES_DATA to pick up new fields
function mergeHeroDefaults(saved: Hero[]): Hero[] {
  return HEROES_DATA.map(def => {
    const existing = saved.find(h => h.id === def.id);
    if (!existing) return def;
    return {
      ...def,
      isUnlocked: existing.isUnlocked,
      level: existing.level ?? def.level,
      hp: existing.hp ?? def.hp,
      maxHp: existing.maxHp ?? def.maxHp,
      atk: existing.atk ?? def.atk,
      def: existing.def ?? def.def,
      spd: existing.spd ?? def.spd,
      stars: existing.stars ?? def.stars,
      subStats: existing.subStats ?? [],
    };
  });
}

function migrateSave(raw: Partial<GameSave>): GameSave {
  const base = createInitialSave();
  return {
    ...base,
    ...raw,
    player: { ...base.player, ...(raw.player ?? {}) },
    heroes: mergeHeroDefaults(raw.heroes ?? []),
    dailyQuests: raw.dailyQuests ?? createInitialDailyQuests(),
    afkSession: raw.afkSession ?? null,
    giftCodesUsed: raw.giftCodesUsed ?? [],
  };
}

// ─────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────
type Action =
  | { type: 'LOAD_SAVE'; save: GameSave }
  | { type: 'SET_PLAYER_NAME'; name: string }
  | { type: 'SET_AVATAR'; heroId: string }
  | { type: 'ADD_EXP'; amount: number }
  | { type: 'ADD_GOLD'; amount: number }
  | { type: 'ADD_DIAMOND'; amount: number }
  | { type: 'ADD_ESSENCE'; amount: number }
  | { type: 'UNLOCK_HERO'; heroId: string }
  | { type: 'UNLOCK_SPEED' }
  | { type: 'SET_GAME_SPEED'; speed: GameSpeed }
  | { type: 'COMPLETE_STAGE'; stageId: string; stars: number; time: number }
  | { type: 'CLEAR_DUNGEON'; dungeonId: string }
  | { type: 'UNLOCK_WORLD_TREE_NODE'; nodeId: string; goldCost: number; essenceCost: number }
  | { type: 'OPEN_STAR_BOX' }
  | { type: 'OPEN_CHEST'; chestId: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' }
  | { type: 'UPGRADE_HERO_STARS'; heroId: string }
  | { type: 'REDEEM_GIFT_CODE'; code: string }
  | { type: 'CLAIM_DAILY_QUEST'; questId: string }
  | { type: 'TICK_DAILY_QUEST'; questId: string; amount: number }
  | { type: 'RESET_DAILY_QUESTS'; date: string }
  | { type: 'START_AFK' }
  | { type: 'COLLECT_AFK' }
  | { type: 'RESET_GAME' };

// ─────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────
function gameReducer(state: GameSave, action: Action): GameSave {
  switch (action.type) {
    case 'LOAD_SAVE':
      return action.save;

    case 'SET_PLAYER_NAME':
      return { ...state, player: { ...state.player, name: action.name } };

    case 'SET_AVATAR':
      return { ...state, player: { ...state.player, avatarHeroId: action.heroId } };

    case 'ADD_EXP': {
      let { exp, level, maxExp, speedUnlocked } = state.player;
      exp += action.amount;
      while (exp >= maxExp) {
        exp -= maxExp;
        level++;
        maxExp = getExpRequired(level);
        if (level >= 10) speedUnlocked = true;
      }
      return { ...state, player: { ...state.player, exp, level, maxExp, speedUnlocked } };
    }

    case 'ADD_GOLD':
      return { ...state, player: { ...state.player, gold: state.player.gold + action.amount } };

    case 'ADD_DIAMOND':
      return { ...state, player: { ...state.player, diamond: state.player.diamond + action.amount } };

    case 'ADD_ESSENCE':
      return { ...state, player: { ...state.player, essence: state.player.essence + action.amount } };

    case 'UNLOCK_HERO':
      return {
        ...state,
        heroes: state.heroes.map(h => h.id === action.heroId ? { ...h, isUnlocked: true } : h),
      };

    case 'UNLOCK_SPEED':
      return { ...state, player: { ...state.player, speedUnlocked: true } };

    case 'SET_GAME_SPEED':
      return { ...state, player: { ...state.player, gameSpeed: action.speed } };

    case 'COMPLETE_STAGE': {
      const existing = state.campaign[action.stageId];
      const prevStars = existing?.stars ?? 0;
      const newStars = Math.max(prevStars, action.stars);
      const gained = newStars - prevStars;
      const totalStars = state.player.totalStars + gained;
      const starBoxCount = state.player.starBoxCount + gained;
      return {
        ...state,
        player: { ...state.player, totalStars, starBoxCount },
        campaign: {
          ...state.campaign,
          [action.stageId]: { stars: newStars, bestTime: action.time },
        },
      };
    }

    case 'CLEAR_DUNGEON':
      return {
        ...state,
        dungeon: { ...state.dungeon, [action.dungeonId]: { cleared: true } },
      };

    case 'UNLOCK_WORLD_TREE_NODE': {
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - action.goldCost,
          essence: state.player.essence - action.essenceCost,
        },
        worldTree: { unlockedNodes: [...state.worldTree.unlockedNodes, action.nodeId] },
      };
    }

    case 'OPEN_STAR_BOX': {
      const boxes = Math.floor(state.player.starBoxCount / 5);
      if (boxes < 1) return state;
      return {
        ...state,
        player: {
          ...state.player,
          starBoxCount: state.player.starBoxCount % 5,
          diamond: state.player.diamond + boxes * 50,
        },
      };
    }

    case 'OPEN_CHEST': {
      const chest = GACHA_CHESTS.find(c => c.id === action.chestId);
      if (!chest) return state;
      const { gold = 0, diamond = 0 } = chest.cost;
      if (state.player.gold < gold || state.player.diamond < diamond) return state;

      // Weighted rarity draw
      const rarities = Object.entries(chest.dropRates) as [import('@/types').HeroRarity, number][];
      const roll = Math.random() * 100;
      let cum = 0;
      let drawnRarity = rarities[0][0];
      for (const [r, w] of rarities) {
        cum += w;
        if (roll < cum) { drawnRarity = r; break; }
      }

      // Pick random hero of that rarity
      const pool = state.heroes.filter(h => h.rarity === drawnRarity);
      if (!pool.length) {
        return { ...state, player: { ...state.player, gold: state.player.gold - gold, diamond: state.player.diamond - diamond } };
      }
      const drawn = pool[Math.floor(Math.random() * pool.length)];

      // Duplicate compensation
      let newHeroes = state.heroes;
      let goldBonus = 0;
      if (drawn.isUnlocked) {
        goldBonus = DUPE_COMPENSATION[drawn.rarity];
      } else {
        const subStats = rollSubStats(drawnRarity === 'CHI_TON' ? 3 : drawnRarity === 'KIM_CUONG' ? 2 : 1);
        newHeroes = state.heroes.map(h =>
          h.id === drawn.id ? { ...h, isUnlocked: true, subStats } : h
        );
      }

      return {
        ...state,
        heroes: newHeroes,
        player: {
          ...state.player,
          gold: state.player.gold - gold + goldBonus,
          diamond: state.player.diamond - diamond,
        },
      };
    }

    case 'UPGRADE_HERO_STARS': {
      const hero = state.heroes.find(h => h.id === action.heroId);
      if (!hero || !hero.isUnlocked || hero.stars >= 6) return state;
      const nextStar = (hero.stars + 1) as import('@/types').StarLevel;
      const cost = STAR_UPGRADE_COST[nextStar];
      if (state.player.gold < cost) return state;

      const mult = RARITY_CONFIG[hero.rarity].starMultiplier[nextStar - 1];
      const base = HEROES_DATA.find(h => h.id === hero.id)!;
      const newSubStats = rollSubStats(1);

      return {
        ...state,
        heroes: state.heroes.map(h =>
          h.id === action.heroId ? {
            ...h,
            stars: nextStar,
            atk: Math.round(base.atk * mult),
            def: Math.round(base.def * mult),
            maxHp: Math.round(base.maxHp * mult),
            hp: Math.round(base.maxHp * mult),
            spd: Math.round(base.spd * (1 + (nextStar - 1) * 0.05)),
            subStats: [...h.subStats, ...newSubStats],
          } : h
        ),
        player: { ...state.player, gold: state.player.gold - cost },
      };
    }

    case 'REDEEM_GIFT_CODE': {
      const code = action.code.trim().toUpperCase();
      if (state.giftCodesUsed.includes(code)) return state;
      const gift = GIFT_CODES[code];
      if (!gift) return state;

      let newState: GameSave = {
        ...state,
        giftCodesUsed: [...state.giftCodesUsed, code],
        player: {
          ...state.player,
          gold: state.player.gold + gift.gold,
          diamond: state.player.diamond + gift.diamond,
        },
      };

      if (gift.heroId) {
        newState = {
          ...newState,
          heroes: newState.heroes.map(h =>
            h.id === gift.heroId ? { ...h, isUnlocked: true } : h
          ),
        };
      }

      return newState;
    }

    case 'CLAIM_DAILY_QUEST': {
      const quest = DAILY_QUESTS.find(q => q.id === action.questId);
      if (!quest) return state;
      const prog = state.dailyQuests.progress[quest.id] ?? 0;
      if (prog < quest.target) return state;
      if (state.dailyQuests.claimed[quest.id]) return state;

      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + quest.rewardGold,
          diamond: state.player.diamond + quest.rewardDiamond,
        },
        dailyQuests: {
          ...state.dailyQuests,
          claimed: { ...state.dailyQuests.claimed, [quest.id]: true },
        },
      };
    }

    case 'TICK_DAILY_QUEST': {
      const current = state.dailyQuests.progress[action.questId] ?? 0;
      const quest = DAILY_QUESTS.find(q => q.id === action.questId);
      if (!quest) return state;
      return {
        ...state,
        dailyQuests: {
          ...state.dailyQuests,
          progress: {
            ...state.dailyQuests.progress,
            [action.questId]: Math.min(current + action.amount, quest.target),
          },
        },
      };
    }

    case 'RESET_DAILY_QUESTS':
      return {
        ...state,
        dailyQuests: { date: action.date, progress: { login: 1 }, claimed: {} },
      };

    case 'START_AFK':
      return {
        ...state,
        afkSession: {
          startedAt: Date.now(),
          goldPerHour: AFK_CONFIG.BASE_GOLD_PER_HOUR * state.player.level,
          expPerHour: AFK_CONFIG.BASE_EXP_PER_HOUR * state.player.level,
        },
      };

    case 'COLLECT_AFK': {
      if (!state.afkSession) return state;
      const elapsed = (Date.now() - state.afkSession.startedAt) / 3600000;
      const hours = Math.min(elapsed, AFK_CONFIG.MAX_HOURS);
      const goldGained = Math.floor(state.afkSession.goldPerHour * hours);
      const expGained = Math.floor(state.afkSession.expPerHour * hours);

      let { exp, level, maxExp, speedUnlocked } = state.player;
      exp += expGained;
      while (exp >= maxExp) {
        exp -= maxExp; level++;
        maxExp = getExpRequired(level);
        if (level >= 10) speedUnlocked = true;
      }

      return {
        ...state,
        afkSession: null,
        player: {
          ...state.player,
          gold: state.player.gold + goldGained,
          exp, level, maxExp, speedUnlocked,
        },
      };
    }

    case 'RESET_GAME':
      return createInitialSave();

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────
interface GameContextValue {
  state: GameSave;
  dispatch: React.Dispatch<Action>;
  getHero: (id: string) => Hero | undefined;
  getUnlockedHeroes: () => Hero[];
  getStageResult: (stageId: string) => { stars: number; bestTime: number } | undefined;
  isDungeonCleared: (dungeonId: string) => boolean;
  isWorldTreeNodeUnlocked: (nodeId: string) => boolean;
  canOpenStarBox: () => boolean;
  setName: (name: string) => void;
  setAvatar: (heroId: string) => void;
  addExp: (amount: number) => void;
  addGold: (amount: number) => void;
  addDiamond: (amount: number) => void;
  addEssence: (amount: number) => void;
  unlockHero: (heroId: string) => void;
  setGameSpeed: (speed: GameSpeed) => void;
  completeStage: (stageId: string, stars: number, time: number) => void;
  openStarBox: () => void;
  openChest: (chestId: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND') => void;
  upgradeHeroStars: (heroId: string) => void;
  redeemGiftCode: (code: string) => boolean;
  claimDailyQuest: (questId: string) => void;
  tickDailyQuest: (questId: string, amount: number) => void;
  startAfk: () => void;
  collectAfk: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const SAVE_KEY = 'dtct_save_v2';

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    if (typeof window === 'undefined') return createInitialSave();
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) return migrateSave(JSON.parse(saved));
      // Migrate from v1
      const oldSave = localStorage.getItem('dtct_save_v1');
      if (oldSave) return migrateSave(JSON.parse(oldSave));
    } catch {}
    return createInitialSave();
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaved: Date.now() }));
    } catch {}
  }, [state]);

  // Daily quest reset check
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.dailyQuests.date !== today) {
      dispatch({ type: 'RESET_DAILY_QUESTS', date: today });
    }
  }, [state.dailyQuests.date]);

  const getHero = useCallback((id: string) => state.heroes.find(h => h.id === id), [state.heroes]);
  const getUnlockedHeroes = useCallback(() => state.heroes.filter(h => h.isUnlocked), [state.heroes]);
  const getStageResult = useCallback((stageId: string) => state.campaign[stageId], [state.campaign]);
  const isDungeonCleared = useCallback((id: string) => !!state.dungeon[id]?.cleared, [state.dungeon]);
  const isWorldTreeNodeUnlocked = useCallback((id: string) => state.worldTree.unlockedNodes.includes(id), [state.worldTree]);
  const canOpenStarBox = useCallback(() => state.player.starBoxCount >= 5, [state.player.starBoxCount]);

  const setName = (name: string) => dispatch({ type: 'SET_PLAYER_NAME', name });
  const setAvatar = (heroId: string) => dispatch({ type: 'SET_AVATAR', heroId });
  const addExp = (amount: number) => dispatch({ type: 'ADD_EXP', amount });
  const addGold = (amount: number) => dispatch({ type: 'ADD_GOLD', amount });
  const addDiamond = (amount: number) => dispatch({ type: 'ADD_DIAMOND', amount });
  const addEssence = (amount: number) => dispatch({ type: 'ADD_ESSENCE', amount });
  const unlockHero = (heroId: string) => dispatch({ type: 'UNLOCK_HERO', heroId });
  const setGameSpeed = (speed: GameSpeed) => dispatch({ type: 'SET_GAME_SPEED', speed });
  const completeStage = (stageId: string, stars: number, time: number) => dispatch({ type: 'COMPLETE_STAGE', stageId, stars, time });
  const openStarBox = () => dispatch({ type: 'OPEN_STAR_BOX' });
  const openChest = (chestId: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND') => dispatch({ type: 'OPEN_CHEST', chestId });
  const upgradeHeroStars = (heroId: string) => dispatch({ type: 'UPGRADE_HERO_STARS', heroId });
  const redeemGiftCode = (code: string): boolean => {
    const c = code.trim().toUpperCase();
    if (state.giftCodesUsed.includes(c) || !GIFT_CODES[c]) return false;
    dispatch({ type: 'REDEEM_GIFT_CODE', code: c });
    return true;
  };
  const claimDailyQuest = (questId: string) => dispatch({ type: 'CLAIM_DAILY_QUEST', questId });
  const tickDailyQuest = (questId: string, amount: number) => dispatch({ type: 'TICK_DAILY_QUEST', questId, amount });
  const startAfk = () => dispatch({ type: 'START_AFK' });
  const collectAfk = () => dispatch({ type: 'COLLECT_AFK' });

  return (
    <GameContext.Provider value={{
      state, dispatch,
      getHero, getUnlockedHeroes, getStageResult, isDungeonCleared,
      isWorldTreeNodeUnlocked, canOpenStarBox,
      setName, setAvatar, addExp, addGold, addDiamond, addEssence,
      unlockHero, setGameSpeed, completeStage, openStarBox,
      openChest, upgradeHeroStars, redeemGiftCode,
      claimDailyQuest, tickDailyQuest, startAfk, collectAfk,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
