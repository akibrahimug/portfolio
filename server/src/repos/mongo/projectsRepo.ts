import { Types } from 'mongoose';
import { getTaggedLogger } from '../../logging/console';
import { Project } from '../../models/Project';
import config from '../../config';
import type { ProjectDTO, ProjectsRepo } from '../interfaces';

const log = getTaggedLogger('REPO:PROJECTS');

export class MongoProjectsRepo implements ProjectsRepo {
  async ensureIndexes(): Promise<void> {
    const start = Date.now();
    await Project.syncIndexes();
    log.info(
      { op: 'ensureIndexes', model: 'Project', durationMs: Date.now() - start },
      'indexes ensured',
    );
  }

  async list(params: {
    filter?: Partial<ProjectDTO> & { search?: string; tags?: string[] };
    limit: number;
    cursor?: string;
  }): Promise<{ items: ProjectDTO[]; nextCursor?: string }> {
    const { filter, limit, cursor } = params;
    const start = Date.now();
    const query: Record<string, unknown> = {};
    if (filter?.kind) query.kind = filter.kind;
    if (filter?.tags?.length) query.tags = { $in: filter.tags } as { $in: string[] };
    if (filter?.search)
      query.title = { $regex: filter.search, $options: 'i' } as {
        $regex: string;
        $options: string;
      };
    if (cursor) query._id = { $gt: new Types.ObjectId(cursor) };
    const items = await Project.find(query).limit(limit).lean<ProjectDTO[]>();
    const nextCursor =
      items.length === limit
        ? String((items[items.length - 1] as unknown as { _id: Types.ObjectId })._id)
        : undefined;
    log.info(
      {
        op: 'list',
        model: 'Project',
        filter,
        limit,
        cursor,
        count: items.length,
        nextCursor: Boolean(nextCursor),
        durationMs: Date.now() - start,
      },
      'projects list',
    );
    return { items, nextCursor };
  }

  async getById(id: string): Promise<ProjectDTO | null> {
    const start = Date.now();
    const result = await Project.findById(id).lean<ProjectDTO | null>();
    log.info(
      { op: 'getById', id, found: Boolean(result), durationMs: Date.now() - start },
      'project getById',
    );
    return result;
  }

  async getBySlug(slug: string): Promise<ProjectDTO | null> {
    const start = Date.now();
    const result = await Project.findOne({ slug }).lean<ProjectDTO | null>();
    log.info(
      { op: 'getBySlug', slug, found: Boolean(result), durationMs: Date.now() - start },
      'project getBySlug',
    );
    return result;
  }

  async create(data: Omit<ProjectDTO, '_id' | 'createdAt' | 'updatedAt'>): Promise<ProjectDTO> {
    const start = Date.now();
    const exists = await Project.findOne({ slug: data.slug }).lean();
    if (exists) {
      log.warn({ op: 'create', slug: data.slug }, 'project slug already exists');
      throw new Error('slug already exists');
    }
    const doc = await Project.create(data);
    const result = doc.toObject() as ProjectDTO;
    log.info(
      {
        op: 'create',
        id: String((doc as unknown as { _id: Types.ObjectId })._id),
        slug: data.slug,
        durationMs: Date.now() - start,
      },
      'project created',
    );
    return result;
  }

  async updateById(id: string, data: Partial<ProjectDTO>): Promise<ProjectDTO | null> {
    const start = Date.now();
    const updated = await Project.findByIdAndUpdate(id, data, {
      new: true,
    }).lean<ProjectDTO | null>();
    log.info(
      { op: 'updateById', id, updated: Boolean(updated), durationMs: Date.now() - start },
      'project updated',
    );
    return updated;
  }

  async deleteById(id: string): Promise<void> {
    const start = Date.now();
    await Project.findByIdAndDelete(id);
    log.info({ op: 'deleteById', id, durationMs: Date.now() - start }, 'project deleted');
  }
}
