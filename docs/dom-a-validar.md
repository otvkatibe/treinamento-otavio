# Registro do DOM Real — h-Zeev (v0.2.1)

Este documento registra a estrutura HTML real inspecionada no ambiente **h-Zeev** via DevTools durante a execução da tarefa *"Solicitar registro"* do aplicativo `Treinamento - Otávio Katibe`.

> **FASE 0 DE DESCOBERTA**: **CONCLUÍDA PARA A TAREFA "SOLICITAR REGISTRO"**

---

## 1. Estrutura Global do Formulário

### Wrapper Principal e Tabela (`#containerRequest` -> `#FrmExecute`)
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <div id="containerRequest">
      <div class="container-task">
          <div id="ContainerForm">
              <div id="BoxFrmExecute">
                  <table id="FrmExecute">...</table>
              </div>
          </div>
      </div>
  </div>
  ```
- **Seletor candidato**: `#containerRequest #FrmExecute`
- **Confiança**: ALTA

---

## 2. Agrupamentos / Seções

### Agrupamento "Dados pessoais" (`data-groupid="7724"`)
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <table class="form" id="Dados pessoais" data-groupid="7724">
      <tr class="group">
          <td colspan="2" class="group">
              <b id="group7724" data-key="7724">Dados pessoais</b>
          </td>
      </tr>
      <tr codgroup="7724" class="execute-required">...</tr>
  </table>
  ```
- **Seletor candidato**: `#containerRequest #FrmExecute [data-groupid="7724"]` e `#group7724`
- **Confiança**: ALTA

---

## 3. Campos por Identificador Lógico (Todos Confirmados com Confiança Alta)

### Field: `nomeCompleto`
- **HTML observado**:
  ```html
  <textarea id="inpnomeCompleto" data-name="nomeCompleto" data-fieldformat="TEXTAREA" class="form-control form-control-textarea"></textarea>
  ```
- **Seletor**: `#containerRequest #FrmExecute [data-name="nomeCompleto"]`

### Field: `cpfCliente`
- **HTML observado**:
  ```html
  <td id="td1cpfCliente" class="col1">
      <input type="text" id="inpcpfCliente" data-name="cpfCliente" data-fieldformat="TEXT" class="form-control form-control-text">
      <span class="form-text text-muted small">ex: máscara 000.000.000-00</span>
  </td>
  ```
- **Seletor**: `#containerRequest #FrmExecute [data-name="cpfCliente"]`

### Field: `nacionalidade`
- **HTML observado**:
  ```html
  <textarea id="inpnacionalidade" data-name="nacionalidade" class="form-control form-control-textarea"></textarea>
  ```
- **Seletor**: `#containerRequest #FrmExecute [data-name="nacionalidade"]`

### Field: `estadoCivil`
- **HTML observado**:
  ```html
  <td id="td1estadoCivil" class="col1">
      <div class="form-check">
          <input type="checkbox" id="chk_ec_1" data-name="estadoCivil" value="solteiro" class="form-check-input">
          <label for="chk_ec_1" class="form-check-label">Solteiro(a)</label>
      </div>
  </td>
  ```
- **Seletor**: `#containerRequest #td1estadoCivil input[type="checkbox"][data-name="estadoCivil"]`

### Field: `profissao`
- **HTML observado**:
  ```html
  <textarea id="inpprofissao" data-name="profissao" class="form-control form-control-textarea"></textarea>
  ```
- **Seletor**: `#containerRequest #FrmExecute [data-name="profissao"]`

### Field: `tipoDocumento`
- **HTML observado**:
  ```html
  <td id="td1tipoDocumento" class="col1">
      <div class="form-check">
          <input type="checkbox" id="chk_td_1" data-name="tipoDocumento" value="cin" class="form-check-input">
          <label for="chk_td_1" class="form-check-label">CIN</label>
      </div>
      <div class="form-check">
          <input type="checkbox" id="chk_td_2" data-name="tipoDocumento" value="rg" class="form-check-input">
          <label for="chk_td_2" class="form-check-label">RG</label>
      </div>
  </td>
  ```
- **Seletor**: `#containerRequest #td1tipoDocumento input[type="checkbox"][data-name="tipoDocumento"]`

### Field: `numeroDocumento`
- **HTML observado**:
  ```html
  <textarea id="inpnumeroDocumento" data-name="numeroDocumento" class="form-control form-control-textarea"></textarea>
  ```
- **Seletor**: `#containerRequest #FrmExecute [data-name="numeroDocumento"]`

---

## 4. Elementos de Ação e Barra Inferior

### Botão Enviar Solicitação (`#BtnSend`) & Barra (`#controllers`)
- **HTML observado**:
  ```html
  <div id="controllers" style="position: fixed; bottom: 0; z-index: 93;">
      <div id="buttons">
          <button class="btn btn-success btn-mobile" id="BtnSend" type="button" onclick="send()" disabled="disabled">
              Enviar solicitação
          </button>
      </div>
  </div>
  ```
- **Seletor**: `#containerRequest #BtnSend` e `#containerRequest #controllers`
