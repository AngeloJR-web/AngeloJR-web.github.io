// Carrossel do Início: monta os cartões a partir dos slides do HTML, posiciona tudo com a geometria
// medida e anima a troca de slide com os tempos e as curvas do vídeo (spec 7.1).
import { chegada, descobrir, fecharMenu, navegarCom, reduzirMovimento } from './comum.js';
import { criarCarrossel, criarFiltroDeGesto, numeroRomano } from './estado.js';
import { calcularCartoes } from './geometria.js';
import { cronograma } from './cronograma.js';
import { criarGiro } from './giro.js';
import { criarSegurar } from './segurar.js';

const { gsap, SplitText, Observer } = window;

const palco = document.querySelector('.palco');
const artigos = [...palco.querySelectorAll('.slide')];
const total = artigos.length;

// Telas em pé precisam cobrir a altura (foto 16:9 → 178vh de largura); num notebook, 1600 px bastam.
const TAMANHOS = '(orientation: portrait) 178vh, (min-width: 1600px) 117vw, min(117vw, 1600px)';
// Quanto o texto desce para sumir na máscara (a máscara tem uma folga de .15em para os acentos).
const ESCONDIDO = 120;

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
// O GSAP passa a cuidar do transform da etiqueta (centralizada e girada), para poder animá-la.
gsap.set(etiqueta, { xPercent: -50, yPercent: -50, rotation: 180 });

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

/* ---------- Textos separados em palavras e linhas, cada um dentro de uma máscara ---------- */

const textos = slides.map(s => ({ linha: s.el.querySelector('.slide__linha'), titulo: null, cima: null, negrito: null, texto: null }));
let pronto = false;
let abrindo = false;
// Índice do slide cujo texto está à mostra (−1 durante uma troca ou antes da abertura).
let textoVisivel = -1;

// Folga na máscara para acentos e letras que passam da caixa (ex.: "Á" em "OLÁ").
const folgar = mascaras => gsap.set(mascaras, { paddingBlock: '.15em', marginBlock: '-.15em' });

function separar() {
  for (const [i, s] of slides.entries()) {
    const visivel = () => (i === textoVisivel ? 0 : ESCONDIDO);
    const t = textos[i];
    t.titulo = SplitText.create(s.el.querySelector('.slide__titulo a'), { type: 'words', mask: 'words', aria: 'auto' });
    folgar(t.titulo.masks);
    gsap.set(t.titulo.words, { yPercent: visivel() });
    for (const parte of ['cima', 'negrito', 'texto']) {
      t[parte] = SplitText.create(s.el.querySelector(`.slide__${parte}`), {
        type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true,
        onSplit(self) {
          folgar(self.masks);
          gsap.set(self.lines, { yPercent: visivel() });
        },
      });
    }
    gsap.set(t.linha, { opacity: i === textoVisivel ? 1 : 0 });
  }
  pronto = true;
}

const linhas = (i, parte) => textos[i][parte].lines;

// Entrada do texto do slide i (spec 7.1, etapa 6), com tempos relativos ao começo da entrada.
export function entrarTexto(i) {
  const t = textos[i];
  const c = cronograma({ palavrasSai: 1, palavrasEntra: t.titulo.words.length });
  const e = c.entrada;
  const rel = parte => parte.inicio - e.inicio;
  const tl = gsap.timeline();
  tl.fromTo(t.linha, { opacity: 0 }, { opacity: 1, duration: e.linha.duracao }, rel(e.linha));
  t.titulo.words.forEach((palavra, k) => {
    tl.fromTo(palavra, { yPercent: ESCONDIDO }, { yPercent: 0, duration: e.palavras[k].duracao, ease: 'power3.out' }, rel(e.palavras[k]));
  });
  tl.fromTo(linhas(i, 'cima'), { yPercent: ESCONDIDO }, { yPercent: 0, duration: e.cima.duracao, ease: 'power3.out' }, rel(e.cima));
  tl.fromTo(linhas(i, 'negrito'), { yPercent: ESCONDIDO }, { yPercent: 0, duration: e.negrito.duracao, ease: 'power3.out' }, rel(e.negrito));
  tl.fromTo(linhas(i, 'texto'), { yPercent: ESCONDIDO }, { yPercent: 0, duration: e.texto.duracao, ease: 'power3.out' }, rel(e.texto));
  return tl;
}

/* ---------- Troca de slide ---------- */

let troca = null;
let medicao = null;
const ouvintesTextoEntrou = [];

export function quandoTextoEntrar(funcao) {
  ouvintesTextoEntrou.push(funcao);
}

function reindexar(para) {
  visual.atual = para;
  visual.deslocamento = 0;
  posicionar();
  trocarSlideAtivo(para);
}

function fimDaTroca(para) {
  troca = null;
  textoVisivel = para;
  medicao?.fim();
  history.replaceState(null, '', `#${slides[para].id}`);
  carregarFotos(2);
  const proxima = estado.concluir();
  for (const funcao of ouvintesTextoEntrou) funcao();
  if (proxima) executarTroca(proxima);
}

function executarTroca({ de, para, passos }) {
  // Fotos do caminho todo (saltos pelo menu) e dos vizinhos do destino.
  carregarFotos(Math.abs(passos) + 1, de);
  carregarFotos(1, para);
  textoVisivel = -1;
  if (reduzirMovimento) {
    trocarSemMovimento(de, para);
    return;
  }

  const sai = textos[de];
  const c = cronograma({ palavrasSai: sai.titulo.words.length, palavrasEntra: textos[para].titulo.words.length });
  const tl = gsap.timeline({ onComplete: () => fimDaTroca(para) });

  // 1. Texto sai: cada palavra desce na máscara; depois a linha de cima, o negrito e o parágrafo.
  sai.titulo.words.forEach((palavra, k) => {
    tl.to(palavra, { yPercent: ESCONDIDO, duration: c.saida.palavras[k].duracao, ease: 'power2.in' }, c.saida.palavras[k].inicio);
  });
  tl.to(linhas(de, 'cima'), { yPercent: ESCONDIDO, duration: c.saida.cima.duracao, ease: 'power2.in' }, c.saida.cima.inicio);
  tl.to([...linhas(de, 'negrito'), ...linhas(de, 'texto')], { yPercent: ESCONDIDO, duration: c.saida.resto.duracao, ease: 'power2.in' }, c.saida.resto.inicio);
  tl.to(sai.linha, { opacity: 0, duration: c.saida.linha.duracao }, c.saida.linha.inicio);

  // 3. Foto vira cartão.
  tl.to(visual, { abertura: 0, duration: c.encolher.duracao, ease: 'encolher', onUpdate: posicionar }, c.encolher.inicio);

  // 4. Cartões deslizam; numeral e etiqueta trocam entre 24% e 42% do deslize.
  tl.to(visual, { deslocamento: passos, duration: c.deslizar.duracao, ease: 'deslizar', onUpdate: posicionar }, c.deslizar.inicio);
  const ns = c.deslizar.numeralSai;
  const ne = c.deslizar.numeralEntra;
  tl.to(numeral, { yPercent: ESCONDIDO, duration: ns.duracao, ease: 'power2.in' }, ns.inicio);
  tl.to(etiqueta, { opacity: 0, y: () => 0.2 * etiqueta.offsetHeight, duration: ns.duracao, ease: 'power2.in' }, ns.inicio);
  tl.call(() => trocarNumeral(para), null, ne.inicio);
  tl.fromTo(numeral, { yPercent: ESCONDIDO }, { yPercent: 0, duration: ne.duracao, ease: 'power3.out', immediateRender: false }, ne.inicio);
  tl.fromTo(etiqueta, { opacity: 0, y: () => -0.2 * etiqueta.offsetHeight }, { opacity: 1, y: 0, duration: ne.duracao, ease: 'power3.out', immediateRender: false }, ne.inicio);
  tl.call(() => reindexar(para), null, c.deslizar.inicio + c.deslizar.duracao);

  // 5. Cartão cresce.
  tl.fromTo(visual, { abertura: 0 }, { abertura: 1, duration: c.crescer.duracao, ease: 'crescer', onUpdate: posicionar, immediateRender: false }, c.crescer.inicio);

  // 6. Texto entra.
  tl.add(entrarTexto(para), c.entrada.inicio);

  troca = tl;
  medicao?.inicio({ t0: performance.now(), de, para, passos, c, linhaDoTempo: tl });
}

// "Reduzir movimento": esmaecimento de 0,3 s entre o slide atual e o novo, sem máscara nem parallax.
function trocarSemMovimento(de, para) {
  const velho = slides[de];
  const novo = slides[para];
  const t = textos[para];
  gsap.set([...t.titulo.words, ...linhas(para, 'cima'), ...linhas(para, 'negrito'), ...linhas(para, 'texto')], { yPercent: 0 });
  gsap.set(t.linha, { opacity: 1 });
  visual.abertura = 1;
  reindexar(para);
  trocarNumeral(para);
  // O cartão velho fica por cima, em tela cheia, enquanto esmaece.
  Object.assign(velho.cartao.style, { transform: 'translateX(0px)', clipPath: 'inset(0px)', visibility: 'visible', zIndex: '2' });
  velho.el.style.visibility = 'visible';
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set([velho.cartao, velho.el], { clearProps: 'opacity,zIndex,visibility' });
      posicionar();
      fimDaTroca(para);
    },
  });
  tl.fromTo([velho.cartao, velho.el], { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0);
  tl.fromTo([novo.cartao, novo.el], { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
  troca = tl;
}

// Giro automático: avança 6 s depois que o texto entra e para de vez na primeira interação (spec 8).
const giro = reduzirMovimento ? null : criarGiro({ espera: 6000 });

// Única porta de entrada para trocar de slide.
export function comando(alvo, { automatico = false } = {}) {
  if (!pronto || abrindo) return; // comandos durante a abertura do site são ignorados
  if (!automatico) giro?.interagiu();
  const resposta = estado.pedir(alvo);
  if (resposta.resposta === 'iniciar') executarTroca(resposta);
}

function avisarTextoEntrou() {
  for (const funcao of ouvintesTextoEntrou) funcao();
}

/* ---------- Gestos: roda, trackpad, arrasto e toque (cada gesto vale um slide) ---------- */

const filtro = criarFiltroDeGesto({ silencio: 200 });
let ultimoArrasto = -Infinity;
const gesto = direcao => {
  if (filtro.aceitar(performance.now())) comando(direcao);
};
const marcarArrasto = () => { ultimoArrasto = performance.now(); };

// wheelSpeed −1: roda para baixo e arrasto para cima viram o mesmo onUp (avançar).
// debounce false: cada evento chega na hora, sem esperar o próximo quadro (que para com a aba escondida).
Observer.create({
  target: window,
  type: 'wheel,touch,pointer',
  wheelSpeed: -1,
  tolerance: 10,
  dragMinimum: 10,
  preventDefault: true,
  debounce: false,
  ignore: '.segurar, .topo, .sociais, .menu',
  onUp: () => gesto(1),
  onLeft: () => gesto(1),
  onDown: () => gesto(-1),
  onRight: () => gesto(-1),
  onDragStart: marcarArrasto,
  onDrag: marcarArrasto,
  onDragEnd: marcarArrasto,
});

// Um arrasto que começa no título (que é um link) troca o slide e não abre o link.
document.addEventListener('click', evento => {
  const noTitulo = evento.target instanceof Element && evento.target.closest('.slide__titulo a');
  if (noTitulo && performance.now() - ultimoArrasto < 300) {
    evento.preventDefault();
    evento.stopImmediatePropagation();
  }
}, true);

// No Início, escolher um slide no menu fecha o menu e vai direto até ele.
document.getElementById('menu').addEventListener('click', async evento => {
  const link = evento.target instanceof Element && evento.target.closest('[data-slide]');
  if (!link) return;
  evento.preventDefault();
  await fecharMenu();
  comando({ indice: slides.findIndex(s => s.id === link.dataset.slide) });
});

if (giro) {
  quandoTextoEntrar(() => {
    giro.textoEntrou(performance.now());
    if (document.hidden) giro.pausar(performance.now());
  });
  gsap.ticker.add(() => {
    if (giro.deveAvancar(performance.now())) comando(1, { automatico: true });
  });
  const parar = () => giro.interagiu();
  for (const tipo of ['pointerdown', 'wheel', 'keydown', 'touchstart', 'focusin']) {
    document.addEventListener(tipo, parar, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) giro.pausar(performance.now());
    else giro.retomar(performance.now());
  });
}

const TECLAS = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 };
document.addEventListener('keydown', evento => {
  const alvo = TECLAS[evento.key];
  if (!alvo || evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
  const campo = evento.target instanceof Element && evento.target.closest('input, textarea, select, [contenteditable]');
  if (document.getElementById('menu').open || campo) return;
  evento.preventDefault();
  comando(alvo);
});

/* ---------- Clique e segure, título e saída para outra página (spec 7.2) ---------- */

const segurar = criarSegurar({ duracao: 600 });
const anelDeProgresso = botao.querySelector('.segurar__progresso');
let saindo = false;

const podeAbrir = () => pronto && !abrindo && !estado.ocupado && !saindo;

function abrir(i) {
  if (saindo) return;
  saindo = true;
  giro?.interagiu();
  navegarCom('branca', slides[i].abre, { cabecalho: slides[i].cabecalho });
}

function acompanharSegurar() {
  const agora = performance.now();
  gsap.set(anelDeProgresso, { strokeDashoffset: 1 - segurar.progresso(agora) });
  if (!segurar.completo(agora)) return;
  gsap.ticker.remove(acompanharSegurar);
  segurar.soltar(agora);
  abrir(visual.atual);
}

function soltarBotao() {
  gsap.ticker.remove(acompanharSegurar);
  botao.classList.remove('is-segurando');
  if (!segurar.ativo) return;
  segurar.soltar(performance.now());
  gsap.to(anelDeProgresso, { strokeDashoffset: 1, duration: 0.2 });
}

botao.addEventListener('pointerdown', evento => {
  if (evento.button !== 0 || !podeAbrir()) return;
  segurar.apertar(performance.now());
  botao.classList.add('is-segurando');
  gsap.ticker.add(acompanharSegurar);
});
for (const tipo of ['pointerup', 'pointercancel', 'pointerleave']) botao.addEventListener(tipo, soltarBotao);
// Enter e Espaço geram um clique com detail 0 e abrem na hora; um clique de mouse (detail ≥ 1) não abre: é preciso segurar.
botao.addEventListener('click', evento => {
  if (evento.detail === 0 && podeAbrir()) abrir(visual.atual);
});
// Segurar o dedo não abre o menu do celular.
botao.addEventListener('contextmenu', evento => evento.preventDefault());

// Clicar no título abre com a mesma cortina (os cliques logo depois de um arrasto já foram cancelados acima).
document.addEventListener('click', evento => {
  const link = evento.target instanceof Element && evento.target.closest('.slide__titulo a');
  if (!link) return;
  evento.preventDefault();
  if (podeAbrir()) abrir(visual.atual);
});

// Volta pelo cache do navegador: o botão e a saída voltam ao repouso (a cortina o comum.js recolhe).
addEventListener('pageshow', evento => {
  if (!evento.persisted) return;
  saindo = false;
  soltarBotao();
  gsap.set(anelDeProgresso, { strokeDashoffset: 1 });
});

/* ---------- Abertura do site (derivada, spec 7.4) ---------- */

let introducao = null;
const moldura = ['.topo', '.lateral', '.sociais', '.paginacao', '.segurar'].map(s => document.querySelector(s));
const espera = ms => new Promise(resolve => setTimeout(resolve, ms));

async function abrirSite() {
  await document.fonts.ready;
  const raiz = document.documentElement;

  // Chegando pela cortina preta (voltar de uma matéria): o slide aparece pronto e a cortina sai pelo alto.
  if (chegada === 'preta') {
    textoVisivel = visual.atual;
    separar();
    raiz.classList.remove('abrindo');
    await descobrir();
    avisarTextoEntrou();
    return;
  }

  separar(); // textoVisivel = −1: todos os textos começam escondidos
  // Espera a foto do slide de entrada (no máximo 1,5 s), para o cartão não aparecer vazio.
  await Promise.race([slides[visual.atual].foto.decode().catch(() => {}), espera(1500)]);

  const cartoes = slides.map(s => s.cartao);
  const textoAtual = slides[visual.atual].el;
  gsap.set([...moldura, ...cartoes], { opacity: 0 });
  abrindo = true;
  const tl = gsap.timeline({
    onComplete: () => {
      abrindo = false;
      introducao = null;
      textoVisivel = visual.atual;
      avisarTextoEntrou();
    },
  });

  if (reduzirMovimento) {
    const t = textos[visual.atual];
    gsap.set([...t.titulo.words, ...linhas(visual.atual, 'cima'), ...linhas(visual.atual, 'negrito'), ...linhas(visual.atual, 'texto')], { yPercent: 0 });
    gsap.set(t.linha, { opacity: 1 });
    gsap.set(textoAtual, { opacity: 0 });
    raiz.classList.remove('abrindo');
    tl.to([...moldura, ...cartoes, textoAtual], { opacity: 1, duration: 0.3 });
  } else {
    // A tela começa preta; o cartão aparece (0,3 s), cresce (etapa 5) e o texto entra (etapa 6).
    visual.abertura = 0;
    posicionar();
    raiz.classList.remove('abrindo');
    tl.to(moldura, { opacity: 1, duration: 0.4 }, 0);
    tl.to(cartoes, { opacity: 1, duration: 0.3 }, 0);
    tl.to(visual, { abertura: 1, duration: 0.5, ease: 'crescer', onUpdate: posicionar }, 0.3);
    tl.add(entrarTexto(visual.atual), 0.3 + 0.5 + 0.11);
  }
  introducao = tl;
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

const modoMedir = new URLSearchParams(location.search).get('medir');
if (modoMedir !== null) {
  import('./medir.js').then(m => { medicao = m.iniciar({ slides, palco, textos, modo: modoMedir === 'tempo-real' ? 'tempo-real' : 'passo' }); });
  window.__carrossel = { estado, visual, comando, get troca() { return troca; }, get introducao() { return introducao; } };
}

abrirSite();
