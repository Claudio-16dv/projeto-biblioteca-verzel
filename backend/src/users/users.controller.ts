import { Controller, Get } from '@nestjs/common';
import { UsersService, UserSummary } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserSummary[]> {
    return this.usersService.findAll();
  }
}
