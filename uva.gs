/**
 * Fetches the UVA value from BCRA API for a specific date
 * @param {string|Date} date The date in YYYY-MM-DD format, or a Date (e.g. a date cell)
 * @return {number|string} The UVA value or error message
 * @customfunction
 */
function fetchUvaValue(date) {
  const API_URL = 'https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/31?';
  const day = date instanceof Date
    ? Utilities.formatDate(date, 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd')
    : date;

  try {
    const url = `${API_URL}desde=${encodeURIComponent(day)}&hasta=${encodeURIComponent(day)}`;
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();
    if (code !== 200) {
      Logger.log(`BCRA API returned HTTP ${code}: ${response.getContentText()}`);
      return `Error: API returned HTTP ${code}`;
    }

    const jsonResponse = JSON.parse(response.getContentText());
    const detalle = jsonResponse.results && jsonResponse.results[0] && jsonResponse.results[0].detalle;

    if (!detalle || !detalle.length) {
      return 'No data available for this date';
    }

    return detalle[0].valor;

  } catch (error) {
    Logger.log(`Error fetching UVA value: ${error.toString()}`);
    return 'Error fetching data';
  }
}

/**
 * Returns the first working day (Mon-Fri) on or after the 10th of the specified month and year
 * @param {number} month Month (1-12)
 * @param {number} year Full year (e.g., 2024)
 * @return {string} Date in YYYY-MM-DD format
 * @customfunction
 */
function getFirstWorkingDayAfterTenth(month, year) {
  try {
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

    return date.toISOString().split('T')[0];

  } catch (error) {
    Logger.log(`Error calculating working day: ${error.toString()}`);
    return 'Error calculating date';
  }
}
