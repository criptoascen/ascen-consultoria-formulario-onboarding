# Como atualizar o Apps Script (2 minutos)

Quando o [Code.gs](Code.gs) desta pasta for atualizado, é preciso republicar
o script mantendo a mesma URL:

## Passo a passo

1. Acesse **script.google.com** e abra o projeto **"Ascen Onboarding Backend"**.
2. Apague todo o código atual e cole o conteúdo de **Code.gs**.
3. Salve (Ctrl+S).
4. Clique em **Implantar → Gerenciar implantações**.
5. Na implantação ativa, clique no **lápis ✏️ → Versão: "Nova versão" → Implantar**.
   ⚠️ **NÃO** crie uma "Nova implantação" — isso mudaria a URL e o site pararia de achar o script.
6. Se o Google pedir permissões novas, autorize.

## Como saber se deu certo

Abra a URL do script no navegador (a mesma que está no `ENDPOINT_URL` do index.html,
terminando em `/exec`). Deve aparecer:

```
{"ok":true,"ping":true,"servico":"ascen-onboarding","versao":2}
```

## O que o script novo faz

- Grava cada cadastro na planilha **"Ascen Onboarding — Cadastros"** (criada
  automaticamente no seu Drive no primeiro cadastro).
- Manda o e-mail de aviso (como antes).
- Repassa a resposta ao Google Forms oficial no formato correto (inclusive "Outro").
- Responde `{ok:true}` ao site — só aí o cliente vê "Cadastro registrado!".
- Ignora reenvios duplicados do mesmo cadastro (dedupe pelo ID).

## Se criar uma nova implantação sem querer

A URL muda. Nesse caso, atualize a constante `ENDPOINT_URL` no `index.html`
com a URL nova (ou me mande a URL que eu atualizo).
