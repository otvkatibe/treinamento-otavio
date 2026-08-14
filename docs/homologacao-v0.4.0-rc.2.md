# Homologação real do START — v0.4.0-rc.2

Esta candidata restringe a homologação ao START. A `0.3.1` permanece como referência estável e rollback.

## Scripts e Personalização

Personalização/CSS:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css?v=0.4.0-rc.2">
```

Scripts/JavaScript:

```html
<script defer src="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.js?v=0.4.0-rc.2"></script>
```

Após salvar e publicar no Zeev, recarregue o START com o cache desabilitado e confirme no console:

```js
window.__ZEEV_FIEB__?.version === '0.4.0-rc.2'
window.__ZEEV_FIEB__?.bootstrapStatus === 'mounted'
window.__ZEEV_FIEB__?.diagnostics()
```

## Matriz START

- Sidebar: etapas, estado ativo, numeração e alinhamento.
- Barra de ambiente de teste: texto, recarregar e adaptação em telas estreitas.
- Formulário: grid, labels, campos, foco, validação e leitura.
- Radios: cards, seleção, teclado e foco visível.
- Mensagens: contêiner, conteúdo vazio/preenchido e legibilidade.
- Anexos: contêiner, listagem e ações nativas preservadas.
- Modal `Enviar arquivos`: abertura, dropzone, seletor, metadados, tabela, progresso, botões e fechamento.
- `#BtnSend`: visibilidade, estado, foco e acionamento nativo único.
- Responsividade: desktop, notebook, tablet, mobile, zoom e ausência de overflow indevido.
- `diagnostics()`: `rootCount = 1`, `bootstrapStatus = mounted`, START reconhecido e contagens esperadas para sidebar, barra de teste, mensagens, anexos e modal quando aberto.

Registrar PASS funcional e visual somente após validar todos os itens no h-Zeev real e confirmar ausência de erros no console.

## Rollback estável

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/releases/v0.3.1/dist/zeev-fieb.css?v=0.3.1">
<script defer src="https://otvkatibe.github.io/treinamento-otavio/releases/v0.3.1/dist/zeev-fieb.js?v=0.3.1"></script>
```
