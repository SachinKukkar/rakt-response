import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb, type Db } from "./harness";

/*
 * Static contract check between the app's Supabase queries and the migrated
 * schema: every table, selected column, filter column and RPC argument used in
 * src/ must exist. Catches typos that would otherwise only fail at runtime.
 */

const SRC = path.resolve(__dirname, "../../src");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const sources = files(SRC).map((file) => ({ file: path.relative(SRC, file), text: readFileSync(file, "utf8") }));

let db: Db;
const columns = new Map<string, Set<string>>();
const functions = new Map<string, { args: string[]; required: number }>();

beforeAll(async () => {
  db = await createTestDb();
  const cols = await db.query<{ table_name: string; column_name: string }>(
    "select table_name, column_name from information_schema.columns where table_schema = 'public'",
  );
  for (const row of cols.rows) {
    if (!columns.has(row.table_name)) columns.set(row.table_name, new Set());
    columns.get(row.table_name)!.add(row.column_name);
  }
  const fns = await db.query<{ proname: string; args: string[] | null; nargs: number; ndefaults: number }>(
    `select p.proname, p.proargnames as args, p.pronargs as nargs, p.pronargdefaults as ndefaults
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'`,
  );
  for (const row of fns.rows) {
    functions.set(row.proname, { args: (row.args ?? []).slice(0, row.nargs), required: row.nargs - row.ndefaults });
  }
});

afterAll(async () => {
  await db.close();
});

/** Splits a PostgREST select list at top-level commas. */
function splitSelect(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of list) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(current.trim());
      current = "";
    } else current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function checkSelect(table: string, list: string, where: string, problems: string[]) {
  const known = columns.get(table);
  if (!known) {
    problems.push(`${where}: unknown table ${table}`);
    return;
  }
  for (const item of splitSelect(list)) {
    if (item === "*") continue;
    const embed = /^(\w+)\((.*)\)$/s.exec(item);
    if (embed) {
      checkSelect(embed[1], embed[2], where, problems);
      continue;
    }
    const name = item.split(":").pop()!.trim();
    if (!known.has(name)) problems.push(`${where}: ${table}.${name} does not exist`);
  }
}

describe("app queries match the database schema", () => {
  it("tables, selected columns and filter columns exist", () => {
    const problems: string[] = [];
    let checked = 0;
    for (const { file, text } of sources) {
      const chainRe = /\.from\("(\w+)"\)([\s\S]*?)(?=;|\n\s*\n|\.from\(")/g;
      for (const match of text.matchAll(chainRe)) {
        const [, table, chain] = match;
        if (file.includes("storage") || /\.storage\s*$/.test(text.slice(Math.max(0, match.index! - 40), match.index!))) continue;
        const line = text.slice(0, match.index).split("\n").length;
        const where = `${file}:${line}`;
        if (!columns.has(table)) {
          // storage buckets use .from() too
          if (["story-uploads", "story-public", "profile-photos"].includes(table)) continue;
          problems.push(`${where}: unknown table ${table}`);
          continue;
        }
        checked++;
        const select = /\.select\(\s*"([^"]+)"/.exec(chain);
        if (select) checkSelect(table, select[1], where, problems);
        for (const filter of chain.matchAll(/\.(?:eq|neq|in|is|not|ilike|like|lt|lte|gt|gte|order)\(\s*"(\w+)"/g)) {
          if (!columns.get(table)!.has(filter[1])) problems.push(`${where}: filter column ${table}.${filter[1]} does not exist`);
        }
        for (const write of chain.matchAll(/\.(?:update|insert|upsert)\(\s*\{([^}]*)\}/g)) {
          for (const key of write[1].matchAll(/(?:^|[,{\s])(\w+)\s*:/g)) {
            if (!columns.get(table)!.has(key[1])) problems.push(`${where}: write column ${table}.${key[1]} does not exist`);
          }
        }
      }
    }
    expect(problems).toEqual([]);
    expect(checked).toBeGreaterThan(60);
  });

  it("every rpc() call names an existing function with valid arguments", () => {
    const problems: string[] = [];
    let checked = 0;
    for (const { file, text } of sources) {
      for (const match of text.matchAll(/\.rpc\(\s*"(\w+)"\s*(?:,\s*\{([\s\S]*?)\}\s*)?\)/g)) {
        const [, name, body = ""] = match;
        const line = text.slice(0, match.index).split("\n").length;
        checked++;
        const fn = functions.get(name);
        if (!fn) {
          problems.push(`${file}:${line}: function ${name} does not exist`);
          continue;
        }
        const keys = [...body.matchAll(/\b(p_\w+)\s*:/g)].map((m) => m[1]);
        const spread = /\.\.\.\w+/.test(body);
        for (const key of keys) if (!fn.args.includes(key)) problems.push(`${file}:${line}: ${name} has no argument ${key}`);
        if (!spread) {
          const missing = fn.args.slice(0, fn.required).filter((a) => !keys.includes(a));
          if (missing.length) problems.push(`${file}:${line}: ${name} missing required ${missing.join(", ")}`);
        }
      }
    }
    expect(problems).toEqual([]);
    expect(checked).toBeGreaterThan(40);
  });
});
