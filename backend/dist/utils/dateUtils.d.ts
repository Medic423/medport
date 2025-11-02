/**
 * Date Utilities with Timezone Support
 *
 * Functions for handling date categorization and timezone conversion
 * for the trip sections feature. All dates are handled in Eastern Time (ET).
 *
 * Timezone: Pennsylvania = America/New_York = Eastern Time
 */
export type DateCategory = 'today' | 'future' | 'past' | 'unscheduled';
/**
 * Check if a date is today in Eastern Time
 */
export declare function isToday(date: Date, timezone?: string): boolean;
/**
 * Check if a date is in the future (after today) in Eastern Time
 */
export declare function isFuture(date: Date, timezone?: string): boolean;
/**
 * Check if a date is in the past (before today) in Eastern Time
 */
export declare function isPast(date: Date, timezone?: string): boolean;
/**
 * Categorize a trip based on its scheduledTime
 * Returns 'today', 'future', 'past', or 'unscheduled'
 */
export declare function getDateCategory(scheduledTime: Date | null | undefined): DateCategory;
/**
 * Format a date for section headers
 * Returns format: "October 31, 2025"
 */
export declare function formatSectionDate(date: Date): string;
/**
 * Get the current date formatted for "Today's Trips" header
 */
export declare function getTodaySectionHeader(): string;
/**
 * Check if a date is older than 36 hours (for auto-cleanup)
 * Uses scheduledTime for age calculation
 */
export declare function isOlderThan36Hours(date: Date): boolean;
//# sourceMappingURL=dateUtils.d.ts.map