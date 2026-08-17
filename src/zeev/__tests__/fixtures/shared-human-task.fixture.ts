export function sharedHumanTaskMarkup(): string {
  return `
    <main id="containerRequest">
      <header class="page-title"><h1>T01 - Realizar o cadastro</h1></header>
      <section id="ContainerForm"><table id="FrmExecute"><tbody></tbody></table></section>
      <aside class="native-auxiliary-column" style="width:300px;min-width:280px;max-width:320px">
        <section id="containerFiles" class="native-files-card">
          <h3>ANEXOS OPCIONAIS</h3>
          <div class="attachment-controls" style="display:flex;width:100%">
            <label id="select-files" class="native-file-action">
              Selecionar arquivos
              <input id="shared-file-input" type="file" multiple>
            </label>
            <div class="sort-control">
              <label for="fileOrder">Ordenar por</label>
              <select id="fileOrder">
                <option value="date-asc">Data de inclusão (Ascendente)</option>
                <option value="date-desc">Data de inclusão (Descendente)</option>
              </select>
            </div>
            <a id="view-all-files" href="#all-files">Visualizar todos os arquivos</a>
          </div>
        </section>

        <section id="containerHistory" class="native-history-card">
          <h3>HISTÓRICO</h3>
          <div class="history-list">
            <article class="history-item" data-history-item>
              <div class="avatar">OK</div>
              <div class="history-content">
                <div class="person-name">OTAVIO AUGUSTO COELHO KATIBE</div>
                <div class="history-meta">
                  <div class="activity-name">Solicitar registro</div>
                  <time class="history-date" datetime="2026-08-14T10:39:00">14/08/2026 · 10:39</time>
                  <span class="badge badge-light-secondary">Concluído</span>
                </div>
              </div>
            </article>
            <article class="history-item" data-history-item>
              <div class="avatar">MA</div>
              <div class="history-content">
                <div class="person-name">MARIA APARECIDA DOS SANTOS</div>
                <div class="history-meta">
                  <div class="activity-name">Realizar o cadastro</div>
                  <time class="history-date" datetime="2026-08-14T11:05:00">14/08/2026 · 11:05</time>
                  <span class="status">Em andamento</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="containerMessages" class="native-messages-card">
          <h3>MENSAGENS</h3>
          <div class="message-body"><button id="new-message">Nova mensagem</button></div>
        </section>
      </aside>
      <div id="controllers"><div id="buttons"><button id="btnFinish">Concluir</button></div></div>
    </main>
  `;
}
