# Debug da customização v0.3.0 no h-Zeev

## Carregamento

Confirme no painel Network respostas bem-sucedidas para as URLs estáveis:

```text
https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css
https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.js
```

Não use query strings de versões anteriores. Recarregue com cache desabilitado após a publicação.

## Runtime e mount

Execute na janela que contém o processo:

```js
({
  runtime: Boolean(window.__ZEEV_FIEB__),
  roots: document.querySelectorAll('#zeev-fieb-root').length,
  beforeForm:
    document.querySelector('#zeev-fieb-root')?.nextElementSibling?.id ===
    'ContainerForm',
  report: window.__ZEEV_FIEB__?.diagnostics(),
})
```

Em frame, use `top.frames[0]` somente quando esse for o frame do Zeev. Deve existir um runtime e um root conectado antes de `#ContainerForm`.

## Problemas comuns

- `404`: artefato não publicado ou caminho incorreto.
- runtime ausente: script bloqueado, carregado na página/frame errado ou erro de inicialização.
- `known: false`: confira o texto de `.page-title h1`; somente whitespace é normalizado.
- root duplicado/desconectado: registre URL, título e mutação que precedeu o problema.
- `FAIL` em campo/ação: inspecione o DOM real sob `#containerRequest #FrmExecute` e compare `data-name`/texto nativo.
- CSS ausente: confirme que o link está no mesmo contexto da tela e que as regras permanecem escopadas.

Teste START, T1–T5, fallback desconhecido, rota T2 → T3 → T2 e os encerramentos decisórios de T2/T5. Diagnostics ajuda a localizar divergências do DOM, mas não substitui a homologação BPMN humana.
