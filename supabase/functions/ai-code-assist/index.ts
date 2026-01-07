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
    const { prompt, currentCode, context } = await req.json();

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

    const systemPrompt = `You are an expert web developer AI assistant that helps modify HTML/CSS/JavaScript code for games and interactive tools.

Your task is to modify the given code based on the user's request.

Rules:
1. Keep the existing functionality working unless asked to change it
2. Make only the requested changes
3. Use modern CSS and JavaScript best practices
4. Keep the code clean and well-organized
5. Add helpful comments for significant changes
6. Preserve the overall structure and style unless asked to change it
7. For games, ensure smooth performance and good user experience

IMPORTANT: Your response MUST be valid JSON with this exact structure:
{
  "code": "THE COMPLETE MODIFIED HTML CODE STARTING WITH <!DOCTYPE html>",
  "explanation": "A brief explanation of what was changed (1-2 sentences in the same language as the user's prompt)"
}

The explanation should be friendly and concise, describing the key changes made.

Original creation context: ${context || 'Interactive web content'}

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
    let content = data.choices?.[0]?.message?.content || "";

    // Try to parse as JSON first
    try {
      // Clean up the response if it's wrapped in markdown code blocks
      if (content.includes("```json")) {
        content = content.split("```json")[1].split("```")[0].trim();
      } else if (content.includes("```")) {
        content = content.split("```")[1].split("```")[0].trim();
      }

      const parsed = JSON.parse(content);
      let code = parsed.code || "";
      const explanation = parsed.explanation || "✅ 代码已更新";

      // Ensure code starts with DOCTYPE
      if (code && !code.startsWith("<!DOCTYPE")) {
        const doctypeIndex = code.indexOf("<!DOCTYPE");
        if (doctypeIndex > -1) {
          code = code.substring(doctypeIndex);
        }
      }

      return new Response(
        JSON.stringify({ code, explanation }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch {
      // Fallback: treat the whole response as code
      let code = content;
      
      // Clean up if wrapped in code blocks
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
        JSON.stringify({ code, explanation: "✅ 代码已更新" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("ai-code-assist error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
