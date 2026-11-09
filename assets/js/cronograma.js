// Tempos da troca de slide (spec 7.1), em segundos a partir do comando, sem DOM.
// palavrasSai/palavrasEntra: quantas palavras tem o título que sai e o que entra.

const PALAVRA_SAI = { passo: 0.067, duracao: 0.19 };
const PALAVRA_ENTRA = { passo: 0.075, duracao: 0.30 };
const ENCOLHER = 0.60;
const DESLIZAR = 1.27;
const CRESCER = 0.50;

export function cronograma({ palavrasSai, palavrasEntra }) {
  const n = Math.max(1, palavrasSai);
  const m = Math.max(1, palavrasEntra);

  const ultimo = PALAVRA_SAI.passo * (n - 1);
  const saidaFim = ultimo + 0.25;
  const saida = {
    palavras: Array.from({ length: n }, (_, i) => ({ inicio: PALAVRA_SAI.passo * i, duracao: PALAVRA_SAI.duracao })),
    cima: { inicio: ultimo + 0.12, duracao: 0.10 },
    resto: { inicio: ultimo + 0.19, duracao: 0.06 },
    linha: { inicio: saidaFim, duracao: 0.2 },
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

  const e = crescer.inicio + CRESCER + 0.11;
  const entradaFim = Math.max(e + PALAVRA_ENTRA.passo * (m - 1) + PALAVRA_ENTRA.duracao, e + 0.45);
  const entrada = {
    inicio: e,
    palavras: Array.from({ length: m }, (_, i) => ({ inicio: e + PALAVRA_ENTRA.passo * i, duracao: PALAVRA_ENTRA.duracao })),
    cima: { inicio: e + 0.07, duracao: 0.22 },
    negrito: { inicio: e + 0.20, duracao: 0.10 },
    texto: { inicio: e + 0.25, duracao: 0.20 },
    linha: { inicio: e, duracao: 0.3 },
    fim: entradaFim,
  };

  return { saida, encolher, deslizar, crescer, entrada, total: entradaFim };
}
