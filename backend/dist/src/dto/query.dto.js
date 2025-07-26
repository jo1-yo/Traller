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
exports.SearchHistoryResponseDto = exports.PaginationDto = exports.SearchHistoryItemDto = exports.QueryResponseDto = exports.EntityResponseDto = exports.EntityLinkDto = exports.QueryRequestDto = void 0;
const class_validator_1 = require("class-validator");
class QueryRequestDto {
    query;
    queryType;
}
exports.QueryRequestDto = QueryRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QueryRequestDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['link', 'person', 'other']),
    __metadata("design:type", String)
], QueryRequestDto.prototype, "queryType", void 0);
class EntityLinkDto {
    index;
    url;
}
exports.EntityLinkDto = EntityLinkDto;
class EntityResponseDto {
    id;
    name;
    tag;
    avatar_url;
    relationship_score;
    summary;
    description;
    links;
}
exports.EntityResponseDto = EntityResponseDto;
class QueryResponseDto {
    id;
    originalQuery;
    queryType;
    entities;
    createdAt;
}
exports.QueryResponseDto = QueryResponseDto;
class SearchHistoryItemDto {
    id;
    originalQuery;
    queryType;
    createdAt;
    entityCount;
}
exports.SearchHistoryItemDto = SearchHistoryItemDto;
class PaginationDto {
    currentPage;
    totalPages;
    totalItems;
    itemsPerPage;
}
exports.PaginationDto = PaginationDto;
class SearchHistoryResponseDto {
    results;
    pagination;
}
exports.SearchHistoryResponseDto = SearchHistoryResponseDto;
//# sourceMappingURL=query.dto.js.map