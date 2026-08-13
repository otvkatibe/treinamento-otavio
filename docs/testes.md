# Testes e homologação — v0.3.1

## Suíte automatizada

```bash
npm run typecheck
npm run test
npm run build
npm audit
```

A suíte cobre detecção START/T1–T5 e unknown, campos por `data-name`, lifecycle SPA, root único/reparo/teardown, diagnostics, Stepper responsivo e rota observada T2 → T3 → T2. Testes simulados não comprovam execução BPMN real.

## Matriz

| Stage | Automatizado | Homologação humana |
| --- | --- | --- |
| START | Título → `START`, sete campos, radios, mount | Abrir evento inicial, preencher e enviar para T1 |
| T1 | Detecção e cinco campos recentes | Editar, anexar PDF, persistir e concluir para T2 |
| T2 | Detecção e contrato das três ações | Aprovar, reprovar e solicitar correção em execuções controladas |
| T3 | Detecção condicional, campos corrigíveis e rota observada | Ler Mensagens, corrigir dados e retornar a T2 |
| T4 | Detecção e quatro campos contratuais | Validar data/moeda/upload/viewer e concluir para T5 |
| T5 | Detecção, UI de decisão final e duas ações | Aprovar e reprovar o contrato; confirmar eventos e encerramentos |
| unknown | `known: false`, `code: null`, sem Stepper | Confirmar tela nativa funcional |

Também valide papéis: Requisitante/Solicitante/Atendente em START, T1 e T3; Gestor Imediato ou Superior/Administrativo em T2, T4 e T5. Raia funcional e atribuição executável são verificadas separadamente.

## Checklist visual e SPA

- exatamente um `#zeev-fieb-root`, antes de `#ContainerForm`;
- header, status e Stepper coerentes com o título;
- T3 aparece condicional antes da rota e percorrida após ser observada;
- T5 exibe `Validar o contrato` e decisão final;
- Stepper horizontal em largura ≥ 900 px e vertical em largura < 900 px;
- inputs, Mensagens e botões nativos permanecem operantes;
- transições SPA não duplicam lifecycle/root;
- styling de texto, telefone, endereço, CEP, número, data, moeda, arquivo/viewer, textarea e radios permanece escopado.

## Diagnostics

Execute `window.__ZEEV_FIEB__?.diagnostics()` (ou pelo frame). Espere `PASS`, investigue `FAIL` e aceite `SKIP/N/A` somente quando o controle não se aplicar. O relatório valida DOM/mount/stage; persistência, atribuição, SLA, Mensagens e gateways exigem homologação humana.
