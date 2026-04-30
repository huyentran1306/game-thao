"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { GameSave, PlayerData, Hero, BattleState, Difficulty, GameSpeed } from '@/types';
import { HEROES_DATA, CAMPAIGN_STAGES, DUNGEON_FLOORS, getExpRequired } from '@/lib/constants';

// ─────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────
const createInitialPlayer = (): PlayerData => ({
  id: 'player_1',
  name: 'Chiến Thần',
  level: 1,
  exp: 0,
  maxExp: getExpRequired(1),
  gold: 1000,
  diamond: 100,
  totalStars: 0,
  starBoxCount: 0,
  avatarHeroId: 'thach_hai',
  gameSpeed: 1,
  speedUnlocked: false,
  essence: 0,
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
  lastSaved: Date.now(),
});

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
      let { exp, level, maxExp, gold, diamond, speedUnlocked } = state.player;
      exp += action.amount;
      while (exp >= maxExp) {
        exp -= maxExp;
        level++;
        maxExp = getExpRequired(level);
        if (level >= 15) speedUnlocked = true;
      }
      return { ...state, player: { ...state.player, exp, level, maxExp, gold, diamond, speedUnlocked } };
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
      const { unlockedNodes } = state.worldTree;
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - action.goldCost,
          essence: state.player.essence - action.essenceCost,
        },
        worldTree: { unlockedNodes: [...unlockedNodes, action.nodeId] },
      };
    }

    case 'OPEN_STAR_BOX': {
      const boxes = Math.floor(state.player.starBoxCount / 5);
      if (boxes < 1) return state;
      const reward = boxes * 50; // 50 kiếm cương per box
      return {
        ...state,
        player: {
          ...state.player,
          starBoxCount: state.player.starBoxCount % 5,
          diamond: state.player.diamond + reward,
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
  // Helpers
  getHero: (id: string) => Hero | undefined;
  getUnlockedHeroes: () => Hero[];
  getStageResult: (stageId: string) => { stars: number; bestTime: number } | undefined;
  isDungeonCleared: (dungeonId: string) => boolean;
  isWorldTreeNodeUnlocked: (nodeId: string) => boolean;
  canOpenStarBox: () => boolean;
  // Actions
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
}

const GameContext = createContext<GameContextValue | null>(null);

const SAVE_KEY = 'dtct_save_v1';

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    if (typeof window === 'undefined') return createInitialSave();
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) return JSON.parse(saved) as GameSave;
    } catch {}
    return createInitialSave();
  });

  // Auto-save on state change
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaved: Date.now() }));
    } catch {}
  }, [state]);

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

  return (
    <GameContext.Provider value={{
      state, dispatch,
      getHero, getUnlockedHeroes, getStageResult, isDungeonCleared,
      isWorldTreeNodeUnlocked, canOpenStarBox,
      setName, setAvatar, addExp, addGold, addDiamond, addEssence,
      unlockHero, setGameSpeed, completeStage, openStarBox,
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
