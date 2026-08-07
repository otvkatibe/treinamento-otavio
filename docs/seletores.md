# Auditoria de Seletores CSS e FASE 0 — Descoberta do DOM do h-Zeev

Este documento registra a estratégia de seletores para a customização `zeev-fieb-theme`, classificando a confiança técnica de cada seletor e definindo o roteiro de inspeção DevTools na **Fase 0**.

---

## 1. FASE 0 — Descoberta do DOM no h-Zeev

Como não há acesso direto automatizado ao navegador autenticado do ambiente `h-Zeev`, os seletores aplicados aos campos e elementos do formulário são tratados **inicialmente como hipóteses técnicas com nível de confiança Média/Baixa**, até que trechos de HTML real sejam copiados via Inspect/DevTools.

### Fragmentos de HTML Solicitados para Inspeção no DevTools:
1. **Contêiner Principal do Formulário**: HTML da tag form ou div que envelopa a tela.
2. **Agrupamento "Dados pessoais"**: HTML da seção/fieldset do grupo.
3. **Campo de Texto Simples / Textarea**: HTML do wrapper e tags do campo `nomeCompleto`.
4. **Campo CPF**: HTML do input `cpfCliente` para identificar se utiliza `data-name`, `name`, `id` ou classes de máscara.
5. **Campo Select**: HTML da lista de seleção `estadoCivil` ou `tipoDocumento`.
6. **Rótulos (Labels) e Mensagens de Erro**: HTML da tag de label e mensagem de erro nativa.
7. **Barra de Botões de Ação**: HTML da div contendo os botões de envio/aprovação/correção.

---

## 2. Tabela de Seletores e Hipóteses (v0.1.0)

| Componente | Seletor Aplicado em CSS | Evidência no h-Zeev | Confiança | Risco |
| :--- | :--- | :--- | :--- | :--- |
| **Debug Indicator** | `.zeev-form-container::before, form[data-zeev="true"]::before` | Pendente teste visual h-Zeev | Média | Baixo |
| **Escopo Principal** | `.zeev-form-container, .zeev-form-wrapper, form[data-zeev]` | Pendente DevTools | Média | Baixo |
| **Agrupamento "Dados pessoais"** | `[data-group-name="Dados pessoais"], .zeev-group-dados-pessoais` | Pendente DevTools | Média | Médio |
| **Grid do Agrupamento** | `.zeev-group-grid` | CSS local / Pendente DevTools | Média | Baixo |
| **Campo Nome Completo** | `[data-name="nomeCompleto"] textarea, #nomeCompleto` | Hipótese (Identificador `nomeCompleto`) | Baixa | Médio |
| **Campo CPF** | `[data-name="cpfCliente"] input, #cpfCliente` | Hipótese (Identificador `cpfCliente`) | Baixa | Médio |
| **Campo Nacionalidade** | `[data-name="nacionalidade"] textarea, #nacionalidade` | Hipótese (Identificador `nacionalidade`) | Baixa | Médio |
| **Campo Estado Civil** | `[data-name="estadoCivil"] select, #estadoCivil` | Hipótese (Identificador `estadoCivil`) | Baixa | Médio |
| **Campo Profissão** | `[data-name="profissao"] textarea, #profissao` | Hipótese (Identificador `profissao`) | Baixa | Médio |
| **Campo Tipo Documento** | `[data-name="tipoDocumento"] select, #tipoDocumento` | Hipótese (Identificador `tipoDocumento`) | Baixa | Médio |
| **Campo Núm. Documento** | `[data-name="numeroDocumento"] textarea, #numeroDocumento` | Hipótese (Identificador `numeroDocumento`) | Baixa | Médio |
| **Inputs/Textareas/Selects** | `.zeev-form-container input, .zeev-form-container select` | Escopado no formulário | Média | Baixo |
| **Indicador Foco `:focus-visible`**| `.zeev-form-container input:focus-visible` | Padrão WCAG | Alta | Baixo |
| **Campos Read-only / Disabled**| `.zeev-form-container input:disabled, textarea[readonly]` | Padrão HTML5 | Alta | Baixo |
| **Mensagens de Erro Nativas** | `.zeev-form-container .has-error input, .error-message` | Padrão Zeev | Média | Baixo |
| **Barra de Botões** | `.zeev-form-container .zeev-actions-bar` | Mantidos nativos na v0.1 | Baixa | Baixo |

---

## 3. Diretrizes de Mitigação de Riscos

1. **Sem seletores com wildcards amplos**: Evitou-se o uso de `[id*="nomeCompleto"]` ou `[name*="nomeCompleto"]` para evitar correspondências acidentais em outros elementos do DOM.
2. **Escopo estrito**: Nenhuma regra estiliza `body`, `html`, `*`, `input`, `button` ou `label` de forma global sem contêiner do Zeev.
3. **Botões mantidos nativos**: Na versão v0.1, os botões não dependem de texto em português (`:contains(...)`) nem de seletores frágeis, permanecendo com estilização praticamente nativa até inspeção do DOM.
