# Site BioMake

Site 100% estático (HTML, CSS e JS), pensado primeiro para celular. A pasta `site/` é tudo o que vai ao ar.

## Ver no computador
Dê dois cliques em `abrir-site.bat` (precisa do Node.js) ou rode `node tools/serve-local.js` e abra http://localhost:3000.

## Onde editar
- Lojas (endereço, WhatsApp, Instagram) e marcas: topo de `site/app.js`, listas `STORES` e `BRANDS`.
- Textos: `site/index.html`.
- Cores e tamanhos: `site/styles.css` (as regras de telas grandes ficam no final do arquivo).
- Efeitos 3D: `site/scene.js`.
- Ao mudar `app.js`, `styles.css` ou `scene.js`, troque o número `?v=` nos links do `index.html` para o celular baixar a versão nova.

## Publicar
- **Vercel:** o `vercel.json` já aponta a pasta `site/`. Todo push na `main` publica sozinho.
