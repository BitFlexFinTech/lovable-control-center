import { useState, useEffect } from 'react';

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export const formatTimeAgo = (date: Date | string | number): string => {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 0) {
    return 'just now';
  }

  if (seconds < MINUTE) {
    return seconds <= 5 ? 'just now' : `${seconds}s ago`;
  }

  if (seconds < HOUR) {
    const minutes = Math.floor(seconds / MINUTE);
    return `${minutes}m ago`;
  }

  if (seconds < DAY) {
    const hours = Math.floor(seconds / HOUR);
    return `${hours}h ago`;
  }

  if (seconds < WEEK) {
    const days = Math.floor(seconds / DAY);
    return days === 1 ? 'yesterday' : `${days}d ago`;
  }

  if (seconds < MONTH) {
    const weeks = Math.floor(seconds / WEEK);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  if (seconds < YEAR) {
    const months = Math.floor(seconds / MONTH);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(seconds / YEAR);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

export const useTimeAgo = (date: Date | string | number, updateInterval = 60000): string => {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(date));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [date, updateInterval]);

  return timeAgo;
};
