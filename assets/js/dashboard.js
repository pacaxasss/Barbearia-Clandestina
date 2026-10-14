/* ========================================================
       CONSTANTES E CONFIGURAÇÕES DE SEGURANÇA
       ======================================================== */
    // Hash SHA-256 predefinido para 'clandestina2019'
    const DEFAULT_PASS_HASH = '789a2c38d0f833b19de0b3caee9262b7f511fe3206acef5065c0c9eb7970a521';
    const VALID_USERS = ['admin', 'barbeiro', 'clandestina'];
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;
    const SESSION_TIMEOUT_MINUTES = 60;

    const STORAGE_KEY_PHOTOS = 'clandestina_gallery_photos';
    const STORAGE_KEY_FEEDBACKS = 'clandestina_client_feedbacks';
    const STORAGE_KEY_AUTH = 'clandestina_admin_session';
    const STORAGE_KEY_PASS_HASH = 'clandestina_admin_hash';
    const STORAGE_KEY_ATTEMPTS = 'clandestina_login_attempts';
    const STORAGE_KEY_LOCKOUT = 'clandestina_login_lockout';

    function resolvePhotoSrc(src) {
      if (!src) return '';
      if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('assets/')) {
        return src;
      }
      return 'assets/images/' + src;
    }

    // 4 Fotografias originais de fábrica
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


    // 3 Feedbacks de clientes originais de fábrica
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

    let currentDashboardTab = 'gallery';
    let currentNewRating = 5;
    let currentEditRating = 5;
    let currentPreparedImageBase64 = null;
    let photoInputMode = 'upload'; // 'upload' | 'url'
    let sessionInterval = null;
    let sessionRemainingSeconds = SESSION_TIMEOUT_MINUTES * 60;

    /* ========================================================
       FUNÇÕES CRIPTOGRÁFICAS (SHA-256 COM WEB CRYPTO API)
       ======================================================== */
    async function sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function generateSecureToken() {
      const array = new Uint8Array(24);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /* ========================================================
       VERIFICAÇÃO DE BLOQUEIO POR FORÇA BRUTA
       ======================================================== */
    function checkLockout() {
      const lockoutTimestamp = localStorage.getItem(STORAGE_KEY_LOCKOUT);
      if (!lockoutTimestamp) return false;

      const now = Date.now();
      const lockUntil = parseInt(lockoutTimestamp, 10);
      if (now < lockUntil) {
        const remainingMinutes = Math.ceil((lockUntil - now) / 60000);
        showLoginAlert(`Bloqueado por segurança devido a tentativas excessivas. Tenta novamente em ${remainingMinutes} minuto(s).`);
        return true;
      } else {
        localStorage.removeItem(STORAGE_KEY_LOCKOUT);
        localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
        return false;
      }
    }

    function recordFailedAttempt() {
      let attempts = parseInt(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || '0', 10) + 1;
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, attempts.toString());

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);
        localStorage.setItem(STORAGE_KEY_LOCKOUT, lockUntil.toString());
        showLoginAlert(`Demasiadas tentativas incorretas. Sistema bloqueado durante ${LOCKOUT_MINUTES} minutos.`);
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - attempts;
        showLoginAlert(`Credenciais incorretas. Tens mais ${remaining} tentativa(s) antes do bloqueio temporário.`);
      }
    }

    function showLoginAlert(msg) {
      const alertBox = document.getElementById('login-alert');
      const alertText = document.getElementById('login-alert-text');
      alertText.textContent = msg;
      alertBox.classList.remove('hidden');
    }

    function hideLoginAlert() {
      document.getElementById('login-alert').classList.add('hidden');
    }

    function togglePasswordVisibility() {
      const passInput = document.getElementById('login-pass');
      const icon = document.getElementById('toggle-pwd-icon');
      if (passInput.type === 'password') {
        passInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    }

    /* ========================================================
       PROCESSAMENTO DE LOGIN
       ======================================================== */
    async function handleLogin(e) {
      e.preventDefault();
      hideLoginAlert();

      if (checkLockout()) return;

      const user = document.getElementById('login-user').value.trim().toLowerCase();
      const pass = document.getElementById('login-pass').value;
      const remember = document.getElementById('login-remember').checked;

      const targetHash = localStorage.getItem(STORAGE_KEY_PASS_HASH) || DEFAULT_PASS_HASH;
      const inputHash = await sha256(pass);

      const isValidUser = VALID_USERS.includes(user);
      const isValidPass = (inputHash === targetHash);

      if (isValidUser && isValidPass) {
        // Sucesso
        localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEY_LOCKOUT);

        const sessionData = {
          token: generateSecureToken(),
          user: user,
          expires: Date.now() + (SESSION_TIMEOUT_MINUTES * 60 * 1000)
        };

        if (remember) {
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(sessionData));
        } else {
          sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(sessionData));
        }

        startDashboardSession();
      } else {
        recordFailedAttempt();
      }
    }

    function handleLogout() {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
      clearInterval(sessionInterval);

      document.getElementById('dashboard-app').classList.add('hidden');
      document.getElementById('auth-screen').classList.remove('hidden');
      document.getElementById('login-pass').value = '';
      showToast('Sessão terminada em segurança.', 'info');
    }

    function checkActiveSession() {
      const raw = sessionStorage.getItem(STORAGE_KEY_AUTH) || localStorage.getItem(STORAGE_KEY_AUTH);
      if (!raw) return false;

      try {
        const session = JSON.parse(raw);
        if (session && session.expires && Date.now() < session.expires) {
          return true;
        }
      } catch (e) {}

      localStorage.removeItem(STORAGE_KEY_AUTH);
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
      return false;
    }

    function startDashboardSession() {
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('dashboard-app').classList.remove('hidden');

      sessionRemainingSeconds = SESSION_TIMEOUT_MINUTES * 60;
      clearInterval(sessionInterval);
      sessionInterval = setInterval(updateSessionTimer, 1000);

      initGalleryManagement();
      initFeedbacksManagement();
      updateDashboardStats();
      showToast('Bem-vindo ao Painel de Gestão da Barbearia Clandestina.', 'success');
    }

    function updateSessionTimer() {
      sessionRemainingSeconds--;
      if (sessionRemainingSeconds <= 0) {
        handleLogout();
        showLoginAlert('Sessão expirada por inatividade. Por favor autentica-te novamente.');
        return;
      }

      const m = Math.floor(sessionRemainingSeconds / 60);
      const s = sessionRemainingSeconds % 60;
      const el = document.getElementById('session-timer');
      if (el) {
        el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    }

    // Reset ao temporizador em caso de interação do utilizador
    ['click', 'keydown', 'scroll'].forEach(evt => {
      window.addEventListener(evt, () => {
        if (checkActiveSession()) {
          sessionRemainingSeconds = SESSION_TIMEOUT_MINUTES * 60;
        }
      }, { passive: true });
    });

    /* ========================================================
       MODO DE INPUT: FICHEIRO VS URL
       ======================================================== */
    function setPhotoInputMode(mode) {
      photoInputMode = mode;
      const tabUpload = document.getElementById('tab-mode-upload');
      const tabUrl = document.getElementById('tab-mode-url');
      const containerUpload = document.getElementById('input-container-upload');
      const containerUrl = document.getElementById('input-container-url');

      if (mode === 'upload') {
        tabUpload.className = 'py-2 px-3 text-[11px] uppercase font-bold border border-white bg-white/10 text-white rounded-sm transition-colors text-center';
        tabUrl.className = 'py-2 px-3 text-[11px] uppercase font-bold border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white rounded-sm transition-colors text-center';
        containerUpload.classList.remove('hidden');
        containerUrl.classList.add('hidden');
      } else {
        tabUrl.className = 'py-2 px-3 text-[11px] uppercase font-bold border border-white bg-white/10 text-white rounded-sm transition-colors text-center';
        tabUpload.className = 'py-2 px-3 text-[11px] uppercase font-bold border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white rounded-sm transition-colors text-center';
        containerUrl.classList.remove('hidden');
        containerUpload.classList.add('hidden');
      }
    }

    /* ========================================================
       COMPRESSÃO INTELIGENTE DE IMAGEM VIA CANVAS
       ======================================================== */
    function compressImageFile(file, maxWidth = 1280, quality = 0.85) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          };
          img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
      });
    }

    async function processSelectedFile(file) {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Formato inválido. Por favor seleciona uma imagem (JPG, PNG ou WebP).', 'error');
        return;
      }

      showToast('A otimizar e comprimir imagem...', 'info');
      try {
        const compressedBase64 = await compressImageFile(file);
        currentPreparedImageBase64 = compressedBase64;

        const previewBox = document.getElementById('preview-box');
        const previewImg = document.getElementById('preview-img');
        const previewMeta = document.getElementById('preview-meta');

        previewImg.src = compressedBase64;
        const sizeKb = Math.round((compressedBase64.length * 3 / 4) / 1024);
        previewMeta.textContent = `Pronta (${sizeKb} KB otimizada)`;
        previewBox.classList.remove('hidden');
        showToast('Fotografia carregada com sucesso.', 'success');
      } catch (err) {
        showToast('Erro ao processar imagem.', 'error');
      }
    }

    function handleFileSelect(e) {
      const file = e.target.files[0];
      processSelectedFile(file);
    }

    function handleDragOver(e) {
      e.preventDefault();
      document.getElementById('drop-zone').classList.add('border-white', 'bg-neutral-900');
    }

    function handleDragLeave(e) {
      e.preventDefault();
      document.getElementById('drop-zone').classList.remove('border-white', 'bg-neutral-900');
    }

    function handleFileDrop(e) {
      e.preventDefault();
      document.getElementById('drop-zone').classList.remove('border-white', 'bg-neutral-900');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processSelectedFile(e.dataTransfer.files[0]);
      }
    }

    function handleUrlInput(e) {
      const url = e.target.value.trim();
      const previewBox = document.getElementById('preview-box');
      const previewImg = document.getElementById('preview-img');
      const previewMeta = document.getElementById('preview-meta');

      if (url.length > 3) {
        previewImg.src = url;
        previewMeta.textContent = 'Link externo / local';
        previewBox.classList.remove('hidden');
        currentPreparedImageBase64 = url;
      } else {
        previewBox.classList.add('hidden');
        currentPreparedImageBase64 = null;
      }
    }

    /* ========================================================
       GESTÃO DO REPOSITÓRIO DE FOTOGRAFIAS (LOCALSTORAGE)
       ======================================================== */
    function getStoredPhotos() {
      try {
        const data = localStorage.getItem(STORAGE_KEY_PHOTOS);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      return [...DEFAULT_FACTORY_PHOTOS];
    }

    function savePhotos(photos) {
      try {
        localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
        renderPhotosList();
        updateStorageStats();
        // Disparar evento para outras abas (index.html atualizar em direto)
        window.dispatchEvent(new Event('storage'));
        return true;
      } catch (e) {
        showToast('Erro de quota de armazenamento. Tenta usar uma foto menor.', 'error');
        return false;
      }
    }

    function initGalleryManagement() {
      // Se não houver fotos gravadas, inicializa com as 4 originais
      if (!localStorage.getItem(STORAGE_KEY_PHOTOS)) {
        localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(DEFAULT_FACTORY_PHOTOS));
      }
      renderPhotosList();
      updateStorageStats();
    }

    function renderPhotosList() {
      const photos = getStoredPhotos();
      const container = document.getElementById('photos-list');
      const emptyState = document.getElementById('empty-state');
      const countLabel = document.getElementById('count-active-photos');
      const totalStat = document.getElementById('stat-total-photos');

      countLabel.textContent = photos.length;
      totalStat.textContent = photos.length;

      if (photos.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
      }

      emptyState.classList.add('hidden');

      container.innerHTML = photos.map((photo, index) => {
        const num = String(index + 1).padStart(2, '0');
        const isFirst = index === 0;
        const isLast = index === photos.length - 1;

        return `
        <div class="border border-neutral-800 bg-[#161616] p-3 rounded-sm flex flex-col justify-between group hover:border-neutral-700 transition-all shadow-md">
          
          <!-- Imagem com Aspect Ratio Quadrado Fiel ao Site -->
          <div class="aspect-square w-full bg-black relative overflow-hidden rounded-sm mb-3">
            <img src="${resolvePhotoSrc(photo.src)}" alt="${escapeHtml(photo.caption)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-2 left-2 px-2 py-0.5 bg-black/85 border border-neutral-800 text-white font-mono text-[9px] font-bold uppercase">
              REGISTO #${num}
            </span>
          </div>

          <!-- Metadados da Foto -->
          <div class="flex-1 mb-3">
            <div class="font-mono text-[11px] font-bold text-white uppercase truncate mb-1" title="${escapeHtml(photo.title)}">
              ${escapeHtml(photo.title)}
            </div>
            <p class="font-sans text-[11px] text-neutral-400 line-clamp-2 leading-relaxed" title="${escapeHtml(photo.caption)}">
              ${escapeHtml(photo.caption)}
            </p>
          </div>

          <!-- Barra de Ações Rápidas -->
          <div class="pt-3 border-t border-neutral-800 flex items-center justify-between font-mono text-xs">
            <div class="flex items-center gap-1">
              <button
                onclick="movePhoto(${index}, -1)"
                ${isFirst ? 'disabled class="opacity-20 cursor-not-allowed px-2 py-1"' : 'class="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm"'}
                title="Mover para cima/esquerda"
              >
                <i class="fa-solid fa-arrow-left"></i>
              </button>
              <button
                onclick="movePhoto(${index}, 1)"
                ${isLast ? 'disabled class="opacity-20 cursor-not-allowed px-2 py-1"' : 'class="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm"'}
                title="Mover para baixo/direita"
              >
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div class="flex items-center gap-1">
              <button
                onclick="openEditModal('${photo.id}')"
                class="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-sm"
                title="Editar título e legenda"
              >
                <i class="fa-solid fa-pen-to-square text-[10px]"></i>
              </button>
              <button
                onclick="deletePhoto('${photo.id}')"
                class="px-2.5 py-1 bg-neutral-900 hover:bg-white text-neutral-400 hover:text-black border border-neutral-700/60 rounded-sm transition-colors"
                title="Remover foto da galeria"
              >
                <i class="fa-solid fa-trash text-[10px]"></i>
              </button>
            </div>
          </div>

        </div>
        `;
      }).join('');
    }

    function handleAddPhoto(e) {
      e.preventDefault();

      if (!currentPreparedImageBase64) {
        showToast('Por favor seleciona ou arrasta uma fotografia.', 'error');
        return;
      }

      const title = document.getElementById('photo-title').value.trim().toUpperCase();
      const caption = document.getElementById('photo-caption').value.trim();

      if (!title || !caption) {
        showToast('Preenche o título e a legenda da fotografia.', 'error');
        return;
      }

      const photos = getStoredPhotos();
      const newPhoto = {
        id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        src: currentPreparedImageBase64,
        title: title,
        caption: caption
      };

      photos.push(newPhoto);

      if (savePhotos(photos)) {
        showToast('Nova fotografia adicionada à galeria com sucesso!', 'success');
        // Limpar formulário
        document.getElementById('add-photo-form').reset();
        document.getElementById('preview-box').classList.add('hidden');
        currentPreparedImageBase64 = null;
      }
    }

    function deletePhoto(id) {
      if (!confirm('Tens a certeza de que desejas remover esta fotografia da galeria?')) return;

      const photos = getStoredPhotos().filter(p => p.id !== id);
      if (savePhotos(photos)) {
        showToast('Fotografia removida da galeria.', 'info');
      }
    }

    function movePhoto(index, direction) {
      const photos = getStoredPhotos();
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= photos.length) return;

      const temp = photos[index];
      photos[index] = photos[targetIndex];
      photos[targetIndex] = temp;

      savePhotos(photos);
      showToast('Ordem da galeria atualizada.', 'info');
    }

    function resetToDefaultPhotos() {
      if (!confirm('Desejas repor as 4 fotografias originais de fábrica? Quaisquer fotos personalizadas serão substituídas.')) return;

      savePhotos([...DEFAULT_FACTORY_PHOTOS]);
      showToast('Galeria restaurada para as fotos de fábrica.', 'success');
    }

    function exportGalleryBackup() {
      const photos = getStoredPhotos();
      const blob = new Blob([JSON.stringify(photos, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_galeria_clandestina_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Download do backup da galeria concluído.', 'success');
    }

    /* ========================================================
       ATUALIZAÇÃO DE ESTATÍSTICAS GERAIS DO DASHBOARD
       ======================================================== */
    function updateDashboardStats() {
      // 1. Fotos
      const photos = getStoredPhotos();
      const photoCount = photos.length;
      const elPhotos = document.getElementById('stat-total-photos');
      const elTabPhotos = document.getElementById('tab-count-photos');
      if (elPhotos) elPhotos.textContent = photoCount;
      if (elTabPhotos) elTabPhotos.textContent = photoCount;

      // 2. Feedbacks
      const feedbacks = getStoredFeedbacks();
      const feedbackCount = feedbacks.length;
      const elFeedbacks = document.getElementById('stat-total-feedbacks');
      const elTabFeedbacks = document.getElementById('tab-count-feedbacks');
      if (elFeedbacks) elFeedbacks.textContent = feedbackCount;
      if (elTabFeedbacks) elTabFeedbacks.textContent = feedbackCount;

      // 3. Média de estrelas
      const elAvg = document.getElementById('stat-avg-rating');
      if (elAvg) {
        if (feedbackCount === 0) {
          elAvg.textContent = '5.0 ★';
        } else {
          const sum = feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 5), 0);
          const avg = (sum / feedbackCount).toFixed(1);
          elAvg.textContent = `${avg} ★`;
        }
      }

      // 4. Espaço de armazenamento ocupado
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        totalBytes += (localStorage.getItem(key) || '').length * 2;
      }
      const kb = Math.round(totalBytes / 1024);
      const elStorage = document.getElementById('stat-storage-used');
      if (elStorage) elStorage.textContent = `${kb} KB`;
    }

    function updateStorageStats() {
      updateDashboardStats();
    }

    /* ========================================================
       MODAL DE EDIÇÃO DE FOTO
       ======================================================== */
    function openEditModal(photoId) {
      const photos = getStoredPhotos();
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      document.getElementById('edit-photo-id').value = photo.id;
      document.getElementById('edit-photo-title').value = photo.title;
      document.getElementById('edit-photo-caption').value = photo.caption;
      document.getElementById('edit-photo-preview').src = resolvePhotoSrc(photo.src);

      const modal = document.getElementById('edit-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeEditModal() {
      const modal = document.getElementById('edit-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function saveEditedPhoto(e) {
      e.preventDefault();
      const id = document.getElementById('edit-photo-id').value;
      const title = document.getElementById('edit-photo-title').value.trim().toUpperCase();
      const caption = document.getElementById('edit-photo-caption').value.trim();

      const photos = getStoredPhotos();
      const photo = photos.find(p => p.id === id);
      if (!photo) return;

      photo.title = title;
      photo.caption = caption;

      if (savePhotos(photos)) {
        closeEditModal();
        showToast('Registo da galeria atualizado com sucesso.', 'success');
      }
    }


    /* ========================================================
       GESTÃO DE ABAS DO DASHBOARD (GALERIA VS FEEDBACKS)
       ======================================================== */
    function switchDashboardTab(tab) {
      currentDashboardTab = tab;
      const secGallery = document.getElementById('section-gallery');
      const secFeedbacks = document.getElementById('section-feedbacks');
      const btnGallery = document.getElementById('btn-tab-gallery');
      const btnFeedbacks = document.getElementById('btn-tab-feedbacks');

      if (tab === 'gallery') {
        if (secGallery) secGallery.classList.remove('hidden');
        if (secFeedbacks) secFeedbacks.classList.add('hidden');
        if (btnGallery) {
          btnGallery.className = 'px-6 py-3 bg-white text-black font-title text-xl uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 font-bold shadow-lg';
        }
        if (btnFeedbacks) {
          btnFeedbacks.className = 'px-6 py-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-title text-xl uppercase tracking-wider rounded-sm transition-all flex items-center gap-2';
        }
      } else {
        if (secGallery) secGallery.classList.add('hidden');
        if (secFeedbacks) secFeedbacks.classList.remove('hidden');
        if (btnFeedbacks) {
          btnFeedbacks.className = 'px-6 py-3 bg-white text-black font-title text-xl uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 font-bold shadow-lg';
        }
        if (btnGallery) {
          btnGallery.className = 'px-6 py-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-title text-xl uppercase tracking-wider rounded-sm transition-all flex items-center gap-2';
        }
      }
    }

    /* ========================================================
       SELEÇÃO INTERATIVA DE ESTRELAS
       ======================================================== */
    function setNewRating(val) {
      currentNewRating = Math.max(1, Math.min(5, val));
      const input = document.getElementById('feedback-rating');
      if (input) input.value = currentNewRating;

      const stars = document.querySelectorAll('.new-star-btn');
      stars.forEach((star, idx) => {
        if (idx < currentNewRating) {
          star.classList.remove('text-neutral-600');
          star.classList.add('text-white');
        } else {
          star.classList.remove('text-white');
          star.classList.add('text-neutral-600');
        }
      });
      const label = document.getElementById('new-rating-label');
      if (label) label.textContent = `${currentNewRating} / 5 Estrelas`;
    }

    function setEditRating(val) {
      currentEditRating = Math.max(1, Math.min(5, val));
      const input = document.getElementById('edit-feedback-rating');
      if (input) input.value = currentEditRating;

      const stars = document.querySelectorAll('.edit-star-btn');
      stars.forEach((star, idx) => {
        if (idx < currentEditRating) {
          star.classList.remove('text-neutral-600');
          star.classList.add('text-white');
        } else {
          star.classList.remove('text-white');
          star.classList.add('text-neutral-600');
        }
      });
      const label = document.getElementById('edit-rating-label');
      if (label) label.textContent = `${currentEditRating} / 5 Estrelas`;
    }

    /* ========================================================
       GESTÃO DO REPOSITÓRIO DE FEEDBACKS (LOCALSTORAGE)
       ======================================================== */
    function getStoredFeedbacks() {
      try {
        const data = localStorage.getItem(STORAGE_KEY_FEEDBACKS);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      return [...DEFAULT_FACTORY_FEEDBACKS];
    }

    function saveFeedbacks(feedbacks) {
      try {
        localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(feedbacks));
        renderFeedbacksList();
        updateDashboardStats();
        // Disparar evento para outras abas (index.html atualizar em direto)
        window.dispatchEvent(new Event('storage'));
        return true;
      } catch (e) {
        showToast('Erro ao gravar comentários na memória.', 'error');
        return false;
      }
    }

    function initFeedbacksManagement() {
      if (!localStorage.getItem(STORAGE_KEY_FEEDBACKS)) {
        localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(DEFAULT_FACTORY_FEEDBACKS));
      }
      renderFeedbacksList();
      updateDashboardStats();
    }

    function renderFeedbacksList() {
      const feedbacks = getStoredFeedbacks();
      const container = document.getElementById('feedbacks-list');
      const emptyState = document.getElementById('empty-feedbacks-state');
      if (!container) return;

      if (feedbacks.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }

      if (emptyState) emptyState.classList.add('hidden');

      container.innerHTML = feedbacks.map((fb, index) => {
        const isFirst = index === 0;
        const isLast = index === feedbacks.length - 1;
        const starsHtml = Array.from({ length: 5 }, (_, i) => {
          return i < (fb.rating || 5)
            ? '<i class="fa-solid fa-star text-white text-[10px]"></i>'
            : '<i class="fa-regular fa-star text-neutral-600 text-[10px]"></i>';
        }).join('');

        const initials = (fb.author || 'Cliente')
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(w => w[0].toUpperCase())
          .join('') || 'C';

        return `
        <div class="border border-neutral-800 bg-[#161616] p-4 rounded-sm flex flex-col justify-between group hover:border-neutral-700 transition-all shadow-md">
          
          <div>
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  ${initials}
                </div>
                <div>
                  <h4 class="font-title text-lg text-white uppercase leading-none tracking-wide">${escapeHtml(fb.author)}</h4>
                  <span class="font-mono text-[10px] text-neutral-400 block mt-0.5">${escapeHtml(fb.tag || 'Cliente')}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0 bg-neutral-900/80 px-2 py-1 rounded-sm border border-neutral-800">
                ${starsHtml}
              </div>
            </div>

            <p class="font-sans text-xs text-neutral-300 italic leading-relaxed my-3 bg-[#111111] p-3 rounded-sm border border-neutral-850">
              "${escapeHtml(fb.text)}"
            </p>

            <div class="font-mono text-[10px] text-neutral-500 uppercase flex items-center justify-between">
              <span>Data / Referência: ${escapeHtml(fb.date || 'Recente')}</span>
              <span class="text-neutral-400 font-bold">#${index + 1}</span>
            </div>
          </div>

          <div class="pt-3 mt-3 border-t border-neutral-800 flex items-center justify-between font-mono text-xs">
            <div class="flex items-center gap-1">
              <button
                onclick="moveFeedback(${index}, -1)"
                ${isFirst ? 'disabled class="opacity-20 cursor-not-allowed px-2 py-1"' : 'class="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm"'}
                title="Mover para cima"
              >
                <i class="fa-solid fa-arrow-up"></i>
              </button>
              <button
                onclick="moveFeedback(${index}, 1)"
                ${isLast ? 'disabled class="opacity-20 cursor-not-allowed px-2 py-1"' : 'class="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm"'}
                title="Mover para baixo"
              >
                <i class="fa-solid fa-arrow-down"></i>
              </button>
            </div>

            <div class="flex items-center gap-1">
              <button
                onclick="openEditFeedbackModal('${fb.id}')"
                class="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-sm"
                title="Editar comentário"
              >
                <i class="fa-solid fa-pen-to-square text-[10px]"></i>
              </button>
              <button
                onclick="deleteFeedback('${fb.id}')"
                class="px-2.5 py-1 bg-neutral-900 hover:bg-white text-neutral-400 hover:text-black border border-neutral-700/60 rounded-sm transition-colors"
                title="Remover comentário"
              >
                <i class="fa-solid fa-trash text-[10px]"></i>
              </button>
            </div>
          </div>

        </div>
        `;
      }).join('');
    }

    function handleAddFeedback(e) {
      e.preventDefault();
      const author = document.getElementById('feedback-author').value.trim();
      const tag = document.getElementById('feedback-tag').value.trim();
      const rating = parseInt(document.getElementById('feedback-rating').value, 10) || 5;
      const date = document.getElementById('feedback-date').value.trim() || 'Recente';
      const text = document.getElementById('feedback-text').value.trim();

      if (!author || !text) {
        showToast('Preenche o nome do cliente e o comentário.', 'error');
        return;
      }

      const feedbacks = getStoredFeedbacks();
      const newFeedback = {
        id: 'fb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        author: author,
        tag: tag || 'Cliente Habitual',
        rating: rating,
        date: date,
        text: text
      };

      feedbacks.push(newFeedback);

      if (saveFeedbacks(feedbacks)) {
        showToast('Novo feedback adicionado com sucesso!', 'success');
        document.getElementById('add-feedback-form').reset();
        setNewRating(5);
      }
    }

    function deleteFeedback(id) {
      if (!confirm('Tens a certeza de que desejas remover este comentário?')) return;
      const feedbacks = getStoredFeedbacks().filter(f => f.id !== id);
      if (saveFeedbacks(feedbacks)) {
        showToast('Comentário removido com sucesso.', 'info');
      }
    }

    function moveFeedback(index, direction) {
      const feedbacks = getStoredFeedbacks();
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= feedbacks.length) return;

      const temp = feedbacks[index];
      feedbacks[index] = feedbacks[targetIndex];
      feedbacks[targetIndex] = temp;

      saveFeedbacks(feedbacks);
      showToast('Ordem dos comentários atualizada.', 'info');
    }

    function resetToDefaultFeedbacks() {
      if (!confirm('Desejas repor os 3 comentários originais de fábrica?')) return;
      saveFeedbacks([...DEFAULT_FACTORY_FEEDBACKS]);
      showToast('Comentários restaurados para o padrão de fábrica.', 'success');
    }

    function exportFeedbacksBackup() {
      const feedbacks = getStoredFeedbacks();
      const blob = new Blob([JSON.stringify(feedbacks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_feedbacks_clandestina_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Download do backup de comentários concluído.', 'success');
    }

    function openEditFeedbackModal(id) {
      const feedbacks = getStoredFeedbacks();
      const fb = feedbacks.find(f => f.id === id);
      if (!fb) return;

      document.getElementById('edit-feedback-id').value = fb.id;
      document.getElementById('edit-feedback-author').value = fb.author;
      document.getElementById('edit-feedback-tag').value = fb.tag || '';
      document.getElementById('edit-feedback-date').value = fb.date || '';
      document.getElementById('edit-feedback-text').value = fb.text;
      setEditRating(fb.rating || 5);

      const modal = document.getElementById('edit-feedback-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeEditFeedbackModal() {
      const modal = document.getElementById('edit-feedback-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function saveEditedFeedback(e) {
      e.preventDefault();
      const id = document.getElementById('edit-feedback-id').value;
      const author = document.getElementById('edit-feedback-author').value.trim();
      const tag = document.getElementById('edit-feedback-tag').value.trim();
      const date = document.getElementById('edit-feedback-date').value.trim();
      const text = document.getElementById('edit-feedback-text').value.trim();
      const rating = parseInt(document.getElementById('edit-feedback-rating').value, 10) || 5;

      const feedbacks = getStoredFeedbacks();
      const fb = feedbacks.find(f => f.id === id);
      if (!fb) return;

      fb.author = author;
      fb.tag = tag;
      fb.date = date;
      fb.text = text;
      fb.rating = rating;

      if (saveFeedbacks(feedbacks)) {
        closeEditFeedbackModal();
        showToast('Comentário atualizado com sucesso.', 'success');
      }
    }

    /* ========================================================
       MODAL DE ALTERAÇÃO DE PALAVRA-PASSE
       ======================================================== */
    function openChangePasswordModal() {
      document.getElementById('pwd-modal-alert').classList.add('hidden');
      document.getElementById('change-pwd-form').reset();
      const modal = document.getElementById('password-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeChangePasswordModal() {
      const modal = document.getElementById('password-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    async function handleChangePassword(e) {
      e.preventDefault();
      const current = document.getElementById('pwd-current').value;
      const newPwd = document.getElementById('pwd-new').value;
      const confirmPwd = document.getElementById('pwd-confirm').value;
      const alertBox = document.getElementById('pwd-modal-alert');

      if (newPwd !== confirmPwd) {
        alertBox.textContent = 'A confirmação não coincide com a nova palavra-passe.';
        alertBox.classList.remove('hidden');
        return;
      }

      if (newPwd.length < 6) {
        alertBox.textContent = 'A nova palavra-passe deve ter pelo menos 6 caracteres.';
        alertBox.classList.remove('hidden');
        return;
      }

      const storedHash = localStorage.getItem(STORAGE_KEY_PASS_HASH) || DEFAULT_PASS_HASH;
      const currentHash = await sha256(current);

      if (currentHash !== storedHash) {
        alertBox.textContent = 'Palavra-passe atual incorreta.';
        alertBox.classList.remove('hidden');
        return;
      }

      const newHash = await sha256(newPwd);
      localStorage.setItem(STORAGE_KEY_PASS_HASH, newHash);

      closeChangePasswordModal();
      showToast('Palavra-passe de administrador alterada com sucesso!', 'success');
    }

    /* ========================================================
       SISTEMA DE TOASTS VISUAIS
       ======================================================== */
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');

      const bgClass = type === 'success' ? 'bg-[#141414] border-white text-white' :
                      type === 'error'   ? 'bg-[#181818] border-neutral-400 text-white' :
                                           'bg-[#141414] border-neutral-700 text-neutral-200';

      const icon = type === 'success' ? 'fa-circle-check text-white' :
                   type === 'error'   ? 'fa-circle-exclamation text-white' :
                                        'fa-info-circle text-neutral-400';

      toast.className = `p-3.5 border border-l-4 rounded-sm shadow-2xl font-mono text-xs flex items-center gap-3 transition-all duration-300 transform translate-x-4 opacity-0 ${bgClass}`;
      toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
      `;

      container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.remove('translate-x-4', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    /* ========================================================
       INICIALIZAÇÃO NO CARREGAMENTO DA PÁGINA
       ======================================================== */
    window.addEventListener('DOMContentLoaded', () => {
      checkLockout();

      if (checkActiveSession()) {
        startDashboardSession();
      } else {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('dashboard-app').classList.add('hidden');
      }
    });
