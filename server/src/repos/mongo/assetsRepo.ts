import { getTaggedLogger } from '../../logging/console';
import { Asset } from '../../models/Asset';
import type { AssetDTO, AssetsRepo } from '../interfaces';

const log = getTaggedLogger('REPO:ASSETS');

export class MongoAssetsRepo implements AssetsRepo {
  async ensureIndexes(): Promise<void> {
    const start = Date.now();
    await Asset.syncIndexes();
    log.info(
      { op: 'ensureIndexes', model: 'Asset', durationMs: Date.now() - start },
      'indexes ensured',
    );
  }

  async create(data: Omit<AssetDTO, '_id' | 'createdAt'>): Promise<AssetDTO> {
    const start = Date.now();
    const doc = await Asset.create(data);
    const result = doc.toObject() as AssetDTO;
    log.info(
      {
        op: 'create',
        model: 'Asset',
        projectId: data.projectId,
        ownerId: data.ownerId,
        path: data.path,
        size: data.size,
        contentType: data.contentType,
        durationMs: Date.now() - start,
      },
      'asset created',
    );
    return result;
  }
}
