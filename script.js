document.addEventListener('contextmenu', event => event.preventDefault());

function openChatApp() {
    document.getElementById('landingScreen').style.display = 'none';
    document.getElementById('chatApp').style.display = 'flex';
}

function closeChatApp() {
    document.getElementById('chatApp').style.display = 'none';
    document.getElementById('landingScreen').style.display = 'flex';
}

// Massive Wisdom Database Compendium
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
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (5027)",
        arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
        translation: "The best of you are those who learn the Quran and teach it.",
        reflection: "Engaging with sacred words and sharing that light brings lasting barakah."
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
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6416)",
        arabic: "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ",
        translation: "Be in this world as though you were a stranger or a traveler along a path.",
        reflection: "Keeping the perspective of a traveler helps prioritize what matters eternally."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Baqarah (2:152)",
        arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
        translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
        reflection: "Whenever you take a quiet moment to remember God, you are remembered in return."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Ibrahim (14:7)",
        arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
        translation: "If you are grateful, I will surely increase you [in favor].",
        reflection: "Gratitude is the key to preserving blessings and inviting greater contentment."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6018)",
        arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
        translation: "Whoever believes in Allah and the Last Day should either speak good or remain silent.",
        reflection: "Mindfulness of speech protects your heart and preserves peace."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2564)",
        arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
        translation: "Indeed, Allah does not look at your appearance or your wealth, but He looks at your hearts and your deeds.",
        reflection: "True worth is measured by sincere intentions rather than outward status."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Baqarah (2:286)",
        arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
        translation: "Allah does not charge a soul except [with that within] its capacity.",
        reflection: "Whatever challenge you face, you have been given the inner capacity to endure it."
    },
    {
        type: "Sahih Hadith",
        ref: "Sunan an-Nasa'i (3443)",
        arabic: "الدُّنْيَا مَتَاعٌ، وَخَيْرُ مَتَاعِ الدُّنْيَا الْمَرْأَةُ الصَّالِحَةُ",
        translation: "The world is temporary enjoyment, and the best provision of this world is a righteous companion.",
        reflection: "Surrounding yourself with righteous company is a profound blessing."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (477)",
        arabic: "احَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
        translation: "The most beloved deeds to Allah are those that are consistent, even if they are small.",
        reflection: "Consistency in small daily habits builds towering spiritual strength over time."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Ali 'Imran (3:159)",
        arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ",
        translation: "And when you have decided, then rely upon Allah.",
        reflection: "Do your absolute best with planning, then leave the outcome entirely in God's hands."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (1035)",
        arabic: "تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْعَشْرِ الأَوَاخِرِ",
        translation: "Seek Laylat al-Qadr in the last ten nights of Ramadan.",
        reflection: "A reminder of the incredible value of hidden, dedicated effort during sacred times."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6502)",
        arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
        translation: "There are two blessings which many people lose: health and free time.",
        reflection: "Appreciate youth, health, and free moments before they transition into busier seasons."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2588)",
        arabic: "الْحَيَاءُ لَا يَأْتِي إِلَّا بِخَيْرٍ",
        translation: "Modesty brings nothing except good.",
        reflection: "Dignity and self-respect safeguard a believer from unmindful actions."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Ankabut (29:69)",
        arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
        translation: "And those who strive for Us - We will surely guide them to Our ways.",
        reflection: "Sincere effort toward good brings divine guidance right when you need it most."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (2555)",
        arabic: "رَحِمَ اللَّهُ رَجُلًا سَمْحًا إِذَا بَاعَ وَإِذَا اشْتَرَى",
        translation: "May Allah have mercy on a person who is lenient when he sells, when he buys, and when he makes a claim.",
        reflection: "Kindness and fairness in everyday financial interactions invite divine mercy."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Hujurat (49:10)",
        arabic: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَيكُمْ",
        translation: "The believers are but brothers, so make settlement between your brothers.",
        reflection: "Preserving unity and healing broken bonds within a community is paramount."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2674)",
        arabic: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ",
        translation: "Whoever relieves a believer's distress of the distressful aspects of this world, Allah will rescue him from a difficulty of the difficulties of the Hereafter.",
        reflection: "Helping others in times of trouble is your best investment for the Day of Judgment."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6021)",
        arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ",
        translation: "Whoever believes in Allah and the Last Day should honor his neighbor.",
        reflection: "Good character is demonstrated through mutual respect and care for those living around you."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Luqman (31:17)",
        arabic: "يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ",
        translation: "O my son, establish prayer, enjoin what is right, forbid what is wrong, and be patient over what befalls you.",
        reflection: "A timeless blueprint for personal discipline, social responsibility, and resilience."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (2749)",
        arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
        translation: "The best of people are those who are most beneficial to others.",
        reflection: "Your true legacy is measured by how much positive value you bring to the lives of those around you."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2245)",
        arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
        translation: "Purification is half of faith.",
        reflection: "Outer cleanliness and inner spiritual purity go hand in hand in daily life."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6446)",
        arabic: "لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ، وَلَكِنَّ الْغِنَى غِنَى النَّفْسِ",
        translation: "Riches do not mean having a great amount of property, but riches is the contentment of the soul.",
        reflection: "True wealth is found in an inner state of contentment rather than material accumulation."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Ali 'Imran (3:133)",
        arabic: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ",
        translation: "And hasten to forgiveness from your Lord and a garden as wide as the heavens and earth.",
        reflection: "Let divine forgiveness be the ultimate goal you actively race toward every day."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2593)",
        arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الْأَمْرِ كُلِّهِ",
        translation: "Indeed, Allah is gentle and loves gentleness in all matters.",
        reflection: "Infusing gentleness into your daily communications reflects divine character."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Baqarah (2:45)",
        arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
        translation: "And seek help through patience and prayer.",
        reflection: "When pressure builds up, anchor yourself through deliberate patience and turning to prayer."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2565)",
        arabic: "مَنْ لَا يَرْحَمُ النَّاسَ لَا يَرْحَمُهُ اللَّهُ",
        translation: "Whoever does not show mercy to people, Allah will not show mercy to him.",
        reflection: "Empathy and compassion toward fellow human beings unlock heavenly mercy."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2699)",
        arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
        translation: "Whoever takes a path upon which he seeks knowledge, Allah makes a path to Paradise easy for him.",
        reflection: "Every moment spent learning beneficial knowledge brings you closer to eternal peace."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Ma'idah (5:32)",
        arabic: "وَمَنْ أَحْيَاهَا فَكَأَنَّما أَحْيَا النَّاسَ جَمِيعًا",
        translation: "And whoever saves one - it is as if he had saved mankind entirely.",
        reflection: "A single act of saving or uplifting a life carries monumental cosmic significance."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (33)",
        arabic: "آيَةُ الْمُنَافِقِ ثَلَاثٌ: إِذَا حَدَّثَ كَذَبَ، وَإِذَا وَعَدَ أَخْلَفَ، وَإِذَا اوْتُمِنَ خَانَ",
        translation: "The signs of a hypocrite are three: when he speaks he lies, when he makes a promise he breaks it, and when he is trusted he betrays.",
        reflection: "Integrity, honesty, and trustworthiness are non-negotiable pillars of true character."
    },
    {
        type: "Sahih Hadith",
        ref: "Sunan al-Tirmidhi (1639)",
        arabic: "عَيْنَانِ لَا تَمَسُّهُمَا النَّارُ: عَيْنٌ بَكَتْ مِنْ خَشْيَةِ اللَّهِ، وَعَيْنٌ بَاتتْ تَحْرُسُ فِي سَبِيلِ اللَّهِ",
        translation: "Two eyes will not be touched by the Fire: an eye that wept out of fear of Allah, and an eye that spent the night guarding in the cause of Allah.",
        reflection: "Sincere reverence and protecting others leave an everlasting spiritual mark."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Insan (76:9)",
        arabic: "إِنَّمَا نُطْعِمُكُمْ لِوَجْهِ اللَّهِ لَا نُرِيدُ مِنْكُمْ جَزَاءً وَلَا شُكُورًا",
        translation: "[Saying], 'We feed you only for the countenance of Allah. We wish not from you reward or gratitude.'",
        reflection: "True altruism seeks validation from the Creator alone, expecting no worldly praise."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6039)",
        arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ",
        translation: "Whoever believes in Allah and the Last Day, let him honor his guest.",
        reflection: "Hospitality and warm generosity are hallmarks of an elevated, noble heart."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Baqarah (2:153)",
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        translation: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
        reflection: "Knowing that God stands closely beside the patient gives absolute peace in hardship."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih Muslim (2553)",
        arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى أَجْسَادِكُمْ وَلَا إِلَى صُوَرِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ",
        translation: "Indeed, Allah does not look at your bodies or your forms, but He looks at your hearts.",
        reflection: "Cleanse your inner intentions; spiritual beauty far outweighs outward appearances."
    },
    {
        type: "Quranic Verse",
        ref: "Surah At-Talaq (65:3)",
        arabic: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
        translation: "And will provide for him from where he does not expect. And whoever relies upon Allah - then He is sufficient for him.",
        reflection: "Trusting completely in divine provision removes anxiety over unpredictable futures."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6509)",
        arabic: "اغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ: شَبَابَكَ قَبْلَ هَرَمِكَ، وَصِحَّتَكَ قَبْلَ سَقَمِكَ",
        translation: "Take advantage of five before five: your youth before your old age, your health before your sickness...",
        reflection: "Urgency in doing good while you possess health and capability is true wisdom."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Ali 'Imran (3:134)",
        arabic: "وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ",
        translation: "Who restrain anger and who pardon the people - and Allah loves the doers of good.",
        reflection: "Forgiving others when you have the power to retaliate is a supreme act of grace."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (5673)",
        arabic: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ... إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
        translation: "No fatigue, disease, sorrow, sadness, hurt, or distress befalls a Muslim... except that Allah expiates some of his sins for it.",
        reflection: "Even minor discomforts carry a hidden cleansing mechanism for your spiritual record."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Anfal (8:2)",
        arabic: "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ",
        translation: "The believers are only those who, when Allah is mentioned, their hearts feel a fearful reverence.",
        reflection: "A sensitive, responsive heart to reminders is a clear sign of living faith."
    },
    {
        type: "Sahih Hadith",
        ref: "Sahih al-Bukhari (6475)",
        arabic: "سَبْعَةٌ يُظِلُّهُمُ اللَّهُ فِي ظِلِّهِ يَوْمَ لَا ظِلَّ إِلَّا ظِلُّهُ",
        translation: "There are seven whom Allah will shade on a Day when there is no shade except His...",
        reflection: "Striving for righteous character earns you divine shelter when everything else fades."
    },
    {
        type: "Quranic Verse",
        ref: "Surah Al-Kahf (18:46)",
        arabic: "وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا",
        translation: "And the enduring good deeds are better to your Lord for r
