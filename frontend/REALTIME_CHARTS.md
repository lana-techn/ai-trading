# Real-time Candlestick Charts Implementation

## Overview
Implementasi candlestick chart dengan data real-time cryptocurrency menggunakan CoinGecko API dan lightweight-charts library.

## Features Implemented ✅

### 1. Real-time Data Integration
- **API Source**: CoinGecko API (free tier)
- **Data Type**: OHLC (Open, High, Low, Close) data for 30 days
- **Supported Symbols**: 16 major cryptocurrencies
- **Update Frequency**: Auto-refresh setiap 5 menit

### 2. Supported Cryptocurrency Pairs
```
BTC/USD, ETH/USD, SOL/USD, ADA/USD, DOT/USD, AVAX/USD, 
MATIC/USD, LINK/USD, BNB/USD, XRP/USD, DOGE/USD, UNI/USD,
LTC/USD, BCH/USD, ATOM/USD, FTM/USD
```

### 3. Chart Features
- **Candlestick Pattern**: Green/Red candles untuk bullish/bearish
- **Volume Data**: Histogram volume dengan color coding
- **Theme Support**: Light, Dark, dan Terminal themes
- **Interactive**: Zoom, pan, crosshair
- **Responsive**: Menyesuaikan ukuran container

### 4. Real-time Controls
- **Live Indicator**: Status indikator dengan animasi pulse
- **Auto-refresh Toggle**: Enable/disable auto-update
- **Manual Refresh**: Button untuk update manual
- **Last Updated**: Timestamp update terakhir

### 5. Error Handling & Fallbacks
- **API Error Handling**: Fallback ke mock data jika API gagal
- **Rate Limiting**: Respek terhadap limits CoinGecko API
- **Loading States**: Skeleton loader selama data loading
- **Error Messages**: User-friendly error messages

## Technical Implementation

### API Integration
```typescript
// Fetch OHLC data from CoinGecko
const response = await fetch(
  `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=30`
);
```

### Data Format Conversion
```typescript
// Convert CoinGecko format [timestamp, open, high, low, close] to chart format
const chartData = ohlcData.map((candle: number[]) => ({
  time: new Date(timestamp).toISOString().split('T')[0],
  open: Number(open.toFixed(2)),
  high: Number(high.toFixed(2)),
  low: Number(low.toFixed(2)),
  close: Number(close.toFixed(2)),
  volume: estimatedVolume
}));
```

### Chart Configuration
```typescript
const chart = createChart(container, {
  layout: {
    background: { color: isDark ? '#1a1a1a' : '#ffffff' },
    textColor: isDark ? '#ffffff' : '#000000'
  },
  grid: {
    vertLines: { color: isDark ? '#333333' : '#e2e2e2' },
    horzLines: { color: isDark ? '#333333' : '#e2e2e2' }
  }
});

const candlestickSeries = chart.addCandlestickSeries({
  upColor: '#16a34a',    // Green for bullish
  downColor: '#dc2626',  // Red for bearish
  wickUpColor: '#16a34a',
  wickDownColor: '#dc2626'
});
```

## Usage

1. **Akses Charts Page**: Navigasi ke `/charts`
2. **Pilih Symbol**: Dropdown symbol untuk cryptocurrency yang diinginkan
3. **Live Data**: Chart akan otomatis load data real-time
4. **Controls**: Gunakan toggle untuk volume, auto-refresh, dll.

## Performance Considerations

- **Caching**: Data di-cache untuk mengurangi API calls
- **Debouncing**: Symbol changes di-debounce untuk menghindari excessive requests
- **Memory Management**: Chart instances di-cleanup dengan proper disposal
- **API Rate Limiting**: Respect CoinGecko rate limits (50 calls/minute)

## Future Enhancements

- [ ] WebSocket integration untuk real-time streaming
- [ ] Intraday timeframes (1m, 5m, 15m, 1h)
- [ ] Technical indicators overlay (RSI, MACD, MA)
- [ ] Volume profile analysis
- [ ] Price alerts dan notifications
- [ ] Historical data export
- [ ] Multiple exchanges data aggregation

## Troubleshooting

### Chart tidak muncul
1. Check browser console untuk errors
2. Verify CoinGecko API accessibility
3. Check network connectivity
4. Try different cryptocurrency symbol

### Data tidak update
1. Check auto-refresh status (green live indicator)
2. Manual refresh dengan tombol refresh
3. Verify API response dalam network tab
4. Check rate limiting errors

### Performance issues
1. Disable auto-refresh jika tidak diperlukan
2. Close unused chart instances
3. Check memory usage dalam dev tools
4. Reduce chart height untuk mobile devices

## Dependencies

- `lightweight-charts`: ^5.0.8
- `@heroicons/react`: Icons
- `tailwindcss`: Styling dan theming
- CoinGecko API: Data source

## API Documentation

- **CoinGecko OHLC**: https://api.coingecko.com/api/v3/coins/{id}/ohlc
- **Rate Limits**: 50 requests/minute (free tier)
- **Data Coverage**: 30 days daily OHLC data