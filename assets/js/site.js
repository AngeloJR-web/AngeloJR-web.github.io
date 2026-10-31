// Interações do site. O conteúdo fica todo no index.html: o carrossel lê os projetos da própria página.
(function () {
  'use strict';

  var SETA_ESQ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var SETA_DIR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  var hero = document.querySelector('[data-hero]');
  var topo = document.querySelector('.topo');
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var comMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function lerSlides() {
    var slides = [{
      titulo: hero.dataset.titulo.split('|'),
      frase: hero.dataset.frase,
      tag: hero.dataset.tag,
      capa: hero.dataset.capa,
      fundo: hero.dataset.fundo,
      alt: hero.dataset.alt,
      link: hero.dataset.link,
      rotulo: hero.dataset.rotulo
    }];
    document.querySelectorAll('.projeto').forEach(function (p) {
      var img = p.querySelector('img');
      slides.push({
        titulo: p.dataset.titulo.split('|'),
        frase: p.querySelector('.projeto__frase').textContent,
        tag: p.dataset.tag,
        capa: img.getAttribute('src'),
        fundo: p.dataset.fundo,
        alt: img.alt,
        link: p.dataset.pagina,
        rotulo: 'Ver projeto'
      });
    });
    return slides;
  }

  function posicao(i, ativo, n) {
    var d = (i - ativo + n) % n;
    return d > n / 2 ? d - n : d;
  }

  // Poses do anel, como em sistema.css: distância e profundidade em larguras de capa, giro e opacidade.
  // A última pose de cada lista fica atrás do anel, invisível.
  var POSES = {
    amplo: [[0, 0, 0, 1], [1.072, -1.199, 32, 1], [2.223, -2.723, 53, 1], [2.9, -4, 68, 0]],
    estreito: [[0, 0, 0, 1], [1.08, -1, 30, 1], [1.7, -1.9, 46, 0], [2.2, -3, 60, 0]]
  };

  function curvaSuave(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function curvaSaida(t) { return 1 - Math.pow(1 - t, 3); }

  // aoMudar avisa qual slide ficou no centro; aoUsar avisa que a pessoa assumiu o controle.
  function iniciarCarrossel(raiz, slides, aoMudar, aoUsar) {
    var n = slides.length, ativo = 0, destino = 0, visual = 0, quadroId = 0;
    var cena = document.createElement('div'), arrastou = false, cards;
    raiz.classList.add('pa-anel', 'is-entrando');
    raiz.setAttribute('role', 'group');
    raiz.setAttribute('aria-roledescription', 'carrossel');
    raiz.setAttribute('aria-label', 'Projetos');
    raiz.tabIndex = 0;
    cena.className = 'pa-anel__cena';

    cards = slides.map(function (s, i) {
      var card = document.createElement('a'), img = document.createElement('img'), tag = document.createElement('span');
      card.className = 'pa-anel__card';
      card.href = s.link;
      card.draggable = false;
      img.src = s.capa;
      img.alt = s.alt;
      img.draggable = false;
      tag.className = 'pa-tag';
      tag.textContent = s.tag;
      card.appendChild(img);
      card.appendChild(tag);
      card.addEventListener('click', function (e) {
        if (arrastou) { e.preventDefault(); arrastou = false; return; }
        if (i !== ativo) { e.preventDefault(); aoUsar(); ir(i); }
      });
      cena.appendChild(card);
      return card;
    });
    raiz.appendChild(cena);

    ['esq', 'dir'].forEach(function (lado) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pa-seta pa-seta--' + lado;
      b.setAttribute('aria-label', lado === 'esq' ? 'Slide anterior' : 'Próximo slide');
      b.innerHTML = lado === 'esq' ? SETA_ESQ : SETA_DIR;
      b.addEventListener('click', function () { aoUsar(); ir(ativo + (lado === 'esq' ? -1 : 1)); });
      raiz.appendChild(b);
    });

    function desvio(i) {
      var d = (i - visual) % n;
      if (d > n / 2) d -= n;
      if (d <= -n / 2) d += n;
      return d;
    }

    // Coloca cada capa no ponto exato do anel, mesmo entre duas posições.
    function pintar() {
      var poses = raiz.clientWidth < 768 ? POSES.estreito : POSES.amplo;
      cards.forEach(function (c, i) {
        var d = desvio(i), lado = d < 0 ? -1 : 1, a = Math.min(Math.abs(d), poses.length - 1);
        var k = Math.min(Math.floor(a), poses.length - 2), f = a - k, p = poses[k], q = poses[k + 1];
        function entre(j) { return p[j] + (q[j] - p[j]) * f; }
        var opacidade = Math.min(entre(3), 2 * (n / 2 - Math.abs(d)));
        c.style.transform = 'translateX(calc(var(--w) * ' + (lado * entre(0)).toFixed(4) + ')) translateZ(calc(var(--w) * ' + entre(1).toFixed(4) + ')) rotateY(' + (-lado * entre(2)).toFixed(2) + 'deg)';
        c.style.opacity = opacidade.toFixed(3);
        c.style.pointerEvents = opacidade < 0.2 ? 'none' : '';
      });
    }

    // Gira o anel até o destino em um só movimento, passando pelas posições do meio.
    function girar() {
      if (menosMovimento) { visual = destino; pintar(); return; }
      var de = visual, inicio = performance.now(), duracao = 400 + 300 * Math.abs(destino - de);
      var curva = quadroId ? curvaSaida : curvaSuave;
      cancelAnimationFrame(quadroId);
      raiz.classList.add('is-girando');
      function quadro(agora) {
        var t = Math.max(0, Math.min((agora - inicio) / duracao, 1));
        visual = de + (destino - de) * curva(t);
        pintar();
        if (t < 1) { quadroId = requestAnimationFrame(quadro); return; }
        quadroId = 0;
        requestAnimationFrame(function () { if (!quadroId) raiz.classList.remove('is-girando'); });
      }
      quadroId = requestAnimationFrame(quadro);
    }

    function ir(i, inicio) {
      destino += posicao(i, ativo, n);
      ativo = (i + n) % n;
      cards.forEach(function (c, k) {
        var nova = posicao(k, ativo, n);
        c.dataset.pos = nova;
        c.tabIndex = nova === 0 ? 0 : -1;
        c.setAttribute('aria-hidden', nova === 0 ? 'false' : 'true');
      });
      if (inicio) pintar();
      else girar();
      if (aoMudar) aoMudar(ativo, inicio);
    }

    raiz.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { aoUsar(); ir(ativo - 1); }
      if (e.key === 'ArrowRight') { aoUsar(); ir(ativo + 1); }
    });

    var inicioX = null;
    raiz.addEventListener('pointerdown', function (e) { inicioX = e.clientX; arrastou = false; });
    raiz.addEventListener('pointerup', function (e) {
      if (inicioX === null) return;
      var d = e.clientX - inicioX;
      inicioX = null;
      if (Math.abs(d) > 40) { arrastou = true; aoUsar(); ir(ativo + (d < 0 ? 1 : -1)); }
    });

    ir(0, true);
    new ResizeObserver(pintar).observe(raiz);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { raiz.classList.remove('is-entrando'); });
    });

    return { avancar: function () { ir(ativo + 1); } };
  }

  function iniciarHero() {
    var slides = lerSlides();
    var fundos = hero.querySelectorAll('.pa-hero__fundo'), texto = hero.querySelector('.pa-hero__texto');
    var linhas = texto.querySelectorAll('.linha > span'), frase = texto.querySelector('.pa-destaque'), link = texto.querySelector('.pa-link');
    var regua = texto.querySelector('.pa-regua'), pontos = hero.querySelector('.pa-pontos');
    var ligado = 0, marcadores = [], auto = !menosMovimento, pausas = {};

    // Deixa as paisagens prontas para a fusão do fundo não piscar.
    slides.forEach(function (s) { new Image().src = s.fundo; });

    slides.forEach(function () {
      var p = document.createElement('span');
      pontos.appendChild(p);
      marcadores.push(p);
    });

    function escrever(s) {
      linhas[0].textContent = s.titulo[0];
      linhas[1].textContent = s.titulo[1];
      frase.textContent = s.frase;
      link.textContent = s.rotulo;
      link.href = s.link;
    }

    // A régua abaixo do título é o relógio do giro automático: quando enche, o anel avança.
    function rodarRegua() {
      hero.classList.remove('is-auto');
      regua.getBoundingClientRect();
      hero.classList.add('is-auto');
    }

    function pararAuto() {
      if (!auto) return;
      auto = false;
      hero.classList.remove('is-auto', 'is-pausado');
      texto.setAttribute('aria-live', 'polite');
    }

    function pausar(motivo, ligada) {
      pausas[motivo] = ligada;
      hero.classList.toggle('is-pausado', Object.keys(pausas).some(function (k) { return pausas[k]; }));
    }

    var carrossel = iniciarCarrossel(hero.querySelector('[data-carrossel]'), slides, function (i, inicio) {
      marcadores.forEach(function (m, k) { m.classList.toggle('is-on', k === i); });
      if (inicio) return;
      var novo = fundos[1 - ligado];
      novo.style.backgroundImage = 'url(' + slides[i].fundo + ')';
      novo.classList.add('is-on');
      fundos[ligado].classList.remove('is-on');
      ligado = 1 - ligado;
      texto.classList.add('is-trocando');
      setTimeout(function () {
        escrever(slides[i]);
        texto.classList.add('is-preparando');
        texto.classList.remove('is-trocando');
        texto.getBoundingClientRect();
        texto.classList.remove('is-preparando');
        if (auto) rodarRegua();
      }, 300);
    }, pararAuto);

    if (!auto) return;

    texto.setAttribute('aria-live', 'off');
    setTimeout(function () { if (auto) rodarRegua(); }, 1700);
    regua.addEventListener('animationend', function (e) {
      if (auto && e.animationName === 'encher') carrossel.avancar();
    });
    hero.addEventListener('pointerover', function (e) { pausar('mouse', !!e.target.closest('.pa-anel__card, .pa-seta, .pa-hero__texto a')); });
    hero.addEventListener('pointerleave', function () { pausar('mouse', false); });
    hero.addEventListener('focusin', function () { pausar('foco', true); });
    hero.addEventListener('focusout', function () { pausar('foco', false); });
    new IntersectionObserver(function (itens) {
      pausar('fora', !itens[0].isIntersecting);
    }, { threshold: 0.35 }).observe(hero);
  }

  // Profundidade do hero: o anel acompanha o mouse, respira devagar e recua ao rolar a página.
  function iniciarProfundidade() {
    if (menosMovimento) return;
    var cena = hero.querySelector('.pa-anel__cena'), anel = hero.querySelector('.pa-anel');
    var fundos = hero.querySelectorAll('.pa-hero__fundo'), texto = hero.querySelector('.pa-hero__texto');
    var alvo = { x: 0, y: 0 }, atual = { x: 0, y: 0 }, quadroId = 0;

    if (comMouse) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        alvo.x = (e.clientX - r.left) / r.width - 0.5;
        alvo.y = (e.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener('pointerleave', function () { alvo.x = 0; alvo.y = 0; });
    }

    function quadro(t) {
      atual.x += (alvo.x - atual.x) * 0.06;
      atual.y += (alvo.y - atual.y) * 0.06;
      var saida = Math.min(window.scrollY / hero.offsetHeight, 1);
      var sopro = Math.sin(t / 3400) * 1.2;
      var fundo = (atual.x * -36).toFixed(1) + 'px ' + (atual.y * -24 + saida * 120).toFixed(1) + 'px';
      cena.style.transform = 'rotateX(' + (atual.y * -5).toFixed(2) + 'deg) rotateY(' + (atual.x * 8 + sopro).toFixed(2) + 'deg)';
      fundos[0].style.translate = fundo;
      fundos[1].style.translate = fundo;
      texto.style.translate = (atual.x * 14).toFixed(1) + 'px ' + (atual.y * 10 - saida * 160).toFixed(1) + 'px';
      anel.style.translate = '0 ' + (saida * -70).toFixed(1) + 'px';
      anel.style.scale = (1 + saida * 0.1).toFixed(3);
      anel.style.opacity = (1 - saida * 1.15).toFixed(3);
      quadroId = requestAnimationFrame(quadro);
    }

    new IntersectionObserver(function (itens) {
      cancelAnimationFrame(quadroId);
      if (itens[0].isIntersecting) quadroId = requestAnimationFrame(quadro);
    }).observe(hero);
  }

  // Cada bloco entra uma vez só, quando chega à tela.
  function iniciarRevelacao() {
    if (menosMovimento) return;
    var seletor = '.pa-secao__cabeca > *, .sobre__foto, .projeto__cabeca, .projeto__texto > *, .projeto__acoes, .outros > h3, .outros__lista li, .sobre__texto > *, .prova li, .contato__painel, .contato__intro > *, .pa-form > *, .caso-texto > *, .caso-futuro li, .caso-tela, .caso-nota, .caso-bloco, .caso-decisoes li';
    var olho = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (!item.isIntersecting) return;
        item.target.classList.add('is-visivel');
        olho.unobserve(item.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    document.querySelectorAll(seletor).forEach(function (el) {
      el.dataset.revela = '';
      el.style.setProperty('--i', Math.min(Array.prototype.indexOf.call(el.parentNode.children, el), 6));
      olho.observe(el);
    });

    // As capas saem do anel: chegam giradas e terminam de frente para quem olha.
    var olhoCapas = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (!item.isIntersecting) return;
        var card = item.target;
        delete card.dataset.entra;
        olhoCapas.unobserve(card);
        setTimeout(function () { card.classList.add('is-solta'); }, 1200);
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.projeto .pa-card').forEach(function (card) {
      card.dataset.entra = '';
      olhoCapas.observe(card);
    });
  }

  // Parallax da imagem dentro da capa e inclinação 3D com brilho seguindo o mouse.
  function iniciarCapas() {
    if (menosMovimento) return;
    var cards = document.querySelectorAll('.projeto .pa-card, .caso-capa'), pedido = 0;

    function mover() {
      pedido = 0;
      var altura = window.innerHeight;
      cards.forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (r.bottom < 0 || r.top > altura) return;
        var d = (r.top + r.height / 2 - altura / 2) / (altura / 2 + r.height / 2);
        c.style.setProperty('--py', (d * r.height * -0.05).toFixed(1) + 'px');
      });
    }

    window.addEventListener('scroll', function () { if (!pedido) pedido = requestAnimationFrame(mover); }, { passive: true });
    mover();
    if (!comMouse) return;

    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 9).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });
  }

  // Botão laranja e setas puxam de leve na direção do mouse.
  function iniciarIma() {
    if (menosMovimento || !comMouse) return;
    document.querySelectorAll('.pa-botao--primario, .pa-seta').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.translate = ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });
  }

  // Cursor-ponto: só em aparelhos com mouse. O cursor normal continua visível.
  function iniciarCursor() {
    if (!comMouse || menosMovimento) return;
    var ponto = document.createElement('div'), alvo = { x: 0, y: 0 }, atual = { x: 0, y: 0 }, quadroId = 0;
    ponto.className = 'pa-cursor';
    ponto.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ponto);

    function quadro() {
      atual.x += (alvo.x - atual.x) * 0.22;
      atual.y += (alvo.y - atual.y) * 0.22;
      ponto.style.transform = 'translate(' + atual.x.toFixed(1) + 'px,' + atual.y.toFixed(1) + 'px) translate(-50%,-50%)';
      quadroId = Math.abs(alvo.x - atual.x) + Math.abs(alvo.y - atual.y) > 0.3 ? requestAnimationFrame(quadro) : 0;
    }

    document.addEventListener('pointermove', function (e) {
      if (!ponto.classList.contains('is-visivel')) { atual.x = e.clientX; atual.y = e.clientY; }
      alvo.x = e.clientX;
      alvo.y = e.clientY;
      var campo = !!e.target.closest('input, textarea');
      ponto.classList.add('is-visivel');
      ponto.classList.toggle('is-campo', campo);
      ponto.classList.toggle('is-sobre', !campo && !!e.target.closest('a, button, select, label'));
      if (!quadroId) quadroId = requestAnimationFrame(quadro);
    });
    document.documentElement.addEventListener('pointerleave', function () { ponto.classList.remove('is-visivel'); });
  }

  function iniciarTopo() {
    var links = document.querySelectorAll('.pa-nav__link'), barra = document.querySelector('.pa-nav nav');
    var indicador = document.createElement('span');
    indicador.className = 'pa-nav__indicador';
    indicador.setAttribute('aria-hidden', 'true');
    barra.appendChild(indicador);

    function moverIndicador() {
      var ativo = barra.querySelector('[aria-current]');
      if (!ativo) return;
      var a = ativo.getBoundingClientRect(), b = barra.getBoundingClientRect();
      indicador.style.width = a.width + 'px';
      indicador.style.transform = 'translateX(' + (a.left - b.left) + 'px)';
    }

    function aoRolar() { topo.classList.toggle('is-rolado', window.scrollY > 40); }
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', moverIndicador);
    aoRolar();
    moverIndicador();
    if (document.fonts) document.fonts.ready.then(moverIndicador);

    var espiao = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (!item.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + item.target.id) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
        moverIndicador();
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'projetos', 'sobre', 'contato'].forEach(function (id) {
      var secao = document.getElementById(id);
      if (secao) espiao.observe(secao);
    });

    // Um único botão laranja por tela: o do topo sai de cena perto do formulário.
    var contato = document.getElementById('contato');
    if (!contato) return;
    new IntersectionObserver(function (itens) {
      topo.classList.toggle('sem-cta', itens[0].isIntersecting);
    }).observe(contato);
  }

  function iniciarMenu() {
    var menu = document.getElementById('menu');
    document.querySelector('.pa-nav__menu').addEventListener('click', function () { menu.showModal(); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a, [data-fechar]')) menu.close();
    });
  }

  function iniciarContato() {
    var form = document.querySelector('[data-form]'), sucesso = form.querySelector('[data-sucesso]');
    var campos = [form.elements.nome, form.elements.mensagem];

    function validar(campo) {
      var vazio = !campo.value.trim();
      campo.setAttribute('aria-invalid', String(vazio));
      document.getElementById(campo.id + '-erro').hidden = !vazio;
      return !vazio;
    }

    campos.forEach(function (c) {
      c.addEventListener('input', function () { if (c.getAttribute('aria-invalid') === 'true') validar(c); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var erros = campos.filter(function (c) { return !validar(c); });
      sucesso.hidden = true;
      if (erros.length) {
        erros.forEach(function (c) {
          c.classList.remove('treme');
          c.getBoundingClientRect();
          c.classList.add('treme');
        });
        erros[0].focus();
        return;
      }
      var assunto = form.elements.assunto.value + ' | ' + form.elements.nome.value.trim();
      var corpo = form.elements.mensagem.value.trim() + '\n\n' + form.elements.nome.value.trim();
      window.location.href = 'mailto:' + form.dataset.email + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo);
      sucesso.hidden = false;
    });

    document.querySelectorAll('[data-copiar]').forEach(function (b) {
      b.addEventListener('click', function () {
        var original = b.textContent;
        function avisar(texto) {
          b.textContent = texto;
          setTimeout(function () { b.textContent = original; }, 2000);
        }
        navigator.clipboard.writeText(b.dataset.copiar).then(function () { avisar('Copiado'); }, function () { avisar('Selecione e copie'); });
      });
    });
  }

  // Telas das páginas de projeto: clicar amplia, e Esc ou um clique fora fecha.
  function iniciarLupa() {
    var lupa = document.getElementById('lupa'), grande = lupa.querySelector('img');
    document.querySelectorAll('[data-lupa]').forEach(function (botao) {
      botao.addEventListener('click', function () {
        var foto = botao.querySelector('img');
        grande.src = foto.currentSrc || foto.src;
        grande.alt = foto.alt;
        lupa.showModal();
      });
    });
    lupa.addEventListener('click', function () { lupa.close(); });
  }

  // A capa clicada viaja até a página do projeto, nos navegadores com transição entre páginas.
  function iniciarPassagem() {
    document.querySelectorAll('.projeto').forEach(function (p) {
      var card = p.querySelector('.pa-card');
      p.querySelectorAll('a[href^="projetos/"]').forEach(function (a) {
        a.addEventListener('click', function () { card.style.viewTransitionName = 'capa'; });
      });
    });
    window.addEventListener('pageshow', function () {
      document.querySelectorAll('.projeto .pa-card').forEach(function (c) { c.style.viewTransitionName = ''; });
    });
  }

  document.querySelector('[data-ano]').textContent = new Date().getFullYear();
  if (hero) {
    iniciarHero();
    iniciarProfundidade();
  }
  setTimeout(function () {
    document.querySelectorAll('.is-abrindo').forEach(function (el) { el.classList.remove('is-abrindo'); });
  }, 2300);
  iniciarRevelacao();
  iniciarCapas();
  iniciarIma();
  iniciarCursor();
  iniciarTopo();
  iniciarMenu();
  if (document.querySelector('[data-form]')) iniciarContato();
  if (document.getElementById('lupa')) iniciarLupa();
  iniciarPassagem();
})();
