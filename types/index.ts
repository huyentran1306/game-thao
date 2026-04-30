export type ElementType = 'WIND' | 'WATER' | 'EARTH' | 'THUNDER' | 'VOID';
export type HeroClass = 'TANK' | 'HEALER' | 'RANGER' | 'MAGE' | 'ASSASSIN';
export type HeroRarity = 'DONG' | 'BAC' | 'VANG' | 'KIM_CUONG' | 'CHI_TON';
export type SkillType = 'ATTACK' | 'DEFENSE' | 'SUPPORT';
export type Difficulty = 'EASY' | 'NORMAL' | 'ELITE';
export type GameSpeed = 1 | 1.5 | 2;
export type StarLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type AttackType = 'SINGLE' | 'MULTI' | 'AOE' | 'PIERCE' | 'EXPLOSIVE';
export type SubStatKey =
  | 'extraShots' | 'atkSpd' | 'lifesteal' | 'critRate'
  | 'critDmg' | 'armorPen' | 'regenPerSec' | 'bossDmg';
export type SubStatRarity = 'common' | 'rare' | 'epic';

export interface SubStat {
  key: SubStatKey;
  value: number;
  rarity: SubStatRarity;
}

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  cooldown: number;
  damage?: number;
  healPercent?: number;
  effect?: string;
  icon: string;
  unlockLevel?: number;
}

export interface Hero {
  id: string;
  name: string;
  element: ElementType;
  heroClass: HeroClass;
  rarity: HeroRarity;
  stars: StarLevel;
  attackType: AttackType;
  subStats: SubStat[];
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  skills: Skill[];
  avatar: string;
  emoji: string;
  auraColor: string;
  isUnlocked: boolean;
  lore?: string;
}

export interface Monster {
  id: string;
  instanceId: string;
  name: string;
  element: ElementType;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number;
  isBoss: boolean;
  isElite: boolean;
  spawnAt: number;
  reward: { exp: number; gold: number };
  emoji: string;
  size: 'sm' | 'md' | 'lg' | 'boss';
  posX: number;
  posY: number;
  alive: boolean;
  phase?: number;
}

export interface ActiveSkill {
  heroId: string;
  skillId: string;
  remainingCooldown: number;
  isActive: boolean;
}

export interface BattleState {
  stageId: string;
  difficulty: Difficulty;
  heroes: Hero[];
  monsters: Monster[];
  activeSkills: ActiveSkill[];
  progress: number;
  timeElapsed: number;
  gameSpeed: GameSpeed;
  isRunning: boolean;
  isPaused: boolean;
  result?: 'WIN' | 'LOSE';
  stars?: 1 | 2 | 3;
  bossSpawned1: boolean;
  bossSpawned2: boolean;
  levelUpPending?: LevelUpChoice;
  currentLevel: number;
  currentExp: number;
  expToNext: number;
}

export interface LevelUpChoice {
  options: Skill[];
  heroId?: string;
}

export interface Stage {
  id: string;
  name: string;
  chapter: number;
  chapterName: string;
  difficulty: Difficulty;
  description: string;
  bestStars: number;
  completed: boolean;
  unlocked: boolean;
  rewards: {
    star1: string;
    star2: string;
    star3: string;
    essenceOnFullStars?: number;
  };
  monstersCount: number;
  bossName: string;
}

export interface Equipment {
  id: string;
  name: string;
  slot: 'head' | 'body' | 'weapon' | 'shoes' | 'ring' | 'charm';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: Partial<{ atk: number; def: number; hp: number; spd: number; crit: number }>;
  equippedTo?: string;
  icon: string;
}

export interface WorldTreeNode {
  id: string;
  name: string;
  type: 'stat' | 'special';
  bonus: string;
  description: string;
  cost: { gold?: number; essence?: number };
  unlocked: boolean;
  tier: number;
  x: number; y: number;
}

export interface GuildData {
  id: string;
  name: string;
  level: number;
  members: { id: string; name: string; level: number; avatar: string }[];
  bossDefeated: boolean;
  expBonus: number;
}

export interface PlayerData {
  id: string;
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  diamond: number;
  totalStars: number;
  starBoxCount: number;
  avatarHeroId: string;
  guildId?: string;
  gameSpeed: GameSpeed;
  speedUnlocked: boolean;
  essence: number;
}

export interface DungeonFloor {
  id: string;
  name: string;
  requiredLevel: number;
  element: ElementType;
  bossName: string;
  bossEmoji: string;
  cleared: boolean;
  description: string;
  rewards: string[];
}

export interface GachaChest {
  id: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  name: string;
  emoji: string;
  cost: { gold?: number; diamond?: number };
  guaranteedRarity: HeroRarity;
  dropRates: Record<HeroRarity, number>;
  color: string;
}

export interface DailyQuestDef {
  id: string;
  desc: string;
  target: number;
  rewardGold: number;
  rewardDiamond: number;
  rewardChestType?: GachaChest['id'];
  icon: string;
}

export interface DailyQuestState {
  date: string;
  progress: Record<string, number>;
  claimed: Record<string, boolean>;
}

export interface AfkSession {
  startedAt: number;
  goldPerHour: number;
  expPerHour: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  value: number;
  avatarEmoji: string;
  isPlayer?: boolean;
}

export interface GameSave {
  player: PlayerData;
  heroes: Hero[];
  campaign: Record<string, { stars: number; bestTime: number }>;
  dungeon: Record<string, { cleared: boolean }>;
  worldTree: { unlockedNodes: string[] };
  inventory: { equipment: Equipment[] };
  guild?: GuildData;
  dailyQuests: DailyQuestState;
  afkSession: AfkSession | null;
  giftCodesUsed: string[];
  lastSaved: number;
}
