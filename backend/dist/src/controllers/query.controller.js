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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryController = void 0;
const common_1 = require("@nestjs/common");
const query_service_1 = require("../services/query.service");
const query_dto_1 = require("../dto/query.dto");
let QueryController = class QueryController {
    queryService;
    constructor(queryService) {
        this.queryService = queryService;
    }
    async processQuery(queryRequest) {
        try {
            return await this.queryService.processQuery(queryRequest);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Query processing failed',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSearchHistory(page = '1', limit = '10') {
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            return await this.queryService.getSearchHistory(pageNum, limitNum);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Failed to fetch search history',
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getQueryById(id) {
        try {
            return await this.queryService.getQueryResultById(id);
        }
        catch (error) {
            const statusCode = error.message.includes('not found')
                ? common_1.HttpStatus.NOT_FOUND
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            throw new common_1.HttpException({
                status: statusCode,
                error: 'Failed to fetch query result',
                message: error.message,
            }, statusCode);
        }
    }
};
exports.QueryController = QueryController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_dto_1.QueryRequestDto]),
    __metadata("design:returntype", Promise)
], QueryController.prototype, "processQuery", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QueryController.prototype, "getSearchHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QueryController.prototype, "getQueryById", null);
exports.QueryController = QueryController = __decorate([
    (0, common_1.Controller)('api/query'),
    __metadata("design:paramtypes", [query_service_1.QueryService])
], QueryController);
//# sourceMappingURL=query.controller.js.map