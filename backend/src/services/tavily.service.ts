import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  raw_content?: string;
}

interface TavilyResponse {
  answer: string;
  query: string;
  response_time: number;
  images: string[];
  results: TavilySearchResult[];
  search_depth: string;
  follow_up_questions?: string[];
}

@Injectable()
export class TavilyService {
  private readonly logger = new Logger(TavilyService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    // 优先使用环境变量，否则使用硬编码密钥
    this.apiKey =
      this.configService.get<string>('TAVILY_API_KEY') ||
      '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';
    this.apiUrl =
      this.configService.get<string>('TAVILY_API_URL') ||
      'https://api.tavily.com';

    if (
      !this.apiKey ||
      this.apiKey === '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'
    ) {
      this.logger.warn(
        '⚠️  使用默认Tavily API密钥，可能无效！请在.env文件中配置TAVILY_API_KEY',
      );
    }
  }

  /**
   * Search for avatar image URL based on entity name and tag
   * @param name - Name of the person or company
   * @param tag - Type of entity ('people' or 'company')
   * @returns Promise<string | null> - Avatar URL or null if not found
   */
  async searchAvatar(
    name: string,
    tag: 'people' | 'company',
  ): Promise<string | null> {
    try {
      if (!this.apiKey) {
        this.logger.warn(
          'Tavily API key not configured, skipping avatar search',
        );
        return null;
      }

      // Construct search query based on entity type
      const searchQuery =
        tag === 'people'
          ? `${name} profile photo headshot portrait`
          : `${name} company logo official`;

      this.logger.log(`Searching avatar for: ${name} (${tag})`);

      const response: AxiosResponse<TavilyResponse> = await axios.post(
        `${this.apiUrl}/search`,
        {
          api_key: this.apiKey,
          query: searchQuery,
          search_depth: 'basic',
          include_images: true,
          include_answer: false,
          max_results: 5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        },
      );

      // Extract images from response
      const images = response.data.images || [];
      if (images.length > 0) {
        // Filter for valid image URLs and prefer the first one
        const validImage = images.find(
          (url) =>
            this.isValidImageUrl(url) && this.isHighQualityImage(url, tag),
        );

        if (validImage) {
          this.logger.log(`Found avatar for ${name}: ${validImage}`);
          return validImage;
        }
      }

      // Try fallback search with different query if no images found
      if (images.length === 0) {
        const fallbackQuery =
          tag === 'people' ? `${name} photo image` : `${name} logo`;

        const fallbackResponse: AxiosResponse<TavilyResponse> =
          await axios.post(
            `${this.apiUrl}/search`,
            {
              api_key: this.apiKey,
              query: fallbackQuery,
              search_depth: 'basic',
              include_images: true,
              include_answer: false,
              max_results: 3,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 15000,
            },
          );

        const fallbackImages = fallbackResponse.data.images || [];
        const validFallbackImage = fallbackImages.find((url) =>
          this.isValidImageUrl(url),
        );

        if (validFallbackImage) {
          this.logger.log(
            `Found fallback avatar for ${name}: ${validFallbackImage}`,
          );
          return validFallbackImage;
        }
      }

      this.logger.log(`No suitable avatar found for ${name}`);
      return null;
    } catch (error) {
      this.logger.error(
        `Error searching avatar for ${name}:`,
        (error as Error).message,
      );
      return null;
    }
  }

  /**
   * Validate if URL is a valid image URL
   */
  private isValidImageUrl(url: string): boolean {
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

      // Check file extension
      const hasValidExtension = validExtensions.some((ext) =>
        pathname.endsWith(ext),
      );

      // Check for common image hosting domains
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

      const isFromImageHost = imageHosts.some((host) =>
        parsedUrl.hostname.includes(host),
      );

      return (
        hasValidExtension ||
        isFromImageHost ||
        url.includes('profile') ||
        url.includes('avatar')
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if image URL appears to be high quality based on entity type
   */
  private isHighQualityImage(url: string, tag: 'people' | 'company'): boolean {
    const urlLower = url.toLowerCase();

    if (tag === 'people') {
      // Prefer professional profile photos
      const goodSources = ['linkedin', 'twitter', 'github', 'gravatar'];
      const badIndicators = ['thumb', 'small', '32x32', '64x64', 'icon'];

      const hasGoodSource = goodSources.some((source) =>
        urlLower.includes(source),
      );
      const hasBadIndicator = badIndicators.some((indicator) =>
        urlLower.includes(indicator),
      );

      return hasGoodSource && !hasBadIndicator;
    } else {
      // For companies, prefer logos
      const goodIndicators = ['logo', 'brand', 'company'];
      const badIndicators = ['thumb', 'small', 'favicon', '16x16', '32x32'];

      const hasGoodIndicator = goodIndicators.some((indicator) =>
        urlLower.includes(indicator),
      );
      const hasBadIndicator = badIndicators.some((indicator) =>
        urlLower.includes(indicator),
      );

      return hasGoodIndicator && !hasBadIndicator;
    }
  }
}
