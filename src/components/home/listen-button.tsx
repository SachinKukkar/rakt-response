"use client";

import { useEffect, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { useLocale, useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

const VOICE_LANG = { en: "en-IN", hi: "hi-IN" } as const;

/**
 * Reads the given text aloud with the device's own voice (Web Speech API), so
 * people who find reading hard can still follow the page. Free, offline-capable,
 * nothing leaves the phone. Hidden where the browser has no voice for the language.
 */
export function ListenButton({ text, className }: { text: string; className?: string }) {
  const t = useT();
  const locale = useLocale();
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const check = () => {
      const voices = window.speechSynthesis.getVoices();
      const lang = VOICE_LANG[locale];
      // Some phones list no voices until asked; allow English, require a Hindi voice for Hindi.
      setSupported(voices.length === 0 ? locale === "en" : voices.some((v) => v.lang.replace("_", "-").startsWith(lang.slice(0, 2))));
    };
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", check);
      window.speechSynthesis.cancel();
    };
  }, [locale]);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_LANG[locale];
    const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").startsWith(utterance.lang.slice(0, 2)));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className={cn(
        "bubble press inline-flex min-h-12 items-center gap-2 bg-muted px-5 text-[length:var(--step-body)] font-medium text-navy transition-[background-color] hover:bg-navy-soft",
        className,
      )}
    >
      {speaking ? <Square className="size-5" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}
      {speaking ? t("Stop") : t("Listen")}
    </button>
  );
}
