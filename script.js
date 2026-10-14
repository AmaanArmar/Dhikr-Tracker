if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW failed:', err));
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

enableIndexedDbPersistence(db).catch(() => {});

let isSignUpMode = false;
let currentUser = null;
let userData = { logs: [], weeklyUsage: { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 } };
let myChartInstance = null;
let currentCount = 0;
let totalSessionCount = 0;

window.toggleAuthMode = function() {
  isSignUpMode = !isSignUpMode;
  document.getElementById('authTitle').innerText = isSignUpMode ? "Create Account" : "Sign In";
  document.getElementById('mainAuthBtn').innerText = isSignUpMode ? "Register" : "Sign In";
  document.getElementById('toggleAuthText').innerText = isSignUpMode ? "Already have an account? Sign In" : "Need an account? Register here";
};

window.processAuth = async function() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  if (!email || !password) return alert("Please fill in all fields.");

  try {
    if (isSignUpMode) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), userData);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    alert("Auth Error: " + error.message);
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById('userDisplay').innerText = user.email.split('@')[0];
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainDashboard').classList.remove('hidden');

    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) userData = docSnap.data();
  } else {
    currentUser = null;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');
  }
});

window.logOut = function() { signOut(auth); };

function updateDisplay() {
  document.getElementById('counterBtn').innerText = currentCount;
  document.getElementById('roundsCount').innerText = Math.floor(totalSessionCount / 33);
  document.getElementById('lapCount').innerText = `${totalSessionCount % 33}/33`;
}

window.increment = function() {
  currentCount++;
  totalSessionCount++;
  localStorage.setItem('activeDhikrCount', currentCount);
  localStorage.setItem('totalSessionCount', totalSessionCount);
  updateDisplay();
};

window.decrement = function() {
  if (currentCount > 0) {
    currentCount--;
    totalSessionCount--;
    localStorage.setItem('activeDhikrCount', currentCount);
    localStorage.setItem('totalSessionCount', totalSessionCount);
    updateDisplay();
  }
};

window.resetCounter = function() {
  currentCount = 0;
  totalSessionCount = 0;
  localStorage.setItem('activeDhikrCount', currentCount);
  localStorage.setItem('totalSessionCount', totalSessionCount);
  updateDisplay();
};

window.saveSessionToCloud = async function() {
  if (currentCount === 0 || !currentUser) return;
  const selectedDhikr = document.getElementById('dhikrSelect').value;
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStr = dayNames[now.getDay()];
  const timestamp = `${dayStr}, ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  userData.logs.unshift({ dhikr: selectedDhikr, count: currentCount, timestamp });
  userData.weeklyUsage[dayStr] = (userData.weeklyUsage[dayStr] || 0) + currentCount;

  await setDoc(doc(db, "users", currentUser.uid), userData);
  alert("Saved securely to Cloud!");
  resetCounter();
};

window.deleteLogItem = async function(index) {
  if (!currentUser || !confirm("Delete this log entry?")) return;
  userData.logs.splice(index, 1);
  await setDoc(doc(db, "users", currentUser.uid), userData);
  renderLogList();
};

function renderLogList() {
  const container = document.getElementById('logContainer');
  container.innerHTML = userData.logs.length ? '' : '<p style="color:var(--muted); font-size:13px;">No logs in Cloud.</p>';
  userData.logs.forEach((item, index) => {
    container.innerHTML += `
      <div class="history-card">
        <button class="delete-log-btn" onclick="deleteLogItem(${index})">&times;</button>
        <div class="history-header"><span>${item.dhikr}</span><span>+${item.count}</span></div>
        <div class="history-body">${item.timestamp}</div>
      </div>
    `;
  });
}

window.switchTab = function(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (btn) btn.classList.add('active');

  if (tabId === 'historyTab') renderLogList();
  if (tabId === 'usageTab') {
    const ctx = document.getElementById('usageChart').getContext('2d');
    if (myChartInstance) myChartInstance.destroy();
    myChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
        datasets: [{ label: 'Cloud Recitations', data: ['Fri','Sat','Sun','Mon','Tue','Wed','Thu'].map(d => userData.weeklyUsage[d] || 0), backgroundColor: '#62d6ca' }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }
};

// --- AI WISDOM & AUDIO STREAM ---
let wisdomDatabase = [];
fetch('verses.json').then(r => r.json()).then(d => wisdomDatabase = d).catch(() => {});

let activeUtterance = null;

function cleanArabicTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Strip Tashkeel
    .replace(/['"“”«»]/g, '') // Strip quotes
    .trim();
}

window.readAloudText = function(text) {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis is not supported on this device/browser.");
    return;
  }

  window.speechSynthesis.cancel();
  
  const cleanedText = cleanArabicTextForSpeech(text);
  activeUtterance = new SpeechSynthesisUtterance(cleanedText || text);
  activeUtterance.lang = 'ar';
  activeUtterance.rate = 0.85;

  activeUtterance.onerror = (event) => {
    console.error("Speech error:", event);
    alert("Audio playback failed. Please check if your phone media volume is turned up.");
  };

  window.speechSynthesis.speak(activeUtterance);
};

window.askRandomWisdom = function() {
  if (!wisdomDatabase.length) return alert("Verses loading...");
  const item = wisdomDatabase[Math.floor(Math.random() * wisdomDatabase.length)];
  const chatContainer = document.getElementById('chatContainer');
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'bot-message';
  msgDiv.innerHTML = `
    <div class="bot-header"><span>${item.ref}</span><span>${item.type}</span></div>
    <div class="chat-arabic-text">${item.arabic}</div>
    <div class="chat-translation-text">${item.translation}</div>
    <div class="reflection-box">
      <div class="reflection-title">A Quick Reflection</div>
      <div class="reflection-text">${item.reflection}</div>
    </div>
    <button class="audio-btn read-audio-btn" style="margin-top:8px;">Read Aloud</button>
  `;

  const audioBtn = msgDiv.querySelector('.read-audio-btn');
  audioBtn.addEventListener('click', () => {
    window.readAloudText(item.arabic);
  });

  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('activeDhikrCount')) currentCount = parseInt(localStorage.getItem('activeDhikrCount'), 10);
  if (localStorage.getItem('totalSessionCount')) totalSessionCount = parseInt(localStorage.getItem('totalSessionCount'), 10);
  updateDisplay();
});
  
