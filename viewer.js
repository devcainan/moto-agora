// ── 360 Viewer ──
// PADRÃO: Cada cor pode ter direção de rotação diferente
// Use data-reverse="true" no HTML para inverter a direção de uma cor específica
// Use data-frames="N" no HTML para especificar quantas imagens a cor tem

(function() {
  // Dynamic frame count - changes per color
  let currentTotal = 16;
  let frames = [];

  const stage = document.getElementById('v360Stage');
  const colorItems = document.querySelectorAll('.modelos-color-item');
  const wrap = document.getElementById('v360Wrap');

  console.log("360 Viewer carregado!");

  let current = 0, isDragging = false, startX = 0, accum = 0;
  let currentReverse = false; // Direção da cor atual
  const SENS = 50;

  function showFrame(n) {
    current = ((n % currentTotal) + currentTotal) % currentTotal;
    console.log("Mostrando frame:", current, "de", currentTotal);
    frames.forEach((f, i) => {
      f.style.display = i === current ? 'block' : 'none';
    });
  }

  function changeColor(folder, reverse = false, frameCount = 16) {
    console.log("Trocando para cor:", folder, "Frames:", frameCount, "Reverso:", reverse);

    // Update current settings
    currentReverse = reverse;
    currentTotal = frameCount;
    current = 0; // Reset to first frame when changing colors

    // Clear existing frames
    stage.innerHTML = '';
    frames = [];

    // Create new frames dynamically
    for (let i = 0; i < frameCount; i++) {
      const img = document.createElement('img');
      img.draggable = false;
      img.className = 'v360-frame';
      img.src = `imagens/motos/Yamaha Factor 2026/${folder}/${i + 1}.png`;
      img.alt = `Yamaha Factor 150 - ${folder} - ângulo ${i + 1}`;
      img.width = 901;
      img.height = 600;
      img.style.display = 'none';

      // Error handling for missing images
      img.onerror = function() {
        console.warn(`Imagem não encontrada: ${this.src}`);
      };

      stage.appendChild(img);
      frames.push(img);
    }

    console.log("Frames criados:", frames.length);

    // Show second-to-last frame by default
    showFrame(currentTotal - 2);
  }

  // Initialize viewer with default (active) color
  function initViewer() {
    const activeColor = document.querySelector('.modelos-color-item.active');
    if (activeColor) {
      const folder = activeColor.dataset.folder;
      const reverse = activeColor.dataset.reverse === 'true';
      const frameCount = parseInt(activeColor.dataset.frames) || 16;

      console.log("Inicializando viewer com:", folder, frameCount, "frames");
      changeColor(folder, reverse, frameCount);
    } else {
      console.error("Nenhuma cor ativa encontrada!");
    }
  }

  // Color change event
  colorItems.forEach(item => {
    item.addEventListener('click', () => {
      colorItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const folder = item.dataset.folder;
      const reverse = item.dataset.reverse === 'true';
      const frameCount = parseInt(item.dataset.frames) || 16;

      changeColor(folder, reverse, frameCount);
    });
  });

  // Mouse drag
  wrap.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
    accum = 0;
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    accum += e.clientX - startX;
    startX = e.clientX;
    const steps = Math.round(accum / SENS);
    if (steps !== 0) {
      // Aplica direção baseada na cor
      const direction = currentReverse ? -steps : steps;
      showFrame(current + direction);
      accum -= steps * SENS;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch drag
  wrap.addEventListener('touchstart', e => {
    isDragging = true;
    startX = e.touches[0].clientX;
    accum = 0;
  }, {passive: true});

  wrap.addEventListener('touchmove', e => {
    if (!isDragging) return;
    accum += e.touches[0].clientX - startX;
    startX = e.touches[0].clientX;
    const steps = Math.round(accum / SENS);
    if (steps !== 0) {
      const direction = currentReverse ? -steps : steps;
      showFrame(current + direction);
      accum -= steps * SENS;
    }
  }, {passive: true});

  wrap.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Initialize on load
  console.log("Inicializando viewer...");
  initViewer();
})();
