import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as duration from 'dayjs/plugin/duration';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);

const TIME_ZONE = process.env.TZ;
const TIME_FORMAT = 'DD/MM/YYYY hh:mm:ss A';

export const now = (timeZone = TIME_ZONE) => dayjs().tz(timeZone);

/**
 * Format a date in a specific format
 */
export const formatDate = (
  date: string | Date,
  formatStr = TIME_FORMAT,
  timeZone = TIME_ZONE,
) => dayjs(date).tz(timeZone).format(formatStr);

/**
 * Add or subtract time from a date
 */
export const addTime = (
  date: string | Date,
  value: number,
  unit: dayjs.ManipulateType,
  timeZone = TIME_ZONE,
) => dayjs(date).tz(timeZone).add(value, unit);
export const subtractTime = (
  date: string | Date,
  value: number,
  unit: dayjs.ManipulateType,
  timeZone = TIME_ZONE,
) => dayjs(date).tz(timeZone).subtract(value, unit);

/**
 * Get the difference between two dates
 */
export const timeDiff = (
  date1: string | Date,
  date2: string | Date,
  unit: dayjs.QUnitType = 'seconds',
) => dayjs(date1).diff(dayjs(date2), unit);

/**
 * Get relative time (like Carbon's diffForHumans)
 */
export const timeAgo = (date: string | Date, timeZone = TIME_ZONE) =>
  dayjs(date).tz(timeZone).fromNow();

export const currentDateTime = () =>
  dayjs(new Date()).tz(TIME_ZONE).format(TIME_FORMAT);
