// Curvas de aceleração medidas no vídeo de referência, sem DOM.
// Cada amostra é [u, p]: tempo normalizado da etapa e progresso, ambos de 0 a 1.

export const NOMES_CURVAS = ['encolher', 'deslizar', 'crescer', 'cortina-branca', 'preta-entra', 'preta-sai'];

// u e p em porcentagem, como foram medidos.
const MEDIDAS = {
  encolher: [[0.03, 0.7], [0.085, 1.9], [0.14, 3.9], [0.197, 7.4], [0.252, 12.2], [0.307, 19.2], [0.363, 30.4], [0.418, 50.5], [0.473, 68.7], [0.53, 78.9], [0.585, 85.3], [0.64, 89.8], [0.697, 93.0], [0.752, 95.6], [0.807, 97.5], [0.863, 98.7], [0.918, 99.4], [0.973, 100]],
  deslizar: [[0.026, 0.2], [0.079, 0.9], [0.132, 2.1], [0.184, 3.9], [0.237, 6.2], [0.29, 9.7], [0.342, 14.5], [0.395, 22.4], [0.421, 28.1], [0.448, 35.8], [0.474, 46.4], [0.5, 58.2], [0.527, 67.4], [0.553, 74.1], [0.579, 79.0], [0.632, 85.9], [0.685, 90.5], [0.737, 93.8], [0.79, 96.1], [0.843, 97.7], [0.895, 98.8], [0.948, 99.8], [1, 100]],
  crescer: [[0.068, 1.2], [0.136, 2.1], [0.202, 3.7], [0.268, 6.7], [0.336, 10.6], [0.402, 17.0], [0.468, 26.4], [0.536, 45.8], [0.602, 69.7], [0.668, 82.5], [0.736, 89.8], [0.802, 94.9], [0.868, 98.2], [0.936, 99.5], [1, 100]],
  'cortina-branca': [[0.105, 4], [0.206, 9.5], [0.309, 20], [0.412, 43], [0.514, 74], [0.617, 87], [0.72, 94], [0.822, 98], [0.925, 99], [1, 100]],
  'preta-entra': [[0.107, 10.1], [0.253, 30.2], [0.402, 72.5], [0.551, 88.4], [0.698, 95.2], [0.847, 98.3], [1, 100]],
  'preta-sai': [[0.024, 0], [0.14, 6], [0.255, 16], [0.369, 42], [0.484, 73], [0.6, 87], [0.714, 93], [0.829, 96], [0.945, 99], [1, 100]],
};

function normalizar(pontos) {
  const lista = pontos.map(([u, p]) => [u, p / 100]);
  if (lista[0][0] > 0) lista.unshift([0, 0]);
  if (lista.at(-1)[0] < 1) lista.push([1, 1]);
  return lista;
}

export const AMOSTRAS = Object.fromEntries(NOMES_CURVAS.map(nome => [nome, normalizar(MEDIDAS[nome])]));

// Tangentes de Fritsch–Carlson: a curva passa por todos os pontos e nunca desce.
function tangentes(pts) {
  const n = pts.length;
  const delta = [];
  for (let k = 0; k < n - 1; k++) delta.push((pts[k + 1][1] - pts[k][1]) / (pts[k + 1][0] - pts[k][0]));
  const m = new Array(n);
  m[0] = delta[0];
  m[n - 1] = delta[n - 2];
  for (let k = 1; k < n - 1; k++) m[k] = (delta[k - 1] + delta[k]) / 2;
  for (let k = 0; k < n - 1; k++) {
    if (delta[k] === 0) {
      m[k] = 0;
      m[k + 1] = 0;
      continue;
    }
    const a = m[k] / delta[k];
    const b = m[k + 1] / delta[k];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[k] = t * a * delta[k];
      m[k + 1] = t * b * delta[k];
    }
  }
  return m;
}

const cache = new WeakMap();

export function avaliar(amostras, u) {
  let m = cache.get(amostras);
  if (!m) {
    m = tangentes(amostras);
    cache.set(amostras, m);
  }
  const x = Math.min(1, Math.max(0, u));
  const n = amostras.length;
  let k = 0;
  while (k < n - 2 && x > amostras[k + 1][0]) k++;
  const [u0, p0] = amostras[k];
  const [u1, p1] = amostras[k + 1];
  const h = u1 - u0;
  const t = (x - u0) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * h * m[k] + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * h * m[k + 1];
}

const numero = v => String(Number(v.toFixed(4)));

export function caminhoSvg(amostras, segmentos = 50) {
  const partes = [];
  for (let i = 0; i <= segmentos; i++) {
    const u = i / segmentos;
    partes.push(`${i === 0 ? 'M' : 'L'}${numero(u)},${numero(avaliar(amostras, u))}`);
  }
  return partes.join(' ');
}

export function registrarCurvas(CustomEase) {
  for (const nome of NOMES_CURVAS) CustomEase.create(nome, caminhoSvg(AMOSTRAS[nome]));
}
