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
| Fotos dos slides | `assets/img/slides/<nome>-{960,1600,2400}.webp`, em 16:9 |
| Páginas de projeto | `projetos/`, com um HTML por projeto |
| Telas das páginas de projeto | `assets/img/telas/`, em 1600 × 1000 |
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
| `data-foto` | Começo do nome dos arquivos da foto, sem o tamanho |
| `data-materia-titulo` e `data-materia-italico` | Título e itálico que a cortina branca mostra; precisam ser iguais aos da página que abre |

### Adicionar um projeto

1. Copie um `<article class="slide">` no `index.html` e troque o `id`, os textos e os `data-*`.
2. Coloque a foto em `assets/img/slides/`, nos três tamanhos.
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

## Créditos das fotos

Fotos do Unsplash, todas sob a [Licença Unsplash](https://unsplash.com/license), conferida em 2026-11-09. Cada uma está em `assets/img/slides/<arquivo>-{960,1600,2400}.webp`. As imagens de compartilhamento em `assets/img/og/` são recortes de 1200 × 630 das mesmas fotos.

| Arquivo | Tema | Autor | Foto | Foco |
| --- | --- | --- | --- | --- |
| `angelo` | montanhas sob céu noturno azul | [Nathan Anderson](https://unsplash.com/@nathananderson) | [iYO-EGosrCo](https://unsplash.com/photos/iYO-EGosrCo) | 50% 50% |
| `vaultcore` | porta de cofre | [David Trinks](https://unsplash.com/@dtrinksrph) | [tEP6TI8pXW4](https://unsplash.com/photos/tEP6TI8pXW4) | 50% 50% |
| `master-dashboard` | estrada entre árvores escuras | [Mykyta Kondratov](https://unsplash.com/@etheok) | [xcx_NyXzvJM](https://unsplash.com/photos/xcx_NyXzvJM) | 50% 50% |
| `doramarank` | Seul à noite | [Yohan Cho](https://unsplash.com/@yohoney) | [Mwvhyd22Lyw](https://unsplash.com/photos/Mwvhyd22Lyw) | 50% 50% |
| `fii-tracker` | cidade ao entardecer, vista do alto | [Scott Rodgerson](https://unsplash.com/@scottrodgerson) | [AGKIT7CVbYg](https://unsplash.com/photos/AGKIT7CVbYg) | 50% 50% |
| `parcelas` | estrada à noite com rastros de luz | [515 Freedom](https://unsplash.com/@freedom_515) | [nC2A_04az8k](https://unsplash.com/photos/nC2A_04az8k) | 50% 50% |
| `primeiros-passos` | trilha entre picos de montanha | [Valeriia Kryshchuk](https://unsplash.com/@mooonshine) | [t6BwhiIQusU](https://unsplash.com/photos/t6BwhiIQusU) | 50% 50% |
| `meu-cofre` | cadeado antigo | [Zoshua Colah](https://unsplash.com/@zoshuacolah) | [mknpZ5FY2bo](https://unsplash.com/photos/mknpZ5FY2bo) | 50% 50% |
| `este-site` | a Terra à noite vista do espaço | [Allison Saeng](https://unsplash.com/@allisonsaeng) | [X1rfqK8JDL0](https://unsplash.com/photos/X1rfqK8JDL0) | 50% 50% |

## Fontes e bibliotecas

- Bellefair, Lato e Cormorant Garamond, sob a SIL Open Font License; os textos das licenças estão em `assets/fonts/`.
- GSAP 3.15.1, sob a licença gratuita "Standard 'No Charge' License"; detalhes em `assets/vendor/gsap/LICENCA.md`.
