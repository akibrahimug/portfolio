import { Asset } from '../../models/Asset';
import type { AssetDTO, AssetsRepo } from '../interfaces';

export class MongoAssetsRepo implements AssetsRepo {
  async ensureIndexes(): Promise<void> {
    await Asset.syncIndexes();
  }

  async create(data: Omit<AssetDTO, '_id' | 'createdAt'>): Promise<AssetDTO> {
    const doc = await Asset.create(data);
    return doc.toObject() as AssetDTO;
  }
}
