export const ZEEV_SELECTORS = {
  root: '#containerRequest',
  taskTitle: '#containerRequest .page-title h1',
  controllers: '#controllers',
  buttons: '#buttons',
  sendButton: '#BtnSend',
  finishButton: '#btnFinish',
  directButtonActions:
    ':scope > button, :scope > input[type="button"], :scope > input[type="submit"], :scope > a, :scope > div > button, :scope > div > input[type="button"], :scope > div > input[type="submit"], :scope > div > a',
  containerForm: '#ContainerForm',
  formBox: '#BoxFrmExecute',
  form: '#FrmExecute',
  formGroups: '#ContainerForm #FrmExecute',
  formSections: 'table.form[data-groupid]',
  personalDataGroup: '[data-groupid="7724"]',
  personalDataGroupTitle: '#group7724',
  messages: '#containerMessages',
  attachments: '#containerFiles',
  historyRegions:
    '[data-history], #containerHistory, #containerHistoryRender, #history, [id*="histor" i], [class*="history" i], [class*="historico" i]',
  historyItems:
    '#containerHistoryRender > .row[data-id], #containerHistoryRender > .row, [data-history-item], .history-item, .timeline-item',
  beforeCompleteItems:
    '[data-before-complete-item], [data-check-item], .checklist-item, li',
} as const;
