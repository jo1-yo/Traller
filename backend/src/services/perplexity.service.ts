import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class PerplexityService {
  private readonly logger = new Logger(PerplexityService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PERPLEXITY_API_KEY') || '';
    this.apiUrl =
      this.configService.get<string>('PERPLEXITY_API_URL') ||
      'https://api.perplexity.ai';
  }

  async searchInformation(query: string): Promise<string> {
    try {
      const prompt = `请搜索关于"${query}"的详细信息，包括：
1. 基本信息（姓名、职业、公司等）
2. 社交媒体账号和联系方式
3. 教育背景和工作经历
4. 关键成就和项目
5. 相关的人物和公司关系
6. 新闻报道和公开信息
7. 提供所有信息的来源链接

请提供尽可能详细和准确的信息，包含所有相关的链接和证据。`;

      const response: AxiosResponse<PerplexityResponse> = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'sonar-reasoning',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: false, // 设置为false以获取完整响应，避免流式处理的复杂性
          max_tokens: 4000, // 增加最大token数
          temperature: 0.3, // 降低温度以获得更稳定的结果
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 设置2分钟超时
        },
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }

      throw new Error('No response from Perplexity API');
    } catch (error) {
      this.logger.error(
        'Error calling Perplexity API:',
        (error as Error).message,
      );
      throw new Error(`Perplexity API error: ${(error as Error).message}`);
    }
  }
}
