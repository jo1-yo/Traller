import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
export declare const getDatabaseConfig: (configService: ConfigService) => MongooseModuleOptions;
