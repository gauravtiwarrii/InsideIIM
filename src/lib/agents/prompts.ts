export const RESEARCH_PROMPT = `You are a corporate research analyst.
Extract key information about "{companyName}" from the provided search results.

Search Results:
{searchResults}

Output ONLY valid JSON in this format:
{{
  "overview": "Brief description of the company",
  "industry": "Primary industry sector",
  "marketPosition": "Market standing and share",
  "competitors": ["comp1", "comp2", "comp3"],
  "leadership": "Key executives"
}}`;

export const FINANCIAL_PROMPT = `You are a financial analyst.
Analyze "{companyName}" using the provided exact financial data and search results. Calculate a Financial Health Score (0-100).

Exact Financial Data (Prioritize these numbers over search results!):
{exactFinancialData}

Search Results (For context and text details):
{searchResults}

Output ONLY valid JSON in this format:
{{
  "revenue": "Revenue figure",
  "netIncome": "Net income figure",
  "eps": "Earnings per share",
  "marketCap": "Market capitalization",
  "peRatio": "Price-to-earnings ratio",
  "revenueGrowth": "YoY growth percentage",
  "financialHealthScore": <number>
}}`;

export const NEWS_PROMPT = `You are a market news analyst.
Analyze the latest news for "{companyName}" from these search results. Calculate a News Sentiment Score (0-100).

Search Results:
{searchResults}

Output ONLY valid JSON in this format:
{{
  "newsSummary": "Brief summary of recent news",
  "productLaunches": ["launch1", "launch2"],
  "acquisitions": ["acq1", "acq2"],
  "lawsuits": ["suit1", "suit2"],
  "partnerships": ["partner1", "partner2"],
  "regulatoryIssues": ["issue1", "issue2"],
  "newsSentimentScore": <number>
}}`;

export const RISK_PROMPT = `You are a risk management analyst.
Identify risks for "{companyName}" from these search results. Calculate a Risk Score (0-100, where 100 means low risk and 0 means extremely high risk).

Search Results:
{searchResults}

Output ONLY valid JSON in this format:
{{
  "competitionRisk": "Description of competitive threats",
  "regulatoryRisk": "Description of regulatory threats",
  "debtRisk": "Description of financial/debt risks",
  "marketRisk": "Description of broad market risks",
  "businessModelRisk": "Description of core business vulnerabilities",
  "riskScore": <number>
}}`;

export const INVESTMENT_PROMPT = `You are a senior investment advisor at a top-tier hedge fund.
Combine the research, financial, news, risk, technical, and sentiment data for "{companyName}" to make a final recommendation.

Research: {researchData}
Financial: {financialData}
News: {newsData}
Risk: {riskData}
Technical: {technicalData}
Sentiment: {sentimentData}

Calculate an overall Investment Score (0-100).
Calculate a Confidence Score (0-100).
Recommendation rules: Score > 75 = INVEST, Score 50-75 = HOLD, Score < 50 = PASS.

Also provide:
- bullCase: 3 specific reasons why this stock could outperform expectations
- bearCase: 3 specific reasons why this stock could underperform expectations
- catalysts: 3-5 upcoming events/triggers that could significantly move the stock (e.g. earnings reports, product launches, regulatory decisions, M&A, macro events)
- holdingPeriod: SHORT_TERM (< 6 months), MEDIUM_TERM (6-18 months), or LONG_TERM (> 18 months)
- targetPriceInsight: A brief statement about estimated fair value relative to current price

Output ONLY valid JSON in this format:
{{
  "investmentScore": <number>,
  "confidenceScore": <number>,
  "recommendation": "INVEST" or "HOLD" or "PASS",
  "reasoning": "Detailed 3-paragraph explanation of your investment thesis.",
  "bullCase": ["reason1", "reason2", "reason3"],
  "bearCase": ["reason1", "reason2", "reason3"],
  "catalysts": ["catalyst1", "catalyst2", "catalyst3"],
  "holdingPeriod": "SHORT_TERM" or "MEDIUM_TERM" or "LONG_TERM",
  "targetPriceInsight": "Brief fair value statement"
}}`;

export const TICKER_PROMPT = `You are a financial data assistant.
Extract the primary stock ticker symbol for "{companyName}".
If public, provide the symbol (e.g., "AAPL"). If private or unknown, return null.

Output ONLY valid JSON in this format:
{{
  "ticker": "TICKER_SYMBOL" or null
}}`;

export const TECHNICAL_PROMPT = `You are a technical analyst.
Analyze the price trends and moving averages for "{companyName}" based on this chart data:
{chartData}

Identify key support/resistance levels, trend directions, and momentum.
Calculate a Technical Score (0-100).

Output ONLY valid JSON in this format:
{{
  "trend": "Bullish", "Bearish", or "Neutral",
  "supportLevel": "Price level or description",
  "resistanceLevel": "Price level or description",
  "momentum": "Description of momentum indicators (e.g., MACD/RSI estimates)",
  "technicalScore": <number>
}}`;

export const SENTIMENT_PROMPT = `You are a market sentiment analyst.
Evaluate the broader public and institutional sentiment towards "{companyName}" based on these search results:
{searchResults}

Score the sentiment from 0 (Extremely Negative) to 100 (Extremely Positive).

Output ONLY valid JSON in this format:
{{
  "overallSentiment": "Bullish", "Bearish", or "Neutral",
  "institutionalSentiment": "Description of institutional view",
  "retailSentiment": "Description of retail view",
  "keySentimentDrivers": ["driver1", "driver2", "driver3"],
  "sentimentScore": <number>
}}`;
