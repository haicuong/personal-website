import { useEffect, useState } from "react";
import { formatLocalizedDate, parseDate } from "../scripts/date-format";

export interface FormattedDateProps {
  date?: string;
  fallback?: string;
  className?: string;
}

export function FormattedDate({
  date,
  fallback = "Date not found",
  className,
}: FormattedDateProps) {
  const trimmed = date?.trim();
  const isValid = Boolean(trimmed && parseDate(trimmed));
  // Deterministic initial label for SSR and initial hydration pass
  const initialText = isValid && trimmed ? trimmed : fallback;
  const [displayText, setDisplayText] = useState(initialText);

  useEffect(() => {
    if (!trimmed || !isValid) {
      setDisplayText(fallback);
      return;
    }

    const localized = formatLocalizedDate(trimmed, undefined, fallback);
    setDisplayText(localized);
  }, [trimmed, isValid, fallback]);

  if (!trimmed || !isValid) {
    return <span className={className}>{fallback}</span>;
  }

  return (
    <time dateTime={trimmed} className={className}>
      {displayText}
    </time>
  );
}

