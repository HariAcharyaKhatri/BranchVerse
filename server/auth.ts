import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization Bearer header.'
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized: Empty authentication token.'
    });
    return;
  }

  try {
    // Decode and validate Firebase ID Token claims
    const parts = token.split('.');
    if (parts.length !== 3) {
      res.status(401).json({ error: 'Unauthorized: Malformed JWT token.' });
      return;
    }

    const payloadRaw = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadRaw);

    const nowSeconds = Math.floor(Date.now() / 1000);

    // Validate expiration
    if (payload.exp && payload.exp < nowSeconds) {
      res.status(401).json({ error: 'Unauthorized: Session token expired. Please re-authenticate.' });
      return;
    }

    // Verify Firebase issuer
    if (payload.iss && !payload.iss.includes('securetoken.google.com')) {
      res.status(401).json({ error: 'Unauthorized: Invalid token issuer.' });
      return;
    }

    // Derive user ID from token sub claim (never trust client payload body)
    const uid = payload.sub || payload.user_id;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized: Token missing subject identity.' });
      return;
    }

    req.userId = uid;
    req.userEmail = payload.email || undefined;
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Unauthorized: Failed to verify identity token.',
      message: err.message
    });
  }
}
