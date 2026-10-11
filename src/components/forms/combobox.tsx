"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

export interface ComboOption {
  value: string;
  /** Secondary text, e.g. a PIN code. */
  hint?: string;
}

const MAX_SHOWN = 60;

/** Lowercase, strip accents and punctuation so "mahe" finds "Mahé". */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Searchable single-select that also accepts a typed value when nothing
 * matches ("My town isn't listed"). Follows the ARIA 1.2 combobox pattern.
 */
export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
  allowCustom = true,
  emptyText = "No matches",
  invalid,
  describedBy,
  onBlur,
}: {
  id: string;
  value: string;
  onChange: (value: string, option?: ComboOption) => void;
  options: ComboOption[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  allowCustom?: boolean;
  emptyText?: string;
  invalid?: boolean;
  describedBy?: string;
  onBlur?: () => void;
}) {
  const t = useT();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const text = query ?? value;

  const matches = useMemo(() => {
    const q = fold(query ?? "");
    if (!q) return options.slice(0, MAX_SHOWN);
    const starts: ComboOption[] = [];
    const contains: ComboOption[] = [];
    for (const o of options) {
      const f = fold(o.value);
      if (f.startsWith(q)) starts.push(o);
      else if (f.includes(q)) contains.push(o);
      if (starts.length >= MAX_SHOWN) break;
    }
    return [...starts, ...contains].slice(0, MAX_SHOWN);
  }, [options, query]);

  const typed = (query ?? "").trim();
  const exact = matches.some((o) => fold(o.value) === fold(typed));
  const showCustom = allowCustom && typed.length >= 2 && !exact;
  const rows = showCustom ? matches.length + 1 : matches.length;

  function choose(index: number) {
    if (index < matches.length) onChange(matches[index].value, matches[index]);
    else if (showCustom) onChange(typed);
    setQuery(null);
    setOpen(false);
  }

  function move(delta: number) {
    if (!open) setOpen(true);
    const next = rows ? (active + delta + rows) % rows : 0;
    setActive(next);
    listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && rows ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder ? t(placeholder) : placeholder}
        value={text}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => {
          // Keep what was typed even if no option was picked.
          if (allowCustom && query !== null && typed !== value) onChange(typed);
          setQuery(null);
          setOpen(false);
          onBlur?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter" && open && rows) {
            e.preventDefault();
            choose(active);
          } else if (e.key === "Escape") {
            setQuery(null);
            setOpen(false);
          }
        }}
        className={cn(
          "h-11 w-full rounded-xl border border-input bg-white pr-9 pl-9 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive md:text-sm",
        )}
      />
      {loading ? (
        <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
      ) : (
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      )}
      {open && !disabled ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-white p-1 shadow-lg"
        >
          {matches.map((o, i) => (
            <li
              key={`${o.value}-${o.hint ?? ""}`}
              id={`${listId}-${i}`}
              data-index={i}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
                i === active && "bg-accent",
              )}
            >
              <span className="flex items-center gap-2">
                {o.value === value ? <Check className="size-4 text-primary" aria-hidden="true" /> : <span className="size-4" />}
                {o.value}
              </span>
              {o.hint ? <span className="text-xs text-muted-foreground">{o.hint}</span> : null}
            </li>
          ))}
          {showCustom ? (
            <li
              id={`${listId}-${matches.length}`}
              data-index={matches.length}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(matches.length)}
              onMouseEnter={() => setActive(matches.length)}
              className={cn("flex min-h-10 cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-semibold text-primary", active === matches.length && "bg-accent")}
            >
              {t("Use “{value}”", { value: typed })}
            </li>
          ) : null}
          {!rows ? <li className="px-3 py-2 text-sm text-muted-foreground">{loading ? t("Loading…") : t(emptyText)}</li> : null}
        </ul>
      ) : null}
    </div>
  );
}
