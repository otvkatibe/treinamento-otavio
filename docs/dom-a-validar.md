# Descoberta do DOM — h-Zeev

Este documento serve para registrar a estrutura HTML real inspecionada no ambiente **h-Zeev** via DevTools durante o primeiro teste de homologação do aplicativo `Treinamento - Otávio Katibe`.

---

## 1. Estrutura Global do Formulário

### Wrapper Principal do Formulário
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

### Wrapper de Tarefa (Shell / Contêiner da Atividade)
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

---

## 2. Agrupamentos / Seções

### Agrupamento "Dados pessoais"
- **Status**: HIPÓTESE (Pendente confirmação completa do grupo)
- **HTML observado**:
  ```html
  <tr codgroup="7724" class="execute-required">
      <!-- Células do grupo/campo -->
  </tr>
  ```
- **Seletor candidato**: `tr[codgroup="7724"]`
- **Confiança**: MÉDIA (Hipótese baseada no atributo codgroup)

---

## 3. Campos por Identificador Lógico

### Field: `nomeCompleto`
- **Identificador Zeev**: `nomeCompleto`
- **Status**: CONFIRMADO
- **HTML observado**:
  ```html
  <tr codgroup="7724" class="execute-required">
      <td valign="top" id="td0nomeCompleto" class="col0">
          Nome completo
      </td>

      <td
          valign="top"
          id="td1nomeCompleto"
          class="col1"
          fieldkey="56955">

          <textarea
              rows="5"
              name="inp56955"
              id="inpnomeCompleto"
              data-name="nomeCompleto"
              data-label="Nome completo"
              data-required="true"
              data-fieldformat="TEXTAREA"
              data-formula=""
              label="Nome completo"
              xname="inpnomeCompleto"
              xtype="TEXTAREA"
              required="S"
              minlength="0"
              maxlength="3072"
              autocomplete="off"
              class="form-control form-control-textarea">
          </textarea>

      </td>
  </tr>
  ```
- **Seletor candidato**: `[data-name="nomeCompleto"]` (secundário: `#inpnomeCompleto`)
- **Confiança**: ALTA (Atributo data-name presente no DOM real do h-Zeev)

### Field: `cpfCliente`
- **Identificador Zeev**: `cpfCliente`
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

### Field: `nacionalidade`
- **Identificador Zeev**: `nacionalidade`
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

### Field: `estadoCivil`
- **Identificador Zeev**: `estadoCivil`
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

### Field: `profissao`
- **Identificador Zeev**: `profissao`
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

### Field: `tipoDocumento`
- **Identificador Zeev**: `tipoDocumento`
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

### Field: `numeroDocumento`
- **Identificador Zeev**: `numeroDocumento`
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

---

## 4. Elementos de Ação e Feedback

### Botão Primário / Ações Principais
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

### Botões da Atividade (Aprovar / Reprovar / Solicitar correção)
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)

### Mensagem de Validação / Erro
- **Status**: PENDENTE
- **HTML observado**:
  ```html
  <!-- Cole aqui o snippet inspecionado no DevTools -->
  ```
- **Seletor candidato**:
- **Confiança**: BAIXA (Hipótese)
