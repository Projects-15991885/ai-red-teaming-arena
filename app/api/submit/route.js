import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, response, model, modelName, failureType, score, confidence, attackerName } = body;

    if (!prompt || !response || !failureType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("submissions")
      .insert([{
        prompt,
        response,
        model,
        model_name: modelName,
        failure_type: failureType,
        score,
        confidence,
        attacker_name: attackerName || "Anonymous",
      }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: data[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}