"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QueryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const perplexity_service_1 = require("./perplexity.service");
const gemini_service_1 = require("./gemini.service");
const tavily_service_1 = require("./tavily.service");
const query_result_entity_1 = require("../entities/query-result.entity");
const entity_relationship_entity_1 = require("../entities/entity-relationship.entity");
let QueryService = QueryService_1 = class QueryService {
    queryResultModel;
    entityRelationshipModel;
    perplexityService;
    geminiService;
    tavilyService;
    logger = new common_1.Logger(QueryService_1.name);
    constructor(queryResultModel, entityRelationshipModel, perplexityService, geminiService, tavilyService) {
        this.queryResultModel = queryResultModel;
        this.entityRelationshipModel = entityRelationshipModel;
        this.perplexityService = perplexityService;
        this.geminiService = geminiService;
        this.tavilyService = tavilyService;
    }
    async processQuery(queryRequest) {
        try {
            this.logger.log(`Processing query: ${queryRequest.query}`);
            this.logger.log('Calling Perplexity API...');
            const perplexityResponse = await this.perplexityService.searchInformation(queryRequest.query);
            this.logger.log('Calling Gemini API for data structuring...');
            const structuredEntities = await this.geminiService.structureData(perplexityResponse, queryRequest.query);
            this.logger.log('Enhancing missing avatars with Tavily API...');
            const enhancedEntities = await this.enhanceEntitiesWithAvatars(structuredEntities);
            const savedQueryResult = await this.saveQueryResult(queryRequest.query, queryRequest.queryType || 'other', enhancedEntities, perplexityResponse);
            return {
                id: String(savedQueryResult._id),
                originalQuery: savedQueryResult.originalQuery,
                queryType: savedQueryResult.queryType,
                entities: enhancedEntities,
                createdAt: savedQueryResult.createdAt || new Date(),
            };
        }
        catch (error) {
            this.logger.error('Error processing query:', error.message);
            throw new Error(`Query processing failed: ${error.message}`);
        }
    }
    async enhanceEntitiesWithAvatars(entities) {
        const enhancedEntities = [...entities];
        for (let i = 0; i < enhancedEntities.length; i++) {
            const entity = enhancedEntities[i];
            try {
                this.logger.log(`Searching avatar for entity: ${entity.name} (${entity.tag})`);
                const avatarUrl = await this.tavilyService.searchAvatar(entity.name, entity.tag);
                enhancedEntities[i] = {
                    ...entity,
                    avatar_url: avatarUrl || '',
                };
                if (avatarUrl) {
                    this.logger.log(`Found avatar for ${entity.name}: ${avatarUrl}`);
                }
                else {
                    this.logger.log(`No avatar found for ${entity.name}`);
                }
            }
            catch (error) {
                this.logger.error(`Error enhancing avatar for ${entity.name}:`, error.message);
                enhancedEntities[i] = {
                    ...entity,
                    avatar_url: '',
                };
            }
        }
        return enhancedEntities;
    }
    async saveQueryResult(originalQuery, queryType, entities, perplexityResponse) {
        try {
            const queryResult = new this.queryResultModel({
                originalQuery,
                queryType,
                structuredData: JSON.stringify(entities),
                perplexityResponse,
            });
            const savedQueryResult = await queryResult.save();
            this.logger.log(`Saved query result with ID: ${String(savedQueryResult._id)}`);
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
            this.logger.log(`Saved ${entityRelationships.length} entity relationships`);
            return savedQueryResult;
        }
        catch (error) {
            this.logger.error('Error saving query result:', error.message);
            throw new Error(`Failed to save query result: ${error.message}`);
        }
    }
    async getSearchHistory(page = 1, limit = 10) {
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
                    const structuredData = JSON.parse(result.structuredData);
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
        }
        catch (error) {
            this.logger.error('Error fetching search history:', error.message);
            throw new Error(`Failed to fetch search history: ${error.message}`);
        }
    }
    async getQueryResultById(id) {
        try {
            const queryResult = await this.queryResultModel.findById(id).exec();
            if (!queryResult) {
                throw new Error('Query result not found');
            }
            const entities = JSON.parse(queryResult.structuredData);
            return {
                id: String(queryResult._id),
                originalQuery: queryResult.originalQuery,
                queryType: queryResult.queryType,
                entities,
                createdAt: queryResult.createdAt || new Date(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching query result by ID:', error.message);
            throw new Error(`Failed to fetch query result: ${error.message}`);
        }
    }
};
exports.QueryService = QueryService;
exports.QueryService = QueryService = QueryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(query_result_entity_1.QueryResult.name)),
    __param(1, (0, mongoose_1.InjectModel)(entity_relationship_entity_1.EntityRelationship.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        perplexity_service_1.PerplexityService,
        gemini_service_1.GeminiService,
        tavily_service_1.TavilyService])
], QueryService);
//# sourceMappingURL=query.service.js.map