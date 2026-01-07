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

Here are 3 PERFECT examples of working games to learn from. Study their structure carefully:

EXAMPLE 1: Simple Snake Game
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1a2e; font-family: Arial; }
    canvas { border: 3px solid #16213e; border-radius: 10px; }
    #ui { position: absolute; color: white; text-align: center; }
    button { padding: 15px 40px; font-size: 18px; border: none; border-radius: 10px; background: #0f3460; color: white; cursor: pointer; }
  </style>
</head>
<body>
  <div id="ui">
    <h1>🐍 贪吃蛇</h1>
    <p>使用方向键控制</p>
    <button onclick="startGame()">开始游戏</button>
    <p id="score"></p>
  </div>
  <canvas id="game" width="400" height="400"></canvas>
  
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const ui = document.getElementById('ui');
    const scoreEl = document.getElementById('score');
    
    let gameState = 'title';
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let direction = {x: 0, y: 0};
    let score = 0;
    let gameLoopId = null;
    
    function startGame() {
      gameState = 'playing';
      ui.style.display = 'none';
      snake = [{x: 10, y: 10}];
      direction = {x: 1, y: 0};
      score = 0;
      food = {x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20)};
      gameLoop();
    }
    
    function gameLoop() {
      if (gameState !== 'playing') return;
      
      const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
      snake.unshift(head);
      
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = {x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20)};
      } else {
        snake.pop();
      }
      
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 ||
          snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
      }
      
      draw();
      gameLoopId = setTimeout(gameLoop, 150);
    }
    
    function draw() {
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, 0, 400, 400);
      
      ctx.fillStyle = '#00ff88';
      snake.forEach(s => ctx.fillRect(s.x*20, s.y*20, 18, 18));
      
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(food.x*20, food.y*20, 18, 18);
      
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('分数: ' + score, 10, 30);
    }
    
    function gameOver() {
      gameState = 'gameover';
      if (gameLoopId) clearTimeout(gameLoopId);
      ui.innerHTML = '<h1>游戏结束</h1><p>得分: ' + score + '</p><button onclick="startGame()">再玩一次</button>';
      ui.style.display = 'block';
    }
    
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' && direction.y === 0) direction = {x: 0, y: -1};
      if (e.key === 'ArrowDown' && direction.y === 0) direction = {x: 0, y: 1};
      if (e.key === 'ArrowLeft' && direction.x === 0) direction = {x: -1, y: 0};
      if (e.key === 'ArrowRight' && direction.x === 0) direction = {x: 1, y: 0};
    });
  </script>
</body>
</html>
\`\`\`

EXAMPLE 2: Breakout Game
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0a0a0a; font-family: Arial; }
    canvas { border: 3px solid #333; border-radius: 10px; }
    #ui { position: absolute; color: white; text-align: center; }
    button { padding: 15px 40px; font-size: 18px; border: none; border-radius: 10px; background: #4a90e2; color: white; cursor: pointer; }
  </style>
</head>
<body>
  <div id="ui">
    <h1>🧱 打砖块</h1>
    <p>使用左右箭头键移动挡板</p>
    <button onclick="startGame()">开始游戏</button>
  </div>
  <canvas id="game" width="600" height="400"></canvas>
  
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const ui = document.getElementById('ui');
    
    let gameState = 'title';
    let paddle = {x: 250, y: 370, width: 100, height: 15};
    let ball = {x: 300, y: 200, vx: 3, vy: -3, radius: 8};
    let bricks = [];
    let score = 0;
    let lives = 3;
    let gameLoopId = null;
    let keys = {};
    
    function initBricks() {
      bricks = [];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          bricks.push({x: col * 60 + 5, y: row * 25 + 50, width: 55, height: 20, color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][row]});
        }
      }
    }
    
    function startGame() {
      gameState = 'playing';
      ui.style.display = 'none';
      paddle = {x: 250, y: 370, width: 100, height: 15};
      ball = {x: 300, y: 200, vx: 3, vy: -3, radius: 8};
      score = 0;
      lives = 3;
      initBricks();
      gameLoop();
    }
    
    function gameLoop() {
      if (gameState !== 'playing') return;
      
      if (keys['ArrowLeft']) paddle.x = Math.max(0, paddle.x - 5);
      if (keys['ArrowRight']) paddle.x = Math.min(canvas.width - paddle.width, paddle.x + 5);
      
      ball.x += ball.vx;
      ball.y += ball.vy;
      
      if (ball.x <= ball.radius || ball.x >= canvas.width - ball.radius) ball.vx = -ball.vx;
      if (ball.y <= ball.radius) ball.vy = -ball.vy;
      
      if (ball.y >= canvas.height - ball.radius) {
        lives--;
        if (lives <= 0) {
          gameOver();
          return;
        }
        ball = {x: 300, y: 200, vx: 3, vy: -3, radius: 8};
      }
      
      if (ball.y + ball.radius >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
        ball.vy = -Math.abs(ball.vy);
      }
      
      for (let i = bricks.length - 1; i >= 0; i--) {
        const b = bricks[i];
        if (ball.x >= b.x && ball.x <= b.x + b.width && ball.y >= b.y && ball.y <= b.y + b.height) {
          bricks.splice(i, 1);
          ball.vy = -ball.vy;
          score += 10;
          if (bricks.length === 0) {
            gameWin();
            return;
          }
        }
      }
      
      draw();
      gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    function draw() {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      bricks.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
      });
      
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('分数: ' + score + ' | 生命: ' + lives, 10, 30);
    }
    
    function gameOver() {
      gameState = 'gameover';
      if (gameLoopId) cancelAnimationFrame(gameLoopId);
      ui.innerHTML = '<h1>游戏结束</h1><p>最终得分: ' + score + '</p><button onclick="startGame()">再玩一次</button>';
      ui.style.display = 'block';
    }
    
    function gameWin() {
      gameState = 'gameover';
      if (gameLoopId) cancelAnimationFrame(gameLoopId);
      ui.innerHTML = '<h1>恭喜通关！</h1><p>得分: ' + score + '</p><button onclick="startGame()">再玩一次</button>';
      ui.style.display = 'block';
    }
    
    document.addEventListener('keydown', e => keys[e.key] = true);
    document.addEventListener('keyup', e => keys[e.key] = false);
  </script>
</body>
</html>
\`\`\`

EXAMPLE 3: Simple Runner Game
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(to bottom, #87CEEB, #98D8C8); font-family: Arial; }
    canvas { border: 3px solid #333; border-radius: 10px; }
    #ui { position: absolute; color: white; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
    button { padding: 15px 40px; font-size: 18px; border: none; border-radius: 10px; background: #ff6b6b; color: white; cursor: pointer; }
  </style>
</head>
<body>
  <div id="ui">
    <h1>🏃 无尽跑酷</h1>
    <p>按空格键或点击屏幕跳跃</p>
    <button onclick="startGame()">开始游戏</button>
  </div>
  <canvas id="game" width="800" height="400"></canvas>
  
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const ui = document.getElementById('ui');
    
    let gameState = 'title';
    let player = {x: 100, y: 300, width: 40, height: 40, vy: 0, onGround: false};
    let obstacles = [];
    let score = 0;
    let speed = 3;
    let gameLoopId = null;
    
    function startGame() {
      gameState = 'playing';
      ui.style.display = 'none';
      player = {x: 100, y: 300, width: 40, height: 40, vy: 0, onGround: false};
      obstacles = [];
      score = 0;
      speed = 3;
      gameLoop();
    }
    
    function jump() {
      if (player.onGround) {
        player.vy = -12;
        player.onGround = false;
      }
    }
    
    function gameLoop() {
      if (gameState !== 'playing') return;
      
      if (Math.random() < 0.02) {
        obstacles.push({x: canvas.width, y: 320, width: 30, height: 80});
      }
      
      player.vy += 0.8;
      player.y += player.vy;
      
      if (player.y >= 300) {
        player.y = 300;
        player.vy = 0;
        player.onGround = true;
      }
      
      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed;
        if (obstacles[i].x + obstacles[i].width < 0) {
          obstacles.splice(i, 1);
          score += 1;
          speed += 0.1;
        } else if (player.x < obstacles[i].x + obstacles[i].width &&
                   player.x + player.width > obstacles[i].x &&
                   player.y < obstacles[i].y + obstacles[i].height &&
                   player.y + player.height > obstacles[i].y) {
          gameOver();
          return;
        }
      }
      
      draw();
      gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    function draw() {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#90EE90';
      ctx.fillRect(0, 350, canvas.width, 50);
      
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      
      ctx.fillStyle = '#8B4513';
      obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));
      
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText('分数: ' + score, 10, 30);
    }
    
    function gameOver() {
      gameState = 'gameover';
      if (gameLoopId) cancelAnimationFrame(gameLoopId);
      ui.innerHTML = '<h1>游戏结束</h1><p>得分: ' + score + '</p><button onclick="startGame()">再玩一次</button>';
      ui.style.display = 'block';
    }
    
    document.addEventListener('keydown', e => { if (e.key === ' ') jump(); });
    canvas.addEventListener('click', jump);
  </script>
</body>
</html>
\`\`\`

NOW, following the EXACT structure above, create a game based on the user's request. Pay special attention to:
- Complete, working game state management
- Functional button click handlers
- Proper game loop implementation
- Clear visual feedback

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

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY the complete HTML code
- MUST start with <!DOCTYPE html> and end with </html>
- MUST include all CSS in <style> tags
- MUST include all JavaScript in <script> tags
- DO NOT include any markdown code blocks (no triple backticks)
- DO NOT include any explanations or comments outside the HTML
- The game MUST be playable - test your logic mentally before outputting!

IMPORTANT: Output the HTML code directly, without any markdown formatting or code blocks. Just the raw HTML starting with <!DOCTYPE html> and ending with </html>.`;


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
