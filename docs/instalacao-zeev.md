# Instalação da customização v0.3.0 no Zeev

## Pré-requisitos

- `npm run typecheck`, `npm run test` e `npm run build` aprovados;
- `dist/zeev-fieb.css` e `dist/zeev-fieb.js` publicados no host configurado;
- permissão do operador para editar Scripts e Estilos do aplicativo Zeev.

## Fontes externas

Cadastre as URLs estáveis abaixo em Scripts e Estilos → Fontes externas → Scripts e estilos nas atividades:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css">
<script defer src="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.js"></script>
```

Não misture query strings de releases anteriores. Controle a publicação pelo conteúdo dos artefatos e valide a resposta remota após o deploy.

## Verificação

Abra START (`Solicitar registro`) e uma tarefa humana. Confirme uma React Island antes de `#ContainerForm`, formulário e botões nativos intactos, e execute:

```js
window.__ZEEV_FIEB__?.diagnostics()
```

Consulte `docs/homologacao-v0.3.0.md` para a matriz START/T1–T5.

## Rollback

Remova primeiro o script e depois o stylesheet para retornar ao Zeev nativo. Como alternativa visual histórica, remova o script e aponte o link para `releases/v0.2.1/zeev-fieb.css`. Salve, publique e recarregue sem cache.
