// Lógica do "clique e segure", sem DOM: o relógio vem de fora (t em ms).

export function criarSegurar({ duracao = 600 } = {}) {
  let inicio = null;

  const completo = (t) => inicio !== null && t - inicio >= duracao;

  return {
    get ativo() { return inicio !== null; },
    apertar(t) {
      if (inicio === null) inicio = t;
    },
    // Devolve se já tinha completado no momento em que soltou.
    soltar(t) {
      const completou = completo(t);
      inicio = null;
      return completou;
    },
    progresso(t) {
      if (inicio === null) return 0;
      return Math.min(1, Math.max(0, (t - inicio) / duracao));
    },
    completo,
  };
}
