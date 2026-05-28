function success(res, data = null, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function error(res, message = "Internal Server Error", statusCode = 500, details = null) {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
}

module.exports = { success, error };
