# Como atualizar o Apps Script (5 minutos)

O site agora espera que o Apps Script confirme o registro de verdade. Para isso,
o script precisa ser trocado pela versão nova ([Code.gs](Code.gs) nesta pasta).

## Passo a passo

1. Acesse **script.google.com** logado na conta Google da Ascen.
2. Abra o projeto do formulário (o que hoje manda o e-mail de backup).
3. Apague todo o código atual e cole o conteúdo de **Code.gs**.
4. Salve (Ctrl+S).
5. Clique em **Implantar → Gerenciar implantações**.
6. Na implantação ativa, clique no **lápis ✏️ → Versão: "Nova versão" → Implantar**.
   ⚠️ **NÃO** crie uma "Nova implantação" — isso mudaria a URL e o site pararia de achar o script.
7. Se o Google pedir permissões novas (Planilhas, Gmail, serviço externo), autorize.

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
