"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { LOCALE_KEY } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/language-provider";

type IntroMotionContextValue = {
  /** True once language is chosen (or was saved from a prior visit). */
  introReady: boolean;
  /** Increments to replay homepage entrance animations. */
  cycle: number;
  markIntroReady: () => void;
  bumpReplay: () => void;
};

const IntroMotionContext = createContext<IntroMotionContextValue | null>(null);

export function IntroMotionProvider({ children }: { children: ReactNode }) {
  const [introReady, setIntroReady] = useState(false);
  const [cycle, setCycle] = useState(0);

  const markIntroReady = useCallback(() => setIntroReady(true), []);
  const bumpReplay = useCallback(() => setCycle((c) => c + 1), []);

  return (
    <IntroMotionContext.Provider
      value={{ introReady, cycle, markIntroReady, bumpReplay }}
    >
      {children}
    </IntroMotionContext.Provider>
  );
}

/** Enables intro when locale already exists; replays motion when navigating back to `/`. */
export function IntroMotionController() {
  const pathname = usePathname();
  const { mounted: localeReady } = useLanguage();
  const { introReady, markIntroReady, bumpReplay } = useIntroMotion();
  const wasOffHome = useRef(false);

  useEffect(() => {
    if (!localeReady) return;
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "en" || saved === "el") markIntroReady();
  }, [localeReady, markIntroReady]);

  useEffect(() => {
    if (pathname !== "/") {
      wasOffHome.current = true;
      return;
    }
    if (!introReady) return;
    if (wasOffHome.current) {
      wasOffHome.current = false;
      bumpReplay();
      return;
    }
    bumpReplay();
  }, [pathname, introReady, bumpReplay]);

  return null;
}

export function useIntroMotion() {
  const ctx = useContext(IntroMotionContext);
  if (!ctx) throw new Error("useIntroMotion must be used within IntroMotionProvider");
  return ctx;
}
