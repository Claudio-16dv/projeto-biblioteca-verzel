import { IsInt } from 'class-validator';

export class CreateLoanDto {
  @IsInt()
  bookId: number;

  @IsInt()
  userId: number;
}
