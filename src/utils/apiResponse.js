/**
 * Standardized API response helpers.
 * Ensures every response from the API follows a consistent shape:
 * { success: boolean, message: string, data: any }
 */
const apiResponse = {
  success: (res, statusCode, message, data = null) => {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  },

  error: (res, statusCode, message, errors = null) => {
    const response = {
      success: false,
      message,
    };

    if (errors !== null) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  },

  paginated: (res, message, data, pagination) => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  },
};

module.exports = apiResponse;
