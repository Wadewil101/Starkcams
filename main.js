/* =====================================================
   main.js — Animaciones de scroll + formulario de contacto
   ===================================================== */

// Animación de aparición al hacer scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


// Formulario de contacto general → abre WhatsApp
document.querySelector('.btn-enviar').addEventListener('click', () => {
  const nombre   = document.querySelectorAll('.contact-form input')[0].value.trim();
  const servicio = document.querySelector('.contact-form select').value;
  const mensaje  = document.querySelector('.contact-form textarea').value.trim();

  if (!nombre || !servicio) {
    alert('Por favor completa al menos tu nombre y el servicio que necesitas.');
    return;
  }

  const texto = `Hola, soy ${nombre}. Necesito: ${servicio}.${mensaje ? ' Detalle: ' + mensaje : ''}`;
  const url   = `https://wa.me/59177494440?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
});
