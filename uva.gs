const API_BASE = 'https://api.bcra.gob.ar/estadisticas/v4.0/monetarias';
const UVA_VARIABLE_ID = 31;
const HOLIDAYS_API = 'https://api.argentinadatos.com/v1/feriados';
const CACHE_TTL_SECONDS = 21600; // 6h, the CacheService maximum

/**
 * Fetches the UVA value from BCRA API for a specific date. Cached for 6 hours.
 * Throws on error, so a failed call shows as #ERROR! in the cell.
 * @param {string|Date} date The date in YYYY-MM-DD format, or a Date (e.g. a date cell)
 * @return {number} The UVA value
 * @customfunction
 */
function fetchUvaValue(date) {
  const day = date instanceof Date
    ? Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : date;

  const cache = CacheService.getScriptCache();
  const cacheKey = `uva_${day}`;
  const cached = cache.get(cacheKey);
  if (cached !== null) {
    return Number(cached);
  }

  const url = `${API_BASE}/${UVA_VARIABLE_ID}?desde=${encodeURIComponent(day)}&hasta=${encodeURIComponent(day)}`;
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

  const valor = detalle[0].valor;
  cache.put(cacheKey, String(valor), CACHE_TTL_SECONDS);
  return valor;
}

/**
 * Returns the first business day (Mon-Fri, not an Argentine holiday) on or
 * after the 10th of the given month. Holidays come from api.argentinadatos.com;
 * if that lookup fails, only weekends are skipped.
 * @param {number} month Month (1-12)
 * @param {number} year Full year (e.g., 2024)
 * @return {string} Date in YYYY-MM-DD format
 * @customfunction
 */
function getFirstWorkingDayAfterTenth(month, year) {
  if (!(month >= 1 && month <= 12)) {
    throw new Error(`Invalid month: ${month} (expected 1-12)`);
  }
  const holidays = getArgentineHolidays_(year);
  return toYmd_(firstWorkingDayAfterTenth_(month, year, holidays));
}

/**
 * Pure: first weekday (Mon-Fri) on or after the 10th of the month that is not
 * in `holidays`. Uses no Apps Script APIs, so it is unit-testable.
 * @param {number} month Month (1-12)
 * @param {number} year Full year
 * @param {!Set<string>} holidays Set of 'YYYY-MM-DD' dates to skip
 * @return {!Date}
 * @private
 */
function firstWorkingDayAfterTenth_(month, year, holidays) {
  const date = new Date(year, month - 1, 10);
  while (true) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.has(toYmd_(date))) {
      return date;
    }
    date.setDate(date.getDate() + 1);
  }
}

/**
 * Formats a Date as 'YYYY-MM-DD' using its local calendar components.
 * @param {!Date} date
 * @return {string}
 * @private
 */
function toYmd_(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the set of Argentine holiday dates for a year, from
 * api.argentinadatos.com. Cached for 6 hours. Every listed day is included
 * (feriados and días no laborables). Returns an empty set on error so the
 * caller falls back to skipping weekends only.
 * @param {number} year Full year
 * @return {!Set<string>} Set of 'YYYY-MM-DD' dates
 * @private
 */
function getArgentineHolidays_(year) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `feriados_${year}`;
  const cached = cache.get(cacheKey);
  if (cached !== null) {
    return new Set(JSON.parse(cached));
  }

  try {
    const response = UrlFetchApp.fetch(`${HOLIDAYS_API}/${year}`, {
      method: 'GET',
      muteHttpExceptions: true
    });
    if (response.getResponseCode() !== 200) {
      Logger.log(`Holidays API returned HTTP ${response.getResponseCode()} for ${year}`);
      return new Set();
    }
    const dates = JSON.parse(response.getContentText()).map(f => f.fecha);
    cache.put(cacheKey, JSON.stringify(dates), CACHE_TTL_SECONDS);
    return new Set(dates);
  } catch (error) {
    Logger.log(`Error fetching holidays for ${year}: ${error.toString()}`);
    return new Set();
  }
}
