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
