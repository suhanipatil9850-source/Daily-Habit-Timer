const habitName = document.getElementById("habitName");
const addHabitBtn = document.getElementById("addHabitBtn");
const addMessage = document.getElementById("addMessage");
const habitSelect = document.getElementById("habitSelect");
const minutesInput = document.getElementById("minutesInput");
const startBtn = document.getElementById("startBtn");
const timerDisplay = document.getElementById("timerDisplay");
const timerMessage = document.getElementById("timerMessage");
const progressList = document.getElementById("progressList");

const STORAGE_KEY = "dailyHabitTimerData";
let habits = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
let timerId = null;
let remainingSeconds = 0;
let activeHabit = "";
let activeMinutes = 0;

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function renderHabits() {
  habitSelect.innerHTML = "";
  const names = Object.keys(habits);

  if (names.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No habits yet";
    option.value = "";
    habitSelect.appendChild(option);
    startBtn.disabled = true;
    return;
  }

  startBtn.disabled = false;

  for (const name of names) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    habitSelect.appendChild(option);
  }
}

function renderProgress() {
  progressList.innerHTML = "";

  for (const [habit, timeSpent] of Object.entries(habits)) {
    const item = document.createElement("li");
    item.textContent = `${habit}: ${timeSpent} minutes`;
    progressList.appendChild(item);
  }
}

function setMessage(el, text, type = "") {
  el.textContent = text;
  el.classList.remove("success", "error");
  if (type) {
    el.classList.add(type);
  }
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function tick() {
  timerDisplay.textContent = formatTime(remainingSeconds);

  if (remainingSeconds <= 0) {
    clearInterval(timerId);
    timerId = null;

    habits[activeHabit] += activeMinutes;
    saveHabits();
    renderProgress();
    setMessage(timerMessage, `Completed ${activeMinutes} min of ${activeHabit}!`, "success");
    startBtn.disabled = false;
    return;
  }

  remainingSeconds -= 1;
}

addHabitBtn.addEventListener("click", () => {
  const name = habitName.value.trim();

  if (!name) {
    setMessage(addMessage, "Enter a habit name.", "error");
    return;
  }

  if (habits[name] !== undefined) {
    setMessage(addMessage, "Habit already exists.", "error");
    return;
  }

  habits[name] = 0;
  saveHabits();
  renderHabits();
  renderProgress();
  habitName.value = "";
  setMessage(addMessage, "Habit added!", "success");
});

startBtn.addEventListener("click", () => {
  if (timerId) {
    return;
  }

  const selectedHabit = habitSelect.value;
  const minutes = Number(minutesInput.value);

  if (!selectedHabit) {
    setMessage(timerMessage, "Add a habit first.", "error");
    return;
  }

  if (!Number.isInteger(minutes) || minutes <= 0) {
    setMessage(timerMessage, "Enter valid minutes.", "error");
    return;
  }

  activeHabit = selectedHabit;
  activeMinutes = minutes;
  remainingSeconds = minutes * 60;
  setMessage(timerMessage, `Tracking '${activeHabit}'...`);
  startBtn.disabled = true;

  tick();
  timerId = setInterval(tick, 1000);
});

renderHabits();
renderProgress();
