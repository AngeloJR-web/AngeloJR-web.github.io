// Carrossel do Início: monta os cartões a partir dos slides do HTML, posiciona tudo com a geometria
// medida e anima a troca de slide com os tempos e as curvas do vídeo.
import { chegada, descobrir, fecharMenu, navegarCom, reduzirMovimento } from './comum.js';
import { criarCarrossel, criarFiltroDeGesto, numeroRomano } from './estado.js';
import { MEDIDAS, calcularCartoes, unidade } from './geometria.js';
import { cronograma } from './cronograma.js';
import { criarGiro } from './giro.js';
import { criarSegurar } from './segurar.js';

const { gsap, SplitText, Observer } = window;

const palco = document.querySelector('.palco');
const artigos = [...palco.querySelectorAll('.slide')];
const total = artigos.length;

// Telas em pé precisam cobrir a altura (foto 16:9 → 178vh de largura); num notebook, 1600 px bastam.
const TAMANHOS = '(orientation: portrait) 178vh, (min-width: 1600px) 117vw, min(117vw, 1600px)';
// Quanto o numeral desce para sumir na máscara dele (a máscara tem uma folga de .15em para os acentos).
const ESCONDIDO = 120;
// O texto nasce e some na linha fina (medido no vídeo): acima dela, só aparece até 0,7u antes dela; abaixo, só a partir
// de 0,7u depois dela.
const FOLGA_DA_LINHA = 0.7;

export const slides = artigos.map(el => ({
  el,
  id: el.id,
  nome: el.dataset.nome,
  etiqueta: el.dataset.etiqueta,
  abre: el.dataset.abre,
  base: el.dataset.foto,
  // Slides de projeto: a tela real do app (um arquivo só), desfocada com o slide parado e nítida no modo cartão.
  tela: el.dataset.tela,
  cabecalho: { titulo: el.dataset.materiaTitulo, italico: el.dataset.materiaItalico },
  cartao: null,
  foto: null,
}));

const indiceDoEndereco = () => Math.max(0, slides.findIndex(s => `#${s.id}` === location.hash));

export const estado = criarCarrossel({ total, inicial: indiceDoEndereco() });
// afastamento: quanto os vizinhos andam em relação à borda do cartão atual enquanto ele encolhe ou cresce.
export const visual = { atual: estado.atual, abertura: 1, deslocamento: 0, afastamento: 1 };

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
  if (s.tela) {
    // Cópia desfocada por cima da tela nítida: aparece com o slide aberto e some quando ele vira cartão.
    cartao.classList.add('cartao--tela');
    s.desfocada = foto.cloneNode();
    s.desfocada.classList.add('cartao__foto--desfocada');
    cartao.append(s.desfocada);
  }
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
    if (s.foto.hasAttribute('src') || s.foto.hasAttribute('srcset') || distancia(i, centro) > raio) continue;
    if (i === centro) s.foto.fetchPriority = 'high';
    if (s.tela) {
      s.foto.src = s.tela;
      s.desfocada.src = s.tela;
    } else {
      s.foto.srcset = `${s.base}-960.webp 960w, ${s.base}-1600.webp 1600w, ${s.base}-2400.webp 2400w`;
    }
  }
}

/* ---------- Posição e rótulos ---------- */

export function posicionar() {
  const largura = palco.clientWidth;
  const altura = palco.clientHeight;
  for (const c of calcularCartoes({ largura, altura, total, ...visual })) {
    const { cartao, foto, desfocada } = slides[c.indice];
    cartao.style.transform = `translateX(${c.centroX - largura / 2}px)`;
    cartao.style.clipPath = `inset(${(altura - c.altura) / 2}px ${(largura - c.largura) / 2}px)`;
    cartao.style.visibility = c.visivel ? 'visible' : 'hidden';
    foto.style.transform = `translate(-50%, -50%) translateX(${c.desvioFoto}px) scale(${c.escalaFoto})`;
    if (desfocada) {
      // Aberto (tela cheia): desfocada e escurecida, para o texto ler bem; no modo cartão: nítida e sem véu.
      const aberto = c.d === 0 ? visual.abertura : 0;
      desfocada.style.transform = foto.style.transform;
      desfocada.style.opacity = aberto;
      cartao.style.setProperty('--veu', aberto);
    }
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

const linhas = (i, parte) => textos[i][parte].lines;
const partesDoTexto = i => [...textos[i].titulo.words, ...linhas(i, 'cima'), ...linhas(i, 'negrito'), ...linhas(i, 'texto')];

// Deslocamento (yPercent) que leva cada palavra ou linha para trás da linha fina; calculado em recortar().
const escondido = el => Number(el.dataset.escondido) || ESCONDIDO;
const valorEscondido = (_, el) => escondido(el);

// Recorta o texto do slide i na linha fina e calcula quanto cada parte anda para sumir nela:
// - acima (título e linha de cima): a máscara deixa ver só até o corte de cima, e a parte desce até o topo da tinta
//   dela (acentos incluídos) chegar lá;
// - abaixo (negrito e parágrafo): a máscara deixa ver só a partir do corte de baixo, e o bloco sobe até a base dele
//   chegar ao corte de cima (todas as linhas andam a mesma distância).
// A altura vem de getBoundingClientRect, com casas decimais: offsetHeight arredonda, e o erro se multiplica pelo
// tamanho do caminho (na linha de cima, que anda umas 6 alturas, sobrava uma tira de até 3 px das letras).
const alturaExata = el => el.getBoundingClientRect().height;
// Tinta das letras acima da altura das maiúsculas (acentos e a sobra das letras redondas), mais 1 px para a borda
// suavizada. A caixa da linha de cima é aparada nessa altura, então a parte anda isso a mais para a tinta não passar do corte.
const regua = document.createElement('canvas').getContext('2d');
export function tintaAcima(el) {
  const e = getComputedStyle(el);
  regua.font = `${e.fontStyle} ${e.fontWeight} ${e.fontSize} ${e.fontFamily}`;
  const texto = e.textTransform === 'uppercase' ? el.textContent.toUpperCase() : el.textContent;
  return Math.max(0, regua.measureText(texto).actualBoundingBoxAscent - regua.measureText('H').actualBoundingBoxAscent) + 1;
}
function recortar(i) {
  const t = textos[i];
  if (!t.titulo || !t.cima || !t.negrito || !t.texto) return;
  const u = unidade(innerWidth, innerHeight);
  const linha = t.linha.getBoundingClientRect();
  const corteCima = linha.top - FOLGA_DA_LINHA * u;
  const corteBaixo = linha.bottom + FOLGA_DA_LINHA * u;
  const caixa = mascara => {
    const r = mascara.getBoundingClientRect();
    const e = getComputedStyle(mascara);
    return { r, topo: r.top + parseFloat(e.paddingTop), base: r.bottom - parseFloat(e.paddingBottom) };
  };
  for (const s of [t.titulo, t.cima]) {
    const partes = s === t.titulo ? s.words : s.lines;
    partes.forEach((el, k) => {
      const m = caixa(s.masks[k]);
      Object.assign(s.masks[k].style, { overflow: 'visible', clipPath: `inset(-100vh -100vw ${m.r.bottom - corteCima}px -100vw)` });
      el.dataset.escondido = String((100 * (corteCima + tintaAcima(el) - m.topo)) / alturaExata(el));
    });
  }
  const debaixo = [t.negrito, t.texto];
  const base = Math.max(...debaixo.flatMap(s => s.masks.map(m => caixa(m).base)));
  for (const s of debaixo) {
    s.lines.forEach((el, k) => {
      const m = caixa(s.masks[k]);
      Object.assign(s.masks[k].style, { overflow: 'visible', clipPath: `inset(${corteBaixo - m.r.top}px -100vw -100vh -100vw)` });
      el.dataset.escondido = String((100 * (corteCima - base)) / alturaExata(el));
    });
  }
}

// Na troca, o texto que não está à mostra fica atrás da linha fina.
function esconderSeOculto(i) {
  if (i !== textoVisivel) gsap.set(partesDoTexto(i), { yPercent: valorEscondido });
}

function separar() {
  for (const [i, s] of slides.entries()) {
    const t = textos[i];
    t.titulo = SplitText.create(s.el.querySelector('.slide__titulo a'), { type: 'words', mask: 'words', aria: 'auto' });
    folgar(t.titulo.masks);
    for (const parte of ['cima', 'negrito', 'texto']) {
      t[parte] = SplitText.create(s.el.querySelector(`.slide__${parte}`), {
        type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true,
        onSplit(self) {
          folgar(self.masks);
          // Na primeira separação as outras partes ainda não existem; o fim do laço cuida delas.
          if (!pronto) return;
          recortar(i);
          gsap.set(self.lines, { yPercent: i === textoVisivel ? 0 : valorEscondido });
        },
      });
    }
    recortar(i);
    gsap.set(partesDoTexto(i), { yPercent: i === textoVisivel ? 0 : valorEscondido });
    gsap.set(t.linha, { opacity: i === textoVisivel ? 1 : 0 });
  }
  pronto = true;
}

// Ao redimensionar, os cortes e as distâncias mudam com a tela (fora de uma troca, para não brigar com ela).
function recortarTudo() {
  if (!pronto || troca) return;
  for (let i = 0; i < total; i++) {
    recortar(i);
    esconderSeOculto(i);
  }
}

// Entrada do texto do slide i. Os tempos são relativos a entrada.comeca, que é quando a linha de
// cima começa a subir (antes da referência "inicio"): quem chama põe esta linha do tempo nesse instante.
export function entrarTexto(i) {
  const t = textos[i];
  const c = cronograma({ palavrasSai: 1, palavrasEntra: t.titulo.words.length });
  const e = c.entrada;
  const rel = parte => parte.inicio - e.comeca;
  const tl = gsap.timeline();
  tl.fromTo(t.linha, { opacity: 0 }, { opacity: 1, duration: e.linha.duracao }, rel(e.linha));
  t.titulo.words.forEach((palavra, k) => {
    tl.fromTo(palavra, { yPercent: escondido(palavra) }, { yPercent: 0, duration: e.palavras[k].duracao, ease: 'power3.out' }, rel(e.palavras[k]));
  });
  tl.fromTo(linhas(i, 'cima'), { yPercent: valorEscondido }, { yPercent: 0, duration: e.cima.duracao, ease: 'power3.out' }, rel(e.cima));
  tl.fromTo([...linhas(i, 'negrito'), ...linhas(i, 'texto')], { yPercent: valorEscondido }, { yPercent: 0, duration: e.bloco.duracao, ease: 'power3.out' }, rel(e.bloco));
  return tl;
}

// Quanto antes da referência da entrada a linha do tempo de entrarTexto(i) começa.
const antecipacao = i => {
  const e = cronograma({ palavrasSai: 1, palavrasEntra: textos[i].titulo.words.length }).entrada;
  return e.inicio - e.comeca;
};

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
    tl.to(palavra, { yPercent: escondido(palavra), duration: c.saida.palavras[k].duracao, ease: 'power2.in' }, c.saida.palavras[k].inicio);
  });
  tl.to(linhas(de, 'cima'), { yPercent: valorEscondido, duration: c.saida.cima.duracao, ease: 'power2.in' }, c.saida.cima.inicio);
  tl.to([...linhas(de, 'negrito'), ...linhas(de, 'texto')], { yPercent: valorEscondido, duration: c.saida.resto.duracao, ease: 'power2.in' }, c.saida.resto.inicio);
  tl.to(sai.linha, { opacity: 0, duration: c.saida.linha.duracao }, c.saida.linha.inicio);

  // 3. Foto vira cartão.
  tl.set(visual, { afastamento: MEDIDAS.afastamentoEncolher }, c.encolher.inicio);
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
  tl.set(visual, { afastamento: MEDIDAS.afastamentoCrescer }, c.crescer.inicio);
  tl.fromTo(visual, { abertura: 0 }, { abertura: 1, duration: c.crescer.duracao, ease: 'crescer', onUpdate: posicionar, immediateRender: false }, c.crescer.inicio);

  // 6. Texto entra.
  tl.add(entrarTexto(para), c.entrada.comeca);

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

// Giro automático: avança 6 s depois que o texto entra e para de vez na primeira interação.
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

/* ---------- Clique e segure, título e saída para outra página ---------- */

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
  // Ctrl, Cmd, Shift ou Alt + clique abrem a página em outra aba ou janela, como em qualquer link.
  if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
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

/* ---------- Abertura do site ---------- */

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
    visual.afastamento = MEDIDAS.afastamentoCrescer;
    posicionar();
    raiz.classList.remove('abrindo');
    tl.to(moldura, { opacity: 1, duration: 0.4 }, 0);
    tl.to(cartoes, { opacity: 1, duration: 0.3 }, 0);
    tl.to(visual, { abertura: 1, duration: 0.5, ease: 'crescer', onUpdate: posicionar }, 0.3);
    tl.add(entrarTexto(visual.atual), 0.3 + 0.5 + 0.11 - antecipacao(visual.atual));
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
addEventListener('resize', recortarTudo);
addEventListener('orientationchange', recortarTudo);

const modoMedir = new URLSearchParams(location.search).get('medir');
if (modoMedir !== null) {
  import('./medir.js').then(m => { medicao = m.iniciar({ slides, palco, textos, tintaAcima, modo: modoMedir === 'tempo-real' ? 'tempo-real' : 'passo' }); });
  window.__carrossel = { estado, visual, comando, get troca() { return troca; }, get introducao() { return introducao; } };
}

abrirSite();
