// Relatório de fidelidade (só com ?medir no endereço): mede cada troca no DOM e compara com o
// cronograma, as curvas e as medidas do vídeo (spec 14.1).
// Modo "passo" (?medir): pausa a troca e avança a linha do tempo de 1/120 em 1/120 s, lendo o DOM em
// cada passo; não depende do relógio da aba (que o navegador desacelera quando a janela não está à vista).
// Modo "tempo-real" (?medir=tempo-real): lê a cada passo do relógio do GSAP, com a troca rodando normalmente.
import { AMOSTRAS, avaliar } from './curvas.js';
import { MEDIDAS, unidade } from './geometria.js';

const { gsap } = window;
const ESCONDIDO = 120;

const PASSO = 1 / 120;

export function iniciar({ slides, palco, textos, modo = 'passo' }) {
  let info = null;
  let amostras = [];
  let tempoDoPasso = null;

  // Retângulo visível do cartão (transform + clip-path) e escala/desvio da foto, lidos do estilo calculado.
  function ler(slide) {
    const largura = palco.clientWidth;
    const altura = palco.clientHeight;
    const estilo = getComputedStyle(slide.cartao);
    const deslocamento = new DOMMatrix(estilo.transform).m41;
    const recortes = (estilo.clipPath.match(/-?[\d.]+px/g) || ['0px']).map(parseFloat);
    const [cimaBaixo, lados = cimaBaixo] = recortes;
    const foto = new DOMMatrix(getComputedStyle(slide.foto).transform);
    return {
      centro: largura / 2 + deslocamento,
      largura: largura - 2 * lados,
      altura: altura - 2 * cimaBaixo,
      escala: foto.a,
      desvio: foto.m41 + slide.foto.offsetWidth / 2,
    };
  }

  function coletar() {
    amostras.push({
      t: tempoDoPasso ?? (performance.now() - info.t0) / 1000,
      de: ler(slides[info.de]),
      para: ler(slides[info.para]),
      sai: gsap.getProperty(textos[info.de].titulo.words[0], 'yPercent'),
      entra: gsap.getProperty(textos[info.para].titulo.words[0], 'yPercent'),
    });
  }

  // Valor medido no instante t, interpolado entre as duas amostras vizinhas.
  function noInstante(t, leitura) {
    const i = amostras.findIndex(a => a.t >= t);
    if (i <= 0) return leitura(amostras[Math.max(0, i)]);
    const a = amostras[i - 1];
    const b = amostras[i];
    const f = (t - a.t) / (b.t - a.t || 1);
    return leitura(a) + (leitura(b) - leitura(a)) * f;
  }

  function relatorio() {
    const { c, passos } = info;
    const L = palco.clientWidth;
    const A = palco.clientHeight;
    const cw = MEDIDAS.cartaoLargura * L;
    const passo = cw + MEDIDAS.espacoU * unidade(L, A);
    const itens = [];
    const checar = (nome, valor, esperado, tolerancia) => itens.push({ nome, valor, esperado, tolerancia, ok: Math.abs(valor - esperado) <= tolerancia });
    const quando = (teste, depois = 0) => amostras.find(a => a.t >= depois && teste(a))?.t ?? NaN;
    const mediana = v => [...v].sort((x, y) => x - y)[Math.floor(v.length / 2)];

    // Etapas da troca (início e fim de cada uma), em segundos a partir do comando.
    const encolheuIni = quando(a => a.de.largura < L - 1);
    const encolheuFim = quando(a => a.de.largura <= cw + 1, encolheuIni);
    checar('encolher: início', encolheuIni, c.encolher.inicio, 0.05);
    checar('encolher: fim', encolheuFim, c.encolher.inicio + c.encolher.duracao, 0.05);
    const deslizouIni = quando(a => Math.abs(a.de.centro - L / 2) > 1, encolheuFim);
    const deslizouFim = quando(a => Math.abs(a.para.centro - L / 2) < 1, deslizouIni);
    checar('deslizar: início', deslizouIni, c.deslizar.inicio, 0.05);
    checar('deslizar: fim', deslizouFim, c.deslizar.inicio + c.deslizar.duracao, 0.05);
    const cresceuIni = quando(a => a.para.largura > cw + 1, deslizouFim);
    const cresceuFim = quando(a => a.para.largura >= L - 1, cresceuIni);
    checar('crescer: início', cresceuIni, c.crescer.inicio, 0.05);
    checar('crescer: fim', cresceuFim, c.crescer.inicio + c.crescer.duracao, 0.05);

    // Cartão parado no modo cartão (na pausa entre encolher e deslizar).
    const parado = amostras.find(a => a.t >= c.encolher.inicio + c.encolher.duracao + 0.04) ?? amostras.at(-1);
    checar('cartão: largura / L', parado.de.largura / L, MEDIDAS.cartaoLargura, 0.01);
    checar('cartão: altura / A', parado.de.altura / A, MEDIDAS.cartaoAltura, 0.01);
    checar('foto no cartão: escala', parado.de.escala, MEDIDAS.escalaFotoCartao, 0.02);

    // Parallax: desvio da foto dividido pelo deslocamento do cartão, durante o deslize.
    const razoes = amostras
      .filter(a => a.t > c.deslizar.inicio && a.t < c.deslizar.inicio + c.deslizar.duracao && Math.abs(a.de.centro - L / 2) > 0.05 * L)
      .map(a => a.de.desvio / (a.de.centro - L / 2));
    checar('parallax: fator', razoes.length ? mediana(razoes) : NaN, -MEDIDAS.parallax, 0.02);

    // Curvas: progresso medido nos pontos do vídeo, comparado com a curva medida.
    const progresso = {
      encolher: a => (L - a.de.largura) / (L - cw),
      deslizar: a => (L / 2 - a.de.centro) / (passo * passos),
      crescer: a => (a.para.largura - cw) / (L - cw),
    };
    for (const [nome, ler] of Object.entries(progresso)) {
      const etapa = c[nome];
      const pior = Math.max(...AMOSTRAS[nome].slice(1, -1).map(([u]) => Math.abs(noInstante(etapa.inicio + u * etapa.duracao, ler) - avaliar(AMOSTRAS[nome], u))));
      checar(`curva ${nome}: maior diferença`, pior, 0, 0.03);
    }

    // Texto: fim da saída da 1ª palavra e começo/fim da entrada da 1ª palavra nova.
    checar('texto: 1ª palavra some', quando(a => a.sai >= ESCONDIDO - 0.05), c.saida.palavras[0].inicio + c.saida.palavras[0].duracao, 0.05);
    checar('texto: 1ª palavra começa a entrar', quando(a => a.entra < ESCONDIDO - 0.05, c.crescer.inicio), c.entrada.palavras[0].inicio, 0.05);
    checar('texto: 1ª palavra no lugar', quando(a => a.entra <= 0.05, c.crescer.inicio), c.entrada.palavras[0].inicio + c.entrada.palavras[0].duracao, 0.05);

    const n = v => (Number.isFinite(v) ? v.toFixed(3) : String(v));
    for (const i of itens) console.info(`[medir] ${i.nome}: ${n(i.valor)} (esperado ${n(i.esperado)} ± ${i.tolerancia}) ${i.ok ? 'OK' : 'FALHA'}`);
    const falhas = itens.filter(i => !i.ok).length;
    console.info(`[medir] RESULTADO: ${itens.length - falhas} OK, ${falhas} FALHA (${amostras.length} amostras, de ${info.de} para ${info.para})`);
    window.__medicao = { itens, amostras };
  }

  return {
    inicio(dados) {
      info = dados;
      amostras = [];
      if (modo === 'tempo-real') {
        tempoDoPasso = null;
        gsap.ticker.add(coletar);
        return;
      }
      // Passo a passo: o último seek dispara o fim da troca, que chama fim() e o relatório.
      const tl = dados.linhaDoTempo;
      tl.pause();
      const duracao = tl.duration();
      for (let t = 0; t < duracao; t += PASSO) {
        tl.seek(t, false);
        tempoDoPasso = t;
        coletar();
      }
      tempoDoPasso = duracao;
      tl.seek(duracao, false);
    },
    fim() {
      gsap.ticker.remove(coletar);
      if (!info) return; // troca sem medição (ex.: "reduzir movimento")
      coletar();
      tempoDoPasso = null;
      relatorio();
      info = null;
    },
  };
}
