// --- SERVICE WORKER & UPGRADE LOGIC ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      if (!localStorage.getItem('sw_version_v18')) {
        registration.unregister().then(() => console.log('Upgraded to SW v18 - Slim Cache'));
        localStorage.setItem('sw_version_v18', 'true');
        window.location.reload();
      }
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW Registered:', reg.scope))
      .catch(err => console.error('SW Registration Failed:', err));
  });
}

// --- FIREBASE INITIALIZATION ---
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
  if (err.code == 'failed-precondition') {
    console.warn("Persistence failed: Multiple tabs open.");
  } else if (err.code == 'unimplemented') {
    console.warn("Persistence not supported by this browser.");
  }
});

let isSignUpMode = false;
let currentUser = null;
let userData = { logs: [], weeklyUsage: { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 } };
let myChartInstance = null;

// --- AUTHENTICATION SYSTEM ---
function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  document.getElementById('authTitle').innerText = isSignUpMode ? "Create Account" : "Sign In";
  document.getElementById('mainAuthBtn').innerText = isSignUpMode ? "Register" : "Sign In";
  document.getElementById('toggleAuthText').innerText = isSignUpMode ? "Already have an account? Sign In" : "Need an account? Register here";
}

async function processAuth() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();

  if (!email || !password) return alert("Please fill in all fields.");

  try {
    if (isSignUpMode) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    alert("Auth Error: " + error.message);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById('userDisplay').innerText = user.email.split('@')[0];
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainDashboard').classList.remove('hidden');

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      userData = docSnap.data();
    }
  } else {
    currentUser = null;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');
  }
});

function logOut() {
  signOut(auth);
}

// --- DATA & CLOUD LOGGING ---
async function saveSessionToCloud() {
  if (currentCount === 0 || !currentUser) return;

  const selectedDhikr = document.getElementById('dhikrSelect').value;
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayStr = dayNames[now.getDay()];
  const formattedDate = `${currentDayStr}, ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  userData.logs.unshift({ dhikr: selectedDhikr, count: currentCount, timestamp: formattedDate });
  userData.weeklyUsage[currentDayStr] = (userData.weeklyUsage[currentDayStr] || 0) + currentCount;

  await setDoc(doc(db, "users", currentUser.uid), userData);
  
  alert("Saved securely to Cloud!");
  resetCounter();
}

async function deleteLogItem(index) {
  if (!currentUser) return;
  const confirmed = confirm("Are you sure you want to delete this log entry?");
  if (!confirmed) return;

  userData.logs.splice(index, 1);
  
  try {
    await setDoc(doc(db, "users", currentUser.uid), userData);
    renderLogList();
  } catch (error) {
    alert("Error deleting entry: " + error.message);
  }
}

function renderLogList() {
  const container = document.getElementById('logContainer');
  container.innerHTML = userData.logs.length ? '' : '<p style="color:#83999d;">No logs in Cloud.</p>';
  
  userData.logs.forEach((item, index) => {
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

function increment() {
  currentCount++;
  totalSessionCount++;
  localStorage.setItem('activeDhikrCount', currentCount);
  document.getElementById('counterBtn').innerText = currentCount;
  document.getElementById('roundsCount').innerText = Math.floor(totalSessionCount / 33);
  document.getElementById('lapCount').innerText = `${totalSessionCount % 33}/33`;
}

function decrement() {
  if (currentCount > 0) {
    currentCount--;
    totalSessionCount--;
    localStorage.setItem('activeDhikrCount', currentCount);
    document.getElementById('counterBtn').innerText = currentCount;
    document.getElementById('roundsCount').innerText = Math.floor(totalSessionCount / 33);
    document.getElementById('lapCount').innerText = `${totalSessionCount % 33}/33`;
  }
}

function resetCounter() {
  currentCount = 0;
  totalSessionCount = 0;
  localStorage.setItem('activeDhikrCount', currentCount);
  document.getElementById('counterBtn').innerText = 0;
  document.getElementById('roundsCount').innerText = 0;
  document.getElementById('lapCount').innerText = '0/33';
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (btn) btn.classList.add('active');

  if (tabId === 'historyTab') {
    renderLogList();
  }

  if (tabId === 'usageTab') {
    const ctx = document.getElementById('usageChart').getContext('2d');
    if (myChartInstance) {
      myChartInstance.destroy();
    }

    myChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
        datasets: [{ label: 'Cloud Recitations', data: ['Fri','Sat','Sun','Mon','Tue','Wed','Thu'].map(d => userData.weeklyUsage[d] || 0), backgroundColor: '#62d6ca' }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }
}

// --- AI COMPANION WISDOM STREAM ---
let wisdomDatabase = [];

async function loadWisdomDatabase() {
    try {
        const response = await fetch('verses.json');
        wisdomDatabase = await response.json();
    } catch (error) {
        console.error('Error loading verses.json:', error);
    }
}

function askRandomWisdom() {
    if (wisdomDatabase.length === 0) {
        alert("Verses are still loading, please wait a moment.");
        return;
    }
    const chatContainer = document.getElementById('chatContainer');
    const randomIndex = Math.floor(Math.random() * wisdomDatabase.length);
    const item = wisdomDatabase[randomIndex];

    const msg = document.createElement('div');
    msg.className = 'message bot-message';
    msg.innerHTML = `
        <div class="bot-header"><span>${item.ref}</span><span>${item.type}</span></div>
        <div class="chat-arabic-text">${item.arabic}</div>
        <div class="chat-translation-text">${item.translation}</div>
        <div class="reflection-box">
            <div class="reflection-title">Reflection</div>
            <div class="reflection-text">${item.reflection}</div>
        </div>
    `;
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Global Expose
window.processAuth = processAuth;
window.toggleAuthMode = toggleAuthMode;
window.switchTab = switchTab;
window.increment = increment;
window.resetCounter = resetCounter;
window.decrement = decrement;
window.saveSessionToCloud = saveSessionToCloud;
window.logOut = logOut;
window.askRandomWisdom = askRandomWisdom;
window.deleteLogItem = deleteLogItem;

document.addEventListener('DOMContentLoaded', () => {
    const savedCount = localStorage.getItem('activeDhikrCount');
    if (savedCount !== null) {
        currentCount = parseInt(savedCount, 10);
        const btn = document.getElementById('counterBtn');
        if (btn) btn.innerText = currentCount;
    }
    loadWisdomDatabase();
});
  
