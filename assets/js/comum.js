// Partes comuns a todas as páginas: plugins do GSAP, curvas medidas, menu, cortinas,
// aviso de chegada entre páginas e volta pelo cache do navegador (bfcache). Roda ao ser importado.
import { registrarCurvas } from './curvas.js';
import { marcarChegada, lerChegada } from './chegada.js';

const { gsap, SplitText, CustomEase, Observer } = window;
gsap.registerPlugin(SplitText, CustomEase, Observer);
registrarCurvas(CustomEase);

const html = document.documentElement;
const parametros = new URLSearchParams(location.search);
const medindo = parametros.has('medir');

// Acessar o sessionStorage pode lançar erro quando o navegador bloqueia o armazenamento.
function armazenamento() {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches || parametros.has('reduzir');
export const chegada = lerChegada(armazenamento());

const espera = ms => new Promise(resolve => setTimeout(resolve, ms));

/* ---------- Cortinas ---------- */

const cortina = document.querySelector('.cortina');
const cortinaMateria = cortina.querySelector('.cortina__materia');
// O CSS esconde a cortina com translateY(100%). O GSAP leria isso como um y fixo em pixels e o somaria ao yPercent,
// e a cortina pararia fora da tela. Daqui em diante ela se move só por yPercent.
gsap.set(cortina, { y: 0, yPercent: html.classList.contains('chegou-preta') ? 0 : 100 });

function pintarCortina(cor) {
  cortina.classList.remove('cortina--branca', 'cortina--preta');
  cortina.classList.add(`cortina--${cor}`);
}

function recolherCortina() {
  gsap.killTweensOf(cortina);
  gsap.set(cortina, { yPercent: 100, opacity: 1 });
  cortina.classList.remove('cortina--branca', 'cortina--preta');
  cortinaMateria.replaceChildren();
  html.classList.remove('chegou-preta', 'cortina-acima');
  for (const el of document.querySelectorAll('.is-claro')) el.classList.remove('is-claro');
}

// Largura da barra de rolagem clássica (0 nas barras que flutuam sobre a página, como no celular).
function larguraDaBarra() {
  const sonda = document.createElement('div');
  sonda.style.cssText = 'position:absolute;top:-200px;width:100px;height:100px;overflow:scroll;visibility:hidden';
  document.body.append(sonda);
  const largura = sonda.offsetWidth - sonda.clientWidth;
  sonda.remove();
  return largura;
}

// Título, linha e itálico da matéria, nas mesmas classes e posições da página que vai abrir.
// A matéria rola e tem barra de rolagem; o Início não. Descontar a barra deixa o título no mesmo lugar na troca.
function montarCabecalho({ titulo, italico }) {
  cortinaMateria.style.right = `${larguraDaBarra()}px`;
  const cabeca = document.createElement('div');
  cabeca.className = 'materia__cabeca';
  const t = document.createElement('p');
  t.className = 'materia__titulo';
  t.textContent = titulo;
  const linha = document.createElement('span');
  linha.className = 'materia__linha';
  const i = document.createElement('p');
  i.className = 'materia__italico';
  i.textContent = italico;
  cabeca.append(t, linha, i);
  // O VOLTAR também vem na cortina, no mesmo lugar da página que vai abrir.
  const voltar = document.createElement('span');
  voltar.className = 'materia__voltar';
  voltar.textContent = '‹ Voltar';
  cortinaMateria.replaceChildren(cabeca, voltar);
  return [t, linha, i, voltar];
}

// Cortina branca (medido no vídeo quadro a quadro): o título sobe dentro do painel a partir de 0,27 s, vindo de 25% da
// altura da tela abaixo do lugar (power3.out em 0,70 s), e aparece em 0,2 s. A linha, o itálico e o VOLTAR fazem o mesmo
// caminho na tela com atrasos de 0,12, 0,19 e 0,28 s, como se cada um tivesse um painel atrasado só seu.
const CASCATA = { inicio: 0.27, atrasos: [0, 0.12, 0.19, 0.28], distancia: 0.25, duracao: 0.70, surge: 0.2, fim: 1.15 };

function cascata(partes, painel) {
  const curva = gsap.parseEase('cortina-branca');
  const entre01 = v => Math.min(1, Math.max(0, v));
  const altura = innerHeight;
  const topoDoPainel = t => altura * (1 - curva(entre01(t / painel)));
  const falta = t => (1 - entre01(t / CASCATA.duracao)) ** 3 * CASCATA.distancia * altura;
  const relogio = { t: 0 };
  const aplicar = () => partes.forEach((el, k) => {
    const d = CASCATA.atrasos[k];
    const t = relogio.t;
    gsap.set(el, {
      y: topoDoPainel(t - d) - topoDoPainel(t) + falta(t - CASCATA.inicio - d),
      opacity: entre01((t - CASCATA.inicio - d) / CASCATA.surge),
    });
  });
  aplicar();
  return gsap.to(relogio, { t: CASCATA.fim, duration: CASCATA.fim, ease: 'none', onUpdate: aplicar, onComplete: () => gsap.set(partes, { y: 0, opacity: 1 }) });
}

// Cabeçalho e laterais ficam por cima da cortina branca e passam para o tema claro quando a borda dela chega ao meio de cada um.
function laterais() {
  html.classList.add('cortina-acima');
  return [document.querySelector('.topo'), document.querySelector('.lateral'), document.querySelector('.sociais')]
    .filter(Boolean)
    .map(el => {
      const r = (el.classList.contains('lateral') ? el.querySelector('.lateral__etiqueta') : el).getBoundingClientRect();
      return { el, meio: r.top + r.height / 2 };
    });
}
function clarear(alvos) {
  const borda = cortina.getBoundingClientRect().top;
  for (const a of alvos) a.el.classList.toggle('is-claro', borda <= a.meio);
}

export function cobrir(cor, { cabecalho } = {}) {
  pintarCortina(cor);
  const partes = cor === 'branca' && cabecalho ? montarCabecalho(cabecalho) : [];
  return new Promise(resolve => {
    let linhaDoTempo;
    if (reduzirMovimento) {
      gsap.set(cortina, { yPercent: 0, opacity: 0 });
      linhaDoTempo = gsap.to(cortina, { opacity: 1, duration: 0.2, onComplete: resolve });
    } else {
      const branca = cor === 'branca';
      const alvos = branca ? laterais() : [];
      linhaDoTempo = gsap.timeline({ onComplete: resolve });
      linhaDoTempo.fromTo(cortina, { yPercent: 100, opacity: 1 }, {
        yPercent: 0, duration: branca ? 0.65 : 0.45, ease: branca ? 'cortina-branca' : 'preta-entra',
        onUpdate: alvos.length ? () => clarear(alvos) : undefined,
      });
      if (partes.length) linhaDoTempo.add(cascata(partes, 0.65), 0);
    }
    if (medindo) window.__cortina = linhaDoTempo;
  });
}

export function descobrir() {
  if (!cortina.classList.contains('cortina--branca')) pintarCortina('preta');
  gsap.killTweensOf(cortina);
  gsap.set(cortina, { yPercent: 0, opacity: 1 });
  html.classList.remove('chegou-preta');
  return new Promise(resolve => {
    const fim = () => {
      recolherCortina();
      resolve();
    };
    const linhaDoTempo = reduzirMovimento
      ? gsap.to(cortina, { opacity: 0, duration: 0.2, onComplete: fim })
      : gsap.to(cortina, { yPercent: -100, duration: 0.58, ease: 'preta-sai', onComplete: fim });
    if (medindo) window.__cortina = linhaDoTempo;
  });
}

export async function navegarCom(cor, url, opcoes = {}) {
  await cobrir(cor, opcoes);
  if (cor === 'preta' && !reduzirMovimento) await espera(260);
  marcarChegada(armazenamento(), cor);
  location.href = url;
}

/* ---------- Menu ---------- */

const menu = document.getElementById('menu');
const itensDoMenu = () => menu.querySelectorAll('.menu__slides a, .menu__paginas a');

export function abrirMenu() {
  if (menu.open) return Promise.resolve();
  menu.showModal();
  return new Promise(resolve => {
    if (reduzirMovimento) {
      gsap.fromTo(menu, { opacity: 0, yPercent: 0 }, { opacity: 1, duration: 0.2, onComplete: resolve });
      return;
    }
    gsap.timeline({ onComplete: resolve })
      .fromTo(menu, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: 0.45, ease: 'preta-entra' })
      .fromTo(itensDoMenu(), { yPercent: 100 }, { yPercent: 0, duration: 0.4, ease: 'power3.out', stagger: 0.05 }, 0.25);
  });
}

export function fecharMenu() {
  if (!menu.open) return Promise.resolve();
  return new Promise(resolve => {
    const fim = () => {
      menu.close();
      gsap.set(menu, { clearProps: 'transform,opacity' });
      gsap.set(itensDoMenu(), { clearProps: 'transform' });
      resolve();
    };
    if (reduzirMovimento) gsap.to(menu, { opacity: 0, duration: 0.2, onComplete: fim });
    else gsap.to(menu, { yPercent: -100, duration: 0.58, ease: 'preta-sai', onComplete: fim });
  });
}

document.querySelector('.topo__menu').addEventListener('click', abrirMenu);
menu.querySelector('.menu__fechar').addEventListener('click', fecharMenu);
menu.addEventListener('cancel', evento => {
  evento.preventDefault();
  fecharMenu();
});

menu.addEventListener('click', evento => {
  const link = evento.target.closest('a');
  if (!link) return;
  // Fora do Início, o menu (preto) já cobre a tela: o Início abre revelando com a cortina preta saindo.
  if (link.hasAttribute('data-slide') && document.body.dataset.pagina !== 'inicio') {
    marcarChegada(armazenamento(), 'preta');
    return;
  }
  // Âncora na própria página (ex.: Contato estando na Sobre): fecha o menu e rola até lá.
  const destino = new URL(link.href, location.href);
  if (!link.hasAttribute('data-slide') && destino.pathname === location.pathname && destino.hash) {
    evento.preventDefault();
    fecharMenu().then(() => {
      history.replaceState(null, '', destino.hash);
      document.querySelector(destino.hash)?.scrollIntoView({ behavior: reduzirMovimento ? 'auto' : 'smooth' });
    });
  }
});

/* ---------- Volta pelo cache do navegador ---------- */

addEventListener('pageshow', evento => {
  if (!evento.persisted) return;
  recolherCortina();
  html.classList.remove('tema-foto', 'tema-claro');
  html.classList.add(html.dataset.tema === 'claro' ? 'tema-claro' : 'tema-foto');
  if (menu.open) {
    menu.close();
    gsap.set(menu, { clearProps: 'transform,opacity' });
  }
});
