import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, gameType } = await req.json();
    
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a game description" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert game designer assistant. Your job is to help users improve their game ideas and make them more specific and implementable.

When given a game description, analyze it and provide:

1. **Enhanced Description** (1-2 sentences): A polished, more specific version of their idea
2. **Core Mechanics** (3-5 bullet points): The key game mechanics that should be implemented
3. **Visual Style** (1-2 sentences): Recommended visual aesthetic and color scheme
4. **Player Goals** (2-3 bullet points): Clear objectives for the player
5. **Suggested Features** (3-5 bullet points): Additional features that would make the game more engaging
6. **Optimized Prompt**: A refined prompt that would generate a better game

${gameType === "养成" || gameType === "simulation" ? `
For simulation/raising games specifically, consider:
- Character stats and progression systems
- Time-based mechanics (day/night cycles, seasons)
- Resource management (money, energy, happiness)
- Milestone events and achievements
- Save/load functionality requirements
- Long-term goals and endings
` : ""}

Respond in the same language as the user's input. Be specific and actionable.
Format your response as JSON with keys: enhancedDescription, coreMechanics, visualStyle, playerGoals, suggestedFeatures, optimizedPrompt`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze and enhance this game idea: "${prompt.trim()}"` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // If not valid JSON, wrap it
      analysis = { rawAnalysis: content };
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("design-assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
