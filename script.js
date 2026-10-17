/* ===========================================================
   Jingles Lula — player + download
   Basta adicionar novos itens no array AUDIOS abaixo.
   =========================================================== */

const AUDIOS = [
  { file: 'boraLula.mp3',              title: 'Bora Lula' },
  { file: 'botaPraVirar.mp3',          title: 'Bota Pra Virar' },
  { file: 'Eh13ComNomesDeEstados.mp3', title: 'É 13 com Nomes de Estados' },
  { file: 'jingleEh13.mp3',            title: 'Jingle É 13' },
  { file: 'LulaEhOCara.mp3',           title: 'Lula É o Cara' },
  { file: 'musicasPraCarreata.mp3',    title: 'Músicas pra Carreata' },
  { file: 'trezeTodaVida.mp3',         title: 'Treze Toda Vida' },
  { file: 'tropaDo13.mp3',             title: 'Tropa do 13' }
];

const FOLDER = 'audios/';

const grid = document.getElementById('grid');
const emptyMsg = document.getElementById('empty');
const searchInput = document.getElementById('search');

const audio = document.getElementById('audio');
const player = document.getElementById('player');
const playerToggle = document.getElementById('playerToggle');
const playerTitle = document.getElementById('playerTitle');
const playerFill = document.getElementById('playerFill');
const playerDl = document.getElementById('playerDl');

let current = -1;        // índice tocando
let seeking = false;     // arrastando a barra
const cards = [];        // referências de UI por índice

/* ---------- utilidades ---------- */

const SVG = {
  play: '<svg class="ic ic--play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pause: '<svg class="ic ic--pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>',
  download: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0l-4-4m4 4l4-4M5 19h14"/></svg>'
};

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/* ---------- construção dos cards ---------- */

function waveBars(seed) {
  let html = '';
  const total = 30;
  for (let i = 0; i < total; i++) {
    const h = 22 + Math.round(70 * Math.abs(Math.sin((i + 1) * 1.13 + seed * 2.7)));
    const delay = ((i % 10) * 0.09).toFixed(2);
    html += `<i style="--h:${h}%;--d:${delay}s"></i>`;
  }
  return html;
}

function build() {
  AUDIOS.forEach((track, index) => {
    const url = FOLDER + track.file;

    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.index = String(index);
    card.dataset.name = normalize(track.title);

    card.innerHTML = `
      <div class="card__top">
        <span class="card__num">${String(index + 1).padStart(2, '0')}</span>
        <h2 class="card__title">${track.title}</h2>
      </div>

      <div class="wave" aria-hidden="true">${waveBars(index)}</div>

      <div class="card__controls">
        <button class="btn-play" type="button" aria-label="Reproduzir ${track.title}">
          ${SVG.play}${SVG.pause}
        </button>

        <div class="progress">
          <input class="seek" type="range" min="0" max="1000" value="0" step="1"
                 aria-label="Progresso de ${track.title}" />
          <div class="progress__times">
            <span class="t-current">0:00</span>
            <span class="t-duration">--:--</span>
          </div>
        </div>

        <a class="btn-dl" href="${url}" download="${track.title}.mp3" title="Baixar ${track.title}">
          ${SVG.download}<span>Baixar</span>
        </a>
      </div>
    `;

    const refs = {
      el: card,
      play: card.querySelector('.btn-play'),
      seek: card.querySelector('.seek'),
      tCurrent: card.querySelector('.t-current'),
      tDuration: card.querySelector('.t-duration')
    };
    cards.push(refs);

    refs.play.addEventListener('click', () => togglePlay(index));

    refs.seek.addEventListener('input', () => {
      seeking = true;
      if (current !== index) return;
      if (audio.duration) audio.currentTime = (refs.seek.value / 1000) * audio.duration;
    });
    refs.seek.addEventListener('change', () => { seeking = false; });

    // duração individual (cada card sabe a duração do seu áudio)
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.src = url;
    probe.addEventListener('loadedmetadata', () => {
      refs.tDuration.textContent = formatTime(probe.duration);
    });

    grid.appendChild(card);
  });
}

/* ---------- controles de reprodução ---------- */

function setPlayIcon(index, playing) {
  const card = cards[index];
  if (!card) return;
  card.el.classList.toggle('is-playing', playing);
  card.play.setAttribute('aria-label', (playing ? 'Pausar ' : 'Reproduzir ') + AUDIOS[index].title);
  card.play.setAttribute('aria-pressed', String(playing));
}

function paintProgress(index, ratio) {
  const card = cards[index];
  if (!card) return;
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  card.seek.style.setProperty('--fill', pct + '%');
  if (!seeking || current !== index) card.seek.value = String(Math.round(ratio * 1000));
  if (current === index) playerFill.style.width = pct + '%';
}

function loadTrack(index, autoplay = true) {
  const track = AUDIOS[index];
  audio.src = FOLDER + track.file;

  player.hidden = false;
  playerTitle.textContent = track.title;
  playerDl.href = FOLDER + track.file;
  playerDl.setAttribute('download', track.title + '.mp3');

  if (autoplay) {
    audio.play().catch(() => {});
  } else {
    paintProgress(index, 0);
  }
}

function togglePlay(index) {
  if (current === index) {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    return;
  }

  if (current !== -1) {
    setPlayIcon(current, false);
    paintProgress(current, 0);
  }

  current = index;
  loadTrack(index, true);
}

/* ---------- sincronização com o elemento de áudio ---------- */

audio.addEventListener('play', () => { if (current !== -1) setPlayIcon(current, true); });
audio.addEventListener('pause', () => { if (current !== -1) setPlayIcon(current, false); });

audio.addEventListener('timeupdate', () => {
  if (current === -1 || !audio.duration) return;
  const ratio = audio.currentTime / audio.duration;
  paintProgress(current, ratio);
  const card = cards[current];
  if (card) card.tCurrent.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('ended', () => {
  const finished = current;
  setPlayIcon(finished, false);
  paintProgress(finished, 1);
  const card = cards[finished];
  if (card) card.tCurrent.textContent = formatTime(audio.duration || 0);
  // toca o próximo automaticamente
  const next = finished + 1;
  if (next < AUDIOS.length) {
    togglePlay(next);
  } else {
    current = -1;
  }
});

audio.addEventListener('loadedmetadata', () => {
  if (current !== -1) paintProgress(current, 0);
});

playerToggle.addEventListener('click', () => {
  if (current === -1) { togglePlay(0); return; }
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
});

/* ---------- busca ---------- */

searchInput.addEventListener('input', () => {
  const term = normalize(searchInput.value.trim());
  let visible = 0;
  cards.forEach((card, i) => {
    const match = normalize(card.el.dataset.name).includes(term) || normalize(AUDIOS[i].title).includes(term);
    card.el.hidden = !match;
    if (match) visible++;
  });
  emptyMsg.hidden = visible > 0;
});

/* ---------- atalhos ---------- */

document.addEventListener('keydown', (e) => {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (e.code === 'Space' && current !== -1) {
    e.preventDefault();
    audio.paused ? audio.play() : audio.pause();
  }
  if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  }
});

/* ---------- init ---------- */

build();
