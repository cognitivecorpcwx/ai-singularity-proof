import { NextRequest, NextResponse } from "next/server";
import { loadData, addDataPoint } from "@/lib/data";

export async function GET() {
  try {
    const data = loadData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, time, score, model, source } = body;

    if (!domainId || time == null || score == null) {
      return NextResponse.json(
        { error: "domainId, time, and score are required" },
        { status: 400 }
      );
    }

    const data = addDataPoint(domainId, {
      time: Number(time),
      score: Number(score),
      model: model || "Unknown",
      source: source || "Manual Entry",
    });

    return NextResponse.json({ success: true, domain: data.domains[domainId] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add data" },
      { status: 500 }
    );
  }
}
