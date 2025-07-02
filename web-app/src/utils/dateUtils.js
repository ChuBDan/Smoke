export const dateUtils = {
  /**
   * Converts a string in dd-MM-yyyy format to a valid Date object
   * @param {string} str - date string in "dd-MM-yyyy"
   * @returns {Date|null} JS Date or null if invalid
   */
  parseDDMMYYYY(str) {
    const [dd, mm, yyyy] = str.split("-").map(Number);
    if (!dd || !mm || !yyyy) return null;

    const date = new Date(yyyy, mm - 1, dd);
    // Ensure the date parts match (e.g. "31-02-2025" should be invalid)
    if (
      date.getDate() !== dd ||
      date.getMonth() !== mm - 1 ||
      date.getFullYear() !== yyyy
    ) {
      return null;
    }
    return date;
  },

  /**
   * Formats a Date object to dd-MM-yyyy
   * @param {Date} date - valid JS Date
   * @returns {string}
   */
  formatToDDMMYYYY(date) {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  },

  /**
   * Converts a dd-MM-yyyy string to a localized string (e.g. vi-VN)
   * @param {string} str - date string in "dd-MM-yyyy"
   * @param {string} locale - e.g. "vi-VN"
   * @returns {string|null}
   */
  localizeDDMMYYYY(str, locale = "vi-VN") {
    const date = this.parseDDMMYYYY(str);
    return date ? date.toLocaleDateString(locale) : null;
  }
};
