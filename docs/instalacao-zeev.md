# Instalação da candidata v0.4.0-rc.2 no Zeev

## Pré-requisitos

- `npm run typecheck`, `npm run test` e `npm run build` aprovados;
- `dist/zeev-fieb.css` e `dist/zeev-fieb.js` publicados no host configurado;
- permissão do operador para editar Scripts e Estilos do aplicativo Zeev.

## Fontes externas

Cadastre as URLs estáveis abaixo em Scripts e Estilos → Fontes externas → Scripts e estilos nas atividades:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css?v=0.4.0-rc.2">
<script defer src="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.js?v=0.4.0-rc.2"></script>
```

Não misture query strings de releases anteriores. Controle a publicação pelo conteúdo dos artefatos e valide a resposta remota após o deploy.

## Verificação

Abra START (`Solicitar registro`) e uma tarefa humana. Confirme uma React Island antes de `#ContainerForm`, formulário e botões nativos intactos, e execute:

```js
window.__ZEEV_FIEB__?.diagnostics()
```

Consulte `docs/homologacao-v0.4.0-rc.2.md` para a homologação exclusiva do START.

## Rollback

Para voltar à referência estável `0.3.1`, substitua os dois links pelos assets versionados:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/releases/v0.3.1/dist/zeev-fieb.css?v=0.3.1">
<script defer src="https://otvkatibe.github.io/treinamento-otavio/releases/v0.3.1/dist/zeev-fieb.js?v=0.3.1"></script>
```

Para retornar ao Zeev nativo, remova primeiro o script e depois o stylesheet. Salve, publique e recarregue sem cache.
