"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTestScript = void 0;
const axios_1 = require("axios");
class ServiceTestScript {
    baseUrl;
    port;
    constructor() {
        this.port = 3000;
        this.baseUrl = `http://localhost:${this.port}`;
    }
    async initialize() {
        console.log('🔗 正在连接到运行中的服务...');
        console.log(`服务地址: ${this.baseUrl}`);
        await this.waitForService();
    }
    async waitForService() {
        console.log('⏳ 检查服务连接...');
        let retries = 5;
        while (retries > 0) {
            try {
                await axios_1.default.get(`${this.baseUrl}`);
                console.log('✅ 服务连接成功');
                return;
            }
            catch {
                retries--;
                if (retries === 0) {
                    throw new Error(`无法连接到服务 ${this.baseUrl}，请确保服务已启动 (pnpm run start:dev)`);
                }
                console.log(`连接失败，重试中... (${5 - retries}/5)`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
    }
    async testHealthCheck() {
        console.log('\n=== 测试健康检查 ===');
        try {
            const response = await axios_1.default.get(`${this.baseUrl}`);
            console.log('✅ 健康检查通过');
            console.log('响应状态:', response.status);
            console.log('响应内容:', response.data);
            return true;
        }
        catch (error) {
            console.error('❌ 健康检查失败:', error.message);
            return false;
        }
    }
    async testQueryEndpoint(query = '马云', queryType = 'person') {
        console.log('\n=== 测试查询端点 ===');
        try {
            const testQuery = {
                query,
                queryType,
            };
            console.log('发送查询请求:', testQuery);
            console.log('⏳ 请耐心等待，AI分析需要1-2分钟...');
            const startTime = Date.now();
            const response = await axios_1.default.post(`${this.baseUrl}/api/query`, testQuery, {
                timeout: 180000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            console.log('✅ 查询请求成功');
            console.log('响应状态:', response.status);
            console.log('响应时间:', `${duration}秒`);
            const data = response.data;
            console.log('查询ID:', data.id);
            console.log('原始查询:', data.originalQuery);
            console.log('实体数量:', data.entities?.length || 0);
            if (data.entities && Array.isArray(data.entities)) {
                console.log('\n📊 返回的实体:');
                data.entities.forEach((entity, index) => {
                    console.log(`  ${index + 1}. ${entity.name} (${entity.tag})`);
                    console.log(`     关系评分: ${entity.relationship_score}/10`);
                    console.log(`     摘要: ${entity.summary}`);
                    if (entity.avatar_url) {
                        console.log(`     头像: ${entity.avatar_url}`);
                    }
                });
            }
            if (data.id && data.entities && Array.isArray(data.entities)) {
                console.log('✅ 响应结构验证通过');
                return data;
            }
            else {
                console.error('❌ 响应结构验证失败');
                console.error('预期字段: id, entities (数组)');
                console.error('实际响应:', Object.keys(data));
                return null;
            }
        }
        catch (error) {
            console.error('❌ 查询请求失败:', error.message);
            if (error.response) {
                console.error('错误状态:', error.response.status);
                console.error('错误详情:', error.response.data);
            }
            return null;
        }
    }
    async testMultipleQueries() {
        console.log('\n=== 测试多个查询 ===');
        const testCases = [
            { query: '马云', queryType: 'person' },
            { query: 'Elon Musk', queryType: 'person' },
            { query: '字节跳动', queryType: 'company' },
        ];
        let successCount = 0;
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`\n📝 测试 ${i + 1}/${testCases.length}: ${testCase.query}`);
            const result = await this.testQueryEndpoint(testCase.query, testCase.queryType);
            if (result) {
                successCount++;
                console.log(`✅ 测试 "${testCase.query}" 成功`);
            }
            else {
                console.log(`❌ 测试 "${testCase.query}" 失败`);
            }
            if (i < testCases.length - 1) {
                console.log('⏳ 等待5秒避免API限制...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        console.log(`\n📊 多查询测试结果: ${successCount}/${testCases.length} 成功`);
        return successCount === testCases.length;
    }
    async testErrorHandling() {
        console.log('\n=== 测试错误处理 ===');
        try {
            console.log('测试空查询...');
            const response = await axios_1.default.post(`${this.baseUrl}/api/query`, { query: '', queryType: 'other' }, {
                timeout: 10000,
                validateStatus: () => true
            });
            if (response.status >= 400) {
                console.log('✅ 空查询正确返回错误状态:', response.status);
                return true;
            }
            else {
                console.log('⚠️ 空查询未返回预期的错误状态');
                return false;
            }
        }
        catch (error) {
            console.log('✅ 空查询正确抛出异常:', error.message);
            return true;
        }
    }
    async runFullServiceTest() {
        const testResults = {
            healthCheck: false,
            singleQuery: false,
            multipleQueries: false,
            errorHandling: false,
        };
        try {
            console.log('🧪 开始完整服务测试...');
            console.log('📋 测试内容: 健康检查 + 单查询 + 多查询 + 错误处理');
            testResults.healthCheck = await this.testHealthCheck();
            const queryResult = await this.testQueryEndpoint();
            testResults.singleQuery = queryResult !== null;
            console.log('\n⚠️  多查询测试会消耗较多API配额，是否继续？');
            console.log('如需跳过，请在10秒内按Ctrl+C');
            await new Promise(resolve => setTimeout(resolve, 10000));
            testResults.multipleQueries = await this.testMultipleQueries();
            testResults.errorHandling = await this.testErrorHandling();
            this.printTestSummary(testResults);
        }
        catch (error) {
            console.error('\n❌ 服务测试过程中发生错误:', error.message);
        }
        finally {
            await this.cleanup();
        }
    }
    printTestSummary(results) {
        console.log('\n📊 测试结果总结');
        console.log('==================');
        const tests = [
            { name: '健康检查', result: results.healthCheck },
            { name: '单个查询', result: results.singleQuery },
            { name: '多个查询', result: results.multipleQueries },
            { name: '错误处理', result: results.errorHandling },
        ];
        let passedTests = 0;
        tests.forEach((test) => {
            const status = test.result ? '✅ 通过' : '❌ 失败';
            console.log(`${test.name}: ${status}`);
            if (test.result)
                passedTests++;
        });
        console.log('==================');
        console.log(`总计: ${passedTests}/${tests.length} 测试通过`);
        if (passedTests === tests.length) {
            console.log('🎉 所有服务测试通过！服务运行正常。');
            console.log('💡 提示: 现在可以启动前端 (cd frontend && pnpm run dev)');
        }
        else if (passedTests >= 2) {
            console.log('⚠️  基础功能正常，部分高级测试失败。');
            console.log('💡 建议: 检查API密钥配置和网络连接。');
        }
        else {
            console.log('❌ 多数测试失败，请检查服务配置。');
            console.log('💡 排查: 确认API密钥、网络连接和服务启动状态。');
        }
    }
    async cleanup() {
        console.log('\n🧹 测试完成，清理环境...');
        console.log('✅ 测试环境已清理');
    }
}
exports.ServiceTestScript = ServiceTestScript;
async function main() {
    const script = new ServiceTestScript();
    process.on('SIGINT', async () => {
        console.log('\n收到退出信号，正在清理...');
        await script.cleanup();
        process.exit(0);
    });
    try {
        await script.initialize();
        const args = process.argv.slice(2);
        const command = args[0];
        switch (command) {
            case 'quick':
                console.log('🚀 执行快速测试（仅健康检查和单查询）');
                const quickResults = { healthCheck: false, singleQuery: false };
                quickResults.healthCheck = await script.testHealthCheck();
                const result = await script.testQueryEndpoint();
                quickResults.singleQuery = result !== null;
                console.log('\n📊 快速测试结果:');
                console.log('健康检查:', quickResults.healthCheck ? '✅ 通过' : '❌ 失败');
                console.log('单个查询:', quickResults.singleQuery ? '✅ 通过' : '❌ 失败');
                break;
            case 'full':
            default:
                await script.runFullServiceTest();
                break;
        }
    }
    catch (error) {
        console.error('测试脚本执行失败:', error.message);
        await script.cleanup();
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=test-service.js.map