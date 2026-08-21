import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { LoansModule } from './loans/loans.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, BooksModule, UsersModule, LoansModule],
})
export class AppModule {}
