/**
 * PARALLAX OTIMIZADO - MOTO AGORA
 * Performance-first parallax scrolling
 */

(function() {
  'use strict';

  // Configurações
  const CONFIG = {
    enabled: window.innerWidth > 768, // Desabilita em mobile
    throttle: 16, // ~60fps
    speeds: {
      slow: 0.3,
      medium: 0.5,
      fast: 0.7
    }
  };

  if (!CONFIG.enabled) {
    console.log('📱 Parallax desabilitado em mobile');
    return;
  }

  // Estado
  let ticking = false;
  let lastScrollY = window.scrollY;

  // Elementos parallax
  const parallaxElements = [];

  // Inicializar elementos
  function initParallax() {
    // Hero background (homepage)
    const heroVideo = document.querySelector('.hero video');
    if (heroVideo) {
      parallaxElements.push({
        element: heroVideo.parentElement,
        speed: CONFIG.speeds.slow,
        type: 'background'
      });
    }

    // Hero image (product pages)
    const heroImageSection = document.querySelector('.hero-image-section');
    if (heroImageSection) {
      parallaxElements.push({
        element: heroImageSection,
        speed: CONFIG.speeds.slow,
        type: 'hero-image'
      });
    }

    // Benefícios cards
    const beneficiosCards = document.querySelectorAll('.beneficio-card');
    beneficiosCards.forEach((card, index) => {
      parallaxElements.push({
        element: card,
        speed: CONFIG.speeds.medium + (index % 3) * 0.1, // Velocidades variadas
        type: 'card'
      });
    });

    // CTA Banners
    const ctaBanners = document.querySelectorAll('.cta-banner');
    ctaBanners.forEach(banner => {
      parallaxElements.push({
        element: banner,
        speed: CONFIG.speeds.slow,
        type: 'banner'
      });
    });

    // Cards de motos - PARALLAX REMOVIDO
    // const motoCards = document.querySelectorAll('.moto-card');
    // motoCards.forEach((card, index) => {
    //   parallaxElements.push({
    //     element: card,
    //     speed: CONFIG.speeds.fast,
    //     type: 'card',
    //     delay: index * 0.05 // Efeito cascata
    //   });
    // });

    console.log(`✅ Parallax inicializado: ${parallaxElements.length} elementos`);
  }

  // Calcular posição parallax
  function calculateParallax(element, speed, scrollY) {
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;

    // Elemento visível?
    if (rect.top > windowHeight || rect.bottom < 0) {
      return null; // Fora da viewport
    }

    // Calcular offset
    const scrollProgress = (scrollY + windowHeight - elementTop) / (windowHeight + elementHeight);
    const offset = (scrollY - elementTop) * speed;

    return {
      offset,
      progress: Math.max(0, Math.min(1, scrollProgress))
    };
  }

  // Aplicar transformação
  function applyTransform(item, scrollY) {
    const result = calculateParallax(item.element, item.speed, scrollY);

    if (result === null) return;

    const { offset } = result;

    // Aplicar baseado no tipo
    switch (item.type) {
      case 'background':
        item.element.style.transform = `translateY(${offset * 0.5}px)`;
        break;

      case 'hero-image':
        // Parallax suave para hero image das páginas de produto
        item.element.style.transform = `translateY(${offset * 0.3}px)`;
        break;

      case 'card':
        item.element.style.transform = `translateY(${-offset * 0.3}px)`;
        break;

      case 'banner':
        // Parallax muito sutil para banners
        item.element.style.transform = `translateY(${offset * 0.2}px)`;
        break;
    }
  }

  // Update loop otimizado
  function updateParallax() {
    const scrollY = window.scrollY;

    parallaxElements.forEach(item => {
      applyTransform(item, scrollY);
    });

    lastScrollY = scrollY;
    ticking = false;
  }

  // Scroll handler com throttle
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  // Resize handler
  function onResize() {
    // Recalcular se mudou para/de mobile
    const shouldEnable = window.innerWidth > 768;

    if (shouldEnable !== CONFIG.enabled) {
      location.reload(); // Recarrega se mudou viewport
    }
  }

  // Adicionar will-change apenas durante scroll
  let scrollTimeout;
  function optimizePerformance() {
    parallaxElements.forEach(item => {
      item.element.style.willChange = 'transform';
    });

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      parallaxElements.forEach(item => {
        item.element.style.willChange = 'auto';
      });
    }, 200);
  }

  // Scroll com otimização
  function handleScroll() {
    optimizePerformance();
    onScroll();
  }

  // Inicializar quando DOM carregar
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initParallax);
    } else {
      initParallax();
    }

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Primeira execução
    updateParallax();
  }

  // Start
  init();

  // Expor para debug
  window.MotoAgoraParallax = {
    elements: parallaxElements,
    config: CONFIG,
    update: updateParallax
  };

})();
