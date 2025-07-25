import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EntityResponseDto } from '../dto/query.dto';
import { JsonRepairService } from './json-repair.service';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    private jsonRepairService: JsonRepairService,
  ) {
    // 优先使用环境变量，否则使用硬编码密钥
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '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';
    this.apiUrl = this.configService.get<string>('OPENROUTER_API_URL') || 'https://openrouter.ai/api/v1/chat/completions';
    
    if (this.apiKey === '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' && !this.configService.get<string>('OPENROUTER_API_KEY')) {
      this.logger.warn('⚠️  您正在使用硬编码的API密钥。为了安全起见，建议在 .env 文件中配置 OPENROUTER_API_KEY');
    }
  }

  async structureData(
    perplexityResponse: string,
    originalQuery: string,
  ): Promise<EntityResponseDto[]> {
    try {
      const prompt = `请将以下搜索结果转换为结构化的JSON数据。原始查询是："${originalQuery}"

搜索结果：
${perplexityResponse}

详细要求：
1. 识别主要人物或公司作为id=0的主角
2. 识别与主角相关的其他重要实体（人物、公司），分析10-12个最重要的相关实体以构建核心关系网络
3. 评估关系紧密度（1-10分）：
   - 9-10分: 直接业务伙伴、创始团队、家庭成员
   - 7-8分: 重要投资人、核心员工、战略合作伙伴
   - 5-6分: 同行业竞争对手、间接合作伙伴
   - 3-4分: 媒体报道中提及的相关人物
   - 1-2分: 偶然提及或间接关联
4. 深度分析每个实体的背景信息，包括但不限于：
   - 个人/公司基本信息（年龄、职业、成立时间等）
   - 教育背景和工作经历
   - 主要成就和里程碑事件
   - 与主角的具体关系和互动历史
   - 相关新闻事件和时间线
   - 社会影响力和行业地位
5. 提取详细的支持信息原文片段作为证据
6. 确保所有链接都是有效的，优先使用权威来源
7. description中的引用标记要与links数组中的index对应
8. summary要简洁精准，不超过40字，突出最核心的身份和关系
9. description要详细但精炼（600-800字），使用丰富的Markdown格式：
   - 使用## 和 ### 标题组织内容结构
   - 使用**粗体**强调重要信息
   - 使用*斜体*标注特殊术语
   - 使用> 引用块展示重要声明
   - 使用- 列表展示成就和事件
   - 包含详细的引用标记如[1], [2], [3]等
   - 按时间线或重要性组织信息
   - 深入分析关系的形成过程和发展历程

返回格式必须是有效的JSON数组：
[
  {
    "id": 0,
    "name": "实体名称",
    "tag": "people" | "company",
    "avatar_url": "头像或Logo链接，没有则为空字符串",
    "relationship_score": 数字1-10,
    "summary": "简短摘要，不超过40字",
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

重要规则：
- 直接返回有效的JSON数组，不要包含任何额外的文字解释或代码块标记
- 确保JSON格式完全正确，所有字符串都要用双引号包围
- 确保所有括号和大括号都正确闭合
- 如果内容过长导致截断，请优先保证JSON完整性，可以适当缩减描述长度
- 每个description控制在800字以内，确保整体响应不超过token限制`;

      const payload = {
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的数据结构化专家，专门将非结构化的人物信息转换为标准化的JSON格式。你必须严格按照指定的JSON格式返回数据，直接返回完整且有效的JSON数组。重要：确保JSON格式完全正确，所有字符串用双引号，所有括号正确闭合，不要包含任何额外的文字、解释或代码块标记。如果内容可能超长，请优先保证JSON完整性。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 6000, // 减少到6000以避免JSON截断问题
      };

      const response = await axios.post<OpenRouterResponse>(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://traller.ai',
          'X-Title': 'Traller AI - Persona Intelligence Explorer',
        },
        timeout: 180000,
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenRouter response');
      }

      const structuredData = this.jsonRepairService.parse<EntityResponseDto[]>(content);
      
      // 验证数据格式
      if (!Array.isArray(structuredData)) {
        throw new Error('Response is not an array');
      }

      // 验证每个实体的必需字段
      for (const entity of structuredData) {
        if (!entity.id && entity.id !== 0) {
          throw new Error(`Entity missing id: ${JSON.stringify(entity)}`);
        }
        if (!entity.name) {
          throw new Error(`Entity missing name: ${JSON.stringify(entity)}`);
        }
        if (!entity.tag || !['people', 'company', 'event'].includes(entity.tag)) {
          throw new Error(`Entity has invalid tag: ${entity.tag}`);
        }
        if (!entity.summary) {
          throw new Error(`Entity missing summary: ${JSON.stringify(entity)}`);
        }
        if (!entity.description) {
          throw new Error(`Entity missing description: ${JSON.stringify(entity)}`);
        }
        if (!Array.isArray(entity.links)) {
          throw new Error(`Entity links is not an array: ${JSON.stringify(entity)}`);
        }
      }

      this.logger.log(`✅ Successfully structured ${structuredData.length} entities`);
      return structuredData;

    } catch (error) {
      this.logger.error('Error calling Gemini API:', error.message);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
} 