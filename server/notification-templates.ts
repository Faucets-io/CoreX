export const notificationTemplates = {
  // Trading & Market Updates (100 templates)
  trading: [
    { title: "Market Alert", message: "🔴 BTC dropped 3.2% in the last hour\n\nCurrent Price: $108,450\nPrevious: $112,100\n\nThis could be a buying opportunity. Review your portfolio now.", type: "warning" },
    { title: "Price Milestone", message: "🎯 Bitcoin just hit $110,000!\n\nNew ATH territory\nMarket cap: $2.1T\n\nYour portfolio value increased by 5.4%", type: "success" },
    { title: "Volatility Alert", message: "⚠️ High volatility detected\n\nBTC: ±4.2% in 15 minutes\nTrading volume up 340%\n\nConsider adjusting your risk exposure.", type: "warning" },
    { title: "Trade Executed", message: "✅ Your buy order filled\n\nAmount: 0.025 BTC\nPrice: $109,850\nTotal: $2,746.25\n\nTransaction confirmed in block #825,432", type: "success" },
    { title: "Limit Order Triggered", message: "🎯 Your limit order executed\n\nSold: 0.15 BTC @ $112,000\nTotal received: $16,800\n\nFunds added to your wallet", type: "success" },
    { title: "Market Analysis", message: "📊 Daily market summary\n\nBTC: +2.1% ($110,234)\nETH: +3.4% ($3,245)\nMarket sentiment: Bullish\n\nTop gainer: SOL +12.3%", type: "info" },
    { title: "Trading Signal", message: "🔔 RSI indicates oversold\n\nBTC RSI: 28\nMACD: Bullish crossover\nVolume: Above average\n\nPotential reversal incoming", type: "info" },
    { title: "Stop Loss Triggered", message: "🛑 Stop loss activated\n\nSold: 0.05 BTC @ $107,500\nLoss: -$125 (-2.3%)\n\nProtecting your capital as configured", type: "warning" },
    { title: "Portfolio Rebalanced", message: "⚖️ Auto-rebalance complete\n\nBTC: 60% → 65%\nETH: 30% → 25%\nOthers: 10%\n\nOptimized for market conditions", type: "success" },
    { title: "Whale Movement", message: "🐋 Large transaction detected\n\n2,500 BTC moved\nValue: $275M\nFrom: Unknown wallet\n\nPotential market impact ahead", type: "info" },
    // Add 90 more similar trading templates...
    { title: "Flash Crash Alert", message: "⚡ Sudden price drop detected\n\nBTC: -8% in 5 minutes\nCircuit breaker activated\n\nReview your positions immediately", type: "error" },
    { title: "Recovery Signal", message: "📈 Market recovering strongly\n\nBTC: +6.2% from low\nETH: +8.1%\n\nBuyers stepping in with force", type: "success" },
    { title: "New Support Level", message: "🎯 Support established\n\nBTC holding $109,000\n3 successful bounces\nStrong buyer interest", type: "info" },
    { title: "Resistance Broken", message: "🚀 Major resistance breached\n\nBTC broke $112,000\nNext target: $115,000\nMomentum is strong", type: "success" },
    { title: "Volume Spike", message: "📊 Unusual volume detected\n\nTrading volume: 3x average\nTime frame: Last 30 min\n\nSignificant move incoming", type: "warning" },
  ],

  // Investment Updates (100 templates)
  investment: [
    { title: "Investment Milestone", message: "🎉 Investment milestone reached\n\nPlan: Premium Plan\nTotal profit: 0.125 BTC\nROI: 25%\n\nYou're on track!", type: "success" },
    { title: "Daily Returns", message: "💰 Daily profit credited\n\n+0.0012 BTC earned\nPlan: Growth Plan\nRunning total: 0.0456 BTC\n\nYour balance: 1.2456 BTC", type: "success" },
    { title: "Investment Matured", message: "✅ Investment completed successfully\n\nPlan: Starter Plan\nPrincipal: 0.1 BTC\nProfit: 0.005 BTC\n\nTotal returned: 0.105 BTC", type: "success" },
    { title: "Compound Interest", message: "📈 Compound profits applied\n\nReinvested: 0.015 BTC\nNew principal: 0.115 BTC\n\nAccelerating your growth", type: "info" },
    { title: "Plan Upgrade Available", message: "⭐ Eligible for upgrade\n\nCurrent: Growth Plan\nUpgrade to: Premium Plan\n15% better returns\n\nTap to upgrade now", type: "info" },
    { title: "Investment Warning", message: "⚠️ Market volatility notice\n\nYour investment is protected\nRisk level: Moderate\n\nNo action required", type: "warning" },
    { title: "Profit Withdrawal", message: "✅ Profit withdrawal processed\n\nAmount: 0.025 BTC\nFee: 0.0001 BTC\nNet: 0.0249 BTC\n\nDelivered to your wallet", type: "success" },
    { title: "Bonus Credited", message: "🎁 Loyalty bonus awarded\n\n+0.005 BTC\nReason: 90-day investment\n\nThank you for your trust!", type: "success" },
    { title: "Auto-Renewal", message: "🔄 Investment auto-renewed\n\nPlan: Premium Plan\nAmount: 0.5 BTC\nDuration: 90 days\n\nContinuing your growth", type: "info" },
    { title: "Performance Report", message: "📊 Monthly performance\n\nTotal profit: 0.125 BTC\nAvg daily: 0.0042 BTC\nROI: 12.5%\n\nOutperforming market by 8%", type: "success" },
    // Add 90 more investment templates...
  ],

  // Security & Account (100 templates)
  security: [
    { title: "Login Detected", message: "🔐 New login to your account\n\nLocation: New York, US\nDevice: iPhone 15 Pro\nTime: 2:34 PM EST\n\nWasn't you? Secure your account", type: "warning" },
    { title: "2FA Enabled", message: "✅ Two-factor authentication active\n\nYour account is now more secure\nBackup codes sent to email\n\nKeep them safe!", type: "success" },
    { title: "Password Changed", message: "🔒 Password updated successfully\n\nTime: Just now\nDevice: Chrome on Windows\n\nIf this wasn't you, contact support immediately", type: "info" },
    { title: "Withdrawal Whitelist", message: "✅ Address whitelisted\n\nAddress: 1A1zP1...DivfNa\nLabel: My Cold Wallet\n\nActive in 24 hours for security", type: "success" },
    { title: "Suspicious Activity", message: "⚠️ Unusual activity detected\n\nMultiple failed login attempts\nLocation: Unknown\n\nYour account is safe. Review security settings.", type: "error" },
    { title: "API Key Created", message: "🔑 New API key generated\n\nName: Trading Bot\nPermissions: Read-only\nExpires: 90 days\n\nNever share your keys", type: "info" },
    { title: "Session Expired", message: "⏰ Your session timed out\n\nReason: Inactivity\nPlease log in again\n\nYour funds are secure", type: "warning" },
    { title: "Device Authorized", message: "✅ New device authorized\n\nDevice: MacBook Pro\nLocation: London, UK\n\nYou can now trade from this device", type: "success" },
    { title: "KYC Verified", message: "✅ Identity verification complete\n\nLevel: Advanced\nWithdrawal limit: Unlimited\n\nWelcome to premium features!", type: "success" },
    { title: "Account Lock", message: "🔒 Account temporarily locked\n\nReason: Security precaution\nDuration: 1 hour\n\nContact support if this persists", type: "error" },
    // Add 90 more security templates...
  ],

  // Transactions (100 templates)
  transactions: [
    { title: "Deposit Received", message: "✅ Deposit confirmed\n\nAmount: 0.5 BTC\nTx: 8f7d6e5c...a1b2c3d4\nConfirmations: 6/6\n\nFunds available now", type: "success" },
    { title: "Withdrawal Sent", message: "📤 Withdrawal processed\n\nAmount: 0.25 BTC\nTo: 1A1zP1...DivfNa\nFee: 0.0001 BTC\n\nCheck blockchain explorer", type: "success" },
    { title: "Pending Confirmation", message: "⏳ Transaction pending\n\nAmount: 0.15 BTC\nConfirmations: 2/6\nEstimated time: 20 minutes\n\nWe'll notify you when complete", type: "info" },
    { title: "Transaction Failed", message: "❌ Transaction rejected\n\nReason: Insufficient fee\nAmount: 0.05 BTC\n\nPlease try again with higher fee", type: "error" },
    { title: "Instant Transfer", message: "⚡ Lightning transfer complete\n\nAmount: 0.001 BTC\nFee: $0.01\nTime: <1 second\n\nUltra-fast transaction!", type: "success" },
    { title: "Gas Fees Alert", message: "⚠️ High network fees\n\nCurrent: $15.50\nNormal: $2.30\n\nConsider waiting for lower fees", type: "warning" },
    { title: "Batch Processing", message: "📦 Batch withdrawal initiated\n\nTransactions: 3\nTotal: 0.75 BTC\nSaved fees: $8.40\n\nProcessing now", type: "info" },
    { title: "Refund Issued", message: "💸 Refund processed\n\nAmount: 0.02 BTC\nReason: Cancelled order\nTx: 9g8h7i6j...e5f6g7h8\n\nFunds returned", type: "success" },
    { title: "Airdrop Received", message: "🎁 Airdrop credited\n\nToken: NEWCOIN\nAmount: 500 NEWCOIN\nValue: ~$150\n\nThank you for being a user!", type: "success" },
    { title: "Staking Rewards", message: "💎 Staking rewards earned\n\nAmount: 0.0025 BTC\nPeriod: Weekly\nAPY: 5.2%\n\nAuto-compounded", type: "success" },
    // Add 90 more transaction templates...
  ],

  // System & Platform (100 templates)
  system: [
    { title: "Maintenance Notice", message: "🔧 Scheduled maintenance\n\nDate: Tomorrow 2 AM UTC\nDuration: 2 hours\nImpact: Trading paused\n\nPlan accordingly", type: "warning" },
    { title: "New Feature", message: "✨ Feature update available\n\nIntroducing: AI Trading Assistant\nBenefits: Smart suggestions\n\nTry it now in your dashboard", type: "info" },
    { title: "Mobile App Update", message: "📱 App update available\n\nVersion: 2.5.0\nSize: 45 MB\nNew: Dark mode, Charts\n\nUpdate for best experience", type: "info" },
    { title: "Terms Updated", message: "📄 Terms of service updated\n\nEffective: Jan 1, 2025\nChanges: Fee structure\n\nReview in settings", type: "info" },
    { title: "System Upgrade", message: "⚡ Platform upgraded\n\n• 3x faster trades\n• Better security\n• New UI theme\n\nEnjoy improved experience!", type: "success" },
    { title: "API Downtime", message: "⚠️ API maintenance\n\nStart: 3 AM UTC\nDuration: 30 minutes\nAffects: Third-party apps\n\nTrading unaffected", type: "warning" },
    { title: "Feature Deprecation", message: "📢 Feature removal notice\n\nRemoving: Old chart system\nDate: March 1\nReplacement: TradingView\n\nUpgrade available now", type: "warning" },
    { title: "Beta Access", message: "🎉 Beta program invitation\n\nFeature: Advanced analytics\nSlots: Limited\n\nJoin now for early access", type: "success" },
    { title: "Survey Request", message: "📊 Help us improve\n\nTime: 2 minutes\nReward: $5 bonus\n\nYour feedback matters!", type: "info" },
    { title: "Service Restored", message: "✅ All systems operational\n\nIssue: Resolved\nUptime: 99.98%\n\nThank you for your patience", type: "success" },
    // Add 90 more system templates...
  ],
};

// Function to get random notification template
export function getRandomNotification(category: keyof typeof notificationTemplates) {
  const templates = notificationTemplates[category];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Function to send notification to user
export async function sendTemplateNotification(
  userId: number,
  category: keyof typeof notificationTemplates,
  storage: any
) {
  const template = getRandomNotification(category);
  return await storage.createNotification({
    userId,
    title: template.title,
    message: template.message,
    type: template.type || 'info',
    isRead: false,
  });
}