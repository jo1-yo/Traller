import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QueryResultDocument = QueryResult & Document;

@Schema({
  collection: 'query_results',
  timestamps: true,
})
export class QueryResult {
  _id: Types.ObjectId;

  @Prop({ required: true })
  originalQuery: string;

  @Prop({ required: true })
  queryType: string; // 'link' | 'person' | 'other'

  @Prop({ required: true })
  structuredData: string; // JSON string of the structured result

  @Prop()
  perplexityResponse?: string; // Raw response from Perplexity

  @Prop()
  kimiResponse?: string; // Raw response from Kimi K2

  // 添加时间戳字段定义
  createdAt?: Date;
  updatedAt?: Date;
}

export const QueryResultSchema = SchemaFactory.createForClass(QueryResult);
