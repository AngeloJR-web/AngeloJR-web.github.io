// Giro automático, sem DOM: avança `espera` ms depois que o texto entra e para de vez na primeira interação.

export function criarGiro({ espera = 6000 } = {}) {
  let parado = false;
  let alvo = null;
  let restante = null;

  return {
    get parado() { return parado; },
    textoEntrou(t) {
      if (parado) return;
      alvo = t + espera;
      restante = null;
    },
    interagiu() {
      parado = true;
      alvo = null;
      restante = null;
    },
    pausar(t) {
      if (alvo === null) return;
      restante = Math.max(0, alvo - t);
      alvo = null;
    },
    retomar(t) {
      if (parado || restante === null) return;
      alvo = t + restante;
      restante = null;
    },
    // Verdadeiro uma vez só por textoEntrou.
    deveAvancar(t) {
      if (parado || alvo === null || t < alvo) return false;
      alvo = null;
      return true;
    },
  };
}
