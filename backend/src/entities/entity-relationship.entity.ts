import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EntityRelationshipDocument = EntityRelationship & Document;

@Schema({
  collection: 'entity_relationships',
  timestamps: true,
})
export class EntityRelationship {
  @Prop({ type: Types.ObjectId, ref: 'QueryResult', required: true })
  queryResultId: Types.ObjectId;

  @Prop({ required: true })
  entityId: number; // Entity ID, main character is 0

  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop({ required: true, maxlength: 50 })
  tag: string; // 'people' | 'company'

  @Prop()
  avatarUrl?: string;

  @Prop({ default: 1, min: 1, max: 10 })
  relationshipScore: number; // 1-10

  @Prop({ required: true })
  summary: string;

  @Prop({ required: true })
  description: string; // Markdown format with reference markers

  @Prop({ required: true })
  links: string; // JSON string of links array
}

export const EntityRelationshipSchema =
  SchemaFactory.createForClass(EntityRelationship);
