export declare class QueryRequestDto {
    query: string;
    queryType?: string;
}
export declare class EntityLinkDto {
    index: number;
    url: string;
}
export declare class EntityResponseDto {
    id: number;
    name: string;
    tag: 'person' | 'company';
    avatar_url: string;
    relationship_score: number;
    summary: string;
    description: string;
    links: EntityLinkDto[];
}
export declare class QueryResponseDto {
    id: string;
    originalQuery: string;
    queryType: string;
    entities: EntityResponseDto[];
    createdAt: Date;
}
export declare class SearchHistoryItemDto {
    id: string;
    originalQuery: string;
    queryType: string;
    createdAt: Date;
    entityCount: number;
}
export declare class PaginationDto {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}
export declare class SearchHistoryResponseDto {
    results: SearchHistoryItemDto[];
    pagination: PaginationDto;
}
