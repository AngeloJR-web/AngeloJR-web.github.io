// Aviso de "chegou pela cortina" entre páginas, guardado no sessionStorage. Sem DOM.
// Falhas do armazenamento (aba anônima, bloqueio) nunca quebram a página: a leitura volta null.

const CHAVE = 'chegada';
const CORES = new Set(['preta', 'branca']);

export function marcarChegada(armazenamento, cor) {
  if (!CORES.has(cor)) throw new RangeError(`cor de cortina inválida: ${cor}`);
  try {
    armazenamento.setItem(CHAVE, cor);
  } catch {
    // Sem armazenamento, a próxima página abre sem o aviso.
  }
}

export function lerChegada(armazenamento) {
  try {
    const cor = armazenamento.getItem(CHAVE);
    armazenamento.removeItem(CHAVE);
    return CORES.has(cor) ? cor : null;
  } catch {
    return null;
  }
}
