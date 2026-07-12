/**
 * Standard success envelope sent to the client.
 * Shape: { success, data, message, meta }
 */
class ApiResponse {
  constructor(data = null, message = 'OK', meta = null) {
    this.success = true;
    this.data = data;
    this.message = message;
    if (meta) this.meta = meta;
  }

  /** Write the response with the given status code (default 200). */
  static send(res, { statusCode = 200, data = null, message = 'OK', meta = null } = {}) {
    return res.status(statusCode).json(new ApiResponse(data, message, meta));
  }
}

module.exports = ApiResponse;
