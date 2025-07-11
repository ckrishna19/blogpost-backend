export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    if (error.name === "MongoServerError") {
      return res.status(403).json({
        message: "This is already registered....:" + error,
        statusCode: 403,
      });
    }
    if (error.name === "ValidatorError") {
      return res.status(403).json({
        message: error.message,
        statusCode: 403,
      });
    }
    return res.status(error.statusCode || 500).json({
      message: error.message || "something went wrong",
      statusCode: error.statusCode || 500,
    });
  }
};

export class ApiResponse {
  constructor(statusCode, message, success = true, data) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = success;
    this.data = data;
  }
}

export class ApiError extends Error {
  constructor(
    message = "Something went wrong!",
    statusCode,
    errors = [],
    stack = ""
  ) {
    super(); // sets this.message correctly
    this.message = message;
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
