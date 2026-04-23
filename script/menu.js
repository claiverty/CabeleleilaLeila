const menuToggle = document.querySelector('#menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

// abre e fecha o menu mobile
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });

  // fecha ao clicar fora
  document.addEventListener('click', (event) => {
    const clicouNoBotao = menuToggle.contains(event.target);
    const clicouNoMenu = mobileMenu.contains(event.target);

    if (!clicouNoBotao && !clicouNoMenu) {
      mobileMenu.classList.remove('is-open');
    }
  });
}