/*
     * MOTOR ACÚSTICO DA BARBEARIA CLANDESTINA (100% Web Audio API Nativo)
     * Sons implementados com síntese física de áudio:
     * 1. Clipper (Máquina de cortar cabelo com motor magnético contínuo e interruptor clack)
     * 2. Shaver (Micro-lâminas elétricas de corte rente)
     * 3. Tesoura de barbeiro (duplo corte estaladiço)
     * 4. Navalha no couro (strop metálico)
     * 5. Borrifador / Spray de água
     * 6. Switch mecânico analógico
     */

    /*
     * REAL BARBER ACOUSTICS (100% Web Audio API Nativo)
     * Modelagem acústica e física de ferramentas reais de barbearia:
     * - Clipper Wahl/Andis: motor magnético 120Hz/240Hz com atrito granular de cabelo cortado
     * - Foil Shaver: cabeça rotativa rápida de alta frequência com corte cerrado de barba
     * - Tesouras de barbeiro: duplo corte seco de lâmina japonesa convexa de aço temperado
     * - Navalha clássica: deslizamento dinâmico em assentador de couro bovino
     * - Borrifador profissional: gatilho de mola e névoa atomizada fina
     * - Carimbo oficial de fidelidade: impacto encorpado de borracha/madeira em papel
     * - Câmara 35mm: obturador mecânico com cortina e espelho reflex
     */
    class BarberAudioEngine {
      constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.activeNodes = [];

        // Fontes de som reais (gravações de barbearia genuínas)
        this.soundSources = {
          scissors: 'assets/sounds/real_scissors.wav',
          scissorsSnip: 'assets/sounds/real_scissors_snip.wav',
          clipper: 'assets/sounds/real_clipper_binaural.wav',
          shaver: 'assets/sounds/clipper.mp3',
          razor: 'assets/sounds/real_razor.wav',
          spray: 'assets/sounds/real_spray.wav'
        };

        // Pool de 3 instâncias pré-carregadas por som (permite sobreposição e resposta com 0ms de latência)
        this.pools = {};
        for (const [key, path] of Object.entries(this.soundSources)) {
          this.pools[key] = {
            index: 0,
            instances: [
              new Audio(path),
              new Audio(path),
              new Audio(path)
            ]
          };
          this.pools[key].instances.forEach(a => {
            a.preload = 'auto';
            try { a.load(); } catch (e) {}
          });
        }
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        this.unlockAll();
      }

      unlockAll() {
        for (const pool of Object.values(this.pools)) {
          pool.instances.forEach(a => {
            try { a.load(); } catch (e) {}
          });
        }
      }

      setMute(mute) {
        this.isMuted = false;
      }

      stopAll() {
        for (const pool of Object.values(this.pools)) {
          pool.instances.forEach(a => {
            try {
              a.pause();
              a.currentTime = 0;
            } catch (e) {}
          });
        }
        this.activeNodes.forEach(node => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch (e) {}
        });
        this.activeNodes = [];
      }

      // Reproduz uma gravação real do pool de áudio com zero latência
      playReal(key, volume = 1.0, maxDuration = null) {
        if (this.isMuted) return;
        const pool = this.pools[key];
        if (!pool) return;
        try {
          const a = pool.instances[pool.index];
          pool.index = (pool.index + 1) % pool.instances.length;
          a.pause();
          a.currentTime = 0;
          a.volume = Math.min(1, Math.max(0, volume));
          const p = a.play();
          if (p !== undefined) {
            p.catch(() => {});
          }
          if (maxDuration) {
            setTimeout(() => {
              try {
                a.pause();
                a.currentTime = 0;
              } catch (e) {}
            }, maxDuration * 1000);
          }
        } catch (e) {}
      }

      /* ========================================================
         INSTRUMENTOS DE BARBEARIA: 100% GRAVAÇÕES ACÚSTICAS REAIS
         ======================================================== */

      /* 1. TESOURA REAL: Corte seco e nítido de cabelo com lâmina de aço */
      playRealScissors() {
        this.playReal('scissors', 1.0);
      }

      /* 2. TESOURA RÁPIDA: Snip individual */
      playScissorsSnip() {
        this.playReal('scissorsSnip', 1.0);
      }

      /* 3. MÁQUINA DE CORTAR CABELO REAL (CLIPPER BINAURAL) */
      playHairCutClipper(duration = 1.4) {
        this.playReal('clipper', 1.0, duration);
      }

      /* 4. MÁQUINA SHAVER REAL (MOTOR ROTATIVO DE ACABAMENTO) */
      playFoilShaver(duration = 1.3) {
        this.playReal('shaver', 0.95, duration);
      }

      /* 5. NAVALHA CLÁSSICA REAL NO ASSENTADOR DE COURO */
      playRazorStrop() {
        this.playReal('razor', 1.0);
      }

      /* 6. BORRIFADOR DE BARBEIRO REAL (NÉVOA ATOMIZADA) */
      playWaterSpray() {
        this.playReal('spray', 1.0);
      }

      /* 7. NAVALHA NA PELE / CABEÇA AO DAR SCROLL (SÍNTESE FÍSICA + AMOSTRAGEM REAL) */
      playRazorScrape(intensity = 1.0) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.09 + Math.random() * 0.08; // 90ms a 170ms - raspada nítida de navalha

        // Síntese procedural de fricção da lâmina no cabelo/pele (frequência de queratina)
        const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration));
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastVal = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const follicleSnap = (Math.random() > 0.93) ? (Math.random() * 2 - 1) * 2.2 : 0;
          lastVal = (white * 0.7 + follicleSnap * 0.3) - (lastVal * 0.25);
          data[i] = lastVal;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Filtro passa-banda sintonizado na ressonância do aço ao cortar cabelo
        const bpf = this.ctx.createBiquadFilter();
        bpf.type = 'bandpass';
        bpf.frequency.setValueAtTime(3600 + Math.random() * 700, now);
        bpf.Q.setValueAtTime(3.4, now);

        // Filtro passa-alto para brilho e textura crocante
        const hpf = this.ctx.createBiquadFilter();
        hpf.type = 'highpass';
        hpf.frequency.setValueAtTime(2000, now);

        const gain = this.ctx.createGain();
        const baseVol = Math.min(0.24, 0.12 * intensity);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(baseVol, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(bpf);
        bpf.connect(hpf);
        hpf.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration + 0.02);

        // Micro-amostragem do som gravado real de navalha
        if (Math.random() > 0.4) {
          try {
            const pool = this.pools['razor'];
            if (pool) {
              const inst = pool.instances[pool.index];
              pool.index = (pool.index + 1) % pool.instances.length;
              inst.currentTime = Math.random() * 0.35;
              inst.playbackRate = 0.94 + Math.random() * 0.22;
              inst.volume = Math.min(0.24, 0.13 * intensity);
              const p = inst.play();
              if (p) p.catch(() => {});
              setTimeout(() => {
                try { inst.pause(); } catch(e) {}
              }, 170);
            }
          } catch(e) {}
        }
      }

      /* ========================================================
         MICRO-INTERAÇÕES MECÂNICAS DA INTERFACE
         ======================================================== */

      /* Clique mecânico */
      playSwitch() {
        this.playClick();
      }

      /* Clique tátil subtil */
      playClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2600, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.016);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
      }

      /* Tique de câmara */
      playCameraShutter() {
        this.playClick();
      }

      /* Carimbo mecânico da Caderneta de Fidelidade */
      playHeavyStamp() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const lowOsc = this.ctx.createOscillator();
        lowOsc.type = 'sine';
        lowOsc.frequency.setValueAtTime(165, now);
        lowOsc.frequency.exponentialRampToValueAtTime(42, now + 0.12);
        const lowGain = this.ctx.createGain();
        lowGain.gain.setValueAtTime(0.55, now);
        lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        lowOsc.connect(lowGain);
        lowGain.connect(this.ctx.destination);
        lowOsc.start(now);
        lowOsc.stop(now + 0.15);
      }

      /* Impacto profundo na consolidação do Logótipo Oficial */
      playImpact() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const sub = this.ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(115, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + 0.35);
        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.65, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 0.42);
      }

      /* Retrocompatibilidade */
      startClipper() { this.playHairCutClipper(1.4); }
      stopClipper() { this.playSwitch(); }
      startShaver() { this.playFoilShaver(1.3); }
      stopShaver() { this.playSwitch(); }
      playScissors() { this.playRealScissors(); }
      playRazor() { this.playRazorStrop(); }
      playSpray() { this.playWaterSpray(); }
      playStamp() { this.playHeavyStamp(); }
    }

    const sound = new BarberAudioEngine();

    /* ========================================================
       TELA DE CARREGAMENTO FLUIDA (PRELOADER COM PROGRESSO)
       ======================================================== */
    const introGate = document.getElementById('intro-gate');
    const assemblyStage = document.getElementById('assembly-stage');
    const partScissors = document.getElementById('part-scissors');
    const partClipper = document.getElementById('part-clipper');
    const partRazor = document.getElementById('part-razor');
    const partCrest = document.getElementById('part-crest');
    const partFinalLogo = document.getElementById('part-final-logo');
    const assemblyShockwave = document.getElementById('assembly-shockwave');
    const assemblyStepBadge = document.getElementById('assembly-step-badge');
    const preloaderProgressBar = document.getElementById('preloader-progress-bar');
    const preloaderPercentLabel = document.getElementById('preloader-percent-label');
    const flashEl = document.getElementById('camera-flash');

    let loaderInterval = null;
    let isLoaderFinished = false;

    function updatePreloaderProgress(percent, labelText) {
      if (preloaderProgressBar) preloaderProgressBar.style.width = `${percent}%`;
      if (preloaderPercentLabel) preloaderPercentLabel.textContent = `${Math.round(percent)}%`;
      if (assemblyStepBadge && labelText) assemblyStepBadge.textContent = labelText;
    }

    function runPreloader() {
      if (isLoaderFinished) return;
      if (loaderInterval) clearInterval(loaderInterval);

      // Reset dos elementos visuais
      if (assemblyStage) assemblyStage.classList.remove('intro-exit-zoom');
      if (assemblyShockwave) assemblyShockwave.classList.remove('fire');
      [partScissors, partClipper, partRazor, partCrest].forEach(p => {
        if (p) p.classList.remove('assembled', 'dissolved');
      });
      if (partFinalLogo) partFinalLogo.classList.remove('merged');

      updatePreloaderProgress(0, 'A PREPARAR AMBIENTE...');

      const totalDuration = 1500; // Montagem rápida e dinâmica (1.5 segundos)
      const stepInterval = 25;
      const totalSteps = totalDuration / stepInterval;
      let currentStep = 0;

      loaderInterval = setInterval(() => {
        currentStep++;
        const progress = Math.min(100, (currentStep / totalSteps) * 100);

        // 1. A Tesoura de Precisão (15% - aprox. 225ms)
        if (progress >= 15 && partScissors && !partScissors.classList.contains('assembled')) {
          partScissors.classList.add('assembled');
          updatePreloaderProgress(progress, '[ 01 / 04: A TESOURA DE PRECISÃO ]');
          try { sound.playRealScissors(); } catch (e) {}
        }
        // 2. A Máquina de Corte / Clipper (38% - aprox. 570ms)
        if (progress >= 38 && partClipper && !partClipper.classList.contains('assembled')) {
          partClipper.classList.add('assembled');
          updatePreloaderProgress(progress, '[ 02 / 04: A MÁQUINA DE CORTE ]');
          try { sound.playHairCutClipper(0.8); } catch (e) {}
        }
        // 3. A Navalha Clássica (62% - aprox. 930ms)
        if (progress >= 62 && partRazor && !partRazor.classList.contains('assembled')) {
          partRazor.classList.add('assembled');
          updatePreloaderProgress(progress, '[ 03 / 04: A NAVALHA CLÁSSICA ]');
          try { sound.playRazorStrop(); } catch (e) {}
        }
        // 4. O Brasão & Estrelas de Lealdade (82% - aprox. 1230ms)
        if (progress >= 82 && partCrest && !partCrest.classList.contains('assembled')) {
          partCrest.classList.add('assembled');
          updatePreloaderProgress(progress, '[ 04 / 04: O BRASÃO DE LEALDADE ]');
          try { sound.playWaterSpray(); } catch (e) {}
        }

        updatePreloaderProgress(progress);

        if (progress >= 100) {
          clearInterval(loaderInterval);
          finishPreloader();
        }
      }, stepInterval);
    }

    function finishPreloader() {
      if (isLoaderFinished) return;
      isLoaderFinished = true;
      if (loaderInterval) clearInterval(loaderInterval);

      updatePreloaderProgress(100, '[ MONTAGEM CONCLUÍDA: MODO CLANDESTINO ]');

      // Fusão dos 4 elementos no logotipo oficial consolidado
      [partScissors, partClipper, partRazor, partCrest].forEach(p => {
        if (p) p.classList.add('assembled', 'dissolved');
      });
      if (partFinalLogo) partFinalLogo.classList.add('merged');
      if (assemblyShockwave) assemblyShockwave.classList.add('fire');
      try { sound.playImpact(); } catch (e) {}

      // O logotipo final permanece visível por 2 segundos para nítida apreciação
      setTimeout(() => {
        if (introGate) {
          introGate.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          introGate.style.opacity = '0';
          introGate.style.pointerEvents = 'none';
          setTimeout(() => {
            introGate.style.display = 'none';
          }, 850);
        }
      }, 2000);
    }

    function skipOrEnter(immediate = false) {
      if (immediate || isLoaderFinished) {
        if (loaderInterval) clearInterval(loaderInterval);
        isLoaderFinished = true;
        if (introGate) {
          introGate.style.transition = 'opacity 0.35s ease';
          introGate.style.opacity = '0';
          introGate.style.pointerEvents = 'none';
          setTimeout(() => {
            introGate.style.display = 'none';
          }, 400);
        }
        return;
      }
      finishPreloader();
    }

    function replayIntro() {
      isLoaderFinished = false;
      if (!introGate) return;
      introGate.style.display = 'flex';
      introGate.style.pointerEvents = 'all';
      introGate.style.opacity = '1';
      runPreloader();
    }

    // Iniciar automaticamente no carregamento da página
    window.addEventListener('load', () => {
      runPreloader();
    });

    // Tecla ESC para saltar imediatamente
    window.addEventListener('keydown', (e) => {
      if (!isLoaderFinished && (e.key === 'Escape' || e.key === 'Enter')) {
        skipOrEnter(true);
      }
    });

    // Interatividade do Logo no Hero Section
    function pulseHeroLogo() {
      try {
        sound.playRazorStrop();
        setTimeout(() => sound.playRealScissors(), 150);
      } catch (e) {}
      const heroImg = document.getElementById('hero-logo-img');
      if (heroImg) {
        heroImg.classList.add('animate-vibrate-tool');
        setTimeout(() => heroImg.classList.remove('animate-vibrate-tool'), 600);
      }
    }

    // Ativação e desbloqueio automático do som permanente na primeira interação
    const unlockAudio = () => {
      sound.init();
      sound.unlockAll();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('scroll', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('scroll', unlockAudio, { passive: true });

    /* ========================================================
       CURSOR SPOTLIGHT & HOVER TÁTIL (APENAS DESKTOP COM PONTEIRO FINO)
       ======================================================== */
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (!isTouchDevice) {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.documentElement.style.setProperty('--cursor-x', `${mouseX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${mouseY}px`);

        if (cursorDot) {
          cursorDot.style.left = `${mouseX}px`;
          cursorDot.style.top = `${mouseY}px`;
        }
      });

      function loopCursor() {
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        if (cursorRing) {
          cursorRing.style.left = `${ringX}px`;
          cursorRing.style.top = `${ringY}px`;
        }
        requestAnimationFrame(loopCursor);
      }
      loopCursor();
    }

    // Hover sounds em botões e links
    document.querySelectorAll('.interactive-el, a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cursorRing) cursorRing.classList.add('hovering');
        sound.playClick();
      });
      el.addEventListener('mouseleave', () => {
        if (cursorRing) cursorRing.classList.remove('hovering');
      });
    });



    /* ========================================================
       MODAL DE FOTOGRAFIA (AMPLIAÇÃO REAL)
       ======================================================== */
    const photoModal = document.getElementById('photo-modal');
    const modalPhotoImg = document.getElementById('modal-photo-img');
    const modalPhotoCaption = document.getElementById('modal-photo-caption');

    function openPhoto(src, caption) {
      sound.playCameraShutter();
      // Efeito de flash analógico
      if (flashEl) {
        flashEl.classList.add('flash');
        setTimeout(() => { flashEl.classList.remove('flash'); }, 70);
      }

      modalPhotoImg.src = src;
      modalPhotoCaption.textContent = caption;
      photoModal.classList.remove('hidden');
      photoModal.classList.add('flex');
    }

    function closePhoto() {
      sound.playClick();
      photoModal.classList.add('hidden');
      photoModal.classList.remove('flex');
    }

    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal) closePhoto();
    });

    /* ========================================================
       SINCRONIZAÇÃO EM TEMPO REAL DA GALERIA (COM O DASHBOARD)
       ======================================================== */
    function resolvePhotoSrc(src) {
      if (!src) return '';
      if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('assets/')) {
        return src;
      }
      return 'assets/images/' + src;
    }

    const DEFAULT_FACTORY_PHOTOS = [
      {
        id: 'photo-default-1',
        src: 'assets/images/5_anos.jpg',
        title: '5 ANOS EM ABRANTES',
        caption: '5 Anos de Barbearia Clandestina em Abrantes'
      },
      {
        id: 'photo-default-2',
        src: 'assets/images/arte_tesoura.jpg',
        title: 'ARTE NA TESOURA',
        caption: 'A Arte e o Detalhe da Tesoura de Barbeiro'
      },
      {
        id: 'photo-default-3',
        src: 'assets/images/life_clandestina.jpg',
        title: 'O ESPAÇO REAL',
        caption: 'Ambiente da Barbearia Clandestina'
      },
      {
        id: 'photo-default-4',
        src: 'assets/images/cartao_cliente.jpeg',
        title: 'CADERNETA & LEALDADE',
        caption: 'Cartão Cliente e Sistema de Lealdade'
      }
    ];

    function loadLiveGalleryPhotos() {
      const galleryGrid = document.getElementById('gallery-grid');
      if (!galleryGrid) return;

      let photos = DEFAULT_FACTORY_PHOTOS;
      try {
        const stored = localStorage.getItem('clandestina_gallery_photos');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            photos = parsed;
          }
        }
      } catch (e) {}

      galleryGrid.innerHTML = photos.map((photo, index) => {
        const num = String(index + 1).padStart(2, '0');
        const staggerClass = `stagger-${(index % 4) + 1}`;
        const safeTitle = (photo.title || `REGISTO #${num}`).replace(/"/g, '&quot;');
        const safeCaption = (photo.caption || photo.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeSrc = resolvePhotoSrc(photo.src);

        return `
        <div onmouseenter="sound.playClick()" class="reveal is-visible ${staggerClass} razor-sheen-card border border-neutral-800 bg-[#121212] hover:border-neutral-500 p-2.5 cursor-pointer group rounded-sm shadow-md transition-all" onclick="openPhoto('${safeSrc}', '${safeCaption}')">
          <div class="aspect-square overflow-hidden bg-black relative rounded-sm">
            <img src="${safeSrc}" alt="${safeCaption}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-mono text-xs text-white uppercase tracking-wider">
              <span class="px-3 py-1 bg-black/90 border border-white text-white font-bold">[AMPLIAR FOTOGRAFIA]</span>
            </div>
          </div>
          <div class="p-3 font-mono text-[11px] text-neutral-400 uppercase flex justify-between items-center gap-2">
            <span class="text-white font-bold whitespace-nowrap">REGISTO #${num}</span>
            <span class="truncate text-right">${safeTitle}</span>
          </div>
        </div>
        `;
      }).join('');
    }

    loadLiveGalleryPhotos();
    window.addEventListener('storage', (e) => {
      if (e.key === 'clandestina_gallery_photos') {
        loadLiveGalleryPhotos();
      }
    });

    /* ========================================================
       SINCRONIZAÇÃO EM TEMPO REAL DOS FEEDBACKS (DO DASHBOARD)
       ======================================================== */
    const DEFAULT_FACTORY_FEEDBACKS = [
      {
        id: 'fb-1',
        author: 'Rui Ferreira',
        tag: 'Cliente Habitual • Corte & Barba',
        rating: 5,
        date: 'Há 2 semanas',
        text: 'A melhor barbearia de Abrantes sem qualquer margem de dúvida. O detalhe na navalha, a música e o ambiente fazem toda a diferença. Sais de lá sempre impecável.'
      },
      {
        id: 'fb-2',
        author: 'Gonçalo Mendes',
        tag: 'Corte Degradé • Fade',
        rating: 5,
        date: 'Há 1 mês',
        text: 'Cuidado sem pressas levado à risca. Não é daquelas barbearias que te despacham em 15 minutos; aqui há mestria, técnica e respeito pelo corte.'
      },
      {
        id: 'fb-3',
        author: 'Tiago Antunes',
        tag: 'Tratamento de Barba Completo',
        rating: 5,
        date: 'Há 2 meses',
        text: 'A toalha quente, o óleo e o alinhamento da barba na lâmina são de outro nível. O sistema da caderneta de fidelização é um bónus espetacular.'
      }
    ];

    function loadLiveFeedbacks() {
      const container = document.getElementById('feedbacks-grid');
      if (!container) return;

      let feedbacks = DEFAULT_FACTORY_FEEDBACKS;
      try {
        const stored = localStorage.getItem('clandestina_client_feedbacks');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            feedbacks = parsed;
          }
        }
      } catch (e) {}

      container.innerHTML = feedbacks.map((fb, index) => {
        const staggerClass = `stagger-${(index % 4) + 1}`;
        const starsHtml = Array.from({ length: 5 }, (_, i) => {
          return i < (fb.rating || 5)
            ? '<i class="fa-solid fa-star text-white text-xs"></i>'
            : '<i class="fa-regular fa-star text-neutral-600 text-xs"></i>';
        }).join('');

        const initials = (fb.author || 'Cliente')
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(w => w[0].toUpperCase())
          .join('') || 'C';

        const safeAuthor = (fb.author || 'Cliente').replace(/"/g, '&quot;');
        const safeTag = (fb.tag || 'Cliente Habitual').replace(/"/g, '&quot;');
        const safeDate = (fb.date || 'Recente').replace(/"/g, '&quot;');
        const safeText = (fb.text || '').replace(/"/g, '&quot;');

        return `
        <div onmouseenter="sound.playClick()" class="reveal is-visible ${staggerClass} razor-sheen-card border border-neutral-800 bg-[#121212] hover:border-neutral-500 p-6 sm:p-7 rounded-sm shadow-xl flex flex-col justify-between group transition-all">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-1.5 text-white">
                ${starsHtml}
              </div>
              <span class="font-mono text-[10px] text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                <i class="fa-solid fa-circle-check text-white text-[10px]"></i> VERIFICADO
              </span>
            </div>

            <i class="fa-solid fa-quote-left text-neutral-500 text-2xl mb-3 block"></i>

            <p class="font-sans text-sm text-neutral-200 leading-relaxed italic mb-6">
              "${safeText}"
            </p>
          </div>

          <div class="pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-inner">
                ${initials}
              </div>
              <div>
                <h4 class="font-title text-xl text-white uppercase tracking-wider leading-none">${safeAuthor}</h4>
                <span class="font-mono text-[10px] text-neutral-400 block mt-1 uppercase">${safeTag}</span>
              </div>
            </div>

            <span class="font-mono text-[9px] text-neutral-500 uppercase shrink-0 text-right">
              ${safeDate}
            </span>
          </div>
        </div>
        `;
      }).join('');
    }

    loadLiveFeedbacks();
    window.addEventListener('storage', (e) => {
      if (e.key === 'clandestina_client_feedbacks') {
        loadLiveFeedbacks();
      }
    });


    /* ========================================================
       SLIDER HORIZONTAL DE SERVIÇOS (SCROLL-SNAP & CONTROLES P&B)
       ======================================================== */
    const servicesSlider = document.getElementById('services-slider');
    const servicesPrevBtn = document.getElementById('services-prev');
    const servicesNextBtn = document.getElementById('services-next');
    const servicesCounter = document.getElementById('services-slider-counter');
    const servicesDots = document.querySelectorAll('.services-slider-dot');

    function getServiceCardStep() {
      if (!servicesSlider) return 320;
      const firstCard = servicesSlider.querySelector('.service-card-slide');
      if (!firstCard) return servicesSlider.clientWidth;
      const gap = 20; // 5 * 4px = 20px
      return firstCard.offsetWidth + gap;
    }

    function slideServices(direction) {
      if (!servicesSlider) return;
      try { sound.playClick(); } catch (e) {}
      const step = getServiceCardStep();
      servicesSlider.scrollBy({ left: direction * step, behavior: 'smooth' });
    }

    function goToServiceSlide(index) {
      if (!servicesSlider) return;
      try { sound.playClick(); } catch (e) {}
      const step = getServiceCardStep();
      servicesSlider.scrollTo({ left: index * step, behavior: 'smooth' });
    }

    function updateServicesSliderState() {
      if (!servicesSlider) return;
      const totalCards = 8;
      const step = getServiceCardStep();
      const scrollLeft = servicesSlider.scrollLeft;
      const maxScroll = servicesSlider.scrollWidth - servicesSlider.clientWidth;

      let activeIndex = Math.round(scrollLeft / (step || 1));
      if (activeIndex < 0) activeIndex = 0;
      if (activeIndex >= totalCards) activeIndex = totalCards - 1;

      if (servicesCounter) {
        servicesCounter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(totalCards).padStart(2, '0')}`;
      }

      if (servicesPrevBtn) {
        servicesPrevBtn.disabled = scrollLeft <= 6;
      }
      if (servicesNextBtn) {
        servicesNextBtn.disabled = scrollLeft >= maxScroll - 6;
      }

      if (servicesDots && servicesDots.length) {
        servicesDots.forEach((dot, idx) => {
          if (idx === activeIndex) {
            dot.classList.add('bg-white', 'w-6');
            dot.classList.remove('bg-neutral-800', 'w-2');
          } else {
            dot.classList.remove('bg-white', 'w-6');
            dot.classList.add('bg-neutral-800', 'w-2');
          }
        });
      }
    }

    if (servicesSlider) {
      servicesSlider.addEventListener('scroll', updateServicesSliderState, { passive: true });
      window.addEventListener('resize', updateServicesSliderState);
      setTimeout(updateServicesSliderState, 150);

      // Suporte para arrasto suave com o rato
      let isDragging = false;
      let dragStartX = 0;
      let dragScrollLeft = 0;

      servicesSlider.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.pageX - servicesSlider.offsetLeft;
        dragScrollLeft = servicesSlider.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      servicesSlider.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - servicesSlider.offsetLeft;
        const walk = (x - dragStartX) * 1.4;
        servicesSlider.scrollLeft = dragScrollLeft - walk;
      });
    }

    // Exposição global
    window.slideServices = slideServices;
    window.goToServiceSlide = goToServiceSlide;

    /* ========================================================
       MODAL DE AGENDAMENTO COM RESPOSTA ACÚSTICA POR SERVIÇO
       ======================================================== */
    const bookingModal = document.getElementById('booking-modal');
    const bServiceSelect = document.getElementById('b-service');

    function openBookingModal(service = 'Geral') {
      if (service && service !== 'Geral' && bServiceSelect) {
        const query = service.toLowerCase().trim();
        for (let i = 0; i < bServiceSelect.options.length; i++) {
          const optVal = bServiceSelect.options[i].value.toLowerCase();
          if (optVal === query || optVal.includes(query) || query.includes(optVal)) {
            bServiceSelect.selectedIndex = i;
            break;
          }
        }
      }

      // Som correspondente ao serviço selecionado
      if (service.includes('Barba') && service.includes('Corte')) {
        sound.playWaterSpray();
        setTimeout(() => sound.playRazorStrop(), 320);
      } else if (service.includes('Barboterapia') || service.includes('rosto') || service.includes('Tratamento')) {
        sound.playWaterSpray();
      } else if (service.includes('Barba')) {
        sound.playRazorStrop();
      } else if (service.includes('Corte') || service.includes('sénior')) {
        sound.playHairCutClipper(1.2);
      } else {
        sound.playScissors();
      }

      bookingModal.classList.remove('hidden');
      bookingModal.classList.add('flex');
    }

    function closeBookingModal() {
      sound.playClick();
      bookingModal.classList.add('hidden');
      bookingModal.classList.remove('flex');
    }

    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });

    // Tocar o som autêntico da ferramenta quando o cliente troca de serviço
    if (bServiceSelect) {
      bServiceSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val.includes('Barba') && val.includes('Corte')) {
          sound.playWaterSpray();
          setTimeout(() => sound.playRazorStrop(), 320);
        } else if (val.includes('Barboterapia') || val.includes('rosto') || val.includes('Tratamento')) {
          sound.playWaterSpray();
        } else if (val.includes('Barba')) {
          sound.playRazorStrop();
        } else if (val.includes('Corte') || val.includes('sénior')) {
          sound.playHairCutClipper(1.2);
        } else {
          sound.playClick();
        }
      });
    }

    function handleBooking(e) {
      e.preventDefault();
      sound.playSwitch();

      const name = document.getElementById('b-name').value;
      const phone = document.getElementById('b-phone').value;
      const service = document.getElementById('b-service').value;
      const date = document.getElementById('b-date').value;
      const time = document.getElementById('b-time').value;

      const msg = `Olá Barbearia Clandestina! Gostaria de agendar:%0A👤 Nome: ${encodeURIComponent(name)}%0A📱 Contacto: ${encodeURIComponent(phone)}%0A✂️ Serviço: ${encodeURIComponent(service)}%0A📅 Data: ${encodeURIComponent(date)}%0A⏰ Hora: ${encodeURIComponent(time)}`;

      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
      closeBookingModal();
    }

    /* ========================================================
       FEEDBACK VISUAL TÁTIL DO ÁUDIO (EQUALIZADOR & LÂMINA)
       ======================================================== */
    const audioStatusEl = document.getElementById('barber-audio-status');
    const scrollRazorIndicator = document.getElementById('scroll-razor-indicator');
    const topScrollFill = document.getElementById('top-scroll-fill');
    let eqTimer = null;

    function pulseAudioFeedback() {
      if (audioStatusEl) {
        audioStatusEl.classList.add('eq-active');
        clearTimeout(eqTimer);
        eqTimer = setTimeout(() => {
          audioStatusEl.classList.remove('eq-active');
        }, 300);
      }
      if (scrollRazorIndicator) {
        scrollRazorIndicator.classList.add('shaving');
        setTimeout(() => {
          scrollRazorIndicator.classList.remove('shaving');
        }, 160);
      }
    }

    /* ========================================================
       SCROLL CONTROLLER: SOM DE NAVALHA & PROFUNDIDADE
       ======================================================== */
    let lastScrollY = window.scrollY;
    let scrollDistanceAcc = 0;
    let lastScrapeTime = 0;
    const SCRAPE_DISTANCE_THRESHOLD = 150; // pixels de deslocamento por raspada de navalha
    const SCRAPE_MIN_INTERVAL = 130;       // ms de intervalo mínimo entre cortes

    // Secções e marcadores
    const sectionIds = ['home', 'quemsomos', 'servicos', 'cartao', 'galeria', 'feedbacks', 'contacto'];
    const milestones = document.querySelectorAll('.scroll-milestone');
    let currentActiveSection = 'home';
    const visitedSections = new Set(['home']);

    // Elementos de parallax
    const parallaxBgs = document.querySelectorAll('.parallax-bg');

    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // 1. Barra de progresso superior Barber Pole
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = maxScroll > 0 ? (currentY / maxScroll) * 100 : 0;
      if (topScrollFill) {
        topScrollFill.style.width = `${scrollPercent}%`;
      }

      // 2. Indicador de Lâmina de Navalha no trilho lateral
      if (scrollRazorIndicator) {
        const topPos = Math.min(94, Math.max(6, 6 + (scrollPercent * 0.88)));
        scrollRazorIndicator.style.top = `${topPos}%`;
      }

      // 3. Som de Navalha a passar na cabeça ao dar Scroll
      scrollDistanceAcc += delta;
      const now = performance.now();

      if (scrollDistanceAcc >= SCRAPE_DISTANCE_THRESHOLD && (now - lastScrapeTime) >= SCRAPE_MIN_INTERVAL) {
        scrollDistanceAcc = 0;
        lastScrapeTime = now;

        const speedIntensity = Math.min(1.8, Math.max(0.7, delta / 55));
        try {
          sound.playRazorScrape(speedIntensity);
          pulseAudioFeedback();
        } catch(e) {}
      }

      // 4. Parallax suave nos elementos decorativos de fundo
      parallaxBgs.forEach(el => {
        const speed = -0.06;
        el.style.transform = `translateY(${currentY * speed}px)`;
      });

      // 5. Atualização da secção ativa na régua lateral
      const scrollCheck = currentY + window.innerHeight * 0.38;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollCheck >= top && scrollCheck < top + height) {
            if (currentActiveSection !== id) {
              currentActiveSection = id;
              
              // Atualiza indicador da secção na régua lateral
              milestones.forEach(m => {
                const dot = m.querySelector('.milestone-dot');
                if (m.getAttribute('data-target') === id) {
                  if (dot) {
                    dot.classList.remove('bg-neutral-700');
                    dot.classList.add('bg-white', 'scale-125');
                  }
                } else {
                  if (dot) {
                    dot.classList.remove('bg-white', 'scale-125');
                    dot.classList.add('bg-neutral-700');
                  }
                }
              });

              // Disparo acústico temático único de transição de secção
              if (!visitedSections.has(id)) {
                visitedSections.add(id);
                try {
                  if (id === 'quemsomos') sound.playRealScissors();
                  else if (id === 'servicos') sound.playHairCutClipper(0.9);
                  else if (id === 'cartao') sound.playHeavyStamp();
                  else if (id === 'galeria') sound.playWaterSpray();
                  else if (id === 'feedbacks') sound.playScissorsSnip();
                  else if (id === 'contacto') sound.playRazorStrop();
                } catch(e) {}
              }
            }
            break;
          }
        }
      }
    }, { passive: true });

    /* ========================================================
       OBSERVER: DIVISÓRIAS DE NAVALHA & REVEALS CINEMATOGRÁFICOS
       ======================================================== */
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(r => revealObserver.observe(r));



    /* ========================================================
       DRAWER DE NAVEGAÇÃO MOBILE (COM ANIMAÇÃO & BACKDROP)
       ======================================================== */
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    let isMobileMenuOpen = false;

    function openMobileMenu() {
      if (!mobileMenu) return;
      isMobileMenuOpen = true;
      mobileMenu.classList.remove('hidden');
      if (mobileBackdrop) mobileBackdrop.classList.remove('hidden');
      
      requestAnimationFrame(() => {
        mobileMenu.classList.remove('-translate-y-2', 'opacity-0');
        mobileMenu.classList.add('translate-y-0', 'opacity-100');
        if (mobileBackdrop) {
          mobileBackdrop.classList.remove('opacity-0');
          mobileBackdrop.classList.add('opacity-100');
        }
      });
      if (mobileBtn) {
        mobileBtn.innerHTML = '<i class="fa-solid fa-xmark text-lg"></i>';
        mobileBtn.setAttribute('aria-expanded', 'true');
      }
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      if (!mobileMenu || !isMobileMenuOpen) return;
      isMobileMenuOpen = false;
      mobileMenu.classList.add('-translate-y-2', 'opacity-0');
      mobileMenu.classList.remove('translate-y-0', 'opacity-100');
      if (mobileBackdrop) {
        mobileBackdrop.classList.add('opacity-0');
        mobileBackdrop.classList.remove('opacity-100');
      }
      setTimeout(() => {
        if (!isMobileMenuOpen) {
          mobileMenu.classList.add('hidden');
          if (mobileBackdrop) mobileBackdrop.classList.add('hidden');
        }
      }, 200);
      if (mobileBtn) {
        mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }

    function toggleMobileMenu() {
      try { sound.playClick(); } catch (e) {}
      if (isMobileMenuOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    if (mobileBtn) {
      mobileBtn.addEventListener('click', toggleMobileMenu);
    }
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMobileMenu);
    }
    document.querySelectorAll('.mobile-item').forEach(item => {
      item.addEventListener('click', closeMobileMenu);
    });

    window.closeMobileMenu = closeMobileMenu;
    window.toggleMobileMenu = toggleMobileMenu;

    // Tecla ESC para fechar
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeBookingModal();
        closePhoto();
        closeMobileMenu();
      }
    });
