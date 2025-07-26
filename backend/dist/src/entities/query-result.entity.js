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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResultSchema = exports.QueryResult = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let QueryResult = class QueryResult {
    _id;
    originalQuery;
    queryType;
    structuredData;
    perplexityResponse;
    kimiResponse;
    createdAt;
    updatedAt;
};
exports.QueryResult = QueryResult;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QueryResult.prototype, "originalQuery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QueryResult.prototype, "queryType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QueryResult.prototype, "structuredData", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], QueryResult.prototype, "perplexityResponse", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], QueryResult.prototype, "kimiResponse", void 0);
exports.QueryResult = QueryResult = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'query_results',
        timestamps: true,
    })
], QueryResult);
exports.QueryResultSchema = mongoose_1.SchemaFactory.createForClass(QueryResult);
//# sourceMappingURL=query-result.entity.js.map