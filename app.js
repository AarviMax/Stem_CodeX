const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const playBtn = document.getElementById('playBtn');
const analysisText = document.getElementById('analysisText');
const languageSelect = document.getElementById('languageSelect');

const eyeAmplitudeVal = document.getElementById('eyeAmplitudeVal');
const eyeWavelengthVal = document.getElementById('eyeWavelengthVal');
const mouthCurvatureVal = document.getElementById('mouthCurvatureVal');

const playlistContainer = document.getElementById('playlist');
const player = document.getElementById('player');

let detectInterval;
let latestMetrics = null;
const eyeHistory = [];
let modelsLoaded = false;

const songsByLanguageAndMood = {
  hindi: {
    happy: [
      { title: 'Badtameez Dil', ytId: 'II2EO3Nw4m0' },
      { title: 'Gallan Goodiyaan', ytId: 'jCEdTq3j-0U' }
    ],
    calm: [
      { title: 'Raabta', ytId: 'zlt38OOqwDc' },
      { title: 'Kabira (Encore)', ytId: 'jHNNMj5bNQw' }
    ],
    stressed: [
      { title: 'Ilahi', ytId: 'fdubeMFwuGs' },
      { title: 'Agar Tum Saath Ho', ytId: 'sK7riqg2mr4' }
    ]
  },
  english: {
    happy: [
      { title: 'Happy - Pharrell Williams', ytId: 'ZbZSe6N_BXs' },
      { title: 'Can’t Stop the Feeling', ytId: 'ru0K8uYEZWw' }
    ],
    calm: [
      { title: 'Perfect - Ed Sheeran', ytId: '2Vv-BfVoq4g' },
      { title: 'Photograph', ytId: 'nSDgHBxUbVQ' }
    ],
    stressed: [
      { title: 'Let Her Go', ytId: 'RBumgq5yVrA' },
      { title: 'Fix You', ytId: 'k4V3Mo61fJM' }
    ]
  },
  kannada: {
    happy: [
      { title: 'Belageddu', ytId: 'F6N1mLxJ7NQ' },
      { title: 'Karabuu', ytId: 'P8hU9fxN4Wk' }
    ],
    calm: [
      { title: 'Anisuthide', ytId: '9M8zvf6A4x8' },
      { title: 'Ninnindale', ytId: '9xlWvWn2h4I' }
    ],
    stressed: [
      { title: 'Neene Bari Neene', ytId: 'DgoTPn4qP6I' },
      { title: 'Yaare Yaare', ytId: 'hV2FjXln9-g' }
    ]
  },
  bhojpuri: {
    happy: [
      { title: 'Lollipop Lagelu', ytId: 'Gr8G_ldltDE' },
      { title: 'Raate Diya Butake', ytId: 'Gm3AWn9LxUY' }
    ],
    calm: [
      { title: 'Chhalakata Hamro Jawaniya', ytId: 'AqYvNbYUMQ4' },
      { title: 'Nirahua Satal Rahe', ytId: 'Q1tQ2nQ1W2A' }
    ],
    stressed: [
      { title: 'Rinkiya Ke Papa', ytId: 'wM8QfQ9B4jY' },
      { title: 'Piyawa Se Pahile', ytId: '1XfK6dQjN8g' }
    ]
  },
  malayalam: {
    happy: [
      { title: 'Jimikki Kammal', ytId: 'FXiaIH49oAU' },
      { title: 'Entammede Jimikki Kammal', ytId: '8RZqPq1-1Tw' }
    ],
    calm: [
      { title: 'Malare', ytId: 'xkR0q9Xq2yk' },
      { title: 'Pavizha Mazha', ytId: 'tOM-nWPcR4U' }
    ],
    stressed: [
      { title: 'Uyiril Thodum', ytId: 'UEq2WqG7Wso' },
      { title: 'Aaradhike', ytId: 'QYh6mYIJG2Y' }
    ]
  },
  telugu: {
    happy: [
      { title: 'Butta Bomma', ytId: '2mDCVzruYzQ' },
      { title: 'Ramuloo Ramulaa', ytId: 'wFAj0pW6xX0' }
    ],
    calm: [
      { title: 'Samajavaragamana', ytId: '7w3fM9nW9WQ' },
      { title: 'Inkem Inkem Inkem Kaavaale', ytId: 'VkmxxU6k7sI' }
    ],
    stressed: [
      { title: 'Nee Kannu Neeli Samudram', ytId: 'QY8A8vYJQ3M' },
      { title: 'Priyathama Priyathama', ytId: '8Qn_spdM5Zg' }
    ]
  },
  punjabi: {
    happy: [
      { title: 'Lahore', ytId: 'dZ0fwJojhrs' },
      { title: '3 Peg', ytId: 'hzTg4zPBtDU' }
    ],
    calm: [
      { title: 'Khaab', ytId: 'zfyQ8muKLdc' },
      { title: 'Sakhiyaan', ytId: 'VxU5dQn4u9A' }
    ],
    stressed: [
      { title: 'Qismat', ytId: 'VcyFfcJbyeM' },
      { title: 'Soch', ytId: 'u4fMUR4wK7A' }
    ]
  },
  tamil: {
    happy: [
      { title: 'Vaathi Coming', ytId: 'fRD_3vJagxk' },
      { title: 'Arabic Kuthu', ytId: 'KUN5Uf9mObQ' }
    ],
    calm: [
      { title: 'Munbe Vaa', ytId: 'xRY6nM4xA6w' },
      { title: 'Nenjukkul Peidhidum', ytId: '6X6V9C8T5UQ' }
    ],
    stressed: [
      { title: 'New York Nagaram', ytId: '6P9YhA0fS8E' },
      { title: 'Life of Ram', ytId: 'MZfJmU5R8kA' }
    ]
  }
};

startBtn.addEventListener('click', async () => {
  await loadModels();
  await startCamera();
  startDetectionLoop();
  analyzeBtn.disabled = false;
});

analyzeBtn.addEventListener('click', () => {
  if (!latestMetrics) {
    analysisText.textContent = 'No face detected yet. Please look at the camera.';
    return;
  }

  const mood = detectMood(latestMetrics);
  latestMetrics.mood = mood;
  languageSelect.disabled = false;
  playBtn.disabled = false;

  analysisText.innerHTML = `
    <strong>Detected Mood:</strong> ${mood.toUpperCase()}<br/>
    Eye amplitude (${latestMetrics.eyeAmplitude.toFixed(3)}) and eye wavelength (${latestMetrics.eyeWavelength.toFixed(2)}s)
    suggest current energy level. Mouth curvature (${latestMetrics.mouthCurvature.toFixed(3)})
    indicates emotional valence.<br/>
    Choose a language to get song recommendations.
  `;
});

playBtn.addEventListener('click', () => {
  const language = languageSelect.value;
  if (!language || !latestMetrics?.mood) {
    analysisText.textContent = 'Please analyze mood and choose a language first.';
    return;
  }

  const songs = songsByLanguageAndMood[language][latestMetrics.mood] || [];
  renderPlaylist(songs, language, latestMetrics.mood);
});

async function loadModels() {
  if (modelsLoaded) return;
  analysisText.textContent = 'Loading face-recognition models...';
  const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)
  ]);
  modelsLoaded = true;
  analysisText.textContent = 'Models loaded. Starting camera...';
}

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  video.srcObject = stream;
  await new Promise((resolve) => {
    video.onloadedmetadata = () => resolve();
  });

  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
}

function startDetectionLoop() {
  clearInterval(detectInterval);
  detectInterval = setInterval(async () => {
    const result = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (!result) return;

    const resized = faceapi.resizeResults(result, {
      width: overlay.width,
      height: overlay.height
    });

    faceapi.draw.drawDetections(overlay, resized);
    faceapi.draw.drawFaceLandmarks(overlay, resized);

    latestMetrics = extractMetrics(result.landmarks);
    eyeAmplitudeVal.textContent = latestMetrics.eyeAmplitude.toFixed(3);
    eyeWavelengthVal.textContent = `${latestMetrics.eyeWavelength.toFixed(2)} s`;
    mouthCurvatureVal.textContent = latestMetrics.mouthCurvature.toFixed(3);
  }, 250);
}

function extractMetrics(landmarks) {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const mouth = landmarks.getMouth();

  const leftAmp = eyeOpennessRatio(leftEye);
  const rightAmp = eyeOpennessRatio(rightEye);
  const eyeAmplitude = (leftAmp + rightAmp) / 2;

  eyeHistory.push({ t: performance.now(), v: eyeAmplitude });
  if (eyeHistory.length > 40) eyeHistory.shift();

  const eyeWavelength = estimateWavelength(eyeHistory);
  const mouthCurvature = computeMouthCurvature(mouth);

  return { eyeAmplitude, eyeWavelength, mouthCurvature };
}

function eyeOpennessRatio(eyePoints) {
  const horizontal = distance(eyePoints[0], eyePoints[3]);
  const verticalA = distance(eyePoints[1], eyePoints[5]);
  const verticalB = distance(eyePoints[2], eyePoints[4]);
  return (verticalA + verticalB) / (2 * horizontal);
}

function estimateWavelength(history) {
  if (history.length < 8) return 1.5;
  const values = history.map((p) => p.v);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const crossings = [];
  for (let i = 1; i < history.length; i += 1) {
    if ((history[i - 1].v - avg) * (history[i].v - avg) < 0) {
      crossings.push(history[i].t);
    }
  }

  if (crossings.length < 2) return 1.5;
  const periods = [];
  for (let i = 1; i < crossings.length; i += 2) {
    periods.push((crossings[i] - crossings[i - 1]) / 1000);
  }

  if (!periods.length) return 1.5;
  return periods.reduce((a, b) => a + b, 0) / periods.length;
}

function computeMouthCurvature(mouth) {
  const leftCorner = mouth[0];
  const rightCorner = mouth[6];
  const topMid = mouth[3];

  const cornerYAvg = (leftCorner.y + rightCorner.y) / 2;
  const mouthWidth = distance(leftCorner, rightCorner);
  return (cornerYAvg - topMid.y) / mouthWidth;
}

function detectMood(metrics) {
  const { eyeAmplitude, eyeWavelength, mouthCurvature } = metrics;

  if (mouthCurvature < -0.015 && eyeAmplitude > 0.26) return 'happy';
  if (eyeAmplitude < 0.22 || eyeWavelength < 0.55 || mouthCurvature > 0.02) return 'stressed';
  return 'calm';
}

function renderPlaylist(songs, language, mood) {
  playlistContainer.innerHTML = '';

  if (!songs.length) {
    playlistContainer.textContent = 'No songs found for this language and mood.';
    return;
  }

  analysisText.innerHTML = `<strong>Now serving:</strong> ${mood.toUpperCase()} songs in ${capitalize(language)}.`;

  songs.forEach((song, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'song-item';
    wrapper.innerHTML = `
      <strong>${index + 1}. ${song.title}</strong>
      <button>Play</button>
    `;

    wrapper.querySelector('button').addEventListener('click', () => {
      player.src = `https://www.youtube.com/embed/${song.ytId}?autoplay=1`;
    });

    playlistContainer.appendChild(wrapper);
  });

  player.src = `https://www.youtube.com/embed/${songs[0].ytId}?autoplay=1`;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
