# Roteiro de Testes e Validação — v0.2.0 (h-Zeev)

Este documento estabelece a matriz de testes funcionais, visuais, de acessibilidade e de resiliência para o tema `zeev-fieb-theme` v0.2.0 no ambiente `h-Zeev`.

---

## 1. Cobertura da Tarefa "Solicitar registro"

| ID Tarefa | Nome da Tarefa | Foco da Validação Visual (v0.2.0) | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **INICIO** | Solicitar registro | Abertura do formulário escopado sob `#containerRequest` | Título `#group7724` em azul FIEB, campos formatados, barra `#controllers` com botão `#BtnSend` estilizado |
| **T01** | Fazer o cadastro | Preenchimento dos 7 campos de dados | Textareas com altura moderada, input CPF com mensagem auxiliar, checkboxes de estado civil e tipo de documento |
| **T02** | Validar o cadastro | Campos em modo somente leitura (Read-only / Disabled) | Fundo suave acinzentado `#f1f5f9`, cursor `not-allowed`, sem hover ou foco |

---

## 2. Matriz de Testes por Componente Real

### A. Campos de Texto e Textareas
- [ ] **`nomeCompleto` (Textarea)**: Caixa com `min-height: 2.75rem`, borda neutra e foco azul.
- [ ] **`cpfCliente` (Input Text)**: Borda neutra, foco visível, mensagem auxiliar `.form-text` visível abaixo do input.
- [ ] **`nacionalidade` (Textarea)**: Formatado via `:is(...)` e `@apply`.
- [ ] **`profissao` (Textarea)**: Textarea limpo sem estouro da tabela.
- [ ] **`numeroDocumento` (Textarea)**: Estilização consistente com o tema.

### B. Checkboxes Reais (`estadoCivil` e `tipoDocumento`)
- [ ] **`estadoCivil` (Checkboxes)**: Renderizados em linha/bloco com flexbox (`.form-check`), cor de destaque institucional FIEB ao marcar.
- [ ] **`tipoDocumento` (Checkboxes)**: Rótulos `.form-check-label` com contraste legível.

### C. Barra Inferior e Botão de Envio
- [ ] **Barra `#controllers`**: Posicionamento `fixed bottom: 0` preservado, fundo branco com borda e sombra discreta.
- [ ] **Botão `#BtnSend`**: Azul FIEB (`#004085`), texto em branco, efeito hover ativado apenas quando habilitado.
- [ ] **Estado `#BtnSend:disabled`**: Cor acinzentada, sem efeito de hover, perfeitamente distinguível de ativo.

---

## 3. Testes de Acessibilidade e Resiliência

- [ ] **Navegação via Teclado (`Tab`)**: Foco `:focus-visible` ativado sequencialmente em todos os elementos funcionais.
- [ ] **Contraste de Cor (WCAG AA)**: Texto escuro sobre fundo claro mantendo razão superior a 4.5:1.
- [ ] **Fallback de Rede (Bloqueio do CSS)**: Se a URL do GitHub Pages for bloqueada, o Zeev exibe o layout nativo sem impedir o envio do formulário.
