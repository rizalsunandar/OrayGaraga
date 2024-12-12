const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game Settings
let gridSize = 20;
let tileCountX, tileCountY;

// Responsiveness
function resizeCanvas() {
    canvas.width = Math.min(600, window.innerWidth * 0.9);
    canvas.height = canvas.width * 0.5625;
    gridSize = canvas.width / 20;
    tileCountX = Math.floor(canvas.width / gridSize);
    tileCountY = Math.floor(canvas.height / gridSize);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Variables
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0, dy = 0;
let score = 0, lives = 3;
let gameRunning = false;
let gameLoop;
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
let gameEnded = false;  // Flag untuk memastikan game hanya berakhir sekali

// Questions List
let questionIndex = 0;
const questions = [
    { question: "Temanmu sengaja tidak mengikutsertakan kamu dalam kelompoknya.", correct: ["Sedih"] },
    { question: "Melihat seorang siswa dibiarkan bekerja sendiri tanpa bantuan.", correct: ["Sedih"] },
    { question: "Seorang teman kamu dipanggil dengan nama julukan yang tidak menyenangkan.", correct: ["Marah"] },
    { question: "Guru memberikan tugas yang sangat berat tanpa memberi waktu yang cukup.", correct: ["Kesal"] },
    { question: "Ada yang sering mengejekmu karena cara berbicara kamu.", correct: ["Marah"] },
    { question: "Melihat temanmu yang sedang kesulitan di kelas dan tidak ada yang menolong.", correct: ["Sedih"] },
    { question: "Seseorang di kelas mengabaikanmu saat kamu mengajukan pertanyaan.", correct: ["Kesal"] },
    { question: "Temanmu sering berbicara di belakangmu tentang hal-hal negatif.", correct: ["Marah"] },
    { question: "Ada yang mengejek penampilanmu tanpa alasan yang jelas.", correct: ["Marah"] },
    { question: "Seseorang menertawakan kamu saat kamu tidak sengaja melakukan kesalahan kecil.", correct: ["Biasa Saja"] }
];

// Identity Modal
let playerName = "";
let playerClass = "";

function showIdentityModal() {
    document.getElementById("identity-modal").style.display = "block";
    document.getElementById("high-score-modal").style.display = "none"; // Menutup modal high score
}

function saveIdentity() {
    const nameInput = document.getElementById("player-name").value.trim();
    const classInput = document.getElementById("player-class").value.trim();

    if (!nameInput || !classInput) {
        alert("Harap isi semua kolom identitas!");
        return;
    }

    playerName = nameInput;
    playerClass = classInput;

    document.getElementById("identity-modal").style.display = "none";
    resetGame();
    startGame();
}

// Start Game
function startGame() {
    gameRunning = true;
    gameLoop = setInterval(updateGame, 400);
    document.getElementById("startButton").style.display = "none";
}

// Reset Game
function resetGame() {
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    lives = 3;
    questionIndex = 0;
    updateStats();
    document.getElementById("restartButton").style.display = "none";
    gameEnded = false;  // Reset flag gameEnded saat game di-reset
}

// Update Game
function updateGame() {
    clearCanvas();
    drawSnake();
    drawFood();
    moveSnake();

    if (checkCollision(food)) {
        askQuestion();
        placeFood();
    }

    if (checkSelfCollision()) {
        loseLife();
    }

    updateStats();
}

// Drawing Functions
function clearCanvas() {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = "green";
    snake.forEach((segment) => ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2));
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Movement
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    head.x = (head.x + tileCountX) % tileCountX;
    head.y = (head.y + tileCountY) % tileCountY;

    snake.unshift(head);
    snake.pop();
}

// Collision Check
function checkCollision(target) {
    return snake[0].x === target.x && snake[0].y === target.y;
}

function checkSelfCollision() {
    return snake.slice(1).some((segment) => segment.x === snake[0].x && segment.y === snake[0].y);
}

// Place Food
function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY),
    };
}

// Life Management
function loseLife() {
    lives--;
    if (lives <= 0 && !gameEnded) {  // Hanya panggil endGame sekali
        gameEnded = true;
        endGame("Game Over! Skor Akhir Anda: " + score);
    }
}

function endGame(message) {
    clearInterval(gameLoop); // Hentikan game loop
    dx = 0; // Set gerakan horizontal ke 0
    dy = 0; // Set gerakan vertikal ke 0
    alert(message);
    saveHighScore();
    showHighScoreModal();
}

// Quiz System
function askQuestion() {
    if (questionIndex >= questions.length) {
        if (!gameEnded) {  // Hanya panggil endGame sekali
            gameEnded = true;
            endGame("Semua soal selesai! Skor Akhir Anda: " + score);
        }
        return;
    }

    const question = questions[questionIndex++];
    document.getElementById("quiz-question").textContent = question.question;
    const optionsContainer = document.getElementById("quiz-options");
    optionsContainer.innerHTML = "";

    ["Senang", "Sedih", "Marah", "Kesal", "Biasa Saja"].forEach((option) => {
        const button = document.createElement("button");
        button.textContent = option;
        button.onclick = () => {
            if (question.correct.includes(option)) {
                alert("Jawaban Benar!");
                score += 10;
                snake.push({ ...snake[snake.length - 1] }); // Add segment
            } else {
                alert("Jawaban Salah!");
                loseLife();
            }
            closeQuizModal();
        };
        optionsContainer.appendChild(button);
    });

    stopSnakeMovement();
    openQuizModal();
}

function stopSnakeMovement() {
    clearInterval(gameLoop);
}

function resumeSnakeMovement() {
    gameLoop = setInterval(updateGame, 400);
}

function openQuizModal() {
    document.getElementById("quiz-modal").style.display = "block";
}

function closeQuizModal() {
    document.getElementById("quiz-modal").style.display = "none";
    resumeSnakeMovement();
}

// High Score Functions
function saveHighScore() {
    if (playerName && score > 0) {
        highScores.push({ name: playerName, score: score });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 5); // Keep top 5
        localStorage.setItem("highScores", JSON.stringify(highScores));
    }
}

function resetHighScores() {
    highScores = [];
    localStorage.removeItem("highScores");
    updateHighScoreModal();
}

function updateHighScoreModal() {
    const highScoreList = document.getElementById("high-score-list");
    highScoreList.innerHTML = "";

    if (highScores.length === 0) {
        highScoreList.innerHTML = "<p>Belum ada high score!</p>";
    } else {
        highScores.forEach(scoreEntry => {
            const scoreItem = document.createElement("p");
            scoreItem.textContent = `${scoreEntry.name}: ${scoreEntry.score}`;
            highScoreList.appendChild(scoreItem);
        });
    }
}

function newGameFromHighScore() {
    document.getElementById("high-score-modal").style.display = "none";
    showIdentityModal(); // Tampilkan modal identitas untuk game baru
}

function showHighScoreModal() {
    updateHighScoreModal();
    document.getElementById("high-score-modal").style.display = "block";
}

// Update Stats
function updateStats() {
    document.getElementById("lives").textContent = lives;
    document.getElementById("score").textContent = score;
}

// Control Direction
function changeDirection(direction) {
    if (direction === "up" && dy === 0) {
        dx = 0;
        dy = -1;
    } else if (direction === "down" && dy === 0) {
        dx = 0;
        dy = 1;
    } else if (direction === "left" && dx === 0) {
        dx = -1;
        dy = 0;
    } else if (direction === "right" && dx === 0) {
        dx = 1;
        dy = 0;
    }
}

// Event Listeners for High Score Buttons
document.getElementById("resetHighScoreButton").addEventListener("click", resetHighScores);
document.getElementById("newGameButton").addEventListener("click", newGameFromHighScore); // Tampilkan modal identitas
document.getElementById("startButton").addEventListener("click", showIdentityModal);
document.getElementById("restartButton").addEventListener("click", resetGame);