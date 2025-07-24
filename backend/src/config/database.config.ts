import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const mongoUri =
    configService.get<string>('MONGODB_URI') ||
    'mongodb://localhost:27017/traller';

  return {
    uri: mongoUri,
  };
};
