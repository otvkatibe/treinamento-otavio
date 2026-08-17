export interface NativeAncestorRecord {
  readonly tag: string;
  readonly id: string;
  readonly classes: string;
  readonly display: string;
  readonly width: string;
  readonly layoutRole: string;
  readonly parentId: string;
}

export const REAL_SHARED_ANCESTOR_MAP = {
  fileOrder: [
    { tag: 'SELECT', id: 'fileOrder', classes: 'form-select form-select-sm', display: 'block', width: '100%', layoutRole: 'control', parentId: 'native-file-order-group' },
    { tag: 'DIV', id: 'native-file-order-group', classes: 'form-group mb-0', display: 'block', width: '100%', layoutRole: 'functional-group', parentId: 'native-file-order-column' },
    { tag: 'DIV', id: 'native-file-order-column', classes: 'col-6 px-1', display: 'block', width: '50%', layoutRole: 'bootstrap-column-width-constraint', parentId: 'native-file-layout' },
    { tag: 'DIV', id: 'native-file-layout', classes: 'row g-2 d-flex', display: 'flex', width: '100%', layoutRole: 'first-horizontal-composition', parentId: 'native-files-body' },
    { tag: 'DIV', id: 'native-files-body', classes: 'card-body', display: 'block', width: '100%', layoutRole: 'card-body', parentId: 'containerFiles' },
    { tag: 'SECTION', id: 'containerFiles', classes: 'card native-files-card', display: 'block', width: '300px', layoutRole: 'shared-card', parentId: '' },
  ],
  filePicker: [
    { tag: 'BUTTON', id: 'select-files', classes: 'btn btn-outline-secondary btn-sm', display: 'inline-block', width: '100%', layoutRole: 'native-action', parentId: 'native-file-picker-column' },
    { tag: 'DIV', id: 'native-file-picker-column', classes: 'col-6 px-1', display: 'block', width: '50%', layoutRole: 'bootstrap-column-width-constraint', parentId: 'native-file-layout' },
    { tag: 'DIV', id: 'native-file-layout', classes: 'row g-2 d-flex', display: 'flex', width: '100%', layoutRole: 'first-horizontal-composition', parentId: 'native-files-body' },
    { tag: 'DIV', id: 'native-files-body', classes: 'card-body', display: 'block', width: '100%', layoutRole: 'card-body', parentId: 'containerFiles' },
    { tag: 'SECTION', id: 'containerFiles', classes: 'card native-files-card', display: 'block', width: '300px', layoutRole: 'shared-card', parentId: '' },
  ],
  historyItem: [
    { tag: 'DIV', id: 'history-event-1', classes: 'row', display: 'flex', width: '100%', layoutRole: 'event-item', parentId: 'containerHistoryRender' },
    { tag: 'DIV', id: 'containerHistoryRender', classes: '', display: 'block', width: '100%', layoutRole: 'event-list', parentId: 'native-history-body' },
    { tag: 'DIV', id: 'native-history-body', classes: 'card-body', display: 'block', width: '100%', layoutRole: 'card-body', parentId: 'containerHistory' },
    { tag: 'SECTION', id: 'containerHistory', classes: 'card native-history-card', display: 'block', width: '300px', layoutRole: 'shared-card', parentId: '' },
  ],
  historyEventLayout: [
    { tag: 'DIV', id: 'history-event-1', classes: 'row', display: 'flex', width: '100%', layoutRole: 'first-horizontal-composition', parentId: 'containerHistoryRender' },
    { tag: 'DIV', id: 'containerHistoryRender', classes: '', display: 'block', width: '100%', layoutRole: 'event-list', parentId: 'native-history-body' },
    { tag: 'DIV', id: 'native-history-body', classes: 'card-body', display: 'block', width: '100%', layoutRole: 'card-body', parentId: 'containerHistory' },
    { tag: 'SECTION', id: 'containerHistory', classes: 'card native-history-card', display: 'block', width: '300px', layoutRole: 'shared-card', parentId: '' },
  ],
} as const satisfies Readonly<Record<string, readonly NativeAncestorRecord[]>>;

export function sharedHumanTaskMarkup(): string {
  return `
    <main id="containerRequest">
      <header class="page-title"><h1>T01 - Realizar o cadastro</h1></header>
      <section id="ContainerForm"><table id="FrmExecute"><tbody></tbody></table></section>
      <aside class="native-auxiliary-column col-lg-3" style="display:block;width:300px;min-width:280px;max-width:320px">
        <section id="containerFiles" class="card native-files-card" style="display:block;width:300px">
          <h3 class="card-header">ANEXOS OPCIONAIS</h3>
          <div id="native-files-body" class="card-body" style="display:block;width:100%">
            <div id="native-file-layout" class="row g-2 d-flex" style="display:flex;width:100%">
              <div id="native-file-picker-column" class="col-6 px-1" style="display:block;width:50%;flex:0 0 50%">
                <button id="select-files" class="btn btn-outline-secondary btn-sm" style="display:inline-block;width:100%">Selecionar arquivos</button>
                <input id="shared-file-input" type="file" multiple hidden>
              </div>
              <div id="native-file-order-column" class="col-6 px-1" style="display:block;width:50%;flex:0 0 50%">
                <div id="native-file-order-group" class="form-group mb-0" style="display:block;width:100%">
                  <label for="fileOrder">Ordenar por</label>
                  <select id="fileOrder" class="form-select form-select-sm" style="display:block;width:100%">
                    <option value="date-asc">Data de inclusão (Ascendente)</option>
                    <option value="date-desc">Data de inclusão (Descendente)</option>
                  </select>
                </div>
              </div>
            </div>
            <div id="native-view-all-row" class="row mt-3" style="display:flex;width:100%">
              <div id="native-view-all-column" class="col-12" style="display:block;width:100%">
                <a id="view-all-files" class="btn btn-light btn-sm" href="#all-files" style="display:inline-flex;width:100%">Visualizar todos os arquivos</a>
              </div>
            </div>
          </div>
        </section>

        <section id="containerHistory" class="card native-history-card" style="display:block;width:300px">
          <h3 class="card-header">HISTÓRICO</h3>
          <div id="native-history-body" class="card-body" style="display:block;width:100%">
            <div id="containerHistoryRender" style="display:block;width:100%">
              <div id="history-event-1" class="row" data-id="1" style="display:flex;width:100%">
                <div class="col-2 col-md-1 avatar" style="display:block">
                  <div class="user"><span class="user-photo">OK</span></div>
                </div>
                <div class="d-none d-md-block col-md-3" style="display:block">OTAVIO AUGUSTO COELHO KATIBE</div>
                <div class="col small" style="display:block">T02 - Validar o cadastro</div>
                <div class="d-none d-md-flex col-md-2 small" style="display:flex"><time datetime="2026-08-17T09:38:00">17/08/2026, 09:38</time></div>
                <div class="col-2" style="display:block"><span class="badge badge-light-secondary">Aprovado</span></div>
              </div>
              <div id="history-event-2" class="row" data-id="2" style="display:flex;width:100%">
                <div class="col-2 col-md-1 avatar" style="display:block">
                  <div class="user"><span class="user-photo">OK</span></div>
                </div>
                <div class="d-none d-md-block col-md-3" style="display:block">OTAVIO AUGUSTO COELHO KATIBE</div>
                <div class="col small" style="display:block">T01 - Fazer o cadastro</div>
                <div class="d-none d-md-flex col-md-2 small" style="display:flex"><time datetime="2026-08-14T14:28:00">14/08/2026, 14:28</time></div>
                <div class="col-2" style="display:block"><span class="badge badge-light-secondary">Concluído</span></div>
              </div>
            </div>
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
