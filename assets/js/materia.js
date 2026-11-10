// Páginas de matéria (projetos e Sobre): entrada da cabeça e da grade, tela ampliada e voltar com a cortina preta.
import { chegada, descobrir, navegarCom, reduzirMovimento } from './comum.js';
import { unidade } from './geometria.js';
import { montarMailto } from './contato.js';

const { gsap } = window;
const raiz = document.documentElement;

/* ---------- Entrada (spec 7.2) ---------- */

const partesDaCabeca = [...document.querySelectorAll('.materia .materia__cabeca > *')];
const cartoes = [...document.querySelectorAll('.grade__item')];

function entrar() {
  // Chegando pela cortina branca, a cabeça já está à mostra: a cortina mostrou o mesmo título.
  const cabecaAnima = chegada !== 'branca';
  if (cabecaAnima) gsap.set(partesDaCabeca, { opacity: 0 });
  gsap.set(cartoes, { opacity: 0 });
  raiz.classList.remove('abrindo', 'chegou-branca');

  const tl = gsap.timeline();
  if (reduzirMovimento) {
    tl.to([...(cabecaAnima ? partesDaCabeca : []), ...cartoes], { opacity: 1, duration: 0.3 });
    return tl;
  }
  let inicioDosCartoes = 0;
  if (cabecaAnima) {
    tl.fromTo(partesDaCabeca, { opacity: 0, y: () => 0.5 * unidade(innerWidth, innerHeight) }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0);
    inicioDosCartoes = 0.3;
  }
  // Cada cartão sobe 60 px e aparece, 0,1 s depois do anterior.
  tl.fromTo(cartoes, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, inicioDosCartoes);
  return tl;
}

/* ---------- Tela ampliada ---------- */

const ampliada = document.getElementById('ampliada');
if (ampliada) {
  const imagem = ampliada.querySelector('.ampliada__imagem');
  const legenda = ampliada.querySelector('.ampliada__legenda');

  document.querySelector('.grade')?.addEventListener('click', evento => {
    const botao = evento.target instanceof Element && evento.target.closest('[data-ampliar]');
    if (!botao) return;
    imagem.src = botao.dataset.ampliar;
    imagem.alt = botao.dataset.legenda;
    legenda.textContent = botao.dataset.legenda;
    gsap.killTweensOf([ampliada, imagem]); // reabrir durante a saída não deixa o fechamento pendente
    ampliada.showModal();
    if (reduzirMovimento) {
      gsap.fromTo(ampliada, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      return;
    }
    gsap.timeline()
      .fromTo(ampliada, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
      .fromTo(imagem, { scale: 0.96 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, 0);
  });

  // Ao fechar, o navegador devolve o foco ao cartão que abriu a tela.
  const fechar = () => {
    gsap.to(ampliada, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        ampliada.close();
        gsap.set(ampliada, { clearProps: 'opacity' });
      },
    });
  };
  ampliada.querySelector('.ampliada__fechar').addEventListener('click', fechar);
  ampliada.addEventListener('cancel', evento => {
    evento.preventDefault();
    fechar();
  });
  // Clique fora da imagem (no fundo do próprio diálogo) fecha.
  ampliada.addEventListener('click', evento => {
    if (evento.target === ampliada) fechar();
  });
}

/* ---------- Voltar ---------- */

document.querySelector('.materia__voltar')?.addEventListener('click', evento => {
  evento.preventDefault();
  navegarCom('preta', evento.currentTarget.href);
});

/* ---------- Contato (Sobre) ---------- */

// Mesma lógica do formulário do site anterior: valida nome e mensagem e abre o app de e-mail com tudo pronto.
function iniciarContato() {
  const formulario = document.querySelector('[data-form]');
  if (!formulario) return;
  const sucesso = formulario.querySelector('[data-sucesso]');
  const campos = [formulario.elements.nome, formulario.elements.mensagem];

  const validar = campo => {
    const vazio = !campo.value.trim();
    campo.setAttribute('aria-invalid', String(vazio));
    document.getElementById(`${campo.id}-erro`).hidden = !vazio;
    return !vazio;
  };

  // Depois do primeiro erro, o aviso some assim que o campo é preenchido.
  for (const campo of campos) {
    campo.addEventListener('input', () => {
      if (campo.getAttribute('aria-invalid') === 'true') validar(campo);
    });
  }

  formulario.addEventListener('submit', evento => {
    evento.preventDefault();
    const erros = campos.filter(campo => !validar(campo));
    sucesso.hidden = true;
    if (erros.length) {
      for (const campo of erros) {
        campo.classList.remove('treme');
        void campo.offsetWidth; // reinicia a animação
        campo.classList.add('treme');
      }
      erros[0].focus();
      return;
    }
    location.href = montarMailto({
      email: formulario.dataset.email,
      assunto: formulario.elements.assunto.value,
      nome: formulario.elements.nome.value,
      mensagem: formulario.elements.mensagem.value,
    });
    sucesso.hidden = false;
  });

  // Copiar o e-mail: o botão avisa por 2 s e volta ao texto original (mesmo com cliques seguidos).
  for (const botao of document.querySelectorAll('[data-copiar]')) {
    const original = botao.textContent;
    let relogio;
    const avisar = texto => {
      botao.textContent = texto;
      clearTimeout(relogio);
      relogio = setTimeout(() => {
        botao.textContent = original;
      }, 2000);
    };
    botao.addEventListener('click', () => {
      Promise.resolve()
        .then(() => navigator.clipboard.writeText(botao.dataset.copiar))
        .then(() => avisar('Copiado'), () => avisar('Selecione e copie'));
    });
  }
}

if (chegada === 'preta') descobrir();
iniciarContato();
entrar();
