import { Document, Types } from 'mongoose';
export type EntityRelationshipDocument = EntityRelationship & Document;
export declare class EntityRelationship {
    _id: Types.ObjectId;
    queryResultId: Types.ObjectId;
    entityId: number;
    name: string;
    tag: string;
    avatarUrl?: string;
    relationshipScore: number;
    summary: string;
    description: string;
    links: string;
}
export declare const EntityRelationshipSchema: import("mongoose").Schema<EntityRelationship, import("mongoose").Model<EntityRelationship, any, any, any, Document<unknown, any, EntityRelationship, any> & EntityRelationship & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EntityRelationship, Document<unknown, {}, import("mongoose").FlatRecord<EntityRelationship>, {}> & import("mongoose").FlatRecord<EntityRelationship> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
