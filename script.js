// --- SERVICE WORKER CLEANUP & FIREBASE IMPORTS ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      if (!localStorage.getItem('sw_version_v13')) {
        registration.unregister().then(() => console.log('Old SW Unregistered'));
        localStorage.setItem('sw_version_v13', 'true');
        window.location.reload();
      }
    }
  });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNjTCd-LE0buyE2aDktb-ORN0Ncwvzcgo",
  authDomain: "dhikr-tracker-9930.firebaseapp.com",
  projectId: "dhikr-tracker-9930",
  storageBucket: "dhikr-tracker-9930.firebasestorage.app",
  messagingSenderId: "147563812299",
  appId: "1:147563812299:web:876d19edf65160e300124e",
  measurementId: "G-YBWPX3C2HR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Persistence failed: Multiple tabs open.");
  } else if (err.code === 'unimplemented') {
    console.warn("Persistence not supported by this browser.");
  }
});

let isSignUpMode = false;
let currentUser = null;

// 1. DEFAULT LOCAL STATE (Loads immediately from localStorage if present)
let userData = { 
  logs: [], 
  weeklyUsage: { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 } 
};

let myChartInstance = null;

// --- TRUE LOCAL-FIRST CORE ENGINE ---

// Immediate Local Load on Engine Startup
function initLocalData() {
  const localSaved = localStorage.getItem('dhikr_user_data');
  if (localSaved) {
    try {
      userData = JSON.parse(localSaved);
      if (!userData.logs) userData.logs = [];
      if (!userData.weeklyUsage) userData.weeklyUsage = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };
    } catch (e) {
      console.error("Error loading local memory:", e);
    }
  }
}

// Universal Persistent Writer (Writes to Local Storage ALWAYS, Cloud SECOND)
async function persistUserData() {
  // Always update Local Storage immediately
  localStorage.setItem('dhikr_user_data', JSON.stringify(userData));

  // Background Cloud Sync
  if (navigator.onLine && currentUser && currentUser.uid) {
    try {
      await setDoc(doc(db, "users", currentUser.uid), userData, { merge: true });
      console.log("Cloud sync completed.");
    } catch (error) {
      console.warn("Background cloud sync deferred:", error.message);
    }
  }
}

// Background Network Recovery Sync
window.addEventListener('online', async () => {
  console.log("Internet back online. Syncing local state with cloud...");
  await persistUserData();
});

// --- AUTHENTICATION FLOW ---
window.toggleAuthMode = function() {
  isSignUpMode = !isSignUpMode;
  document.getElementById('authTitle').innerText = isSignUpMode ? "Create Account" : "Sign In";
  document.getElementById('mainAuthBtn').innerText = isSignUpMode ? "Register" : "Sign In";
  document.getElementById('toggleAuthText').innerText = isSignUpMode ? "Already have an account? Sign In" : "Need an account? Register here";
};

window.processAuth = async function() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (!email || !password) return alert("Please fill in all fields.");

  if (!navigator.onLine) {
    alert("Offline Mode Active: Entering Dashboard.");
    enterDashboard(email ? email.split('@')[0] : "Offline User");
    return;
  }

  try {
    if (isSignUpMode) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    if (error.code === 'auth/network-request-failed' || error.message.includes('network')) {
      alert("Network Unreachable: Switching to Offline Mode.");
      enterDashboard(email ? email.split('@')[0] : "Offline User");
    } else {
      alert("Auth Error: " + error.message);
    }
  }
};

function enterDashboard(displayName) {
  document.getElementById('userDisplay').innerText = displayName;
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mainDashboard').classList.remove('hidden');
  renderLogList();
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    enterDashboard(user.email ? user.email.split('@')[0] : "User");

    // Fetch cloud data and merge seamlessly with local state if online
    if (navigator.onLine) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          
          // Merge local and cloud logs
          if (cloudData.logs) {
            userData.logs = cloudData.logs;
          }
          if (cloudData.weeklyUsage) {
            userData.weeklyUsage = cloudData.weeklyUsage;
          }
          // Save merged result back to local storage
          localStorage.setItem('dhikr_user_data', JSON.stringify(userData));
          renderLogList();
        }
      } catch (err) {
        console.warn("Cloud read failed, staying on local state:", err);
      }
    }
  } else {
    currentUser = null;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');
  }
});

window.logOut = function() {
  signOut(auth);
};

// --- LOGS & RECORDING (WORKS 100% OFFLINE) ---
window.saveSessionToCloud = async function() {
  if (currentCount === 0) return;

  const selectedDhikr = document.getElementById('dhikrSelect').value;
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayStr = dayNames[now.getDay()];
  const formattedDate = `${currentDayStr}, ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Update local memory instantly
  userData.logs.unshift({ dhikr: selectedDhikr, count: currentCount, timestamp: formattedDate });
  userData.weeklyUsage[currentDayStr] = (userData.weeklyUsage[currentDayStr] || 0) + currentCount;

  // Persist locally + sync to cloud
  await persistUserData();

  alert("Saved to local records!");
  resetCounter();
  renderLogList();
};

window.deleteLogItem = async function(index) {
  const confirmed = confirm("Are you sure you want to delete this log entry?");
  if (!confirmed) return;

  userData.logs.splice(index, 1);
  await persistUserData();
  renderLogList();
};

function renderLogList() {
  const container = document.getElementById('logContainer');
  if (!container) return;

  const logs = userData.logs || [];
  container.innerHTML = logs.length ? '' : '<p style="color:#64748b;">No logs recorded yet.</p>';

  logs.forEach((item, index) => {
    container.innerHTML += `
      <div class="history-card">
        <button class="delete-log-btn" onclick="deleteLogItem(${index})" title="Delete entry">&times;</button>
        <div class="history-header">
          <span>${item.dhikr}</span>
          <span>+${item.count}</span>
        </div>
        <div class="history-body">${item.timestamp}</div>
      </div>
    `;
  });
}

// --- COUNTER LOGIC ---
let currentCount = 0;
let totalSessionCount = 0;

window.increment = function() {
  currentCount++;
  totalSessionCount++;
  localStorage.setItem('activeDhikrCount', currentCount);
  document.getElementById('counterBtn').innerText = currentCount;
  document.getElementById('roundsCount').innerText = Math.floor(totalSessionCount / 33);
  document.getElementById('lapCount').innerText = `${totalSessionCount % 33}/33`;
};

window.decrement = function() {
  if (currentCount > 0) {
    currentCount--;
    totalSessionCount--;
    localStorage.setItem('activeDhikrCount', currentCount);
    document.getElementById('counterBtn').innerText = currentCount;
    document.getElementById('roundsCount').innerText = Math.floor(totalSessionCount / 33);
    document.getElementById('lapCount').innerText = `${totalSessionCount % 33}/33`;
  }
};

window.resetCounter = function() {
  currentCount = 0;
  totalSessionCount = 0;
  localStorage.setItem('activeDhikrCount', currentCount);
  document.getElementById('counterBtn').innerText = 0;
  document.getElementById('roundsCount').innerText = 0;
  document.getElementById('lapCount').innerText = '0/33';
};

window.switchTab = function(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btn.classList.add('active');

  if (tabId === 'historyTab') {
    renderLogList();
  }

  if (tabId === 'usageTab') {
    renderChart();
  }
};

function renderChart() {
  const chartCanvas = document.getElementById('usageChart');
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext('2d');

  if (myChartInstance) {
    myChartInstance.destroy();
  }

  const weekly = userData.weeklyUsage || {};
  myChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
      datasets: [{ 
        label: 'Recitations', 
        data: ['Fri','Sat','Sun','Mon','Tue','Wed','Thu'].map(d => weekly[d] || 0), 
        backgroundColor: '#00e5ff' 
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

// --- AI COMPANION WISDOM STREAM ---
let wisdomDatabase = [];

async function loadWisdomDatabase() {
  try {
    const response = await fetch('verses.json');
    wisdomDatabase = await response.json();
    console.log(`Successfully loaded ${wisdomDatabase.length} entries.`);
  } catch (error) {
    console.error('Error loading verses.json:', error);
  }
}

const chatContainer = document.getElementById('chatContainer');

function appendUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message user-message';
  msg.textContent = text;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendBotMessage(item) {
  const msg = document.createElement('div');
  msg.className = 'message bot-message';

  msg.innerHTML = `
    <div class="bot-header"><span>${item.ref}</span><span>${item.type}</span></div>
    <div class="chat-arabic-text">${item.arabic}</div>
    <div class="chat-translation-text">${item.translation}</div>
    <div class="reflection-box">
      <div class="reflection-title">A Quick Reflection</div>
      <div class="reflection-text">${item.reflection}</div>
    </div>
    <div class="bot-actions">
      <button class="audio-btn">🔊 Read Aloud</button>
    </div>
  `;

  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  msg.querySelector('.audio-btn').addEventListener('click', () => {
    speakBilingualWisdom(item);
  });
}

window.askRandomWisdom = function() {
  if (wisdomDatabase.length === 0) {
    alert("Verses are still loading, please wait a moment.");
    return;
  }
  appendUserMessage("Give me a random reminder.");
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * wisdomDatabase.length);
    appendBotMessage(wisdomDatabase[randomIndex]);
  }, 300);
};

function speakBilingualWisdom(item) {
  if (!('speechSynthesis' in window)) {
    alert("Text-to-speech is not supported on your browser.");
    return;
  }
  window.speechSynthesis.cancel();

  const arabicUtterance = new SpeechSynthesisUtterance(item.arabic);
  arabicUtterance.lang = 'ar-SA';
  arabicUtterance.rate = 0.9;

  const englishText = `${item.ref}. ${item.translation}. Reflection: ${item.reflection}`;
  const englishUtterance = new SpeechSynthesisUtterance(englishText);
  englishUtterance.lang = 'en-US';
  englishUtterance.rate = 0.95;

  arabicUtterance.onend = () => {
    window.speechSynthesis.speak(englishUtterance);
  };

  window.speechSynthesis.speak(arabicUtterance);
}

// --- CONSOLIDATED INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize local memory instantly
  initLocalData();

  // 2. Recover live counter state
  const savedCount = localStorage.getItem('activeDhikrCount');
  if (savedCount !== null) {
    currentCount = parseInt(savedCount, 10);
    const counterBtn = document.getElementById('counterBtn');
    if (counterBtn) counterBtn.innerText = currentCount;
  }

  // 3. Render local logs into the history tab right away
  renderLogList();
});

// Register Service Worker for offline PWA execution
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log("Offline Service Worker Active!"))
      .catch((err) => console.log("Service Worker registration failed:", err));
  });
}

// Initial load call for wisdom items
loadWisdomDatabase();
