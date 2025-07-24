import axios from 'axios';

class ServiceTestScript {
  private baseUrl: string;
  private port: number;

  constructor() {
    this.port = 3000; // 连接到默认的开发服务端口
    this.baseUrl = `http://localhost:${this.port}`;
  }

  async initialize() {
    console.log('🔗 正在连接到运行中的服务...');
    console.log(`服务地址: ${this.baseUrl}`);

    // 检查服务是否可用
    await this.waitForService();
  }

  async waitForService() {
    console.log('⏳ 检查服务连接...');
    let retries = 5;
    while (retries > 0) {
      try {
        await axios.get(`${this.baseUrl}`);
        console.log('✅ 服务连接成功');
        return;
      } catch {
        retries--;
        if (retries === 0) {
          throw new Error(
            `无法连接到服务 ${this.baseUrl}，请确保服务已启动 (pnpm start)`,
          );
        }
        console.log(`连接失败，重试中... (${5 - retries}/5)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  async testHealthCheck() {
    console.log('\n=== 测试健康检查 ===');
    try {
      const response = await axios.get(`${this.baseUrl}`);
      console.log('✅ 健康检查通过');
      console.log('响应状态:', response.status);
      console.log('响应内容:', response.data);
      return true;
    } catch (error) {
      console.error('❌ 健康检查失败:', (error as Error).message);
      return false;
    }
  }

  async testQueryEndpoint() {
    console.log('\n=== 测试查询端点 ===');
    try {
      const testQuery = {
        query: '马斯克',
        queryType: 'person',
      };

      console.log('发送查询请求:', testQuery);
      const startTime = Date.now();

      const response = await axios.post(
        `${this.baseUrl}/api/query`,
        testQuery,
        {
          timeout: 180000, // 3分钟超时，适应更长的API处理时间
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('✅ 查询请求成功');
      console.log('响应状态:', response.status);
      console.log('响应时间:', `${duration}ms`);
      // Use type assertion to avoid unsafe access on response.data
      const entities = (response.data as { entities?: any[] }).entities;
      const queryId = (response.data as { id?: string }).id;
      console.log('实体数量:', Array.isArray(entities) ? entities.length : 0);
      console.log('查询ID:', queryId);

      // Validate response structure
      if (
        response.data.id &&
        response.data.entities &&
        Array.isArray(response.data.entities)
      ) {
        console.log('✅ 响应结构验证通过');
        return response.data;
      } else {
        console.error('❌ 响应结构验证失败');
        return null;
      }
    } catch (error) {
      console.error('❌ 查询请求失败:', error.message);
      if (error.response) {
        console.error('错误状态:', error.response.status);
        console.error('错误详情:', error.response.data);
      }
      return null;
    }
  }

  async testGetQueryResult(queryId: string) {
    console.log('\n=== 测试获取查询结果 ===');
    try {
      const response = await axios.get(`${this.baseUrl}/api/query/${queryId}`);
      console.log('✅ 获取查询结果成功');
      console.log('响应状态:', response.status);
      console.log('查询ID:', response.data.id);
      console.log('原始查询:', response.data.originalQuery);
      return true;
    } catch (error) {
      console.error('❌ 获取查询结果失败:', error.message);
      return false;
    }
  }

  async testGetAllQueries() {
    console.log('\n=== 测试获取所有查询 ===');
    try {
      const response = await axios.get(`${this.baseUrl}/api/query`);
      console.log('✅ 获取所有查询成功');
      console.log('响应状态:', response.status);
      console.log('查询总数:', response.data.length);
      return true;
    } catch (error) {
      console.error('❌ 获取所有查询失败:', error.message);
      return false;
    }
  }

  async testDeleteQuery(queryId: string) {
    console.log('\n=== 测试删除查询 ===');
    try {
      const response = await axios.delete(
        `${this.baseUrl}/api/query/${queryId}`,
      );
      console.log('✅ 删除查询成功');
      console.log('响应状态:', response.status);
      console.log('响应内容:', response.data);
      return true;
    } catch (error) {
      console.error('❌ 删除查询失败:', error.message);
      return false;
    }
  }

  async runFullServiceTest() {
    const testResults = {
      healthCheck: false,
      queryEndpoint: false,
      getQueryResult: false,
      getAllQueries: false,
      deleteQuery: false,
    };

    let queryId: string | null = null;

    try {
      console.log('🧪 开始完整服务测试...');

      // 1. 健康检查
      testResults.healthCheck = await this.testHealthCheck();

      // 2. 测试查询端点
      const queryResult = await this.testQueryEndpoint();
      testResults.queryEndpoint = queryResult !== null;
      if (queryResult) {
        queryId = queryResult.id;
      }

      // 3. 测试获取查询结果
      if (queryId) {
        testResults.getQueryResult = await this.testGetQueryResult(queryId);
      }

      // 4. 测试获取所有查询
      testResults.getAllQueries = await this.testGetAllQueries();

      // 5. 测试删除查询
      if (queryId) {
        testResults.deleteQuery = await this.testDeleteQuery(queryId);
      }

      // 输出测试总结
      this.printTestSummary(testResults);
    } catch (error) {
      console.error('\n❌ 服务测试过程中发生错误:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  printTestSummary(results: any) {
    console.log('\n📊 测试结果总结');
    console.log('==================');

    const tests = [
      { name: '健康检查', result: results.healthCheck },
      { name: '查询端点', result: results.queryEndpoint },
      { name: '获取查询结果', result: results.getQueryResult },
      { name: '获取所有查询', result: results.getAllQueries },
      { name: '删除查询', result: results.deleteQuery },
    ];

    let passedTests = 0;
    tests.forEach((test) => {
      const status = test.result ? '✅ 通过' : '❌ 失败';
      console.log(`${test.name}: ${status}`);
      if (test.result) passedTests++;
    });

    console.log('==================');
    console.log(`总计: ${passedTests}/${tests.length} 测试通过`);

    if (passedTests === tests.length) {
      console.log('🎉 所有服务测试通过！服务运行正常。');
    } else {
      console.log('⚠️  部分测试失败，请检查服务配置和API密钥。');
    }
  }

  async cleanup() {
    console.log('\n🧹 测试完成，清理环境...');
    console.log('✅ 测试环境已清理');
  }
}

async function main() {
  const script = new ServiceTestScript();

  // 处理进程退出信号
  process.on('SIGINT', async () => {
    console.log('\n收到退出信号，正在清理...');
    await script.cleanup();
    process.exit(0);
  });

  try {
    await script.initialize();
    await script.runFullServiceTest();
  } catch (error) {
    console.error('测试脚本执行失败:', error.message);
    await script.cleanup();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ServiceTestScript };
