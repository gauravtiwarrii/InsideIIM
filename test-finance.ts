import YahooFinance from "yahoo-finance2";

async function test() {
  const ticker = "AAPL";
  try {
    const quote = await YahooFinance.quote(ticker);
    console.log("QUOTE:");
    console.log(JSON.stringify({
      price: quote.regularMarketPrice,
      marketCap: quote.marketCap,
      peRatio: quote.trailingPE || quote.forwardPE,
      eps: quote.epsTrailingTwelveMonths || quote.epsForward,
    }, null, 2));
    
    // Test quoteSummary for more details
    const summary = await YahooFinance.quoteSummary(ticker, { modules: ["financialData", "defaultKeyStatistics", "summaryDetail"] });
    console.log("SUMMARY:");
    console.log(JSON.stringify({
      revenue: summary.financialData?.totalRevenue,
      netIncome: summary.financialData?.netIncomeToCommon,
      revenueGrowth: summary.financialData?.revenueGrowth,
      debt: summary.financialData?.totalDebt,
      operatingMargins: summary.financialData?.operatingMargins,
    }, null, 2));
  } catch (error) {
    console.error(error);
  }
}

test();
