"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TavilyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TavilyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let TavilyService = TavilyService_1 = class TavilyService {
    configService;
    logger = new common_1.Logger(TavilyService_1.name);
    apiKey;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.apiKey =
            this.configService.get('TAVILY_API_KEY') ||
                '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';
        this.apiUrl =
            this.configService.get('TAVILY_API_URL') ||
                'https://api.tavily.com';
        if (!this.apiKey ||
            this.apiKey === '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') {
            this.logger.warn('⚠️  使用默认Tavily API密钥，可能无效！请在.env文件中配置TAVILY_API_KEY');
        }
    }
    async searchAvatar(name, tag) {
        try {
            if (!this.apiKey) {
                this.logger.warn('Tavily API key not configured, skipping avatar search');
                return null;
            }
            const searchQuery = tag === 'person'
                ? `${name} profile photo headshot portrait`
                : `${name} company logo official`;
            this.logger.log(`Searching avatar for: ${name} (${tag})`);
            const response = await axios_1.default.post(`${this.apiUrl}/search`, {
                api_key: this.apiKey,
                query: searchQuery,
                search_depth: 'basic',
                include_images: true,
                include_answer: false,
                max_results: 5,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            const images = response.data.images || [];
            if (images.length > 0) {
                const firstImage = images[0];
                if (firstImage) {
                    this.logger.log(`Found avatar for ${name}: ${firstImage}`);
                    return firstImage;
                }
            }
            if (images.length === 0) {
                const fallbackQuery = tag === 'person' ? `${name} photo image` : `${name} logo`;
                const fallbackResponse = await axios_1.default.post(`${this.apiUrl}/search`, {
                    api_key: this.apiKey,
                    query: fallbackQuery,
                    search_depth: 'basic',
                    include_images: true,
                    include_answer: false,
                    max_results: 3,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 15000,
                });
                const fallbackImages = fallbackResponse.data.images || [];
                if (fallbackImages.length > 0) {
                    const fallbackImage = fallbackImages[0];
                    this.logger.log(`Found fallback avatar for ${name}: ${fallbackImage}`);
                    return fallbackImage;
                }
            }
            this.logger.log(`No suitable avatar found for ${name}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Error searching avatar for ${name}:`, error.message);
            return null;
        }
    }
    isValidImageUrl(url) {
        try {
            const parsedUrl = new URL(url);
            const pathname = parsedUrl.pathname.toLowerCase();
            const validExtensions = [
                '.jpg',
                '.jpeg',
                '.png',
                '.gif',
                '.webp',
                '.svg',
            ];
            const hasValidExtension = validExtensions.some((ext) => pathname.endsWith(ext));
            const imageHosts = [
                'imgur.com',
                'i.imgur.com',
                'pbs.twimg.com',
                'twitter.com',
                'linkedin.com',
                'media.licdn.com',
                'github.com',
                'avatars.githubusercontent.com',
                'gravatar.com',
                'googleusercontent.com',
                'facebook.com',
                'scontent.xx.fbcdn.net',
                'instagram.com',
                'scontent.cdninstagram.com',
            ];
            const isFromImageHost = imageHosts.some((host) => parsedUrl.hostname.includes(host));
            return (hasValidExtension ||
                isFromImageHost ||
                url.includes('profile') ||
                url.includes('avatar'));
        }
        catch {
            return false;
        }
    }
    isHighQualityImage(url, tag) {
        const urlLower = url.toLowerCase();
        if (tag === 'person') {
            const goodSources = ['linkedin', 'twitter', 'github', 'gravatar'];
            const badIndicators = ['thumb', 'small', '32x32', '64x64', 'icon'];
            const hasGoodSource = goodSources.some((source) => urlLower.includes(source));
            const hasBadIndicator = badIndicators.some((indicator) => urlLower.includes(indicator));
            return hasGoodSource && !hasBadIndicator;
        }
        else {
            const goodIndicators = ['logo', 'brand', 'company'];
            const badIndicators = ['thumb', 'small', 'favicon', '16x16', '32x32'];
            const hasGoodIndicator = goodIndicators.some((indicator) => urlLower.includes(indicator));
            const hasBadIndicator = badIndicators.some((indicator) => urlLower.includes(indicator));
            return hasGoodIndicator && !hasBadIndicator;
        }
    }
};
exports.TavilyService = TavilyService;
exports.TavilyService = TavilyService = TavilyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TavilyService);
//# sourceMappingURL=tavily.service.js.map