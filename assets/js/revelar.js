// Animações ao rolar das páginas de matéria (Sobre e projetos): cada parte anima uma vez, quando entra na tela.
// O título da seção entra pela máscara, palavra por palavra (como o título dos slides); o resto sobe e aparece em
// sequência; os números do "Em resumo" contam até o valor; a foto do "Quem sou" se descobre de baixo para cima.
// Só o script esconde as partes: sem ele (ou com movimento reduzido), tudo já aparece pronto.

// Valor mostrado na contagem quando ela está em "progresso" (de 0 a 1).
export function contar(valor, progresso) {
  return Math.round(valor * Math.min(1, Math.max(0, progresso)));
}

const SECOES = '.materia__secao, .materia__ficha, .materia__acoes, .materia__nota, .materia__proximo';
const TITULO = ':scope > h2, .materia__proximo-nome';
const ITENS = [
  ':scope > p', ':scope > ul > li', ':scope > ol > li', ':scope > dl > div', ':scope > .botao',
  '.materia__quem p', '.contato__grade > div > p', '.contato__canais > div', '.formulario__campo', '.formulario__fim',
  '.materia__proximo-rotulo', '.materia__proximo-frase',
].join(', ');

// O número fica para o leitor de tela num texto escondido; a parte visível é a que conta.
function preparaContagem(el) {
  const valor = Number(el.textContent.trim());
  if (!Number.isFinite(valor)) return null;
  const visivel = document.createElement('span');
  visivel.setAttribute('aria-hidden', 'true');
  visivel.textContent = '0';
  const leitor = document.createElement('span');
  leitor.className = 'so-leitor';
  leitor.textContent = String(valor);
  el.replaceChildren(visivel, leitor);
  return { valor, visivel };
}

function animacaoDaSecao(secao, gsap, SplitText) {
  const titulo = secao.querySelector(TITULO);
  const itens = [...secao.querySelectorAll(ITENS)];
  const foto = secao.querySelector('.materia__quem img');
  const numeros = [...secao.querySelectorAll('.numeros__valor')].map(preparaContagem).filter(Boolean);
  const limpar = [];
  const tl = gsap.timeline({ paused: true, onComplete: () => gsap.set(limpar, { clearProps: 'transform,opacity,clipPath' }) });

  let depois = 0;
  if (titulo) {
    const s = SplitText.create(titulo, { type: 'words', mask: 'words', aria: 'none' });
    gsap.set(s.masks, { paddingBlock: '.15em', marginBlock: '-.15em' });
    tl.fromTo(s.words, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, 0);
    depois = 0.15;
  }
  if (foto) {
    tl.fromTo(foto, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.9, ease: 'power3.out' }, 0.05);
    limpar.push(foto);
  }
  // Uma parte sem título nem itens (a nota das telas) anima inteira.
  const blocos = itens.length || titulo ? itens : [secao];
  if (blocos.length) {
    // Cada item volta à opacidade que tem no CSS (a nota e o "Atualizado em" ficam em 65%), e não a 100%.
    const opacidades = blocos.map(el => Number(getComputedStyle(el).opacity) || 1);
    tl.fromTo(blocos, { opacity: 0, y: 30 }, { opacity: i => opacidades[i], y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, depois);
    limpar.push(...blocos);
  }
  for (const { valor, visivel } of numeros) {
    const contagem = { p: 0 };
    tl.to(contagem, { p: 1, duration: 1.0, ease: 'power2.out', onUpdate: () => { visivel.textContent = String(contar(valor, contagem.p)); } }, depois + 0.05);
  }
  return tl.getChildren().length ? tl : null;
}

// cartoes: os cartões da grade que estavam abaixo da tela na abertura (eles entram aqui, e não na abertura).
export function revelarAoRolar({ cartoes = [], reduzirMovimento = false } = {}) {
  const { gsap, SplitText } = window;
  if (reduzirMovimento || !('IntersectionObserver' in window)) return;

  const animacoes = new Map();
  for (const secao of document.querySelectorAll(SECOES)) {
    const tl = animacaoDaSecao(secao, gsap, SplitText);
    if (tl) animacoes.set(secao, tl);
  }
  for (const cartao of cartoes) {
    const tl = gsap.timeline({ paused: true, onComplete: () => gsap.set(cartao, { clearProps: 'transform,opacity' }) });
    tl.fromTo(cartao, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
    animacoes.set(cartao, tl);
  }

  // Cada parte anima quando o topo dela passa de 88% da altura da tela; depois deixa de ser observada.
  const observador = new IntersectionObserver(entradas => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      observador.unobserve(entrada.target);
      animacoes.get(entrada.target)?.play();
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  for (const alvo of animacoes.keys()) observador.observe(alvo);
}
