document.addEventListener('contextmenu', event => event.preventDefault());

// Tab Navigation Logic
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// Counter Logic
let count = 0;
const target = 33;
const countValueElem = document.getElementById('countValue');
const incrementBtn = document.getElementById('incrementBtn');
const resetBtn = document.getElementById('resetBtn');
const logContainer = document.getElementById('logContainer');

incrementBtn.addEventListener('click', () => {
    count++;
    countValueElem.textContent = count;
    if (count === target) {
        logActivity(`Completed target of ${target} Dhikr.`);
    }
});

resetBtn.addEventListener('click', () => {
    count = 0;
    countValueElem.textContent = count;
});

function logActivity(text) {
    if (logContainer.querySelector('.empty-log')) {
        logContainer.innerHTML = '';
    }
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.style.fontSize = '0.8rem';
    logItem.style.padding = '6px 0';
    logItem.style.borderBottom = '1px solid #333';
    logItem.textContent = `${new_timestamp()} - ${text}`;
    logContainer.prepend(logItem);
}

function new_timestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Wisdom Database & Randomizer
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
    }
];

const chatContainer = document.getElementById('chatContainer');
const randomWisdomBtn = document.getElementById('randomWisdomBtn');

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
        <div class="arabic-text">${item.arabic}</div>
        <div class="translation-text">${item.translation}</div>
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

randomWisdomBtn.addEventListener('click', () => {
    appendUserMessage("Give me a random reminder.");
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * wisdomDatabase.length);
        appendBotMessage(wisdomDatabase[randomIndex]);
    }, 300);
});

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
