# Zeev FIEB v0.3.0

Customização React/TypeScript/Tailwind/MUI do processo `Treinamento - Otávio Katibe` no h-Zeev. O Zeev permanece como fonte de verdade de workflow, formulários, persistência, atribuição, histórico, Mensagens, SLA e ações nativas. A customização acrescenta contexto visual, detecção de etapa, diagnostics e styling escopado.

## Contrato do processo

| Código | Título Zeev | Natureza | Responsabilidade funcional |
| --- | --- | --- | --- |
| `START` | Solicitar registro | Evento inicial | Requisitante / Solicitante / Atendente |
| `T1` | T01 - Fazer o cadastro | Tarefa humana | Requisitante / Atendente |
| `T2` | T02 - Validar o cadastro | Tarefa humana decisória | Gestor Imediato ou Superior / Administrativo |
| `T3` | T03 - Corrigir o cadastro | Tarefa humana condicional | Requisitante / Atendente |
| `T4` | T04 - Fazer o contrato | Tarefa humana | Gestor Imediato ou Superior / Administrativo |
| `T5` | T05 - Validar o contrato | Tarefa humana decisória final | Gestor Imediato ou Superior / Administrativo |

`START` é semanticamente distinto de tarefa humana. `T0` não pertence ao contrato vigente. T3 só integra a rota quando T2 solicita correção; no retorno T3 → T2, a interface indica revalidação. Em T5, as decisões reais são `Aprovar o contrato` e `Reprovar o contrato`.

Pendências de cadastro são registradas nas Mensagens nativas do Zeev. Não há campo estruturado `pendenciasCadastro` no contrato atual.

## Campos por etapa

- START: `nomeCompleto`, `cpfCliente`, `nacionalidade`, `estadoCivil`, `profissao`, `tipoDocumento`, `numeroDocumento`.
- T1: `telefone`, `logradouro`, `cepEndereco`, `numeroEndereco`, `documentoCadastroPdf`, além dos dados de origem aplicáveis.
- T2: dados de cadastro para consulta e ações nativas `Aprovar`, `Reprovar` e `Solicitar correção`.
- T3: dados originais corrigíveis e `correcaoRealizada` quando entregue pelo DOM.
- T4: `numeroContrato`, `dataContrato`, `valorContrato`, `documentoContratoPdf`.
- T5: dados contratuais e ações nativas `Aprovar o contrato` e `Reprovar o contrato`.

## Arquitetura e contrato DOM

O lifecycle SPA observa mutações e navegação, mantém um singleton em `window.__ZEEV_FIEB__` e monta exatamente um `#zeev-fieb-root` antes de `#ContainerForm`. A React Island nunca substitui inputs, botões ou decisões nativas.

Seletores estruturais estáveis: `#containerRequest`, `.page-title h1`, `#controllers`, `#buttons`, `#BtnSend`, `#commands`, `#ContainerForm`, `#BoxFrmExecute` e `#FrmExecute`. Campos são localizados preferencialmente por `[data-name="<identificador>"]`, sempre sob o namespace `#containerRequest #FrmExecute` no CSS.

O Stepper tem seis estágios; é horizontal a partir de 900 px e vertical abaixo de 900 px. Telas fora do contrato mantêm fallback neutro (`known: false`, `code: null`) e preservam o título nativo.

## Desenvolvimento e validação

Dependências são gerenciadas exclusivamente pelo operador humano. Com o ambiente já preparado:

```bash
npm run typecheck
npm run test
npm run build
npm audit
```

O build produz os artefatos autoritativos `dist/zeev-fieb.js` e `dist/zeev-fieb.css`. Não publique se typecheck, testes ou build falharem.

## Publicação

Use URLs estáveis, sem query string conflitante:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css">
<script defer src="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.js"></script>
```

Depois do deploy, faça reload com cache desabilitado e execute `window.__ZEEV_FIEB__?.diagnostics()` em cada stage. Consulte [homologação v0.3.0](docs/homologacao-v0.3.0.md) para a matriz completa.

## Rollback

1. Remova o `<script>` v0.3.0.
2. Para voltar ao Zeev nativo, remova também o `<link>`.
3. Para restaurar somente o visual estável anterior, use o artefato histórico `releases/v0.2.1/zeev-fieb.css`.
4. Salve/publique a configuração e confirme que não existe `#zeev-fieb-root` nem `window.__ZEEV_FIEB__`.

O diretório `releases/v0.2.1` é histórico e não descreve o contrato vigente.
