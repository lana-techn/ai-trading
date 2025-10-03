import { Body, Controller, Post } from '@nestjs/common';

import { AnalysisRequestDto } from './dto/analysis-request.dto';
import { AnalysisResult, AnalysisService } from './analysis.service';

@Controller('analyze')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  async analyzeSymbol(@Body() dto: AnalysisRequestDto): Promise<AnalysisResult> {
    return this.analysisService.analyze(dto);
  }
}
