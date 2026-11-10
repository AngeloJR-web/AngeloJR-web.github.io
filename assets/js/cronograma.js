// Tempos da troca de slide, em segundos a partir do comando, sem DOM.
// palavrasSai/palavrasEntra: quantas palavras tem o título que sai e o que entra.
// O texto nasce e some na linha fina (medido no vídeo quadro a quadro): acima dela, desce até ela para sair e
// sobe dela para entrar; abaixo dela, o negrito e o parágrafo fazem o contrário, como um bloco.

const PALAVRA_SAI = { passo: 0.067, duracao: 0.19 };
// Na entrada, a 1ª palavra começa 0,035 s antes da referência e cada seguinte 0,095 s depois da anterior,
// 0,08 s mais curta (no mínimo 0,30 s): todas chegam quase juntas.
const PALAVRA_ENTRA = { antes: 0.035, passo: 0.095, duracao: 0.46, encurta: 0.08, minimo: 0.30 };
const ENCOLHER = 0.60;
const DESLIZAR = 1.27;
const CRESCER = 0.50;

export function cronograma({ palavrasSai, palavrasEntra }) {
  const n = Math.max(1, palavrasSai);
  const m = Math.max(1, palavrasEntra);

  // Saída: as palavras primeiro; depois a linha de cima e o bloco de baixo; a linha fina some no fim.
  const ultimo = PALAVRA_SAI.passo * (n - 1);
  const saidaFim = ultimo + 0.25;
  const saida = {
    palavras: Array.from({ length: n }, (_, i) => ({ inicio: PALAVRA_SAI.passo * i, duracao: PALAVRA_SAI.duracao })),
    cima: { inicio: ultimo + 0.10, duracao: 0.25 },
    resto: { inicio: ultimo + 0.12, duracao: 0.26 },
    linha: { inicio: ultimo + 0.34, duracao: 0.04 },
    // Referência da pausa antes de o cartão encolher (medida no vídeo); o bloco e a linha ainda terminam nela.
    fim: saidaFim,
  };

  const encolher = { inicio: saidaFim + 0.40, duracao: ENCOLHER };

  const inicioDeslize = encolher.inicio + ENCOLHER + 0.12;
  const numeralSai = { inicio: inicioDeslize + 0.24 * DESLIZAR, duracao: 0.07 };
  const deslizar = {
    inicio: inicioDeslize,
    duracao: DESLIZAR,
    numeralSai,
    numeralEntra: { inicio: numeralSai.inicio + numeralSai.duracao, duracao: 0.13 },
  };

  const crescer = { inicio: inicioDeslize + DESLIZAR + 0.13, duracao: CRESCER };

  // Entrada: "inicio" é a referência (fim do crescimento + 0,11 s). A linha de cima começa 0,21 s antes,
  // ainda no fim do crescimento; o bloco de baixo acompanha a 1ª palavra.
  const e = crescer.inicio + CRESCER + 0.11;
  const palavras = Array.from({ length: m }, (_, i) => ({
    inicio: e - PALAVRA_ENTRA.antes + PALAVRA_ENTRA.passo * i,
    duracao: Math.round(1000 * Math.max(PALAVRA_ENTRA.minimo, PALAVRA_ENTRA.duracao - PALAVRA_ENTRA.encurta * i)) / 1000,
  }));
  const cima = { inicio: e - 0.21, duracao: 0.63 };
  const bloco = { inicio: palavras[0].inicio, duracao: palavras[0].duracao };
  const linha = { inicio: e - 0.06, duracao: 0.05 };
  const entradaFim = Math.max(...palavras.map(p => p.inicio + p.duracao), cima.inicio + cima.duracao, bloco.inicio + bloco.duracao);
  const entrada = { inicio: e, comeca: Math.min(cima.inicio, linha.inicio, palavras[0].inicio), palavras, cima, bloco, linha, fim: entradaFim };

  return { saida, encolher, deslizar, crescer, entrada, total: entradaFim };
}
