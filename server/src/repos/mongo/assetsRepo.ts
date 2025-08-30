import { Types, type FilterQuery } from 'mongoose';
import { Asset, type IAsset } from '../../models/Asset';
import { getTaggedLogger } from '../../logging/console';

const MONGO_ID_RE = /^[a-f0-9]{24}$/i;
export const isMongoId = (v: string) => MONGO_ID_RE.test(String(v)); // <-- export it

export type AssetType =
  | 'project'
  | 'resume'
  | 'technology'
  | 'media'
  | 'avatar'
  | 'badge'
  | 'certification'
  | 'experience'
  | 'other';

const log = getTaggedLogger('REPO:PROJECTS');

export interface CreateAssetParams {
  ownerId: string;
  projectId?: string; // ObjectId string for project assets; omit/undefined for others
  path: string; // REQUIRED by schema (GCS object key)
  contentType: string;
  size: number;
  assetType: AssetType;
  objectPath?: string; // Optional alias; keep if your schema has it
  metadata?: Record<string, unknown>;
}

export class MongoAssetsRepo {
  async ensureIndexes(): Promise<void> {
    const start = Date.now();
    await Asset.syncIndexes();
    log.info(
      { op: 'ensureIndexes', model: 'Asset', durationMs: Date.now() - start },
      'indexes ensured',
    );
  }

  /** Create an asset (only sets projectId if it’s a valid ObjectId) */
  async createAsset(params: CreateAssetParams) {
    const doc: Partial<IAsset> & { projectId?: Types.ObjectId } = {
      ownerId: params.ownerId,
      path: params.path, // <- REQUIRED by your schema
      contentType: params.contentType,
      size: params.size,
      assetType: params.assetType,
      objectPath: params.objectPath ?? params.path, // keep if schema allows
      metadata: params.metadata,
    };

    if (params.projectId && isMongoId(params.projectId)) {
      doc.projectId = new Types.ObjectId(params.projectId);
    }

    return Asset.create(doc);
  }

  /** Fetch one asset by id */
  async getAssetById(id: string) {
    return Asset.findById(id);
  }

  /** Delete one asset by id */
  async deleteAssetById(id: string) {
    return Asset.findByIdAndDelete(id);
  }

  /** Optional: list many by owner (handy for future use) */
  async listAssetsByOwner(ownerId: string, limit = 50, cursor?: string) {
    const q: FilterQuery<IAsset> = { ownerId } as unknown as FilterQuery<IAsset>;
    const sort: Record<string, 1 | -1> = { _id: -1 };
    if (cursor && isMongoId(cursor)) {
      q._id = { $lt: new Types.ObjectId(cursor) };
    }
    const items = await Asset.find(q)
      .sort(sort)
      .limit(limit + 1);
    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    const nextCursor = hasMore ? String(items[items.length - 1]._id) : undefined;
    return { items, hasMore, nextCursor };
  }
}
