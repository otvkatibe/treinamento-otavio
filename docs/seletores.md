# Contrato Oficial de Seletores CSS — v0.2.0 (h-Zeev Confirmado)

Este documento registra a matriz de seletores da customização `zeev-fieb-theme`, baseada **EXCLUSIVAMENTE no DOM REAL do ambiente h-Zeev** inspecionado durante a execução da tarefa *"Solicitar registro"*.

---

## 1. Contrato de Seletores & Hierarquia de Preferência

1. **Wrapper Principal Escopado**:
   - `#containerRequest` (**CONFIRMADO**)
   - Toda regra CSS é obrigatoriamente prefixada por `#containerRequest` para isolamento cirúrgico.

2. **Atributo Estável de Campos**:
   - `[data-name="..."]` (**CONFIRMADO**)
   - Utilizado como seletor primário para todos os campos do formulário.

3. **Descarte de Wrappers Fictícios do Mock**:
   - `.zeev-form-container`, `.zeev-form-wrapper`, `.zeev-app-wrapper`, `form[data-zeev="true"]` foram **REMOVIDOS DE PRODUÇÃO**.

---

## 2. Tabela de Seletores Confirmados (v0.2.0)

| Componente | Identificador / ID Zeev | Seletor Aplicado em CSS | Status | Confiança | Evidência no h-Zeev Real |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Wrapper Principal** | `containerRequest` | `#containerRequest` | **CONFIRMADO** | **ALTA** | Contêiner raiz da tela de tarefa do h-Zeev. |
| **Agrupamento Dados Pessoais**| `data-groupid 7724` | `#containerRequest [data-groupid="7724"]` | **CONFIRMADO** | **ALTA** | Tabela que envelopa a seção "Dados pessoais". |
| **Título do Agrupamento** | `group7724` | `#containerRequest #group7724` | **CONFIRMADO** | **ALTA** | `<div>` com o texto "Dados pessoais". |
| **Linhas da Tabela** | `codgroup 7724` | `#containerRequest tr[codgroup="7724"]` | **CONFIRMADO** | **ALTA** | `<tr>` das linhas de campo. |
| **Células de Rótulo (Labels)** | `td.col0` | `#containerRequest #FrmExecute td.col0` | **CONFIRMADO** | **ALTA** | `<td>` contendo os títulos dos campos. |
| **Células de Entrada** | `td.col1` | `#containerRequest #FrmExecute td.col1` | **CONFIRMADO** | **ALTA** | `<td>` contendo os controles dos campos. |
| **Nome Completo** | `nomeCompleto` | `[data-name="nomeCompleto"]` | **CONFIRMADO** | **ALTA** | `<textarea>` com `data-fieldformat="TEXTAREA"`. |
| **CPF** | `cpfCliente` | `[data-name="cpfCliente"]` | **CONFIRMADO** | **ALTA** | `<input type="text">` com `data-fieldformat="TEXT"`. |
| **Mensagem Auxiliar CPF** | `td1cpfCliente` | `#td1cpfCliente .form-text` | **CONFIRMADO** | **ALTA** | `<span class="form-text text-muted small">`. |
| **Nacionalidade** | `nacionalidade` | `[data-name="nacionalidade"]` | **CONFIRMADO** | **ALTA** | `<textarea>`. |
| **Estado Civil** | `estadoCivil` | `input[type="checkbox"][data-name="estadoCivil"]` | **CONFIRMADO** | **ALTA** | Renderizado como `input[type="checkbox"]` em `.form-check`. |
| **Profissão** | `profissao` | `[data-name="profissao"]` | **CONFIRMADO** | **ALTA** | `<textarea>`. |
| **Tipo de Documento** | `tipoDocumento` | `input[type="checkbox"][data-name="tipoDocumento"]` | **CONFIRMADO** | **ALTA** | Renderizado como `input[type="checkbox"]` em `.form-check`. |
| **Número do Documento** | `numeroDocumento` | `[data-name="numeroDocumento"]` | **CONFIRMADO** | **ALTA** | `<textarea>`. |
| **Barra de Ações Inferior** | `controllers` | `#containerRequest #controllers` | **CONFIRMADO** | **ALTA** | `<div id="controllers">` (Barra `position: fixed; bottom: 0`). |
| **Contêiner de Botões** | `buttons` | `#containerRequest #buttons` | **CONFIRMADO** | **ALTA** | `<div id="buttons">`. |
| **Botão Enviar Solicitação** | `BtnSend` | `#containerRequest #BtnSend` | **CONFIRMADO** | **ALTA** | `<button id="BtnSend" onclick="send()">`. |
