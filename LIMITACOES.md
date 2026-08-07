# Limitações e Observações Técnicas (v0.1.0)

Este documento registra as limitações técnicas, restrições de escopo e recomendações para versões futuras da customização visual do aplicativo `Treinamento - Otávio Katibe` no Zeev.

---

## 1. Escopo Exclusivamente Visual (Sem JavaScript)

Por diretriz arquitetural desta primeira versão:
- **Nenhum script JavaScript foi adicionado**.
- O comportamento nativo da plataforma (máscaras de input, validações de campos obrigatórios, cálculos de fórmulas, regras de automação de campos e submissão de formulários) é mantido 100% via motor nativo do Zeev.

---

## 2. Limitações de Customização CSS Puro no DOM do Zeev

1. **Variações de Renderização do DOM**:
   - Como a estrutura de HTML renderizada pelo Zeev pode variar sutilmente entre versões do sistema ou tipos de componentes nativos, alguns seletores utilizam agrupamentos defensivos (`[data-name]`, `[data-field-name]`, `[id*="..."]`).
   - Caso o Zeev altere drasticamente os atributos de wrappers de formulários em atualizações futuras da plataforma, os seletores em `src/zeev-fieb.css` precisarão de atualização.

2. **Popups, Modais e Componentes de Calendário/Upload**:
   - Componentes injetados dinamicamente no `body` fora da hierarquia do formulário principal (como modais de seleção, datepickers flutuantes e janelas de upload) mantêm os estilos globais da plataforma para evitar efeitos colaterais indesejados em outros aplicativos do Zeev.

3. **Validações Negativas e Cores de Botões por Texto**:
   - Para evitar seletores frágeis baseados estritamente em rótulos de botões em português (ex: `button:contains("Reprovar")`), utilizou-se seletores de classes de ação nativas (`.btn-success`, `.btn-warning`, `.btn-danger`, `[data-action]`).
   - Se o Zeev utilizar botões genéricos sem classes semânticas de ação, eles receberão a estilização do botão primário ou secundário.

---

## 3. Oportunidades para Versões Futuras (Fase 2 - Com JS caso autorizado)

Caso seja autorizada a inclusão de um script auxiliar no futuro, os seguintes pontos visuais poderiam ser aprimorados via JS:
1. **Máscara visual avançada para CPF** (se a máscara nativa do Zeev não estiver habilitada no campo `cpfCliente`).
2. **Contador de caracteres dinâmico em tempo real** para as áreas de texto (`nomeCompleto`, `nacionalidade`, `profissao`, `numeroDocumento`).
3. **Injeção de ícones corporativos (SVG)** ao lado dos títulos dos grupos e botões de ação.
