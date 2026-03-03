import { differenceInCalendarDays } from "date-fns";

export function diffDates(from, to) {
    return differenceInCalendarDays(
        new Date(to),
        new Date(from)
    );
}