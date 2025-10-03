import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface MarketCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataResult {
  candles: MarketCandle[];
  latestPrice: number;
  source: string;
  timestamp: number;
}

const SYMBOL_CATEGORIES = {
  crypto: [
    'BTC-USD',
    'ETH-USD',
    'ADA-USD',
    'SOL-USD',
    'DOGE-USD',
    'DOT-USD',
    'AVAX-USD',
    'MATIC-USD',
    'LINK-USD',
    'UNI-USD',
  ],
  forex: [
    'EURUSD',
    'GBPUSD',
    'USDJPY',
    'USDCHF',
    'AUDUSD',
    'USDCAD',
    'NZDUSD',
    'EURGBP',
    'EURJPY',
    'GBPJPY',
  ],
  stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'ADBE', 'CRM'],
};

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly alphaVantageKey: string;

  constructor(private readonly httpService: HttpService, configService: ConfigService) {
    this.alphaVantageKey = configService.get<string>('marketData.alphaVantageKey', 'demo');
  }

  async getHistoricalData(
    symbol: string,
    timeframe: string,
    limit: number,
  ): Promise<MarketDataResult> {
    const now = Date.now();

    try {
      const { url, params, parser } = this.buildHistoricalRequest(symbol, timeframe);
      const response = await firstValueFrom(this.httpService.get(url, { params }));
      const candles = parser(response.data).slice(0, limit);

      if (!candles.length) {
        throw new Error('No candles returned');
      }

      return {
        candles,
        latestPrice: candles[0]?.close ?? 0,
        source: 'alphavantage',
        timestamp: now,
      };
    } catch (error) {
      this.logger.warn(`Falling back to synthetic data for ${symbol}: ${(error as Error).message}`);
      const candles = this.generateSyntheticData(symbol, timeframe, limit);
      return {
        candles,
        latestPrice: candles[0]?.close ?? 0,
        source: 'synthetic',
        timestamp: now,
      };
    }
  }

  async getRealTimePrice(symbol: string) {
    const data = await this.getHistoricalData(symbol, '1d', 1);
    return {
      symbol,
      price: data.latestPrice,
      source: data.source,
      timestamp: data.timestamp,
    };
  }

  getSupportedSymbols() {
    const timestamp = Date.now();
    return {
      success: true,
      symbols: SYMBOL_CATEGORIES,
      total_count: Object.values(SYMBOL_CATEGORIES).reduce((acc, list) => acc + list.length, 0),
      timestamp,
    };
  }

  private buildHistoricalRequest(symbol: string, timeframe: string) {
    const baseUrl = 'https://www.alphavantage.co/query';
    const interval = this.mapInterval(timeframe);
    let func = 'TIME_SERIES_DAILY_ADJUSTED';
    const params: Record<string, string> = {
      symbol,
      apikey: this.alphaVantageKey,
    };

    if (interval.type === 'intraday') {
      func = 'TIME_SERIES_INTRADAY';
      if (interval.value) {
        params.interval = interval.value;
      }
      params.outputsize = 'compact';
    } else if (interval.type === 'weekly') {
      func = 'TIME_SERIES_WEEKLY';
    } else if (interval.type === 'monthly') {
      func = 'TIME_SERIES_MONTHLY';
    }

    params.function = func;

    const parser = (payload: any): MarketCandle[] => {
      const key = Object.keys(payload).find(k => k.includes('Time Series'));
      if (!key) {
        return [];
      }

      return Object.entries(payload[key] as Record<string, Record<string, string>>)
        .map(([time, values]) => ({
          time,
          open: Number(values['1. open'] ?? values['1. Open']),
          high: Number(values['2. high'] ?? values['2. High']),
          low: Number(values['3. low'] ?? values['3. Low']),
          close: Number(values['4. close'] ?? values['4. Close']),
          volume: Number(values['5. volume'] ?? values['5. Volume'] ?? 0),
        }))
        .sort((a, b) => (a.time < b.time ? 1 : -1));
    };

    return { url: baseUrl, params, parser };
  }

  private mapInterval(timeframe: string): { type: 'intraday' | 'daily' | 'weekly' | 'monthly'; value?: string } {
    switch (timeframe) {
      case '1m':
      case '5m':
      case '15m':
      case '30m':
      case '60m':
        return { type: 'intraday', value: timeframe.replace('m', '') + 'min' };
      case '1wk':
      case '1w':
        return { type: 'weekly' };
      case '1mo':
      case '1mth':
        return { type: 'monthly' };
      default:
        return { type: 'daily' };
    }
  }

  private generateSyntheticData(symbol: string, timeframe: string, limit: number): MarketCandle[] {
    const basePrice = this.seedFromSymbol(symbol) % 500 + 50;
    const candles: MarketCandle[] = [];
    let current = basePrice;
    const now = Date.now();
    const step = this.timeframeToMs(timeframe);

    for (let i = 0; i < limit; i += 1) {
      const noise = Math.sin(i / 5) * 2 + Math.cos(i / 7) * 1.5;
      const trend = (i / limit) * 5;
      const open = current;
      const close = Math.max(1, open + noise + trend / 10);
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = Math.floor(1000 + Math.random() * 500);

      candles.push({
        time: new Date(now - i * step).toISOString(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });

      current = close;
    }

    return candles;
  }

  private timeframeToMs(timeframe: string): number {
    switch (timeframe) {
      case '1m':
        return 60_000;
      case '5m':
        return 5 * 60_000;
      case '15m':
        return 15 * 60_000;
      case '30m':
        return 30 * 60_000;
      case '60m':
      case '1h':
        return 60 * 60_000;
      case '1wk':
      case '1w':
        return 7 * 24 * 60 * 60_000;
      case '1mo':
      case '1mth':
        return 30 * 24 * 60 * 60_000;
      default:
        return 24 * 60 * 60_000;
    }
  }

  private seedFromSymbol(symbol: string): number {
    return symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }
}
