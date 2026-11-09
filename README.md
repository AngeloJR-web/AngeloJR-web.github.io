# Portfólio do Angelo

Site publicado em <https://angelojr-web.github.io>, feito só com HTML, CSS e JavaScript, sem dependências e sem etapa de build. O visual segue o Design System [Portfólio Angelo](https://claude.ai/artifact/WBaJfFJApxVyjRKZv9w4zs).

## Ver no computador

```bash
npm run dev
```

O site abre em <http://localhost:4173>.

## Como editar

| O que mudar | Onde |
| --- | --- |
| Textos, projetos, links e números | `index.html` |
| Slides do carrossel | Saem de cada `<article class="projeto">` do `index.html` |
| Foto da seção Sobre | `assets/img/angelo.webp`, em 480 × 600 |
| Imagens ao compartilhar o link | `assets/img/og/`, em 1200 × 630 |
| Capa de um projeto | `assets/img/capas/`, em 640 × 1104 |
| Fundo desfocado de um slide | `assets/img/fundos/`, em 320 × 552 |
| Cores, espaços e medidas | `assets/css/tokens.css` |
| Componentes do Design System | `assets/css/sistema.css` |
| Partes próprias do site | `assets/css/site.css` |
| Página Sobre | `sobre.html` e `assets/css/sobre.css` |
| Linha do tempo da página Sobre | Cada `<li class="tempo__item">` do `sobre.html` vira um capítulo do anel |
| Páginas de projeto | `projetos/`, com um HTML por projeto, e `assets/css/projeto.css` |
| Telas das páginas de projeto | `assets/img/telas/`, em 1600 × 1000 |
| Carrossel, menu e formulário | `assets/js/site.js` |
| Tempo de cada slide no giro automático | `assets/css/site.css`, na regra `.pa-hero.is-auto` |

### Adicionar um projeto

1. Copie um `<article class="projeto">` no `index.html` e troque o `id`, os textos e os links.
2. Preencha `data-titulo` com as duas linhas do título separadas por `|`, como em `PARCELAS|– FINANÇAS`.
3. Preencha `data-pagina`, `data-tag` e `data-fundo`.
4. Coloque a capa e o fundo nas pastas de imagens.
5. Copie uma página de `projetos/`, troque o conteúdo e ajuste o link do próximo projeto na página anterior.

O carrossel se monta sozinho a partir dessa lista. Mantenha entre 5 e 7 slides, contando o de apresentação, para o anel não ficar com buracos.

### Formulário de contato

O site não tem servidor. Por isso o formulário abre o app de e-mail de quem visita, com a mensagem pronta para o endereço em `data-email`, no `index.html`.

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
