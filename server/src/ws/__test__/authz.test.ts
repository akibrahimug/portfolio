import bunyan from 'bunyan';
import { requireAuth } from '../authz';
import type { RequestContext, AuthenticatedRequest } from '../../lib/context';

describe('authz.requireAuth', () => {
  it('returns userId when present', () => {
    const log = bunyan.createLogger({ name: 'test', level: 'fatal' });
    const req = { userId: 'u123' } as unknown as AuthenticatedRequest;
    const ctx = { requestId: 'r', log, req } as RequestContext;
    expect(requireAuth(ctx)).toBe('u123');
  });
  it('throws when missing', () => {
    const log = bunyan.createLogger({ name: 'test', level: 'fatal' });
    const req = {} as unknown as AuthenticatedRequest;
    const ctx = { requestId: 'r', log, req } as RequestContext;
    expect(() => requireAuth(ctx)).toThrow('unauthorized');
  });
});
