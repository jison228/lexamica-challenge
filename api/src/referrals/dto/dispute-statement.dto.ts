import { IsString, MaxLength, MinLength } from 'class-validator';

export class DisputeStatementDto {
  /** The firm's statement to the adjudicator. Private to Lexamica (Option A). */
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  statement: string;
}
