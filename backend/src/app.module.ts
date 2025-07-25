import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueryController } from './controllers/query.controller';
import { QueryService } from './services/query.service';
import { GeminiService } from './services/gemini.service';
import { PerplexityService } from './services/perplexity.service';
import { TavilyService } from './services/tavily.service';
import { JsonRepairService } from './services/json-repair.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
