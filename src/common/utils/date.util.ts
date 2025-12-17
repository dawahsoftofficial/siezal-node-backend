import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";
import * as duration from "dayjs/plugin/duration";
import * as relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);

const TIME_ZONE = process.env.TZ || "Asia/Karachi";
const TIME_FORMAT = "DD/MM/YYYY hh:mm:ss A";

export const now = (timeZone = TIME_ZONE) => dayjs().tz(timeZone);

export const convertToPakistanTime = (
  value: Date | string | null
): Date | string | null => {
  if (!value) return null;

  const tz = dayjs(value).tz(TIME_ZONE);
  if (typeof value === "string") {
    return tz.format("YYYY-MM-DD HH:mm:ss"); // or your preferred string format
  }
  return tz.toDate();
  // fallback
};

export const convertToTimeZone = (
  date: string | Date,
  timeZone = TIME_ZONE
): Date => dayjs(date).tz(timeZone).toDate();

/**
 * Format a date in a specific formaDate t
 */
export const formatDate = (
  date: string | Date,
  formatStr = TIME_FORMAT,
  timeZone = TIME_ZONE
) => dayjs(date).tz(timeZone).format(formatStr);

/**
 * Add or subtract time from a date
 */
export const addTime = (
  date: string | Date,
  value: number,
  unit: dayjs.ManipulateType,
  timeZone = TIME_ZONE
) => dayjs(date).tz(timeZone).add(value, unit);
export const subtractTime = (
  date: string | Date,
  value: number,
  unit: dayjs.ManipulateType,
  timeZone = TIME_ZONE
) => dayjs(date).tz(timeZone).subtract(value, unit);

/**
 * Get the difference between two dates
 */
export const timeDiff = (
  date1: string | Date,
  date2: string | Date,
  unit: dayjs.QUnitType = "seconds"
) => dayjs(date1).diff(dayjs(date2), unit);

/**
 * Get relative time (like Carbon's diffForHumans)
 */
export const timeAgo = (date: string | Date, timeZone = TIME_ZONE) =>
  dayjs(date).tz(timeZone).fromNow();

export const currentDateTime = () =>
  dayjs(new Date()).tz(TIME_ZONE).format(TIME_FORMAT);

export const isNotAfterNow = (
  timestamp: string | Date,
  timeZone = TIME_ZONE
): boolean => {
  const now = dayjs().tz(timeZone);
  const inputTime = dayjs(timestamp).tz(timeZone);
  return inputTime.isSame(now) || inputTime.isBefore(now);
};

export const addMinuteToNow = (value: number, timeZone = TIME_ZONE): Date => {
  const now = dayjs().tz(timeZone);
  return now.add(value, "minute").toDate();
};

export const calculateExpiry = (expiresIn: string): Date => {
  const match = expiresIn.match(/^(\d+)([smhd])$/); // s = seconds, m = minutes, h = hours, d = days
  if (!match) {
    throw new Error("Invalid expiresIn format. Use like '60m', '7d', etc.");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  // Map JWT format to dayjs units
  const unitMap: Record<string, dayjs.ManipulateType> = {
    s: "second",
    m: "minute",
    h: "hour",
    d: "day",
  };

  return dayjs().add(value, unitMap[unit]).toDate(); // returns JS Date (MySQL driver maps it to DATETIME/TIMESTAMP)
};
