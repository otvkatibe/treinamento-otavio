# FASE 5 — Publicação e homologação v0.3.0

Este roteiro divide a homologação em três camadas. Contratos determinísticos ficam na suíte automatizada; o ambiente real executa um único smoke check consolidado; somente percepção visual e transições reais do workflow permanecem manuais.

## 1. Testes automatizados

Execute antes de cada publicação:

```bash
npm run test
npm run typecheck
npm run build
npm audit
git diff --check
```

A suíte cobre automaticamente:

- títulos e detecção das tarefas T0–T5;
- escopo do formulário e presença dos sete campos Zeev;
- campos simples como `input[type="text"][data-fieldformat="TEXT"]`;
- grupos `estadoCivil` e `tipoDocumento` como radios e cardinalidade de seleção única;
- preservação do botão nativo `#BtnSend`;
- criação de um único `#zeev-fieb-root` antes de `#ContainerForm`;
- idempotência, debounce e navegação SPA;
- recuperação do mount e do React root sem duplicação;
- teardown determinístico e ausência de autoexecução em `lifecycle.ts`.

Esses contratos não precisam ser repetidos manualmente em cada tarefa.

## 2. Smoke check no h-Zeev

Depois de publicar e fazer reload completo com a chave de cache atual, execute uma vez por tela no console:

```js
const report = window.__ZEEV_FIEB__?.diagnostics();
console.table(report?.checks);
report;
```

O relatório contém:

- status consolidado `PASS` ou `FAIL`;
- versão, inicialização, tarefa observada e sincronização do lifecycle;
- quantidade e posição dos mounts;
- presença, tipo e estilos mensuráveis dos campos;
- quantidade de opções e radios marcados por grupo;
- presença, tipo e estado disabled do `#BtnSend`.

O aceite determinístico exige `report.status === "PASS"`. Em caso de `FAIL`, exporte o objeto inteiro e registre os checks reprovados; não repita manualmente cada consulta DOM.

O smoke check deve ser executado após cada transição SPA para confirmar apenas que o runtime acompanhou a nova tarefa. T0–T5 devem retornar seus respectivos códigos.

## 3. Validação humana reduzida

Validar manualmente somente o que o DOM não comprova adequadamente:

- hierarquia visual, legibilidade e coerência entre Island e formulário nativo;
- radios circulares, alinhados e sem caixa deformada na opção marcada;
- aparência real do foco por teclado e contraste percebido;
- ausência de cortes ou sobreposições nos breakpoints de 900, 720 e 600 px;
- envio pelo botão nativo e transições reais T0 → T1 → T2 → T3 → T2 → T4 → T5;
- decisão de correção em T2, correção em T3 e retorno posterior ao fluxo aprovado;
- preservação dos dados e regras de negócio após cada submit.

## 4. Rollback

Remova completamente o script, substitua o stylesheet pelo CSS v0.2.1 e publique a configuração:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/releases/v0.2.1/zeev-fieb.css?v=0.2.1">
```

Faça reload completo ignorando o cache antes de validar:

```js
({
  runtime: typeof window.__ZEEV_FIEB__,
  roots: document.querySelectorAll('#zeev-fieb-root').length,
})
```

O resultado esperado é `{ runtime: "undefined", roots: 0 }`.

## 5. Futuro E2E

Esta fase não adiciona ferramenta E2E. Se uma etapa futura exigir automação de navegador, a dependência e sua versão exata deverão ser propostas antes da implementação, acompanhadas do comando `npm` completo e da justificativa para instalação manual pelo operador, conforme `AGENTS.md`.
