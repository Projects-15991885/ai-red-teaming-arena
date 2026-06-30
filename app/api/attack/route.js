import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { prompt, modelId } = await request.json();

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
      }),
    });

    const data = await res.json();
    console.log("OpenRouter raw response:", JSON.stringify(data));

    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json({ error: "Model did not respond" }, { status: 500 });
    }

    return NextResponse.json({
      response: data.choices[0].message.content,
      model: modelId,
      usage: data.usage,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}