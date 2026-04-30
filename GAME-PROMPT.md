# 🎮 PROMPT TẠO GAME: ĐỘC TÔN CHIẾN THẦN

> **Đặt vào thư mục:** `/Users/pro/game-thao`
> **Tech stack reference:** `/Users/pro/personal-life-management`

---

## 🛠️ TECH STACK (BẮT BUỘC FOLLOW)

```
Framework:     Next.js 15.5+ (App Router, Turbopack)
Language:      TypeScript 5+
Styling:       Tailwind CSS v4 (@tailwindcss/postcss)
Animation:     Framer Motion 12+
Icons:         Lucide React
UI Utils:      clsx, tailwind-merge, class-variance-authority
State:         React Context API (useContext + useReducer)
Theme:         next-themes (dark mode mặc định)
Font:          Google Fonts — "Cinzel" (tiêu đề game), "Inter" (body)
```

**Cấu trúc thư mục** (giống personal-life-management):
```
src/
  app/
    globals.css
    layout.tsx
    page.tsx          ← Màn hình chính / Hub
    login/page.tsx
    battle/page.tsx
    campaign/page.tsx
    dungeon/page.tsx
    heroes/page.tsx
    inventory/page.tsx
    world-tree/page.tsx
    guild/page.tsx
  components/
    ui/               ← button, card, badge, progress-bar, modal
    game/             ← HeroCard, BattleField, BossAlert, SkillSelector...
  contexts/
    game-context.tsx  ← global game state
    auth-context.tsx
  lib/
    constants.ts      ← heroes, elements, classes definitions
    game-logic.ts     ← damage calc, exp calc, wave spawn
    utils.ts
  types/
    index.ts
```

---

## 🎨 VISUAL DESIGN SYSTEM

### Color Palette (Dark Fantasy — copy cách dùng CSS vars của personal-life-management)
```css
/* globals.css */
--color-background:   #05080f;       /* Đen huyền bí */
--color-foreground:   #f0e6c8;       /* Vàng cổ đại */
--color-gold:         #ffd700;       /* Vàng sao */
--color-gold-glow:    #ffaa00;
--color-fire:         #ff4500;       /* Sấm sét / Fire */
--color-water:        #00bfff;       /* Nước */
--color-earth:        #8b6914;       /* Đất */
--color-wind:         #7fffd4;       /* Gió */
--color-void:         #9b30ff;       /* Hư không */
--color-thunder:      #ffe333;       /* Sấm sét */
--color-card:         rgba(10,14,26,0.85);
--color-border:       rgba(255,215,0,0.15);

/* Neon Glow shadows */
--shadow-gold:   0 0 10px #ffd700, 0 0 30px rgba(255,215,0,0.4);
--shadow-fire:   0 0 10px #ff4500, 0 0 30px rgba(255,69,0,0.4);
--shadow-void:   0 0 10px #9b30ff, 0 0 30px rgba(155,48,255,0.4);

/* Animations */
@keyframes float-hero { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes pulse-aura { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
@keyframes slash-effect { 0% { scaleX:0; opacity:1; } 100% { scaleX:1; opacity:0; } }
@keyframes boss-enter { from { scale:0.3; opacity:0; } to { scale:1; opacity:1; } }
```

### Hình ảnh gợi ý (dùng placeholder hoặc SVG epic):
- Màn login: background là **thành cổ hoang tàn với ánh hoàng hôn đỏ rực**, các tướng đứng hai bên cổng như guardian, dùng CSS gradient + particle effect (framer motion stagger)
- Card tướng: khung viền vàng + aura glow theo màu thuộc tính
- Boss: scale to hơn tướng thường, animation rung lắc + flash khi xuất hiện

---

## 📖 GAMEPLAY SPECIFICATION

### 1. 5 THUỘC TÍNH (Elements)
| Tên | Color | Ký hiệu | Mạnh vs | Yếu vs |
|-----|-------|---------|---------|--------|
| Gió 🌪️ | `#7fffd4` | WIND | Đất | Sấm sét |
| Nước 💧 | `#00bfff` | WATER | Lửa/Hỏa | Đất |
| Đất 🪨 | `#8b6914` | EARTH | Sấm sét | Gió |
| Sấm Sét ⚡ | `#ffe333` | THUNDER | Gió | Nước |
| Hư Không 🌀 | `#9b30ff` | VOID | Tất cả -10% | Bị tất cả -10% |

### 2. 5 TRƯỜNG PHÁI + TƯỚNG (Classes)
Mỗi trường phái có **2 tướng thường** và **2 tướng S** (tổng 20 tướng)

#### 🛡️ ĐỠ ĐÒN (Tank)
- **Vai trò:** HP cao, giảm damage nhận vào, provoke kéo aggro quái
- **Tướng thường:**
  - **Thạch Hải** (Đất) — Khiên đá, passive giảm 30% sát thương vật lý
  - **Băng Vệ** (Nước) — Lớp giáp băng, khi HP < 30% tự hồi
- **Tướng S:**
  - **Địa Hoàng** (Đất ⭐S) — Ultimate: Tường đá khổng lồ chặn toàn bộ 1 đợt quái
  - **Nguyên Thủy Thần** (Hư Không ⭐S) — Phản sát thương 50% dmg nhận về

#### 🙏 MỤC SƯ (Healer)
- **Vai trò:** Hồi HP, buff đồng đội, revive khi tướng chết
- **Tướng thường:**
  - **Phong Lâm** (Gió) — Hồi HP theo % max HP mỗi 3 giây
  - **Thiên Tuyền** (Nước) — Heal AoE toàn đội khi có tướng dưới 40% HP
- **Tướng S:**
  - **Thánh Linh Sứ** (Hư Không ⭐S) — Ultimate: Hồi 100% HP 1 tướng + shield 5 giây
  - **Vân Tiên** (Gió ⭐S) — Passive: Toàn đội +15% HP tối đa

#### 🏹 CUNG THỦ (Ranger)
- **Vai trò:** Tấn công tầm xa, tốc độ đánh cao, crit cao
- **Tướng thường:**
  - **Lôi Xạ** (Sấm Sét) — Mỗi 5 cú đánh phóng chớp xuyên hàng
  - **Phong Tiễn** (Gió) — Tốc độ đánh nhanh nhất game, mỗi crit giảm CD chiêu
- **Tướng S:**
  - **Thiên Lôi Cung** (Sấm Sét ⭐S) — Ultimate: Mưa tên sấm diệt đợt quái
  - **Hư Không Xạ** (Hư Không ⭐S) — Xuyên target, 1 mũi tên trúng 3 kẻ địch

#### 🔮 PHÁP SƯ (Mage)
- **Vai trò:** Sát thương phép thuật lớn, AoE, debuff kẻ địch
- **Tướng thường:**
  - **Thủy Tinh** (Nước) — Làm chậm quái 30%, AoE diện rộng
  - **Hỏa Nguyên** (Đất→Lửa) — Đốt cháy theo thời gian (DoT damage)
- **Tướng S:**
  - **Vô Cực Pháp Vương** (Hư Không ⭐S) — Ultimate: Lỗ hút hư không hút toàn bộ quái vào tâm
  - **Lôi Pháp** (Sấm Sét ⭐S) — Chain lightning nảy 5 kẻ địch

#### 🗡️ SÁT THỦ (Assassin)
- **Vai trò:** Burst damage cực cao vào 1 mục tiêu, ưu tiên diệt boss
- **Tướng thường:**
  - **Ám Phong** (Gió) — Tàng hình 3 giây sau đó ra cú chí mạng x3 dmg
  - **Huyết Sấm** (Sấm Sét) — Mỗi lần kill tăng stack dmg (max 10 stack)
- **Tướng S:**
  - **Tử Thần** (Hư Không ⭐S) — Ultimate: Xóa sổ 1 boss mini ngay lập tức (CD 120s)
  - **Hắc Lôi** (Sấm Sét ⭐S) — Teleport sau lưng boss, nhân đôi crit trong 5 giây

---

### 3. HỆ THỐNG TRẬN ĐẤU (Battle System)

#### Giao diện trận đấu:
```
┌─────────────────────────────────────────┐
│  [HP Bar]  [Tiến trình ải: 0%→100%]  [⚡x1.0] │
│                                          │
│  [Vùng quái xuất hiện — đi từ trên xuống] │
│       👾 👾 👾 👾  (wave quái)            │
│            ↓ ↓ ↓                         │
│  [Tướng đứng hàng ngang bên dưới]        │
│  🛡️  🏹  🔮  🗡️  🙏                     │
│                                          │
│  [Chiêu thức tướng 1][2][3][4][5]        │
│  [Tốc độ: 1.0 | 1.5 | 2.0]              │
└─────────────────────────────────────────┘
```

#### Wave System:
- **Tổng thời gian:** 8 phút = 100% tiến trình
- **0% → 40%:** Quái thường xuất hiện liên tục (wave 3-5 con/lần, 15-20 giây/wave)
- **40%:** ⚔️ **BOSS LẦN 1** xuất hiện — animation boss enter to lớn + roar effect
- **40% → 80%:** Quái thường tiếp tục + quái elite bắt đầu xuất hiện
- **80%:** 🔥 **BOSS CUỐI** xuất hiện — mạnh hơn boss 40%, có phase 2 khi còn 50% HP
- **80% → 100%:** Clear nốt quái còn lại để WIN

#### Điều kiện thắng/thua:
- **WIN:** Diệt hết tất cả quái + boss trong bản đồ
- **THUA:** Tất cả 5 tướng bị hạ gục trước khi clear quái

#### Hệ thống sao (3 Stars):
| Kết quả | Sao |
|---------|-----|
| Clear + HP đầy (≥80% HP) | ⭐⭐⭐ |
| Clear + HP không đầy | ⭐⭐ |
| Clear + ít nhất 1 tướng chết | ⭐ |
| Thua | ✗ |

Mỗi ô sao kèm **hộp quà** — nhận sao mới unlock quà:
- ⭐ → Vàng nhỏ
- ⭐⭐ → Kiếm Cương (tài nguyên nâng cấp)
- ⭐⭐⭐ → Kiếm Cương + Cơ hội mảnh tướng hiếm

---

### 4. HỆ THỐNG CẤP ĐỘ & CHIÊU THỨC

#### Lên cấp:
- Giết quái nhận EXP → thanh EXP đầy → lên cấp
- **Mỗi lần lên cấp:** popup chọn 1 trong 3 chiêu thức ngẫu nhiên (của 5 tướng đang dùng)
- Chiêu thức chia 3 loại: **Tấn công**, **Phòng thủ**, **Hỗ trợ**
- Tướng tối đa **6 chiêu thức** (unlock dần theo cấp)

#### Tốc độ game:
- **1.0x** — Mặc định
- **1.5x** — Unlock tại **cấp 15** HOẶC nạp tiền
- **2.0x** — Unlock tại **cấp 15** HOẶC nạp tiền
- Nút toggle [1.0 | 1.5 | 2.0] ở góc trên phải màn hình trận đấu

---

### 5. MÀN HÌNH CHÍNH (Main Hub)

Layout mobile-first, bottom navigation:
```
[TRẬN ĐẤU / THAM GIA]  ← to, trung tâm màn hình
   → Modal chọn độ khó: Dễ / Thường / Tinh Anh

Bottom Nav:
[⚔️ Chiến Dịch] [🏰 Hầm Ngục] [🏠 Hub] [🎒 Hành Trang] [🌳 Cây Thế Giới] [⚜️ Guild]
```

Top bar:
```
[Avatar tướng] [Tên] Lv.XX  [===EXP BAR===]     [Sao tổng: ⭐ XXX] [🎁 quà tổng]
```

**Hộp quà tổng sao:** Tích đủ **5 sao** → nhận 1 phần thưởng (Kiếm Cương, Vàng, Mảnh tướng)

---

### 6. CÁC MENU CON

#### 🗺️ CHIẾN DỊCH (Campaign)
- Danh sách ải theo Chapter (Chapter 1: Rừng Hắc Ám, Chapter 2: Núi Sấm Sét...)
- Mỗi ải có icon + 3 ô sao + hộp quà kế bên sao
- Tap vào ải → hiện detail + nút bắt đầu + chọn độ khó
- Đánh 3 sao nhận **Tinh Hoa** (dùng cho Cây Thế Giới)

#### 🏰 HẦM NGỤC (Dungeon)
Mở khóa theo cấp tướng:
| Cấp mở | Tên Hầm Ngục |
|---------|-------------|
| 20 | Hầm Tối Cơ Bản |
| 30 | Hầm Băng Hà |
| 40 | Hầm Lửa Địa Ngục |
| 50 | Hầm Sấm Thần |
| 60 | Hầm Hư Không |
| 70 | Hầm Ngục Tối Thượng |

Mỗi hầm: đánh Boss đặc biệt → nhận thưởng xịn (trang bị huyền thoại, mảnh tướng S)

#### 🎒 HÀNH TRANG (Inventory)

Layout:
```
[Hình 5 tướng đứng trong ô trang bị — click vào từng tướng]
   → Mỗi tướng: 6 ô trang bị (đầu, áo, vũ khí, giày, nhẫn, bùa)

Tabs bên dưới:
[Xem Kỹ Năng] [Trang Bị] [Thánh Vật] [Đồng Hành] [Đào Khoáng] [Gia Viên]
```

Unlock theo móc cấp tướng:
- Lv 1: Trang Bị
- Lv 10: Đồng Hành
- Lv 20: Thánh Vật
- Lv 30: Đào Khoáng
- Lv 40: Gia Viên

#### 🌳 CÂY THẾ GIỚI (World Tree)

Cấu trúc cây vertical, mở từ dưới lên:
```
Gốc Cây (Lv 1 unlock)
  ↑ Nhánh Giáp (+10 DEF) — tốn 100 Vàng
  ↑ Nhánh HP (+200 HP) — tốn 200 Vàng
  ↑ Nhánh Tấn Công (+15 ATK) — tốn 300 Vàng
  ↑ ... tiếp tục lên cao

Góc nhánh (cứ 5 cấp = 1 node đặc biệt):
  → Tốn Tinh Hoa để mở
  → Bonus: Bạo Kích +5%, Bạo Kích Kháng, Tỷ lệ Mở Rương +10%,
           Đổi Tướng miễn phí x2, Hồi Phục +8%...
```

#### ⚜️ GUILD
- Tạo / Tham gia Guild — mở lúc **Lv 15**
- Giao diện: Danh sách thành viên, Guild Level, Guild Boss hàng ngày
- Chat guild đơn giản
- Guild bonus: +5% EXP toàn thành viên

---

### 7. HỆ THỐNG TƯỚNG (Heroes System)

#### Cấp bậc tướng:
```
Tướng Thường → (nâng bậc) → Tướng Nâng Cấp → (breakthrough) → Tướng S
(mỗi trường phái: 2 thường + 2 S = 10 tướng/trường phái × 5 = ... wait)
```
Đúng spec: mỗi trường phái có **2 tướng thường** và **2 tướng S** (tổng 20 tướng)

#### Màn hình Mở Tướng:
- 3 tab: **Tướng Thường** | **Tướng Nâng Cấp** | **Tướng S**
- Mỗi card tướng: avatar + tên + thuộc tính + trường phái + cấp bậc hiện tại
- Nhấn vào → Xem chi tiết: kỹ năng, chỉ số, lịch sử

---

### 8. MÀN HÌNH LOGIN

Visual spec:
- **Background:** Gradient đen → tím sẫm → đỏ hoại, có particle stars nhỏ bay
- **Trung tâm:** Logo "ĐỘC TÔN CHIẾN THẦN" chữ Cinzel vàng, glow animation
- **Hai bên:** 2-3 tướng oai hùng (Địa Hoàng bên trái, Tử Thần bên phải, Vô Cực Pháp Vương giữa sau) — dùng SVG hoặc placeholder gradient có aura glow
- **Form:** Input tên nhân vật + mật khẩu, nút đăng nhập vàng rực
- **Hiệu ứng:** Khi hover nút → pulse gold glow, tướng floating animation

---

## 📱 YÊU CẦU MOBILE (QUAN TRỌNG)

```css
/* Mobile first, viewport */
- Max width content: 430px (iPhone 15 Pro Max)
- Touch target tối thiểu: 44px × 44px
- Safe area insets cho notch/island
- Tất cả animation phải smooth 60fps
- Không dùng hover-only, phải có active state
- Font size tối thiểu 14px
- Bottom navigation: fixed, có padding-bottom safe area
```

---

## ⚙️ DATA TYPES (TypeScript)

```typescript
// types/index.ts

type Element = 'WIND' | 'WATER' | 'EARTH' | 'THUNDER' | 'VOID';
type HeroClass = 'TANK' | 'HEALER' | 'RANGER' | 'MAGE' | 'ASSASSIN';
type HeroRarity = 'NORMAL' | 'UPGRADED' | 'S';

interface Hero {
  id: string;
  name: string;
  element: Element;
  class: HeroClass;
  rarity: HeroRarity;
  level: number;
  hp: number; maxHp: number;
  atk: number; def: number; spd: number;
  skills: Skill[];
  avatar: string; // path hoặc emoji placeholder
  isUnlocked: boolean;
  stars: number; // số sao đã đạt
}

interface Skill {
  id: string;
  name: string;
  type: 'ATTACK' | 'DEFENSE' | 'SUPPORT';
  description: string;
  cooldown: number;
  damage?: number;
  healPercent?: number;
  effect?: string;
  icon: string;
}

interface Monster {
  id: string;
  name: string;
  element: Element;
  hp: number; maxHp: number;
  atk: number;
  speed: number; // px/s từ trên xuống
  isBoss: boolean;
  spawnTime: number; // giây từ đầu trận
  reward: { exp: number; gold: number; };
}

interface BattleState {
  heroes: Hero[];
  monsters: Monster[];
  wave: number;
  progress: number; // 0-100
  timeElapsed: number; // giây
  gameSpeed: 1 | 1.5 | 2;
  isRunning: boolean;
  result?: 'WIN' | 'LOSE';
  stars?: 1 | 2 | 3;
}

interface GameState {
  player: {
    name: string;
    level: number;
    exp: number; maxExp: number;
    gold: number;
    diamond: number; // kim cương
    totalStars: number;
    starBoxCount: number; // đếm sao để mở hộp (cứ 5 sao = 1 hộp)
    avatar: string; // hero id dùng làm avatar
    guildId?: string;
    gameSpeed: 1 | 1.5 | 2;
    speedUnlocked: boolean; // true nếu lv>=15 hoặc đã nạp
  };
  heroes: Hero[];
  campaign: { [stageId: string]: { stars: number; bestTime: number; } };
  dungeon: { [dungeonId: string]: { cleared: boolean; } };
  worldTree: { unlockedNodes: string[]; };
  inventory: { equipment: Equipment[]; artifacts: Artifact[]; };
}
```

---

## 🚀 IMPLEMENTATION NOTES

1. **Dùng localStorage** để lưu game state (giống personal-life-management dùng localStorage)
2. **Context:** `GameContext` wrap toàn app, export `useGame()` hook
3. **Battle engine:** Dùng `useRef` + `requestAnimationFrame` hoặc `setInterval` với `useEffect` cleanup
4. **Framer Motion:** Dùng `AnimatePresence` cho boss enter/exit, `motion.div` cho quái di chuyển
5. **Tailwind v4:** Dùng CSS vars trong `globals.css` như personal-life-management (không dùng config cũ)
6. **Performance:** Monster movement dùng CSS transform không dùng top/left để tránh reflow
7. **Images:** Dùng SVG inline hoặc emoji + CSS glow effect thay ảnh thật (tránh phụ thuộc asset)
8. **Responsive:** Tất cả layout dùng `flex` + `min-h-screen` + `max-w-[430px] mx-auto`

---

## 📦 PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "next": "15.5.15",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.14.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.5.0",
    "class-variance-authority": "^0.7.1",
    "next-themes": "^0.4.6"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/node": "^20",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.5.15",
    "@eslint/eslintrc": "^3"
  },
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  }
}
```

---

## 🎯 BẮT ĐẦU BUILD — THỨ TỰ ƯU TIÊN

```
Phase 1 — Foundation
  1. Setup Next.js 15 + Tailwind v4 + globals.css (dark fantasy theme)
  2. types/index.ts — toàn bộ TypeScript types
  3. lib/constants.ts — 20 tướng, 5 thuộc tính, định nghĩa quái
  4. contexts/game-context.tsx — global state + localStorage sync

Phase 2 — Core Screens
  5. login/page.tsx — màn hình login visual epic
  6. app/page.tsx — main hub với bottom navigation
  7. campaign/page.tsx — danh sách ải

Phase 3 — Battle Engine
  8. battle/page.tsx — engine trận đấu đầy đủ
     - Monster spawn theo timeline 8 phút
     - Hero tấn công auto + chiêu thức
     - Boss spawn tại 40% và 80%
     - Star rating + kết quả

Phase 4 — Meta Systems
  9. heroes/page.tsx — mở tướng, xem chi tiết
  10. inventory/page.tsx — hành trang
  11. world-tree/page.tsx — cây thế giới
  12. dungeon/page.tsx — hầm ngục
  13. guild/page.tsx — guild

Phase 5 — Polish
  14. Thêm sound effect (Web Audio API)
  15. PWA manifest cho mobile
  16. Performance optimization
```

---

*Prompt này đủ chi tiết để AI generate toàn bộ game. Copy toàn bộ file này vào chat với AI và yêu cầu build theo từng phase.*
