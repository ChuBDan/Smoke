// src/utils/format.js
// Utility for formatting numbers as Vietnamese Dong (VND)
export function formatVND(number) {
  if (typeof number !== "number" || isNaN(number)) return "0₫";
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}

// Utility for formatting currency (alias for formatVND)
export function formatCurrency(number) {
  return formatVND(number);
}
