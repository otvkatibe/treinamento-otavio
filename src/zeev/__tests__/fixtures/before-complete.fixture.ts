export function beforeCompleteMarkup(): string {
  return `
    <main id="containerRequest">
      <header class="page-title"><h1>T02 - Validar o cadastro</h1></header>
      <section id="ContainerForm">
        <table id="FrmExecute"><tbody><tr><td data-name="parecer">Conteúdo nativo</td></tr></tbody></table>
      </section>
      <aside class="native-auxiliary-column" style="width:240px;min-width:0">
        <section class="native-before-complete-card">
          <h3>Antes de concluir</h3>
          <div class="native-check-list" style="display:flex;width:320px">
            <div class="native-check-item" data-before-complete-item>
              <input id="confirm-review" type="checkbox">
              <p data-check-content>Confira se todos os dados pessoais e documentos obrigatórios foram revisados antes de concluir esta tarefa.</p>
            </div>
            <div class="native-check-item" data-before-complete-item>
              <span class="native-icon" data-check-icon aria-hidden="true">✓</span>
              <p data-check-content>Registre nas mensagens qualquer orientação que precise permanecer visível no processo.</p>
            </div>
          </div>
        </section>
      </aside>
      <div id="controllers"><div id="buttons"><button id="btnFinish">Concluir</button></div></div>
    </main>
  `;
}
