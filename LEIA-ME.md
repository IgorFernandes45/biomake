# Site BioMake

## Como abrir
Dê dois cliques em `iniciar-site.bat` (precisa do Node.js instalado) ou rode `node server.js`.
Crie um arquivo `senha.txt` (uma linha, só a senha da equipe); ele não vai para o GitHub.
O site abre em http://localhost:3000.

## Cadastrar promoções
1. Aba **Promoções** → rodapé → **Área da loja**.
2. Digite a senha da equipe (`senha.txt` no computador, ou a variável `BIOMAKE_PIN` na hospedagem). Se nenhuma for definida, o servidor gera uma senha aleatória e mostra no console.
3. Preencha título, descrição, destaque (ex.: "R$ 10,00" ou "-30%"), loja, validade e cor.
   - Promoções com data de validade somem sozinhas no dia seguinte.
   - "Pausar" esconde a promoção sem apagar.
As promoções ficam salvas em `data/promos.json`.

## Estrutura
- `server.js` — entrega o site e guarda as promoções (sem dependências).
- `site/` — página (`index.html`, `styles.css`, `app.js`, `scene.js` = efeitos 3D, `img/`).
- Dados das lojas: no topo de `site/app.js` (lista `STORES`).

## Publicar na internet
O site precisa de um servidor Node (para salvar promoções). Hospedagens como Render, Railway ou uma VPS servem:
comando de início `node server.js`, variável de ambiente `BIOMAKE_PIN` com a senha, e um disco persistente para a pasta `data/`.


## GitHub Pages
O workflow `.github/workflows/pages.yml` publica a pasta `site/` no GitHub Pages a cada push na `main`.
O Pages é só estático: o site aparece normalmente, mas a aba Promoções mostra a promoção padrão e a Área da loja fica escondida. Para cadastrar promoções, use a hospedagem com Node.
