"use strict";
/**
 * Date Utilities with Timezone Support
 *
 * Functions for handling date categorization and timezone conversion
 * for the trip sections feature. All dates are handled in Eastern Time (ET).
 *
 * Timezone: Pennsylvania = America/New_York = Eastern Time
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isToday = isToday;
exports.isFuture = isFuture;
exports.isPast = isPast;
exports.getDateCategory = getDateCategory;
exports.formatSectionDate = formatSectionDate;
exports.getTodaySectionHeader = getTodaySectionHeader;
exports.isOlderThan36Hours = isOlderThan36Hours;
const ET_TIMEZONE = 'America/New_York';
/**
 * Get the date string in YYYY-MM-DD format for a given date in Eastern Time
 * This is used for comparison purposes
 */
function getDateStringInET(date) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: ET_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return formatter.format(date);
}
/**
 * Get today's date string in Eastern Time format (YYYY-MM-DD)
 */
function getTodayDateStringInET() {
    return getDateStringInET(new Date());
}
/**
 * Check if a date is today in Eastern Time
 */
function isToday(date, timezone = ET_TIMEZONE) {
    return getDateStringInET(date) === getTodayDateStringInET();
}
/**
 * Check if a date is in the future (after today) in Eastern Time
 */
function isFuture(date, timezone = ET_TIMEZONE) {
    return getDateStringInET(date) > getTodayDateStringInET();
}
/**
 * Check if a date is in the past (before today) in Eastern Time
 */
function isPast(date, timezone = ET_TIMEZONE) {
    return getDateStringInET(date) < getTodayDateStringInET();
}
/**
 * Categorize a trip based on its scheduledTime
 * Returns 'today', 'future', 'past', or 'unscheduled'
 */
function getDateCategory(scheduledTime) {
    if (!scheduledTime) {
        return 'unscheduled';
    }
    if (isToday(scheduledTime)) {
        return 'today';
    }
    if (isFuture(scheduledTime)) {
        return 'future';
    }
    if (isPast(scheduledTime)) {
        return 'past';
    }
    // Default to today if somehow none of the above
    return 'today';
}
/**
 * Format a date for section headers
 * Returns format: "October 31, 2025"
 */
function formatSectionDate(date) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // Convert to ET for formatting
    const etDate = new Date(date.toLocaleString('en-US', {
        timeZone: 'America/New_York'
    }));
    const month = monthNames[etDate.getMonth()];
    const day = etDate.getDate();
    const year = etDate.getFullYear();
    return `${month} ${day}, ${year}`;
}
/**
 * Get the current date formatted for "Today's Trips" header
 */
function getTodaySectionHeader() {
    return formatSectionDate(new Date());
}
/**
 * Check if a date is older than 36 hours (for auto-cleanup)
 * Uses scheduledTime for age calculation
 */
function isOlderThan36Hours(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 36;
}
//# sourceMappingURL=dateUtils.js.map