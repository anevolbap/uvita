/**
 * Fetches the UVA value from BCRA API for a specific date.
 * Throws on error, so a failed call shows as #ERROR! in the cell.
 * @param {string|Date} date The date in YYYY-MM-DD format, or a Date (e.g. a date cell)
 * @return {number} The UVA value
 * @customfunction
 */
function fetchUvaValue(date) {
  const API_URL = 'https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/31?';
  const day = date instanceof Date
    ? Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : date;

  const url = `${API_URL}desde=${encodeURIComponent(day)}&hasta=${encodeURIComponent(day)}`;
  const response = UrlFetchApp.fetch(url, {
    method: 'GET',
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  if (code !== 200) {
    throw new Error(`BCRA API returned HTTP ${code}`);
  }

  const jsonResponse = JSON.parse(response.getContentText());
  const detalle = jsonResponse.results && jsonResponse.results[0] && jsonResponse.results[0].detalle;

  if (!detalle || !detalle.length) {
    throw new Error(`No UVA data available for ${day}`);
  }

  return detalle[0].valor;
}

/**
 * Returns the first weekday (Mon-Fri) on or after the 10th of the given month.
 * If the 10th is already a weekday it is returned unchanged. Argentine holidays
 * (feriados) are NOT skipped. Throws on an invalid month.
 * @param {number} month Month (1-12)
 * @param {number} year Full year (e.g., 2024)
 * @return {string} Date in YYYY-MM-DD format
 * @customfunction
 */
function getFirstWorkingDayAfterTenth(month, year) {
  if (!(month >= 1 && month <= 12)) {
    throw new Error(`Invalid month: ${month} (expected 1-12)`);
  }

  const date = new Date(year, month - 1, 10);
  const dayOfWeek = date.getDay();

  // Adjust for weekends
  switch (dayOfWeek) {
    case 0: // Sunday
      date.setDate(date.getDate() + 1);
      break;
    case 6: // Saturday
      date.setDate(date.getDate() + 2);
      break;
  }

  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
