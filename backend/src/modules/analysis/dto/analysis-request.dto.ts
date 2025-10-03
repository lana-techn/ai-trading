import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AnalysisRequestDto {
  @IsString()
  symbol!: string;

  @IsString()
  @IsOptional()
  timeframe?: string = '1d';

  @IsBoolean()
  @IsOptional()
  includeChart?: boolean = true;
}
