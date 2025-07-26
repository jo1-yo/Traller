import { QueryService } from '../services/query.service';
import { QueryRequestDto, QueryResponseDto, SearchHistoryResponseDto } from '../dto/query.dto';
export declare class QueryController {
    private readonly queryService;
    constructor(queryService: QueryService);
    processQuery(queryRequest: QueryRequestDto): Promise<QueryResponseDto>;
    getSearchHistory(page?: string, limit?: string): Promise<SearchHistoryResponseDto>;
    getQueryById(id: string): Promise<QueryResponseDto>;
}
