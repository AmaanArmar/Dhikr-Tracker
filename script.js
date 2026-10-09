import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let isSignUpMode = false;
let currentUser = null;
let userData = { logs: [], weeklyUsage: { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 } };
let myChartInstance = null;

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
};

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

window.logOut = function() {
  signOut(auth);
};

window.saveSessionToCloud = async function() {
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
};

window.deleteLogItem = async function(index) {
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
};

function renderLogList() {
  const container = document.getElementById('logContainer');
  container.innerHTML = userData.logs.length ? '' : '<p style="color:#64748b;">No logs in Cloud.</p>';
  
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

let currentCount = 0;
let totalSessionCount = 0;

window.increment = function() {
  currentCount++;
  totalSessionCount++;
  document.getElementById('counterBtn').innerText = currentCount;
  document.getElementById('roundsCount').innerText = Math.floor(totalSessionCount / 33);
  document.getElementById('lapCount').innerText = `${totalSessionCount % 33}/33`;
};

window.decrement = function() {
  if (currentCount > 0) {
    currentCount--;
    totalSessionCount--;
    document.getElementById('counterBtn').innerText = currentCount;
    document.getElementById('roundsCount').innerText = Math.floor(totalSessionCount / 33);
    document.getElementById('lapCount').innerText = `${totalSessionCount % 33}/33`;
  }
};

window.resetCounter = function() {
  currentCount = 0;
  totalSessionCount = 0;
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
    const ctx = document.getElementById('usageChart').getContext('2d');
    if (myChartInstance) {
      myChartInstance.destroy();
    }

    myChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
        datasets: [{ label: 'Cloud Recitations', data: ['Fri','Sat','Sun','Mon','Tue','Wed','Thu'].map(d => userData.weeklyUsage[d] || 0), backgroundColor: '#00e5ff' }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }
};

// --- MASSIVE WISDOM DATABASE & CHAT COMPANION LOGIC ---
const wisdomDatabase = [
    {
        type: "Quranic Verse",
        ref: "Surah Ash-Sharh (94:5–6)",
        arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        translation: "For indeed, with hardship comes ease. Indeed, with hardship comes ease.",
        reflection: "Relief and hope are present alongside the struggle, not just waiting at the end."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2999)",
        arabic: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
        translation: "How wonderful is the affair of the believer, for his entire affair is good. If an adversity befalls him, he is patient, and that is good for him.",
        reflection: "Every trial faced with patient perseverance transforms into a spiritual victory."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6114)",
        arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
        translation: "The strong person is not the one who overcomes people by his strength, but the strong person is the one who controls himself when angry.",
        reflection: "True power is measured by emotional self-restraint under pressure."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Ar-Ra'd (13:28)",
        arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        translation: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts find peace.",
        reflection: "True calm in a busy world comes from taking a moment to connect with God."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6407)",
        arabic: "مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لاَ يَذْكُرُ رَبَّهُ مَثَلُ الْحَيِّ وَالْمَيِّتِ",
        translation: "The example of the one who remembers his Lord and the one who does not is like that of the living and the dead.",
        reflection: "Keeping your heart engaged in Dhikr breathes spiritual vitality into your routine."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Az-Zumar (39:53)",
        arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
        translation: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah.'",
        reflection: "No matter how heavy past mistakes feel, God’s door of repentance is always open."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (7507)",
        arabic: "لَلَّهُ أَفْرَحُ بِتَوْبَةِ عَبْدِهِ مِنْ أَحَدِكُمْ بِضَالَّتِهِ",
        translation: "Allah is more pleased with the repentance of His servant than anyone of you is with finding his lost camel.",
        reflection: "God eagerly accepts your return. Every sincere step toward forgiveness meets immense divine grace."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (13)",
        arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
        translation: "None of you truly believes until he loves for his brother what he loves for himself.",
        reflection: "True community and character are built on selflessness and wishing well for others."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2594)",
        arabic: "إِنَّ الرُّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ، وَلَا يُنْزَعُ مِنْ شَيْءٍ إِلَّا شَانَهُ",
        translation: "Whenever gentleness is added to something, it beautifies it, and whenever it is withdrawn from something, it leaves it tarnished.",
        reflection: "Leading with soft speech and gentleness transforms difficult encounters into grace."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Baqarah (2:152)",
        arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
        translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
        reflection: "Whenever you take a quiet moment to remember God, you are remembered in return."
    }
];

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
    
    const fullTextToSpeech = `${item.ref}. ${item.translation}. Reflection: ${item.reflection}`;

    msg.innerHTML = `
        <div class="bot-header"><span>${item.ref}</span><span>${item.type}</span></div>
        <div class="chat-arabic-text">${item.arabic}</div>
        <div class="chat-translation-text">${item.translation}</div>
        <div class="reflection-box">
            <div class="reflection-title">A Quick Reflection</div>
            <div class="reflection-text">${item.reflection}</div>
        </div>
        <div class="bot-actions">
            <button class="audio-btn" id="speakBtn">🔊 Read Aloud</button>
        </div>
    `;
    
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    msg.querySelector('#speakBtn').addEventListener('click', () => {
        speakText(fullTextToSpeech);
    });
}

window.askRandomWisdom = function() {
    appendUserMessage("Give me a random reminder.");
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * wisdomDatabase.length);
        appendBotMessage(wisdomDatabase[randomIndex]);
    }, 300);
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Text-to-speech is not supported on your browser.");
    }
}
