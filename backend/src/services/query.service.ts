import { Injectable, Logger } from '@nestjs/common';
import { PerplexityService } from './perplexity.service';
import { GeminiService } from './gemini.service';
import { TavilyService } from './tavily.service';
import {
  QueryRequestDto,
  QueryResponseDto,
  EntityResponseDto,
} from '../dto/query.dto';

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(
    private perplexityService: PerplexityService,
    private geminiService: GeminiService,
    private tavilyService: TavilyService,
  ) {}

  async processQuery(queryRequest: QueryRequestDto): Promise<QueryResponseDto> {
    try {
      this.logger.log(`Processing query: ${queryRequest.query}`);

      // Step 1: Use Perplexity to search information
      this.logger.log('Calling Perplexity API...');
      const perplexityResponse = await this.perplexityService.searchInformation(
        queryRequest.query,
      );

              // Step 2: Use Gemini 2.5 Flash for data structuring
        this.logger.log('Calling Gemini API for data structuring...');
      const structuredEntities = await this.geminiService.structureData(
        perplexityResponse,
        queryRequest.query,
      );

      // Step 3: Enhance missing avatars using Tavily API
      this.logger.log('Enhancing missing avatars with Tavily API...');
      const enhancedEntities =
        await this.enhanceEntitiesWithAvatars(structuredEntities);

      // Step 4: Return structured response (no database storage)
      const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id: queryId,
        originalQuery: queryRequest.query,
        queryType: queryRequest.queryType || 'other',
        entities: enhancedEntities,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error processing query:', (error as Error).message);
      throw new Error(`Query processing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Enhance entities with avatars using Tavily API for missing or empty avatar URLs
   */
  private async enhanceEntitiesWithAvatars(
    entities: EntityResponseDto[],
  ): Promise<EntityResponseDto[]> {
    const enhancedEntities = [...entities];

    for (let i = 0; i < enhancedEntities.length; i++) {
      const entity = enhancedEntities[i];

      // Check if avatar is missing or empty
      if (!entity.avatar_url || entity.avatar_url.trim() === '') {
        try {
          this.logger.log(
            `Searching avatar for entity: ${entity.name} (${entity.tag})`,
          );

          // Search for avatar using Tavily API
          const avatarUrl = await this.tavilyService.searchAvatar(
            entity.name,
            entity.tag,
          );

          if (avatarUrl) {
            enhancedEntities[i] = {
              ...entity,
              avatar_url: avatarUrl,
            };
            this.logger.log(`Updated avatar for ${entity.name}: ${avatarUrl}`);
          } else {
            this.logger.log(`No avatar found for ${entity.name}`);
          }
        } catch (error) {
          this.logger.error(
            `Error enhancing avatar for ${entity.name}:`,
            (error as Error).message,
          );
          // Continue with original entity if avatar search fails
        }
      }
    }

    return enhancedEntities;
  }
}
