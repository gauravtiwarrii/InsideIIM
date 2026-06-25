import { NextRequest, NextResponse } from "next/server";
import { investmentGraph } from "@/lib/graph/investment-graph";

export async function POST(req: NextRequest) {
  const { companyName } = await req.json();

  if (!companyName) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      // Track accumulated agent outputs as fallback
      let completeSent = false;
      let controllerClosed = false;
      const collectedData: Record<string, any> = {};

      const sendEvent = (event: any) => {
        if (controllerClosed) return;
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Controller may already be closed
          controllerClosed = true;
        }
      };

      try {
        // Stream events from the true LangGraph compiled StateGraph
        const eventStream = await investmentGraph.streamEvents(
          { companyName },
          { version: "v2" }
        );

        for await (const event of eventStream) {
          if (event.event === "on_chain_end" && event.name === "LangGraph") {
            // The final LangGraph event — try multiple output structures
            const finalState = event.data?.output;
            let reportPayload = null;

            if (finalState?.reportData) {
              // Ideal case: the report node packaged it
              reportPayload = finalState.reportData;
            } else if (finalState) {
              // Fallback: the state has all data at the top level
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

        // Fallback: if the stream ended but no complete event was sent,
        // assemble the report from collected agent outputs
        if (!completeSent && collectedData.investmentData) {
          console.log("[API] Sending fallback complete event from collected data");
          sendEvent({
            type: "complete",
            data: {
              companyName,
              tickerSymbol: collectedData.tickerSymbol ?? null,
              chartData: collectedData.chartData ?? null,
              researchData: collectedData.researchData ?? null,
              financialData: collectedData.financialData ?? null,
              newsData: collectedData.newsData ?? null,
              riskData: collectedData.riskData ?? null,
              investmentData: collectedData.investmentData ?? null,
            },
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
        controller.close();
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
