import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GameInput {
  name: string;
  description: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { games } = await req.json() as { games: GameInput[] };

    if (!games || games.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 games required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const gamesList = games.map(g => `${g.name} (${g.description})`).join(" + ");

    const systemPrompt = `You are a creative game designer AI that creates unique fusion games by combining different game mechanics.

Given a combination of games, you will:
1. Create a unique fusion game concept with a creative name
2. Write a brief description of how the mechanics are combined
3. Score the concept on multiple dimensions

Your response MUST be valid JSON with this exact structure:
{
  "name": "Creative fusion game name in Chinese",
  "description": "Brief description of the fusion game concept in Chinese (2-3 sentences)",
  "scores": {
    "creativity": 1-10,
    "playability": 1-10,
    "weirdness": 1-10,
    "addiction": 1-10,
    "overall": 1-10,
    "comment": "A fun, witty comment about this fusion in Chinese (1-2 sentences)"
  }
}

Scoring guidelines:
- creativity: How unique and innovative is the fusion concept?
- playability: How likely is it to be fun and work well?
- weirdness: How strange/unexpected is the combination?
- addiction: How addictive could this game potentially be?
- overall: Overall rating considering all factors

Be creative but realistic. Some combinations might be weird but could actually work well!`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nCreate a fusion game concept for: ${gamesList}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求过于频繁，请稍后再试。" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "使用额度已用完，请添加积分继续使用。" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "处理失败，请重试。" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content =
      data.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("") || "";

    // Clean up and parse JSON
    try {
      if (content.includes("```json")) {
        content = content.split("```json")[1].split("```")[0].trim();
      } else if (content.includes("```")) {
        content = content.split("```")[1].split("```")[0].trim();
      }

      const parsed = JSON.parse(content);
      
      // Validate and ensure all required fields exist
      const result = {
        name: parsed.name || `${games[0].name}${games[1].name}融合`,
        description: parsed.description || "一个独特的融合游戏",
        scores: {
          creativity: Math.min(10, Math.max(1, parsed.scores?.creativity || 7)),
          playability: Math.min(10, Math.max(1, parsed.scores?.playability || 6)),
          weirdness: Math.min(10, Math.max(1, parsed.scores?.weirdness || 8)),
          addiction: Math.min(10, Math.max(1, parsed.scores?.addiction || 6)),
          overall: Math.min(10, Math.max(1, parsed.scores?.overall || 7)),
          comment: parsed.scores?.comment || "这是一个有趣的组合！",
        },
      };

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch {
      // Fallback response if parsing fails
      const fallback = {
        name: `${games[0].name}×${games[1].name}`,
        description: `融合了${games.map(g => g.name).join("和")}的核心玩法，创造出全新的游戏体验。`,
        scores: {
          creativity: 7,
          playability: 6,
          weirdness: 8,
          addiction: 6,
          overall: 7,
          comment: "这个组合很有创意，可能会产生意想不到的效果！",
        },
      };

      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("game-lab-fusion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
