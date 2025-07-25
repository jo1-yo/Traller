import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueryController } from './controllers/query.controller';
import { QueryService } from './services/query.service';
import { GeminiService } from './services/gemini.service';
import { PerplexityService } from './services/perplexity.service';
import { TavilyService } from './services/tavily.service';
import { JsonRepairService } from './services/json-repair.service';
import { QueryResult, QueryResultSchema } from './entities/query-result.entity';
import {
  EntityRelationship,
  EntityRelationshipSchema,
} from './entities/entity-relationship.entity';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    MongooseModule.forFeature([
      { name: QueryResult.name, schema: QueryResultSchema },
      { name: EntityRelationship.name, schema: EntityRelationshipSchema },
    ]),
  ],
  controllers: [AppController, QueryController],
  providers: [
    AppService,
    QueryService,
    GeminiService,
    PerplexityService,
    TavilyService,
    JsonRepairService,
  ],
})
export class AppModule {}
