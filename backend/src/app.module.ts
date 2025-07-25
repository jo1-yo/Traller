import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueryController } from './controllers/query.controller';
import { QueryService } from './services/query.service';
import { PerplexityService } from './services/perplexity.service';
import { GeminiService } from './services/gemini.service';
import { TavilyService } from './services/tavily.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController, QueryController],
  providers: [
    AppService,
    QueryService,
    PerplexityService,
    GeminiService,
    TavilyService,
  ],
})
export class AppModule {}
