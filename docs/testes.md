# Roteiro de Testes e Validação do Tema Visual FIEB no Zeev

Este documento estabelece a matriz de testes funcionais, visuais, de acessibilidade e de resiliência para o tema `zeev-fieb-theme` no ambiente `h-Zeev`.

---

## 1. Cobertura por Tarefa Humana do Processo

| ID Tarefa | Nome da Tarefa | Foco da Validação Visual | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **INICIO** | Solicitar registro | Abertura da solicitação, campos limpos | Card `Dados pessoais` visível, botão `Concluir` com estilo primário FIEB |
| **T01** | Fazer o cadastro | Preenchimento dos 7 campos de dados | Inputs e textareas editáveis, foco visível de 2px azul |
| **T02** | Validar o cadastro | Campos em modo somente leitura (Read-only) | Campos com fundo suave acinzentado, botões `Aprovar` (verde) e `Corrigir` (amarelo) |
| **T03** | Corrigir o cadastro | Edição de campos com apontamento de correção | Campos reeditáveis, botão de ajuste em destaque |
| **T04** | Fazer o contrato | Formulário de confirmação de contrato | Manutenção da identidade sóbria corporativa e legibilidade |
| **T05** | Validar o contrato | Validação final antes do encerramento | Botão `Aprovar` (verde) e `Reprovar` (vermelho) destacados |

---

## 2. Matriz de Testes de Campos e Estados

### A. Tipos de Campos Conhecidos
- [ ] **`nomeCompleto` (Área de texto)**: Verificar se a caixa de texto possui altura suficiente para 2 linhas e redimensionamento suave.
- [ ] **`cpfCliente` (CPF)**: Verificar alinhamento, fonte monoespaçada e leitura clara de pontuações (`.`, `-`).
- [ ] **`nacionalidade` (Área de texto)**: Verificar padding e legibilidade do placeholder.
- [ ] **`estadoCivil` (Lista de seleção)**: Verificar renderização da seta de seleção e contraste das opções selecionadas.
- [ ] **`profissao` (Área de texto)**: Verificar comportamento ao preencher textos longos.
- [ ] **`tipoDocumento` (Lista de seleção)**: Verificar clique e seleção com mouse/teclado.
- [ ] **`numeroDocumento` (Área de texto)**: Verificar alinhamento e legibilidade do texto.

### B. Estados de Entrada e Validação
- [ ] **Campo Vazio com Placeholder**: Placeholder em tom cinza suavizado (`var(--fieb-text-muted)`).
- [ ] **Campo Preenchido**: Texto com alto contraste em tom escuro (`var(--fieb-text-main)`).
- [ ] **Estado Desabilitado / Read-Only**: Fundo `#f1f5f9`, cursor `not-allowed`, sem hover ou alteração ao clicar.
- [ ] **Validação Nativa de Erro**: Bordas em tom vermelho sóbrio (`var(--fieb-danger)`), mensagem de erro nativa do Zeev perfeitamente visível abaixo do campo.

---

## 3. Testes de Acessibilidade e Navegação

- [ ] **Foco via Mouse**: O anel de foco azul de 2px deve ser ativado ao clicar em qualquer input/select/button.
- [ ] **Navegação via Teclado (`Tab` / `Shift+Tab`)**:
  - Pressionar `Tab` deve percorrer sequencialmente todos os campos na ordem lógica.
  - O indicador `:focus-visible` deve ser claramente legível em cada elemento.
- [ ] **Contraste de Cor (WCAG AA)**: Texto escuro sobre fundo branco/acinzentado atinge razão de contraste superior a 4.5:1.
- [ ] **Zoom do Navegador**:
  - Testar com zoom de 100%, 125%, 150% e 200%.
  - O layout não deve quebrar nem sobrepor rótulos.
- [ ] **Movimento Reduzido**: Em sistemas configurados para `prefers-reduced-motion: reduce`, transições de cor devem ser instantâneas.

---

## 4. Testes de Responsividade e Dispositivos

- [ ] **Desktop Grande (1920x1080)**: O formulário é centralizado com margens adequadas (máx 800px-1024px).
- [ ] **Notebook (1366x768)**: O agrupamento `Dados pessoais` exibe 2 colunas de campos de forma limpa.
- [ ] **Tablet / Tela Média (768px - 1024px)**: Ajuste suave de colunas sem transbordo horizontal.
- [ ] **Mobile / Tela Pequena (<640px)**:
  - O grid se reduz para 1 coluna por campo.
  - Os botões de ação ocupam a largura total para facilitar o toque em telas sensíveis.

---

## 5. Resiliência e Fallback de Rede

- [ ] **Reload Normal (`F5`)**: O tema é carregado sem flashes visuais (FOUC).
- [ ] **Hard Reload (`Ctrl+F5` / `Ctrl+Shift+R`)**: O tema é recarregado e a versão `?v=0.1.0` busca o CSS atualizado.
- [ ] **Simulação de Falha de Rede (CSS Indisponível)**:
  - Bloquear a requisição do CSS externo nas Ferramentas do Desenvolvedor (Network -> Block Request URL).
  - **Resultado Esperado**: O formulário do Zeev volta ao visual nativo padrão. **O processo continua 100% operacional**, os botões submetem normalmente e nenhuma funcionalidade de negócio é perdida.
