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

- títulos e detecção do Evento de Início `START` e das tarefas humanas T1–T5;
- escopo do formulário e presença dos sete campos Zeev;
- campos simples como `input[type="text"][data-fieldformat="TEXT"]`;
- grupos `estadoCivil` e `tipoDocumento` como radios e cardinalidade de seleção única;
- preservação do botão nativo `#BtnSend`;
- criação de um único `#zeev-fieb-root` antes de `#ContainerForm`;
- idempotência, debounce e navegação SPA;
- recuperação do mount e do React root sem duplicação;
- teardown determinístico e ausência de autoexecução em `lifecycle.ts`.

Esses contratos não precisam ser repetidos manualmente em cada tarefa.

## 2. Publicação, cache e integridade

Durante a homologação, o Zeev utiliza URLs estáveis, sem query string de versão:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css">
<script defer src="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.js"></script>
```

Após cada publicação, valide o conteúdo efetivamente servido pelo GitHub Pages comparando o SHA-256 remoto com o artefato local. Se o Pages ainda entregar a versão anterior por cache intermediário, aguarde a expiração do TTL antes de iniciar a homologação.

O reload com cache desabilitado elimina somente o cache local do navegador; ele não invalida o cache intermediário do GitHub Pages.

Artefatos associados ao commit `55fab2a4527b3454ae3bdf9290aeece33aafd72b`:

- CSS v0.3.0: `ae21b34ed7c3137cbc65cc5834c10be300e44804b5f15222a8a2c92353dd1af0`;
- JS v0.3.0: `c46580a803831f0a8ca36c7247b42de282f838f072d76375ae1c86cdbb325632`;
- CSS rollback v0.2.1: `acd01866ad5a20f510d3cfbf331e1280ffef0ec8d24be6dc61e830983f28541e`.

Esses hashes comprovam a integridade e identificam inequivocamente a versão homologada, mesmo com URLs estáveis.

## 3. Smoke check no h-Zeev

Depois de confirmar os hashes remotos e fazer reload completo com o cache local desabilitado, execute uma vez por tela no console:

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

O aceite determinístico exige `report.passed === true` e `report.status === "PASS"`. Em caso de `FAIL`, exporte o objeto inteiro e registre os checks reprovados; não repita manualmente cada consulta DOM.

O smoke check deve ser executado após cada transição SPA para confirmar que o runtime acompanhou a nova etapa. A tela `Solicitar registro` deve retornar `task.code === "START"`; as tarefas humanas seguintes devem retornar T1–T5.

O modelo de domínio possui seis etapas visuais:

| Índice | Código | Tipo Zeev | Título |
| :--- | :--- | :--- | :--- |
| 0 | `START` | Evento de Início | Solicitar registro |
| 1 | `T1` | Tarefa humana | T01 - Fazer o cadastro |
| 2 | `T2` | Tarefa humana | T02 - Validar o cadastro |
| 3 | `T3` | Tarefa humana condicional | T03 - Corrigir o cadastro |
| 4 | `T4` | Tarefa humana | T04 - Fazer o contrato |
| 5 | `T5` | Tarefa humana | T05 - Validar o contrato |

A configuração BPMN do Evento de Início é responsabilidade do operador no Zeev. O runtime apenas detecta e representa a tela inicial já fornecida pela plataforma.

## 4. Validação humana reduzida

Validar manualmente somente o que o DOM não comprova adequadamente:

- hierarquia visual, legibilidade e coerência entre Island e formulário nativo;
- radios circulares, alinhados e sem caixa deformada na opção marcada;
- aparência real do foco por teclado e contraste percebido;
- ausência de cortes ou sobreposições nos breakpoints de 900, 720 e 600 px;
- envio pelo botão nativo e transições reais START → T1 → T2 → T3 → T2 → T4 → T5;
- decisão de correção em T2, correção em T3 e retorno posterior ao fluxo aprovado;
- preservação dos dados e regras de negócio após cada submit.

## 5. Rollback

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

## 6. Futuro E2E

Esta fase não adiciona ferramenta E2E. Se uma etapa futura exigir automação de navegador, a dependência e sua versão exata deverão ser propostas antes da implementação, acompanhadas do comando `npm` completo e da justificativa para instalação manual pelo operador, conforme `AGENTS.md`.
