"""
WebSocket manager for real-time price feeds and live updates.
"""

import asyncio
import json
import time
from typing import Dict, List, Set, Any, Optional
from datetime import datetime, timedelta
from fastapi import WebSocket, WebSocketDisconnect

from app.services.data.market_data import market_data_service
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, List[WebSocket]] = {}
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
        self.last_prices: Dict[str, Dict[str, Any]] = {}
        self.is_running: bool = False
        self.update_task: Optional[asyncio.Task] = None
        
    async def connect(self, websocket: WebSocket, user_id: Optional[str] = None):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.subscriptions[websocket] = set()
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
        
        # Send initial connection message
        await self.send_personal_message({
            "type": "connection_established",
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Connected to AI Trading Agent WebSocket"
        }, websocket)
        
        logger.info(f"WebSocket connection established. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket, user_id: Optional[str] = None):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]
        
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        logger.info(f"WebSocket connection closed. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending WebSocket message: {e}")
            self.disconnect(websocket)
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast a message to all connected clients."""
        if not self.active_connections:
            return
            
        message["timestamp"] = datetime.utcnow().isoformat()
        disconnected = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            self.disconnect(conn)
    
    async def subscribe_to_symbol(self, websocket: WebSocket, symbol: str):
        """Subscribe a connection to price updates for a symbol."""
        if websocket in self.subscriptions:
            self.subscriptions[websocket].add(symbol.upper())
            
            # Send current price if available
            if symbol.upper() in self.last_prices:
                await self.send_personal_message({
                    "type": "price_update",
                    "symbol": symbol.upper(),
                    "data": self.last_prices[symbol.upper()]
                }, websocket)
            
            await self.send_personal_message({
                "type": "subscription_confirmed",
                "symbol": symbol.upper(),
                "message": f"Subscribed to {symbol.upper()} price updates"
            }, websocket)
            
            logger.info(f"WebSocket subscribed to {symbol.upper()}")
    
    async def start_price_updates(self):
        """Start the background task for price updates."""
        if self.is_running:
            return
        
        self.is_running = True
        self.update_task = asyncio.create_task(self._price_update_loop())
        logger.info("Price update loop started")
    
    async def stop_price_updates(self):
        """Stop the background task for price updates."""
        self.is_running = False
        if self.update_task:
            self.update_task.cancel()
            try:
                await self.update_task
            except asyncio.CancelledError:
                pass
        logger.info("Price update loop stopped")
    
    async def _price_update_loop(self):
        """Background loop for fetching and broadcasting price updates."""
        symbols = ['BTC-USD', 'ETH-USD', 'AAPL', 'MSFT']
        
        while self.is_running:
            try:
                for symbol in symbols:
                    try:
                        price_data = await market_data_service.get_real_time_price(symbol)
                        
                        if price_data and price_data.get('success'):
                            current_price = price_data.get('price', 0)
                            prev_data = self.last_prices.get(symbol, {})
                            prev_price = prev_data.get('price', current_price)
                            
                            change = current_price - prev_price
                            change_percent = (change / prev_price * 100) if prev_price > 0 else 0
                            
                            price_data.update({
                                'change': change,
                                'change_percent': change_percent,
                                'prev_price': prev_price
                            })
                            
                            self.last_prices[symbol] = price_data
                            
                            # Broadcast to all connections for now
                            await self.broadcast_to_all({
                                "type": "price_update",
                                "symbol": symbol,
                                "data": price_data
                            })
                            
                    except Exception as e:
                        logger.error(f"Error fetching price for {symbol}: {e}")
                        continue
                
                await asyncio.sleep(5)  # Update every 5 seconds
                
            except Exception as e:
                logger.error(f"Error in price update loop: {e}")
                await asyncio.sleep(10)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get WebSocket connection statistics."""
        return {
            "total_connections": len(self.active_connections),
            "is_running": self.is_running
        }

# Global connection manager instance
connection_manager = ConnectionManager()

async def handle_websocket_message(websocket: WebSocket, message: Dict[str, Any]):
    """Handle incoming WebSocket messages."""
    try:
        msg_type = message.get("type")
        
        if msg_type == "subscribe":
            symbol = message.get("symbol")
            if symbol:
                await connection_manager.subscribe_to_symbol(websocket, symbol)
        
        elif msg_type == "ping":
            await connection_manager.send_personal_message({
                "type": "pong",
                "timestamp": datetime.utcnow().isoformat()
            }, websocket)
        
        else:
            await connection_manager.send_personal_message({
                "type": "error",
                "message": f"Unknown message type: {msg_type}"
            }, websocket)
            
    except Exception as e:
        logger.error(f"Error handling WebSocket message: {e}")

async def startup_websocket():
    """Initialize WebSocket services."""
    await connection_manager.start_price_updates()
    logger.info("WebSocket services started")

async def shutdown_websocket():
    """Cleanup WebSocket services."""
    await connection_manager.stop_price_updates()
    logger.info("WebSocket services stopped")