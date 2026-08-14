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
  personalDataGroup: '[data-groupid="7724"]',
  personalDataGroupTitle: '#group7724',
  messages: '#containerMessages',
  attachments: '#containerFiles',
} as const;
