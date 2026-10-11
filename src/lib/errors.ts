/**
 * Converts database/API errors into messages that are safe to show users.
 *
 * Messages raised deliberately by Rakt Response database functions are
 * written for end users and passed through. Anything else (constraint names,
 * table names, internal details) is replaced with a generic message so that
 * internals and personal data never leak into the UI.
 */
export interface DbErrorLike {
  code?: string | null;
  message?: string | null;
}

const GENERIC = "Something went wrong. Please try again in a moment.";
const PASS_THROUGH_CODES = new Set(["42501", "22023", "P0002", "RR429", "23505"]);
const INTERNAL_PATTERNS = [
  /permission denied/i,
  /violates/i,
  /relation .* does not exist/i,
  /column .* does not exist/i,
  /function .* does not exist/i,
  /syntax error/i,
  /invalid input syntax/i,
  /JWT/i,
  /duplicate key/i,
];

export function friendlyDbError(error: DbErrorLike | null | undefined, fallback = GENERIC): string {
  if (!error) return fallback;
  const code = error.code ?? "";
  const message = (error.message ?? "").trim();
  if (code === "23505" && /duplicate key/i.test(message)) {
    return "This looks like a duplicate of something you already added.";
  }
  if (code === "23514") return "Some of the details are not valid. Please check the form and try again.";
  if (code === "42501" && /permission denied/i.test(message)) return "You do not have permission to do that.";
  if (PASS_THROUGH_CODES.has(code) && message && !INTERNAL_PATTERNS.some((p) => p.test(message))) {
    return message.length > 300 ? fallback : message;
  }
  return fallback;
}

export function isRateLimited(error: DbErrorLike | null | undefined): boolean {
  return error?.code === "RR429";
}
