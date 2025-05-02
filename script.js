const startScreen = document.getElementById("start-screen");
const nameInputScreen = document.getElementById("name-input-screen");
const gameScreen = document.getElementById("game-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const board = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const turnDisplay = document.getElementById("turn");
const scoreXDisplay = document.getElementById("scoreX");
const scoreODisplay = document.getElementById("scoreO");
const drawDisplay = document.getElementById("draws");
const restartBtn = document.getElementById("restartBtn");
const viewLeaderboardBtn = document.getElementById("viewLeaderboardBtn");
const backToGameBtn = document.getElementById("backToGameBtn");
const leaderboardTable = document.getElementById("leaderboard-table-body");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");
let gameBoard = Array(9).fill(null);
let currentPlayer = "X";
let gameMode = "pvp";
let playerXName = "";
let playerOName = "";
let scoreX = parseInt(localStorage.getItem("scoreX")) || 0;
let scoreO = parseInt(localStorage.getItem("scoreO")) || 0;
let draws = parseInt(localStorage.getItem("draws")) || 0;
const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];
function startGame(mode) {
  gameMode = mode;
  startScreen.classList.add("hidden");
  nameInputScreen.classList.remove("hidden");
}
function submitNames() {
  playerXName = document.getElementById("playerX").value || "Player X";
  playerOName = gameMode === "pvc" ? "Computer" : (document.getElementById("playerO").value || "Player O");
  nameInputScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  updateScores();
  updateTurnDisplay();
  resetGame();
}
restartBtn.addEventListener("click", resetGame);
viewLeaderboardBtn.addEventListener("click", showLeaderboard);
backToGameBtn.addEventListener("click", () => {
  leaderboardScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
});
function makeMove(index, player) {
  gameBoard[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());
  clickSound.play();
}
function checkWin(player) {
  return winPatterns.some(pattern =>
    pattern.every(index => gameBoard[index] === player)
  );
}
function handleWin(player) {
  winPatterns.forEach(pattern => {
    if (pattern.every(index => gameBoard[index] === player)) {
      pattern.forEach(index => cells[index].classList.add("win"));
    }
  });
  if (player === "X") scoreX++;
  else scoreO++;
  updateScores();
  saveScores();
  winSound.play();
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 }
  });
  launchEmojis(["🎉", "🔥", "👏", "🥳", "💯"]);
  setTimeout(() => {
    alert(`${player === "X" ? playerXName : playerOName} wins!`);
    resetGame();
  }, 800);
}
function launchEmojis(emojiList) {
  for (let i = 0; i < 20; i++) {
    const emoji = document.createElement("div");
    emoji.className = "emoji";
    emoji.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];
    emoji.style.left = `${Math.random() * 100}%`;
    emoji.style.bottom = "0";
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 2000);
  }
}
function handleDraw() {
  draws++;
  updateScores();
  saveScores();
  drawSound.play();
  setTimeout(() => {
    alert("It's a draw!");
    resetGame();
  }, 400);
}
function updateScores() {
  scoreXDisplay.textContent = `${playerXName}: ${scoreX}`;
  scoreODisplay.textContent = `${playerOName}: ${scoreO}`;
  drawDisplay.textContent = draws;
}
function updateTurnDisplay() {
  turnDisplay.textContent = `${currentPlayer === "X" ? playerXName : playerOName}'s Turn`;
}
function resetGame() {
  gameBoard = Array(9).fill(null);
  currentPlayer = "X";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.className = "cell";
  });
  updateTurnDisplay();
}
function saveScores() {
  localStorage.setItem("scoreX", scoreX);
  localStorage.setItem("scoreO", scoreO);
  localStorage.setItem("draws", draws);
  localStorage.setItem("playerXName", playerXName);
  localStorage.setItem("playerOName", playerOName);
}
function getBestMove() {
  let bestScore = -Infinity;
  let move;
  gameBoard.forEach((val, index) => {
    if (val === null) {
      gameBoard[index] = "O";
      let score = minimax(gameBoard, 0, false);
      gameBoard[index] = null;
      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });
  return move;
}
function minimax(board, depth, isMaximizing) {
  if (checkWin("O")) return 10 - depth;
  if (checkWin("X")) return depth - 10;
  if (board.every(cell => cell !== null)) return 0;
  if (isMaximizing) {
    let best = -Infinity;
    board.forEach((val, index) => {
      if (val === null) {
        board[index] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[index] = null;
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((val, index) => {
      if (val === null) {
        board[index] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[index] = null;
      }
    });
    return best;
  }
}
cells.forEach(cell => {
  cell.addEventListener("click", () => {
    const index = parseInt(cell.getAttribute("data-index"));
    if (gameBoard[index] || checkWin("X") || checkWin("O")) return;
    makeMove(index, currentPlayer);
    if (checkWin(currentPlayer)) {
      handleWin(currentPlayer);
    } else if (gameBoard.every(cell => cell !== null)) {
      handleDraw();
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      updateTurnDisplay();
      if (gameMode === "pvc" && currentPlayer === "O") {
        setTimeout(() => {
          const bestMove = getBestMove();
          makeMove(bestMove, "O");
          if (checkWin("O")) {
            handleWin("O");
          } else if (gameBoard.every(cell => cell !== null)) {
            handleDraw();
          } else {
            currentPlayer = "X";
            updateTurnDisplay();
          }
        }, 300);
      }
    }
  });
});
function showLeaderboard() {
  leaderboardScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  leaderboardTable.innerHTML = `
    <tr>
      <td>${playerXName}</td>
      <td>${scoreX}</td>
    </tr>
    <tr>
      <td>${playerOName}</td>
      <td>${scoreO}</td>
    </tr>
    <tr>
      <td>Draws</td>
      <td>${draws}</td>
    </tr>
  `;
}
function clearLeaderboard() {
  localStorage.removeItem("scores");
  localStorage.removeItem("playerXName");
  localStorage.removeItem("playerOName");
  scoreX = 0;
  scoreO = 0;
  draws = 0;
  playerXName = "X";
  playerOName = "O";
  updateScores();
  updateLeaderboardTable();
  alert("Leaderboard has been cleared.");
}

