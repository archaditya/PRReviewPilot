const { Op } = require('sequelize');

/**
 * Reusable Query Parser for Pagination, Search, and Filtering
 */
class QueryParser {
  /**
   * Parse pagination parameters from request query
   */
  static parsePagination(query = {}, defaultLimit = 10, maxLimit = 100) {
    const rawPage = parseInt(query.page, 10);
    const rawLimit = parseInt(query.limit, 10);

    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(maxLimit, rawLimit) : defaultLimit;
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Build case-insensitive multi-field search clause
   */
  static buildSearchClause(search, fields = []) {
    if (!search || typeof search !== 'string' || !search.trim() || !fields.length) {
      return null;
    }

    const term = `%${search.trim()}%`;
    const clauses = fields.map((field) => ({
      [field]: { [Op.iLike]: term },
    }));

    return { [Op.or]: clauses };
  }

  /**
   * Build whitelist-checked filter conditions
   */
  static parseFilters(query = {}, allowedFilters = {}) {
    const filters = {};

    for (const [queryParam, dbColumn] of Object.entries(allowedFilters)) {
      const val = query[queryParam];
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        filters[dbColumn] = val;
      }
    }

    return filters;
  }
}

module.exports = QueryParser;
