import { Types } from 'mongoose';
import { Project } from '../../models/Project';
import type { ProjectDTO, ProjectsRepo } from '../interfaces';

export class MongoProjectsRepo implements ProjectsRepo {
  async ensureIndexes(): Promise<void> {
    await Project.syncIndexes();
  }

  async list(params: {
    filter?: Partial<ProjectDTO> & { search?: string; tags?: string[] };
    limit: number;
    cursor?: string;
  }): Promise<{ items: ProjectDTO[]; nextCursor?: string }> {
    const { filter, limit, cursor } = params;
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
    return { items, nextCursor };
  }

  async getById(id: string): Promise<ProjectDTO | null> {
    return Project.findById(id).lean<ProjectDTO | null>();
  }

  async getBySlug(slug: string): Promise<ProjectDTO | null> {
    return Project.findOne({ slug }).lean<ProjectDTO | null>();
  }

  async create(data: Omit<ProjectDTO, '_id' | 'createdAt' | 'updatedAt'>): Promise<ProjectDTO> {
    const exists = await Project.findOne({ slug: data.slug }).lean();
    if (exists) throw new Error('slug already exists');
    const doc = await Project.create(data);
    return doc.toObject() as ProjectDTO;
  }

  async updateById(id: string, data: Partial<ProjectDTO>): Promise<ProjectDTO | null> {
    return Project.findByIdAndUpdate(id, data, { new: true }).lean<ProjectDTO | null>();
  }

  async deleteById(id: string): Promise<void> {
    await Project.findByIdAndDelete(id);
  }
}
