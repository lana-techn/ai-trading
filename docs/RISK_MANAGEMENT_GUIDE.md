# 🛡️ Risk Management Guide
*Internal Documentation - AI Trading Agent*

> **🎯 Purpose**: This comprehensive guide provides detailed risk management strategies developed specifically for our AI Trading Agent users transitioning from paper trading to real money trading.

---

## 📚 Table of Contents

1. [Core Risk Management Principles](#-core-risk-management-principles)
2. [Position Sizing Strategies](#-position-sizing-strategies)
3. [Portfolio Management](#-portfolio-management)
4. [Stop Loss Implementation](#-stop-loss-implementation)
5. [Trading Psychology](#-trading-psychology)
6. [Risk Metrics & Monitoring](#-risk-metrics--monitoring)
7. [Crisis Management Protocols](#-crisis-management-protocols)
8. [Advanced Risk Techniques](#-advanced-risk-techniques)

---

## 🎯 Core Risk Management Principles

### **The 1% Rule (Conservative)**
For new traders, limit risk to **1% of total capital per trade**.

```
Example:
Account Size: $10,000
Max Risk per Trade: $100 (1%)
This allows 100 losing trades before account depletion
```

### **The 2% Rule (Standard)**
Experienced traders may use **2% risk per trade** after proven profitability.

```
Example:
Account Size: $10,000
Max Risk per Trade: $200 (2%)
This allows 50 losing trades before account depletion
```

### **Risk-Reward Ratio**
Always aim for minimum **1:2 risk-reward ratio**.

```
Risk $100 to make $200+
This means you can be wrong 66% of the time and still be profitable
```

### **Maximum Daily Loss Limit**
Set daily loss limit at **3-5% of total capital**.

```
Account Size: $10,000
Daily Loss Limit: $300-500
When reached, STOP trading for the day
```

---

## 📐 Position Sizing Strategies

### **Fixed Dollar Amount**
Risk the same dollar amount on every trade.

```python
# Python Calculator Example
def fixed_dollar_sizing(account_balance, risk_percent, entry_price, stop_loss):
    risk_amount = account_balance * (risk_percent / 100)
    price_difference = abs(entry_price - stop_loss)
    position_size = risk_amount / price_difference
    return position_size

# Example Usage
position = fixed_dollar_sizing(10000, 2, 100, 95)
# Result: 40 shares
```

### **Fixed Percentage**
Risk the same percentage of current account balance.

```python
def percentage_sizing(current_balance, risk_percent, entry_price, stop_loss):
    risk_amount = current_balance * (risk_percent / 100)
    price_difference = abs(entry_price - stop_loss)
    position_size = risk_amount / price_difference
    return position_size
```

### **Volatility-Based Sizing**
Adjust position size based on market volatility (ATR).

```python
def volatility_sizing(account_balance, risk_percent, atr_value, multiplier=2):
    risk_amount = account_balance * (risk_percent / 100)
    volatility_stop = atr_value * multiplier
    position_size = risk_amount / volatility_stop
    return position_size
```

---

## 📊 Portfolio Management

### **Sector Diversification**
- **Maximum 20%** of portfolio in any single sector
- **No more than 3-5 positions** in correlated assets
- **Balance growth vs value** allocations

### **Correlation Management**
```
High Correlation (>0.7): Treat as single position for risk purposes
Medium Correlation (0.3-0.7): Limit combined exposure
Low Correlation (<0.3): Can be held independently
```

### **Asset Allocation Framework**
```
Conservative Portfolio:
- 60% Stocks
- 30% Bonds  
- 10% Cash/Alternatives

Aggressive Portfolio:
- 80% Stocks
- 15% Growth Assets
- 5% Cash
```

### **Position Concentration Limits**
```
Single Position: Maximum 10% of portfolio
Single Sector: Maximum 25% of portfolio
Single Strategy: Maximum 50% of portfolio
```

---

## 🎯 Stop Loss Implementation

### **Technical Stop Losses**

#### **Support/Resistance Stops**
```
Long Position: Place stop 2-3% below nearest support
Short Position: Place stop 2-3% above nearest resistance
```

#### **Moving Average Stops**
```
Trend Following: Stop below 20 or 50 SMA
Long-term: Stop below 200 SMA
Dynamic: Trail stop with moving average
```

#### **ATR-Based Stops**
```python
def atr_stop_loss(entry_price, atr_value, multiplier=2, position_type="long"):
    if position_type == "long":
        stop_loss = entry_price - (atr_value * multiplier)
    else:  # short position
        stop_loss = entry_price + (atr_value * multiplier)
    return stop_loss

# Example
entry = 100
atr = 3
stop = atr_stop_loss(100, 3, 2, "long")  # Stop at $94
```

### **Time-Based Stops**
- Exit position if trade thesis doesn't work within **3-5 trading days**
- Re-evaluate all positions **weekly**
- Close positions before **major news events** if uncertain

### **Trailing Stops**
```python
def trailing_stop(current_price, entry_price, initial_stop, trail_percent=0.03):
    if current_price > entry_price:  # Profitable long position
        new_stop = current_price * (1 - trail_percent)
        return max(initial_stop, new_stop)
    return initial_stop
```

---

## 🧠 Trading Psychology

### **Emotional State Checklist**
Before each trading session, rate yourself (1-10):
- [ ] **Physical Energy**: Am I well-rested?
- [ ] **Mental Clarity**: Can I think clearly?
- [ ] **Emotional Stability**: Am I calm and focused?
- [ ] **Market Confidence**: Do I trust my analysis?

**Rule**: Don't trade if any score is below 6/10.

### **Cognitive Biases to Avoid**

#### **Confirmation Bias**
- Actively seek information that contradicts your thesis
- Set up alerts for negative news about your positions
- Have a "devil's advocate" checklist

#### **Loss Aversion**
- Pre-define exit points before entering trades
- Use mechanical stops to remove emotion
- Celebrate good risk management, not just profits

#### **Overconfidence**
- Keep detailed records of both wins and losses
- Regularly review and analyze mistakes
- Never increase position sizes after big wins

### **Decision-Making Framework**

#### **Pre-Trade Checklist**
```
✅ Analysis complete and documented
✅ Entry price identified
✅ Stop loss level set
✅ Profit target defined
✅ Position size calculated
✅ Risk-reward ratio acceptable (min 1:2)
✅ Emotional state confirmed stable
```

#### **In-Trade Management**
```
✅ Monitor stop loss adherence
✅ Track against plan (don't deviate)
✅ Document any emotional responses
✅ Stick to predetermined exit rules
```

#### **Post-Trade Review**
```
✅ Record actual vs planned performance
✅ Analyze decision quality (separate from outcome)
✅ Identify lessons learned
✅ Update trading plan if needed
```

---

## 📈 Risk Metrics & Monitoring

### **Key Performance Indicators**

#### **Sharpe Ratio**
```python
def sharpe_ratio(returns, risk_free_rate=0.02):
    excess_returns = returns - risk_free_rate
    return excess_returns.mean() / excess_returns.std()

# Target: > 1.0 (good), > 2.0 (excellent)
```

#### **Maximum Drawdown**
```python
def max_drawdown(equity_curve):
    peak = equity_curve.expanding().max()
    drawdown = (equity_curve - peak) / peak
    return drawdown.min()

# Target: < 10% (good), < 5% (excellent)
```

#### **Win Rate & Profit Factor**
```python
def calculate_metrics(trades):
    wins = trades[trades > 0]
    losses = trades[trades < 0]
    
    win_rate = len(wins) / len(trades)
    avg_win = wins.mean() if len(wins) > 0 else 0
    avg_loss = abs(losses.mean()) if len(losses) > 0 else 0
    profit_factor = (win_rate * avg_win) / ((1 - win_rate) * avg_loss)
    
    return win_rate, profit_factor
```

### **Risk Monitoring Dashboard**

#### **Daily Risk Check**
```
Current Exposure: ___% of capital
Open Positions: ___
Correlation Risk: High/Medium/Low
Daily P&L: $___
Distance to Daily Loss Limit: ___
```

#### **Weekly Risk Review**
```
Weekly Return: ___%
Max Daily Drawdown: ___%
Risk-Adjusted Return: ___
Strategy Adherence: ___%
Rule Violations: ___
```

---

## 🚨 Crisis Management Protocols

### **Market Crash Response Plan**

#### **Phase 1: Immediate Actions (0-24 hours)**
1. **Review all open positions** immediately
2. **Tighten stop losses** to 50% of normal distance
3. **Reduce position sizes** by 50% for new trades
4. **Avoid catching falling knives** - wait for stabilization

#### **Phase 2: Assessment (1-7 days)**
1. **Analyze portfolio correlation** - many assets may move together
2. **Review strategy performance** in volatile conditions
3. **Adjust risk parameters** based on new volatility levels
4. **Consider defensive positioning**

#### **Phase 3: Adaptation (1-4 weeks)**
1. **Modify trading approach** for new market regime
2. **Update backtesting** with recent market data
3. **Reassess risk capacity** and trading capital
4. **Implement lessons learned**

### **Personal Crisis Response**

#### **Large Loss Event**
```
If single day loss > 5% of account:
1. STOP trading immediately
2. Review what went wrong
3. Identify rule violations
4. Take 24-48 hours break
5. Reduce position sizes by 50% when returning
6. Seek trading mentor/community support
```

#### **Consecutive Losses**
```
After 3 consecutive losing trades:
1. Reduce position size to 50%
2. Review and adjust strategy
3. Consider taking a break

After 5 consecutive losing trades:
1. Stop trading
2. Complete strategy review
3. Paper trade until confidence restored
```

### **Account Recovery Protocol**

#### **After 10%+ Drawdown**
1. **Reduce position sizes** to 0.5% risk per trade
2. **Focus on high-probability setups** only  
3. **Implement stricter entry criteria**
4. **Daily trading journal review** mandatory
5. **Weekly mentor check-in** if available

#### **After 20%+ Drawdown**
1. **Stop live trading** immediately
2. **Return to paper trading** for 30 days
3. **Complete strategy overhaul**
4. **Psychological evaluation** of trading approach
5. **Consider professional help** or mentorship

---

## 🔧 Advanced Risk Techniques

### **Portfolio Heat Map**
Track risk exposure across:
- **Time frames** (short vs long-term positions)
- **Market sectors** (tech, finance, healthcare, etc.)
- **Geographic regions** (domestic vs international)
- **Strategy types** (trend following, mean reversion, etc.)

### **Scenario Analysis**
Monthly stress tests:
```
What if market drops 10% overnight?
What if my largest position gaps down 20%?
What if volatility doubles?
What if correlation increases to 0.9 across all positions?
```

### **Dynamic Position Sizing**
Adjust position sizes based on:
- **Recent performance** (reduce after losses)
- **Market volatility** (reduce in high VIX environments)
- **Strategy confidence** (reduce for newer strategies)
- **Account growth** (maintain percentage-based sizing)

### **Options for Hedging**
Consider protective strategies:
- **Put options** to hedge long positions
- **Collar strategies** for cost-effective protection
- **Index hedging** for portfolio-wide protection
- **Inverse ETFs** for short-term hedging

---

## 📋 Risk Management Checklist

### **Daily Pre-Market**
- [ ] Review overnight news and events
- [ ] Check portfolio heat map and exposure
- [ ] Confirm all stop losses are in place
- [ ] Review risk metrics dashboard
- [ ] Assess emotional/physical state

### **During Trading Hours**
- [ ] Monitor position sizes vs account balance
- [ ] Track daily P&L vs limits
- [ ] Ensure no single position exceeds 10%
- [ ] Check correlation between positions
- [ ] Follow predetermined entry/exit rules

### **End of Day**
- [ ] Update trading journal
- [ ] Review rule adherence
- [ ] Calculate daily risk metrics
- [ ] Plan next day's potential trades
- [ ] Set alerts for overnight risks

### **Weekly Review**
- [ ] Analyze week's performance metrics
- [ ] Review strategy effectiveness
- [ ] Identify areas for improvement
- [ ] Adjust risk parameters if needed
- [ ] Plan upcoming week's focus areas

---

## 🎓 Educational Resources

### **Recommended Reading**
1. **"The New Trading for a Living"** by Alexander Elder
2. **"Trade Your Way to Financial Freedom"** by Van K. Tharp
3. **"Market Wizards"** by Jack Schwager
4. **"The Psychology of Trading"** by Brett Steenbarger

### **Risk Management Tools**
- **Position sizing calculators** (Excel templates available)
- **Portfolio correlation analysis** tools
- **Backtesting software** with risk metrics
- **Risk monitoring dashboards** (TradingView, etc.)

### **Professional Development**
- **Chartered Market Technician (CMT)** certification
- **Financial Risk Manager (FRM)** designation
- **Trading psychology courses**
- **Risk management workshops**

---

## ⚠️ Final Risk Disclosure

This risk management guide is provided for educational purposes only and does not constitute financial advice. All trading involves risk of loss, and past performance does not guarantee future results. You should:

- **Never trade with money you cannot afford to lose**
- **Always do your own research and analysis**
- **Consider consulting with financial professionals**
- **Start with very small position sizes when transitioning to real money**
- **Continuously educate yourself on risk management best practices**

---

> **💡 Remember**: The best traders are not those who never lose, but those who lose small and let their winners run. Risk management is not about avoiding all losses - it's about controlling losses so they don't destroy your trading capital.

**🔗 Related Documentation:**
- [Ready for Real Trading](./READY_FOR_REAL_TRADING.md)
- [External Risk Resources](./EXTERNAL_RISK_RESOURCES.md)
- [Quick Start Guide](./QUICKSTART.md)