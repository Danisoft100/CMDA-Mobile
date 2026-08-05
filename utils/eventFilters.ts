export type EventDateFilter = "today" | "thisWeek" | "thisMonth" | "upcoming" | string;

export interface EventFilters {
  eventType?: string;
  membersGroup?: string;
  eventDate?: EventDateFilter;
}

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const buildEventDateParams = (filter?: EventDateFilter, now = new Date()) => {
  if (!filter) {
    return {};
  }

  if (filter === "upcoming") {
    return { fromToday: true };
  }

  if (filter === "today") {
    return { eventDate: toLocalDateString(now) };
  }

  if (filter === "thisWeek") {
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    return {
      fromDate: toLocalDateString(now),
      toDate: toLocalDateString(endOfWeek),
    };
  }

  if (filter === "thisMonth") {
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      fromDate: toLocalDateString(now),
      toDate: toLocalDateString(endOfMonth),
    };
  }

  return isIsoDate(filter) ? { eventDate: filter } : { fromToday: true };
};
