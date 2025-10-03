import { Controller, Get, Param, Query } from '@nestjs/common';

import { MarketDataService } from './market-data.service';

@Controller()
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('market-data/:symbol')
  async getMarketData(
    @Param('symbol') symbol: string,
    @Query('timeframe') timeframe = '1d',
    @Query('limit') limit = '100',
  ) {
    const parsedLimit = Number(limit) || 100;
    const data = await this.marketDataService.getHistoricalData(symbol, timeframe, parsedLimit);

    return {
      success: true,
      symbol,
      data_points: data.candles.length,
      timeframe,
      latest_price: data.latestPrice,
      data_source: data.source,
      timestamp: data.timestamp,
      candles: data.candles,
    };
  }

  @Get('price/:symbol')
  async getPrice(@Param('symbol') symbol: string) {
    return {
      success: true,
      ...(await this.marketDataService.getRealTimePrice(symbol)),
    };
  }

  @Get('symbols')
  getSymbols() {
    return this.marketDataService.getSupportedSymbols();
  }
}
