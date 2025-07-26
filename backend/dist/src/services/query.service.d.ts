import { Model } from 'mongoose';
import { PerplexityService } from './perplexity.service';
import { GeminiService } from './gemini.service';
import { TavilyService } from './tavily.service';
import { QueryRequestDto, QueryResponseDto } from '../dto/query.dto';
import { QueryResultDocument } from '../entities/query-result.entity';
import { EntityRelationshipDocument } from '../entities/entity-relationship.entity';
export declare class QueryService {
    private queryResultModel;
    private entityRelationshipModel;
    private perplexityService;
    private geminiService;
    private tavilyService;
    private readonly logger;
    constructor(queryResultModel: Model<QueryResultDocument>, entityRelationshipModel: Model<EntityRelationshipDocument>, perplexityService: PerplexityService, geminiService: GeminiService, tavilyService: TavilyService);
    processQuery(queryRequest: QueryRequestDto): Promise<QueryResponseDto>;
    private enhanceEntitiesWithAvatars;
    private saveQueryResult;
    getSearchHistory(page?: number, limit?: number): Promise<{
        results: {
            id: string;
            originalQuery: string;
            queryType: string;
            createdAt: Date;
            entityCount: number;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getQueryResultById(id: string): Promise<QueryResponseDto>;
}
