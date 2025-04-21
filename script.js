let [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
let timer = null;

const display = document.getElementById("display");
const lapsContainer = document.getElementById("laps");
const lapCount = document.getElementById("lap-count");

document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", pauseTimer);
document.getElementById("reset").addEventListener("click", resetTimer);
document.getElementById("lap").addEventListener("click", recordLap);
document.getElementById("clear-laps").addEventListener("click", clearLaps);

function updateDisplay() {
  let h = hours < 10 ? "0" + hours : hours;
  let m = minutes < 10 ? "0" + minutes : minutes;
  let s = seconds < 10 ? "0" + seconds : seconds;
  let ms = milliseconds.toString().padStart(3, "0");
  display.innerText = `${h}:${m}:${s}.${ms}`;
}

function startTimer() {
  if (timer !== null) return;

  timer = setInterval(() => {
    milliseconds += 10;
    if (milliseconds >= 1000) {
      milliseconds = 0;
      seconds++;
      if (seconds == 60) {
        seconds = 0;
        minutes++;
        if (minutes == 60) {
          minutes = 0;
          hours++;
        }
      }
    }
    updateDisplay();
  }, 10);
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
}

function resetTimer() {
  pauseTimer();
  [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
  updateDisplay();
  clearLaps();
}

function recordLap() {
  if (timer === null) return;
  const lapTime = display.innerText;
  const lap = document.createElement("li");
  lap.innerText = `Lap ${lapsContainer.children.length + 1}: ${lapTime}`;
  lapsContainer.appendChild(lap);
  lapCount.innerText = lapsContainer.children.length;
}

function clearLaps() {
  lapsContainer.innerHTML = "";
  lapCount.innerText = 0;
}
