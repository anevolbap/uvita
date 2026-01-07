// Constants
const BCRA_API_URL = 'https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable';
const UVA_VARIABLE_ID = 31;
const SUNDAY = 0;
const SATURDAY = 6;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Fetches the UVA value from BCRA API for a specific date
 * @param {string} date The date in YYYY-MM-DD format
 * @return {number|string} The UVA value or error message
 * @customfunction
 */
function fetchUvaValue(date) {
  // Validate date format
  if (!date || typeof date !== 'string' || !DATE_REGEX.test(date)) {
    return 'Error: Invalid date format. Use YYYY-MM-DD';
  }

  try {
    const url = `${BCRA_API_URL}/${UVA_VARIABLE_ID}/${date}/${date}`;
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    if (statusCode !== 200) {
      Logger.log(`HTTP ${statusCode} for date ${date}`);
      return `Error: HTTP ${statusCode}`;
    }

    const jsonResponse = JSON.parse(response.getContentText());

    if (!jsonResponse.results || !jsonResponse.results.length) {
      return 'No data available for this date';
    }

    const result = jsonResponse.results[0];
    if (!result.hasOwnProperty('valor')) {
      return 'Error: Invalid response structure';
    }

    return result.valor;

  } catch (error) {
    Logger.log(`Error fetching UVA value: ${error.toString()}`);
    return `Error: ${error.message || 'Failed to fetch data'}`;
  }
}

/**
 * Returns the first working day (Mon-Fri) on or after the 10th of the month
 * Note: Does not account for national holidays
 * @param {number} month Month (1-12)
 * @param {number} year Full year (e.g., 2024)
 * @return {string} Date in YYYY-MM-DD format or error message
 * @customfunction
 */
function getFirstWorkingDayAfterTenth(month, year) {
  // Validate inputs
  if (!month || !year || typeof month !== 'number' || typeof year !== 'number') {
    return 'Error: Month and year must be numbers';
  }

  if (month < 1 || month > 12) {
    return 'Error: Month must be between 1 and 12';
  }

  if (year < 1900 || year > 2100) {
    return 'Error: Year must be between 1900 and 2100';
  }

  try {
    const date = new Date(year, month - 1, 10);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Error: Invalid date';
    }

    const dayOfWeek = date.getDay();

    // Adjust for weekends
    if (dayOfWeek === SUNDAY) {
      date.setDate(date.getDate() + 1);
    } else if (dayOfWeek === SATURDAY) {
      date.setDate(date.getDate() + 2);
    }

    return date.toISOString().split('T')[0];

  } catch (error) {
    Logger.log(`Error calculating working day: ${error.toString()}`);
    return `Error: ${error.message || 'Failed to calculate date'}`;
  }
}
