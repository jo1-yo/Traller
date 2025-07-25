import {
  Controller,
  Post,
  Body,
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
}
