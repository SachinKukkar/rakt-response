"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface Stage {
  name: string;
  text: string;
  photo: string;
  alt: string;
}

// One hue, dark to light: the order of the stages is carried by colour.
const TONES = [
  { bg: "#0f2140", ink: "#ffffff" },
  { bg: "#152b50", ink: "#ffffff" },
  { bg: "#2b4670", ink: "#ffffff" },
  { bg: "#4f6891", ink: "#ffffff" },
  { bg: "#b9c6da", ink: "#152b50" },
];

/** Horizontal accordion on wide screens, stacked bars on phones. First stage open. */
export function HowItWorks({ stages }: { stages: Stage[] }) {
  const [open, setOpen] = useState(0);
  return (
    <ol className="flex flex-col gap-0 overflow-hidden md:h-[34rem] md:flex-row" aria-label={stages.map((s) => s.name).join(", ")}>
      {stages.map((stage, i) => {
        const tone = TONES[i % TONES.length];
        const isOpen = open === i;
        return (
          <li
            key={stage.name}
            className={cn(
              "relative flex min-w-0 flex-col transition-[flex-basis,flex-grow] duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none",
              isOpen ? "md:basis-[58%] md:grow-0" : "md:basis-0 md:grow",
            )}
            style={{ background: tone.bg, color: tone.ink }}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-expanded={isOpen}
              aria-controls={`stage-${i}`}
              className={cn(
                "press flex min-h-16 w-full items-center px-6 text-left text-[length:var(--step-body)] font-semibold md:h-full md:items-end md:justify-start md:px-5 md:pb-7",
                isOpen && "md:hidden",
              )}
            >
              {/* Slivers read upward on wide screens. */}
              <span className="md:rotate-180 md:whitespace-nowrap md:text-[length:var(--step-lead)] md:[writing-mode:vertical-rl]">{stage.name}</span>
            </button>
            <div
              id={`stage-${i}`}
              hidden={!isOpen}
              className="grid gap-6 px-6 pb-7 md:h-full md:grid-cols-2 md:gap-8 md:p-9"
            >
              <div className="flex flex-col justify-between gap-6">
                <h3 className="text-[length:var(--step-head)] leading-[1] font-semibold tracking-[-0.04em] text-inherit max-md:hidden">{stage.name}</h3>
                <p className="max-w-[36ch] text-[length:var(--step-body)] leading-[1.5] text-inherit">{stage.text}</p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden bubble md:aspect-auto md:h-full">
                <Image src={stage.photo} alt={stage.alt} fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover" />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
