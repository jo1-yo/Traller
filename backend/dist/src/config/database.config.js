"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => {
    const mongoUri = configService.get('MONGODB_URI') ||
        'mongodb://localhost:27017/traller';
    return {
        uri: mongoUri,
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map