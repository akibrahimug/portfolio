/**
 * Express authentication middleware using JWT verification.
 */
import type { Request, Response, NextFunction } from 'express';
import { verifyTokenOrThrow } from './jwt';

/**
 * Express middleware that authenticates a Bearer token and attaches userId.
 * - On success: sets `req.userId` and calls next()
 * - On failure: responds 401/403 JSON
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
    if (!token)
      return res
        .status(401)
        .json({ error: '[[AUTH_ERROR_MIDDLEWARE]]-[HAPPENING ON SERVER]: missing_token' + res });
    const claims = await verifyTokenOrThrow(token);
    (req as unknown as { userId?: string }).userId = claims.sub as string | undefined;
    return next();
  } catch (err) {
    return res
      .status(403)
      .json({ error: '[[AUTH_ERROR_MIDDLEWARE]]-[HAPPENING ON SERVER]: forbidden' + err });
  }
}
