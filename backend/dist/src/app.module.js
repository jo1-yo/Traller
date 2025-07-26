"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const query_controller_1 = require("./controllers/query.controller");
const query_service_1 = require("./services/query.service");
const gemini_service_1 = require("./services/gemini.service");
const perplexity_service_1 = require("./services/perplexity.service");
const tavily_service_1 = require("./services/tavily.service");
const json_repair_service_1 = require("./services/json-repair.service");
const query_result_entity_1 = require("./entities/query-result.entity");
const entity_relationship_entity_1 = require("./entities/entity-relationship.entity");
const database_config_1 = require("./config/database.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: database_config_1.getDatabaseConfig,
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: query_result_entity_1.QueryResult.name, schema: query_result_entity_1.QueryResultSchema },
                { name: entity_relationship_entity_1.EntityRelationship.name, schema: entity_relationship_entity_1.EntityRelationshipSchema },
            ]),
        ],
        controllers: [app_controller_1.AppController, query_controller_1.QueryController],
        providers: [
            app_service_1.AppService,
            query_service_1.QueryService,
            gemini_service_1.GeminiService,
            perplexity_service_1.PerplexityService,
            tavily_service_1.TavilyService,
            json_repair_service_1.JsonRepairService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map