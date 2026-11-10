// Geometria dos cartões do carrossel (spec 6.5), sem DOM.
// abertura: 0 = modo cartão, 1 = tela cheia (vale para o cartão atual).
// deslocamento: quantos passos o trilho andou (fracionário durante o deslize).

export const MEDIDAS = {
  cartaoLargura: 0.565,
  cartaoAltura: 0.57,
  espacoU: 2.2,
  escalaFotoCartao: 0.87,
  coberturaFoto: 1.17,
  parallax: 0.38,
  // Enquanto o cartão atual encolhe ou cresce, cada vizinho anda esta fração do que anda a borda dele
  // (medido no vídeo: o vão passa de 2,2u para ~4,5% da largura no meio do crescimento).
  afastamentoEncolher: 1.08,
  afastamentoCrescer: 1.23,
};

// u: 1% da largura do maior retângulo 16:9 que cabe na janela.
export function unidade(largura, altura) {
  return Math.min(largura, altura * 1.7778) / 100;
}

export function calcularCartoes({ largura, altura, total, atual, abertura, deslocamento, afastamento = 1 }) {
  const u = unidade(largura, altura);
  const espaco = MEDIDAS.espacoU * u;
  const cw = MEDIDAS.cartaoLargura * largura;
  const ch = MEDIDAS.cartaoAltura * altura;
  const passo = cw + espaco;
  const w0 = cw + (largura - cw) * abertura;
  const h0 = ch + (altura - ch) * abertura;
  const meio = largura / 2;
  const maximo = Math.ceil((total - 1) / 2);

  const cartoes = [];
  for (let indice = 0; indice < total; indice++) {
    let d = (((indice - atual) % total) + total) % total;
    if (d > maximo) d -= total;

    const eAtual = d === 0;
    const w = eAtual ? w0 : cw;
    const h = eAtual ? h0 : ch;
    const escalaFoto = eAtual
      ? MEDIDAS.escalaFotoCartao + (1 - MEDIDAS.escalaFotoCartao) * abertura
      : MEDIDAS.escalaFotoCartao;

    // Os vizinhos ficam a um espaço do cartão atual no modo cartão e, quando ele cresce ou encolhe,
    // andam "afastamento" vezes o que anda a borda dele (1 mantém o espaço constante).
    const centroAntes = eAtual
      ? meio
      : meio + Math.sign(d) * (Math.abs(d) * passo + afastamento * (w0 - cw) / 2);
    const centroX = centroAntes - deslocamento * passo;
    const desvioFoto = -MEDIDAS.parallax * (centroX - meio);
    const visivel = centroX + w / 2 > 0 && centroX - w / 2 < largura;

    cartoes.push({ indice, d, centroX, largura: w, altura: h, escalaFoto, desvioFoto, visivel });
  }
  return cartoes;
}
