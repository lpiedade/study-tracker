
/**
 * Parses a date string (YYYY-MM-DD or ISO) and returns a Date object
 * representing that date at local midnight, ignoring the time component
 * of the input string.
 * 
 * This is crucial for handling dates stored as UTC midnight which should
 * be displayed as the same calendar day regardless of local timezone.
 * 
 * Example:
 * Input: "2026-02-25T00:00:00.000Z" (Feb 25)
 * Output: Date object for "2026-02-25 00:00:00" in local timezone
 */
export function parseLocalDate(dateString: string): Date {
    if (!dateString) return new Date();

    // Extract YYYY-MM-DD part
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);

    // Create date using local time constructor
    // Month is 0-indexed in JS Date
    return new Date(year, month - 1, day);
}

/**
 * Checks if a date string represents the same day as a given Date object,
 * using the local date parsing logic.
 */
export function isSameLocalDate(dateString: string, compareDate: Date): boolean {
    const localDate = parseLocalDate(dateString);
    return localDate.getFullYear() === compareDate.getFullYear() &&
        localDate.getMonth() === compareDate.getMonth() &&
        localDate.getDate() === compareDate.getDate();
}
