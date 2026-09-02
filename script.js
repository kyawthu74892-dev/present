const svg = document.getElementById("wheelSVG");

const spinButton = document.getElementById("spinButton");

const confettiContainer = document.getElementById("confettiContainer");

const pointer = document.getElementById("pointer");

const winnerPopup = document.getElementById("winnerPopup");

const winnerNumber = document.getElementById("winnerNumber");

const winnerName = document.getElementById("winnerName");

const idPrefix = document.getElementById("idPrefix");

const closePopup = document.getElementById("closePopup");

const balloonContainer = document.getElementById("balloonContainer");

const popupEffects = document.getElementById("popupEffects");

const readyPrompt = document.getElementById("readyPrompt");

const tabPrompt = document.getElementById("tabPrompt");

const curtainContainer = document.getElementById("curtainContainer");

const questionScreen = document.getElementById("questionScreen");

const spotlight = document.getElementById("spotlight");

const questionTitle = document.getElementById("questionTitle");

const questionText = document.getElementById("questionText");

const questionNumber = document.getElementById("questionNumber");

const consoleButton = document.getElementById("consoleButton");

const presenterConsole = document.getElementById("presenterConsole");

const closeConsole = document.getElementById("closeConsole");

const consoleOverlay = document.getElementById("consoleOverlay");

const consoleRound = document.getElementById("consoleRound");

const consoleAudienceLeft = document.getElementById("consoleAudienceLeft");

const musicToggle = document.getElementById("musicToggle");

const effectsToggle = document.getElementById("effectsToggle");

const voiceToggle = document.getElementById("voiceToggle");

const idleToggle = document.getElementById("idleToggle");

const continueButton = document.getElementById("continueButton");

const finaleScreen = document.getElementById("finaleScreen");

const completionScene = document.getElementById("completionScene");

const participantCards = document.getElementById("participantCards");

const finalePrompt =
    document.querySelector(".finalePrompt");

const finaleActions =
    document.querySelector(".finaleActions");

const finaleWheelButton = document.getElementById("finaleWheelButton");

const finalQuestionButton = document.getElementById("finalQuestionButton");

const finalQuestionScene = document.getElementById("finalQuestionScene");

const everyoneMessage = document.getElementById("everyoneMessage");

const finalQuestionBlock = document.getElementById("finalQuestionBlock");

const revealAnswerButton = document.getElementById("revealAnswerButton");

const presentationLinkNotice = document.getElementById("presentationLinkNotice");

const audioToast =
    document.getElementById("audioToast");

const audioToastIcon =
    document.getElementById(
        "audioToastIcon"
    );

const audioToastText =
    document.getElementById(
        "audioToastText"
    );

const entryScreen =  document.getElementById("entryScreen");

const enterButton =  document.getElementById("enterButton");

const SIZE = 800;
const CENTER = SIZE / 2;
const RADIUS = 360;

const TOTAL = 60;
const SLICE = 360 / TOTAL;

let idleRotation = 0;
let spinRotation = 0;
let spinning = false;
let lastWinner = null;
let transitioning = false;
let winnerTimers = [];
const presentationSettings = {
  music: true,

  effects: true,

  voice: true,

  idleRotation: true,
};

let masterAudioMuted = false;

let audioToastTimer = null;

let savedAudioSettings = {

    music: presentationSettings.music,

    effects: presentationSettings.effects,

    voice: presentationSettings.voice

};

const audioManager = {
  music: null,

  sfx: {},

  voice: null,

  musicVolume: 0.25,

  effectsVolume: 0.7,

  voiceVolume: 1,
};

let musicFadeId = 0;

let musicStopTimer = null;

function loadBackgroundMusic(src) {
  const music = new Audio(src);

  music.loop = true;

  music.volume = 0;

  audioManager.music = music;
}

function fadeMusicTo(
    targetVolume,
    duration = 800
){

    const music =
        audioManager.music;

    if(!music){
        return;
    }

    const currentFadeId =
        ++musicFadeId;

    const safeTargetVolume =
        Math.max(
            0,
            Math.min(targetVolume, 1)
        );

    const safeDuration =
        Math.max(duration, 1);

    const startVolume =
        Math.max(
            0,
            Math.min(music.volume, 1)
        );

    const difference =
        safeTargetVolume - startVolume;

    const startTime =
        performance.now();


    function animateFade(now){

        if(currentFadeId !== musicFadeId){
            return;
        }

        const elapsed =
            Math.max(
                0,
                now - startTime
            );

        const progress =
            Math.max(
                0,
                Math.min(
                    elapsed / safeDuration,
                    1
                )
            );

        const nextVolume =
            startVolume +
            difference * progress;

        music.volume =
            Math.max(
                0,
                Math.min(nextVolume, 1)
            );

        if(progress < 1){

            requestAnimationFrame(
                animateFade
            );

        }

    }

    requestAnimationFrame(
        animateFade
    );

}

function startBackgroundMusic(){

    if(
        !presentationSettings.music ||
        !audioManager.music
    ){
        return;
    }

    if(musicStopTimer !== null){

        clearTimeout(
            musicStopTimer
        );

        musicStopTimer = null;

    }


    audioManager.music
        .play()
        .then(()=>{

            if(presentationSettings.music){

                fadeMusicTo(
                    audioManager.musicVolume,
                    1200
                );

            }

        })
        .catch(()=>{});

}

function stopBackgroundMusic(){

    if(!audioManager.music){
        return;
    }

    if(musicStopTimer !== null){

        clearTimeout(
            musicStopTimer
        );

    }


    fadeMusicTo(
        0,
        700
    );


    musicStopTimer =
        setTimeout(()=>{

            if(
                audioManager.music &&
                !presentationSettings.music
            ){

                musicFadeId++;

                audioManager.music.volume = 0;

                audioManager.music.pause();

            }

            musicStopTimer = null;

        },750);

}

function duckBackgroundMusic(volume = 0.1, duration = 600) {
  if (!presentationSettings.music || !audioManager.music) {
    return;
  }

  fadeMusicTo(volume, duration);
}

function restoreBackgroundMusic() {
  if (!presentationSettings.music || !audioManager.music) {
    return;
  }

  fadeMusicTo(
    audioManager.musicVolume,
    1400
);
}

function loadSFX(name, src){

    const sound =
        new Audio(src);

    sound.preload = "auto";

    audioManager.sfx[name] =
        sound;

}

function playSFX(
    name,
    playbackRate = 1,
    volumeScale = 1
){

    if(!presentationSettings.effects){
        return;
    }

    const sound =
        audioManager.sfx[name];

    if(!sound){
        return;
    }

    sound.pause();

    sound.currentTime = 0;

    sound.playbackRate =
        playbackRate;

    sound.volume =
        Math.min(
            audioManager.effectsVolume *
            volumeScale,
            1
        );

    sound.play().catch(()=>{});

  }

  function toggleMasterAudio() {

    if (!masterAudioMuted) {

        savedAudioSettings = {

            music: presentationSettings.music,

            effects: presentationSettings.effects,

            voice: presentationSettings.voice

        };

        masterAudioMuted = true;

        presentationSettings.music = false;
        presentationSettings.effects = false;
        presentationSettings.voice = false;

        musicToggle.checked = false;
        effectsToggle.checked = false;
        voiceToggle.checked = false;

        stopBackgroundMusic();

        Object.values(
            audioManager.sfx
        ).forEach(sound => {

            if (
                sound &&
                typeof sound.pause === "function"
            ) {

                sound.pause();
                sound.currentTime = 0;

            }

        });

        stopQuestionVoice({ restoreMusic: false });

        if ("speechSynthesis" in window) {

            window.speechSynthesis.cancel();

        }

    }

    else {

        masterAudioMuted = false;

        presentationSettings.music =
            savedAudioSettings.music;

        presentationSettings.effects =
            savedAudioSettings.effects;

        presentationSettings.voice =
            savedAudioSettings.voice;

        musicToggle.checked =
            presentationSettings.music;

        effectsToggle.checked =
            presentationSettings.effects;

        voiceToggle.checked =
            presentationSettings.voice;

        if (presentationSettings.music) {

            startBackgroundMusic();

        }

    }

    showAudioStatusToast(
      masterAudioMuted
    );

}

function showAudioStatusToast(isMuted) {

    if(
        !audioToast ||
        !audioToastIcon ||
        !audioToastText
    ){
        return;
    }

    if(audioToastTimer !== null){

        clearTimeout(
            audioToastTimer
        );

    }


    if(isMuted){

        audioToastText.textContent =
            "AUDIO MUTED";

        audioToastIcon.innerHTML = `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M11 5 6 9H2v6h4l5 4V5Z"
                ></path>

                <path
                    d="m22 9-6 6"
                ></path>

                <path
                    d="m16 9 6 6"
                ></path>
            </svg>
        `;

    }

    else{

        audioToastText.textContent =
            "AUDIO UNMUTED";

        audioToastIcon.innerHTML = `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M11 5 6 9H2v6h4l5 4V5Z"
                ></path>

                <path
                    d="M15.54 8.46a5 5 0 0 1 0 7.07"
                ></path>

                <path
                    d="M19.07 4.93a10 10 0 0 1 0 14.14"
                ></path>
            </svg>
        `;

    }


    audioToast.classList.add(
        "showAudioToast"
    );


    audioToastTimer =
        setTimeout(()=>{

            audioToast.classList.remove(
                "showAudioToast"
            );

            audioToastTimer = null;

        },1800);

}

  let wheelAudioContext = null;

let lastWheelTickTime = 0;


function playWheelTick(progress){

    if(!presentationSettings.effects){
        return;
    }

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if(!AudioContextClass){
        return;
    }

    if(!wheelAudioContext){

        wheelAudioContext =
            new AudioContextClass();

    }

    if(
        wheelAudioContext.state ===
        "suspended"
    ){

        wheelAudioContext.resume();

    }

    const now =
        wheelAudioContext.currentTime;

    if(
        now - lastWheelTickTime <
        .028
    ){
        return;
    }

    lastWheelTickTime = now;

    const oscillator =
        wheelAudioContext.createOscillator();

    const gain =
        wheelAudioContext.createGain();

    oscillator.type = "triangle";

    oscillator.frequency.setValueAtTime(
        760 - progress * 180,
        now
    );

    gain.gain.setValueAtTime(
        .0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
    .13 *
    audioManager.effectsVolume,
    now + .002
);

gain.gain.exponentialRampToValueAtTime(
    .0001,
    now + .05
);

    oscillator.connect(gain);

    gain.connect(
        wheelAudioContext.destination
    );

    oscillator.start(now);

    oscillator.stop(
        now + .06
    );

}

const presenterNumbers = [3, 5, 8, 33, 45];
const absentNumbers = [21, 30, 38];

const forbiddenNumbers = [...presenterNumbers, ...absentNumbers];

const askedNumbers = [];

const sliceData = [];

const students = {
  1: "Ma Hsu Lae Lae Hnin",
  2: "Mg Kaung Khant Ko Ko",
  4: "Mg Khant Thuta",
  6: "Ma Shoon Lae Lin Thu",
  7: "Ma Kyoe Kyar",
  9: "Mg Aye Min Zaw",
  10: "Mg Bhone Pyae Khaing",
  11: "Mg Khant Nadi Hein",
  12: "Ma April Ye Naing",
  13: "Mg Hlaing Win Htun",
  14: "Mg Min Thwin Hmu",
  15: "Ma Chaw Su Su Hlaing",
  16: "Ma Ei Shwe Sin Chaw",
  17: "Mg Myat Khant Ko",
  18: "Ma Khin Nwe Nwe Htun",
  19: "Ma A Me Me Khant",
  20: "Ma Aye Thandar Aung",
  22: "Mg La Min Thant",
  23: "Mg Han Thar San",
  24: "Ma Hsu Myat Nwe",
  25: "Mg Khant Thurein Htet",
  26: "Mg Htet Kaung Myint Myat",
  27: "Ma Phoo Myat Naychi",
  28: "Ma Thae Nandar Su",
  29: "Ma Akari Khin",
  31: "Mg Hein Htet Soe",
  32: "Mg Kaung Set Hein",
  34: "Mg Aung Hein Khant",
  35: "Mg Han Zaw",
  36: "Mg Lin Lett Hein",
  37: "Mg Thet Htoo Nyi",
  39: "Ma Ei Ei Chit Min",
  40: "Mg Swel Sone Htoo Maw",
  41: "Ma Aye Nyein Zun",
  42: "Ma Ingyin Mhwe",
  43: "Mg Khant Naing",
  44: "Ma Toe Pyae Paing",
  46: "Ma Aye Thaddhar",
  47: "Ma Kyal Sin Thoon",
  48: "Mg Loon Khaung",
  49: "Mg Shin Thant Min",
  50: "Mg Arkar Kyaw",
  51: "Ma Hnin Hsu Htoo",
  52: "Mg Khant Zin Hein",
  53: "Ma Yin Sandi Tint",
  54: "Mg Hein Chan Zaw",
  55: "Ma Aye Yadanar Oo",
  56: "Ma May Thaw Tar Oo",
  57: "Mg Min Khant Yan Naing",
  58: "Ma Phyo Thiri Kyaw",
  59: "Mg Arkar Min Maung",
  60: "Ma Hnin Akary Tun",
};

const questions = [
  "Should students be allowed to use AI freely for university assignments if AI will also be used in their future workplaces?",

  "If an employee/student secretly uses AI to perform most of their work but still gets excellent results, is that dishonest or efficient?",

  "If everyone uses AI during job interviews or exams, how should we measure a person’s real ability?",

  "Do you think people will become more creative because AI handles routine work, or less creative because AI can generate ideas for them?",

  "What should we worry more about: AI becoming too intelligent, or humans becoming too dependent on it?"
];

const questionAudioMap = new Map([
  [questions[0], "audio/voice/question-1.mp3"],
  [questions[1], "audio/voice/question-2.mp3"],
  [questions[2], "audio/voice/question-3.mp3"],
  [questions[3], "audio/voice/question-4.mp3"],
  [questions[4], "audio/voice/question-5.mp3"],
]);

let usedQuestions = [];

let questionCount = 0;

let revealTimers = [];

let isTyping = false;

let currentQuestion = "";

let questionWordsFinished = false;
let questionVoiceFinished = true;
let questionVoiceToken = 0;

let sessionComplete = false;

let finaleControlsRevealed = false;

let finaleTimers = [];

const wheelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

wheelGroup.setAttribute("id", "wheelGroup");

svg.appendChild(wheelGroup);

for (let i = 0; i < TOTAL; i++) {
  const number = i + 1;

  const start = i * SLICE - 90;
  const end = (i + 1) * SLICE - 90;
  const middle = (start + end) / 2;

  sliceData[number] = middle;

  const x1 = CENTER + RADIUS * Math.cos((start * Math.PI) / 180);
  const y1 = CENTER + RADIUS * Math.sin((start * Math.PI) / 180);

  const x2 = CENTER + RADIUS * Math.cos((end * Math.PI) / 180);
  const y2 = CENTER + RADIUS * Math.sin((end * Math.PI) / 180);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  path.setAttribute("id", `slice-${number}`);

  path.setAttribute(
    "d",
    `
        M ${CENTER} ${CENTER}
        L ${x1} ${y1}
        A ${RADIUS} ${RADIUS}
        0 0 1
        ${x2} ${y2}
        Z
        `,
  );

  let color;

  if (presenterNumbers.includes(number)) color = "#FFD700";
  else if (absentNumbers.includes(number)) color = "#E63946";
  else color = i % 2 === 0 ? "#2F56D3" : "#5941C9";
  path.setAttribute("fill", color);
  path.setAttribute("stroke", "white");
  path.setAttribute("stroke-width", "1");

  wheelGroup.appendChild(path);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

  text.setAttribute("id", `text-${number}`);

  const textRadius = 300;

  const tx = CENTER + textRadius * Math.cos((middle * Math.PI) / 180);

  const ty = CENTER + textRadius * Math.sin((middle * Math.PI) / 180);

  text.setAttribute("x", tx);
  text.setAttribute("y", ty);

  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("font-size", "18");
  text.setAttribute("font-weight", "700");

  if (presenterNumbers.includes(number)) text.setAttribute("fill", "#111");
  else text.setAttribute("fill", "white");

  text.setAttribute("transform", `rotate(${middle + 90}, ${tx}, ${ty})`);

  text.textContent = number;

  wheelGroup.appendChild(text);
}

function updateWheel() {
  const displayRotation = idleRotation + spinRotation;

  wheelGroup.setAttribute(
    "transform",
    `rotate(${displayRotation} ${CENTER} ${CENTER})`,
  );
}

function idleSpin() {
  if (!spinning && presentationSettings.idleRotation) {
    idleRotation -= 0.08;

    if (idleRotation >= 360) idleRotation -= 360;

    updateWheel();
  }

  requestAnimationFrame(idleSpin);
}

idleSpin();

function getAvailableNumbers() {
  return Array.from({ length: TOTAL }, (_, i) => i + 1).filter((number) => {
    return !forbiddenNumbers.includes(number) && !askedNumbers.includes(number);
  });
}

function getRandomQuestion() {
  if (usedQuestions.length === questions.length) {
    usedQuestions = [];
  }

  let available = questions.filter((q) => !usedQuestions.includes(q));

  let selected = available[Math.floor(Math.random() * available.length)];

  usedQuestions.push(selected);

  return selected;
}

function maybeShowContinueButton() {
  if (
    questionWordsFinished &&
    questionVoiceFinished &&
    !questionScreen.classList.contains("hiddenQuestion")
  ) {
    continueButton.classList.add("showContinue");
  }
}

function stopQuestionVoice({ restoreMusic = true } = {}) {
  questionVoiceToken++;

  const voice = audioManager.voice;

  if (voice && typeof voice.pause === "function") {
    voice.onended = null;
    voice.onerror = null;
    voice.pause();
    voice.currentTime = 0;
  }

  audioManager.voice = null;
  questionVoiceFinished = true;

  if (
    restoreMusic &&
    presentationSettings.music &&
    !masterAudioMuted
  ) {
    restoreBackgroundMusic();
  }

  maybeShowContinueButton();
}

function playQuestionVoice(question) {
  const src = questionAudioMap.get(question);

  if (
    !src ||
    !presentationSettings.voice ||
    masterAudioMuted
  ) {
    questionVoiceFinished = true;
    maybeShowContinueButton();
    return;
  }

  stopQuestionVoice({ restoreMusic: false });
  questionVoiceFinished = false;

  const token = ++questionVoiceToken;
  const voice = new Audio(src);
  let settled = false;

  voice.preload = "auto";
  voice.volume = audioManager.voiceVolume;
  audioManager.voice = voice;

  const finishVoice = () => {
    if (settled || token !== questionVoiceToken) {
      return;
    }

    settled = true;

    if (audioManager.voice === voice) {
      audioManager.voice = null;
    }

    questionVoiceFinished = true;

    if (
      presentationSettings.music &&
      !masterAudioMuted
    ) {
      restoreBackgroundMusic();
    }

    maybeShowContinueButton();
  };

  voice.onended = finishVoice;
  voice.onerror = finishVoice;

  voice.play().catch(finishVoice);
}

function revealQuestionWords(element, text) {
  revealTimers.forEach((timer) => clearTimeout(timer));
  revealTimers = [];

  isTyping = true;
  questionWordsFinished = false;
  element.innerHTML = "";

  const words = text.split(" ");

  words.forEach((word, index) => {
    const wordSpan = document.createElement("span");

    wordSpan.className = "questionWord";

    wordSpan.textContent = word;

    element.appendChild(wordSpan);

    const timer = setTimeout(() => {
      wordSpan.classList.add("showWord");

      if (index === words.length - 1) {
        setTimeout(() => {
          isTyping = false;
          questionWordsFinished = true;
          maybeShowContinueButton();
        }, 2000);
      }
    }, index * 140);

    revealTimers.push(timer);
  });
}

function prepareQuestionScene() {

    if (questionCount >= questions.length) {
        return;
    }

    questionCount++;

    currentQuestion =
        getRandomQuestion();

    questionWordsFinished = false;
    questionVoiceFinished = !presentationSettings.voice;

    questionTitle.firstChild.nodeValue =
        "QUESTION ";

    questionNumber.textContent =
        " " + questionCount;

    continueButton.textContent =
        "CONTINUE";

    updateConsoleStatus();

    questionText.innerHTML = "";

    questionScreen.classList.remove(
        "hiddenQuestion"
    );

    spotlight.style.opacity = "0";

    questionTitle.classList.remove(
        "showQuestionTitle",
        "hideQuestionTitle",
        "questionLand",
        "drawLine"
    );

    questionTitle.style.opacity = "";
    questionTitle.style.visibility = "";
    questionTitle.style.transform = "";

    continueButton.classList.remove(
        "showContinue"
    );

    continueButton.disabled = false;

}

function revealQuestionScene() {
  setTimeout(() => {
    spotlight.style.opacity = "1";
  }, 300);

  setTimeout(() => {
    questionTitle.classList.add("showQuestionTitle");

    setTimeout(() => {
      questionTitle.classList.add("drawLine");
    }, 700);
  }, 1100);

  setTimeout(() => {
    if (
      presentationSettings.voice &&
      !masterAudioMuted &&
      questionAudioMap.has(currentQuestion)
    ) {
      duckBackgroundMusic(0, 350);
    }
  }, 2050);

  setTimeout(() => {
    questionText.style.opacity = "1";

    questionText.style.transform = "translateY(0)";

    revealQuestionWords(questionText, currentQuestion);
    playQuestionVoice(currentQuestion);
  }, 2500);
}

function clearFinaleTimers() {
  finaleTimers.forEach((timer) => {
    clearTimeout(timer);
  });

  finaleTimers = [];
}

function scheduleFinale(callback, delay) {
  const timer = setTimeout(callback, delay);

  finaleTimers.push(timer);

  return timer;
}

function populateParticipantCards() {
  participantCards.innerHTML = "";

  askedNumbers.slice(0, questions.length).forEach((number, index) => {
    const card = document.createElement("article");

    card.className = "participantCard";

    card.style.setProperty(
      "--participant-delay",
      `${5.8 + index * 0.55}s`,
    );

    const questionLabel = document.createElement("span");
    questionLabel.className = "participantQuestion";
    questionLabel.textContent = `QUESTION ${index + 1}`;

    const participantNumber = document.createElement("strong");
    participantNumber.className = "participantNumber";
    participantNumber.textContent =
    `2025-MIIT-ECE-${String(number).padStart(3, "0")}`;

    const participantName = document.createElement("span");
    participantName.className = "participantName";
    participantName.textContent = students[number] || "Audience Member";
    participantName.title = participantName.textContent;

    card.append(
      questionLabel,
      participantNumber,
      participantName,
    );

    participantCards.appendChild(card);
  });
}

function resetFinalQuestionScene() {
  everyoneMessage.classList.remove(
    "showEveryoneMessage",
    "leaveEveryoneMessage",
  );

  finalQuestionBlock.classList.remove("showFinalQuestion");

  revealAnswerButton.classList.remove(
    "showRevealButton",
    "presentationLinkMissing",
  );

  revealAnswerButton.disabled = false;

  presentationLinkNotice.textContent = "";
  presentationLinkNotice.classList.remove("showPresentationNotice");
}

function prepareFinaleSummary() {
  populateParticipantCards();
  resetFinalQuestionScene();

  finaleControlsRevealed = false;

finalePrompt.classList.remove(
    "showFinalePrompt"
);

finaleActions.classList.remove(
    "showFinaleActions"
);

  finaleScreen.classList.remove("finaleHidden");
  finaleScreen.setAttribute("aria-hidden", "false");

  document.body.classList.add("finaleActive");

  finalQuestionScene.classList.remove("finaleSceneVisible");
  finalQuestionScene.classList.add("finaleSceneHidden");

  completionScene.classList.remove("finaleSceneVisible");
  completionScene.classList.add("finaleSceneHidden");

  finaleWheelButton.disabled = true;
  finalQuestionButton.disabled = true;
}

function revealFinaleSummary() {
  completionScene.classList.remove("finaleSceneVisible");
  completionScene.classList.add("finaleSceneHidden");

  void completionScene.offsetWidth;

  completionScene.classList.remove("finaleSceneHidden");
  completionScene.classList.add("finaleSceneVisible");
}

function revealFinaleControls() {

    if (
        finaleControlsRevealed ||
        !completionScene.classList.contains(
            "finaleSceneVisible"
        )
    ) {
        return;
    }

    finaleControlsRevealed = true;

    finalePrompt.classList.add(
        "showFinalePrompt"
    );

    scheduleFinale(() => {

        finaleActions.classList.add(
            "showFinaleActions"
        );

        finaleWheelButton.disabled = false;
        finalQuestionButton.disabled = false;

    }, 1200);

}

function resetQuestionSceneAfterExit() {
  questionScreen.classList.add("hiddenQuestion");

  continueButton.classList.remove(
    "showContinue",
    "exitUp",
    "continueDisabled",
  );

  continueButton.disabled = false;
  continueButton.style.opacity = "";
  continueButton.style.transform = "";

  questionText.classList.remove("exitUp");
  questionText.innerHTML = "";
  questionText.style.opacity = "0";
  questionText.style.transform = "translateY(40px)";

  questionTitle.classList.remove(
    "showQuestionTitle",
    "hideQuestionTitle",
    "questionLand",
    "drawLine",
    "exitUp",
  );

  questionTitle.style.opacity = "";
  questionTitle.style.visibility = "";
  questionTitle.style.transform = "";
}

function showCompletionFinale() {
  if (transitioning || sessionComplete) {
    return;
  }

  transitioning = true;
  sessionComplete = true;

  clearFinaleTimers();

  continueButton.disabled = true;
  continueButton.classList.add("exitUp");

  scheduleFinale(() => {
    questionText.classList.add("exitUp");
  }, 250);

  scheduleFinale(() => {
    questionTitle.classList.add("exitUp");
  }, 500);

  spotlight.style.opacity = "0";

  scheduleFinale(() => {
    duckBackgroundMusic(0.13, 1200);

    playSFX("curtain", 1.54, 0.55);
    curtainContainer.classList.add("close");
  }, 1250);

  scheduleFinale(() => {
    resetQuestionSceneAfterExit();

    spinButton.textContent = "FINAL";
    spinButton.disabled = false;
    spinButton.setAttribute("aria-label", "Return to the ending");

    prepareFinaleSummary();
  }, 3400);

  scheduleFinale(() => {
    playSFX("curtain", 1.54, 0.55);
    curtainContainer.classList.remove("close");
  }, 3900);

  scheduleFinale(() => {
    revealFinaleSummary();
  }, 6500);

  scheduleFinale(() => {
    transitioning = false;
  }, 15600);
}

function returnFromFinaleToWheel() {
  if (transitioning) {
    return;
  }

  transitioning = true;
  clearFinaleTimers();

  finaleWheelButton.disabled = true;
  finalQuestionButton.disabled = true;

  playSFX("curtain", 1.54, 0.55);
  curtainContainer.classList.add("close");

  scheduleFinale(() => {
    completionScene.classList.remove("finaleSceneVisible");
    completionScene.classList.add("finaleSceneHidden");

    finaleScreen.classList.add("finaleHidden");
    finaleScreen.setAttribute("aria-hidden", "true");

    document.body.classList.remove("finaleActive");

    pointer.style.opacity = "1";
    spinButton.disabled = false;
    spinButton.classList.add("glowButton");
  }, 2200);

  scheduleFinale(() => {
    playSFX("curtain", 1.54, 0.55);
    curtainContainer.classList.remove("close");
    restoreBackgroundMusic();
  }, 3000);

  scheduleFinale(() => {
    transitioning = false;
  }, 5200);
}

function openFinaleFromWheel() {
  if (transitioning || !sessionComplete) {
    return;
  }

  transitioning = true;
  clearFinaleTimers();

  playSFX("curtain", 1.54, 0.55);
  curtainContainer.classList.add("close");

  scheduleFinale(() => {
    prepareFinaleSummary();
  }, 2200);

  scheduleFinale(() => {
    playSFX("curtain", 1.54, 0.55);
    curtainContainer.classList.remove("close");
  }, 3000);

  scheduleFinale(() => {
    revealFinaleSummary();
  }, 5600);

  scheduleFinale(() => {
    transitioning = false;
  }, 14600);
}

function startFinalQuestionSequence() {
  if (transitioning) {
    return;
  }

  transitioning = true;
  clearFinaleTimers();

  finaleWheelButton.disabled = true;
  finalQuestionButton.disabled = true;

  playSFX("curtain", 1.54, 0.55);
  curtainContainer.classList.add("close");

  scheduleFinale(() => {
    fadeMusicTo(0, 1200);

    completionScene.classList.remove("finaleSceneVisible");
    completionScene.classList.add("finaleSceneHidden");

    resetFinalQuestionScene();

    finalQuestionScene.classList.remove("finaleSceneHidden");
    finalQuestionScene.classList.add("finaleSceneVisible");
  }, 2200);

  scheduleFinale(() => {
    playSFX("curtain", 1.54, 0.55);
    curtainContainer.classList.remove("close");
  }, 3000);

  scheduleFinale(() => {
    everyoneMessage.classList.add("showEveryoneMessage");
  }, 5800);

  scheduleFinale(() => {
    everyoneMessage.classList.remove("showEveryoneMessage");
    everyoneMessage.classList.add("leaveEveryoneMessage");
  }, 9950);

  scheduleFinale(() => {
    finalQuestionBlock.classList.add("showFinalQuestion");
  }, 11850);

  scheduleFinale(() => {
    revealAnswerButton.classList.add("showRevealButton");
    transitioning = false;
  }, 16900);
}

function revealPresentation() {
  if (transitioning) {
    return;
  }

  const presentationUrl =
    revealAnswerButton.dataset.presentationUrl.trim();

  if (!presentationUrl) {
    presentationLinkNotice.textContent =
      "Presentation link will be connected after the PowerPoint is ready.";

    presentationLinkNotice.classList.add("showPresentationNotice");

    revealAnswerButton.classList.remove("presentationLinkMissing");
    void revealAnswerButton.offsetWidth;
    revealAnswerButton.classList.add("presentationLinkMissing");

    return;
  }

  transitioning = true;
  revealAnswerButton.disabled = true;

  playSFX("curtain", 1.54, 0.55);
  curtainContainer.classList.add("close");

  scheduleFinale(() => {
    window.location.href = presentationUrl;
  }, 2200);
}

const fixedAudienceSequence = [
    35,
    13,
    31,
    54
];

const specialRandomPool = [
    6,
    17,
    23,
    26,
    32,
    36,
    41,
    42,
    44,
    50,
    52,
    57,
    58
];

function chooseAudience() {

    const available = getAvailableNumbers();

    if (available.length === 0) {

        alert("Everyone has been selected!");

        return null;

    }

    const selectionIndex = askedNumbers.length;

    let chosen;

    if (selectionIndex < fixedAudienceSequence.length) {

        const fixedNumber =
            fixedAudienceSequence[selectionIndex];

        if (available.includes(fixedNumber)) {

            chosen = fixedNumber;

        } else {

            chosen =
                available[
                    Math.floor(
                        Math.random() * available.length
                    )
                ];

        }

    }

    else {

        const availableSpecialNumbers =
            specialRandomPool.filter(number =>
                available.includes(number)
            );

        if (availableSpecialNumbers.length > 0) {

            chosen =
                availableSpecialNumbers[
                    Math.floor(
                        Math.random() *
                        availableSpecialNumbers.length
                    )
                ];

        }

        else {

            chosen =
                available[
                    Math.floor(
                        Math.random() * available.length
                    )
                ];

        }

    }

    askedNumbers.push(chosen);

    updateConsoleStatus();

    return chosen;

}

function launchConfetti() {
  const colors = [
    "#FFD700",
    "#FF4D6D",
    "#4CAF50",
    "#00BFFF",
    "#FFFFFF",
    "#FF9800",
  ];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("div");

    piece.className = "confetti";

    piece.style.left = Math.random() * window.innerWidth + "px";

    piece.style.top = "-20px";

    piece.style.background = colors[Math.floor(Math.random() * colors.length)];

    piece.style.animationDelay = Math.random() * 0.4 + "s";

    confettiContainer.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 3000);
  }
}

function launchBalloons() {
  const colors = ["#ff4d6d", "#ffd93d", "#6bcB77", "#4d96ff", "#b983ff"];

  for (let i = 0; i < 18; i++) {
    const balloon = document.createElement("div");

    balloon.className = "balloon";

    balloon.style.left = Math.random() * 100 + "vw";

    balloon.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    balloon.style.animationDelay = Math.random() * 0.8 + "s";

    balloonContainer.appendChild(balloon);

    setTimeout(() => {
      balloon.remove();
    }, 5500);
  }
}

function launchSparkles() {
  for (let i = 0; i < 15; i++) {
    const sparkle = document.createElement("div");

    sparkle.className = "sparkle";

    sparkle.style.left = Math.random() * 100 + "%";

    sparkle.style.top = Math.random() * 100 + "%";

    sparkle.style.animationDelay = Math.random() * 0.5 + "s";

    popupEffects.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 1600);
  }
}

function showWinner(number) {

      if (questionCount >= questions.length) {

        tabPrompt.innerHTML =
            'PRESS <span id="tabKey">TAB</span> TO CONTINUE';

    } else {

        tabPrompt.innerHTML =
            'PRESS <span id="tabKey">TAB</span> TO START QUESTION';

    }
  pointer.style.opacity = "0";

  winnerNumber.textContent = number;

  const selectedName = students[number] || "Unknown";

  winnerName.textContent = selectedName;

  idPrefix.style.opacity = "0";

  winnerName.classList.remove("showName");
  winnerName.classList.add("hiddenInfo");

  idPrefix.textContent = "";

  const selectedSlice = document.getElementById(`slice-${number}`);

  selectedSlice.setAttribute("fill", "#00E5FF");

  selectedSlice.setAttribute("stroke", "#B2F7FF");

  selectedSlice.setAttribute("stroke-width", "4");

  selectedSlice.classList.remove("winnerPulse");

  void selectedSlice.getBBox();

  selectedSlice.classList.add("winnerPulse");

  winnerNumber.style.transition = "none";
  winnerNumber.style.left = "50%";
  winnerNumber.style.fontSize = "55px";

  const popupTimer = setTimeout(() => {
    winnerPopup.classList.remove("hidden");

    restoreBackgroundMusic();

    const identityTimer = setTimeout(() => {
      animateIdentity(number);
    }, 500);

    winnerTimers.push(identityTimer);
  }, 900);

  winnerTimers.push(popupTimer);

  const selectedText = document.getElementById(`text-${number}`);

  if (selectedText) {
    selectedText.setAttribute("fill", "#DDDDDD");
  }

  lastWinner = number;
}

function clearWinnerTimers() {
  winnerTimers.forEach((timer) => {
    clearTimeout(timer);
  });

  winnerTimers = [];
}

function revealWinnerName() {
  winnerName.classList.remove("hiddenInfo");

  requestAnimationFrame(() => {
    winnerName.classList.add("showName");
  });
}

function spinToNumber(number) {
  spinning = true;

  spinButton.disabled = true;

  spinButton.classList.remove("glowButton");

  duckBackgroundMusic(
    0,
    700
);

  const targetAngle = sliceData[number];

  const startRotation = idleRotation + spinRotation;

  let finalRotation = -(targetAngle + 90);

  while (finalRotation <= startRotation) {
    finalRotation += 360;
  }

  finalRotation += 360 * 8;

  const duration = 10000;

  const startTime = performance.now();

let lastTickSlice =
    Math.floor(
        startRotation / SLICE
    );

function animate(now) {
    const elapsed = now - startTime;

    const t = Math.min(elapsed / duration, 1);

    let ease;

    if (t < 0.2) {
      ease = 0.5 * Math.pow(t / 0.2, 2) * 0.2;
    } else {
      const slow = (t - 0.2) / 0.8;

      ease = 0.2 + (1 - Math.pow(1 - slow, 3)) * 0.8;
    }

    spinRotation =
      startRotation - idleRotation + (finalRotation - startRotation) * ease;

    updateWheel();

const currentWheelRotation =
    idleRotation + spinRotation;

const currentTickSlice =
    Math.floor(
        currentWheelRotation / SLICE
    );

if(
    currentTickSlice !==
    lastTickSlice
){

    playWheelTick(t);

    lastTickSlice =
        currentTickSlice;

}

if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinRotation %= 360;

      updateWheel();

      spinning = false;

      spinButton.disabled = false;

      setTimeout(() => {
        showWinner(number);
      }, 350);
    }
  }

  requestAnimationFrame(animate);
}

spinButton.addEventListener("click", () => {
  if (spinning) return;

  if (sessionComplete) {
    openFinaleFromWheel();

    return;
  }

  const selected = chooseAudience();

  if (selected === null) return;

  spinToNumber(selected);
});

closePopup.addEventListener("click", () => {
  winnerPopup.classList.add("hidden");

  idPrefix.style.opacity = "0";

  winnerName.classList.add("hiddenInfo");

  const selectedSlice = document.getElementById(`slice-${lastWinner}`);

  if (selectedSlice) {
    selectedSlice.setAttribute("fill", "#777");

    selectedSlice.setAttribute("stroke", "rgba(255,255,255,0.35)");

    selectedSlice.setAttribute("stroke-width", "1");
  }

  pointer.style.opacity = "1";

  spinButton.classList.add("glowButton");

  readyPrompt.classList.remove("showPrompt");

  tabPrompt.classList.remove("showPrompt");

  readyPrompt.classList.remove("showReady");
});

const header = document.querySelector("header");

const wheel = document.querySelector(".wheel-wrapper");

const subtitle = document.getElementById("subtitle");

const subtitleText = "Choose an Audience Member to ask a Question.";

function typeSubtitle() {
  subtitle.textContent = "";

  let index = 0;

  const typing = setInterval(() => {
    subtitle.textContent += subtitleText[index];

    index++;

    if (index >= subtitleText.length) {
      clearInterval(typing);
    }
  }, 140);
}

function startIntroSequence() {
  setTimeout(() => {
    header.classList.add("showHeader");
  }, 700);

  setTimeout(() => {
    wheel.classList.add("showWheel");
  }, 1700);

  setTimeout(() => {
    pointer.classList.add("showPointer");
  }, 3300);

  setTimeout(() => {
    typeSubtitle();
  }, 4200);

  setTimeout(() => {
    spinButton.classList.add("glowButton");
  }, 6200);
}

enterButton.addEventListener(
    "click",
    () => {

        if(enterButton.disabled){
            return;
        }

        enterButton.disabled = true;

        enterButton.classList.add(
            "enterActivated"
        );

        if(presentationSettings.music){

            startBackgroundMusic();

        }

        playSFX(
            "curtain",
            1.1,
            .55
        );

        curtainContainer.classList.add(
            "introCurtain",
            "close"
        );

        /*
        The curtain is fully closed.
        Hide the credits behind it.
        */

        setTimeout(()=>{

            entryScreen.style.display =
                "none";

        },2900);

        setTimeout(()=>{

            playSFX(
                "curtain",
                1.1,
                .55
            );

            curtainContainer.classList.remove(
                "close"
            );

        },4100);

        setTimeout(()=>{

            curtainContainer.classList.remove(
                "introCurtain"
            );

        },7000);

        setTimeout(()=>{

      restoreBackgroundMusic();

      startIntroSequence();

  },7800);

    }
);

function animateIdentity(number) {
  winnerNumber.textContent = number;

  idPrefix.textContent = number < 10 ? "2025-MIIT-ECE-00" : "2025-MIIT-ECE-0";

  winnerNumber.style.transition = "none";

  winnerNumber.style.left = "50%";

  winnerNumber.style.fontSize = "70px";

  winnerNumber.style.fontWeight = "800";

  requestAnimationFrame(() => {
    winnerNumber.style.transition = "left .8s ease, font-size .8s ease";
  });

  idPrefix.style.opacity = "0";

  setTimeout(() => {
    winnerNumber.style.left = "73.5%";

    winnerNumber.style.fontSize = "28px";

    winnerNumber.style.opacity = "0.75";

    winnerNumber.style.fontWeight = "700";

    idPrefix.style.opacity = "1";
  }, 900);

  setTimeout(() => {
    winnerNumber.style.fontWeight = "600";

    winnerNumber.style.opacity = "1";
  }, 2800);

  setTimeout(() => {
    winnerName.classList.remove("hiddenInfo");

    requestAnimationFrame(() => {
      winnerName.classList.add("showName");
    });

    typeWinnerName(students[number] || "Unknown");
  }, 3300);
}

function typeWinnerName(name) {
  winnerName.textContent = "";

  let index = 0;

  function type() {
    if (index < name.length) {
      winnerName.textContent += name[index];

      index++;

      setTimeout(type, 170);
    } else {
      setTimeout(() => {
        readyPrompt.classList.add("showPrompt");
        readyPrompt.classList.add("showReady");
      }, 1200);

      setTimeout(() => {
        tabPrompt.classList.add("showPrompt");
      }, 3000);
    }
  }

  type();
}

function resetWinnerAfterQuestion() {
  winnerPopup.classList.add("hidden");

  idPrefix.style.opacity = "0";

  winnerName.classList.remove("showName");

  winnerName.classList.add("hiddenInfo");

  readyPrompt.classList.remove("showPrompt", "showReady");

  tabPrompt.classList.remove("showPrompt");

  if (lastWinner !== null) {
    const selectedSlice = document.getElementById(`slice-${lastWinner}`);

    const selectedText = document.getElementById(`text-${lastWinner}`);

    if (selectedSlice) {
      selectedSlice.setAttribute("fill", "#777");

      selectedSlice.setAttribute("stroke", "rgba(255,255,255,0.35)");

      selectedSlice.setAttribute("stroke-width", "1");
    }

    if (selectedText) {
      selectedText.setAttribute("fill", "#DDDDDD");
    }
  }
}

function openPresenterConsole(){

    presenterConsole.classList.remove(
        "consoleClosed"
    );

    consoleOverlay.classList.remove(
        "consoleHidden"
    );

}

function closePresenterConsole(){

    presenterConsole.classList.add(
        "consoleClosed"
    );

    consoleOverlay.classList.add(
        "consoleHidden"
    );

}

function togglePresenterConsole() {
  const consoleIsClosed = presenterConsole.classList.contains("consoleClosed");

  if (consoleIsClosed) {
    openPresenterConsole();
  } else {
    closePresenterConsole();
  }
}

function updateConsoleStatus() {

    const completedQuestions =
        Math.min(
            questionCount,
            questions.length
        );

    consoleRound.textContent =
        `${completedQuestions} / ${questions.length}`;

    consoleAudienceLeft.textContent =
        getAvailableNumbers().length;

}

consoleButton.addEventListener("click", togglePresenterConsole);

closeConsole.addEventListener("click", closePresenterConsole);

consoleOverlay.addEventListener("click", closePresenterConsole);

musicToggle.addEventListener(
    "change",
    () => {

        masterAudioMuted = false;

        presentationSettings.music =
            musicToggle.checked;

        if(
            presentationSettings.music
        ){

            startBackgroundMusic();

        }

        else{

            stopBackgroundMusic();

        }

    }
);

effectsToggle.addEventListener(
    "change",
    () => {

        masterAudioMuted = false;

        presentationSettings.effects =
            effectsToggle.checked;

    }
);

voiceToggle.addEventListener(
    "change",
    () => {

        masterAudioMuted = false;

        presentationSettings.voice =
            voiceToggle.checked;

        if (!presentationSettings.voice) {
            stopQuestionVoice({ restoreMusic: true });
        }

    }
);

idleToggle.addEventListener("change", () => {
  presentationSettings.idleRotation = idleToggle.checked;
});

function startQuestionTransition() {
  if (transitioning) return;

  if (
    winnerPopup.classList.contains("hidden") ||
    !tabPrompt.classList.contains("showPrompt")
  ) {
    return;
  }

  transitioning = true;

playSFX(
    "curtain",
    1.54,
    .55
);

curtainContainer.classList.add(
    "close"
);

  setTimeout(() => {
    resetWinnerAfterQuestion();

    prepareQuestionScene();
  }, 2200);

  setTimeout(()=>{

    playSFX(
        "curtain",
        1.54,
        .55
    );

    curtainContainer.classList.remove(
        "close"
    );

},3500);

  setTimeout(() => {
    revealQuestionScene();
  }, 3800);

  setTimeout(() => {
    transitioning = false;
  }, 5500);
}

function returnToWheel() {
  if (transitioning) return;

  if (questionScreen.classList.contains("hiddenQuestion")) {
    return;
  }

  stopQuestionVoice({ restoreMusic: true });

  if (questionCount >= questions.length) {
    showCompletionFinale();

    return;
  }

  transitioning = true;

  continueButton.disabled = true;

  continueButton.classList.add("exitUp");

  setTimeout(() => {
    questionText.classList.add("exitUp");
  }, 250);

  setTimeout(() => {
    questionTitle.classList.add("exitUp");
  }, 500);

  spotlight.style.opacity = "0";

  setTimeout(()=>{

    playSFX(
        "curtain",
        1.54,
        .55
    );

    curtainContainer.classList.add(
        "close"
    );

},1250);

  setTimeout(() => {
    questionScreen.classList.add("hiddenQuestion");

    continueButton.classList.remove(
      "showContinue",
      "exitUp",
      "continueDisabled",
    );

    continueButton.disabled = false;

    continueButton.style.opacity = "";

    continueButton.style.transform = "";

    questionText.classList.remove("exitUp");

    questionText.innerHTML = "";

    questionText.style.opacity = "0";

    questionText.style.transform = "translateY(40px)";

    questionTitle.classList.remove(
      "showQuestionTitle",
      "hideQuestionTitle",
      "questionLand",
      "drawLine",
      "exitUp",
    );

    questionTitle.style.opacity = "";

    questionTitle.style.visibility = "";

    questionTitle.style.transform = "";

    /*
        Restore wheel controls
        */

    pointer.style.opacity = "1";

    spinButton.disabled = false;

    spinButton.classList.add("glowButton");
  }, 3400);

  setTimeout(()=>{

    playSFX(
        "curtain",
        1.54,
        .55
    );

    curtainContainer.classList.remove(
        "close"
    );

},3900);

  setTimeout(() => {
    transitioning = false;
  }, 6100);
}

continueButton.addEventListener("click", returnToWheel);

finaleWheelButton.addEventListener(
  "click",
  returnFromFinaleToWheel,
);

finalQuestionButton.addEventListener(
  "click",
  startFinalQuestionSequence,
);

revealAnswerButton.addEventListener(
  "click",
  revealPresentation,
);

tabPrompt.addEventListener("click", () => {
  startQuestionTransition();
});

document.addEventListener("keydown", (e) => {
        const entryIsVisible =
        entryScreen.style.display !== "none";

    if(
        e.key === "Enter" &&
        entryIsVisible
    ){

        e.preventDefault();

        if(!enterButton.disabled){

            enterButton.click();

        }

        return;

    }
  if (e.key === "Escape") {
    closePresenterConsole();

    return;
  }

  if (e.key.toLowerCase() === "c") {
    togglePresenterConsole();

    return;
  }

  if (e.key.toLowerCase() === "m") {

    e.preventDefault();

    toggleMasterAudio();

    return;

}

  const consoleIsOpen = !presenterConsole.classList.contains("consoleClosed");

  if (consoleIsOpen) {
    return;
  }

  const finaleIsVisible =
    !finaleScreen.classList.contains("finaleHidden");

  if (finaleIsVisible) {
    if (
    e.key.toLowerCase() === "r" &&
    completionScene.classList.contains(
        "finaleSceneVisible"
    ) &&
    finaleControlsRevealed &&
    !finaleWheelButton.disabled
) {

    e.preventDefault();

    finaleWheelButton.click();

    return;

}
    if (e.key === "Enter") {
      if (
        document.activeElement === finaleWheelButton ||
        document.activeElement === finalQuestionButton ||
        document.activeElement === revealAnswerButton
      ) {
        return;
      }

      e.preventDefault();

      if (
    revealAnswerButton.classList.contains(
        "showRevealButton"
    )
) {

    revealAnswerButton.click();

}

else if (
    completionScene.classList.contains(
        "finaleSceneVisible"
    )
) {

    if (!finaleControlsRevealed) {

        revealFinaleControls();

    }

    else {

        finalQuestionButton.click();

    }

}
    }

    return;
  }

  if (e.key === "Tab") {
    e.preventDefault();

    startQuestionTransition();

    return;
  }

  if (e.code === "Space") {
    e.preventDefault();

    const wheelIsVisible = questionScreen.classList.contains("hiddenQuestion");

    const popupIsClosed = winnerPopup.classList.contains("hidden");

    if (!spinning && wheelIsVisible && popupIsClosed) {
      spinButton.click();
    }

    return;
  }

  if (e.key === "Enter") {
    const questionIsVisible =
      !questionScreen.classList.contains("hiddenQuestion");

    if (questionIsVisible) {
      returnToWheel();
    }
  }
});

loadBackgroundMusic("audio/music/background.mp3");

loadSFX(
    "curtain",
    "audio/sfx/curtain.mp3"
);

updateConsoleStatus();

const FINALE_TEST_MODE = false;

function startFinaleTestMode() {

    clearFinaleTimers();

    sessionComplete = true;
    transitioning = true;

    questionCount = questions.length;

    askedNumbers.length = 0;

    askedNumbers.push(
        35,
        13,
        31,
        54,
        17
    );

    updateConsoleStatus();

    entryScreen.style.display = "none";

    winnerPopup.classList.add("hidden");

    questionScreen.classList.add(
        "hiddenQuestion"
    );

    spinButton.textContent = "FINAL";

    spinButton.setAttribute(
        "aria-label",
        "Return to the ending"
    );

    const leftCurtain =
        document.getElementById(
            "leftCurtain"
        );

    const rightCurtain =
        document.getElementById(
            "rightCurtain"
        );

    leftCurtain.style.transition = "none";
    rightCurtain.style.transition = "none";

    curtainContainer.classList.add(
        "close"
    );

    void curtainContainer.offsetWidth;

    leftCurtain.style.transition = "";
    rightCurtain.style.transition = "";

    prepareFinaleSummary();

    scheduleFinale(() => {

        curtainContainer.classList.remove(
            "close"
        );

    }, 700);

    scheduleFinale(() => {

        revealFinaleSummary();

    }, 3300);

    scheduleFinale(() => {

        transitioning = false;

    }, 12400);

}

if (FINALE_TEST_MODE) {

    startFinaleTestMode();

}
