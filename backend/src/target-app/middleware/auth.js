// Authentication Middleware
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing Authorization header',
      code: 'AUTH_HEADER_MISSING'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Malformed Bearer token',
      code: 'AUTH_TOKEN_MALFORMED'
    });
  }

  const token = parts[1];

  // Bug 3 scenario will trigger unhandled exception if not caught properly
  if (token === 'expired-token') {
    return res.status(401).json({
      success: false,
      error: 'Token has expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  if (token === 'valid-repairx-token-2026' || token === 'admin-secret-jwt' || token === 'demo-token') {
    req.user = { id: '101', role: 'admin', name: 'Tejaswini Sharma' };
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Forbidden: Invalid token signature',
    code: 'INVALID_SIGNATURE'
  });
};
