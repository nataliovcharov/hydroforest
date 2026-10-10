// Hydration rules shared by every page. These match the backend (routes/home.js).

export const DAILY_GOAL_ML = 1920; // 8 cups

export const STAGES = [
  { key: "seed", label: "Seed", from: 0 },
  { key: "sprout", label: "Sprout", from: 480 },
  { key: "seedling", label: "Seedling", from: 960 },
  { key: "sapling", label: "Sapling", from: 1440 },
  { key: "adultTree", label: "Grown tree", from: DAILY_GOAL_ML },
];

export function stageFor(ml) {
  return [...STAGES].reverse().find((stage) => ml >= stage.from) ?? STAGES[0];
}

export function nextStageFor(ml) {
  return STAGES.find((stage) => stage.from > ml) ?? null;
}

export const UNITS = {
  cups: { key: "cups", label: "Cups", ml: 240, one: "cup", many: "cups", presets: [0.5, 1, 2] },
  oz: { key: "oz", label: "oz", ml: 29.5735, one: "oz", many: "oz", presets: [4, 8, 16] },
  ml: { key: "ml", label: "ml", ml: 1, one: "ml", many: "ml", presets: [100, 250, 500] },
};

export function toUnit(ml, unit) {
  return ml / UNITS[unit].ml;
}

export function toMl(amount, unit) {
  return Math.round(amount * UNITS[unit].ml);
}

function round(value, unit) {
  if (unit === "ml") return Math.round(value);
  if (unit === "oz") return Math.round(value);
  return Math.round(value * 10) / 10; // cups: one decimal, e.g. 2.5
}

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

/** "2.5 cups", "8 oz", "500 ml" */
export function formatAmount(ml, unit, { withUnit = true } = {}) {
  const value = round(toUnit(ml, unit), unit);
  if (!withUnit) return numberFormat.format(value);
  const { one, many } = UNITS[unit];
  return `${numberFormat.format(value)} ${value === 1 ? one : many}`;
}

/** Large totals read better in litres: "21.4 L" */
export function formatLitres(ml) {
  return `${numberFormat.format(Math.round(ml / 100) / 10)} L`;
}

/** Day keys are "YYYY-MM-DD". The API stores each day as midnight UTC of that date. */
export function dayKeyFromApi(date) {
  return String(date).slice(0, 10);
}

export function dayKeyFromLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateFromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
