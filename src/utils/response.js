function success(res, status, data, meta) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

function error(res, status, message) {
  return res.status(status).json({ success: false, message });
}

module.exports = { success, error };
