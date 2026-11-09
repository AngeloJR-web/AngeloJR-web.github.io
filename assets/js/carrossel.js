// Carrossel do Início: monta os cartões a partir dos slides do HTML e posiciona tudo com a geometria medida.
import { chegada, descobrir } from './comum.js';
import { criarCarrossel, numeroRomano } from './estado.js';
import { calcularCartoes } from './geometria.js';

const palco = document.querySelector('.palco');
const artigos = [...palco.querySelectorAll('.slide')];
const total = artigos.length;

// Telas em pé precisam cobrir a altura (foto 16:9 → 178vh de largura); num notebook, 1600 px bastam.
const TAMANHOS = '(orientation: portrait) 178vh, (min-width: 1600px) 117vw, min(117vw, 1600px)';

export const slides = artigos.map(el => ({
  el,
  id: el.id,
  nome: el.dataset.nome,
  etiqueta: el.dataset.etiqueta,
  abre: el.dataset.abre,
  base: el.dataset.foto,
  cabecalho: { titulo: el.dataset.materiaTitulo, italico: el.dataset.materiaItalico },
  cartao: null,
  foto: null,
}));

const indiceDoEndereco = () => Math.max(0, slides.findIndex(s => `#${s.id}` === location.hash));

export const estado = criarCarrossel({ total, inicial: indiceDoEndereco() });
export const visual = { atual: estado.atual, abertura: 1, deslocamento: 0 };

/* ---------- Montagem ---------- */

const trilho = document.createElement('div');
trilho.className = 'trilho';
for (const [i, s] of slides.entries()) {
  const cartao = document.createElement('div');
  cartao.className = 'cartao';
  const foto = document.createElement('img');
  foto.className = 'cartao__foto';
  foto.alt = '';
  foto.decoding = 'async';
  foto.sizes = TAMANHOS;
  foto.style.objectPosition = s.el.dataset.foco;
  const escurecer = s.el.style.getPropertyValue('--escurecer');
  if (escurecer) cartao.style.setProperty('--escurecer', escurecer);
  cartao.append(foto);
  trilho.append(cartao);
  s.cartao = cartao;
  s.foto = foto;

  s.el.setAttribute('role', 'group');
  s.el.setAttribute('aria-roledescription', 'slide');
  s.el.setAttribute('aria-label', `${i + 1} de ${total}: ${s.nome}`);
}
palco.prepend(trilho);

// Distância circular entre dois slides.
function distancia(a, b) {
  let d = (((a - b) % total) + total) % total;
  if (d > total / 2) d -= total;
  return Math.abs(d);
}

// Põe a foto nos cartões a até `raio` slides de `centro` (decisão R8: só o que está perto).
export function carregarFotos(raio, centro = visual.atual) {
  for (const [i, s] of slides.entries()) {
    if (s.foto.srcset || distancia(i, centro) > raio) continue;
    if (i === centro) s.foto.fetchPriority = 'high';
    s.foto.srcset = `${s.base}-960.webp 960w, ${s.base}-1600.webp 1600w, ${s.base}-2400.webp 2400w`;
  }
}

/* ---------- Posição e rótulos ---------- */

export function posicionar() {
  const largura = palco.clientWidth;
  const altura = palco.clientHeight;
  for (const c of calcularCartoes({ largura, altura, total, ...visual })) {
    const { cartao, foto } = slides[c.indice];
    cartao.style.transform = `translateX(${c.centroX - largura / 2}px)`;
    cartao.style.clipPath = `inset(${(altura - c.altura) / 2}px ${(largura - c.largura) / 2}px)`;
    cartao.style.visibility = c.visivel ? 'visible' : 'hidden';
    foto.style.transform = `translate(-50%, -50%) translateX(${c.desvioFoto}px) scale(${c.escalaFoto})`;
  }
}

const numeral = document.querySelector('.paginacao__atual > span');
const etiqueta = document.querySelector('.lateral__etiqueta');
const botao = document.querySelector('.segurar');
const anuncio = document.getElementById('anuncio');
document.querySelector('.paginacao__total').textContent = numeroRomano(total);

// Numeral da paginação e etiqueta vertical (trocam no meio do deslize).
export function trocarNumeral(i) {
  numeral.textContent = numeroRomano(i + 1);
  etiqueta.textContent = slides[i].etiqueta;
}

// Slide visível para o leitor de tela e o teclado, botão do círculo e aviso da troca.
export function trocarSlideAtivo(i, { anunciar = true } = {}) {
  for (const [j, s] of slides.entries()) {
    const ativo = j === i;
    s.el.classList.toggle('is-atual', ativo);
    s.el.inert = !ativo;
    if (ativo) s.el.removeAttribute('aria-hidden');
    else s.el.setAttribute('aria-hidden', 'true');
  }
  botao.setAttribute('aria-label', slides[i].abre === 'sobre.html' ? 'Abrir a página Sobre' : `Abrir o projeto ${slides[i].nome}`);
  if (anunciar) anuncio.textContent = `${i + 1} de ${total}: ${slides[i].nome}`;
}

/* ---------- Início ---------- */

trocarNumeral(visual.atual);
trocarSlideAtivo(visual.atual, { anunciar: false });
posicionar();
carregarFotos(0);
addEventListener('load', () => carregarFotos(1), { once: true });

// posicionar() mexe em 6 elementos: dá para chamar direto em cada evento (inclusive no meio de uma troca).
addEventListener('resize', posicionar);
addEventListener('orientationchange', posicionar);

if (chegada === 'preta') descobrir();
