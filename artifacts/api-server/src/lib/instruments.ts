/**
 * Unified market instrument catalog.
 * symbol: stable internal identifier we expose in the API.
 * yahooSymbol: the symbol used to fetch data from Yahoo Finance.
 * assetClass: high-level grouping for UI.
 * displayName: human-readable name shown in selectors.
 */

export type AssetClass =
  | "CRYPTO"
  | "FOREX"
  | "COMMODITIES"
  | "INDICES"
  | "ETFS"
  | "STOCKS";

export type Instrument = {
  symbol: string;
  yahooSymbol: string;
  assetClass: AssetClass;
  displayName: string;
};

// =============== CRYPTO ===============
const CRYPTO_RAW: Array<[string, string]> = [
  ["Bitcoin", "BTC"],["Ethereum", "ETH"],["Tether", "USDT"],["USD Coin", "USDC"],
  ["BNB", "BNB"],["Solana", "SOL"],["XRP", "XRP"],["Cardano", "ADA"],
  ["Dogecoin", "DOGE"],["TRON", "TRX"],["Avalanche", "AVAX"],["Polkadot", "DOT"],
  ["Chainlink", "LINK"],["Polygon", "MATIC"],["Litecoin", "LTC"],["Shiba Inu", "SHIB"],
  ["Bitcoin Cash", "BCH"],["Uniswap", "UNI"],["Toncoin", "TON"],["NEAR Protocol", "NEAR"],
  ["Stellar", "XLM"],["Monero", "XMR"],["Aptos", "APT"],["Arbitrum", "ARB"],
  ["Optimism", "OP"],["Cosmos", "ATOM"],["Filecoin", "FIL"],["Internet Computer", "ICP"],
  ["VeChain", "VET"],["Theta Network", "THETA"],["Tezos", "XTZ"],["Algorand", "ALGO"],
  ["Aave", "AAVE"],["Synthetix", "SNX"],["Maker", "MKR"],["Curve DAO Token", "CRV"],
  ["PancakeSwap", "CAKE"],["Fantom", "FTM"],["Axie Infinity", "AXS"],["The Sandbox", "SAND"],
  ["Decentraland", "MANA"],["Gala", "GALA"],["Enjin Coin", "ENJ"],["Chiliz", "CHZ"],
  ["Basic Attention Token", "BAT"],["Zcash", "ZEC"],["Dash", "DASH"],["EOS", "EOS"],
  ["IOTA", "MIOTA"],["NEO", "NEO"],["Kusama", "KSM"],["Waves", "WAVES"],
  ["Flow", "FLOW"],["Harmony", "ONE"],["Kava", "KAVA"],["Helium", "HNT"],
  ["Render", "RNDR"],["Immutable X", "IMX"],["Lido DAO", "LDO"],["Rocket Pool", "RPL"],
  ["Compound", "COMP"],["Yearn Finance", "YFI"],["dYdX", "DYDX"],["1inch", "1INCH"],
  ["Loopring", "LRC"],["SushiSwap", "SUSHI"],["Balancer", "BAL"],["Kyber Network", "KNC"],
  ["Zilliqa", "ZIL"],["Qtum", "QTUM"],["Ontology", "ONT"],["ICON", "ICX"],
  ["Nano", "XNO"],["Holo", "HOT"],["Ravencoin", "RVN"],["Decred", "DCR"],
  ["Siacoin", "SC"],["Celo", "CELO"],["NEM", "XEM"],["Audius", "AUDIO"],
  ["Ocean Protocol", "OCEAN"],["Ankr", "ANKR"],["Biconomy", "BICO"],["Gnosis", "GNO"],
  ["Trust Wallet Token", "TWT"],["Mask Network", "MASK"],["WAX", "WAXP"],["SKALE", "SKL"],
  ["Conflux", "CFX"],["COTI", "COTI"],["Flux", "FLUX"],["Injective", "INJ"],
  ["Terra Classic", "LUNC"],["Terra", "LUNA"],["Kaspa", "KAS"],["Pepe", "PEPE"],
  ["Floki", "FLOKI"],["Bonk", "BONK"],["Dogelon Mars", "ELON"],["Baby Doge Coin", "BABYDOGE"],
  ["SafeMoon", "SFM"],["ApeCoin", "APE"],["Blur", "BLUR"],["LooksRare", "LOOKS"],
  ["XDC Network", "XDC"],["Sui", "SUI"],["Sei", "SEI"],["Celestia", "TIA"],
  ["Stacks", "STX"],["Mantle", "MNT"],["Ronin", "RON"],["WOO Network", "WOO"],
  ["The Graph", "GRT"],["Fetch.ai", "FET"],["SingularityNET", "AGIX"],["Akash Network", "AKT"],
  ["Numeraire", "NMR"],["Band Protocol", "BAND"],["API3", "API3"],["iExec RLC", "RLC"],
  ["Cartesi", "CTSI"],["Livepeer", "LPT"],["Storj", "STORJ"],["Arweave", "AR"],
  ["BitTorrent", "BTT"],["Chia", "XCH"],["Mina", "MINA"],["Golem", "GLM"],
  ["IOST", "IOST"],["Polymesh", "POLYX"],["Secret Network", "SCRT"],["Nervos Network", "CKB"],
  ["MultiversX", "EGLD"],["OMG Network", "OMG"],["0x", "ZRX"],["Lisk", "LSK"],
  ["Ark", "ARK"],["Status", "SNT"],["Pundi X", "PUNDIX"],["Dent", "DENT"],
  ["Civic", "CVC"],["Request", "REQ"],["Origin Protocol", "OGN"],["Augur", "REP"],
  ["Bancor", "BNT"],["Ren", "REN"],["Wanchain", "WAN"],["Orchid", "OXT"],
  ["Power Ledger", "POWR"],["Centrifuge", "CFG"],["Energy Web Token", "EWT"],
  ["Verge", "XVG"],["Komodo", "KMD"],["Steem", "STEEM"],["Syscoin", "SYS"],
  ["Stratis", "STRAX"],["Digibyte", "DGB"],["Vertcoin", "VTC"],["Bitcoin SV", "BSV"],
  ["Theta Fuel", "TFUEL"],["Moonbeam", "GLMR"],["Moonriver", "MOVR"],["Acala", "ACA"],
  ["Astar", "ASTR"],["JOE", "JOE"],["BENQI", "QI"],["GMX", "GMX"],
  ["Gains Network", "GNS"],["Pendle", "PENDLE"],["Convex Finance", "CVX"],["Frax", "FRAX"],
  ["Frax Share", "FXS"],["Liquity", "LQTY"],["LUKSO", "LYX"],["Wormhole", "W"],
  ["JasmyCoin", "JASMY"],["Klaytn", "KLAY"],["OKB", "OKB"],["GateToken", "GT"],
  ["Cronos", "CRO"],["Nexo", "NEXO"],["FTX Token", "FTT"],["Serum", "SRM"],
  ["Raydium", "RAY"],["Orca", "ORCA"],["Stepn", "GMT"],["Illuvium", "ILV"],
  ["MAGIC", "MAGIC"],["Yield Guild Games", "YGG"],["Alien Worlds", "TLM"],
  ["My Neighbor Alice", "ALICE"],["Star Atlas", "ATLAS"],["Gods Unchained", "GODS"],
  ["Smooth Love Potion", "SLP"],["WEMIX", "WEMIX"],["Alchemy Pay", "ACH"],
  ["Kishu Inu", "KISHU"],["Akita Inu", "AKITA"],["Samoyedcoin", "SAMO"],
  ["Jupiter", "JUP"],["Pyth Network", "PYTH"],["Jito", "JTO"],["Marinade", "MNDE"],
  ["Bonfida", "FIDA"],["Metis", "METIS"],["Boba Network", "BOBA"],
  ["Sologenic", "SOLO"],["NKN", "NKN"],["Verasity", "VRA"],["OriginTrail", "TRAC"],
  ["SuperVerse", "SUPER"],["Galxe", "GAL"],["Hooked Protocol", "HOOK"],
  ["Green Satoshi Token", "GST"],["Alchemix", "ALCX"],["Badger DAO", "BADGER"],
  ["BarnBridge", "BOND"],["Perpetual Protocol", "PERP"],["Rally", "RLY"],
  ["Celer Network", "CELR"],["DODO", "DODO"],["Alpha Venture DAO", "ALPHA"],
  ["Adventure Gold", "AGLD"],["Spell Token", "SPELL"],["Bitcoin Gold", "BTG"],
  ["Horizen", "ZEN"],["Theta", "THETA"],["Bitget Token", "BGB"],["BitMart Token", "BMX"],
  ["CoinEx Token", "CET"],["Pax Dollar", "USDP"],["TrueUSD", "TUSD"],["DAI", "DAI"],
  ["USDD", "USDD"],
];

const CRYPTO: Instrument[] = CRYPTO_RAW.map(([name, ticker]) => ({
  symbol: `${ticker}-USD`,
  yahooSymbol: `${ticker}-USD`,
  assetClass: "CRYPTO",
  displayName: `${name} (${ticker})`,
}));

// =============== FOREX ===============
const FOREX_RAW = [
  "EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","USD/CAD","NZD/USD",
  "EUR/GBP","EUR/JPY","GBP/JPY","AUD/JPY","CHF/JPY","CAD/JPY","NZD/JPY",
  "EUR/AUD","EUR/CAD","EUR/CHF","EUR/NZD","GBP/AUD","GBP/CAD","GBP/CHF","GBP/NZD",
  "AUD/CAD","AUD/CHF","AUD/NZD","CAD/CHF","NZD/CAD","NZD/CHF",
  "USD/SEK","USD/NOK","USD/DKK","USD/PLN","USD/HUF","USD/TRY","USD/ZAR","USD/MXN",
  "USD/SGD","USD/HKD","USD/CNH","USD/INR","USD/THB","USD/KRW","USD/TWD","USD/MYR",
  "USD/IDR","USD/PHP","USD/VND",
  "EUR/SEK","EUR/NOK","EUR/DKK","EUR/PLN","EUR/HUF","EUR/TRY","EUR/ZAR","EUR/MXN",
  "GBP/SEK","GBP/NOK","GBP/DKK","GBP/PLN",
  "AUD/SGD","AUD/HKD","NZD/SGD","CAD/SGD","CHF/SGD","JPY/SGD","SGD/JPY",
  "ZAR/JPY","TRY/JPY","MXN/JPY","NOK/JPY","SEK/JPY","HKD/JPY","CNH/JPY","INR/JPY",
  "BRL/USD","USD/BRL","USD/RUB","EUR/RUB","GBP/RUB",
  "USD/AED","USD/SAR","USD/QAR","USD/KWD","USD/BHD","USD/OMR",
];
const FOREX: Instrument[] = FOREX_RAW.map((p) => {
  const flat = p.replace("/", "");
  return {
    symbol: flat,
    yahooSymbol: `${flat}=X`,
    assetClass: "FOREX",
    displayName: p,
  };
});

// =============== COMMODITIES ===============
const COMMODITIES: Instrument[] = [
  { symbol: "GOLD", yahooSymbol: "GC=F", assetClass: "COMMODITIES", displayName: "Gold" },
  { symbol: "SILVER", yahooSymbol: "SI=F", assetClass: "COMMODITIES", displayName: "Silver" },
  { symbol: "PLATINUM", yahooSymbol: "PL=F", assetClass: "COMMODITIES", displayName: "Platinum" },
  { symbol: "PALLADIUM", yahooSymbol: "PA=F", assetClass: "COMMODITIES", displayName: "Palladium" },
  { symbol: "COPPER", yahooSymbol: "HG=F", assetClass: "COMMODITIES", displayName: "Copper" },
  { symbol: "ALUMINUM", yahooSymbol: "ALI=F", assetClass: "COMMODITIES", displayName: "Aluminum" },
  { symbol: "NICKEL", yahooSymbol: "NI=F", assetClass: "COMMODITIES", displayName: "Nickel" },
  { symbol: "ZINC", yahooSymbol: "ZNC=F", assetClass: "COMMODITIES", displayName: "Zinc" },
  { symbol: "LEAD", yahooSymbol: "LED=F", assetClass: "COMMODITIES", displayName: "Lead" },
  { symbol: "TIN", yahooSymbol: "TIN=F", assetClass: "COMMODITIES", displayName: "Tin" },
  { symbol: "IRON_ORE", yahooSymbol: "TIO=F", assetClass: "COMMODITIES", displayName: "Iron Ore" },
  { symbol: "WTI", yahooSymbol: "CL=F", assetClass: "COMMODITIES", displayName: "Crude Oil WTI" },
  { symbol: "BRENT", yahooSymbol: "BZ=F", assetClass: "COMMODITIES", displayName: "Brent Oil" },
  { symbol: "NATGAS", yahooSymbol: "NG=F", assetClass: "COMMODITIES", displayName: "Natural Gas" },
  { symbol: "GASOLINE", yahooSymbol: "RB=F", assetClass: "COMMODITIES", displayName: "Gasoline (RBOB)" },
  { symbol: "HEATING_OIL", yahooSymbol: "HO=F", assetClass: "COMMODITIES", displayName: "Heating Oil" },
  { symbol: "COAL", yahooSymbol: "MTF=F", assetClass: "COMMODITIES", displayName: "Coal" },
  { symbol: "URANIUM", yahooSymbol: "UX=F", assetClass: "COMMODITIES", displayName: "Uranium" },
  { symbol: "WHEAT", yahooSymbol: "ZW=F", assetClass: "COMMODITIES", displayName: "Wheat" },
  { symbol: "CORN", yahooSymbol: "ZC=F", assetClass: "COMMODITIES", displayName: "Corn" },
  { symbol: "SOYBEANS", yahooSymbol: "ZS=F", assetClass: "COMMODITIES", displayName: "Soybeans" },
  { symbol: "OATS", yahooSymbol: "ZO=F", assetClass: "COMMODITIES", displayName: "Oats" },
  { symbol: "RICE", yahooSymbol: "ZR=F", assetClass: "COMMODITIES", displayName: "Rice" },
  { symbol: "SUGAR", yahooSymbol: "SB=F", assetClass: "COMMODITIES", displayName: "Sugar" },
  { symbol: "COFFEE", yahooSymbol: "KC=F", assetClass: "COMMODITIES", displayName: "Coffee" },
  { symbol: "COCOA", yahooSymbol: "CC=F", assetClass: "COMMODITIES", displayName: "Cocoa" },
  { symbol: "COTTON", yahooSymbol: "CT=F", assetClass: "COMMODITIES", displayName: "Cotton" },
  { symbol: "ORANGE_JUICE", yahooSymbol: "OJ=F", assetClass: "COMMODITIES", displayName: "Orange Juice" },
  { symbol: "LUMBER", yahooSymbol: "LBR=F", assetClass: "COMMODITIES", displayName: "Lumber" },
  { symbol: "MILK", yahooSymbol: "DC=F", assetClass: "COMMODITIES", displayName: "Milk (Class III)" },
  { symbol: "LIVE_CATTLE", yahooSymbol: "LE=F", assetClass: "COMMODITIES", displayName: "Live Cattle" },
  { symbol: "LEAN_HOGS", yahooSymbol: "HE=F", assetClass: "COMMODITIES", displayName: "Lean Hogs" },
  { symbol: "FEEDER_CATTLE", yahooSymbol: "GF=F", assetClass: "COMMODITIES", displayName: "Feeder Cattle" },
  { symbol: "PALM_OIL", yahooSymbol: "FCPO=F", assetClass: "COMMODITIES", displayName: "Palm Oil" },
  { symbol: "CANOLA", yahooSymbol: "RS=F", assetClass: "COMMODITIES", displayName: "Canola" },
  { symbol: "SOYBEAN_OIL", yahooSymbol: "ZL=F", assetClass: "COMMODITIES", displayName: "Soybean Oil" },
  { symbol: "RAPESEED", yahooSymbol: "COM=F", assetClass: "COMMODITIES", displayName: "Rapeseed" },
  { symbol: "BARLEY", yahooSymbol: "AB=F", assetClass: "COMMODITIES", displayName: "Barley" },
  { symbol: "RUBBER", yahooSymbol: "JN=F", assetClass: "COMMODITIES", displayName: "Rubber" },
  { symbol: "ETHANOL", yahooSymbol: "ZK=F", assetClass: "COMMODITIES", displayName: "Ethanol" },
];

// =============== INDICES ===============
const INDICES: Instrument[] = [
  { symbol: "SPX", yahooSymbol: "^GSPC", assetClass: "INDICES", displayName: "S&P 500" },
  { symbol: "NDX", yahooSymbol: "^NDX", assetClass: "INDICES", displayName: "NASDAQ 100" },
  { symbol: "DJI", yahooSymbol: "^DJI", assetClass: "INDICES", displayName: "Dow Jones" },
  { symbol: "RUT", yahooSymbol: "^RUT", assetClass: "INDICES", displayName: "Russell 2000" },
  { symbol: "VIX", yahooSymbol: "^VIX", assetClass: "INDICES", displayName: "VIX" },
  { symbol: "DAX", yahooSymbol: "^GDAXI", assetClass: "INDICES", displayName: "DAX 40" },
  { symbol: "FTSE", yahooSymbol: "^FTSE", assetClass: "INDICES", displayName: "FTSE 100" },
  { symbol: "CAC", yahooSymbol: "^FCHI", assetClass: "INDICES", displayName: "CAC 40" },
  { symbol: "STOXX50", yahooSymbol: "^STOXX50E", assetClass: "INDICES", displayName: "Euro Stoxx 50" },
  { symbol: "IBEX", yahooSymbol: "^IBEX", assetClass: "INDICES", displayName: "IBEX 35" },
  { symbol: "FTSEMIB", yahooSymbol: "FTSEMIB.MI", assetClass: "INDICES", displayName: "FTSE MIB" },
  { symbol: "AEX", yahooSymbol: "^AEX", assetClass: "INDICES", displayName: "AEX" },
  { symbol: "SMI", yahooSymbol: "^SSMI", assetClass: "INDICES", displayName: "SMI" },
  { symbol: "OMX", yahooSymbol: "^OMX", assetClass: "INDICES", displayName: "OMX Stockholm 30" },
  { symbol: "N225", yahooSymbol: "^N225", assetClass: "INDICES", displayName: "Nikkei 225" },
  { symbol: "TOPIX", yahooSymbol: "^TOPX", assetClass: "INDICES", displayName: "TOPIX" },
  { symbol: "HSI", yahooSymbol: "^HSI", assetClass: "INDICES", displayName: "Hang Seng" },
  { symbol: "SSEC", yahooSymbol: "000001.SS", assetClass: "INDICES", displayName: "Shanghai Composite" },
  { symbol: "SZSC", yahooSymbol: "399001.SZ", assetClass: "INDICES", displayName: "Shenzhen Composite" },
  { symbol: "CSI300", yahooSymbol: "000300.SS", assetClass: "INDICES", displayName: "CSI 300" },
  { symbol: "KOSPI", yahooSymbol: "^KS11", assetClass: "INDICES", displayName: "KOSPI" },
  { symbol: "ASX", yahooSymbol: "^AXJO", assetClass: "INDICES", displayName: "ASX 200" },
  { symbol: "NIFTY", yahooSymbol: "^NSEI", assetClass: "INDICES", displayName: "Nifty 50" },
  { symbol: "SENSEX", yahooSymbol: "^BSESN", assetClass: "INDICES", displayName: "Sensex" },
  { symbol: "TWII", yahooSymbol: "^TWII", assetClass: "INDICES", displayName: "Taiwan Weighted" },
  { symbol: "STI", yahooSymbol: "^STI", assetClass: "INDICES", displayName: "Straits Times Index" },
  { symbol: "SET", yahooSymbol: "^SET.BK", assetClass: "INDICES", displayName: "SET Index" },
  { symbol: "JTOPI", yahooSymbol: "^J200.JO", assetClass: "INDICES", displayName: "JSE Top 40" },
  { symbol: "BVSP", yahooSymbol: "^BVSP", assetClass: "INDICES", displayName: "Bovespa" },
  { symbol: "MOEX", yahooSymbol: "IMOEX.ME", assetClass: "INDICES", displayName: "MOEX Russia" },
  { symbol: "TSX", yahooSymbol: "^GSPTSE", assetClass: "INDICES", displayName: "S&P/TSX Composite" },
  { symbol: "MXX", yahooSymbol: "^MXX", assetClass: "INDICES", displayName: "Mexico IPC" },
  { symbol: "DJT", yahooSymbol: "^DJT", assetClass: "INDICES", displayName: "Dow Jones Transport" },
  { symbol: "DJU", yahooSymbol: "^DJU", assetClass: "INDICES", displayName: "Dow Jones Utility" },
  { symbol: "MID", yahooSymbol: "^MID", assetClass: "INDICES", displayName: "S&P MidCap 400" },
  { symbol: "SML", yahooSymbol: "^SP600", assetClass: "INDICES", displayName: "S&P SmallCap 600" },
  { symbol: "IXIC", yahooSymbol: "^IXIC", assetClass: "INDICES", displayName: "NASDAQ Composite" },
  { symbol: "NYA", yahooSymbol: "^NYA", assetClass: "INDICES", displayName: "NYSE Composite" },
  { symbol: "W5000", yahooSymbol: "^W5000", assetClass: "INDICES", displayName: "Wilshire 5000" },
  { symbol: "ACWI_IDX", yahooSymbol: "ACWI", assetClass: "INDICES", displayName: "MSCI World (ACWI)" },
  { symbol: "EEM_IDX", yahooSymbol: "EEM", assetClass: "INDICES", displayName: "MSCI Emerging Markets" },
  { symbol: "EFA_IDX", yahooSymbol: "EFA", assetClass: "INDICES", displayName: "MSCI EAFE" },
  { symbol: "FTSECHINA50", yahooSymbol: "FXI", assetClass: "INDICES", displayName: "FTSE China 50" },
  { symbol: "ES_F", yahooSymbol: "ES=F", assetClass: "INDICES", displayName: "S&P 500 Futures" },
  { symbol: "NQ_F", yahooSymbol: "NQ=F", assetClass: "INDICES", displayName: "NASDAQ 100 Futures" },
  { symbol: "YM_F", yahooSymbol: "YM=F", assetClass: "INDICES", displayName: "Dow Futures" },
  { symbol: "RTY_F", yahooSymbol: "RTY=F", assetClass: "INDICES", displayName: "Russell Futures" },
];

// =============== ETFs ===============
const ETF_TICKERS = [
  "SPY","QQQ","DIA","IWM","VOO","VTI","IVV","SCHD","ARKK","ARKQ","ARKW","ARKG",
  "GLD","SLV","USO","UNG","XLF","XLK","XLE","XLY","XLP","XLV","XLI","XLB","XLU","XLC",
  "XBI","SMH","SOXX","VUG","VTV","VEA","VWO","EEM","EFA","TLT","IEF","SHY","HYG","LQD",
  "BND","AGG","VNQ","IYR","GDX","GDXJ","SPXL","SPXS","TQQQ","SQQQ","UVXY","VXX",
  "BITO","IBIT","FBTC","GBTC","BLOK","ICLN","TAN","PBW","QCLN","LIT","XOP","KRE","XRT",
  "IYT","ITB","XHB","VYM","DVY","SDY","SPHD","JEPI","JEPQ","PFF","DBC","IAU","SPLG",
  "VO","VB","VIG","VGT","VHT","VCR","VDC","VDE",
];
const ETFS: Instrument[] = ETF_TICKERS.map((t) => ({
  symbol: t,
  yahooSymbol: t,
  assetClass: "ETFS",
  displayName: t,
}));

// =============== STOCKS ===============
const STOCKS_RAW: Array<[string, string]> = [
  ["Apple", "AAPL"],["Microsoft", "MSFT"],["Amazon", "AMZN"],["Alphabet", "GOOGL"],
  ["Google", "GOOG"],["Meta Platforms", "META"],["Tesla", "TSLA"],["NVIDIA", "NVDA"],
  ["Netflix", "NFLX"],["AMD", "AMD"],["Intel", "INTC"],["IBM", "IBM"],["Oracle", "ORCL"],
  ["Adobe", "ADBE"],["Salesforce", "CRM"],["PayPal", "PYPL"],["Visa", "V"],
  ["Mastercard", "MA"],["American Express", "AXP"],["Berkshire Hathaway", "BRK-B"],
  ["JP Morgan Chase", "JPM"],["Bank of America", "BAC"],["Morgan Stanley", "MS"],
  ["Goldman Sachs", "GS"],["Citigroup", "C"],["Wells Fargo", "WFC"],["HSBC", "HSBC"],
  ["Barclays", "BCS"],["Deutsche Bank", "DB"],["UBS", "UBS"],["BlackRock", "BLK"],
  ["Charles Schwab", "SCHW"],["Robinhood", "HOOD"],["Coinbase", "COIN"],
  ["Block (Square)", "SQ"],["Shopify", "SHOP"],["Alibaba", "BABA"],["Tencent", "0700.HK"],
  ["Baidu", "BIDU"],["JD.com", "JD"],["Pinduoduo", "PDD"],["Meituan", "3690.HK"],
  ["Xiaomi", "1810.HK"],["Samsung Electronics", "005930.KS"],["Sony", "SONY"],
  ["Panasonic", "6752.T"],["LG Electronics", "066570.KS"],["Toyota", "TM"],
  ["Honda", "HMC"],["Ford", "F"],["General Motors", "GM"],["Ferrari", "RACE"],
  ["BMW", "BMW.DE"],["Mercedes-Benz", "MBG.DE"],["Volkswagen", "VOW3.DE"],
  ["Stellantis", "STLA"],["Rivian", "RIVN"],["Lucid Motors", "LCID"],["NIO", "NIO"],
  ["BYD", "1211.HK"],["XPeng", "XPEV"],["Li Auto", "LI"],["Airbnb", "ABNB"],
  ["Uber", "UBER"],["Lyft", "LYFT"],["Booking Holdings", "BKNG"],["Expedia", "EXPE"],
  ["McDonald's", "MCD"],["Starbucks", "SBUX"],["Coca-Cola", "KO"],["PepsiCo", "PEP"],
  ["Walmart", "WMT"],["Costco", "COST"],["Target", "TGT"],["Home Depot", "HD"],
  ["Lowe's", "LOW"],["Nike", "NKE"],["Adidas", "ADS.DE"],["Puma", "PUM.DE"],
  ["Under Armour", "UA"],["LVMH", "MC.PA"],["Kering (Gucci)", "KER.PA"],
  ["Hermes", "RMS.PA"],["Richemont", "CFR.SW"],["Procter & Gamble", "PG"],
  ["Unilever", "UL"],["Nestle", "NSRGY"],["Colgate-Palmolive", "CL"],
  ["Johnson & Johnson", "JNJ"],["Pfizer", "PFE"],["Moderna", "MRNA"],
  ["AstraZeneca", "AZN"],["Novartis", "NVS"],["Roche", "RHHBY"],["Merck", "MRK"],
  ["Bristol-Myers Squibb", "BMY"],["Gilead Sciences", "GILD"],["AbbVie", "ABBV"],
  ["Amgen", "AMGN"],["Eli Lilly", "LLY"],["Bayer", "BAYN.DE"],["Sanofi", "SNY"],
  ["GlaxoSmithKline", "GSK"],["Thermo Fisher Scientific", "TMO"],["Danaher", "DHR"],
  ["Abbott Laboratories", "ABT"],["Medtronic", "MDT"],["Stryker", "SYK"],
  ["Intuitive Surgical", "ISRG"],["UnitedHealth", "UNH"],["CVS Health", "CVS"],
  ["Walgreens", "WBA"],["Elevance Health", "ELV"],["Cigna", "CI"],["Humana", "HUM"],
  ["Boeing", "BA"],["Airbus", "AIR.PA"],["Lockheed Martin", "LMT"],
  ["Raytheon (RTX)", "RTX"],["Northrop Grumman", "NOC"],["General Electric", "GE"],
  ["Siemens", "SIE.DE"],["Honeywell", "HON"],["3M", "MMM"],["Caterpillar", "CAT"],
  ["Deere & Company", "DE"],["FedEx", "FDX"],["UPS", "UPS"],["DHL (DHL Group)", "DHL.DE"],
  ["Maersk", "MAERSK-B.CO"],["ExxonMobil", "XOM"],["Chevron", "CVX"],["Shell", "SHEL"],
  ["BP", "BP"],["TotalEnergies", "TTE"],["Saudi Aramco", "2222.SR"],["Petrobras", "PBR"],
  ["ConocoPhillips", "COP"],["Marathon Oil", "MRO"],["Occidental Petroleum", "OXY"],
  ["Halliburton", "HAL"],["Schlumberger", "SLB"],["Baker Hughes", "BKR"],
  ["Rio Tinto", "RIO"],["BHP", "BHP"],["Vale", "VALE"],["Freeport-McMoRan", "FCX"],
  ["Glencore", "GLEN.L"],["Newmont", "NEM"],["Barrick Gold", "GOLD"],
  ["Anglo American", "AAL.L"],["ArcelorMittal", "MT"],["Nucor", "NUE"],
  ["Steel Dynamics", "STLD"],["Alcoa", "AA"],["NextEra Energy", "NEE"],
  ["Duke Energy", "DUK"],["Dominion Energy", "D"],["Southern Company", "SO"],
  ["Enel", "ENEL.MI"],["Iberdrola", "IBE.MC"],["National Grid", "NG.L"],
  ["AT&T", "T"],["Verizon", "VZ"],["T-Mobile", "TMUS"],["Vodafone", "VOD"],
  ["Deutsche Telekom", "DTE.DE"],["Orange", "ORA.PA"],["Comcast", "CMCSA"],
  ["Charter Communications", "CHTR"],["Disney", "DIS"],["Warner Bros Discovery", "WBD"],
  ["Paramount Global", "PARA"],["Spotify", "SPOT"],["Snap", "SNAP"],
  ["Pinterest", "PINS"],["Zoom", "ZM"],["DocuSign", "DOCU"],["Palantir", "PLTR"],
  ["Snowflake", "SNOW"],["ServiceNow", "NOW"],["Datadog", "DDOG"],
  ["CrowdStrike", "CRWD"],["Fortinet", "FTNT"],["Palo Alto Networks", "PANW"],
  ["Zscaler", "ZS"],["Okta", "OKTA"],["Cloudflare", "NET"],["Micron Technology", "MU"],
  ["Texas Instruments", "TXN"],["Qualcomm", "QCOM"],["Broadcom", "AVGO"],["ASML", "ASML"],
  ["TSMC", "TSM"],["Arm Holdings", "ARM"],["Applied Materials", "AMAT"],
  ["Lam Research", "LRCX"],["KLA Corporation", "KLAC"],["Marvell", "MRVL"],
  ["Seagate", "STX"],["Western Digital", "WDC"],["Lenovo", "0992.HK"],["HP", "HPQ"],
  ["Dell Technologies", "DELL"],["Cisco", "CSCO"],["Accenture", "ACN"],
  ["Infosys", "INFY"],["Tata Consultancy Services", "TCS.NS"],["Wipro", "WIT"],
  ["HCL Technologies", "HCLTECH.NS"],["Capgemini", "CAP.PA"],["SAP", "SAP"],
  ["MicroStrategy", "MSTR"],
];
const STOCKS: Instrument[] = STOCKS_RAW.map(([name, ticker]) => ({
  symbol: ticker.replace(/[.\-]/g, "_"),
  yahooSymbol: ticker,
  assetClass: "STOCKS",
  displayName: `${name} (${ticker})`,
}));

// Deduplicate by symbol; first occurrence wins. Asset classes are listed in
// priority order — e.g. the GOLD commodity wins over Barrick Gold (ticker GOLD),
// the BTC-USD crypto wins over any stock ticker collision, etc.
function dedupe(items: Instrument[]): Instrument[] {
  const seen = new Set<string>();
  const out: Instrument[] = [];
  for (const i of items) {
    if (seen.has(i.symbol)) continue;
    seen.add(i.symbol);
    out.push(i);
  }
  return out;
}

export const ALL_INSTRUMENTS: Instrument[] = dedupe([
  ...CRYPTO,
  ...FOREX,
  ...COMMODITIES,
  ...INDICES,
  ...ETFS,
  ...STOCKS,
]);

const BY_SYMBOL = new Map<string, Instrument>();
for (const i of ALL_INSTRUMENTS) BY_SYMBOL.set(i.symbol, i);

export function getInstrument(symbol: string): Instrument | undefined {
  return BY_SYMBOL.get(symbol);
}

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  CRYPTO: "Crypto",
  FOREX: "Forex",
  COMMODITIES: "Commodities",
  INDICES: "Indices",
  ETFS: "ETFs",
  STOCKS: "Stocks",
};
