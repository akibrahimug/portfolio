import bunyan from 'bunyan';
import { Writable } from 'stream';
import config from '../config';

type BunyanRecord = {
  name: string;
  hostname: string;
  pid: number;
  level: number;
  time: string | Date;
  msg?: string;
  tag?: string;
  [key: string]: unknown;
};

const COLORS = {
  reset: '\u001b[0m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
  dim: '\u001b[2m',
} as const;

const TAG_COLOR: Record<string, string> = {
  SERVER: COLORS.cyan,
  HTTP: COLORS.blue,
  WS: COLORS.magenta,
  MONGODB: COLORS.cyan,
  'REPO:PROJECTS': COLORS.green,
  'REPO:ASSETS': COLORS.yellow,
};

function hhmmss(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function colorFor(tag: string | undefined, level: number): string {
  if (level >= 50) return COLORS.red;
  if (!tag) return COLORS.white;
  return TAG_COLOR[tag] || COLORS.white;
}

function stripRecord(rec: BunyanRecord): Record<string, unknown> {
  const omit = new Set(['name', 'hostname', 'pid', 'level', 'time', 'v', 'msg']);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (!omit.has(k)) out[k] = v as unknown;
  }
  return out;
}

function formatLine(rec: BunyanRecord): string {
  const date = new Date(rec.time);
  const level = rec.level;
  const tag = (rec.tag as string | undefined) || 'SERVER';
  const color = colorFor(tag, level);
  const tagStr = `${color}[${tag}]${COLORS.reset}`;
  const timeStr = hhmmss(date);
  const isError = level >= 50;
  const prefix = isError
    ? `${COLORS.red}ERROR ${COLORS.reset}${tagStr} ${timeStr}`
    : `${tagStr} ${timeStr}`;
  const msg = rec.msg || '';

  const details = stripRecord(rec);
  const hasDetails = Object.keys(details).length > 0;
  const detailStr = hasDetails ? ` ${COLORS.dim}${JSON.stringify(details)}${COLORS.reset}` : '';
  return `${prefix} ${msg}${detailStr}`;
}

export function coloredWrite(rec: unknown): void {
  try {
    const obj = typeof rec === 'string' ? (JSON.parse(rec) as BunyanRecord) : (rec as BunyanRecord);
    // eslint-disable-next-line no-console
    console.log(formatLine(obj));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(rec);
  }
}

function makeRawColoredStream(): NodeJS.WritableStream {
  return new Writable({
    objectMode: true,
    write(chunk, _enc, cb) {
      try {
        coloredWrite(chunk as unknown);
      } finally {
        cb();
      }
    },
  });
}

let baseLogger: bunyan | null = null;

export function getBaseLogger(): bunyan {
  if (baseLogger) return baseLogger;
  baseLogger = bunyan.createLogger({
    name: config.serviceName,
    level: 'info',
    streams: [{ level: 'info', type: 'raw', stream: makeRawColoredStream() }],
  });
  return baseLogger;
}

export function getTaggedLogger(tag: string): bunyan {
  return getBaseLogger().child({ tag });
}
