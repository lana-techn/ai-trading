import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { MarketDataService } from '../market-data/market-data.service';

interface SubscriptionPayload {
  symbol: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws',
})
export class MarketStreamGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private readonly subscriptions = new Map<string, Set<string>>();
  private interval?: NodeJS.Timeout;

  constructor(private readonly marketDataService: MarketDataService) {}

  onModuleInit() {
    this.interval = setInterval(async () => {
      await this.broadcastUpdates();
    }, 5_000);
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  handleConnection(client: Socket) {
    this.subscriptions.set(client.id, new Set());
  }

  handleDisconnect(client: Socket) {
    this.subscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribeSymbol')
  async handleSubscription(@ConnectedSocket() client: Socket, @MessageBody() payload: SubscriptionPayload) {
    if (!payload?.symbol) {
      return;
    }

    const store = this.subscriptions.get(client.id) ?? new Set<string>();
    store.add(payload.symbol.toUpperCase());
    this.subscriptions.set(client.id, store);
    const price = await this.marketDataService.getRealTimePrice(payload.symbol);
    client.emit('priceUpdate', price);
  }

  @SubscribeMessage('unsubscribeSymbol')
  handleUnsubscribe(@ConnectedSocket() client: Socket, @MessageBody() payload: SubscriptionPayload) {
    const store = this.subscriptions.get(client.id);
    if (!store || !payload?.symbol) {
      return;
    }
    store.delete(payload.symbol.toUpperCase());
  }

  private async broadcastUpdates() {
    for (const [clientId, symbols] of this.subscriptions.entries()) {
      if (!symbols.size) {
        continue;
      }

      const client = this.server.sockets.sockets.get(clientId);
      if (!client) {
        continue;
      }

      for (const symbol of symbols) {
        try {
          const data = await this.marketDataService.getRealTimePrice(symbol);
          client.emit('priceUpdate', data);
        } catch (error) {
          client.emit('priceUpdate', {
            symbol,
            error: (error as Error).message,
          });
        }
      }
    }
  }
}
