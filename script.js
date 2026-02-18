const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const statusText = document.getElementById('status-text');
const statusImage = document.getElementById('status-image');

let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
let isFocusMode = true;

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    timerElement.textContent = `${minutesStr}:${secondsStr}`;
}

function switchMode() {
    isFocusMode = !isFocusMode;
    if (isFocusMode) {
        timeLeft = FOCUS_TIME;
        statusText.textContent = 'Hora de Focar!';
        statusImage.src = 'focus.png';
        document.body.style.backgroundColor = '#FFE4E1';
    } else {
        timeLeft = BREAK_TIME;
        statusText.textContent = 'Hora de Descansar!';
        statusImage.src = 'break.png';
        document.body.style.backgroundColor = '#E6E6FA'; // Lavender for break
    }
    updateTimerDisplay();
    startTimer(); // Auto-start next phase
}

function startTimer() {
    if (timerId !== null) return; // Already running

    timerId = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerId = null;
            switchMode();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
}

function resetTimer() {
    pauseTimer();
    isFocusMode = true;
    timeLeft = FOCUS_TIME;
    statusText.textContent = 'Hora de Focar!';
    statusImage.src = 'focus.png';
    document.body.style.backgroundColor = '#FFE4E1';
    updateTimerDisplay();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize display
updateTimerDisplay();
