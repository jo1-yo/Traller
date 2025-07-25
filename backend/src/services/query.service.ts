import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  QueryResult,
  QueryResultDocument,
} from '../entities/query-result.entity';
import {
  EntityRelationship,
  EntityRelationshipDocument,
} from '../entities/entity-relationship.entity';
import { PerplexityService } from './perplexity.service';
import { KimiService } from './kimi.service';
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
    @InjectModel(QueryResult.name)
    private queryResultModel: Model<QueryResultDocument>,
    @InjectModel(EntityRelationship.name)
    private entityRelationshipModel: Model<EntityRelationshipDocument>,
    private perplexityService: PerplexityService,
    private kimiService: KimiService,
    private tavilyService: TavilyService,
  ) {}

  async processQuery(queryRequest: QueryRequestDto): Promise<QueryResponseDto> {
    let savedQueryResult: QueryResultDocument | null = null;
    try {
      this.logger.log(`Processing query: ${queryRequest.query}`);

      // Step 1: Use Perplexity to search information
      this.logger.log('Calling Perplexity API...');
      const perplexityResponse = await this.perplexityService.searchInformation(
        queryRequest.query,
      );

      // Step 2: Use Kimi K2 for data structuring
      this.logger.log('Calling Kimi API for data structuring...');
      const structuredEntities = await this.kimiService.structureData(
        perplexityResponse,
        queryRequest.query,
      );

      // Step 2.5: Enhance missing avatars using Tavily API
      this.logger.log('Enhancing missing avatars with Tavily API...');
      const enhancedEntities =
        await this.enhanceEntitiesWithAvatars(structuredEntities);

      // Step 3: Save query result to database
      const queryResult = new this.queryResultModel({
        originalQuery: queryRequest.query,
        queryType: queryRequest.queryType || 'other',
        structuredData: JSON.stringify(enhancedEntities),
        perplexityResponse: perplexityResponse,
        kimiResponse: JSON.stringify(enhancedEntities),
      });

      savedQueryResult = await queryResult.save();
      this.logger.log(
        `Query result saved with ID: ${String(savedQueryResult._id)}`,
      );

      // Step 4: Save entity relationship data
      // Ensure savedQueryResult is not null before accessing its _id
      const entityRelationships = enhancedEntities.map((entity) => ({
        queryResultId: savedQueryResult ? savedQueryResult._id : null, // Defensive: handle possible null
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

      // Step 5: Return structured response
      return {
        id: String(savedQueryResult._id),
        originalQuery: savedQueryResult.originalQuery,
        queryType: savedQueryResult.queryType,
        entities: enhancedEntities,
        createdAt: new Date(savedQueryResult.createdAt || Date.now()),
      };
    } catch (error) {
      this.logger.error('Error processing query:', (error as Error).message);

      // 如果保存 QueryResult 成功但后续步骤失败，需要清理已保存的数据
      if (savedQueryResult && savedQueryResult._id) {
        try {
          this.logger.log('Cleaning up saved query result due to error...');
          await this.queryResultModel.findByIdAndDelete(savedQueryResult._id);
          await this.entityRelationshipModel.deleteMany({
            queryResultId: savedQueryResult._id,
          });
          this.logger.log('Cleanup completed');
        } catch (cleanupError) {
          this.logger.error(
            'Error during cleanup:',
            (cleanupError as Error).message,
          );
        }
      }

      throw new Error(`Query processing failed: ${(error as Error).message}`);
    }
  }

  async getQueryResult(id: string): Promise<QueryResponseDto | null> {
    try {
      const queryResult = await this.queryResultModel.findById(id).exec();
      if (!queryResult) {
        return null;
      }

      const entities = JSON.parse(
        queryResult.structuredData,
      ) as EntityResponseDto[];

      return {
        id: String(queryResult._id),
        originalQuery: queryResult.originalQuery,
        queryType: queryResult.queryType,
        entities,
        createdAt: new Date(queryResult.createdAt || Date.now()),
      };
    } catch (error) {
      this.logger.error(
        'Error getting query result:',
        (error as Error).message,
      );
      throw new Error(
        `Failed to get query result: ${(error as Error).message}`,
      );
    }
  }

  async getAllQueryResults(): Promise<QueryResponseDto[]> {
    try {
      const queryResults = await this.queryResultModel
        .find()
        .sort({ createdAt: -1 })
        .exec();

      return queryResults.map((queryResult) => ({
        id: String(queryResult._id),
        originalQuery: queryResult.originalQuery,
        queryType: queryResult.queryType,
        entities: JSON.parse(queryResult.structuredData) as EntityResponseDto[],
        createdAt: new Date(queryResult.createdAt || Date.now()),
      }));
    } catch (error) {
      this.logger.error(
        'Error getting all query results:',
        (error as Error).message,
      );
      throw new Error(
        `Failed to get query results: ${(error as Error).message}`,
      );
    }
  }

  async deleteQueryResult(id: string): Promise<boolean> {
    try {
      // Delete related entity relationship records
      await this.entityRelationshipModel
        .deleteMany({ queryResultId: id })
        .exec();

      // Delete query result record
      const result = await this.queryResultModel.findByIdAndDelete(id).exec();

      return !!result;
    } catch (error) {
      this.logger.error(
        'Error deleting query result:',
        (error as Error).message,
      );
      throw new Error(
        `Failed to delete query result: ${(error as Error).message}`,
      );
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
