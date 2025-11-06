/**
 * Pagination Middleware
 * 
 * Parses and validates pagination query parameters (page, limit).
 * Attaches pagination info to req.pagination for use in controllers.
 * 
 * Query Parameters:
 * - page: Page number (1-based, default: 1)
 * - limit: Items per page (min: 1, max: 100, default: 10)
 * 
 * Usage:
 *   router.get('/items', paginate(), controller.listItems);
 * 
 * Controller Access:
 *   req.pagination = { page, limit, offset }
 * 
 * Response Format:
 *   {
 *     success: true,
 *     data: [...],
 *     pagination: {
 *       page: 1,
 *       limit: 10,
 *       total: 42,
 *       totalPages: 5,
 *       hasMore: true
 *     }
 *   }
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

/**
 * Pagination middleware factory
 * @param {Object} options - Configuration options
 * @param {number} options.defaultLimit - Default items per page (default: 10)
 * @param {number} options.maxLimit - Maximum items per page (default: 100)
 * @returns {Function} Express middleware
 */
export const paginate = (options = {}) => {
  const defaultLimit = options.defaultLimit || DEFAULT_LIMIT;
  const maxLimit = options.maxLimit || MAX_LIMIT;

  return (req, res, next) => {
    // Only apply pagination if query params are present
    if (!req.query.page && !req.query.limit) {
      return next();
    }

    // Parse page parameter
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
      page = DEFAULT_PAGE;
    }

    // Parse limit parameter
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < MIN_LIMIT) {
      limit = defaultLimit;
    }
    if (limit > maxLimit) {
      limit = maxLimit;
    }

    // Calculate offset for database queries
    const offset = (page - 1) * limit;

    // Attach pagination info to request
    req.pagination = {
      page,
      limit,
      offset
    };

    next();
  };
};

/**
 * Helper function to create paginated response
 * @param {Array} data - Array of items for current page
 * @param {number} total - Total count of items
 * @param {Object} pagination - Pagination params from req.pagination
 * @returns {Object} Formatted paginated response
 */
export const createPaginatedResponse = (data, total, pagination) => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
      // Additional metadata
      itemsOnPage: data.length,
      firstItem: total === 0 ? 0 : (page - 1) * limit + 1,
      lastItem: Math.min(page * limit, total)
    }
  };
};

/**
 * Helper to validate pagination parameters in tests
 * @param {Object} query - Query object with page and limit
 * @returns {Object} Validated pagination params
 */
export const validatePaginationParams = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(MIN_LIMIT, parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};
