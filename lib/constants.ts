import type { Hero, ElementType, HeroClass, Skill, DungeonFloor, WorldTreeNode, Stage } from '@/types';

// ─────────────────────────────────────────
// ELEMENT CONFIG
// ─────────────────────────────────────────
export const ELEMENT_CONFIG: Record<ElementType, {
  label: string; emoji: string; color: string; cssClass: string;
  strongAgainst: ElementType[]; weakAgainst: ElementType[];
}> = {
  WIND:    { label: 'Gió',      emoji: '🌪️', color: '#7fffd4', cssClass: 'el-wind',    strongAgainst: ['EARTH'],   weakAgainst: ['THUNDER'] },
  WATER:   { label: 'Nước',     emoji: '💧', color: '#00bfff', cssClass: 'el-water',   strongAgainst: ['THUNDER'], weakAgainst: ['EARTH']   },
  EARTH:   { label: 'Đất',      emoji: '🪨', color: '#c9a227', cssClass: 'el-earth',   strongAgainst: ['WIND'],    weakAgainst: ['WATER']   },
  THUNDER: { label: 'Sấm Sét',  emoji: '⚡', color: '#ffe333', cssClass: 'el-thunder', strongAgainst: ['WIND'],    weakAgainst: ['WATER']   },
  VOID:    { label: 'Hư Không', emoji: '🌀', color: '#9b30ff', cssClass: 'el-void',    strongAgainst: [],          weakAgainst: []          },
};

// ─────────────────────────────────────────
// CLASS CONFIG
// ─────────────────────────────────────────
export const CLASS_CONFIG: Record<HeroClass, {
  label: string; emoji: string; color: string; cssClass: string; description: string;
}> = {
  TANK:     { label: 'Đỡ Đòn',  emoji: '🛡️', color: '#4a9eff', cssClass: 'cl-tank',     description: 'HP cao, giảm sát thương, kéo aggro' },
  HEALER:   { label: 'Mục Sư',  emoji: '🙏', color: '#39ff14', cssClass: 'cl-healer',   description: 'Hồi HP, buff đồng đội, revive' },
  RANGER:   { label: 'Cung Thủ',emoji: '🏹', color: '#7fffd4', cssClass: 'cl-ranger',   description: 'Tốc độ đánh cao, crit cao, tầm xa' },
  MAGE:     { label: 'Pháp Sư', emoji: '🔮', color: '#bf00ff', cssClass: 'cl-mage',     description: 'AoE phép thuật, debuff kẻ địch' },
  ASSASSIN: { label: 'Sát Thủ', emoji: '🗡️', color: '#ff0066', cssClass: 'cl-assassin', description: 'Burst 1 mục tiêu, ưu tiên boss' },
};

// ─────────────────────────────────────────
// SKILLS POOL
// ─────────────────────────────────────────
const skillsPool: Record<string, Skill> = {
  // TANK skills
  stone_shield:    { id: 'stone_shield',    name: 'Khiên Đá',        type: 'DEFENSE',  description: 'Giảm 40% sát thương nhận trong 5 giây', cooldown: 20, icon: '🛡️', unlockLevel: 1 },
  iron_taunt:      { id: 'iron_taunt',      name: 'Khiêu Khích',     type: 'DEFENSE',  description: 'Kéo aggro tất cả quái về phía mình 8 giây', cooldown: 15, icon: '⚔️', unlockLevel: 3 },
  earth_wall:      { id: 'earth_wall',      name: 'Tường Đất',       type: 'DEFENSE',  description: 'Tạo tường đất chặn 1 đợt quái hoàn toàn', cooldown: 45, icon: '🪨', unlockLevel: 6 },
  ice_armor:       { id: 'ice_armor',       name: 'Giáp Băng',       type: 'DEFENSE',  description: 'Tự hồi 15% maxHP khi xuống dưới 30% HP', cooldown: 30, icon: '🧊', unlockLevel: 1 },
  reflect_void:    { id: 'reflect_void',    name: 'Phản Sát Thương', type: 'DEFENSE',  description: 'Phản 50% dmg nhận về cho kẻ tấn công 6 giây', cooldown: 40, icon: '🌀', unlockLevel: 5 },
  // HEALER skills
  wind_heal:       { id: 'wind_heal',       name: 'Gió Lành',        type: 'SUPPORT',  description: 'Hồi 8% maxHP cho toàn đội mỗi 3 giây trong 12 giây', cooldown: 25, healPercent: 8, icon: '🍃', unlockLevel: 1 },
  aoe_heal:        { id: 'aoe_heal',        name: 'Ánh Linh',        type: 'SUPPORT',  description: 'Khi có tướng dưới 40% HP, hồi 20% HP tất cả', cooldown: 18, healPercent: 20, icon: '✨', unlockLevel: 3 },
  revive_light:    { id: 'revive_light',    name: 'Hồi Sinh',        type: 'SUPPORT',  description: 'Hồi sinh 1 tướng đã chết với 50% HP', cooldown: 90, icon: '💫', unlockLevel: 7 },
  full_heal:       { id: 'full_heal',       name: 'Thánh Phục',      type: 'SUPPORT',  description: 'Hồi 100% HP 1 tướng + shield 5 giây', cooldown: 60, healPercent: 100, icon: '🌟', unlockLevel: 5 },
  team_hp_boost:   { id: 'team_hp_boost',   name: 'Thiên Phù',       type: 'SUPPORT',  description: 'Toàn đội +15% maxHP trong trận', cooldown: 0, icon: '💚', unlockLevel: 2 },
  // RANGER skills
  chain_lightning: { id: 'chain_lightning', name: 'Chớp Xuyên',      type: 'ATTACK',   description: 'Mỗi 5 đòn phóng chớp xuyên hàng quái', cooldown: 0, damage: 80, icon: '⚡', unlockLevel: 1 },
  rapid_shot:      { id: 'rapid_shot',      name: 'Mưa Tên',         type: 'ATTACK',   description: 'Phóng 10 mũi tên, mỗi mũi 30% dmg', cooldown: 20, damage: 300, icon: '🏹', unlockLevel: 3 },
  crit_boost:      { id: 'crit_boost',      name: 'Sát Mệnh',        type: 'ATTACK',   description: 'Mỗi crit giảm 2s CD chiêu', cooldown: 0, icon: '🎯', unlockLevel: 2 },
  thunder_rain:    { id: 'thunder_rain',    name: 'Mưa Sấm',         type: 'ATTACK',   description: 'Mưa tên sấm diệt cả đợt quái', cooldown: 40, damage: 500, icon: '⛈️', unlockLevel: 6 },
  pierce_shot:     { id: 'pierce_shot',     name: 'Xuyên Tâm',       type: 'ATTACK',   description: '1 mũi tên xuyên và trúng 3 kẻ địch', cooldown: 12, damage: 150, icon: '🌀', unlockLevel: 4 },
  // MAGE skills
  slow_wave:       { id: 'slow_wave',       name: 'Sóng Băng',       type: 'ATTACK',   description: 'AoE diện rộng làm chậm quái 30% trong 8 giây', cooldown: 18, damage: 120, icon: '💧', unlockLevel: 1 },
  burn_dot:        { id: 'burn_dot',        name: 'Lửa Ngục',        type: 'ATTACK',   description: 'Đốt cháy quái trong vùng, DoT 5% mỗi giây trong 10 giây', cooldown: 22, damage: 50, icon: '🔥', unlockLevel: 3 },
  void_blackhole:  { id: 'void_blackhole',  name: 'Lỗ Hư Không',     type: 'ATTACK',   description: 'Hút tất cả quái vào tâm rồi bùng nổ sát thương', cooldown: 50, damage: 800, icon: '🌀', unlockLevel: 7 },
  chain_bolt:      { id: 'chain_bolt',      name: 'Sấm Liên Hoàn',   type: 'ATTACK',   description: 'Tia sét nảy qua 5 kẻ địch', cooldown: 16, damage: 200, icon: '⚡', unlockLevel: 4 },
  // ASSASSIN skills
  shadow_strike:   { id: 'shadow_strike',   name: 'Ám Sát',          type: 'ATTACK',   description: 'Tàng hình 3 giây rồi ra đòn chí mạng x3 dmg', cooldown: 25, damage: 400, icon: '🗡️', unlockLevel: 1 },
  kill_stack:      { id: 'kill_stack',       name: 'Sát Khí',         type: 'ATTACK',   description: 'Mỗi lần kill tăng stack dmg +5% (max 10 stack)', cooldown: 0, icon: '🩸', unlockLevel: 2 },
  instant_kill:    { id: 'instant_kill',    name: 'Trảm Thần',       type: 'ATTACK',   description: 'Tiêu diệt 1 boss mini ngay lập tức', cooldown: 120, damage: 9999, icon: '💀', unlockLevel: 7 },
  crit_behind:     { id: 'crit_behind',     name: 'Hắc Lôi Lưỡi',   type: 'ATTACK',   description: 'Dịch chuyển sau lưng boss, x2 crit 5 giây', cooldown: 30, damage: 600, icon: '⚡', unlockLevel: 5 },
};

// ─────────────────────────────────────────
// HEROES DATA (20 heroes)
// ─────────────────────────────────────────
export const HEROES_DATA: Hero[] = [
  // ── TANK ──
  {
    id: 'thach_hai', name: 'Thạch Hải', element: 'EARTH', heroClass: 'TANK', rarity: 'NORMAL',
    level: 1, hp: 5000, maxHp: 5000, atk: 180, def: 320, spd: 60,
    skills: [skillsPool.stone_shield, skillsPool.iron_taunt],
    avatar: '', emoji: '🗿', auraColor: '#c9a227', isUnlocked: true,
    lore: 'Chiến binh đất với tấm khiên đá không thể phá vỡ.',
  },
  {
    id: 'bang_ve', name: 'Băng Vệ', element: 'WATER', heroClass: 'TANK', rarity: 'NORMAL',
    level: 1, hp: 4500, maxHp: 4500, atk: 160, def: 280, spd: 65,
    skills: [skillsPool.ice_armor, skillsPool.iron_taunt],
    avatar: '', emoji: '🧊', auraColor: '#00bfff', isUnlocked: false,
    lore: 'Lớp giáp băng tự hàn gắn vết thương khi nguy hiểm.',
  },
  {
    id: 'dia_hoang', name: 'Địa Hoàng', element: 'EARTH', heroClass: 'TANK', rarity: 'S',
    level: 1, hp: 8000, maxHp: 8000, atk: 220, def: 450, spd: 55,
    skills: [skillsPool.earth_wall, skillsPool.stone_shield, skillsPool.iron_taunt],
    avatar: '', emoji: '👑', auraColor: '#c9a227', isUnlocked: false,
    lore: 'Vương giả của đất, một cú đập tạo ra tường đá ngàn trượng.',
  },
  {
    id: 'nguyen_thuy_than', name: 'Nguyên Thủy Thần', element: 'VOID', heroClass: 'TANK', rarity: 'S',
    level: 1, hp: 7500, maxHp: 7500, atk: 200, def: 400, spd: 58,
    skills: [skillsPool.reflect_void, skillsPool.ice_armor, skillsPool.stone_shield],
    avatar: '', emoji: '🌌', auraColor: '#9b30ff', isUnlocked: false,
    lore: 'Hư không là lá chắn tối thượng — mọi sát thương đều được phản lại.',
  },

  // ── HEALER ──
  {
    id: 'phong_lam', name: 'Phong Lâm', element: 'WIND', heroClass: 'HEALER', rarity: 'NORMAL',
    level: 1, hp: 2800, maxHp: 2800, atk: 120, def: 180, spd: 90,
    skills: [skillsPool.wind_heal, skillsPool.team_hp_boost],
    avatar: '', emoji: '🍃', auraColor: '#7fffd4', isUnlocked: true,
    lore: 'Gió nhẹ nhàng mang đến sự chữa lành cho chiến trường.',
  },
  {
    id: 'thien_tuyen', name: 'Thiên Tuyền', element: 'WATER', heroClass: 'HEALER', rarity: 'NORMAL',
    level: 1, hp: 2600, maxHp: 2600, atk: 110, def: 160, spd: 85,
    skills: [skillsPool.aoe_heal, skillsPool.wind_heal],
    avatar: '', emoji: '💦', auraColor: '#00bfff', isUnlocked: false,
    lore: 'Dòng nước tinh khiết chảy qua vết thương và làm lành tất cả.',
  },
  {
    id: 'thanh_linh_su', name: 'Thánh Linh Sứ', element: 'VOID', heroClass: 'HEALER', rarity: 'S',
    level: 1, hp: 4200, maxHp: 4200, atk: 150, def: 220, spd: 95,
    skills: [skillsPool.full_heal, skillsPool.revive_light, skillsPool.aoe_heal],
    avatar: '', emoji: '✨', auraColor: '#9b30ff', isUnlocked: false,
    lore: 'Sứ giả của ánh sáng hư không, có thể kéo linh hồn trở lại từ cái chết.',
  },
  {
    id: 'van_tien', name: 'Vân Tiên', element: 'WIND', heroClass: 'HEALER', rarity: 'S',
    level: 1, hp: 3800, maxHp: 3800, atk: 140, def: 200, spd: 100,
    skills: [skillsPool.team_hp_boost, skillsPool.wind_heal, skillsPool.aoe_heal],
    avatar: '', emoji: '🌬️', auraColor: '#7fffd4', isUnlocked: false,
    lore: 'Toàn đội được ban phúc bởi gió tiên — HP tối đa tăng đến cực hạn.',
  },

  // ── RANGER ──
  {
    id: 'loi_xa', name: 'Lôi Xạ', element: 'THUNDER', heroClass: 'RANGER', rarity: 'NORMAL',
    level: 1, hp: 3000, maxHp: 3000, atk: 280, def: 140, spd: 110,
    skills: [skillsPool.chain_lightning, skillsPool.crit_boost],
    avatar: '', emoji: '⚡', auraColor: '#ffe333', isUnlocked: true,
    lore: 'Mũi tên của anh ta mang theo sấm sét, xuyên qua hàng ngũ kẻ địch.',
  },
  {
    id: 'phong_tien', name: 'Phong Tiễn', element: 'WIND', heroClass: 'RANGER', rarity: 'NORMAL',
    level: 1, hp: 2800, maxHp: 2800, atk: 260, def: 130, spd: 130,
    skills: [skillsPool.rapid_shot, skillsPool.crit_boost],
    avatar: '', emoji: '🌪️', auraColor: '#7fffd4', isUnlocked: false,
    lore: 'Nhanh như gió, mỗi cú bắn là một tia chớp không thể tránh.',
  },
  {
    id: 'thien_loi_cung', name: 'Thiên Lôi Cung', element: 'THUNDER', heroClass: 'RANGER', rarity: 'S',
    level: 1, hp: 4500, maxHp: 4500, atk: 380, def: 170, spd: 120,
    skills: [skillsPool.thunder_rain, skillsPool.chain_lightning, skillsPool.crit_boost],
    avatar: '', emoji: '🌩️', auraColor: '#ffe333', isUnlocked: false,
    lore: 'Chiếc cung được rèn từ sấm thần, mưa tên của nó xóa sổ cả đội hình.',
  },
  {
    id: 'hu_khong_xa', name: 'Hư Không Xạ', element: 'VOID', heroClass: 'RANGER', rarity: 'S',
    level: 1, hp: 4000, maxHp: 4000, atk: 350, def: 160, spd: 125,
    skills: [skillsPool.pierce_shot, skillsPool.thunder_rain, skillsPool.rapid_shot],
    avatar: '', emoji: '🌀', auraColor: '#9b30ff', isUnlocked: false,
    lore: 'Mũi tên xuyên qua hư không, 1 nhát trúng 3 kẻ thù.',
  },

  // ── MAGE ──
  {
    id: 'thuy_tinh', name: 'Thủy Tinh', element: 'WATER', heroClass: 'MAGE', rarity: 'NORMAL',
    level: 1, hp: 2500, maxHp: 2500, atk: 300, def: 120, spd: 80,
    skills: [skillsPool.slow_wave, skillsPool.burn_dot],
    avatar: '', emoji: '🌊', auraColor: '#00bfff', isUnlocked: true,
    lore: 'Sóng nước tinh thể làm đóng băng thời gian của kẻ địch.',
  },
  {
    id: 'hoa_nguyen', name: 'Hỏa Nguyên', element: 'EARTH', heroClass: 'MAGE', rarity: 'NORMAL',
    level: 1, hp: 2400, maxHp: 2400, atk: 320, def: 110, spd: 78,
    skills: [skillsPool.burn_dot, skillsPool.slow_wave],
    avatar: '', emoji: '🌋', auraColor: '#c9a227', isUnlocked: false,
    lore: 'Đất bốc lửa dưới bước chân của anh, đốt cháy mọi kẻ dám đặt chân vào lãnh địa.',
  },
  {
    id: 'vo_cuc_phap_vuong', name: 'Vô Cực Pháp Vương', element: 'VOID', heroClass: 'MAGE', rarity: 'S',
    level: 1, hp: 4000, maxHp: 4000, atk: 480, def: 140, spd: 88,
    skills: [skillsPool.void_blackhole, skillsPool.slow_wave, skillsPool.chain_bolt],
    avatar: '', emoji: '🌀', auraColor: '#9b30ff', isUnlocked: false,
    lore: 'Lỗ hư không của hắn nuốt chửng quân địch và bùng phát năng lượng tàn khốc.',
  },
  {
    id: 'loi_phap', name: 'Lôi Pháp', element: 'THUNDER', heroClass: 'MAGE', rarity: 'S',
    level: 1, hp: 3800, maxHp: 3800, atk: 450, def: 130, spd: 85,
    skills: [skillsPool.chain_bolt, skillsPool.thunder_rain, skillsPool.burn_dot],
    avatar: '', emoji: '⛈️', auraColor: '#ffe333', isUnlocked: false,
    lore: 'Tia sét của Lôi Pháp nảy qua 5 kẻ địch, không ai thoát được.',
  },

  // ── ASSASSIN ──
  {
    id: 'am_phong', name: 'Ám Phong', element: 'WIND', heroClass: 'ASSASSIN', rarity: 'NORMAL',
    level: 1, hp: 2600, maxHp: 2600, atk: 400, def: 100, spd: 150,
    skills: [skillsPool.shadow_strike, skillsPool.kill_stack],
    avatar: '', emoji: '🌑', auraColor: '#7fffd4', isUnlocked: true,
    lore: 'Bóng tối trong gió — ẩn mình rồi xuất hiện với đòn chí mạng.',
  },
  {
    id: 'huyet_sam', name: 'Huyết Sấm', element: 'THUNDER', heroClass: 'ASSASSIN', rarity: 'NORMAL',
    level: 1, hp: 2800, maxHp: 2800, atk: 380, def: 110, spd: 140,
    skills: [skillsPool.kill_stack, skillsPool.shadow_strike],
    avatar: '', emoji: '🔴', auraColor: '#ffe333', isUnlocked: false,
    lore: 'Mỗi lần hắn giết, sức mạnh của hắn lại tăng thêm một tầng.',
  },
  {
    id: 'tu_than', name: 'Tử Thần', element: 'VOID', heroClass: 'ASSASSIN', rarity: 'S',
    level: 1, hp: 4200, maxHp: 4200, atk: 550, def: 130, spd: 160,
    skills: [skillsPool.instant_kill, skillsPool.shadow_strike, skillsPool.kill_stack],
    avatar: '', emoji: '💀', auraColor: '#9b30ff', isUnlocked: false,
    lore: 'Sứ giả của cái chết — một cú chạm, boss mini biến mất khỏi trận địa.',
  },
  {
    id: 'hac_loi', name: 'Hắc Lôi', element: 'THUNDER', heroClass: 'ASSASSIN', rarity: 'S',
    level: 1, hp: 4000, maxHp: 4000, atk: 520, def: 120, spd: 165,
    skills: [skillsPool.crit_behind, skillsPool.instant_kill, skillsPool.shadow_strike],
    avatar: '', emoji: '🌩️', auraColor: '#ffe333', isUnlocked: false,
    lore: 'Dịch chuyển tức thời sau lưng boss, tốc độ sấm không kịp chớp.',
  },
];

// ─────────────────────────────────────────
// DEFAULT TEAM (5 heroes, 1 per class)
// ─────────────────────────────────────────
export const DEFAULT_TEAM_IDS = ['thach_hai', 'phong_lam', 'loi_xa', 'thuy_tinh', 'am_phong'];

// ─────────────────────────────────────────
// DUNGEON FLOORS
// ─────────────────────────────────────────
export const DUNGEON_FLOORS: DungeonFloor[] = [
  { id: 'd1', name: 'Hầm Tối Cơ Bản',    requiredLevel: 20, element: 'EARTH',   bossName: 'Quỷ Đá',       bossEmoji: '👹', cleared: false, description: 'Nơi kẻ yếu không bao giờ quay về.', rewards: ['Trang bị Epic', 'Vàng x500'] },
  { id: 'd2', name: 'Hầm Băng Hà',        requiredLevel: 30, element: 'WATER',   bossName: 'Băng Long',     bossEmoji: '🐉', cleared: false, description: 'Băng lạnh cắt xương, boss đã ngủ nghìn năm.', rewards: ['Mảnh Tướng Nâng Cấp', 'Kiếm Cương x20'] },
  { id: 'd3', name: 'Hầm Lửa Địa Ngục',   requiredLevel: 40, element: 'EARTH',   bossName: 'Hỏa Diễm Ma',  bossEmoji: '😈', cleared: false, description: 'Nhiệt độ đủ thiêu rụi linh hồn.', rewards: ['Thánh Vật Lửa', 'Kiếm Cương x40'] },
  { id: 'd4', name: 'Hầm Sấm Thần',       requiredLevel: 50, element: 'THUNDER', bossName: 'Lôi Thần Vương',bossEmoji: '⚡', cleared: false, description: 'Sấm không ngừng gầm vang trong không gian hẹp.', rewards: ['Mảnh Tướng S', 'Kim Cương x50'] },
  { id: 'd5', name: 'Hầm Hư Không',        requiredLevel: 60, element: 'VOID',    bossName: 'Hư Không Thần', bossEmoji: '🌀', cleared: false, description: 'Không gian bị bóp méo, quy luật vật lý không còn tồn tại.', rewards: ['Trang bị Huyền Thoại', 'Mảnh Tướng S x2'] },
  { id: 'd6', name: 'Hầm Ngục Tối Thượng', requiredLevel: 70, element: 'VOID',    bossName: 'Độc Tôn Chiến Thần', bossEmoji: '👁️', cleared: false, description: 'Chỉ chiến thần thật sự mới đứng được đây.', rewards: ['Toàn bộ mảnh Tướng S', 'Kim Cương x200', 'Danh hiệu Độc Tôn'] },
];

// ─────────────────────────────────────────
// CAMPAIGN STAGES
// ─────────────────────────────────────────
export const CAMPAIGN_STAGES: Stage[] = [
  // Chapter 1 - Rừng Hắc Ám
  { id: 's1_1', name: 'Lối Vào Rừng Tối',    chapter: 1, chapterName: 'Rừng Hắc Ám',    difficulty: 'EASY', description: 'Quái thú đói khát chặn đường vào rừng.', bestStars: 0, completed: false, unlocked: true,  rewards: { star1: 'Vàng x100', star2: 'Kiếm Cương x3', star3: 'Kiếm Cương x5', essenceOnFullStars: 1 }, monstersCount: 12, bossName: 'Quỷ Rừng' },
  { id: 's1_2', name: 'Hang Dơi Tối Tăm',    chapter: 1, chapterName: 'Rừng Hắc Ám',    difficulty: 'EASY', description: 'Bầy dơi khổng lồ bảo vệ hang tối.', bestStars: 0, completed: false, unlocked: false, rewards: { star1: 'Vàng x150', star2: 'Kiếm Cương x5', star3: 'Kiếm Cương x8', essenceOnFullStars: 1 }, monstersCount: 15, bossName: 'Quỷ Cánh Dơi' },
  { id: 's1_3', name: 'Trái Tim Rừng Tối',   chapter: 1, chapterName: 'Rừng Hắc Ám',    difficulty: 'NORMAL', description: 'Boss rừng thức dậy sau nghìn năm ngủ.', bestStars: 0, completed: false, unlocked: false, rewards: { star1: 'Vàng x200', star2: 'Kiếm Cương x8', star3: 'Mảnh Tướng x1', essenceOnFullStars: 2 }, monstersCount: 20, bossName: 'Hắc Lâm Vương' },
  // Chapter 2 - Núi Sấm Sét
  { id: 's2_1', name: 'Chân Núi Sấm',        chapter: 2, chapterName: 'Núi Sấm Sét',    difficulty: 'NORMAL', description: 'Sét đánh liên tục, kẻ yếu không dám bước lên.', bestStars: 0, completed: false, unlocked: false, rewards: { star1: 'Vàng x250', star2: 'Kiếm Cương x10', star3: 'Kiếm Cương x15', essenceOnFullStars: 2 }, monstersCount: 18, bossName: 'Lôi Linh' },
  { id: 's2_2', name: 'Đỉnh Sấm Vương',      chapter: 2, chapterName: 'Núi Sấm Sét',    difficulty: 'NORMAL', description: 'Thần sấm giận dữ, cả núi rung chuyển.', bestStars: 0, completed: false, unlocked: false, rewards: { star1: 'Vàng x300', star2: 'Kiếm Cương x12', star3: 'Mảnh Tướng x2', essenceOnFullStars: 2 }, monstersCount: 22, bossName: 'Sấm Vương' },
  // Chapter 3 - Biển Hư Không
  { id: 's3_1', name: 'Cổng Hư Không',       chapter: 3, chapterName: 'Biển Hư Không',  difficulty: 'ELITE', description: 'Cánh cổng dẫn đến chiều không gian khác.', bestStars: 0, completed: false, unlocked: false, rewards: { star1: 'Vàng x400', star2: 'Kiếm Cương x20', star3: 'Mảnh Tướng S x1', essenceOnFullStars: 3 }, monstersCount: 25, bossName: 'Hư Không Thủ Vệ' },
  { id: 's3_2', name: 'Chiến Trường Vô Tận', chapter: 3, chapterName: 'Biển Hư Không',  difficulty: 'ELITE', description: 'Không gian vô tận — trận chiến không có hồi kết.', bestStars: 0, completed: false, unlocked: false, rewards: { star1: 'Vàng x500', star2: 'Mảnh Tướng S x1', star3: 'Mảnh Tướng S x3', essenceOnFullStars: 5 }, monstersCount: 30, bossName: 'Độc Tôn Sơ Thần' },
];

// ─────────────────────────────────────────
// WORLD TREE NODES
// ─────────────────────────────────────────
export const WORLD_TREE_NODES: WorldTreeNode[] = [
  { id: 'wt_def1',  name: 'Giáp Cơ Bản I',    type: 'stat',    bonus: '+10 DEF',    description: 'Tăng giáp cho toàn đội', cost: { gold: 100 },  unlocked: false, tier: 1, x: 2, y: 1 },
  { id: 'wt_hp1',   name: 'Thể Chất I',        type: 'stat',    bonus: '+200 HP',    description: 'Tăng máu tối đa', cost: { gold: 200 },  unlocked: false, tier: 1, x: 2, y: 2 },
  { id: 'wt_atk1',  name: 'Sức Mạnh I',        type: 'stat',    bonus: '+15 ATK',    description: 'Tăng tấn công', cost: { gold: 300 },  unlocked: false, tier: 1, x: 2, y: 3 },
  { id: 'wt_crit',  name: 'Bạo Kích Sơ',       type: 'special', bonus: '+5% Crit',   description: 'Tăng tỷ lệ bạo kích', cost: { essence: 5 }, unlocked: false, tier: 5, x: 0, y: 5 },
  { id: 'wt_def2',  name: 'Giáp Cơ Bản II',   type: 'stat',    bonus: '+20 DEF',    description: 'Tăng giáp cao hơn', cost: { gold: 500 },  unlocked: false, tier: 2, x: 2, y: 6 },
  { id: 'wt_hp2',   name: 'Thể Chất II',       type: 'stat',    bonus: '+500 HP',    description: 'Tăng máu đáng kể', cost: { gold: 800 },  unlocked: false, tier: 2, x: 2, y: 7 },
  { id: 'wt_drop',  name: 'Loot May Mắn',      type: 'special', bonus: '+10% Loot',  description: 'Tăng tỷ lệ rơi trang bị', cost: { essence: 10 }, unlocked: false, tier: 10, x: 4, y: 10 },
  { id: 'wt_atk2',  name: 'Sức Mạnh II',       type: 'stat',    bonus: '+30 ATK',    description: 'Tấn công mạnh hơn', cost: { gold: 1000 }, unlocked: false, tier: 2, x: 2, y: 8 },
  { id: 'wt_spd',   name: 'Tốc Chiến',         type: 'stat',    bonus: '+10 SPD',    description: 'Tốc độ đánh tăng', cost: { gold: 1200 }, unlocked: false, tier: 3, x: 2, y: 9 },
  { id: 'wt_heal',  name: 'Hồi Phục Thần',     type: 'special', bonus: '+8% Regen',  description: 'Hồi HP thụ động mỗi 5 giây', cost: { essence: 15 }, unlocked: false, tier: 15, x: 0, y: 15 },
  { id: 'wt_critd', name: 'Bạo Kích Bạo Thương',type: 'special', bonus: '+20% CritDmg', description: 'Tăng sát thương bạo kích', cost: { essence: 20 }, unlocked: false, tier: 20, x: 4, y: 20 },
  { id: 'wt_free',  name: 'Đổi Tướng Tự Do',   type: 'special', bonus: '+2 Swap',    description: 'Thêm 2 lần đổi tướng trong trận', cost: { essence: 25 }, unlocked: false, tier: 25, x: 0, y: 25 },
];

// ─────────────────────────────────────────
// MONSTER TEMPLATES
// ─────────────────────────────────────────
export const MONSTER_TEMPLATES = {
  // Normal monsters
  goblin:       { name: 'Quỷ Nhỏ',       emoji: '👺', hp: 800,   atk: 80,  element: 'EARTH' as ElementType, size: 'sm' as const, isElite: false },
  bat:          { name: 'Dơi Quỷ',       emoji: '🦇', hp: 600,   atk: 70,  element: 'WIND'  as ElementType, size: 'sm' as const, isElite: false },
  skeleton:     { name: 'Xương Khô',     emoji: '💀', hp: 700,   atk: 90,  element: 'VOID'  as ElementType, size: 'sm' as const, isElite: false },
  thunder_wolf: { name: 'Sói Sấm',       emoji: '🐺', hp: 1200,  atk: 130, element: 'THUNDER' as ElementType, size: 'md' as const, isElite: false },
  water_snake:  { name: 'Rắn Nước',      emoji: '🐍', hp: 1000,  atk: 110, element: 'WATER' as ElementType, size: 'md' as const, isElite: false },
  // Elite monsters
  troll:        { name: 'Troll Đá',      emoji: '🧌', hp: 2500,  atk: 200, element: 'EARTH' as ElementType, size: 'md' as const, isElite: true  },
  void_shade:   { name: 'Bóng Hư Không', emoji: '👻', hp: 2000,  atk: 180, element: 'VOID'  as ElementType, size: 'md' as const, isElite: true  },
  // Boss
  forest_king:  { name: 'Hắc Lâm Vương', emoji: '🐲', hp: 15000, atk: 350, element: 'EARTH' as ElementType, size: 'boss' as const, isElite: false },
  thunder_god:  { name: 'Lôi Thần Vương', emoji: '⚡', hp: 20000, atk: 420, element: 'THUNDER' as ElementType, size: 'boss' as const, isElite: false },
  void_king:    { name: 'Hư Không Thần', emoji: '🌀', hp: 25000, atk: 500, element: 'VOID'  as ElementType, size: 'boss' as const, isElite: false },
};

// ─────────────────────────────────────────
// GAME CONFIG
// ─────────────────────────────────────────
export const GAME_CONFIG = {
  BATTLE_DURATION: 480, // 8 minutes in seconds
  BOSS1_AT: 40,   // % progress
  BOSS2_AT: 80,   // % progress
  WAVE_INTERVAL: 18, // seconds between waves
  WAVE_SIZE_MIN: 3,
  WAVE_SIZE_MAX: 5,
  MAX_HERO_SKILLS: 6,
  SPEED_UNLOCK_LEVEL: 15,
  GUILD_UNLOCK_LEVEL: 15,
  STAR_BOX_THRESHOLD: 5, // stars needed per box
  LEVEL_CAP: 100,
  EXP_BASE: 100,
  EXP_MULTIPLIER: 1.15,
  DIFFICULTY_MULTIPLIER: { EASY: 0.75, NORMAL: 1.0, ELITE: 1.5 },
  ELEMENT_ADVANTAGE: 1.3,
  ELEMENT_DISADVANTAGE: 0.75,
};

export const getExpRequired = (level: number) =>
  Math.floor(GAME_CONFIG.EXP_BASE * Math.pow(GAME_CONFIG.EXP_MULTIPLIER, level - 1));
