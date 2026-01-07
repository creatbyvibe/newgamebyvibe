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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert game developer AI that creates fun, FULLY PLAYABLE HTML5 games.

CRITICAL: The game MUST be completely functional and playable immediately. No placeholder code, no TODO comments, no "game loop placeholder" - the game must work!

When given a description, generate a complete, self-contained HTML file with embedded CSS and JavaScript.

MANDATORY GAME STRUCTURE:
1. TITLE SCREEN - Show game name, brief instructions, and a START button
2. GAME SCREEN - The actual gameplay with HUD (score, lives, etc.)
3. GAME OVER SCREEN - Final score and PLAY AGAIN button
4. All buttons MUST have working click event handlers

GAME IMPLEMENTATION REQUIREMENTS:
\`\`\`javascript
// REQUIRED: Game state management
let gameState = 'title'; // 'title', 'playing', 'gameover'
let score = 0;
let gameLoopId = null;

// REQUIRED: Start game function - called by Start button
function startGame() {
    gameState = 'playing';
    score = 0;
    // Initialize game objects
    gameLoop();
}

// REQUIRED: Main game loop
function gameLoop() {
    if (gameState !== 'playing') return;
    
    // Update game logic
    update();
    // Draw everything
    draw();
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

// REQUIRED: Game over function
function gameOver() {
    gameState = 'gameover';
    cancelAnimationFrame(gameLoopId);
    drawGameOverScreen();
}

// REQUIRED: Play again function - called by Play Again button
function playAgain() {
    startGame();
}
\`\`\`

BUTTON EVENT HANDLING (CRITICAL):
\`\`\`javascript
// For canvas-based games, detect button clicks properly:
canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (gameState === 'title') {
        // Check if click is inside start button bounds
        if (x > startBtn.x && x < startBtn.x + startBtn.width &&
            y > startBtn.y && y < startBtn.y + startBtn.height) {
            startGame();
        }
    } else if (gameState === 'gameover') {
        // Check if click is inside play again button
        if (x > replayBtn.x && x < replayBtn.x + replayBtn.width &&
            y > replayBtn.y && y < replayBtn.y + replayBtn.height) {
            playAgain();
        }
    }
});

// Store button positions for click detection
const startBtn = { x: 0, y: 0, width: 0, height: 0 };
const replayBtn = { x: 0, y: 0, width: 0, height: 0 };

// When drawing buttons, update their positions:
function drawButton(text, centerX, centerY, btnRef) {
    const width = 200, height = 50;
    const x = centerX - width/2;
    const y = centerY - height/2;
    
    // Store for click detection
    btnRef.x = x; btnRef.y = y; btnRef.width = width; btnRef.height = height;
    
    // Draw button
    ctx.fillStyle = '#ff6b6b';
    ctx.roundRect(x, y, width, height, 10);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText(text, centerX, centerY);
}
\`\`\`

VISUAL REQUIREMENTS:
- Vibrant, colorful palette (no boring grays)
- Rounded corners, soft shadows
- Animated title screen
- Clear visual feedback for all interactions
- HUD showing score, lives, level clearly

CONTROL REQUIREMENTS:
- Keyboard: arrow keys / WASD for movement
- Touch: swipe or tap controls for mobile
- Show control instructions on title screen

Return ONLY the HTML code. Start with <!DOCTYPE html> and end with </html>.
The game MUST be playable - test your logic mentally before outputting!`;


    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nUser request: ${prompt.trim()}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

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

    if (!response.body) {
      throw new Error("No response body from Gemini");
    }

    // Convert Gemini streaming chunks to SSE format expected by frontend
    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();
    const textEncoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += textDecoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              // Gemini streaming does not always prefix with "data:"
              const jsonStr = trimmed.startsWith("data:")
                ? trimmed.slice(5).trim()
                : trimmed;

              try {
                const data = JSON.parse(jsonStr);
                const textChunk =
                  data.candidates?.[0]?.content?.parts
                    ?.map((p: { text?: string }) => p.text || "")
                    .join("") || "";

                if (textChunk) {
                  const ssePayload = `data: ${JSON.stringify({
                    choices: [{ delta: { content: textChunk } }],
                  })}\n\n`;
                  controller.enqueue(textEncoder.encode(ssePayload));
                }
              } catch {
                // ignore malformed lines
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
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
