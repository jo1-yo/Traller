import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class JsonRepairService {
  private readonly logger = new Logger(JsonRepairService.name);

  public parse<T>(jsonString: string): T {
    const cleanContent = this.preProcess(jsonString);

    try {
      return JSON.parse(cleanContent);
    } catch (parseError) {
      this.logger.error('Failed to parse JSON. Attempting repair...');
      this.logger.debug('Original content length:', jsonString.length);
      this.logger.debug(
        'Clean content preview (first 300 chars):',
        cleanContent.substring(0, 300),
      );
      this.logger.debug(
        'Clean content preview (last 300 chars):',
        cleanContent.substring(Math.max(0, cleanContent.length - 300)),
      );

      const repairedJSON = this.attemptJSONRepair(cleanContent);
      if (repairedJSON) {
        try {
          const parsed = JSON.parse(repairedJSON);
          this.logger.warn('Successfully repaired JSON response');
          return parsed;
        } catch (repairError) {
          this.logger.error('JSON repair also failed:', repairError.message);
          this.logger.debug(
            'Repaired JSON preview (first 200 chars):',
            repairedJSON.substring(0, 200),
          );
        }
      }

      throw new Error(
        `Invalid JSON response after all repair attempts: ${parseError.message}`,
      );
    }
  }

  private preProcess(content: string): string {
    let cleanContent = content
      .replace(/```json\n?|\n?```/g, '')
      .replace(/^[^[\{]*/, '')
      .replace(/[^}\]]*$/, '')
      .trim();

    cleanContent = this.fixCommonJsonIssues(cleanContent);
    cleanContent = this.sanitizeJsonContent(cleanContent);

    return cleanContent;
  }

  private fixCommonJsonIssues(jsonString: string): string {
    let fixed = jsonString.replace(/\\n/g, '\n');

    fixed = fixed.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (match, content) => {
      const escaped = content
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/"/g, '\\"');
      return `"${escaped}"`;
    });

    return fixed.replace(/([^\\])'/g, '$1"').replace(/^'/g, '"');
  }

  private sanitizeJsonContent(jsonString: string): string {
    try {
      let sanitized = jsonString;
      const arrayStart = sanitized.indexOf('[');
      const arrayEnd = sanitized.lastIndexOf(']');

      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        sanitized = sanitized.substring(arrayStart, arrayEnd + 1);
      }

      sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      return sanitized.replace(/\\\\/g, '\\');
    } catch (error) {
      this.logger.warn(
        'Error during JSON sanitization, using original:',
        error.message,
      );
      return jsonString;
    }
  }

  private attemptJSONRepair(jsonString: string): string | null {
    try {
      const startIndex = jsonString.indexOf('[');
      if (startIndex === -1) return null;

      let repaired = jsonString.substring(startIndex);
      let bracketCount = 0;
      let braceCount = 0;
      let inString = false;
      let lastValidIndex = 0;

      for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];
        const prevChar = i > 0 ? repaired[i - 1] : '';

        if (char === '"' && prevChar !== '\\') inString = !inString;

        if (!inString) {
          if (char === '[') bracketCount++;
          else if (char === ']') bracketCount--;
          else if (char === '{') braceCount++;
          else if (char === '}') braceCount--;

          if (bracketCount >= 0 && braceCount >= 0) lastValidIndex = i;
        }
      }

      if (bracketCount > 0 || braceCount > 0) {
        repaired = repaired.substring(0, lastValidIndex + 1);
        let lastCompleteObjectEnd = -1;
        bracketCount = 0;
        braceCount = 0;
        inString = false;

        for (let i = 0; i < repaired.length; i++) {
          const char = repaired[i];
          const prevChar = i > 0 ? repaired[i - 1] : '';

          if (char === '"' && prevChar !== '\\') inString = !inString;

          if (!inString) {
            if (char === '[') bracketCount++;
            else if (char === ']') bracketCount--;
            else if (char === '{') braceCount++;
            else if (char === '}') {
              braceCount--;
              if (braceCount === 0 && bracketCount === 1)
                lastCompleteObjectEnd = i;
            }
          }
        }

        if (lastCompleteObjectEnd > -1) {
          repaired = repaired.substring(0, lastCompleteObjectEnd + 1) + ']';
        } else {
          repaired += '}]';
        }
      }

      return repaired;
    } catch (error) {
      this.logger.error('Error during JSON repair:', error.message);
      return null;
    }
  }
}
