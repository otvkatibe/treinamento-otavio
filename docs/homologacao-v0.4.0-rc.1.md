# Homologação real — v0.4.0-rc.1

Esta release candidate valida o redesign completo antes da promoção para `0.4.0`. A referência estável e o rollback continuam sendo a `0.3.1`.

## Assets da candidata

Personalização/CSS:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css?v=0.4.0-rc.1">
```

Scripts/JavaScript:

```html
<script defer src="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.js?v=0.4.0-rc.1"></script>
```

Após salvar e publicar no Zeev, recarregue com o cache desabilitado e confirme no console:

```js
window.__ZEEV_FIEB__?.version === '0.4.0-rc.1'
window.__ZEEV_FIEB__?.bootstrapStatus === 'mounted'
window.__ZEEV_FIEB__?.diagnostics()
```

## Fluxo de homologação

- START: validar layout, campos pessoais, radios, foco, resumo, stepper e `Enviar solicitação`.
- T01: validar dados anteriores, contato/endereço, upload de cadastro e `Concluir`.
- T02: validar campos readonly, viewer/download e as ações `Aprovar`, `Solicitar correção` e `Reprovar`.
- T03: entrar por `Solicitar correção`, validar estado amber/correction, campos e arquivo editáveis, `correcaoRealizada` e `Concluir`.
- Retorno T02: confirmar T03 como `visited`, texto de revalidação e persistência de `visitedStages`; então aprovar o cadastro.
- T04: validar dados do contrato, data, moeda, upload e `Concluir`.
- T05: validar scalars e arquivo readonly, resumo consolidado e as duas decisões finais.

Em cada etapa, executar diagnostics e confirmar `rootCount = 1`, `bootstrapStatus = mounted`, ausência de erros no console e preservação dos controles nativos. Validar desktop, notebook, tablet e mobile, além de teclado, foco, zoom e overlays do Zeev.

## Rollback estável

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/releases/v0.3.1/dist/zeev-fieb.css?v=0.3.1">
<script defer src="https://otvkatibe.github.io/treinamento-otavio/releases/v0.3.1/dist/zeev-fieb.js?v=0.3.1"></script>
```

A promoção para `0.4.0` só pode ocorrer depois do PASS funcional e visual do fluxo completo no h-Zeev.
