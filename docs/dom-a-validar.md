# Registro do DOM Real — h-Zeev (v0.2.0)

Este documento registra a estrutura HTML real inspecionada no ambiente **h-Zeev** via DevTools durante a execução da tarefa *"Solicitar registro"* do aplicativo `Treinamento - Otávio Katibe`.

---

## 1. Estrutura Global do Formulário

### Wrapper Principal do Formulário (`#containerRequest`)
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <div id="containerRequest">
      <div id="ContainerForm">
          <div id="BoxFrmExecute">
              <table id="FrmExecute">...</table>
          </div>
      </div>
  </div>
  ```
- **Seletor candidato**: `#containerRequest`
- **Confiança**: ALTA

---

## 2. Agrupamentos / Seções

### Agrupamento "Dados pessoais" (`data-groupid="7724"`)
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <table data-groupid="7724">
      <tr class="group">
          <td colspan="2">
              <div id="group7724">Dados pessoais</div>
          </td>
      </tr>
      <tr codgroup="7724" class="execute-required">...</tr>
  </table>
  ```
- **Seletor candidato**: `#containerRequest [data-groupid="7724"]` e `#group7724`
- **Confiança**: ALTA

---

## 3. Campos por Identificador Lógico

### Field: `nomeCompleto`
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <textarea id="inpnomeCompleto" data-name="nomeCompleto" data-fieldformat="TEXTAREA" class="form-control form-control-textarea"></textarea>
  ```
- **Seletor candidato**: `#containerRequest [data-name="nomeCompleto"]`
- **Confiança**: ALTA

### Field: `cpfCliente`
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <td id="td1cpfCliente" class="col1">
      <input type="text" id="inpcpfCliente" data-name="cpfCliente" data-fieldformat="TEXT" class="form-control form-control-text">
      <span class="form-text text-muted small">Digite apenas os números ou selecione a máscara formatada.</span>
  </td>
  ```
- **Seletor candidato**: `#containerRequest [data-name="cpfCliente"]`
- **Confiança**: ALTA

### Field: `nacionalidade`
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <textarea id="inpnacionalidade" data-name="nacionalidade" class="form-control form-control-textarea"></textarea>
  ```
- **Seletor candidato**: `#containerRequest [data-name="nacionalidade"]`
- **Confiança**: ALTA

### Field: `estadoCivil`
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <td id="td1estadoCivil" class="col1">
      <div class="form-check">
          <input type="checkbox" id="chk_ec_1" data-name="estadoCivil" value="solteiro" class="form-check-input">
          <label for="chk_ec_1" class="form-check-label">Solteiro(a)</label>
      </div>
  </td>
  ```
- **Seletor candidato**: `#containerRequest input[type="checkbox"][data-name="estadoCivil"]`
- **Confiança**: ALTA

### Field: `profissao`
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <textarea id="inpprofissao" data-name="profissao" class="form-control form-control-textarea"></textarea>
  ```
- **Seletor candidato**: `#containerRequest [data-name="profissao"]`
- **Confiança**: ALTA

### Field: `tipoDocumento`
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <td id="td1tipoDocumento" class="col1">
      <div class="form-check">
          <input type="checkbox" id="chk_td_1" data-name="tipoDocumento" value="rg" class="form-check-input">
          <label for="chk_td_1" class="form-check-label">RG - Carteira de Identidade</label>
      </div>
  </td>
  ```
- **Seletor candidato**: `#containerRequest input[type="checkbox"][data-name="tipoDocumento"]`
- **Confiança**: ALTA

### Field: `numeroDocumento`
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <textarea id="inpnumeroDocumento" data-name="numeroDocumento" class="form-control form-control-textarea"></textarea>
  ```
- **Seletor candidato**: `#containerRequest [data-name="numeroDocumento"]`
- **Confiança**: ALTA

---

## 4. Elementos de Ação e Barra Inferior

### Botão Enviar Solicitação (`#BtnSend`) & Barra (`#controllers`)
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <div id="controllers">
      <div id="buttons">
          <button class="btn btn-success btn-mobile" id="BtnSend" type="button" onclick="send()" disabled="disabled">
              Enviar solicitação
          </button>
      </div>
  </div>
  ```
- **Seletor candidato**: `#containerRequest #BtnSend` e `#containerRequest #controllers`
- **Confiança**: ALTA
