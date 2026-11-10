# Portfólio do Angelo

Site publicado em <https://angelojr-web.github.io>, feito com HTML, CSS e JavaScript, sem etapa de build. As animações usam o [GSAP](https://gsap.com), guardado no próprio repositório. O visual segue o conceito ["Blue Planet" Carousel Concept](https://dribbble.com/shots/7129691--Blue-Planet-Carousel-Concept), de Giulio Cuscito.

## Ver no computador

```bash
npm run dev
```

O site abre em <http://localhost:4173>. Os testes rodam com `npm test`.

## Como editar

| O que mudar | Onde |
| --- | --- |
| Textos e links dos slides | Cada `<article class="slide">` do `index.html` |
| Foto do slide de apresentação | `assets/img/slides/angelo-{960,1600,2400}.webp`, em 16:9 |
| Páginas de projeto | `projetos/`, com um HTML por projeto |
| Telas dos apps (slides de projeto, páginas de projeto e Trajetória) | `assets/img/telas/`, em 1600 × 1000 |
| Telas da Trajetória que não têm página de projeto | `assets/img/trajetoria/` |
| Página Sobre e formulário de contato | `sobre.html` |
| Foto do "Quem sou" | `assets/img/angelo.webp`, em 480 × 600 |
| Imagens ao compartilhar o link | `assets/img/og/`, em 1200 × 630 |
| Cores, fontes e tamanhos | `assets/css/tokens.css` |
| Estilos do Início | `assets/css/inicio.css` |
| Estilos das páginas de projeto e da Sobre | `assets/css/materia.css` |
| Animações ao rolar a Sobre e as páginas de projeto | `assets/js/revelar.js` |
| Cabeçalho, menu, laterais e cortinas | `assets/css/comum.css` e `assets/js/comum.js` |
| Tempos da troca de slide | `assets/js/cronograma.js` |
| Curvas das animações | `assets/js/curvas.js` |
| Tamanho dos cartões e efeito de profundidade | `assets/js/geometria.js`, em `MEDIDAS` |
| Espera do giro automático (6 s) e do "clique e segure" (600 ms) | `assets/js/carrossel.js` |

### Atributos de cada slide

| Atributo | Para que serve |
| --- | --- |
| `id` | Endereço do slide, como em `index.html#vaultcore` |
| `data-nome` | Nome do slide no menu |
| `data-etiqueta` | Etiqueta vertical à esquerda |
| `data-abre` | Página que abre no clique do título ou no "clique e segure" |
| `data-foto` | Começo do nome dos arquivos da foto, sem o tamanho (só o slide de apresentação usa) |
| `data-tela` | Tela do app que o slide de projeto mostra: desfocada com o slide aberto e nítida no modo cartão. É a mesma que abre a grade da página do projeto |
| `style="--escurecer: .58"` | Escurece mais a imagem quando o texto fica difícil de ler (o padrão é .4) |
| `data-materia-titulo` e `data-materia-italico` | Título e itálico que a cortina branca mostra; precisam ser iguais aos da página que abre |

### Adicionar um projeto

1. Copie um `<article class="slide">` no `index.html` e troque o `id`, os textos e os `data-*`.
2. Coloque a tela principal do app em `assets/img/telas/`, em 1600 × 1000, e aponte o `data-tela` do slide para ela.
3. Acrescente o slide no menu (`.menu__slides`) de todas as páginas.
4. Copie uma página de `projetos/`, troque o conteúdo e ajuste o "Próximo projeto" da página anterior.

O carrossel, a numeração e a paginação se montam sozinhos a partir dos slides. `npm test` confere se os títulos, os links e as fotos batem.

### Conferir as animações

Abra o Início com `?medir` no endereço: a troca de slide pausa a cada passo, e o console mostra o relatório `[medir]` comparando tempos e medidas com os do vídeo de referência. Com `?reduzir`, o site mostra a versão com movimento reduzido.

### Formulário de contato

O site não tem servidor. Por isso o formulário da Sobre abre o app de e-mail de quem visita, com a mensagem pronta para o endereço em `data-email`.

## Publicar

O site roda no GitHub Pages a partir da branch `main`. Cada envio para ela atualiza o endereço público em cerca de um minuto.

Todos os caminhos são relativos, então o site também funciona em outro endereço. Nesse caso, troque o endereço nas tags de compartilhamento, no `sitemap.xml` e no `robots.txt`.

## Créditos das imagens

A foto do slide de apresentação é do Unsplash, sob a [Licença Unsplash](https://unsplash.com/license), conferida em 2026-11-09. Ela está em `assets/img/slides/angelo-{960,1600,2400}.webp`, e as imagens de compartilhamento do Início e da Sobre (`assets/img/og/inicio.jpg` e `sobre.jpg`) são recortes dela.

| Arquivo | Tema | Autor | Foto | Foco |
| --- | --- | --- | --- | --- |
| `angelo` | montanhas sob céu noturno azul | [Nathan Anderson](https://unsplash.com/@nathananderson) | [iYO-EGosrCo](https://unsplash.com/photos/iYO-EGosrCo) | 50% 50% |

As outras imagens são telas dos apps do Angelo, com dados de exemplo. Os pôsteres que aparecem nas telas do DoramaRank são do The Movie Database. As imagens de compartilhamento dos projetos são recortes de 1200 × 630 do topo da tela principal de cada um.

## Fontes e bibliotecas

- Bellefair, Lato e Cormorant Garamond, sob a SIL Open Font License; os textos das licenças estão em `assets/fonts/`.
- GSAP 3.15.1, sob a licença gratuita "Standard 'No Charge' License"; detalhes em `assets/vendor/gsap/LICENCA.md`.
