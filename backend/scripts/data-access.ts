import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { QueryService } from '../src/services/query.service';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { QueryResult } from '../src/entities/query-result.entity';
import { EntityRelationship } from '../src/entities/entity-relationship.entity';

class DataAccessScript {
  private app: any;
  private queryService: QueryService;
  private queryResultModel: Model<any>;
  private entityRelationshipModel: Model<any>;

  async initialize() {
    this.app = await NestFactory.createApplicationContext(AppModule);
    this.queryService = this.app.get(QueryService);
    this.queryResultModel = this.app.get(getModelToken(QueryResult.name));
    this.entityRelationshipModel = this.app.get(getModelToken(EntityRelationship.name));
  }

  async listAllQueries() {
    console.log('\n=== 所有查询结果 ===');
    const queries = await this.queryService.getAllQueryResults();
    
    if (queries.length === 0) {
      console.log('暂无查询结果');
      return;
    }

    queries.forEach((query, index) => {
      console.log(`\n${index + 1}. ID: ${query.id}`);
      console.log(`   查询: ${query.originalQuery}`);
      console.log(`   类型: ${query.queryType}`);
      console.log(`   实体数量: ${query.entities.length}`);
      console.log(`   创建时间: ${query.createdAt}`);
    });
  }

  async getQueryById(id: string) {
    console.log(`\n=== 查询详情 (ID: ${id}) ===`);
    const query = await this.queryService.getQueryResult(id);
    
    if (!query) {
      console.log('未找到该查询结果');
      return;
    }

    console.log(`查询: ${query.originalQuery}`);
    console.log(`类型: ${query.queryType}`);
    console.log(`创建时间: ${query.createdAt}`);
    console.log(`\n实体列表:`);
    
    query.entities.forEach((entity, index) => {
      console.log(`\n  ${index + 1}. ${entity.name}`);
      console.log(`     标签: ${entity.tag}`);
      console.log(`     关系分数: ${entity.relationship_score}`);
      console.log(`     摘要: ${entity.summary}`);
      if (entity.avatar_url) {
        console.log(`     头像: ${entity.avatar_url}`);
      }
    });
  }

  async getStatistics() {
    console.log('\n=== 数据统计 ===');
    
    const totalQueries = await this.queryResultModel.countDocuments();
    const totalEntities = await this.entityRelationshipModel.countDocuments();
    
    const queryTypes = await this.queryResultModel.aggregate([
      { $group: { _id: '$queryType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`总查询数: ${totalQueries}`);
    console.log(`总实体数: ${totalEntities}`);
    
    // 检查孤立的实体（没有对应查询结果的实体）
    const orphanedEntities = await this.entityRelationshipModel.aggregate([
      {
        $lookup: {
          from: 'query_results',
          localField: 'queryResultId',
          foreignField: '_id',
          as: 'queryResult'
        }
      },
      {
        $match: {
          queryResult: { $size: 0 }
        }
      },
      {
        $count: 'orphanedCount'
      }
    ]);
    
    const orphanedCount = orphanedEntities.length > 0 ? orphanedEntities[0].orphanedCount : 0;
    console.log(`孤立实体数（无对应查询结果）: ${orphanedCount}`);
    
    console.log('\n查询类型分布:');
    if (queryTypes.length === 0) {
      console.log('  暂无查询记录');
    } else {
      queryTypes.forEach(type => {
        console.log(`  ${type._id}: ${type.count}`);
      });
    }
    
    // 如果有孤立实体，显示详细信息
    if (orphanedCount > 0) {
      console.log('\n=== 孤立实体详情 ===');
      const orphanedEntityDetails = await this.entityRelationshipModel.find({
        $expr: {
          $not: {
            $in: [
              '$queryResultId',
              { $map: { input: await this.queryResultModel.find().distinct('_id'), as: 'id', in: '$$id' } }
            ]
          }
        }
      }).limit(10);
      
      orphanedEntityDetails.forEach((entity, index) => {
        console.log(`\n${index + 1}. ${entity.name}`);
        console.log(`   标签: ${entity.tag}`);
        console.log(`   查询结果ID: ${entity.queryResultId}`);
        console.log(`   关系分数: ${entity.relationshipScore}`);
        console.log(`   创建时间: ${entity.createdAt}`);
      });
      
      if (orphanedCount > 10) {
        console.log(`\n... 还有 ${orphanedCount - 10} 个孤立实体`);
      }
    }
  }

  async searchQueries(keyword: string) {
    console.log(`\n=== 搜索查询 (关键词: ${keyword}) ===`);
    
    const queries = await this.queryResultModel.find({
      originalQuery: { $regex: keyword, $options: 'i' }
    }).sort({ createdAt: -1 });

    if (queries.length === 0) {
      console.log('未找到匹配的查询');
      return;
    }

    queries.forEach((query, index) => {
      console.log(`\n${index + 1}. ID: ${query._id}`);
      console.log(`   查询: ${query.originalQuery}`);
      console.log(`   类型: ${query.queryType}`);
      console.log(`   创建时间: ${query.createdAt}`);
    });
  }

  async deleteQuery(id: string) {
    console.log(`\n=== 删除查询 (ID: ${id}) ===`);
    const success = await this.queryService.deleteQueryResult(id);
    
    if (success) {
      console.log('查询删除成功');
    } else {
      console.log('查询删除失败或未找到');
    }
  }

  async cleanOrphanedEntities() {
    console.log('\n=== 清理孤立实体 ===');
    
    try {
      // 查找所有孤立的实体
      const orphanedEntities = await this.entityRelationshipModel.aggregate([
        {
          $lookup: {
            from: 'query_results',
            localField: 'queryResultId',
            foreignField: '_id',
            as: 'queryResult'
          }
        },
        {
          $match: {
            queryResult: { $size: 0 }
          }
        }
      ]);
      
      if (orphanedEntities.length === 0) {
        console.log('没有发现孤立实体');
        return;
      }
      
      console.log(`发现 ${orphanedEntities.length} 个孤立实体`);
      
      // 删除孤立实体
      const orphanedIds = orphanedEntities.map(entity => entity._id);
      const deleteResult = await this.entityRelationshipModel.deleteMany({
        _id: { $in: orphanedIds }
      });
      
      console.log(`成功删除 ${deleteResult.deletedCount} 个孤立实体`);
      
    } catch (error) {
      console.error('清理孤立实体时发生错误:', error.message);
    }
  }

  async close() {
    await this.app.close();
  }
}

async function main() {
  const script = new DataAccessScript();
  await script.initialize();

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'list':
        await script.listAllQueries();
        break;
      
      case 'get':
        const id = args[1];
        if (!id) {
          console.log('请提供查询ID: npm run data get <id>');
          break;
        }
        await script.getQueryById(id);
        break;
      
      case 'stats':
        await script.getStatistics();
        break;
      
      case 'search':
        const keyword = args[1];
        if (!keyword) {
          console.log('请提供搜索关键词: npm run data search <keyword>');
          break;
        }
        await script.searchQueries(keyword);
        break;
      
      case 'delete':
        const deleteId = args[1];
        if (!deleteId) {
          console.log('请提供要删除的查询ID: npm run data delete <id>');
          break;
        }
        await script.deleteQuery(deleteId);
        break;
      
      case 'clean':
        await script.cleanOrphanedEntities();
        break;
      
      default:
        console.log('\n可用命令:');
        console.log('  npm run data list          - 列出所有查询');
        console.log('  npm run data get <id>      - 获取特定查询详情');
        console.log('  npm run data stats         - 显示数据统计');
        console.log('  npm run data search <word> - 搜索查询');
        console.log('  npm run data delete <id>   - 删除查询');
        console.log('  npm run data clean         - 清理孤立实体');
        break;
    }
  } catch (error) {
    console.error('执行错误:', error.message);
  } finally {
    await script.close();
  }
}

if (require.main === module) {
  main();
}