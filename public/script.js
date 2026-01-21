// public/script.js
const POLL_INTERVAL = 60000; // 60 秒
const IMAGE_THRESHOLDS = [0, 3, 10, 20, 35, 50];
const IMAGE_PATHS = [
  'images/img0.jpg',
  'images/img1.jpg',
  'images/img2.jpg',
  'images/img3.jpg',
  'images/img4.jpg',
  'images/img5.jpg'
];

const countBadge = document.getElementById('countBadge');
const mainImage = document.getElementById('mainImage');
const barrage = document.getElementById('barrage');

let displayedMessageIds = new Set();
let activeBarrageItems = [];
let lastSide = 'right'; // 用來控制左右平衡

function chooseImage(total) {
  let idx = 0;
  for (let i = 0; i < IMAGE_THRESHOLDS.length; i++) {
    if (total >= IMAGE_THRESHOLDS[i]) idx = i;
  }
  if (idx >= IMAGE_PATHS.length) idx = IMAGE_PATHS.length - 1;
  return IMAGE_PATHS[idx];
}

function updateUI(data) {
  const total = data.total || 0;
  countBadge.textContent = `回饋數量: ${total}`;

  const chosen = chooseImage(total);
  if (!mainImage.src.endsWith(chosen)) {
    mainImage.src = chosen;
  }

  if (Array.isArray(data.messages)) {
    data.messages.forEach(msg => {
      if (!msg.id) return;
      if (displayedMessageIds.has(msg.id)) return;
      if (!msg.message || msg.message.trim() === '') return;
      spawnBarrageItem(msg.id, msg.message);
      displayedMessageIds.add(msg.id);
    });
  }
}

function spawnBarrageItem(id, text) {
  const el = document.createElement('div');
  el.className = 'barrage-item';
  el.textContent = text;

  // 隨機字體大小 14~18px
  const fontSize = Math.random() * 4 + 14;
  el.style.fontSize = `${fontSize}px`;

  // 垂直位置：上下留白，避開圖片中間
  const topRanges = [
    [10, 45], // 上方空白區域
    [55, 90]  // 下方空白區域
  ];
  const range = topRanges[Math.floor(Math.random() * topRanges.length)];
  let top = Math.random() * (range[1] - range[0]) + range[0];

  // 水平位置：避開圖片中間 30~70%
  let left;
  if (lastSide === 'right') {
    left = Math.random() * 26; // 左側 0~26%
    lastSide = 'left';
  } else {
    left = 74 + Math.random() * 26; // 右側 74~100%
    lastSide = 'right';
  }

  // 避免重疊
  let tries = 0;
  while (tries < 10) {
    const overlap = activeBarrageItems.some(item => {
      return Math.abs(item.top - top) < 5 && Math.abs(item.left - left) < 10;
    });
    if (!overlap) break;

    top = Math.random() * (range[1] - range[0]) + range[0];
    left = lastSide === 'right'
      ? Math.random() * 28
      : 72 + Math.random() * 28;

    tries++;
  }

  el.style.top = `${top}%`;
  el.style.left = `${left}%`;

  activeBarrageItems.push({ top, left });

  el.addEventListener('animationend', () => {
    try {
      el.remove();
      activeBarrageItems = activeBarrageItems.filter(item => item.top !== top || item.left !== left);
    } catch (e) {}
  });

  barrage.appendChild(el);
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats', { cache: 'no-store' });
    if (!res.ok) {
      console.error('HTTP error', res.status);
      return;
    }
    const data = await res.json();
    if (data && data.success !== false) {
      updateUI(data);
    } else {
      console.warn('Unexpected response from /api/stats', data);
    }
  } catch (err) {
    console.error('Fetch /api/stats failed', err);
  }
}

fetchStats();
setInterval(fetchStats, POLL_INTERVAL);

