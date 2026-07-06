import { IsDateString, IsOptional } from 'class-validator';

export class ReportAcceptanceDto {
  /** When the firm actually signed the client, off-platform.
   * Defaults to now if omitted. */
  @IsOptional()
  @IsDateString()
  signedAt?: string;
}
