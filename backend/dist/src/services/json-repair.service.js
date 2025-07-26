"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JsonRepairService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRepairService = void 0;
const common_1 = require("@nestjs/common");
let JsonRepairService = JsonRepairService_1 = class JsonRepairService {
    logger = new common_1.Logger(JsonRepairService_1.name);
    parse(jsonString) {
        const cleanContent = this.preProcess(jsonString);
        try {
            return JSON.parse(cleanContent);
        }
        catch (parseError) {
            this.logger.error('Failed to parse JSON. Attempting repair...');
            this.logger.debug('Original content length:', jsonString.length);
            this.logger.debug('Clean content preview (first 300 chars):', cleanContent.substring(0, 300));
            this.logger.debug('Clean content preview (last 300 chars):', cleanContent.substring(Math.max(0, cleanContent.length - 300)));
            const repairedJSON = this.attemptJSONRepair(cleanContent);
            if (repairedJSON) {
                try {
                    const parsed = JSON.parse(repairedJSON);
                    this.logger.warn('Successfully repaired JSON response');
                    return parsed;
                }
                catch (repairError) {
                    this.logger.error('JSON repair also failed:', repairError.message);
                    this.logger.debug('Repaired JSON preview (first 200 chars):', repairedJSON.substring(0, 200));
                }
            }
            throw new Error(`Invalid JSON response after all repair attempts: ${parseError.message}`);
        }
    }
    preProcess(content) {
        let cleanContent = content
            .replace(/```json\n?|\n?```/g, '')
            .replace(/^[^[{]*/, '')
            .replace(/[^}\]]*$/, '')
            .trim();
        cleanContent = this.fixCommonJsonIssues(cleanContent);
        cleanContent = this.sanitizeJsonContent(cleanContent);
        return cleanContent;
    }
    fixCommonJsonIssues(jsonString) {
        let fixed = jsonString.replace(/\\n/g, '\n');
        fixed = fixed.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (_match, content) => {
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
    sanitizeJsonContent(jsonString) {
        try {
            let sanitized = jsonString;
            const arrayStart = sanitized.indexOf('[');
            const arrayEnd = sanitized.lastIndexOf(']');
            if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
                sanitized = sanitized.substring(arrayStart, arrayEnd + 1);
            }
            sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            return sanitized.replace(/\\\\/g, '\\');
        }
        catch (error) {
            this.logger.warn('Error during JSON sanitization, using original:', error.message);
            return jsonString;
        }
    }
    attemptJSONRepair(jsonString) {
        try {
            const startIndex = jsonString.indexOf('[');
            if (startIndex === -1)
                return null;
            let repaired = jsonString.substring(startIndex);
            let bracketCount = 0;
            let braceCount = 0;
            let inString = false;
            let lastValidIndex = 0;
            for (let i = 0; i < repaired.length; i++) {
                const char = repaired[i];
                const prevChar = i > 0 ? repaired[i - 1] : '';
                if (char === '"' && prevChar !== '\\')
                    inString = !inString;
                if (!inString) {
                    if (char === '[')
                        bracketCount++;
                    else if (char === ']')
                        bracketCount--;
                    else if (char === '{')
                        braceCount++;
                    else if (char === '}')
                        braceCount--;
                    if (bracketCount >= 0 && braceCount >= 0)
                        lastValidIndex = i;
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
                    if (char === '"' && prevChar !== '\\')
                        inString = !inString;
                    if (!inString) {
                        if (char === '[')
                            bracketCount++;
                        else if (char === ']')
                            bracketCount--;
                        else if (char === '{')
                            braceCount++;
                        else if (char === '}') {
                            braceCount--;
                            if (braceCount === 0 && bracketCount === 1)
                                lastCompleteObjectEnd = i;
                        }
                    }
                }
                if (lastCompleteObjectEnd > -1) {
                    repaired = repaired.substring(0, lastCompleteObjectEnd + 1) + ']';
                }
                else {
                    repaired += '}]';
                }
            }
            return repaired;
        }
        catch (error) {
            this.logger.error('Error during JSON repair:', error.message);
            return null;
        }
    }
};
exports.JsonRepairService = JsonRepairService;
exports.JsonRepairService = JsonRepairService = JsonRepairService_1 = __decorate([
    (0, common_1.Injectable)()
], JsonRepairService);
//# sourceMappingURL=json-repair.service.js.map