import { ConfigService } from '@nestjs/config';
export declare class PerplexityService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    searchInformation(query: string): Promise<string>;
}
