import { useEffect } from "react";

const SUFFIX = "F1 Wiki";

/** Sets `document.title` for the lifetime of the calling component. */
export function usePageTitle(title?: string | null): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
    return () => {
      document.title = SUFFIX;
    };
  }, [title]);
}
