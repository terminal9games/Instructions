// Public Countdown Script for index.html
function startPublicCountdown(durationSeconds) {
    let timer = durationSeconds;
    const display = document.getElementById('countdown');
    const overlay = document.getElementById('expired-overlay');

    const interval = setInterval(() => {
        let hours = Math.floor(timer / 3600);
        let minutes = Math.floor((timer % 3600) / 60);
        let seconds = timer % 60;

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = `${hours}:${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(interval);
            display.textContent = "00:00:00";
            if (overlay) overlay.style.display = "flex";
        }
    }, 1000);
}

// Global variables for Day 1 Game
let gameInterval;
let currentTimeLeft = 60.00;
let gameActive = false;

// Authorize Player ID in play.html
function authorizePlayer() {
    const inputId = document.getElementById('player-id-input').value.trim();
    
    // Basic validation check for format (e.g., must start with T9)
    if (!inputId.startsWith("T9-") || inputId.length < 9) {
        alert("Invalid Player ID format. Access denied.");
        return;
    }

    // Switch screens from Login to Game
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');

    startDayOneGame();
}

// Day 1 Game Mechanics: Click at exactly 07.00s
function startDayOneGame() {
    gameActive = true;
    currentTimeLeft = 60.00;
    const display = document.getElementById('game-timer');

    gameInterval = setInterval(() => {
        currentTimeLeft -= 0.05;
        if (currentTimeLeft <= 0) {
            currentTimeLeft = 0.00;
            clearInterval(gameInterval);
            if (gameActive) triggerFailState(); // Ran out of time
        }
        display.textContent = currentTimeLeft.toFixed(2) + "s";
    }, 50);
}

function executeTrial() {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(gameInterval);

    // Winning condition: must click between 07.00s and 07.99s remaining
    if (currentTimeLeft >= 7.00 && currentTimeLeft <= 7.99) {
        document.getElementById('pass-overlay').style.display = "flex";
        // TODO: Backend hook to update database current_day = 2
    } else {
        triggerFailState();
    }
}

function triggerFailState() {
    gameActive = false;
    clearInterval(gameInterval);
    document.getElementById('fail-overlay').style.display = "flex";
    // TODO: Backend hook to flip status = 'eliminated'
}
