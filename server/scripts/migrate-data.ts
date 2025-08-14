/**
 * Basic data migration script from a JSON dump to MongoDB (Projects/Assets).
 * Usage:
 *   node dist/scripts/migrate-data.js /path/to/dump.json
 */
import fs from 'fs';
import path from 'path';
import { connectMongoose } from '../src/infra/mongoose';
import { Project } from '../src/models/Project';
import { Asset } from '../src/models/Asset';

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: migrate-data <dump.json>');
  const full = path.resolve(file);
  const raw = fs.readFileSync(full, 'utf8');
  interface ProjectImport {
    title: string;
    slug: string;
    kind: string;
    description?: string;
    techStack?: string[];
    tags?: string[];
    visibility?: string;
    status?: string;
    ownerId?: string;
    views?: number;
    likes?: number;
  }
  interface AssetImport {
    projectId: string;
    ownerId?: string;
    path: string;
    contentType: string;
    size: number;
  }
  const dump = JSON.parse(raw) as { projects?: ProjectImport[]; assets?: AssetImport[] };

  await connectMongoose(process.env.MONGODB_URI || '');

  if (dump.projects?.length) {
    for (const p of dump.projects) {
      const exists = await Project.findOne({ slug: p.slug }).lean();
      if (!exists) await Project.create(p);
    }
  }

  if (dump.assets?.length) {
    for (const a of dump.assets) {
      const exists = await Asset.findOne({ path: a.path }).lean();
      if (!exists) await Asset.create(a);
    }
  }

  // eslint-disable-next-line no-console
  console.log('Migration complete');
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
