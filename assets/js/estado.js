// Lógica do carrossel, sem DOM: slide atual, troca em andamento e fila de 1 comando.

const ROMANOS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

function validarIndice(indice, total) {
  if (!Number.isInteger(indice) || indice < 0 || indice >= total) {
    throw new RangeError(`índice inválido: ${indice} (total ${total})`);
  }
}

export function criarCarrossel({ total, inicial = 0 }) {
  if (!Number.isInteger(total) || total < 1) throw new RangeError(`total inválido: ${total}`);
  validarIndice(inicial, total);

  let atual = inicial;
  let ocupado = false;
  let destino = null;
  let guardado = null;

  function validarAlvo(alvo) {
    if (alvo === 1 || alvo === -1) return;
    if (alvo !== null && typeof alvo === 'object' && Object.hasOwn(alvo, 'indice')) {
      validarIndice(alvo.indice, total);
      return;
    }
    throw new RangeError(`alvo inválido: ${JSON.stringify(alvo)}`);
  }

  // Passos com sinal até o alvo; para um índice, o menor caminho no círculo (empate vai para a frente).
  function passosAte(alvo) {
    if (total === 1) return 0;
    if (alvo === 1 || alvo === -1) return alvo;
    let d = (((alvo.indice - atual) % total) + total) % total;
    if (d > total / 2) d -= total;
    return d;
  }

  function pedir(alvo) {
    validarAlvo(alvo);
    if (ocupado) {
      if (guardado === null) {
        guardado = alvo;
        return { resposta: 'guardado' };
      }
      return { resposta: 'ignorado' };
    }
    const passos = passosAte(alvo);
    if (passos === 0) return { resposta: 'ignorado' };
    const para = (((atual + passos) % total) + total) % total;
    ocupado = true;
    destino = para;
    return { resposta: 'iniciar', de: atual, para, passos };
  }

  function concluir() {
    if (!ocupado) throw new Error('nenhuma troca em andamento');
    atual = destino;
    destino = null;
    ocupado = false;
    if (guardado === null) return null;
    const alvo = guardado;
    guardado = null;
    const resposta = pedir(alvo);
    return resposta.resposta === 'iniciar' ? resposta : null;
  }

  return {
    get atual() { return atual; },
    get ocupado() { return ocupado; },
    get total() { return total; },
    pedir,
    concluir,
  };
}

export function numeroRomano(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new RangeError(`sem número romano para ${n}`);
  let resto = n;
  let texto = '';
  for (const [valor, letras] of ROMANOS) {
    while (resto >= valor) {
      texto += letras;
      resto -= valor;
    }
  }
  return texto;
}

// Um gesto (roda, trackpad ou arrasto) vale um slide: só aceita depois de `silencio` ms sem eventos.
export function criarFiltroDeGesto({ silencio = 200 } = {}) {
  let ultimo = null;
  return {
    aceitar(t) {
      const aceito = ultimo === null || t - ultimo >= silencio;
      ultimo = t;
      return aceito;
    },
  };
}
