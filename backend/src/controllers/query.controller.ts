import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { QueryService } from '../services/query.service';
import { QueryRequestDto, QueryResponseDto } from '../dto/query.dto';

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

  @Get(':id')
  async getQueryResult(
    @Param('id') id: string, // Changed from ParseIntPipe to string for MongoDB ObjectId
  ): Promise<QueryResponseDto> {
    try {
      const result = await this.queryService.getQueryResult(id);
      if (!result) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Query result not found',
            message: `Query result with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to get query result',
          message: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllQueryResults(): Promise<QueryResponseDto[]> {
    try {
      return await this.queryService.getAllQueryResults();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to get query results',
          message: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteQueryResult(
    @Param('id') id: string, // Changed from ParseIntPipe to string for MongoDB ObjectId
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deleted = await this.queryService.deleteQueryResult(id);
      if (!deleted) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Query result not found',
            message: `Query result with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: `Query result with ID ${id} deleted successfully`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to delete query result',
          message: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
