/**
 * Date Utilities with Timezone Support
 * 
 * Functions for handling date categorization and timezone conversion
 * for the trip sections feature. All dates are handled in Eastern Time (ET).
 * 
 * Timezone: Pennsylvania = America/New_York = Eastern Time
 */

export type DateCategory = 'today' | 'future' | 'past' | 'unscheduled';

const ET_TIMEZONE = 'America/New_York';

/**
 * Get the date string in YYYY-MM-DD format for a given date in Eastern Time
 * This is used for comparison purposes
 */
function getDateStringInET(date: Date): string {
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
function getTodayDateStringInET(): string {
  return getDateStringInET(new Date());
}

/**
 * Check if a date is today in Eastern Time
 */
export function isToday(date: Date, timezone: string = ET_TIMEZONE): boolean {
  return getDateStringInET(date) === getTodayDateStringInET();
}

/**
 * Check if a date is in the future (after today) in Eastern Time
 */
export function isFuture(date: Date, timezone: string = ET_TIMEZONE): boolean {
  return getDateStringInET(date) > getTodayDateStringInET();
}

/**
 * Check if a date is in the past (before today) in Eastern Time
 */
export function isPast(date: Date, timezone: string = ET_TIMEZONE): boolean {
  return getDateStringInET(date) < getTodayDateStringInET();
}

/**
 * Categorize a trip based on its scheduledTime
 * Returns 'today', 'future', 'past', or 'unscheduled'
 */
export function getDateCategory(scheduledTime: Date | null | undefined): DateCategory {
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
 * Categorize a trip object by its scheduledTime
 * Returns the DateCategory for the trip
 */
export function categorizeTripByDate(trip: { scheduledTime?: string | null }): DateCategory {
  if (!trip.scheduledTime) {
    return 'unscheduled';
  }
  
  return getDateCategory(new Date(trip.scheduledTime));
}

/**
 * Format a date for section headers
 * Returns format: "October 31, 2025"
 */
export function formatSectionDate(date: Date): string {
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
export function getTodaySectionHeader(): string {
  return formatSectionDate(new Date());
}

/**
 * Format a section header based on category
 */
export function formatSectionHeader(category: DateCategory): string {
  switch (category) {
    case 'today':
      return `Today's Trips - ${getTodaySectionHeader()}`;
    case 'future':
      return 'Future Trips';
    case 'past':
      return 'Past Trips';
    case 'unscheduled':
      return 'Unscheduled Trips';
  }
}

/**
 * Check if a date is older than 36 hours (for auto-cleanup)
 * Uses scheduledTime for age calculation
 */
export function isOlderThan36Hours(date: Date): boolean {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours > 36;
}

