# Roteiro de Testes e Validação — v0.2.1 (h-Zeev)

Este documento estabelece a matriz de testes funcionais, visuais, de acessibilidade e de resiliência para o tema `zeev-fieb-theme` v0.2.1 no ambiente `h-Zeev`.

---

## 1. Cobertura do Evento de Início "Solicitar registro"

| Código da Etapa | Nome da Etapa | Foco da Validação Visual (v0.2.1) | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **START** | Solicitar registro (Evento de Início) | Formatação escopada sob `#containerRequest #FrmExecute` | Título `#group7724` em azul FIEB, rótulos `td.col0` em 14px 600, barra `#controllers` com botão `#BtnSend` estilizado |
| **T01** | Fazer o cadastro | Preenchimento dos 7 campos de dados | Textareas compactos com altura ajustada, input CPF com auxílio `.form-text`, checkboxes em linha |
| **T02** | Validar o cadastro | Campos em modo somente leitura (Read-only / Disabled) | Fundo suave acinzentado `#f1f5f9`, cursor `not-allowed`, sem hover |

---

## 2. Matriz de Testes por Componente Real

### A. Campos de Texto e Textareas
- [ ] **`nomeCompleto` (Textarea)**: Caixa com `min-height: 2.75rem`, borda neutra e foco azul.
- [ ] **`cpfCliente` (Input Text)**: Borda neutra, foco visível, mensagem auxiliar `#td1cpfCliente .form-text` visível abaixo do input.
- [ ] **`nacionalidade` (Textarea)**: Formatado via `:is(...)` e `@apply`.
- [ ] **`profissao` (Textarea)**: Textarea limpo sem estouro da tabela.
- [ ] **`numeroDocumento` (Textarea)**: Estilização consistente com o tema.

### B. Checkboxes Reais (`estadoCivil` e `tipoDocumento`)
- [ ] **`estadoCivil` (Checkboxes)**: Renderizados com flexbox (`.form-check`), destaque institucional FIEB ao marcar.
- [ ] **`tipoDocumento` (Checkboxes)**: Opções CIN, RG, CNH, Passaporte em linha com rótulos `.form-check-label`.

### C. Barra Inferior e Botão de Envio
- [ ] **Barra `#controllers`**: Posicionamento `fixed bottom: 0; z-index: 93;` preservado, fundo branco com borda e sombra discreta.
- [ ] **Botão `#BtnSend`**: Azul FIEB (`#004085`), texto em branco, efeito hover ativado apenas quando habilitado.
- [ ] **Estado `#BtnSend:disabled`**: Cor acinzentada, sem efeito de hover.

---

## 3. Prevenção de Vazamento Visual e Resiliência

- [ ] **Isolamento em Outros Contêineres Zeev**:
  - Garantir que `#inpDsMessage`, `#inpDsReasonInputReason`, `#btnAddMessage` e `#btnAddFile` em `#containerMessages` / `#containerFiles` não recebam regras globais de formulário.
- [ ] **Fallback de Rede (Bloqueio do CSS)**:
  - Se a URL do GitHub Pages for bloqueada, o Zeev exibe o layout nativo sem impedir o envio do formulário.
