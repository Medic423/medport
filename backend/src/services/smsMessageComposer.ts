/**
 * SMS Message Composer Service
 * Composes SMS messages for trip notifications with HIPAA compliance
 */

interface TripData {
  tripNumber: string | null;
  patientId: string;
  transportLevel: string;
  priority: string;
  urgencyLevel?: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  scheduledTime: Date | null;
  facilityName?: string | null;
}

interface MessageCompositionResult {
  message: string;
  characterCount: number;
  messageCount: number; // Number of SMS parts (1 for single, 2+ for multi-part)
  isValid: boolean;
  warnings?: string[];
}

class SMSMessageComposer {
  // Default SMS message template
  private readonly DEFAULT_TEMPLATE = `🚑 NEW TRIP CREATED
Trip #{tripNumber}
PatientID: {patientId}
Level: {transportLevel}
Priority: {priority}
From: {fromLocation}
To: {toLocation}
Ready: {scheduledTime}`;

  // SMS limits
  private readonly SINGLE_SMS_LIMIT = 160; // Characters for single SMS
  private readonly MULTI_SMS_LIMIT = 1600; // Characters for multi-part SMS (10 parts max)

  /**
   * Compose SMS message from trip data using default template
   */
  composeMessage(tripData: TripData, customTemplate?: string | null): MessageCompositionResult {
    const template = customTemplate || this.DEFAULT_TEMPLATE;
    const warnings: string[] = [];

    // Replace template variables with actual trip data
    let message = template
      .replace(/{tripNumber}/g, tripData.tripNumber || 'N/A')
      .replace(/{patientId}/g, tripData.patientId || 'N/A')
      .replace(/{transportLevel}/g, tripData.transportLevel || 'N/A')
      .replace(/{priority}/g, tripData.priority || 'N/A')
      .replace(/{urgencyLevel}/g, tripData.urgencyLevel || 'N/A')
      .replace(/{fromLocation}/g, this.truncateLocation(tripData.fromLocation))
      .replace(/{toLocation}/g, this.truncateLocation(tripData.toLocation))
      .replace(/{scheduledTime}/g, this.formatScheduledTime(tripData.scheduledTime))
      .replace(/{facilityName}/g, tripData.facilityName || '');

    // Remove any unused template variables (clean up)
    message = message.replace(/{[^}]+}/g, '');

    // Trim whitespace and normalize line breaks
    message = message.trim().replace(/\n{3,}/g, '\n\n');

    const characterCount = message.length;
    const messageCount = this.calculateMessageCount(characterCount);

    // Validate message length
    if (characterCount > this.MULTI_SMS_LIMIT) {
      warnings.push(`Message exceeds multi-part SMS limit (${this.MULTI_SMS_LIMIT} chars). Will be truncated.`);
      message = message.substring(0, this.MULTI_SMS_LIMIT);
    } else if (characterCount > this.SINGLE_SMS_LIMIT) {
      warnings.push(`Message exceeds single SMS limit (${this.SINGLE_SMS_LIMIT} chars). Will be sent as multi-part SMS.`);
    }

    // Validate required fields (HIPAA compliance)
    if (!tripData.patientId || tripData.patientId === 'N/A') {
      warnings.push('PatientID is missing - required for HIPAA compliance');
    }

    return {
      message,
      characterCount: message.length,
      messageCount,
      isValid: characterCount <= this.MULTI_SMS_LIMIT && tripData.patientId && tripData.patientId !== 'N/A',
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Format scheduled time for SMS (compact format)
   */
  private formatScheduledTime(date: Date | null): string {
    if (!date) {
      return 'ASAP';
    }

    try {
      const d = new Date(date);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      
      if (isToday) {
        // Format as time only if today
        return d.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        // Format as date and time if not today
        return d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error formatting scheduled time:', error);
      return 'ASAP';
    }
  }

  /**
   * Truncate location name if too long (for SMS)
   */
  private truncateLocation(location: string | null, maxLength: number = 30): string {
    if (!location) {
      return 'N/A';
    }

    if (location.length <= maxLength) {
      return location;
    }

    // Try to truncate at word boundary
    const truncated = location.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Calculate number of SMS parts needed
   */
  private calculateMessageCount(characterCount: number): number {
    if (characterCount <= this.SINGLE_SMS_LIMIT) {
      return 1;
    }
    
    // Multi-part SMS: each part after the first can hold 153 characters
    // (160 - 7 bytes for UDH header)
    const firstPart = this.SINGLE_SMS_LIMIT;
    const remainingChars = characterCount - firstPart;
    const additionalParts = Math.ceil(remainingChars / 153);
    
    return 1 + additionalParts;
  }

  /**
   * Get default template
   */
  getDefaultTemplate(): string {
    return this.DEFAULT_TEMPLATE;
  }

  /**
   * Validate template syntax
   */
  validateTemplate(template: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required variables
    if (!template.includes('{tripNumber}')) {
      errors.push('Template must include {tripNumber}');
    }
    if (!template.includes('{patientId}')) {
      errors.push('Template must include {patientId} (required for HIPAA compliance)');
    }

    // Check template length
    const estimatedLength = template.length + 200; // Rough estimate with data
    if (estimatedLength > this.MULTI_SMS_LIMIT) {
      warnings.push(`Template may produce messages exceeding ${this.MULTI_SMS_LIMIT} characters`);
    }

    // Check for unknown variables
    const knownVariables = [
      'tripNumber', 'patientId', 'transportLevel', 'priority', 
      'urgencyLevel', 'fromLocation', 'toLocation', 'scheduledTime', 'facilityName'
    ];
    const variableMatches = template.match(/{([^}]+)}/g) || [];
    const usedVariables = variableMatches.map(v => v.replace(/[{}]/g, ''));
    const unknownVariables = usedVariables.filter(v => !knownVariables.includes(v));
    
    if (unknownVariables.length > 0) {
      warnings.push(`Unknown template variables: ${unknownVariables.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Preview message with sample data
   */
  previewMessage(template?: string | null): MessageCompositionResult {
    const sampleData: TripData = {
      tripNumber: 'TRP-1234567890',
      patientId: 'PAT-ABC123',
      transportLevel: 'ALS',
      priority: 'HIGH',
      urgencyLevel: 'Urgent',
      fromLocation: 'General Hospital - Main Campus',
      toLocation: 'Regional Medical Center',
      scheduledTime: new Date(),
      facilityName: 'General Hospital'
    };

    return this.composeMessage(sampleData, template);
  }
}

export const smsMessageComposer = new SMSMessageComposer();
export default smsMessageComposer;
export type { TripData, MessageCompositionResult };

