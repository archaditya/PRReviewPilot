/**
 * Standard Global API Response Formatter
 */
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, extra = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...extra,
    });
  }

  static paginated(res, { data = [], total = 0, page = 1, limit = 10, message = 'Success', extra = {}, resourceKey = null }) {
    const totalPages = Math.ceil(total / limit) || 1;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const payload = {
      success: true,
      message,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages,
        hasNext,
        hasPrev,
      },
      ...extra,
    };

    // Backward compatibility: provide the resource key if specified (e.g. repositories: [...])
    if (resourceKey) {
      payload[resourceKey] = data;
    }

    return res.status(200).json(payload);
  }

  static error(res, message = 'An error occurred', statusCode = 400, errors = null) {
    const payload = {
      success: false,
      error: message,
    };
    if (errors) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
