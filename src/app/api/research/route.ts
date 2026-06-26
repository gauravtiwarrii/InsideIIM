import { NextRequest, NextResponse } from "next/server";
import { investmentGraph } from "@/lib/graph/investment-graph";
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { createClient } from '@/utils/supabase/server'

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Initialize Ratelimit (50 requests per day per IP/User for testing)
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, '1 d'),
})

export async function POST(req: NextRequest) {
  const { companyName } = await req.json();

  if (!companyName) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Rate Limiting
  const identifier = user ? user.id : req.headers.get("x-forwarded-for") ?? 'anonymous'
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again tomorrow." }, { status: 429 });
  }

  // Caching
  const cacheKey = `analysis_v2:${companyName.toLowerCase().replace(/\s+/g, '')}`

  const stream = new ReadableStream({
    async start(controller) {
      let completeSent = false;
      let controllerClosed = false;
      const collectedData: Record<string, any> = {};

      const sendEvent = (event: any) => {
        if (controllerClosed) return;
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          controllerClosed = true;
        }
      };

      try {
        // Check Cache first
        const cachedReport = await redis.get(cacheKey)
        if (cachedReport) {
          sendEvent({ type: "step", data: null, message: "Retrieving from fast cache..." });
          sendEvent({
            type: "complete",
            data: cachedReport,
            message: "Analysis retrieved from cache!",
          });
          controller.close();
          return;
        }

        // Stream events from LangGraph
        const eventStream = await investmentGraph.streamEvents(
          { companyName } as any,
          { version: "v2" }
        );

        for await (const event of eventStream) {
          if (event.event === "on_chain_end" && event.name === "LangGraph") {
            const finalState = event.data?.output;
            let reportPayload = null;

            if (finalState?.reportData) {
              reportPayload = finalState.reportData;
            } else if (finalState) {
              reportPayload = {
                companyName: finalState.companyName ?? companyName,
                tickerSymbol: finalState.tickerSymbol ?? null,
                chartData: finalState.chartData ?? null,
                researchData: finalState.researchData ?? null,
                financialData: finalState.financialData ?? null,
                newsData: finalState.newsData ?? null,
                riskData: finalState.riskData ?? null,
                investmentData: finalState.investmentData ?? null,
              };
            }

            if (reportPayload) {
              // Save to Redis Cache (24 hours)
              await redis.set(cacheKey, reportPayload, { ex: 86400 })

              // Save to Supabase DB if user is logged in
              let dbId = null;
              if (user) {
                const { data: insertedReport, error: dbError } = await supabase
                  .from('reports')
                  .insert({
                    user_id: user.id,
                    company_name: reportPayload.companyName,
                    ticker_symbol: reportPayload.tickerSymbol,
                    investment_score: reportPayload.investmentData?.investmentScore,
                    confidence_score: reportPayload.investmentData?.confidenceScore,
                    recommendation: reportPayload.investmentData?.recommendation,
                    report_data: reportPayload
                  })
                  .select('id')
                  .single()
                
                if (insertedReport) {
                  dbId = insertedReport.id;
                  reportPayload.dbId = dbId;
                }
              }

              sendEvent({
                type: "complete",
                data: reportPayload,
                message: "Analysis complete!",
              });
              completeSent = true;
            }
          } else if (event.event === "on_chain_start") {
             if (event.name === "research") {
                sendEvent({ type: "step", data: null, message: "Researching company overview..." });
             } else if (event.name === "financial") {
                sendEvent({ type: "step", data: null, message: "Gathering financials..." });
             } else if (event.name === "news") {
                sendEvent({ type: "step", data: null, message: "Analyzing news..." });
             } else if (event.name === "risk") {
                sendEvent({ type: "step", data: null, message: "Evaluating risks..." });
             } else if (event.name === "investment") {
                sendEvent({ type: "step", data: null, message: "Generating recommendation..." });
             } else if (event.name === "reviewer") {
                sendEvent({ type: "step", data: null, message: "Critiquing recommendation..." });
             }
          } else if (event.event === "on_chain_end") {
             const output = event.data?.output;
             if (event.name === "research") {
                collectedData.researchData = output?.researchData;
                collectedData.tickerSymbol = output?.tickerSymbol;
                collectedData.chartData = output?.chartData;
                sendEvent({ type: "research", data: output?.researchData, message: "Research complete" });
             } else if (event.name === "financial") {
                collectedData.financialData = output?.financialData;
                sendEvent({ type: "financial", data: output?.financialData, message: "Financial analysis complete" });
             } else if (event.name === "news") {
                collectedData.newsData = output?.newsData;
                sendEvent({ type: "news", data: output?.newsData, message: "News analysis complete" });
             } else if (event.name === "risk") {
                collectedData.riskData = output?.riskData;
                sendEvent({ type: "risk", data: output?.riskData, message: "Risk analysis complete" });
             } else if (event.name === "investment") {
                collectedData.investmentData = output?.investmentData;
                sendEvent({ type: "investment", data: output?.investmentData, message: "Recommendation generated" });
             } else if (event.name === "reviewer") {
                if (output?.reviewComments) {
                   sendEvent({ type: "step", data: null, message: "Review failed. Requesting revision..." });
                } else {
                   sendEvent({ type: "step", data: null, message: "Review passed. Assembling report..." });
                }
             }
          }
        }

        if (!completeSent && collectedData.investmentData) {
          console.log("[API] Sending fallback complete event from collected data");
          const fallbackPayload = {
            companyName,
            tickerSymbol: collectedData.tickerSymbol ?? null,
            chartData: collectedData.chartData ?? null,
            researchData: collectedData.researchData ?? null,
            financialData: collectedData.financialData ?? null,
            newsData: collectedData.newsData ?? null,
            riskData: collectedData.riskData ?? null,
            investmentData: collectedData.investmentData ?? null,
          };
          
          await redis.set(cacheKey, fallbackPayload, { ex: 86400 })
          
          if (user) {
            const { data: insertedReport } = await supabase
              .from('reports')
              .insert({
                user_id: user.id,
                company_name: fallbackPayload.companyName,
                ticker_symbol: fallbackPayload.tickerSymbol,
                investment_score: fallbackPayload.investmentData?.investmentScore,
                confidence_score: fallbackPayload.investmentData?.confidenceScore,
                recommendation: fallbackPayload.investmentData?.recommendation,
                report_data: fallbackPayload
              })
              .select('id')
              .single()
              
            if (insertedReport) {
              (fallbackPayload as any).dbId = insertedReport.id;
            }
          }

          sendEvent({
            type: "complete",
            data: fallbackPayload,
            message: "Analysis complete!",
          });
          completeSent = true;
        }
      } catch (error) {
        console.error("API Error:", error);
        sendEvent({
          type: "error",
          data: null,
          message: error instanceof Error ? error.message : "An error occurred",
        });
      } finally {
        try {
          controller.close();
        } catch (e) {
          // ignore closed controller errors
        }
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
