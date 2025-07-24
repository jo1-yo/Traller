import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { EntityResponseDto } from '../dto/query.dto';
import { model } from 'mongoose';

interface KimiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class KimiService {
  private readonly logger = new Logger(KimiService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('KIMI_API_KEY') || '';
    this.apiUrl =
      this.configService.get<string>('KIMI_API_URL') ||
      'https://api-sg.moonshot.ai/v1';
  }

  async structureData(
    perplexityResponse: string,
    originalQuery: string,
  ): Promise<EntityResponseDto[]> {
    try {
      const prompt = `请将以下搜索结果转换为结构化的JSON数据。原始查询是："${originalQuery}"

搜索结果：
${perplexityResponse}

请按照以下JSON格式返回数据，确保返回一个数组，主角的id为0：

[
  {
    "id": 0, // 主角为0，其他实体递增
    "name": "实体名称",
    "tag": "people" | "company", // 只能是这两个值之一
    "avatar_url": "头像或Logo链接" | null,
    "relationship_score": 数字1-10, // 与主角的关系紧密度
    "summary": "简短摘要，适合卡片显示",
    "description": "详细描述，Markdown格式，包含引用标记如[1], [2]",
    "links": [
      {
        "index": 1,
        "url": "https://example.com/source_one"
      },
      {
        "index": 2,
        "url": "https://example.com/source_two"
      }
    ]
  }
]

要求：
1. 识别主要人物或公司作为id=0的主角
2. 识别与主角相关的其他实体（人物、公司）
3. 评估关系紧密度（1-10分）
4. 提取支持信息的原文片段作为证据
5. 确保所有链接都是有效的
6. description中的引用标记要与links数组中的index对应
7. 只返回JSON数组，不要其他文字说明`;

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          // model: 'kimi-k2-0711-preview',
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content:
                '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。你是一个数据结构化专家，必须只返回有效的JSON数组，不要任何额外的文字或解释。专注于从提供的文本中提取实体、关系和证据。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3, // 降低温度以获得更稳定的JSON输出
          max_tokens: 3000, // 增加最大token数
          stream: true, // 启用流式响应
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 90000, // 设置90秒超时
          responseType: 'stream', // 设置响应类型为流
        },
      );

      // 处理流式响应
      let fullContent = '';
      
      return new Promise<EntityResponseDto[]>((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                // 流结束，处理完整内容
                try {
                  // 清理可能的markdown代码块标记
                  const cleanContent = fullContent.replace(/```json\n?|```\n?/g, '').trim();
                  const structuredData: unknown = JSON.parse(cleanContent);

                  // 验证数据格式
                  if (Array.isArray(structuredData)) {
                    resolve(structuredData as EntityResponseDto[]);
                  } else {
                    reject(new Error('Response is not an array'));
                  }
                } catch (parseError) {
                  this.logger.error(
                    'Failed to parse Kimi response as JSON:',
                    parseError instanceof Error ? parseError.message : 'Unknown error',
                  );
                  this.logger.error('Raw content:', fullContent);
                  reject(new Error('Invalid JSON response from Kimi API'));
                }
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  fullContent += parsed.choices[0].delta.content;
                }
              } catch (e) {
                // 忽略解析错误的数据块
              }
            }
          }
        });
        
        response.data.on('end', () => {
          // 如果没有收到 [DONE] 标记，尝试解析已收集的内容
          if (fullContent) {
            try {
              const cleanContent = fullContent.replace(/```json\n?|```\n?/g, '').trim();
              const structuredData: unknown = JSON.parse(cleanContent);

              if (Array.isArray(structuredData)) {
                resolve(structuredData as EntityResponseDto[]);
              } else {
                reject(new Error('Response is not an array'));
              }
            } catch (parseError) {
              this.logger.error(
                'Failed to parse Kimi response as JSON:',
                parseError instanceof Error ? parseError.message : 'Unknown error',
              );
              this.logger.error('Raw content:', fullContent);
              reject(new Error('Invalid JSON response from Kimi API'));
            }
          } else {
            reject(new Error('No content received from Kimi API'));
          }
        });
        
        response.data.on('error', (error: Error) => {
          this.logger.error('Stream error:', error.message);
          reject(new Error(`Stream error: ${error.message}`));
        });
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error calling Kimi API:', errorMessage);
      throw new Error(`Kimi API error: ${errorMessage}`);
    }
  }
}
