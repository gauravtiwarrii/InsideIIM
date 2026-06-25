import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance({ suppressNotices: ["ripHistorical"] });

export async function getHistoricalData(ticker: string, months: number = 6) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const result = await yahooFinance.chart(ticker, {
      period1: startDate,
      period2: endDate,
      interval: "1wk",
    });

    return result.quotes
      .filter((d) => d.close != null)
      .map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: d.close as number,
      }));
  } catch (error) {
    console.error("Yahoo Finance Error:", error);
    return null;
  }
}
