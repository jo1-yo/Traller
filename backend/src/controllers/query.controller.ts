import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { QueryService } from '../services/query.service';
import {
  QueryRequestDto,
  QueryResponseDto,
  SearchHistoryResponseDto,
} from '../dto/query.dto';

@Controller('api/query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  async processQuery(
    @Body(new ValidationPipe()) queryRequest: QueryRequestDto,
  ): Promise<QueryResponseDto> {
    try {
      return await this.queryService.processQuery(queryRequest);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Query processing failed',
          message: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  async getSearchHistory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<SearchHistoryResponseDto> {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      return await this.queryService.getSearchHistory(pageNum, limitNum);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch search history',
          message: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getQueryById(@Param('id') id: string): Promise<QueryResponseDto> {
    try {
      return await this.queryService.getQueryResultById(id);
    } catch (error) {
      const statusCode = (error as Error).message.includes('not found')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          status: statusCode,
          error: 'Failed to fetch query result',
          message: (error as Error).message,
        },
        statusCode,
      );
    }
  }
}
