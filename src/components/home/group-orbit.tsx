import { LogoMark } from "@/components/brand/logo";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { BLOOD_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The nine blood groups orbiting the logo mark. The ring turns slowly; each
 * drop turns the other way so its label stays upright. Decorative: the groups
 * are also listed in text next to it.
 */
export function GroupOrbit({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto grid size-[19rem] place-items-center sm:size-[25rem]", className)} aria-hidden="true">
      <div className="absolute inset-0 rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(226,69,63,0.22)_0%,rgba(18,4,7,0)_68%)]" />
      <div className="absolute inset-8 rounded-full border border-dashed border-white/15" />
      <div className="relative grid size-36 place-items-center rounded-full border border-white/10 bg-night/80 shadow-[0_0_80px_-10px_rgba(226,69,63,0.55)] backdrop-blur sm:size-44">
        <LogoMark size="lg" />
      </div>
      <div className="animate-orbit absolute inset-0 [--orbit-r:124px] sm:[--orbit-r:168px]">
        {BLOOD_GROUPS.map((group, i) => {
          const angle = (360 / BLOOD_GROUPS.length) * i;
          return (
            <div
              key={group}
              className="absolute top-1/2 left-1/2 -mt-6 -ml-6"
              style={{ transform: `rotate(${angle}deg) translateY(calc(var(--orbit-r) * -1)) rotate(${-angle}deg)` }}
            >
              <div className="animate-orbit-reverse">
                <BloodGroupChip group={group} size="md" tone={group === "Oh" ? "outline" : i % 2 ? "soft" : "solid"} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
