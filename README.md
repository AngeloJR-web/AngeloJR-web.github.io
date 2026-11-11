# Portfólio do Angelo

Meu portfólio, no ar em <https://angelojr-web.github.io>. É HTML, CSS e JavaScript puro, sem build. As animações são feitas com [GSAP](https://gsap.com), que fica guardado aqui mesmo no repositório, em `assets/vendor/gsap/`.

O visual foi inspirado no ["Blue Planet" Carousel Concept](https://dribbble.com/shots/7129691--Blue-Planet-Carousel-Concept), do Giulio Cuscito.

## Rodando no computador

```bash
npm run dev
```

Depois é só abrir <http://localhost:4173>.

## Onde fica cada coisa

O Início é o `index.html`. Cada slide é um `<article class="slide">`, e os textos e links ficam direto nele. As páginas dos projetos estão em `projetos/`, uma por projeto, e a Sobre (com o formulário de contato) é o `sobre.html`.

Imagens:

- `assets/img/telas/`: prints dos apps, em 1600 × 1000. Aparecem nos slides, nas páginas de projeto e na Trajetória da Sobre.
- `assets/img/trajetoria/`: os prints da Trajetória que não têm página de projeto.
- `assets/img/slides/`: a foto do slide de apresentação, em três larguras (960, 1600 e 2400).
- `assets/img/angelo.webp`: minha foto do "Quem sou", em 480 × 600.
- `assets/img/og/`: as imagens que aparecem quando alguém compartilha o link, em 1200 × 630.

Estilos e scripts:

- As cores, as fontes e os tamanhos ficam no `assets/css/tokens.css`. As cores do tema escuro da Sobre e dos projetos estão no fim dele, e o `tema.js` guarda a escolha feita no botão do topo.
- `inicio.css` cuida do carrossel do Início, e `materia.css` das páginas de projeto e da Sobre.
- O cabeçalho, o menu, as laterais e as cortinas de transição estão em `comum.css` e `comum.js`.
- Os tempos da troca de slide ficam no `cronograma.js`, as curvas das animações no `curvas.js` e o tamanho dos cartões (com o efeito de profundidade) no `MEDIDAS` do `geometria.js`.
- As animações ao rolar a Sobre e as páginas de projeto são do `revelar.js`.
- A espera do giro automático (6 s) e do "clique e segure" (600 ms) dá pra mudar no `carrossel.js`.

### Atributos de um slide

- `id`: o endereço do slide, tipo `index.html#vaultcore`.
- `data-nome`: o nome que aparece no menu.
- `data-etiqueta`: a etiqueta vertical da esquerda.
- `data-abre`: a página que abre quando alguém clica no título ou usa o "clique e segure".
- `data-tela`: o print do app que o slide mostra, desfocado com o slide aberto e nítido no modo cartão. Uso o mesmo que abre a grade da página do projeto.
- `data-foto`: só o slide de apresentação usa. É o começo do nome dos arquivos da foto, sem o tamanho.
- `data-materia-titulo` e `data-materia-italico`: o título e o itálico que aparecem na cortina branca. Precisam ser iguais aos da página que abre.

Se o texto ficar difícil de ler em cima de alguma imagem, dá pra escurecer mais com `style="--escurecer: .58"`. O padrão é .4.

### Pra adicionar um projeto

1. Copio um `<article class="slide">` no `index.html` e troco o `id`, os textos e os `data-*`.
2. Coloco o print principal do app em `assets/img/telas/` (1600 × 1000) e aponto o `data-tela` pra ele.
3. Adiciono o slide no menu (`.menu__slides`) de todas as páginas.
4. Copio uma página de `projetos/`, troco o conteúdo e acerto o "Próximo projeto" da página anterior.

O carrossel, a numeração e a paginação se montam sozinhos a partir dos slides.

### Conferindo as animações

Com `?medir` no endereço do Início, a troca de slide vai passo a passo e o console mostra o relatório `[medir]`, que compara os tempos e as medidas com o vídeo do conceito. Com `?reduzir`, aparece a versão com movimento reduzido.

### Formulário de contato

Como o site não tem servidor, o formulário da Sobre abre o app de e-mail de quem está visitando, com a mensagem já pronta para o endereço que está em `data-email`.

## Publicação

O site fica no GitHub Pages e sai da branch `main`. Cada push atualiza o endereço em mais ou menos um minuto.

Os caminhos são todos relativos, então dá pra hospedar em outro lugar. Aí só precisa trocar o endereço nas tags de compartilhamento, no `sitemap.xml` e no `robots.txt`.

## Créditos

A foto das montanhas do slide de apresentação é do [Nathan Anderson](https://unsplash.com/@nathananderson), no Unsplash ([foto original](https://unsplash.com/photos/iYO-EGosrCo), [licença](https://unsplash.com/license)). As imagens de compartilhamento do Início e da Sobre são recortes dela.

O resto são prints dos meus apps, com dados de exemplo. Os pôsteres que aparecem no DoramaRank vêm do The Movie Database. As imagens de compartilhamento dos projetos são recortes do topo do print principal de cada um.

As fontes Bellefair, Lato e Cormorant Garamond estão sob a SIL Open Font License, e os textos das licenças ficam em `assets/fonts/`. O GSAP 3.15.1 usa a licença gratuita "Standard 'No Charge' License", com os detalhes em `assets/vendor/gsap/LICENCA.md`.
