// Monta o endereço mailto: do formulário de contato, no mesmo formato do site anterior:
// assunto "<assunto> | <nome>" e corpo "<mensagem>\n\n<nome>", com os textos aparados.
export function montarMailto({ email, assunto, nome, mensagem }) {
  const quem = nome.trim();
  const titulo = `${assunto.trim()} | ${quem}`;
  const corpo = `${mensagem.trim()}\n\n${quem}`;
  return `mailto:${email}?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(corpo)}`;
}
