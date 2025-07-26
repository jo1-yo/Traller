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
var PerplexityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerplexityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let PerplexityService = PerplexityService_1 = class PerplexityService {
    configService;
    logger = new common_1.Logger(PerplexityService_1.name);
    apiKey;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.apiKey =
            this.configService.get('PERPLEXITY_API_KEY') ||
                'pplx-dev-jd3sqGjVa3LTGRAUItDiwoT7zvlXvsRz';
        this.apiUrl =
            this.configService.get('PERPLEXITY_API_URL') ||
                'https://api.perplexity.ai';
        if (!this.apiKey ||
            this.apiKey === 'pplx-dev-jd3sqGjVa3LTGRAUItDiwoT7zvlXvsRz') {
            this.logger.warn('⚠️  使用默认Perplexity API密钥，可能无效！请在.env文件中配置PERPLEXITY_API_KEY');
        }
    }
    async searchInformation(query) {
        const maxRetries = 3;
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.log(`Perplexity API attempt ${attempt}/${maxRetries} for query: ${query}`);
                const prompt = `请搜索关于"${query}"的全面深度信息，构建完整的人物/公司关系网络。请包括：

## 核心信息
1. **基本信息**：姓名、年龄、性别、国籍、现任职务、公司职位
2. **联系方式**：官方网站、社交媒体账号、联系邮箱（如果公开）
3. **教育背景**：毕业院校、专业、学位、重要导师或同学关系
4. **工作经历**：完整的职业发展轨迹，包括时间、职位、公司

## 关系网络分析
5. **家庭关系**：配偶、子女、父母、兄弟姐妹等重要家庭成员
6. **商业伙伴**：共同创业者、投资人、被投公司、董事会成员
7. **同事关系**：现任和前任重要同事、下属、上级
8. **行业关系**：同行业的竞争对手、合作伙伴、客户、供应商
9. **社交关系**：朋友、导师、学生、社区关系、公益合作

## 深度背景
10. **重要事件**：创业历程、重大决策、失败经历、成功案例
11. **媒体报道**：近期新闻、采访内容、公开演讲、观点态度
12. **争议事件**：法律纠纷、商业争议、社会争议（如有）
13. **影响力评估**：行业地位、社会影响、获奖记录、认证资质
14. **财务状况**：公司估值、个人财富、投资组合（公开信息）

## 特别关注
15. **创新成果**：专利、产品、技术、商业模式创新
16. **领导风格**：管理理念、企业文化、团队建设方式
17. **未来规划**：公开的战略规划、扩张计划、投资方向

请提供每条信息的具体来源链接，确保信息的准确性和可验证性。对于每个相关人物和公司，请详细说明其与查询对象的具体关系、合作历史、互动频率和关系紧密程度。

要求信息尽可能详细、准确、最新，包含丰富的上下文背景和深度分析。`;
                const response = await axios_1.default.post(`${this.apiUrl}/chat/completions`, {
                    model: 'sonar-pro',
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    stream: false,
                    max_tokens: 8000,
                    temperature: 0.3,
                }, {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 180000,
                });
                if (response.data.choices && response.data.choices.length > 0) {
                    this.logger.log(`✅ Perplexity API successful on attempt ${attempt}`);
                    return response.data.choices[0].message.content;
                }
                throw new Error('No response from Perplexity API');
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`❌ Perplexity API attempt ${attempt} failed:`, error.message);
                if (attempt === maxRetries) {
                    this.logger.error('All Perplexity API attempts failed:', error.message);
                    break;
                }
                const waitTime = attempt * 2000;
                this.logger.log(`⏳ Waiting ${waitTime}ms before retry...`);
                await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
        }
        throw new Error(`Perplexity API error: ${lastError?.message || 'Unknown error'}`);
    }
};
exports.PerplexityService = PerplexityService;
exports.PerplexityService = PerplexityService = PerplexityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PerplexityService);
//# sourceMappingURL=perplexity.service.js.map