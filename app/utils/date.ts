import { format, formatISO } from 'date-fns';

export const secondToMillisecond = (second: number) => Math.floor(second * 1000);

export const isValidDate = (dateInstance: any) => dateInstance instanceof Date && !Number.isNaN(dateInstance.getTime());

export const convertDateStringToTimestamp = (dateString: string) => {
  if (typeof dateString === 'string') {
    const date = new Date(dateString);
    if (isValidDate(date)) {
      return date.getTime() / 1000;
    }
  }

  throw new Error('Invalid date string');
};

export const convertDateToTimestamp = (date: Date) => {
  if (!(date instanceof Date)) {
    throw new Error('Date must be an instance of Date');
  }
  return Math.floor(date.getTime() / 1000);
};

export const convertTimestampToDate = (timestamp: number) => {
  if (!Number.isFinite(timestamp)) {
    throw new Error('Timestamp must be a finite number');
  }
  return new Date(timestamp * 1000);
};

export const getIntlDatetimeFormat =
  (
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
  ) =>
  (locales = 'vi-VN') =>
    new Intl.DateTimeFormat(locales, options);

const viIntlDateTimeFormat = getIntlDatetimeFormat()('vi-VN');
export const displayTimestamp =
  (displayer = viIntlDateTimeFormat.format) =>
  (seconds: number) =>
    displayer(new Date(secondToMillisecond(seconds)));
export const displayTimestampInVNese = displayTimestamp();

export const toDateOnlyISOString = (date: Date) => formatISO(date, { representation: 'date' });

export const toTimeOnlyISOString = (date: Date) => formatISO(date, { representation: 'time' });

export const toDateTimeString = (date: Date) => format(date, 'HH:mm:ss dd/MM/yyyy');

// get the specific moment of 0:00:00 of the selected date:
// export const removeTime = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
export { startOfDay as removeTime } from 'date-fns';
