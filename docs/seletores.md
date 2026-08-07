# Contrato Oficial de Seletores CSS — v0.2.1 (Fase 0 Concluída para "Solicitar registro")

Este documento registra a matriz de seletores da customização `zeev-fieb-theme`, baseada **EXCLUSIVAMENTE no DOM REAL do ambiente h-Zeev** para a tarefa *"Solicitar registro"*.

> **STATUS DA FASE 0**: **CONCLUÍDA PARA A TAREFA "SOLICITAR REGISTRO"**

---

## 1. Contrato de Seletores & Namespace Principal

1. **Namespace Principal Escopado**:
   - `#containerRequest` (**CONFIRMADO**)
   - Toda regra CSS de produção é obrigatoriamente prefixada por `#containerRequest` para evitar vazamento visual para o restante da plataforma Zeev.

2. **Formulário Interno e Células**:
   - `#containerRequest #FrmExecute` (**CONFIRMADO**)
   - Os seletores de campos funcionais utilizam a sintaxe `[data-name="..."]` diretamente sobre os elementos de entrada escopados em `#FrmExecute`.

3. **Remoção de Wrappers Fictícios do Mock**:
   - `.zeev-form-container`, `.zeev-form-wrapper`, `.zeev-app-wrapper`, `.zeev-field`, `.zeev-group-grid`, `.zeev-actions-bar`, `form[data-zeev="true"]` foram **COMPLETAMENTE REMOVIDOS DE PRODUÇÃO**.

---

## 2. Tabela de Seletores Confirmados (v0.2.1)

| Componente | Identificador / ID Zeev | Seletor Aplicado em CSS | Status | Confiança | Evidência no h-Zeev Real |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Wrapper Principal** | `containerRequest` | `#containerRequest` | **CONFIRMADO** | **ALTA** | Contêiner raiz da tela de tarefa do h-Zeev. |
| **Contêiner do Formulário**| `ContainerForm` | `#containerRequest #ContainerForm` | **CONFIRMADO** | **ALTA** | `<div>` principal do formulário. |
| **Caixa do Formulário** | `BoxFrmExecute` | `#containerRequest #BoxFrmExecute` | **CONFIRMADO** | **ALTA** | `<div>` envolvedora da tabela de execução. |
| **Tabela de Execução** | `FrmExecute` | `#containerRequest #FrmExecute` | **CONFIRMADO** | **ALTA** | `<table id="FrmExecute">` raiz da tarefa. |
| **Agrupamento Dados Pessoais**| `data-groupid 7724` | `#containerRequest #FrmExecute [data-groupid="7724"]` | **CONFIRMADO** | **ALTA** | `<table class="form" id="Dados pessoais" data-groupid="7724">`. |
| **Título do Agrupamento** | `group7724` | `#containerRequest #group7724` | **CONFIRMADO** | **ALTA** | `<b id="group7724" data-key="7724">Dados pessoais</b>`. |
| **Linhas da Tabela** | `codgroup 7724` | `#containerRequest #FrmExecute tr[codgroup="7724"]` | **CONFIRMADO** | **ALTA** | `<tr>` das linhas de campo. |
| **Células de Rótulo (Labels)** | `td.col0` | `#containerRequest #FrmExecute tr[codgroup="7724"] > td.col0` | **CONFIRMADO** | **ALTA** | `<td id="td0..." class="col0">` com título 14px 600. |
| **Células de Entrada** | `td.col1` | `#containerRequest #FrmExecute tr[codgroup="7724"] > td.col1` | **CONFIRMADO** | **ALTA** | `<td id="td1..." class="col1">` contendo os campos. |
| **Nome Completo** | `nomeCompleto` | `[data-name="nomeCompleto"]` | **CONFIRMADO** | **ALTA** | `<textarea>` com `data-fieldformat="TEXTAREA"`. |
| **CPF** | `cpfCliente` | `[data-name="cpfCliente"]` | **CONFIRMADO** | **ALTA** | `<input type="text">` com `data-fieldformat="TEXT"`. |
| **Mensagem Auxiliar CPF** | `td1cpfCliente` | `#td1cpfCliente .form-text` | **CONFIRMADO** | **ALTA** | `<span class="form-text text-muted small">`. |
| **Nacionalidade** | `nacionalidade` | `[data-name="nacionalidade"]` | **CONFIRMADO** | **ALTA** | `<textarea>`. |
| **Estado Civil** | `estadoCivil` | `input[type="checkbox"][data-name="estadoCivil"]` | **CONFIRMADO** | **ALTA** | Checkboxes em `.form-check`. |
| **Profissão** | `profissao` | `[data-name="profissao"]` | **CONFIRMADO** | **ALTA** | `<textarea>`. |
| **Tipo de Documento** | `tipoDocumento` | `input[type="checkbox"][data-name="tipoDocumento"]` | **CONFIRMADO** | **ALTA** | Checkboxes (CIN, RG, CNH, Passaporte) em `.form-check`. |
| **Número do Documento** | `numeroDocumento` | `[data-name="numeroDocumento"]` | **CONFIRMADO** | **ALTA** | `<textarea>`. |
| **Barra de Ações Inferior** | `controllers` | `#containerRequest #controllers` | **CONFIRMADO** | **ALTA** | `<div id="controllers">` (`position: fixed; bottom: 0; z-index: 93;`). |
| **Contêiner de Botões** | `buttons` | `#containerRequest #buttons` | **CONFIRMADO** | **ALTA** | `<div id="buttons">`. |
| **Botão Enviar Solicitação** | `BtnSend` | `#containerRequest #BtnSend` | **CONFIRMADO** | **ALTA** | `<button id="BtnSend" onclick="send()">`. |
