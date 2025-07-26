import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerplexityService } from './perplexity.service';
import { GeminiService } from './gemini.service';
import { TavilyService } from './tavily.service';
import {
  QueryRequestDto,
  QueryResponseDto,
  EntityResponseDto,
} from '../dto/query.dto';
import {
  QueryResult,
  QueryResultDocument,
} from '../entities/query-result.entity';
import {
  EntityRelationship,
  EntityRelationshipDocument,
} from '../entities/entity-relationship.entity';

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(
    @InjectModel(QueryResult.name)
    private queryResultModel: Model<QueryResultDocument>,
    @InjectModel(EntityRelationship.name)
    private entityRelationshipModel: Model<EntityRelationshipDocument>,
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

      // Step 4: Save to database and return structured response
      const savedQueryResult = await this.saveQueryResult(
        queryRequest.query,
        queryRequest.queryType || 'other',
        enhancedEntities,
        perplexityResponse,
      );

      return {
        id: String(savedQueryResult._id),
        originalQuery: savedQueryResult.originalQuery,
        queryType: savedQueryResult.queryType,
        entities: enhancedEntities,
        createdAt: savedQueryResult.createdAt || new Date(),
      };
    } catch (error) {
      this.logger.error('Error processing query:', (error as Error).message);
      throw new Error(`Query processing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Enhance entities with avatars using Tavily API for all entities
   */
  private async enhanceEntitiesWithAvatars(
    entities: EntityResponseDto[],
  ): Promise<EntityResponseDto[]> {
    const enhancedEntities = [...entities];

    for (let i = 0; i < enhancedEntities.length; i++) {
      const entity = enhancedEntities[i];

      try {
        this.logger.log(
          `Searching avatar for entity: ${entity.name} (${entity.tag})`,
        );

        // Always search for avatar using Tavily API
        const avatarUrl = await this.tavilyService.searchAvatar(
          entity.name,
          entity.tag,
        );

        enhancedEntities[i] = {
          ...entity,
          avatar_url: avatarUrl || '', // Use empty string if no avatar found
        };

        if (avatarUrl) {
          this.logger.log(`Found avatar for ${entity.name}: ${avatarUrl}`);
        } else {
          this.logger.log(`No avatar found for ${entity.name}`);
        }
      } catch (error) {
        this.logger.error(
          `Error enhancing avatar for ${entity.name}:`,
          (error as Error).message,
        );
        // Set empty avatar_url if search fails
        enhancedEntities[i] = {
          ...entity,
          avatar_url: '',
        };
      }
    }

    return enhancedEntities;
  }

  /**
   * Save query result to database
   */
  private async saveQueryResult(
    originalQuery: string,
    queryType: string,
    entities: EntityResponseDto[],
    perplexityResponse: string,
  ): Promise<QueryResultDocument> {
    try {
      // Create and save query result
      const queryResult = new this.queryResultModel({
        originalQuery,
        queryType,
        structuredData: JSON.stringify(entities),
        perplexityResponse,
      });

      const savedQueryResult = await queryResult.save();
      this.logger.log(
        `Saved query result with ID: ${String(savedQueryResult._id)}`,
      );

      // Save entity relationships
      const entityRelationships = entities.map((entity) => ({
        queryResultId: savedQueryResult._id,
        entityId: entity.id,
        name: entity.name,
        tag: entity.tag,
        avatarUrl: entity.avatar_url || '',
        relationshipScore: entity.relationship_score,
        summary: entity.summary,
        description: entity.description,
        links: JSON.stringify(entity.links),
      }));

      await this.entityRelationshipModel.insertMany(entityRelationships);
      this.logger.log(
        `Saved ${entityRelationships.length} entity relationships`,
      );

      return savedQueryResult;
    } catch (error) {
      this.logger.error('Error saving query result:', (error as Error).message);
      throw new Error(
        `Failed to save query result: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get search history with pagination
   */
  async getSearchHistory(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        this.queryResultModel
          .find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.queryResultModel.countDocuments().exec(),
      ]);

      return {
        results: results.map((result) => {
          const structuredData = JSON.parse(
            result.structuredData,
          ) as EntityResponseDto[];
          return {
            id: String(result._id),
            originalQuery: result.originalQuery,
            queryType: result.queryType,
            createdAt: result.createdAt || new Date(),
            entityCount: structuredData.length,
          };
        }),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      this.logger.error(
        'Error fetching search history:',
        (error as Error).message,
      );
      throw new Error(
        `Failed to fetch search history: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get detailed query result by ID
   */
  async getQueryResultById(id: string): Promise<QueryResponseDto> {
    try {
      const queryResult = await this.queryResultModel.findById(id).exec();

      if (!queryResult) {
        throw new Error('Query result not found');
      }

      const entities = JSON.parse(
        queryResult.structuredData,
      ) as EntityResponseDto[];

      return {
        id: String(queryResult._id),
        originalQuery: queryResult.originalQuery,
        queryType: queryResult.queryType,
        entities,
        createdAt: queryResult.createdAt || new Date(),
      };
    } catch (error) {
      this.logger.error(
        'Error fetching query result by ID:',
        (error as Error).message,
      );
      throw new Error(
        `Failed to fetch query result: ${(error as Error).message}`,
      );
    }
  }
}
