import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["ripHistorical", "yahooSurvey"] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const result = await yahooFinance.search(query, {
      quotesCount: 8,
      newsCount: 0,
    });

    // Filter to only equity or mutual funds, and map to a clean format
    const suggestions = result.quotes
      .filter((q) => q.quoteType === "EQUITY" || q.quoteType === "ETF" || q.quoteType === "MUTUALFUND")
      .map((q) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange,
      }));

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Stock Search Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
