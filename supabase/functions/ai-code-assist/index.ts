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
    const { prompt, currentCode } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!currentCode || typeof currentCode !== "string") {
      return new Response(
        JSON.stringify({ error: "Please provide the current code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert web developer AI assistant that helps modify HTML/CSS/JavaScript code.

Given the current code and a user request, modify the code to implement the requested changes.

Rules:
1. Keep the existing functionality working
2. Make only the requested changes
3. Use modern CSS and JavaScript best practices
4. Keep the code clean and well-organized
5. Return ONLY the complete modified HTML code, nothing else
6. Start with <!DOCTYPE html> and end with </html>
7. Preserve the overall structure and style unless asked to change it
8. Add helpful comments for significant changes

Current code to modify:
\`\`\`html
${currentCode}
\`\`\``;

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
          { role: "user", content: `Please modify the code: ${prompt.trim()}` },
        ],
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
        JSON.stringify({ error: "Failed to process. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let code = data.choices?.[0]?.message?.content || "";

    // Clean up the response - extract HTML if wrapped in code blocks
    if (code.includes("```html")) {
      code = code.split("```html")[1].split("```")[0].trim();
    } else if (code.includes("```")) {
      code = code.split("```")[1].split("```")[0].trim();
    }

    // Ensure it starts with DOCTYPE
    if (!code.startsWith("<!DOCTYPE")) {
      const doctypeIndex = code.indexOf("<!DOCTYPE");
      if (doctypeIndex > -1) {
        code = code.substring(doctypeIndex);
      }
    }

    return new Response(
      JSON.stringify({ code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-code-assist error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});