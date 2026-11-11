// Tema claro ou escuro das páginas de matéria (Sobre e projetos). Sem DOM.
// O script do <head> de cada página repete a regra de temaInicial() para não piscar ao carregar.
export const CHAVE_TEMA = 'tema';

export function lerTema(armazenamento) {
  try {
    const tema = armazenamento?.getItem(CHAVE_TEMA);
    return tema === 'claro' || tema === 'escuro' ? tema : null;
  } catch {
    return null;
  }
}

export function guardarTema(armazenamento, tema) {
  try {
    armazenamento?.setItem(CHAVE_TEMA, tema);
  } catch {
    // sem armazenamento, a escolha vale só até fechar a página
  }
}

// Quem já escolheu fica com a escolha; quem não escolheu segue o sistema.
export const temaInicial = (salvo, sistemaEscuro) => salvo ?? (sistemaEscuro ? 'escuro' : 'claro');

export const outroTema = tema => (tema === 'escuro' ? 'claro' : 'escuro');
