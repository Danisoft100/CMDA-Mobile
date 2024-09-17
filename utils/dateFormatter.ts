/**
 * Formats a date string into dd-mm-yyyy ( mm is month's short name e.g. Jan, Feb) and short month plus date.
 * @param dateString - The date in string to convert.
 * @returns An object with date (e.g. 01-Jan-2000), monthDate (e.g. Jan 20), time (e.g. 12:34 PM),
 *                    and other properties such as year, monthShort, day, hours, minutes, am/pm.
 */
export function formatDate(dateString: string): {
  date: string;
  monthDate: string;
  year: number;
  monthShort: string;
  day: number;
  time: string;
  hours: number;
  minutes: number;
  ampm: "am" | "pm";
} {
  const date = new Date(dateString);

  const day = date.toLocaleString("en-US", { day: "2-digit" });
  const monthShort = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm: "am" | "pm" = hours > 12 ? "pm" : "am";

  return {
    date: dateString ? `${day}-${monthShort}-${year}` : "--/--/----",
    monthDate: `${monthShort} ${parseInt(day)}`,
    year,
    monthShort,
    day: parseInt(day),
    time,
    hours,
    minutes,
    ampm,
  };
}

/**

 */

export function fromNow(
  date: Date | number,
  nowDate: Date | number = Date.now(),
  rftOptions: any = { numeric: "auto" }
) {
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  const intervals: any = [
    { ge: YEAR, divisor: YEAR, unit: "year" },
    { ge: MONTH, divisor: MONTH, unit: "month" },
    { ge: WEEK, divisor: WEEK, unit: "week" },
    { ge: DAY, divisor: DAY, unit: "day" },
    { ge: HOUR, divisor: HOUR, unit: "hour" },
    { ge: MINUTE, divisor: MINUTE, unit: "minute" },
    { ge: 30 * SECOND, divisor: SECOND, unit: "second" },
    { ge: 0, divisor: 1, text: "just now" },
  ];

  let rtf: Intl.RelativeTimeFormat | undefined;
  if (typeof Intl !== "undefined" && Intl.RelativeTimeFormat) {
    rtf = new Intl.RelativeTimeFormat(undefined, rftOptions);
  }

  const now = typeof nowDate === "object" ? (nowDate as Date).getTime() : new Date(nowDate).getTime();
  const diff = now - (typeof date === "object" ? (date as Date).getTime() : new Date(date).getTime());
  const diffAbs = Math.abs(diff);

  for (const interval of intervals) {
    if (diffAbs >= interval.ge) {
      const x = Math.round(diffAbs / interval.divisor);
      const isFuture = diff < 0;
      return interval.unit
        ? rtf
          ? rtf.format(isFuture ? x : -x, interval.unit)
          : `${x} ${interval.unit}${x > 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`
        : interval.text;
    }
  }
}
