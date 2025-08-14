/**
 * Asset event handlers.
 * - requestUpload: authenticated; validates size/MIME; returns V4 signed PUT URL
 * - confirm: authenticated; persists Asset document with uploaded object path
 */
import type { WebSocket } from 'ws';
import type { Schemas } from '../../schemas';
import config from '../../config';
import { createV4UploadSignedUrl } from '../../services/gcs';
import { Asset } from '../../models/Asset';
import { send } from '../types';
import type { RequestContext } from '../../lib/context';
import { requireAuth } from '../authz';

export function registerAssetEvents(schemas: Schemas) {
  return {
    async requestUpload(socket: WebSocket, payload: unknown, ctx: RequestContext) {
      // Must be authenticated to upload
      requireAuth(ctx);
      const req = schemas.AssetsRequestUploadReq.parse(payload);

      // Ensure bucket configured
      const bucket = config.gcs.bucketUploads;
      if (!bucket) return send(socket, 'system:error', { message: 'GCS bucket not configured' });

      // Build namespaced object path under project prefix
      const objectPath = `uploads/${req.projectId}/${Date.now()}-${req.filename}`;

      // Enforce size and MIME policy from config
      if (req.size / (1024 * 1024) > config.uploads.maxMb) {
        return send(socket, 'system:error', { message: 'file too large' });
      }
      if (
        config.uploads.allowedMime.length &&
        !config.uploads.allowedMime.includes(req.contentType)
      ) {
        return send(socket, 'system:error', { message: 'invalid content type' });
      }

      // Issue short-lived V4 signed PUT URL
      const uploadUrl = await createV4UploadSignedUrl({
        bucket,
        objectPath,
        contentType: req.contentType,
        expiresInSeconds: 15 * 60,
      });

      // Client must use these exact headers on PUT
      return send(socket, 'assets:requestUpload', {
        uploadUrl,
        objectPath,
        headers: { 'Content-Type': req.contentType },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
    },
    async confirm(socket: WebSocket, payload: unknown, ctx: RequestContext) {
      // Must be authenticated to confirm
      const userId = requireAuth(ctx);
      const req = schemas.AssetsConfirmReq.parse(payload);

      // Persist asset metadata (assumes client successfully uploaded)
      const asset = await Asset.create({
        projectId: req.projectId,
        ownerId: req.ownerId || userId,
        path: req.objectPath,
        contentType: req.contentType,
        size: req.size,
      });

      return send(socket, 'assets:confirm', { asset });
    },
  } as const;
}
