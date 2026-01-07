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
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert game developer AI that creates fun, playable HTML5 games and interactive tools.

When given a description, generate a complete, self-contained HTML file with embedded CSS and JavaScript.

GAME DESIGN PRINCIPLES:
1. PLAYABILITY FIRST - The game must be immediately playable and fun
2. Clear instructions - Show how to play (keyboard/mouse/touch controls)
3. Feedback loops - Visual/audio feedback for every action
4. Scoring - Include points, high scores, or progress tracking
5. Challenge - Start easy, gradually increase difficulty
6. Replayability - Add "Play Again" after game over

TECHNICAL REQUIREMENTS:
1. Modern CSS with gradients, animations, vibrant colors
2. Responsive design - works on desktop and mobile
3. Touch support for mobile games
4. Smooth 60fps animations using requestAnimationFrame
5. Sound effects using Web Audio API or Audio elements
6. Game loop with proper state management (start, playing, paused, game over)

SAVE/LOAD SYSTEM (for simulation/raising games):
For games that need persistence (virtual pets, idle games, RPGs, simulation), include this save system:
\`\`\`javascript
// Save game state to parent window
function saveGame(saveData) {
  window.parent.postMessage({ type: 'GAME_SAVE', data: saveData }, '*');
}

// Request load from parent window
function requestLoad() {
  window.parent.postMessage({ type: 'GAME_LOAD_REQUEST' }, '*');
}

// Listen for loaded data
window.addEventListener('message', (event) => {
  if (event.data.type === 'GAME_LOAD_RESPONSE') {
    // event.data.saveData contains the loaded game state
    if (event.data.saveData) {
      // Restore game state here
    }
  }
});

// Call requestLoad() on game start
\`\`\`

VISUAL STYLE:
- Vibrant, colorful palette (avoid boring grays)
- Rounded corners, soft shadows
- Animated backgrounds or particles
- Satisfying micro-interactions
- Fun emoji or simple shapes for graphics

Return ONLY the HTML code, no explanations. Start with <!DOCTYPE html> and end with </html>.
Make it fun, polished, and impossible to put down!`;

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
          { role: "user", content: `Create: ${prompt.trim()}` }
        ],
        stream: true,
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
        JSON.stringify({ error: "Failed to generate. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("generate-creation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
