const todoInput = document.querySelector('#todo-input');
const addBtn = document.querySelector('#add-btn');
const todoList = document.querySelector('#todo-list');
const streakEl = document.querySelector('#streak-count');
const focusBtn = document.querySelector('#focus-toggle');
const dateDisplay = document.querySelector('#date-display');
const shingSnd = document.querySelector('#snd-shing');

// Load Data
let tasks = JSON.parse(localStorage.getItem('protask-data')) || [];
let streak = parseInt(localStorage.getItem('protask-streak')) || 0;
let focusMode = false;

// --- DATE & STREAK RESET LOGIC ---
function initializeDate() {
    const now = new Date();
    
    // 1. Display Date
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateDisplay.innerText = now.toLocaleDateString('en-US', options);

    // 2. Check for daily streak reset
    const todayString = now.toDateString();
    const lastLogin = localStorage.getItem('protask-last-login');

    if (lastLogin && lastLogin !== todayString) {
        streak = 0;
        localStorage.setItem('protask-streak', 0);
    }
    
    localStorage.setItem('protask-last-login', todayString);
}

function updateUI() {
    todoList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        li.innerHTML = `
            <span>${task.text}</span>
            <button class="delete-btn" onclick="slashTask(event, ${index})">✕</button>
        `;
        todoList.appendChild(li);
    });

    streakEl.innerText = streak;
    
    if (focusMode) todoList.classList.add('focus-active');
    else todoList.classList.remove('focus-active');

    document.querySelector('#task-count').innerText = `${tasks.length} missions active`;

    localStorage.setItem('protask-data', JSON.stringify(tasks));
    localStorage.setItem('protask-streak', streak);
}

// --- SLICING DELETION ---
window.slashTask = (event, index) => {
    const li = event.target.parentElement;
    
    // 1. Audio & Vibrate
    shingSnd.currentTime = 0;
    shingSnd.play().catch(() => {});
    if ("vibrate" in navigator) navigator.vibrate(50);

    // 2. Spark Effect
    const rect = li.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
        particleCount: 40,
        spread: 60,
        startVelocity: 30,
        origin: { x: x, y: y },
        colors: ['#00d4ff', '#ffffff'],
        shapes: ['square'],
        ticks: 50,
        gravity: 2,
        scalar: 0.6
    });

    // 3. Trigger Slicing Animation
    li.classList.add('void-vanish');

    // 4. Update Logic
    streak++;
    streakEl.innerText = streak;

    setTimeout(() => {
        tasks.splice(index, 1);
        updateUI();
    }, 500); // 500ms matches the CSS animation duration
};

// Controls
focusBtn.onclick = () => {
    focusMode = !focusMode;
    focusBtn.classList.toggle('active');
    updateUI();
};

addBtn.onclick = () => {
    const text = todoInput.value.trim();
    if (text) {
        tasks.push({ text, id: Date.now() });
        todoInput.value = '';
        updateUI();
    }
};

todoInput.onkeypress = (e) => { if (e.key === 'Enter') addBtn.click(); };

document.querySelector('#clear-all').onclick = () => {
    tasks = [];
    streak = 0;
    updateUI();
};

initializeDate();
updateUI();