// Original template games - all created from scratch to avoid copyright issues
export const templateGames = [
  {
    id: "color-match",
    title: "Color Match",
    description: "Click the color that matches the word, not the text color!",
    category: "puzzle",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Color Match</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .game {
      background: white;
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 100%;
    }
    h1 { color: #333; margin-bottom: 10px; font-size: 24px; }
    .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
    .score { font-size: 18px; color: #764ba2; margin-bottom: 20px; }
    .word {
      font-size: 48px;
      font-weight: bold;
      margin: 30px 0;
      text-transform: uppercase;
      transition: transform 0.2s;
    }
    .options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 30px;
    }
    .option {
      padding: 16px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      color: white;
      transition: all 0.2s;
    }
    .option:hover { transform: scale(1.05); }
    .option:active { transform: scale(0.95); }
    .feedback {
      margin-top: 20px;
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .feedback.show { opacity: 1; }
    .feedback.correct { background: #d4edda; color: #155724; }
    .feedback.wrong { background: #f8d7da; color: #721c24; }
    .timer { font-size: 24px; color: #333; margin-bottom: 10px; }
    .game-over { display: none; }
    .game-over.show { display: block; }
    .play-area { display: block; }
    .play-area.hide { display: none; }
    .restart {
      margin-top: 20px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="game">
    <h1>🎨 Color Match</h1>
    <p class="subtitle">Click the color that matches the WORD, not the text color!</p>
    
    <div class="play-area" id="playArea">
      <div class="timer">⏱️ <span id="timer">30</span>s</div>
      <div class="score">Score: <span id="score">0</span></div>
      <div class="word" id="word">RED</div>
      <div class="options" id="options"></div>
      <div class="feedback" id="feedback"></div>
    </div>
    
    <div class="game-over" id="gameOver">
      <h2>🎉 Game Over!</h2>
      <p style="margin: 20px 0; font-size: 18px;">Final Score: <span id="finalScore">0</span></p>
      <button class="restart" onclick="startGame()">Play Again</button>
    </div>
  </div>

  <script>
    const colors = [
      { name: 'RED', hex: '#ef4444' },
      { name: 'BLUE', hex: '#3b82f6' },
      { name: 'GREEN', hex: '#22c55e' },
      { name: 'YELLOW', hex: '#eab308' },
      { name: 'PURPLE', hex: '#a855f7' },
      { name: 'ORANGE', hex: '#f97316' }
    ];
    
    let score = 0;
    let timeLeft = 30;
    let timer;
    let currentColor;
    
    function shuffle(arr) {
      return [...arr].sort(() => Math.random() - 0.5);
    }
    
    function nextRound() {
      const shuffled = shuffle(colors);
      currentColor = shuffled[0];
      const displayColor = shuffled[1];
      
      document.getElementById('word').textContent = currentColor.name;
      document.getElementById('word').style.color = displayColor.hex;
      
      const options = shuffle(colors).slice(0, 4);
      if (!options.find(c => c.name === currentColor.name)) {
        options[0] = currentColor;
      }
      
      const optionsHtml = shuffle(options).map(c => 
        \`<button class="option" style="background:\${c.hex}" onclick="checkAnswer('\${c.name}')">\${c.name}</button>\`
      ).join('');
      
      document.getElementById('options').innerHTML = optionsHtml;
    }
    
    function checkAnswer(answer) {
      const feedback = document.getElementById('feedback');
      if (answer === currentColor.name) {
        score += 10;
        feedback.textContent = '✓ Correct! +10';
        feedback.className = 'feedback show correct';
      } else {
        score = Math.max(0, score - 5);
        feedback.textContent = '✗ Wrong! -5';
        feedback.className = 'feedback show wrong';
      }
      document.getElementById('score').textContent = score;
      setTimeout(() => {
        feedback.className = 'feedback';
        nextRound();
      }, 500);
    }
    
    function startGame() {
      score = 0;
      timeLeft = 30;
      document.getElementById('score').textContent = score;
      document.getElementById('timer').textContent = timeLeft;
      document.getElementById('playArea').classList.remove('hide');
      document.getElementById('gameOver').classList.remove('show');
      
      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timer);
          endGame();
        }
      }, 1000);
      
      nextRound();
    }
    
    function endGame() {
      document.getElementById('playArea').classList.add('hide');
      document.getElementById('gameOver').classList.add('show');
      document.getElementById('finalScore').textContent = score;
    }
    
    startGame();
  </script>
</body>
</html>`,
  },
  {
    id: "memory-cards",
    title: "Memory Cards",
    description: "Find all matching pairs before time runs out!",
    category: "puzzle",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memory Cards</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .game {
      background: white;
      border-radius: 24px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    h1 { color: #333; margin-bottom: 20px; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 20px;
    }
    .stat { font-size: 18px; color: #666; }
    .stat span { font-weight: bold; color: #f5576c; }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 70px);
      gap: 10px;
      justify-content: center;
    }
    .card {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      transition: all 0.3s;
      transform-style: preserve-3d;
    }
    .card:hover { transform: scale(1.05); }
    .card.flipped, .card.matched {
      background: white;
      border: 3px solid #f5576c;
    }
    .card:not(.flipped):not(.matched) span { display: none; }
    .card.matched { opacity: 0.6; cursor: default; }
    .message {
      margin-top: 20px;
      padding: 15px;
      border-radius: 12px;
      background: #d4edda;
      color: #155724;
      display: none;
    }
    .message.show { display: block; }
    .restart {
      margin-top: 20px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="game">
    <h1>🃏 Memory Cards</h1>
    <div class="stats">
      <div class="stat">Moves: <span id="moves">0</span></div>
      <div class="stat">Pairs: <span id="pairs">0</span>/8</div>
    </div>
    <div class="grid" id="grid"></div>
    <div class="message" id="message">🎉 You Win! Great memory!</div>
    <button class="restart" onclick="startGame()">New Game</button>
  </div>

  <script>
    const emojis = ['🎮', '🎨', '🎵', '🎬', '🎪', '🎭', '🎯', '🎲'];
    let cards = [];
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let canFlip = true;
    
    function shuffle(arr) {
      return [...arr].sort(() => Math.random() - 0.5);
    }
    
    function createCard(emoji, index) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = \`<span>\${emoji}</span>\`;
      card.onclick = () => flipCard(card, emoji, index);
      return card;
    }
    
    function flipCard(card, emoji, index) {
      if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      
      card.classList.add('flipped');
      flipped.push({ card, emoji, index });
      
      if (flipped.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        canFlip = false;
        
        if (flipped[0].emoji === flipped[1].emoji) {
          flipped.forEach(f => f.card.classList.add('matched'));
          matched++;
          document.getElementById('pairs').textContent = matched;
          flipped = [];
          canFlip = true;
          
          if (matched === 8) {
            document.getElementById('message').classList.add('show');
          }
        } else {
          setTimeout(() => {
            flipped.forEach(f => f.card.classList.remove('flipped'));
            flipped = [];
            canFlip = true;
          }, 800);
        }
      }
    }
    
    function startGame() {
      cards = shuffle([...emojis, ...emojis]);
      flipped = [];
      matched = 0;
      moves = 0;
      canFlip = true;
      
      document.getElementById('moves').textContent = 0;
      document.getElementById('pairs').textContent = 0;
      document.getElementById('message').classList.remove('show');
      
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      cards.forEach((emoji, i) => grid.appendChild(createCard(emoji, i)));
    }
    
    startGame();
  </script>
</body>
</html>`,
  },
  {
    id: "reaction-test",
    title: "Reaction Test",
    description: "Test your reflexes! Click when the screen turns green.",
    category: "action",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reaction Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
    }
    .game {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: background 0.1s;
    }
    .waiting { background: #3b82f6; }
    .ready { background: #ef4444; }
    .click-now { background: #22c55e; }
    .result { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    
    h1 { color: white; font-size: 32px; margin-bottom: 20px; }
    .instruction { color: rgba(255,255,255,0.9); font-size: 20px; }
    .time {
      font-size: 72px;
      font-weight: bold;
      color: white;
      margin: 30px 0;
    }
    .time small { font-size: 32px; }
    .history {
      background: rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 16px;
      margin-top: 30px;
    }
    .history h3 { color: white; margin-bottom: 10px; }
    .attempts {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .attempt {
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
    }
    .best { background: #22c55e; }
  </style>
</head>
<body>
  <div class="game waiting" id="game" onclick="handleClick()">
    <h1>⚡ Reaction Test</h1>
    <p class="instruction" id="instruction">Click anywhere to start</p>
    <div class="time" id="time"></div>
    <div class="history" id="history" style="display: none;">
      <h3>Your attempts</h3>
      <div class="attempts" id="attempts"></div>
    </div>
  </div>

  <script>
    let state = 'waiting';
    let startTime;
    let timeout;
    let attempts = [];
    
    function handleClick() {
      const game = document.getElementById('game');
      const instruction = document.getElementById('instruction');
      const timeDisplay = document.getElementById('time');
      
      if (state === 'waiting') {
        state = 'ready';
        game.className = 'game ready';
        instruction.textContent = 'Wait for green...';
        timeDisplay.textContent = '';
        
        const delay = Math.random() * 3000 + 2000;
        timeout = setTimeout(() => {
          state = 'click-now';
          game.className = 'game click-now';
          instruction.textContent = 'CLICK NOW!';
          startTime = Date.now();
        }, delay);
      } else if (state === 'ready') {
        clearTimeout(timeout);
        state = 'waiting';
        game.className = 'game result';
        instruction.textContent = 'Too early! Click to try again';
        timeDisplay.innerHTML = '❌';
      } else if (state === 'click-now') {
        const reactionTime = Date.now() - startTime;
        state = 'waiting';
        game.className = 'game result';
        
        attempts.push(reactionTime);
        const best = Math.min(...attempts);
        const avg = Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
        
        instruction.textContent = 'Click to try again';
        timeDisplay.innerHTML = \`\${reactionTime}<small>ms</small>\`;
        
        const history = document.getElementById('history');
        const attemptsDiv = document.getElementById('attempts');
        history.style.display = 'block';
        
        attemptsDiv.innerHTML = attempts.map((t, i) => 
          \`<span class="attempt \${t === best ? 'best' : ''}">\${i + 1}. \${t}ms</span>\`
        ).join('');
      }
    }
  </script>
</body>
</html>`,
  },
  {
    id: "number-guess",
    title: "Number Guesser",
    description: "Guess the secret number between 1 and 100!",
    category: "puzzle",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Number Guesser</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .game {
      background: white;
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 100%;
    }
    h1 { color: #333; margin-bottom: 10px; }
    .subtitle { color: #666; margin-bottom: 30px; }
    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    input {
      flex: 1;
      padding: 15px;
      font-size: 24px;
      text-align: center;
      border: 3px solid #e0e0e0;
      border-radius: 12px;
      outline: none;
      transition: border-color 0.3s;
    }
    input:focus { border-color: #38ef7d; }
    button {
      padding: 15px 25px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
    .hint {
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .hint.higher { background: #fff3cd; color: #856404; }
    .hint.lower { background: #cce5ff; color: #004085; }
    .hint.correct { background: #d4edda; color: #155724; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
      color: #666;
    }
    .history {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 12px;
    }
    .history h4 { margin-bottom: 10px; color: #333; }
    .guesses {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .guess-item {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 14px;
    }
    .guess-item.high { background: #fff3cd; }
    .guess-item.low { background: #cce5ff; }
  </style>
</head>
<body>
  <div class="game">
    <h1>🔢 Number Guesser</h1>
    <p class="subtitle">I'm thinking of a number between 1 and 100</p>
    
    <div class="input-group">
      <input type="number" id="guess" min="1" max="100" placeholder="?">
      <button onclick="makeGuess()">Guess</button>
    </div>
    
    <div class="hint" id="hint" style="display: none;"></div>
    
    <div class="stats">
      <div>Attempts: <strong id="attempts">0</strong></div>
      <div>Best: <strong id="best">-</strong></div>
    </div>
    
    <div class="history" id="history" style="display: none;">
      <h4>Your guesses</h4>
      <div class="guesses" id="guesses"></div>
    </div>
    
    <button onclick="newGame()" style="margin-top: 20px; background: #6c757d;">New Game</button>
  </div>

  <script>
    let secret;
    let attempts;
    let guesses;
    let bestScore = localStorage.getItem('numberGuessBest') || null;
    
    function newGame() {
      secret = Math.floor(Math.random() * 100) + 1;
      attempts = 0;
      guesses = [];
      document.getElementById('guess').value = '';
      document.getElementById('hint').style.display = 'none';
      document.getElementById('history').style.display = 'none';
      document.getElementById('attempts').textContent = 0;
      document.getElementById('best').textContent = bestScore || '-';
      document.getElementById('guess').disabled = false;
    }
    
    function makeGuess() {
      const input = document.getElementById('guess');
      const guess = parseInt(input.value);
      
      if (isNaN(guess) || guess < 1 || guess > 100) {
        alert('Please enter a number between 1 and 100');
        return;
      }
      
      attempts++;
      guesses.push({ value: guess, hint: guess > secret ? 'high' : 'low' });
      
      document.getElementById('attempts').textContent = attempts;
      document.getElementById('history').style.display = 'block';
      document.getElementById('guesses').innerHTML = guesses.map(g => 
        \`<span class="guess-item \${g.hint}">\${g.value}</span>\`
      ).join('');
      
      const hint = document.getElementById('hint');
      hint.style.display = 'block';
      
      if (guess === secret) {
        hint.className = 'hint correct';
        hint.textContent = \`🎉 Correct! The number was \${secret}!\`;
        input.disabled = true;
        
        if (!bestScore || attempts < bestScore) {
          bestScore = attempts;
          localStorage.setItem('numberGuessBest', bestScore);
          document.getElementById('best').textContent = bestScore;
        }
      } else if (guess > secret) {
        hint.className = 'hint lower';
        hint.textContent = '📉 Too high! Try lower.';
      } else {
        hint.className = 'hint higher';
        hint.textContent = '📈 Too low! Try higher.';
      }
      
      input.value = '';
      input.focus();
    }
    
    document.getElementById('guess').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') makeGuess();
    });
    
    newGame();
  </script>
</body>
</html>`,
  },
  {
    id: "click-speed",
    title: "Click Speed Test",
    description: "How many times can you click in 10 seconds?",
    category: "action",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Click Speed Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .game {
      background: white;
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 100%;
    }
    h1 { color: #333; margin-bottom: 20px; }
    .timer {
      font-size: 48px;
      font-weight: bold;
      color: #fc466b;
      margin: 20px 0;
    }
    .clicks {
      font-size: 72px;
      font-weight: bold;
      background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 20px 0;
    }
    .click-btn {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
      color: white;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.1s;
      box-shadow: 0 10px 30px rgba(252, 70, 107, 0.3);
      margin: 20px 0;
    }
    .click-btn:hover { transform: scale(1.05); }
    .click-btn:active { transform: scale(0.95); }
    .click-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
    }
    .stat {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 12px;
    }
    .stat-value { font-size: 24px; font-weight: bold; color: #3f5efb; }
    .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
    .start-btn {
      margin-top: 20px;
      padding: 15px 30px;
      background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="game">
    <h1>👆 Click Speed Test</h1>
    <div class="timer" id="timer">10.0s</div>
    <div class="clicks" id="clicks">0</div>
    
    <button class="click-btn" id="clickBtn" disabled onclick="handleClick()">
      Click Me!
    </button>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value" id="cps">0.0</div>
        <div class="stat-label">Clicks/Second</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="best">0</div>
        <div class="stat-label">Best Score</div>
      </div>
    </div>
    
    <button class="start-btn" id="startBtn" onclick="startGame()">Start Game</button>
  </div>

  <script>
    let clicks = 0;
    let timeLeft = 10;
    let timer;
    let isPlaying = false;
    let best = parseInt(localStorage.getItem('clickSpeedBest')) || 0;
    
    document.getElementById('best').textContent = best;
    
    function startGame() {
      clicks = 0;
      timeLeft = 10;
      isPlaying = true;
      
      document.getElementById('clicks').textContent = 0;
      document.getElementById('timer').textContent = '10.0s';
      document.getElementById('cps').textContent = '0.0';
      document.getElementById('clickBtn').disabled = false;
      document.getElementById('startBtn').textContent = 'Playing...';
      document.getElementById('startBtn').disabled = true;
      
      timer = setInterval(() => {
        timeLeft -= 0.1;
        document.getElementById('timer').textContent = timeLeft.toFixed(1) + 's';
        document.getElementById('cps').textContent = (clicks / (10 - timeLeft)).toFixed(1);
        
        if (timeLeft <= 0) {
          endGame();
        }
      }, 100);
    }
    
    function handleClick() {
      if (!isPlaying) return;
      clicks++;
      document.getElementById('clicks').textContent = clicks;
    }
    
    function endGame() {
      clearInterval(timer);
      isPlaying = false;
      
      document.getElementById('clickBtn').disabled = true;
      document.getElementById('startBtn').textContent = 'Play Again';
      document.getElementById('startBtn').disabled = false;
      document.getElementById('cps').textContent = (clicks / 10).toFixed(1);
      
      if (clicks > best) {
        best = clicks;
        localStorage.setItem('clickSpeedBest', best);
        document.getElementById('best').textContent = best;
      }
    }
  </script>
</body>
</html>`,
  },
  {
    id: "typing-test",
    title: "Typing Speed",
    description: "Test your typing speed and accuracy!",
    category: "skill",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Typing Speed Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .game {
      background: white;
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      max-width: 600px;
      width: 100%;
    }
    h1 { color: #333; margin-bottom: 20px; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 30px;
    }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #4facfe; }
    .stat-label { font-size: 12px; color: #666; }
    .text-display {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 16px;
      font-size: 18px;
      line-height: 1.8;
      text-align: left;
      margin-bottom: 20px;
    }
    .char { transition: all 0.1s; }
    .char.correct { color: #22c55e; }
    .char.incorrect { color: #ef4444; background: #fee2e2; }
    .char.current { background: #4facfe; color: white; }
    input {
      width: 100%;
      padding: 15px;
      font-size: 18px;
      border: 3px solid #e0e0e0;
      border-radius: 12px;
      outline: none;
      transition: border-color 0.3s;
    }
    input:focus { border-color: #4facfe; }
    input:disabled { background: #f8f9fa; }
    .result {
      margin-top: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 16px;
      color: white;
      display: none;
    }
    .result.show { display: block; }
    .restart {
      margin-top: 20px;
      padding: 15px 30px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="game">
    <h1>⌨️ Typing Speed Test</h1>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value" id="wpm">0</div>
        <div class="stat-label">WPM</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="accuracy">100%</div>
        <div class="stat-label">Accuracy</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="time">60</div>
        <div class="stat-label">Seconds</div>
      </div>
    </div>
    
    <div class="text-display" id="textDisplay"></div>
    <input type="text" id="input" placeholder="Start typing here..." autocomplete="off" autofocus>
    
    <div class="result" id="result">
      <h2>🎉 Great job!</h2>
      <p style="margin-top: 10px;">Your typing speed: <strong id="finalWpm">0</strong> WPM</p>
    </div>
    
    <button class="restart" onclick="startGame()">New Test</button>
  </div>

  <script>
    const texts = [
      "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
      "Programming is the art of telling a computer what to do. Good code is its own best documentation.",
      "Success is not final, failure is not fatal. It is the courage to continue that counts.",
      "The only way to do great work is to love what you do. If you have not found it yet, keep looking.",
      "Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish."
    ];
    
    let currentText;
    let startTime;
    let timer;
    let charIndex = 0;
    let errors = 0;
    let isPlaying = false;
    
    function startGame() {
      currentText = texts[Math.floor(Math.random() * texts.length)];
      charIndex = 0;
      errors = 0;
      isPlaying = false;
      
      document.getElementById('input').value = '';
      document.getElementById('input').disabled = false;
      document.getElementById('input').focus();
      document.getElementById('result').classList.remove('show');
      document.getElementById('wpm').textContent = '0';
      document.getElementById('accuracy').textContent = '100%';
      document.getElementById('time').textContent = '60';
      
      renderText();
      clearInterval(timer);
    }
    
    function renderText() {
      const display = document.getElementById('textDisplay');
      display.innerHTML = currentText.split('').map((char, i) => {
        let className = 'char';
        if (i < charIndex) {
          className += document.getElementById('input').value[i] === char ? ' correct' : ' incorrect';
        } else if (i === charIndex) {
          className += ' current';
        }
        return \`<span class="\${className}">\${char}</span>\`;
      }).join('');
    }
    
    document.getElementById('input').addEventListener('input', (e) => {
      if (!isPlaying) {
        isPlaying = true;
        startTime = Date.now();
        timer = setInterval(updateStats, 100);
      }
      
      const typed = e.target.value;
      charIndex = typed.length;
      
      errors = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] !== currentText[i]) errors++;
      }
      
      renderText();
      
      if (typed.length >= currentText.length) {
        endGame();
      }
    });
    
    function updateStats() {
      const elapsed = (Date.now() - startTime) / 1000;
      const timeLeft = Math.max(0, 60 - elapsed);
      document.getElementById('time').textContent = Math.ceil(timeLeft);
      
      const wordsTyped = charIndex / 5;
      const wpm = Math.round((wordsTyped / elapsed) * 60);
      document.getElementById('wpm').textContent = wpm || 0;
      
      const accuracy = charIndex > 0 ? Math.round(((charIndex - errors) / charIndex) * 100) : 100;
      document.getElementById('accuracy').textContent = accuracy + '%';
      
      if (timeLeft <= 0) endGame();
    }
    
    function endGame() {
      clearInterval(timer);
      document.getElementById('input').disabled = true;
      
      const elapsed = (Date.now() - startTime) / 1000;
      const wordsTyped = charIndex / 5;
      const wpm = Math.round((wordsTyped / elapsed) * 60);
      
      document.getElementById('finalWpm').textContent = wpm;
      document.getElementById('result').classList.add('show');
    }
    
    startGame();
  </script>
</body>
</html>`,
  },
];

export const getTemplateById = (id: string) => {
  return templateGames.find(game => game.id === id);
};

export const getTemplatesByCategory = (category: string) => {
  return templateGames.filter(game => game.category === category);
};