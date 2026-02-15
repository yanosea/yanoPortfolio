/**
 * Localized date  component
 */

/**
 * Formatted date with localization
 * @param date - Date
 * @param locale - Locale for formatting (default: "ja-JP")
 * @param className - Additional CSS classes
 */
export default function LocalizedDate({
  date,
  locale = "ja-JP",
  className = "",
}: {
  date: Date;
  locale?: string;
  className?: string;
}) {
  const dateObj = new Date(date);
  const isoDate = dateObj.toISOString().split("T")[0];
  const formattedDate = dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    // formatted date
    <time
      className={`text-muted text-sm ${className}`}
      dateTime={isoDate}
    >
      {formattedDate}
    </time>
  );
}
