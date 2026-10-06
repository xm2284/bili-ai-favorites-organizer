// ================= Z-Index =================
export const Z_INDEX = {
  FLOAT: 2147483640,
  PANEL: 2147483641,
  MODAL: 2147483645,
  PARTICLE: 2147483646,
  TOAST: 2147483647,
} as const;

// ================= Confetti 颜色 (暖色纸质风) =================
export const CONFETTI_COLORS = [
  '#B0742F', '#C08A24', '#B5533A', '#6F8F3F',
  '#CB8B45', '#A83F2A', '#9C4B52', '#D6A868',
  '#8A7A5C', '#E0B45C', '#B07A3F', '#7A5A3A',
];

// ================= 极光颜色 (用于粒子/Canvas, 暖色) =================
export const AURORA_COLORS = [
  '#D6A868', '#C08A24', '#6F8F3F', '#B5533A', '#E0B45C', '#A08A5E',
];

// ================= Toast/Canvas 限制 =================
export const MAX_TOAST_COUNT = 5;
export const MAX_CANVAS_FX = 1;

// ================= 位置持久化 =================
/** FloatButton 和 Panel 共享的拖拽位置 GM key */
export const POS_STORAGE_KEY = 'bfao_pos_v5';
