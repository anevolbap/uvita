/**
 * Fetches the UVA value from BCRA API for a specific date
 * @param {string} date The date in YYYY-MM-DD format
 * @return {number|string} The UVA value or error message
 * @customfunction
 */
function fetchUvaValue(date) {
  const API_URL = 'https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/31/';

  try {
    const response = UrlFetchApp.fetch(`${API_URL}${date}/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      validateHttpsCertificates: false,
      muteHttpExceptions: true
    });

    const jsonResponse = JSON.parse(response.getContentText());
    
    if (!jsonResponse.results || !jsonResponse.results.length) {
      return 'No data available for this date';
    }

    return jsonResponse.results[0].valor;

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
