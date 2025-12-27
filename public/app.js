const $ = (sel) => document.querySelector(sel);

const infoModal = $("#infoModal");
const btnInfoTop = $("#btnInfo");
const btnInfoCorner = $("#cornerInfo");
const closeInfo = $("#closeInfo");

const haloBtn = $("#haloBtn");
const haloLabel = $("#haloLabel");
const stopBtn = $("#stopBtn");

const quietForm = $("#quietForm");
const quietInput = $("#quietInput");
const thread = $("#thread");

function openModal(modalEl) {
  modalEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  // focus close button for accessibility + ensures keyboard works
  const close = modalEl.querySelector(".modal-close");
  if (close) close.focus({ preventScroll: true });
}

function closeModal(modalEl) {
  modalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

// ---- Info modal wiring (FIXED) ----
btnInfoTop?.addEventListener("click", () => openModal(infoModal));
btnInfoCorner?.addEventListener("click", () => openModal(infoModal));
closeInfo?.addEventListener("click", () => closeModal(infoModal));

// Click backdrop closes (but clicking inside the card does NOT)
infoModal?.addEventListener("click", (e) => {
  if (e.target === infoModal) closeModal(infoModal);
});

// ESC closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && infoModal.getAttribute("aria-hidden") === "false") {
    closeModal(infoModal);
  }
});

// ---- Halo button (demo behavior placeholder) ----
let talking = false;

function setTalking(on) {
  talking = on;
  haloBtn.disabled = false;

  if (on) {
    haloLabel.textContent = "Listening…";
    stopBtn.classList.remove("hidden");
  } else {
    haloLabel.textContent = "Talk";
    stopBtn.classList.add("hidden");
  }
}

haloBtn?.addEventListener("click", async () => {
  // This is still “demo mode” unless you hook Realtime in.
  // But the UI state changes so the page feels alive.
  if (talking) return;
  setTalking(true);

  // Optional: quick proof your /session exists (won’t crash UI if missing)
  try {
    const r = await fetch("/session", { method: "POST" });
    if (!r.ok) throw new Error(`Session failed: ${r.status}`);
    const data = await r.json();
    console.log("Session:", data);
  } catch (err) {
    console.warn(err);
  }
});

stopBtn?.addEventListener("click", () => setTalking(false));

// ---- Quiet chat ----
function addMsg(text, who = "user") {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
}

quietForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = (quietInput.value || "").trim();
  if (!prompt) return;

  addMsg(prompt, "user");
  quietInput.value = "";

  try {
    const r = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await r.json();
    addMsg(data.reply || "(no reply)", "bot");
  } catch (err) {
    addMsg("Error reaching /chat.", "bot");
  }
});

// Demo portals (no navigation yet)
$("#portalWalmart")?.addEventListener("click", () => addMsg("Portal: Walmart demo", "bot"));
$("#portalBusiness")?.addEventListener("click", () => addMsg("Portal: Business demo", "bot"));
$("#portalSupport")?.addEventListener("click", () => addMsg("Portal: Support", "bot"));

