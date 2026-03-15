// === CẤU HÌNH GIẢI THƯỞNG (20 ô) ===

const PRIZES = [
  ...Array(5).fill({
    label: "Thẻ cào 10.000đ",
    description: "Nạp điện thoại 10.000đ",
    weight: 100,
    image: "./imgs/card_10k.png",
  }),
  ...Array(3).fill({
    label: "Thêm lượt quay x1",
    description: "Nhận thêm 1 lượt quay",
    weight: 20,
    image: "./imgs/extra_spin_1.jpg",
  }),
  ...Array(2).fill({
    label: "Thêm lượt quay x2",
    description: "Nhận thêm 2 lượt quay",
    weight: 0,
    image: "./imgs/extra_spin_2.jpg",
  }),
  ...Array(2).fill({
    label: "Thêm lượt quay x5",
    description: "Nhận thêm 5 lượt quay (ô hiếm, không trúng được)",
    weight: 0,
    image: "./imgs/extra_spin_5.jpg",
  }),
  ...Array(3).fill({
    label: "Thẻ cào 20.000đ",
    description: "Nạp điện thoại 20.000đ",
    weight: 10,
    image: "./imgs/card_20k.png",
  }),
  ...Array(2).fill({
    label: "Thẻ cào 50.000đ",
    description: "Nạp điện thoại 50.000đ",
    weight: 0,
    image: "./imgs/card_50k.png",
  }),
  ...Array(2).fill({
    label: "Thẻ cào 100.000đ",
    description: "Nạp điện thoại 100.000đ",
    weight: 0,
    image: "./imgs/card_100k.png",
  }),
  {
    label: "Thẻ cào 200.000đ",
    description: "Nạp điện thoại 200.000đ (ô hiếm, không trúng được)",
    weight: 0,
    image: "./imgs/card_200k.png",
  },
];

// Trộn thứ tự hiển thị một lần khi load
const SHUFFLED_PRIZES = [...PRIZES];
for (let i = SHUFFLED_PRIZES.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [SHUFFLED_PRIZES[i], SHUFFLED_PRIZES[j]] = [SHUFFLED_PRIZES[j], SHUFFLED_PRIZES[i]];
}

const STORAGE_KEY = "event_lottery_username";

// Giải thưởng dùng cho thông báo ảo (trùng với các phần thưởng hiện có)
const NOTIFY_PRIZES = [
  "Thẻ cào 10.000đ",
  "Thẻ cào 20.000đ",
  "Thẻ cào 50.000đ",
  "Thẻ cào 100.000đ",
  "Thẻ cào 200.000đ",
  "Thêm lượt quay x1",
  "Thêm lượt quay x2",
  "Thêm lượt quay x5",
];

// User giả lập cho thông báo ảo (đa dạng, tránh trùng)
const FAKE_USERS = [
  "minhduc92", "thanhnam88", "hoanglan99", "quynhtrang12", "ductien77",
  "ngocanh23", "vietanh45", "thuhang34", "baochau56", "hoangphuc78",
  "linhchi89", "tuananh11", "myhanh22", "khanhvy33", "ducminh44",
  "phuongthao55", "trongnhan66", "haianh77", "minhquan88", "thanhthuy99",
  "anhtuan19", "thuyduong01", "quanghuy66", "hoaian88", "binhminh77",
  "kimngan12", "thanhbinh34", "tramanh56", "duclong78", "hoangnam90",
  "ngoclinh09", "vantuan11", "minhhoang22", "thuylinh33", "baolam44",
  "khanhlinh55", "phuclam66", "hoangduy77", "quynhnga88", "tienphat99",
  "thanhtam15", "myduyen27", "ductrong39", "haivan41", "minhthu53",
  "ngochuyen62", "vietlong74", "tramy86", "quangminh98", "hoaianh10",
  "thuonglam21", "baovy32", "khanhhoa43", "phucloi54", "hoangan65",
  "quynhnhu76", "tuanphong87", "minhngoc19", "thanhthao28", "ducanh37",
  "hangnga46", "binhphuoc55", "kimtuyen64", "thuongvy73", "anhtien82",
  "hoailam91", "ngocminh03", "vietduc14", "tramanh25", "quangtuan36",
  "myhanh47", "thanhson58", "phuongly69", "hoangbao70", "linhdan81",
  "ductam92", "quynhchi04", "minhquan16", "thuhang27", "baongan38",
  "khanhvy49", "tuananh50", "hoangnam61", "ngocanh72", "vietlam83",
  "thanhthuy94", "phuclinh05", "myduyen17", "ductien29", "haianh30",
  "binhminh41", "kimngan52", "tramy63", "quanghuy74", "hoailinh85",
  "thuonglam96", "anhtuan08", "phuongthao19", "trongnhan20", "minhhoang31",
  "baochau42", "vietanh53", "linhchi64", "thanhnam75", "hoanglan86",
  "quynhtrang97", "ductien09", "ngocanh18", "tuananh29", "myhanh30",
  "khanhvy41", "ducminh52", "phuongthao63", "trongnhan74", "haianh85",
  "minhquan96", "thanhthuy07", "giaphong18", "hoabinh29", "ngochau30",
];

// === DOM ELEMENTS ===

const els = {
  grid: document.getElementById("prize-grid"),
  spinButton: document.getElementById("spin-button"),
  result: document.getElementById("result"),
  codeStatus: document.getElementById("code-status"),

  prizeModal: document.getElementById("prize-modal"),
  modalLabel: document.getElementById("modal-prize-label"),
  modalDesc: document.getElementById("modal-prize-description"),
  modalImage: document.getElementById("modal-prize-image"),
  modalClose: document.getElementById("modal-close-btn"),

  claimButton: document.getElementById("claim-button"),
  claimInfo: document.getElementById("claim-info"),
  claimCode: document.getElementById("claim-code"),
  claimSerial: document.getElementById("claim-serial"),
  claimMessage: document.getElementById("claim-message"),
  copyCodeBtn: document.getElementById("copy-code-button"),
  copySerialBtn: document.getElementById("copy-serial-button"),

  spinModal: document.getElementById("spin-info-modal"),
  spinUsernameRow: document.getElementById("spin-username-row"),
  spinUsernameInput: document.getElementById("spin-username-input"),
  spinCodeInput: document.getElementById("spin-code-input"),
  spinConfirmBtn: document.getElementById("spin-confirm-btn"),
  spinError: document.getElementById("spin-error"),
  spinCloseBtn: document.getElementById("spin-modal-close"),

  userBadge: document.getElementById("user-badge"),
  userBadgeName: document.getElementById("user-badge-name"),
  userLogoutBtn: document.getElementById("user-logout-btn"),

  historyLogin: document.getElementById("history-login"),
  historyLogged: document.getElementById("history-logged"),
  historyUsernameInput: document.getElementById("history-username-input"),
  historyLoadBtn: document.getElementById("history-load-btn"),
  historyError: document.getElementById("history-error"),
  historyUsernameDisplay: document.getElementById("history-username-display"),
  historyLogoutBtn: document.getElementById("history-logout-btn"),
  historyList: document.getElementById("history-list"),
  notifyTrack: document.getElementById("notify-track"),
};

// === STATE ===

let isSpinning = false;
let pendingBonusSpins = 0;
let currentCode = null;
let lastWonPrize = null;
let currentUsername = null;
/** Cache ô giải thưởng để animation không phải query DOM mỗi frame */
let prizeCells = [];

// === SESSION (localStorage) ===

function saveSession(username) {
  if (username) {
    try {
      localStorage.setItem(STORAGE_KEY, username);
    } catch (e) { }
  }
}

function loadSession() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch (e) {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { }
}

function setLoggedIn(username) {
  currentUsername = username;
  saveSession(username);
  if (els.userBadge && els.userBadgeName) {
    els.userBadgeName.textContent = username;
    els.userBadge.classList.remove("hidden");
  }
  if (els.spinUsernameRow) els.spinUsernameRow.style.display = "none";
  if (els.historyLogin && els.historyLogged) {
    els.historyLogin.classList.add("hidden");
    els.historyLogged.classList.remove("hidden");
    if (els.historyUsernameDisplay) els.historyUsernameDisplay.textContent = username;
  }
}

function setLoggedOut() {
  currentUsername = null;
  clearSession();
  if (els.userBadge) els.userBadge.classList.add("hidden");
  if (els.spinUsernameRow) els.spinUsernameRow.style.display = "";
  if (els.historyLogin && els.historyLogged) {
    els.historyLogin.classList.remove("hidden");
    els.historyLogged.classList.add("hidden");
  }
  if (els.historyList) els.historyList.innerHTML = "<p class='history-placeholder'>Nhập tên tài khoản để xem lịch sử</p>";
}

// === UTILITIES ===

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      alert("Đã copy!");
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Đã copy!");
    }
  } catch (err) {
    console.error("Copy thất bại", err);
    alert("Không thể copy, hãy copy thủ công");
  }
}

// === CORE FUNCTIONS ===

function initGrid() {
  if (!els.grid) return;

  els.grid.innerHTML = "";
  prizeCells = [];

  if (SHUFFLED_PRIZES.length !== 20) {
    els.result.textContent = "Lỗi: Cần đúng 20 phần thưởng trong PRIZES";
    els.result.classList.add("error");
    return;
  }

  els.result.textContent = "";
  els.result.classList.remove("error");

  const fragment = document.createDocumentFragment();
  SHUFFLED_PRIZES.forEach((prize) => {
    const cell = document.createElement("div");
    cell.className = "prize-cell";

    const img = document.createElement("img");
    img.className = "prize-icon";
    img.src = prize.image;
    img.alt = prize.label;
    img.loading = "lazy";
    img.decoding = "async";

    cell.appendChild(img);
    fragment.appendChild(cell);
  });
  els.grid.appendChild(fragment);
  prizeCells = [...els.grid.querySelectorAll(".prize-cell")];
}

function pickPrizeIndex() {
  const total = SHUFFLED_PRIZES.reduce((sum, p) => sum + (p.weight || 0), 0);
  if (total <= 0) throw new Error("Tổng weight phải > 0");

  let r = Math.random() * total;
  let acc = 0;

  for (let i = 0; i < SHUFFLED_PRIZES.length; i++) {
    acc += SHUFFLED_PRIZES[i].weight || 0;
    if (r < acc) return i;
  }
  return SHUFFLED_PRIZES.length - 1;
}

function clearHighlights() {
  const cells = prizeCells.length ? prizeCells : els.grid ? [...els.grid.querySelectorAll(".prize-cell")] : [];
  for (let i = 0; i < cells.length; i++) {
    cells[i].classList.remove("highlight", "final");
  }
}

function animateSpin(targetIndex) {
  const cells = prizeCells.length ? prizeCells : (els.grid ? [...els.grid.querySelectorAll(".prize-cell")] : []);
  if (!cells.length) return Promise.resolve();

  const rounds = 3 + Math.floor(Math.random() * 2);
  const totalSteps = rounds * cells.length + targetIndex;
  let step = 0;
  let idx = 0;
  let delayMs = 110;
  let lastTime = 0;

  clearHighlights();

  return new Promise((resolve) => {
    function frame(now) {
      if (lastTime === 0) lastTime = now;
      const elapsed = now - lastTime;
      if (elapsed < delayMs && step <= totalSteps) {
        requestAnimationFrame(frame);
        return;
      }
      lastTime = now;

      clearHighlights();
      cells[idx].classList.add("highlight");

      if (step < totalSteps * 0.3) {
        delayMs = Math.max(70, delayMs - 4);
      } else if (step > totalSteps * 0.7) {
        delayMs = Math.min(220, delayMs + 10);
      }

      step++;
      idx = (idx + 1) % cells.length;

      if (step <= totalSteps) {
        requestAnimationFrame(frame);
      } else {
        clearHighlights();
        cells[targetIndex].classList.add("final");
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

function openPrizeModal(prize) {
  if (!els.prizeModal) return;

  els.modalLabel.textContent = prize.label;
  els.modalDesc.textContent = prize.description || "";
  els.modalImage.src = prize.image || "";
  els.modalImage.alt = prize.label;

  els.prizeModal.classList.add("visible");
  lastWonPrize = prize;

  const isCard = prize.label.startsWith("Thẻ cào");
  els.claimButton.disabled = !isCard;
  els.claimButton.style.display = isCard ? "inline-flex" : "none";

  els.claimInfo.classList.add("hidden");
  els.claimCode.textContent = "";
  els.claimSerial.textContent = "";
  els.claimMessage.textContent = "";
}

function closePrizeModal() {
  els.prizeModal?.classList.remove("visible");
}

// === API INTERACTION ===

async function checkUsername(username) {
  const res = await fetch("/api/get-or-create-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || "Lỗi server khi kiểm tra tài khoản");
  }

  if (!data.success) {
    throw new Error(data.message || "Tài khoản không hợp lệ hoặc chưa đăng ký");
  }
  return data.username;
}

async function verifyAndSpin(code, username) {
  const res = await fetch("/api/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, username })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || "Lỗi server khi xác thực mã");
  }
  if (!data.ok) {
    throw new Error(data.message || "Mã không hợp lệ hoặc đã sử dụng");
  }

  currentCode = code;
  if (els.codeStatus) {
    els.codeStatus.innerHTML = `Mã hiện tại: <strong>${code}</strong> (tài khoản: ${username})`;
  }
}

function recordBonusWin(username, prizeLabel) {
  fetch("/api/record-bonus-win", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, prizeLabel })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.bonusCodes?.length && currentUsername === username) {
        loadHistory(username);
      }
    })
    .catch((e) => console.warn("Không ghi được bonus:", e));
}

// === QUAY & XỬ LÝ BONUS ===

async function handleSpin() {
  if (isSpinning) return;
  isSpinning = true;
  els.spinButton.disabled = true;
  els.result.classList.remove("error");

  try {
    let continueSpinning = true;

    while (continueSpinning) {
      els.result.textContent = "Đang quay...";

      const idx = pickPrizeIndex();
      const prize = SHUFFLED_PRIZES[idx];

      if (prize.label === "Thêm lượt quay x1") pendingBonusSpins += 1;
      else if (prize.label === "Thêm lượt quay x2") pendingBonusSpins += 2;

      await animateSpin(idx);

      els.result.innerHTML = `Bạn nhận được: <strong>${prize.label}</strong> – ${prize.description}`;
      openPrizeModal(prize);

      const isBonus = prize.label.includes("Thêm lượt quay");
      const isCard = prize.label.startsWith("Thẻ cào");

      if (isBonus && currentUsername) {
        recordBonusWin(currentUsername, prize.label);
      }

      if (pendingBonusSpins > 0 && (isBonus || !isCard)) {
        pendingBonusSpins--;
      } else {
        continueSpinning = false;
      }
    }
  } catch (err) {
    console.error("Lỗi quay:", err);
    els.result.textContent = err.message || "Lỗi khi quay.";
    els.result.classList.add("error");
  } finally {
    isSpinning = false;
    els.spinButton.disabled = false;
  }
}

async function claimPrize(label, username) {
  els.claimMessage.textContent = "Đang lấy mã thẻ...";
  els.claimInfo.classList.remove("hidden");

  try {
    const res = await fetch("/api/claim-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prizeLabel: label, username })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Không thể nhận thưởng");
    }

    els.claimCode.textContent = data.code || "";
    els.claimSerial.textContent = data.serial || "";
    els.claimMessage.textContent = "Đã nhận thưởng. Hãy lưu lại mã thẻ này!";

    if (currentUsername) loadHistory(currentUsername);
    return true;
  } catch (err) {
    els.claimMessage.textContent = err.message;
    return false;
  }
}

async function loadHistory(username) {
  if (!username || !els.historyList) return;
  try {
    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (!data.success) return;

    const filtered = data.history.filter((item) => {
      const hasCard = (item.cardCode && item.serial) || item.prizeLabel?.startsWith("Thẻ cào");
      const isClaimed = item.isClaimed === true || item.isClaimed === "true";
      const isCard = hasCard && isClaimed;
      const isBonus = item.prizeLabel?.startsWith("Thêm lượt quay");
      return isCard || isBonus;
    });

    if (filtered.length === 0) {
      els.historyList.innerHTML = "<p class='history-placeholder'>Chưa có lịch sử nhận thưởng.</p>";
    } else {
      els.historyList.innerHTML = filtered.map(item => {
        const bonusList = item.bonusCodesWithStatus || (item.bonusCodes || []).map(c => (typeof c === "string" ? { code: c, used: false } : c));
        const bonusHtml = bonusList.length
          ? `<div class="history-bonus-codes">Mã quay tiếp: ${bonusList.map(({ code, used }) => `<span class="bonus-code ${used ? "used" : ""}"><code>${escapeHtml(String(code))}</code><button type="button" class="copy-btn-mini" data-copy="${escapeAttr(String(code))}">Copy</button><span class="code-status-badge">${used ? "Đã dùng" : "Chưa dùng"}</span></span>`).join(" ")}</div>`
          : "";
        const title = escapeHtml(item.prizeLabel || (item.cardCode && item.serial ? "Thẻ cào" : "Phần thưởng"));
        const isCardItem = (item.cardCode && item.serial) || item.prizeLabel?.startsWith("Thẻ cào");
        return `
        <div class="history-item ${isCardItem ? "history-item-card" : ""}">
          <div class="history-item-title">${title}</div>
          <div class="history-item-meta">${new Date(item.spunAt).toLocaleString()}</div>
          ${(item.isClaimed || (item.cardCode && item.serial)) ? `
            <div class="history-card-info">Mã: <strong>${escapeHtml(String(item.cardCode || "-"))}</strong></div>
            <div class="history-card-info">Seri: <strong>${escapeHtml(String(item.serial || "-"))}</strong></div>
          ` : ""}
          ${bonusHtml}
        </div>
      `}).join("");
    }
  } catch (e) {
    els.historyList.innerHTML = "<p class='history-placeholder'>Lỗi tải lịch sử</p>";
  }
}

// === THÔNG BÁO TRÚNG THƯỞNG ẢO (TASKBAR CHẠY NGANG) ===
const NOTIFY_MAX_ITEMS = 5;
const NOTIFY_AVOID_LAST_USERS = 8; // không trùng user trong 8 thông báo gần nhất
let fakeNotifyItems = [];

function buildNotifyItemHtml(user, prize) {
  return `<div class="notify-item"><span class="notify-user">${user}</span> đã trúng <span class="notify-prize">${prize}</span></div>`;
}

function pickRandomFakeUser() {
  const recent = new Set(fakeNotifyItems.slice(-NOTIFY_AVOID_LAST_USERS).map((x) => x.user));
  const pool = recent.size >= FAKE_USERS.length ? FAKE_USERS : FAKE_USERS.filter((u) => !recent.has(u));
  return pool[Math.floor(Math.random() * pool.length)];
}

function addFakeNotify() {
  if (!els.notifyTrack) return;
  const user = pickRandomFakeUser();
  const prize = NOTIFY_PRIZES[Math.floor(Math.random() * NOTIFY_PRIZES.length)];
  fakeNotifyItems.push({ user, prize });
  if (fakeNotifyItems.length > NOTIFY_MAX_ITEMS) fakeNotifyItems.shift();
  const html = fakeNotifyItems.map(({ user: u, prize: p }) => buildNotifyItemHtml(u, p)).join("");
  els.notifyTrack.innerHTML = html + html;
}

function startFakeNotifyTaskbar() {
  addFakeNotify();
  setInterval(addFakeNotify, 5000);
}

// === EVENT LISTENERS ===

els.spinButton?.addEventListener("click", () => {
  if (isSpinning) return;
  els.spinModal.classList.add("visible");
  els.spinError.textContent = "";
  els.spinConfirmBtn.disabled = false;
  if (currentUsername) {
    els.spinUsernameRow.style.display = "none";
    els.spinCodeInput.focus();
  } else {
    els.spinUsernameRow.style.display = "";
    els.spinUsernameInput.focus();
  }
});

els.spinConfirmBtn?.addEventListener("click", async () => {
  const username = currentUsername || els.spinUsernameInput.value.trim();
  const code = els.spinCodeInput.value.trim();

  if (!currentUsername && (!username || username.length < 3)) {
    els.spinError.textContent = "Tên tài khoản phải từ 3 ký tự trở lên";
    els.spinUsernameInput.focus();
    return;
  }

  if (!code) {
    els.spinError.textContent = "Vui lòng nhập mã quay";
    els.spinCodeInput.focus();
    return;
  }

  els.spinError.textContent = "Đang xác thực...";
  els.spinConfirmBtn.disabled = true;

  try {
    const u = currentUsername || (await checkUsername(username));
    currentUsername = u;
    setLoggedIn(u);
    els.spinError.textContent = "Đang xác thực mã quay...";
    await verifyAndSpin(code, u);

    els.spinModal.classList.remove("visible");
    els.spinUsernameInput.value = "";
    els.spinCodeInput.value = "";
    els.spinError.textContent = "";

    handleSpin();
  } catch (err) {
    console.error("Lỗi quá trình quay:", err);
    els.spinError.textContent = err.message || "Lỗi kết nối hoặc xác thực thất bại";
  } finally {
    els.spinConfirmBtn.disabled = false;
  }
});

els.spinCloseBtn?.addEventListener("click", () => els.spinModal.classList.remove("visible"));
els.spinModal?.addEventListener("click", (e) => {
  if (e.target === els.spinModal) els.spinModal.classList.remove("visible");
});

els.claimButton?.addEventListener("click", async () => {
  if (!lastWonPrize || !currentUsername) return;

  const success = await claimPrize(lastWonPrize.label, currentUsername);
  if (success && pendingBonusSpins > 0 && !isSpinning) {
    pendingBonusSpins--;
    await handleSpin();
  }
});

els.copyCodeBtn?.addEventListener("click", () => copyToClipboard(els.claimCode?.textContent || ""));
els.copySerialBtn?.addEventListener("click", () => copyToClipboard(els.claimSerial?.textContent || ""));

els.userLogoutBtn?.addEventListener("click", () => {
  setLoggedOut();
  els.codeStatus.textContent = "Chưa nhập tài khoản & mã quay.";
});

els.historyLoadBtn?.addEventListener("click", async () => {
  const username = els.historyUsernameInput.value.trim();
  if (!username || username.length < 3) {
    els.historyError.textContent = "Tên tài khoản phải từ 3 ký tự trở lên";
    return;
  }
  els.historyError.textContent = "";
  try {
    const u = await checkUsername(username);
    setLoggedIn(u);
    await loadHistory(u);
  } catch (err) {
    els.historyError.textContent = err.message || "Lỗi tải lịch sử";
  }
});

els.historyLogoutBtn?.addEventListener("click", () => {
  setLoggedOut();
  els.codeStatus.textContent = "Chưa nhập tài khoản & mã quay.";
});

els.modalClose?.addEventListener("click", closePrizeModal);
els.prizeModal?.addEventListener("click", (e) => {
  if (e.target === els.prizeModal) closePrizeModal();
});

// Event delegation: một listener cho tất cả nút Copy trong lịch sử (tránh gắn từng nút)
els.historyList?.addEventListener("click", (e) => {
  const btn = e.target.closest(".copy-btn-mini");
  if (btn && btn.dataset.copy) copyToClipboard(btn.dataset.copy);
});

// === INIT ===

initGrid();
startFakeNotifyTaskbar();

const savedUser = loadSession();
if (savedUser) {
  currentUsername = savedUser;
  setLoggedIn(savedUser);
  loadHistory(savedUser);
} else {
  setLoggedOut();
}

if (!currentUsername) {
  els.codeStatus.textContent = "Chưa nhập tài khoản & mã quay.";
}
