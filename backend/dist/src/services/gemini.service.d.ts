import { ConfigService } from '@nestjs/config';
import { EntityResponseDto } from '../dto/query.dto';
import { JsonRepairService } from './json-repair.service';
export declare class GeminiService {
    private configService;
    private jsonRepairService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService, jsonRepairService: JsonRepairService);
    structureData(perplexityResponse: string, originalQuery: string): Promise<EntityResponseDto[]>;
}
