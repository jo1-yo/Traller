import { ConfigService } from '@nestjs/config';
export declare class TavilyService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    searchAvatar(name: string, tag: 'person' | 'company'): Promise<string | null>;
    private isValidImageUrl;
    private isHighQualityImage;
}
