# Site BioMake

Site 100% estático (HTML, CSS e JS), pensado primeiro para celular. A pasta `site/` é tudo o que vai ao ar.

## Ver no computador
Dê dois cliques em `abrir-site.bat` (precisa do Node.js) ou rode `node tools/serve-local.js` e abra http://localhost:3000.

## Onde editar
- Lojas (endereço, WhatsApp, Instagram): topo de `site/app.js`, lista `STORES`. As marcas que flutuam na página inicial estão na lista `BRANDS`.
- Textos: `site/index.html`.
- Cores e tamanhos: `site/styles.css` (as regras de telas grandes ficam no final do arquivo).
- Fotos flutuantes do início: `site/img/fx/` (recortes em webp) e as classes `.fx-*` em `site/styles.css`.
- Ao mudar `app.js` ou `styles.css`, troque o número `?v=` nos links do `index.html` para o celular baixar a versão nova.

## Publicar
- **Vercel:** o `vercel.json` já aponta a pasta `site/`. Todo push na `main` publica sozinho.
