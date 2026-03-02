// Funcionalidade de hover nas cores do catálogo
document.addEventListener('DOMContentLoaded', function() {
  // Seleciona todos os cards de moto
  const motoCards = document.querySelectorAll('.moto-card');

  motoCards.forEach(card => {
    const img = card.querySelector('.moto-card-img');
    const colorDots = card.querySelectorAll('.moto-color-dot');

    colorDots.forEach(dot => {
      // Evento de hover - trocar imagem
      dot.addEventListener('mouseenter', function() {
        const newImage = this.getAttribute('data-image');
        if (newImage && img) {
          img.src = newImage;

          // Remove active de todos os dots do card
          colorDots.forEach(d => d.classList.remove('active'));
          // Adiciona active no dot atual
          this.classList.add('active');
        }
      });
    });

    // Evento de mouseleave no container de cores - volta para a imagem ativa
    const colorsContainer = card.querySelector('.moto-colors-dots');
    if (colorsContainer) {
      colorsContainer.addEventListener('mouseleave', function() {
        // Mantém a cor ativa (não volta para a original)
        // A imagem permanece na última cor selecionada
      });
    }
  });
});
