import { Document, Types } from 'mongoose';
export type QueryResultDocument = QueryResult & Document;
export declare class QueryResult {
    _id: Types.ObjectId;
    originalQuery: string;
    queryType: string;
    structuredData: string;
    perplexityResponse?: string;
    kimiResponse?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const QueryResultSchema: import("mongoose").Schema<QueryResult, import("mongoose").Model<QueryResult, any, any, any, Document<unknown, any, QueryResult, any> & QueryResult & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QueryResult, Document<unknown, {}, import("mongoose").FlatRecord<QueryResult>, {}> & import("mongoose").FlatRecord<QueryResult> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
