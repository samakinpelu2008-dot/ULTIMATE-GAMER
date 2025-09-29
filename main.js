// -------------------- Game Hub --------------------
function showGame(game) {
  document.querySelectorAll('.game-container').forEach(c => c.style.display = 'none');
  document.getElementById(game).style.display = 'block';
}

// -------------------- TIC-TAC-TOE --------------------
function initTicTacToe() {
  const tttContainer = document.getElementById('tictactoe');
  tttContainer.innerHTML = `
    <div class="ttt-board">
      ${Array(9).fill(0).map((_, i) => `<div class="cell" data-index="${i}"></div>`).join('')}
    </div>
    <button id="ttt-reset">Restart</button>
  `;
  const tttBoard = Array(9).fill(null);
  let tttTurn = 'X';

  function checkWinner(board) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (const [a,b,c] of lines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    return board.includes(null) ? null : 'Draw';
  }

  function renderTTT() {
    document.querySelectorAll('.ttt-board .cell').forEach((cell, i) => cell.textContent = tttBoard[i] || '');
  }

  document.querySelectorAll('.ttt-board .cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const i = cell.dataset.index;
      if (!tttBoard[i]) {
        tttBoard[i] = tttTurn;
        cell.classList.add('animate');
        const winner = checkWinner(tttBoard);
        if (winner) {
          setTimeout(() => alert(winner === 'Draw' ? 'It\'s a draw!' : winner + ' wins!'), 100);
          tttBoard.fill(null);
        } else tttTurn = tttTurn === 'X' ? 'O' : 'X';
        renderTTT();
      }
    });
  });

  document.getElementById('ttt-reset').addEventListener('click', () => {
    tttBoard.fill(null);
    tttTurn = 'X';
    renderTTT();
  });

  renderTTT();
}

// -------------------- SNAKE --------------------
function initSnake() {
  const snakeContainer = document.getElementById('snake');
  snakeContainer.innerHTML = `
    <canvas id="snake-canvas" width="400" height="400"></canvas>
    <div id="snake-score">Score: 0</div>
    <button id="snake-reset">Restart</button>
  `;
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const box = 20;
  let snake = [{x: 9*box, y: 10*box}];
  let direction = 'RIGHT';
  let food = {x: Math.floor(Math.random()*20)*box, y: Math.floor(Math.random()*20)*box};
  let score = 0;

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  });

  function drawSnake() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for (let i=0; i<snake.length; i++) {
      const grad = ctx.createLinearGradient(snake[i].x,snake[i].y,snake[i].x+box,snake[i].y+box);
      grad.addColorStop(0,'#32CD32'); grad.addColorStop(1,'#7CFC00');
      ctx.fillStyle = i === 0 ? '#ADFF2F' : grad;
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
      ctx.strokeStyle = 'darkgreen';
      ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box, box);

    let head = {x: snake[0].x, y: snake[0].y};
    if(direction==='UP') head.y-=box;
    if(direction==='DOWN') head.y+=box;
    if(direction==='LEFT') head.x-=box;
    if(direction==='RIGHT') head.x+=box;

    if(head.x<0||head.x>=canvas.width||head.y<0||head.y>=canvas.height||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      alert('Game Over! Score: '+score);
      snake=[{x:9*box,y:10*box}];
      direction='RIGHT';
      score=0;
      food={x: Math.floor(Math.random()*20)*box, y: Math.floor(Math.random()*20)*box};
    } else {
      snake.unshift(head);
      if(head.x===food.x && head.y===food.y){
        score++;
        food={x: Math.floor(Math.random()*20)*box, y: Math.floor(Math.random()*20)*box};
      } else snake.pop();
    }

    document.getElementById('snake-score').innerText = 'Score: '+score;
  }

  let snakeGame = setInterval(drawSnake,120);
  document.getElementById('snake-reset').addEventListener('click', ()=>{
    snake=[{x:9*box,y:10*box}];
    direction='RIGHT';
    score=0;
    food={x: Math.floor(Math.random()*20)*box, y: Math.floor(Math.random()*20)*box};
  });
}

// -------------------- SNAKES & LADDERS --------------------
function initSnakesAndLadders() {
  const slContainer = document.getElementById('snakesladders');
  slContainer.innerHTML = `
    <canvas id="sl-canvas" width="400" height="400"></canvas>
    <button id="sl-roll">Roll Dice</button>
    <div id="sl-info">Player 1 turn</div>
  `;
  const slCanvas = document.getElementById('sl-canvas');
  const ctx = slCanvas.getContext('2d');

  const rows=8, cols=8, size=50;
  const snakes={62:19,41:20,77:49,87:57}, ladders={3:22,5:8,11:26,20:29};
  let players=[{pos:0,color:'red'},{pos:0,color:'yellow'}];
  let turn=0;

  function getXY(pos){
    if(pos<=0) return {x:0,y:0};
    const r=rows-1-Math.floor((pos-1)/cols);
    const c=((rows-1-r)%2===0)?(pos-1)%cols:cols-1-(pos-1)%cols;
    return {x:c*size+size/2,y:r*size+size/2};
  }

  function drawBoard(){
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        ctx.fillStyle=((r+c)%2===0)?'#ffe4b5':'#8b4513';
        ctx.fillRect(c*size,r*size,size,size);
        const num=(rows-r-1)*cols + ((r%2===0)?c+1:cols-c);
        ctx.fillStyle='black';
        ctx.font='12px Arial';
        ctx.fillText(num,c*size+5,r*size+15);
      }
    }
    for(const s in snakes){
      const f=getXY(s), t=getXY(snakes[s]);
      ctx.strokeStyle='green'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.lineTo(t.x,t.y); ctx.stroke();
    }
    for(const l in ladders){
      const f=getXY(l), t=getXY(ladders[l]);
      ctx.strokeStyle='blue'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.lineTo(t.x,t.y); ctx.stroke();
    }
  }

  function drawPlayers(){
    players.forEach(p=>{
      if(p.pos>0){
        const xy=getXY(p.pos);
        ctx.beginPath(); ctx.arc(xy.x,xy.y,10,0,2*Math.PI); ctx.fillStyle=p.color; ctx.fill();
      }
    });
  }

  function render(){
    ctx.clearRect(0,0,slCanvas.width,slCanvas.height);
    drawBoard();
    drawPlayers();
  }

  document.getElementById('sl-roll').addEventListener('click', ()=>{
    const dice=Math.floor(Math.random()*6)+1;
    let p=players[turn];
    p.pos+=dice;
    if(snakes[p.pos]) p.pos=snakes[p.pos];
    if(ladders[p.pos]) p.pos=ladders[p.pos];
    if(p.pos>=64){
      alert(`Player ${turn+1} wins!`);
      players=[{pos:0,color:'red'},{pos:0,color:'yellow'}];
      turn=0;
    } else turn=(turn+1)%2;
    document.getElementById('sl-info').innerText=`Player ${turn+1} turn`;
    render();
  });

  render();
}

// -------------------- CONNECT 4 --------------------
function initConnect4() {
  const c4Container = document.getElementById('connect4');
  c4Container.innerHTML = `<div id="c4-board" class="c4-board"></div>
                           <div id="c4-info">Player Red turn</div>
                           <button id="c4-reset">Restart</button>`;

  const boardDiv = document.getElementById('c4-board');
  const rows=6, cols=7;
  let board = Array.from({length: rows}, ()=>Array(cols).fill(null));
  let turn = 'red';

  function renderBoard(){
    boardDiv.innerHTML = '';
    for(let r=0;r<rows;r++){
      const rowDiv=document.createElement('div'); rowDiv.className='c4-row';
      for(let c=0;c<cols;c++){
        const cellDiv=document.createElement('div'); cellDiv.className='c4-cell';
        if(board[r][c]) cellDiv.style.backgroundColor=board[r][c];
        cellDiv.addEventListener('click',()=>dropDisc(c));
        rowDiv.appendChild(cellDiv);
      }
      boardDiv.appendChild(rowDiv);
    }
    document.getElementById('c4-info').innerText=`Player ${turn.charAt(0).toUpperCase()+turn.slice(1)} turn`;
  }

  function dropDisc(col){
    for(let r=rows-1;r>=0;r--){
      if(!board[r][col]){
        board[r][col]=turn;
        if(checkWin(turn)){
          alert(`Player ${turn.charAt(0).toUpperCase()+turn.slice(1)} wins!`);
          board=Array.from({length: rows}, ()=>Array(cols).fill(null));
        }
        turn=turn==='red'?'yellow':'red';
        renderBoard();
        return;
      }
    }
  }

  function checkWin(p){
    // horizontal
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols-3;c++){
        if(board[r][c]===p && board[r][c+1]===p && board[r][c+2]===p && board[r][c+3]===p) return true;
      }
    }
    // vertical
    for(let c=0;c<cols;c++){
      for(let r=0;r<rows-3;r++){
        if(board[r][c]===p && board[r+1][c]===p && board[r+2][c]===p && board[r+3][c]===p) return true;
      }
    }
    // diagonal \
    for(let r=0;r<rows-3;r++){
      for(let c=0;c<cols-3;c++){
        if(board[r][c]===p && board[r+1][c+1]===p && board[r+2][c+2]===p && board[r+3][c+3]===p) return true;
      }
    }
    // diagonal /
    for(let r=3;r<rows;r++){
      for(let c=0;c<cols-3;c++){
        if(board[r][c]===p && board[r-1][c+1]===p && board[r-2][c+2]===p && board[r-3][c+3]===p
