import init, { WasmSimulator, bets_len } from "./pkg/wof_simulator_rs.js";

const elements = {
  playerCash: document.getElementById("playerCash"),
  casinoCredit: document.getElementById("casinoCredit"),
  maxWager: document.getElementById("maxWager"),
  createSim: document.getElementById("createSim"),
  betTable: document.getElementById("betTable"),
  selectedBetLabel: document.getElementById("selectedBetLabel"),
  increaseWager: document.getElementById("increaseWager"),
  decreaseWager: document.getElementById("decreaseWager"),
  output: document.getElementById("output"),
};

let sim = null;
let selectedBetIndex = 0;
let betButtons = [];
let decreaseHoldTimer = null;
let decreaseHoldInterval = null;

function setOutput(text) {
  elements.output.textContent = text;
}

function setControlsEnabled(enabled) {
  elements.increaseWager.disabled = !enabled;
  elements.decreaseWager.disabled = !enabled;
}

function readInt(input) {
  const value = Number.parseInt(input.value, 10);
  if (Number.isNaN(value)) {
    return 0;
  }
  return value;
}

function renderOutput() {
  if (!sim) {
    setOutput("Create a simulator to begin.");
    return;
  }
  setOutput(sim.output());
  updateBetValuesFromOutput();
}

function initBetTable(betsLen) {
  elements.betTable.textContent = "";
  betButtons = [];
  for (let i = 0; i < betsLen; i += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bet-spot";
    button.dataset.index = String(i);
    button.innerHTML = `<span class="bet-label">Bet ${i}</span><span class="bet-value">0</span>`;
    button.addEventListener("click", () => {
      setSelectedBet(i);
    });
    elements.betTable.appendChild(button);
    betButtons.push(button);
  }
  setSelectedBet(0);
}

async function bootstrap() {
  await init();
  initBetTable(bets_len());
  setControlsEnabled(false);
  renderOutput();
}

elements.createSim.addEventListener("click", () => {
  const playerCash = readInt(elements.playerCash);
  const casinoCredit = readInt(elements.casinoCredit);
  const maxWager = readInt(elements.maxWager);

  sim = new WasmSimulator(playerCash, casinoCredit, maxWager);
  setControlsEnabled(true);
  renderOutput();
});

elements.increaseWager.addEventListener("click", () => {
  if (!sim) {
    return;
  }
  sim.increase_wager(selectedBetIndex);
  renderOutput();
});

function performDecrease() {
  if (!sim) {
    return;
  }
  sim.decrease_wager(selectedBetIndex);
  renderOutput();
}

function clearDecreaseHold() {
  if (decreaseHoldTimer) {
    window.clearTimeout(decreaseHoldTimer);
    decreaseHoldTimer = null;
  }
  if (decreaseHoldInterval) {
    window.clearInterval(decreaseHoldInterval);
    decreaseHoldInterval = null;
  }
}

function startDecreaseHold() {
  if (!sim) {
    return;
  }
  performDecrease();
  clearDecreaseHold();
  decreaseHoldTimer = window.setTimeout(() => {
    decreaseHoldInterval = window.setInterval(performDecrease, 140);
  }, 350);
}

elements.decreaseWager.addEventListener("click", () => {
  if (!sim) {
    return;
  }
  if (decreaseHoldInterval || decreaseHoldTimer) {
    return;
  }
  performDecrease();
});

elements.decreaseWager.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) {
    return;
  }
  startDecreaseHold();
});

elements.decreaseWager.addEventListener("pointerup", clearDecreaseHold);
elements.decreaseWager.addEventListener("pointerleave", clearDecreaseHold);
elements.decreaseWager.addEventListener("pointercancel", clearDecreaseHold);
elements.decreaseWager.addEventListener("blur", clearDecreaseHold);

bootstrap().catch((error) => {
  console.error(error);
  setOutput("Failed to load WASM. Build the package and reload.");
});

function setSelectedBet(index) {
  selectedBetIndex = index;
  elements.selectedBetLabel.textContent = `Selected: Bet ${index}`;
  betButtons.forEach((button) => {
    const isSelected = Number.parseInt(button.dataset.index, 10) === index;
    button.classList.toggle("is-selected", isSelected);
  });
}

function updateBetValuesFromOutput() {
  const outputLines = elements.output.textContent.trim().split("\n");
  const betsLen = betButtons.length;
  if (outputLines.length < betsLen) {
    return;
  }
  for (let i = 0; i < betsLen; i += 1) {
    const value = outputLines[i];
    const valueNode = betButtons[i].querySelector(".bet-value");
    if (valueNode) {
      valueNode.textContent = value;
    }
  }
}
