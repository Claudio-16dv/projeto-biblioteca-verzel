import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService, UserSummary } from './users.service';

@ApiTags('leitores')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os leitores cadastrados' })
  findAll(): Promise<UserSummary[]> {
    return this.usersService.findAll();
  }
}
