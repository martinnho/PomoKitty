const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const statusText = document.getElementById('status-text');
const statusImage = document.getElementById('status-image');
const applesCountDisplay = document.getElementById('apples-count');
const storeGrid = document.getElementById('store-grid');
const celebrationModal = document.getElementById('celebration-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
let isFocusMode = true;

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

// Configurable constants
const CHARACTER_PRICE = 30;
const INITIAL_CHARACTER = 'hello_kitty';

// State variables
let apples = 0;
let unlockedCharacters = [];
let activeCharacter = '';

// Default Characters Data
const characters = [
    { id: 'hello_kitty', name: 'Hello Kitty', img: 'assets/hello_kitty.png' },
    { id: 'my_melody', name: 'My Melody', img: 'assets/my_melody.png' },
    { id: 'kuromi', name: 'Kuromi', img: 'assets/kuromi.png' },
    { id: 'keroppi', name: 'Keroppi', img: 'assets/keroppi.png' },
    { id: 'pompompurin', name: 'Pompompurin', img: 'assets/pompompurin.png' },
    { id: 'cinnamoroll', name: 'Cinnamoroll', img: 'assets/cinnamoroll.png' },
    { id: 'badtz_maru', name: 'Badtz-Maru', img: 'assets/badtz_maru.png' },
    { id: 'gudetama', name: 'Gudetama', img: 'assets/gudetama.png' }
];

// --- State Management ---
function loadState() {
    const savedApples = localStorage.getItem('apples');
    const savedUnlocked = localStorage.getItem('unlockedCharacters');
    const savedActive = localStorage.getItem('activeCharacter');

    apples = savedApples ? parseInt(savedApples) : 0;
    unlockedCharacters = savedUnlocked ? JSON.parse(savedUnlocked) : [INITIAL_CHARACTER];
    activeCharacter = savedActive ? savedActive : INITIAL_CHARACTER;

    updateApplesDisplay();
    updateActiveCharacterUI();
}

function saveState() {
    localStorage.setItem('apples', apples.toString());
    localStorage.setItem('unlockedCharacters', JSON.stringify(unlockedCharacters));
    localStorage.setItem('activeCharacter', activeCharacter);
}

// --- UI Updates ---
function updateApplesDisplay() {
    applesCountDisplay.textContent = apples;
    // Add pop animation
    applesCountDisplay.parentElement.classList.remove('apple-pop');
    void applesCountDisplay.parentElement.offsetWidth; // trigger reflow
    applesCountDisplay.parentElement.classList.add('apple-pop');

    // Update store buttons if affordability changed
    renderStore();
}

function updateActiveCharacterUI() {
    const char = characters.find(c => c.id === activeCharacter);
    if (char && isFocusMode) {
        statusImage.src = char.img;
    }
}

// --- Store Logic ---
function renderStore() {
    storeGrid.innerHTML = '';

    characters.forEach(char => {
        const isUnlocked = unlockedCharacters.includes(char.id);
        const isActive = activeCharacter === char.id;
        const canAfford = apples >= CHARACTER_PRICE;

        const card = document.createElement('div');
        card.className = `character-card ${isActive ? 'active' : ''}`;

        let buttonHTML = '';
        if (isActive) {
            buttonHTML = `<button class="character-btn select-btn" disabled>Selecionado</button>`;
        } else if (isUnlocked) {
            buttonHTML = `<button class="character-btn select-btn" onclick="selectCharacter('${char.id}')">Selecionar</button>`;
        } else {
            buttonHTML = `<button class="character-btn buy-btn" onclick="buyCharacter('${char.id}')" ${!canAfford ? 'disabled' : ''}>Comprar (30 🍎)</button>`;
        }

        card.innerHTML = `
            <img src="${char.img}" alt="${char.name}" class="character-img">
            <div class="character-name">${char.name}</div>
            ${!isUnlocked ? `<div class="character-price">30 🍎</div>` : '<div class="character-price" style="color:transparent">0</div>'}
            ${buttonHTML}
        `;
        storeGrid.appendChild(card);
    });
}

window.buyCharacter = function (id) {
    if (apples >= CHARACTER_PRICE && !unlockedCharacters.includes(id)) {
        apples -= CHARACTER_PRICE;
        unlockedCharacters.push(id);
        saveState();
        updateApplesDisplay();
        renderStore();
    }
};

window.selectCharacter = function (id) {
    if (unlockedCharacters.includes(id)) {
        activeCharacter = id;
        saveState();
        updateActiveCharacterUI();
        renderStore();
    }
};

// --- Timer Logic ---
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
        updateActiveCharacterUI(); // Set to active kitty
        document.body.style.backgroundColor = '#FFE4E1';
    } else {
        timeLeft = BREAK_TIME;
        statusText.textContent = 'Hora de Descansar!';
        // Keep active char or show a generic sleep one? Sticking to active char sleeping logic if needed, or generic sleep
        statusImage.src = 'assets/hello_kitty.png'; // Fallback for break if no specific break images generated yet, using active for now.
        statusImage.style.opacity = '0.7'; // Dim for rest
        document.body.style.backgroundColor = '#E6E6FA'; // Lavender for break
    }
    updateTimerDisplay();
    startTimer(); // Auto-start next phase
}

function giveAppleReward(amount) {
    apples += amount;
    saveState();
    updateApplesDisplay();
}

function startTimer() {
    if (timerId !== null) return; // Already running

    timerId = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        // 5-minute continuous focus reward
        if (isFocusMode && timeLeft > 0 && timeLeft % 300 === 0 && timeLeft !== FOCUS_TIME) {
            giveAppleReward(1);
        }

        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerId = null;

            if (isFocusMode) {
                // End of focus cycle bonus
                giveAppleReward(3);
                celebrationModal.classList.remove('hidden');
            } else {
                statusImage.style.opacity = '1';
                switchMode();
            }
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
    statusImage.style.opacity = '1';
    updateActiveCharacterUI();
    document.body.style.backgroundColor = '#FFE4E1';
    updateTimerDisplay();
}

// --- Event Listeners ---
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

closeModalBtn.addEventListener('click', () => {
    celebrationModal.classList.add('hidden');
    switchMode(); // Move to break after closing modal
});

// Initialize
loadState();
updateTimerDisplay();
renderStore();
