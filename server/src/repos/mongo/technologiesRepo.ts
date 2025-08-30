import { Types } from 'mongoose';
import { getTaggedLogger } from '../../logging/console';
import { Technology } from '../../models/Technology';
import type { TechnologyDTO, TechnologiesRepo } from '../interfaces';

// LOG: This is a temporary logger for the technologies repo.
// TODO: Remove this once we have a proper logging system.
const log = getTaggedLogger('REPO:TECHNOLOGIES');

export class MongoTechnologiesRepo implements TechnologiesRepo {
  async ensureIndexes(): Promise<void> {
    const start = Date.now();
    await Technology.syncIndexes();
    log.info(
      { op: 'ensureIndexes', model: 'Technology', durationMs: Date.now() - start },
      'indexes ensured',
    );
  }

  async list(): Promise<TechnologyDTO[]> {
    const start = Date.now();
    const query: Record<string, unknown> = {};
    const items = await Technology.find(query).lean<TechnologyDTO[]>();
    log.info(
      {
        op: 'list',
        model: 'Technology',
        count: items.length,
        durationMs: Date.now() - start,
      },
      'technologies list',
    );
    return items;
  }

  async getById(id: string): Promise<TechnologyDTO | null> {
    const start = Date.now();
    const result = await Technology.findById(id).lean<TechnologyDTO | null>();
    log.info(
      { op: 'getById', id, found: Boolean(result), durationMs: Date.now() - start },
      'technology getById',
    );
    return result;
  }

  async getBySlug(slug: string): Promise<TechnologyDTO | null> {
    const start = Date.now();
    const result = await Technology.findOne({ slug }).lean<TechnologyDTO | null>();
    log.info(
      { op: 'getBySlug', slug, found: Boolean(result), durationMs: Date.now() - start },
      'technology getBySlug',
    );
    return result;
  }

  async create(
    data: Omit<TechnologyDTO, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TechnologyDTO> {
    const start = Date.now();
    const doc = await Technology.create(data);
    const result = doc.toObject() as unknown as TechnologyDTO;
    log.info(
      {
        op: 'create',
        id: String((doc as unknown as { _id: Types.ObjectId })._id),
        name: data.name,
        durationMs: Date.now() - start,
      },
      'technology created',
    );
    return result;
  }

  async updateById(id: string, data: Partial<TechnologyDTO>): Promise<TechnologyDTO | null> {
    const start = Date.now();
    const updated = await Technology.findByIdAndUpdate(id, data, {
      new: true,
    }).lean<TechnologyDTO | null>();
    log.info(
      { op: 'updateById', id, updated: Boolean(updated), durationMs: Date.now() - start },
      'technology updated',
    );
    return updated;
  }

  async deleteById(id: string): Promise<void> {
    const start = Date.now();
    await Technology.findByIdAndDelete(id);
    log.info({ op: 'deleteById', id, durationMs: Date.now() - start }, 'technology deleted');
  }
}
