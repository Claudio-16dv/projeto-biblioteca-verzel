import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [PrismaModule, LoansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
