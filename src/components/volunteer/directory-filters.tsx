"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { selectClass } from "@/components/common/form-parts";
import { ApproxLocation } from "@/components/map/approx-location";
import { LocationFields } from "@/components/forms/location-pickers";
import { BLOOD_GROUPS, DONATION_TYPE_LABELS, type DonationType } from "@/lib/constants";
import type { LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

const FILTER_KEYS = ["groups", "state", "district", "city", "locality", "pincode", "type", "verified", "open", "active", "sort", "lat", "lng", "radius"] as const;

export function DirectoryFilters({ facets }: { facets: Record<string, number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [groups, setGroups] = useState<string[]>((searchParams.get("groups") ?? "").split(",").filter(Boolean));
  const [point, setPoint] = useState<LatLng | null>(
    searchParams.get("lat") && searchParams.get("lng") ? { lat: Number(searchParams.get("lat")), lng: Number(searchParams.get("lng")) } : null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);
  const t = useT();

  function navigate(next: URLSearchParams) {
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  // Debounced free-text search.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      if ((searchParams.get("q") ?? "") !== query.trim()) navigate(next);
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    const request = searchParams.get("request");
    if (request) next.set("request", request);
    if (query.trim()) next.set("q", query.trim());
    if (groups.length) next.set("groups", groups.join(","));
    for (const key of FILTER_KEYS) {
      if (key === "groups" || key === "lat" || key === "lng") continue;
      const value = String(data.get(key) ?? "").trim();
      if (value) next.set(key, value);
    }
    if (point) {
      next.set("lat", String(point.lat));
      next.set("lng", String(point.lng));
    }
    setOpen(false);
    navigate(next);
  }

  function reset() {
    const next = new URLSearchParams();
    const request = searchParams.get("request");
    if (request) next.set("request", request);
    setGroups([]);
    setQuery("");
    setPoint(null);
    formRef.current?.reset();
    setOpen(false);
    navigate(next);
  }

  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k) && k !== "lng" && k !== "sort").length;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          aria-label={t("Search by name, city, locality or PIN")}
          placeholder={t("Name, city, locality or PIN")}
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {pending ? <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-label={t("Loading results")} /> : null}
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="shrink-0 bg-white">
            <SlidersHorizontal className="size-4" aria-hidden="true" /> {t("Filters")}{activeCount ? ` (${activeCount})` : ""}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl sm:mx-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold">{t("Filter donors")}</SheetTitle>
            <SheetDescription>{t("Search by blood group, area and availability. Contact details never appear here.")}</SheetDescription>
          </SheetHeader>
          <form ref={formRef} id="directory-filters" onSubmit={apply} className="space-y-4 px-4">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-navy">{t("Blood groups")}</legend>
              <div className="grid grid-cols-3 gap-2">
                {BLOOD_GROUPS.map((g) => {
                  const selected = groups.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setGroups((prev) => (selected ? prev.filter((x) => x !== g) : [...prev, g]))}
                      className={cn(
                        "flex h-12 flex-col items-center justify-center rounded-xl border-2 text-sm font-extrabold",
                        selected ? "border-primary bg-primary text-white" : "bg-white text-primary",
                      )}
                    >
                      {g}
                      <span className={cn("text-[11px] font-medium", selected ? "text-white/85" : "text-muted-foreground")}>{facets[g] ?? 0}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {/* Re-mounts when the URL filters change, so "Clear" empties it too. */}
            <LocationFields
              key={searchParams.toString()}
              idPrefix="filter-"
              emptyStateLabel="Any"
              labels={{ state: "State", city: "City / town" }}
              names={{ state: "state", district: "district", city: "city" }}
              defaults={{ state: searchParams.get("state") ?? "", district: searchParams.get("district") ?? "", city: searchParams.get("city") ?? "" }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold text-navy">
                {t("Locality contains")}
                <Input name="locality" defaultValue={searchParams.get("locality") ?? ""} />
              </label>
              <label className="space-y-1 text-sm font-semibold text-navy">
                {t("PIN code")}
                <Input name="pincode" inputMode="numeric" maxLength={6} defaultValue={searchParams.get("pincode") ?? ""} />
              </label>
              <label className="space-y-1 text-sm font-semibold text-navy">
                {t("Donation history")}
                <select name="type" defaultValue={searchParams.get("type") ?? ""} className={selectClass}>
                  <option value="">{t("Any")}</option>
                  {(["whole_blood", "sdp", "other_apheresis"] as DonationType[]).map((dt) => (
                    <option key={dt} value={dt}>
                      {t(`Has ${DONATION_TYPE_LABELS[dt].toLowerCase()} history`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm font-semibold text-navy">
                {t("Active recently")}
                <select name="active" defaultValue={searchParams.get("active") ?? ""} className={selectClass}>
                  <option value="">{t("Any time")}</option>
                  <option value="30">{t("Last 30 days")}</option>
                  <option value="90">{t("Last 3 months")}</option>
                  <option value="365">{t("Last year")}</option>
                </select>
              </label>
              <label className="space-y-1 text-sm font-semibold text-navy">
                {t("Sort by")}
                <select name="sort" defaultValue={searchParams.get("sort") ?? "relevance"} className={selectClass}>
                  <option value="relevance">{t("Relevance")}</option>
                  <option value="locality">{t("Locality")}</option>
                  <option value="recent">{t("Recently active")}</option>
                  <option value="distance">{t("Distance (needs a point)")}</option>
                </select>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                <input type="checkbox" name="verified" value="1" defaultChecked={searchParams.get("verified") === "1"} className="size-5 accent-primary" />
                {t("Verified donors only")}
              </label>
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                <input type="checkbox" name="open" value="1" defaultChecked={searchParams.get("open") === "1"} className="size-5 accent-primary" />
                {t("Currently open to contact")}
              </label>
            </div>
            <div className="space-y-2">
              <label className="space-y-1 text-sm font-semibold text-navy">
                {t("Within distance (approximate locations only)")}
                <select name="radius" defaultValue={searchParams.get("radius") ?? ""} className={selectClass}>
                  <option value="">{t("No distance filter")}</option>
                  {[5, 10, 25, 50].map((km) => (
                    <option key={km} value={km}>
                      {km} km
                    </option>
                  ))}
                </select>
              </label>
              <ApproxLocation value={point} onChange={setPoint} />
            </div>
          </form>
          <SheetFooter className="flex-row gap-2 border-t">
            <Button type="button" variant="ghost" onClick={reset} className="flex-1">
              <X className="size-4" aria-hidden="true" /> {t("Reset")}
            </Button>
            <Button type="submit" form="directory-filters" className="flex-1">
              {t("Show donors")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
