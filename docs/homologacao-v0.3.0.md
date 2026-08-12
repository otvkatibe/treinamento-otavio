# Publicação e homologação — v0.3.0

## Gate automatizado

Execute na raiz, usando as dependências instaladas pelo operador:

```bash
npm run typecheck
npm run test
npm run build
npm audit
```

O build deve produzir `dist/zeev-fieb.js` e `dist/zeev-fieb.css`. Registre os resultados da execução atual; hashes ou commits de builds anteriores não são evidência vigente.

## URLs estáveis

Configure ambos os artefatos, sem query string de versão:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css">
<script defer src="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.js"></script>
```

Depois do deploy, confirme resposta HTTP bem-sucedida para as duas URLs, recarregue a tela com cache desabilitado e valide o conteúdo remoto contra os artefatos gerados nessa publicação.

## Contrato por stage

| Stage | Título | Diagnostics/automção | Homologação humana obrigatória |
| --- | --- | --- | --- |
| `START` | Solicitar registro | Detecção, root único/conectado antes de `#ContainerForm`, sete campos pessoais, radios e botão nativo quando aplicável | Criar instância, preencher, enviar e confirmar START → T1 |
| `T1` | T01 - Fazer o cadastro | `telefone`, `logradouro`, `cepEndereco`, `numeroEndereco`, `documentoCadastroPdf` | Persistência, upload, atribuição e T1 → T2 |
| `T2` | T02 - Validar o cadastro | Stage, dados consultáveis e ações `Aprovar`, `Reprovar`, `Solicitar correção` | Exercitar cada gateway, Mensagens, destinatários e encerramento por reprovação |
| `T3` | T03 - Corrigir o cadastro | Stage condicional, dados corrigíveis e `correcaoRealizada` quando presente | Confirmar Mensagens/histórico, corrigir dados e executar T2 → T3 → T2 |
| `T4` | T04 - Fazer o contrato | `numeroContrato`, `dataContrato`, `valorContrato`, `documentoContratoPdf` | Persistência, moeda/data, upload/viewer e T4 → T5 |
| `T5` | T05 - Validar o contrato | Stage, dados contratuais e ações `Aprovar o contrato`, `Reprovar o contrato` | Exercitar as duas decisões, eventos de mensagem e os dois encerramentos |
| desconhecido | qualquer outro título | `known: false`, `code: null`, UI neutra e sem Stepper | Confirmar que a tela nativa permanece funcional |

`T0` não é um stage válido. START é evento inicial; T1–T5 são tarefas humanas. T3 é rota condicional observada, e T5 é uma validação decisória final.

## Smoke check em cada tela

No console da janela ou do frame que contém o Zeev:

```js
const report = window.__ZEEV_FIEB__?.diagnostics();
console.table(report?.checks);
console.log(report?.status, report?.task, report?.mount, report?.failedChecks);
```

Quando o processo estiver em frame, use `top.frames[0].__ZEEV_FIEB__?.diagnostics()`. Espere `PASS` quando todos os elementos aplicáveis estiverem presentes; `SKIP/N/A` é aceitável apenas para controles não aplicáveis à tela. Investigue todo `FAIL` antes de prosseguir.

Em todas as transições, confirme:

- um lifecycle em `window.__ZEEV_FIEB__`;
- um `#zeev-fieb-root`, conectado e antes de `#ContainerForm`;
- título/stage atualizados sem reload completo;
- inputs e botões nativos operantes;
- Stepper horizontal em 900 px ou mais e vertical abaixo de 900 px.

## Papéis e Mensagens

Valide separadamente responsabilidade funcional e atribuição executável. Requisitante/Solicitante/Atendente atua em START, T1 e T3. Gestor Imediato ou Superior/Administrativo atua em T2, T4 e T5. A raia BPMN não substitui a configuração de atribuição do Zeev.

Em solicitação de correção, o validador registra pendências nas Mensagens; T3 consulta o histórico, corrige os dados originais e retorna a T2. Não espere `pendenciasCadastro`.

## Publicação e rollback

Publique os artefatos gerados e então atualize a configuração do Zeev. O operador humano é responsável por commit, push, deploy e transições reais.

Rollback completo para o Zeev nativo:

1. remova o `<script>`;
2. remova o `<link>`;
3. salve/publique e recarregue sem cache;
4. confirme ausência de `#zeev-fieb-root` e `window.__ZEEV_FIEB__`.

Rollback visual histórico:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/releases/v0.2.1/zeev-fieb.css">
```

Remova o script v0.3.0 antes de usar esse CSS. A release v0.2.1 é preservada para recuperação, mas não implementa o contrato START/T1–T5 atual.
