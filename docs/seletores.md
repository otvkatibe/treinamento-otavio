# Auditoria de Seletores CSS — Descoberta Incremental do DOM (h-Zeev)

Este documento registra a estratégia de seletores para a customização `zeev-fieb-theme`, classificando o status e a confiança técnica de cada seletor à medida que fragmentos do **DOM real do h-Zeev** são confirmados via DevTools.

---

## 1. Contrato de Seletores & Hierarquia de Preferência

Para garantir robustez e evitar que o tema quebre em atualizações da plataforma Zeev, adotamos a seguinte prioridade de contrato:

1. **`data-name`** (Preferência 1 — Estável e independente de compilações internas)
2. **Atributos/IDs derivados do identificador** (ex: `#inpnomeCompleto`, `#td0nomeCompleto`)
3. **`fieldkey` ou `name="inpXXXXX"`** (Apenas quando houver justificativa técnica explícita, nunca como seletor principal)

> 🛑 **Importante**: Não utilizamos seletores de wrappers fictícios do mock (`.zeev-form-container`, `.zeev-form-wrapper`, `form[data-zeev="true"]`) nem seletores frágeis por substring (`[id*="..."]`).

---

## 2. Tabela de Seletores e Status (v0.1.0 Descoberta Incremental)

| Componente | Identificador Zeev | Seletor Aplicado em CSS | Status | Confiança | Evidência no h-Zeev |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nome completo** | `nomeCompleto` | `[data-name="nomeCompleto"]` | **CONFIRMADO** | **ALTA** | Atributo `data-name="nomeCompleto"` presente no `<textarea>` do DOM real. |
| **Célula de Rótulo (Nome)** | `td0nomeCompleto` | `#td0nomeCompleto` | **CONFIRMADO** | **ALTA** | ID `#td0nomeCompleto` presente na `<td>` do rótulo no DOM real. |
| **Agrupamento "Dados pessoais"**| `codgroup 7724` | `tr[codgroup="7724"]` | HIPÓTESE | MÉDIA | Atributo `codgroup="7724"` observado na `<tr>` do campo `nomeCompleto`. |
| **Campo CPF** | `cpfCliente` | `[data-name="cpfCliente"]` | PENDENTE | MÉDIA | Aguardando snippet DevTools do campo CPF. |
| **Campo Nacionalidade** | `nacionalidade` | `[data-name="nacionalidade"]` | PENDENTE | MÉDIA | Aguardando snippet DevTools. |
| **Campo Estado Civil** | `estadoCivil` | `[data-name="estadoCivil"]` | PENDENTE | MÉDIA | Aguardando snippet DevTools. |
| **Campo Profissão** | `profissao` | `[data-name="profissao"]` | PENDENTE | MÉDIA | Aguardando snippet DevTools. |
| **Campo Tipo Documento** | `tipoDocumento` | `[data-name="tipoDocumento"]` | PENDENTE | MÉDIA | Aguardando snippet DevTools. |
| **Campo Núm. Documento** | `numeroDocumento` | `[data-name="numeroDocumento"]` | PENDENTE | MÉDIA | Aguardando snippet DevTools. |
| **Estados Disabled / Readonly** | — | `[data-name]:disabled` | CONFIRMADO | ALTA | Padrão HTML5 em inputs/textareas Zeev. |
| **Indicador Foco `:focus-visible`**| — | `[data-name]:focus-visible` | CONFIRMADO | ALTA | Padrão WCAG aplicado aos seletores `data-name`. |

---

## 3. Histórico de Descoberta do DOM Real

- **2026-08-07**:
  - Infraestrutura de injeção externa `<link>` validada via GitHub Pages.
  - Confirmado que o Zeev expõe `data-name="nomeCompleto"` no elemento `<textarea id="inpnomeCompleto">`.
  - Descartados os wrappers fictícios do mock (`.zeev-form-container`, `.zeev-form-wrapper`, `.zeev-app-wrapper`).
