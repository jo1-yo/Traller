import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class QueryRequestDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsEnum(['link', 'person', 'other'])
  queryType?: string;
}

export class EntityLinkDto {
  index: number;
  url: string;
}

export class EntityResponseDto {
  id: number;
  name: string;
  tag: 'person' | 'company';
  avatar_url: string;
  relationship_score: number;
  summary: string;
  description: string;
  links: EntityLinkDto[];
}

export class QueryResponseDto {
  id: string; // Changed from number to string for MongoDB ObjectId
  originalQuery: string;
  queryType: string;
  entities: EntityResponseDto[];
  createdAt: Date;
}

export class SearchHistoryItemDto {
  id: string;
  originalQuery: string;
  queryType: string;
  createdAt: Date;
  entityCount: number;
}

export class PaginationDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export class SearchHistoryResponseDto {
  results: SearchHistoryItemDto[];
  pagination: PaginationDto;
}
