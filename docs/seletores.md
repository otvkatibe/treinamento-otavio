# Contrato de DOM e seletores — v0.3.0

## Estrutura estável

| Finalidade | Seletor |
| --- | --- |
| Tela do processo | `#containerRequest` |
| Título detectável | `.page-title h1` |
| Barra e botões | `#controllers`, `#buttons`, `#BtnSend` |
| Comandos nativos | `#commands` |
| Contêiner do formulário | `#ContainerForm` |
| Caixa/formulário | `#BoxFrmExecute`, `#FrmExecute` |
| React Island | `#zeev-fieb-root`, imediatamente antes de `#ContainerForm` |

O CSS de campos usa o namespace `#containerRequest #FrmExecute`. O detector mantém `.page-title h1` disponível; a UI externa não remove inputs nem ações nativas.

## Campos por `data-name`

| Stage | Identificadores |
| --- | --- |
| START | `nomeCompleto`, `cpfCliente`, `nacionalidade`, `estadoCivil`, `profissao`, `tipoDocumento`, `numeroDocumento` |
| T1 | `telefone`, `logradouro`, `cepEndereco`, `numeroEndereco`, `documentoCadastroPdf` |
| T3 | campos originais corrigíveis; `correcaoRealizada` quando presente |
| T4/T5 | `numeroContrato`, `dataContrato`, `valorContrato`, `documentoContratoPdf` |

Forma preferencial: `[data-name="identificador"]`. `cepEndereco` e `numeroEndereco` são contratos persistentes. Não crie seletores para `pendenciasCadastro`: as pendências vivem nas Mensagens do Zeev.

Os radios `estadoCivil` e `tipoDocumento` usam `input[type="radio"][data-fieldformat="RADIO"]`; o hotfix neutraliza conflitos de `.form-check` do Bootstrap sem mudar valor, seleção ou comportamento.

## Títulos determinísticos

`Solicitar registro` → START; `T01 - Fazer o cadastro` → T1; `T02 - Validar o cadastro` → T2; `T03 - Corrigir o cadastro` → T3; `T04 - Fazer o contrato` → T4; `T05 - Validar o contrato` → T5. Apenas whitespace é normalizado. `T0` não pertence ao contrato e qualquer título externo deve resultar em fallback desconhecido.

## Elementos variáveis

Wrappers internos, viewers de arquivo, datepickers e modais podem variar por componente/versão do Zeev. Inspecione-os em homologação; não amplie o CSS para fora do namespace apenas para alcançar overlays globais.
