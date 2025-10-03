import { Module } from '@nestjs/common';

import { MarketDataModule } from '../market-data/market-data.module';
import { MarketStreamGateway } from './websocket.gateway';

@Module({
  imports: [MarketDataModule],
  providers: [MarketStreamGateway],
})
export class WebsocketModule {}
