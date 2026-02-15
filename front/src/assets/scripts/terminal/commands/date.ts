/**
 * Date Command
 */

// types
import type { Command } from "@/types/terminal.ts";

/**
 * Date command options
 */
interface DateOptions {
  /** Use UTC timezone */
  utc: boolean;
  /** Output in ISO 8601 format */
  iso8601: boolean;
  /** Custom format string */
  format: string | null;
}

/**
 * Parse command line options
 * @param args - Command line arguments
 * @returns Parsed date options
 */
function parseDateArgs(args: string[]): DateOptions {
  const options: DateOptions = {
    utc: false,
    iso8601: false,
    format: null,
  };
  args.forEach((arg) => {
    if (arg === "-u" || arg === "--utc") {
      options.utc = true;
    } else if (arg === "-I" || arg === "--iso-8601") {
      options.iso8601 = true;
    } else if (arg.startsWith("+")) {
      options.format = arg.slice(1);
    }
  });
  return options;
}

/**
 * Format date according to custom format string
 * @param date - Date to format
 * @param format - Format string
 * @param utc - Whether to use UTC time
 * @returns Formatted date string
 */
function formatCustomDate(date: Date, format: string, utc: boolean): string {
  const pad = (n: number, width: number = 2) => String(n).padStart(width, "0");
  const get = utc
    ? {
      Y: date.getUTCFullYear(),
      m: pad(date.getUTCMonth() + 1),
      d: pad(date.getUTCDate()),
      H: pad(date.getUTCHours()),
      M: pad(date.getUTCMinutes()),
      S: pad(date.getUTCSeconds()),
      a: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()],
      A: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][date.getUTCDay()],
      b: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][date.getUTCMonth()],
      B: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ][date.getUTCMonth()],
    }
    : {
      Y: date.getFullYear(),
      m: pad(date.getMonth() + 1),
      d: pad(date.getDate()),
      H: pad(date.getHours()),
      M: pad(date.getMinutes()),
      S: pad(date.getSeconds()),
      a: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
      A: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][date.getDay()],
      b: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][date.getMonth()],
      B: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ][date.getMonth()],
    };
  return format
    .replace(/%Y/g, String(get.Y))
    .replace(/%m/g, get.m)
    .replace(/%d/g, get.d)
    .replace(/%H/g, get.H)
    .replace(/%M/g, get.M)
    .replace(/%S/g, get.S)
    .replace(/%a/g, get.a)
    .replace(/%A/g, get.A)
    .replace(/%b/g, get.b)
    .replace(/%B/g, get.B)
    .replace(/%T/g, `${get.H}:${get.M}:${get.S}`)
    .replace(/%F/g, `${get.Y}-${get.m}-${get.d}`)
    .replace(/%%/g, "%");
}

/**
 * Date Command
 */
export const date: Command = {
  name: "date",
  description: "Show current date and time",
  execute: (args: string[] = []) => {
    const options = parseDateArgs(args);
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    // handle custom format
    if (options.format) {
      return formatCustomDate(now, options.format, options.utc);
    }
    // handle ISO 8601 format
    if (options.iso8601) {
      if (options.utc) {
        return now.toISOString().split("T")[0];
      } else {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }
    // default Unix date format
    if (options.utc) {
      const dayName = days[now.getUTCDay()];
      const monthName = months[now.getUTCMonth()];
      const date = now.getUTCDate();
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      const year = now.getUTCFullYear();
      return `${dayName} ${monthName} ${date} ${hours}:${minutes}:${seconds} UTC ${year}`;
    }
    // get user's timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // timezone abbreviation mapping for major zones
    const tzMap: Record<string, string> = {
      "Asia/Tokyo": "JST",
      "America/New_York": "EST",
      "America/Chicago": "CST",
      "America/Denver": "MST",
      "America/Los_Angeles": "PST",
      "Europe/London": "GMT",
      "Europe/Paris": "CET",
      "Australia/Sydney": "AEDT",
      "Asia/Shanghai": "CST",
      "Asia/Hong_Kong": "HKT",
      "Asia/Singapore": "SGT",
      "Asia/Seoul": "KST",
    };
    // try to get abbreviation from map, fallback to formatToParts
    let tzAbbr = tzMap[timeZone];
    if (!tzAbbr) {
      tzAbbr = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "short",
      }).formatToParts(now).find((part) => part.type === "timeZoneName")
        ?.value || "UTC";
    }
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const year = now.getFullYear();
    return `${dayName} ${monthName} ${date} ${hours}:${minutes}:${seconds} ${tzAbbr} ${year}`;
  },
};
