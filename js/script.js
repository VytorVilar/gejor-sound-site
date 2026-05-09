const menu = document.getElementById('menu');
const mobileToggle = document.getElementById('mobileToggle');

mobileToggle.addEventListener('click', () => {
  menu.classList.toggle('active');
  mobileToggle.textContent = menu.classList.contains('active') ? '×' : '☰';
});

document.querySelectorAll('.menu a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('active');
    mobileToggle.textContent = '☰';
  });
});

const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.86;

  revealElements.forEach(element => {
    const top = element.getBoundingClientRect().top;

    if (top < trigger) {
      element.classList.add('active');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

function sendWhatsApp(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const carro = document.getElementById('carro').value.trim();
  const tipo = document.getElementById('tipo').value;
  const mensagem = document.getElementById('mensagem').value.trim();

  const texto = `Olá, GEJOR SOUND! Meu nome é ${nome}. Tenho um ${carro}. Quero orçamento para: ${tipo}. ${mensagem ? 'Mensagem: ' + mensagem : ''}`;

  const telefone = '5511948930695';
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;

  window.open(url, '_blank');
}
