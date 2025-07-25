export interface EntityLink {
  index: number;
  url: string;
}

export type EntityTag = 'people' | 'company' | 'event';

export interface Entity {
  id: number;
  name: string;
  tag: EntityTag;
  avatar_url: string;
  relationship_score: number;
  summary: string;
  description: string;
  links: EntityLink[];
}

export interface QueryRequest {
  query: string;
  queryType?: 'link' | 'person' | 'other';
}

export interface QueryResponse {
  id: string;
  originalQuery: string;
  queryType: string;
  entities: Entity[];
  createdAt: Date;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
} 