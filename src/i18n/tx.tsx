import { T } from "./client";

/**
 * For shared components: translates a prop when it is a plain English string
 * and leaves anything else (already-translated JSX, numbers) untouched.
 * Translating an already-Hindi string is a no-op, so double use is safe.
 */
export function tx(node: React.ReactNode): React.ReactNode {
  return typeof node === "string" ? <T>{node}</T> : node;
}
