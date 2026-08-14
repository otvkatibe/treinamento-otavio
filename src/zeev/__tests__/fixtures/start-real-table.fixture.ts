const radioChoice = (name: string, value: string, label: string): string => `
  <label class="form-check legacy-radio" style="display:block;width:100%">
    <input type="radio" data-name="${name}" name="${name}" value="${value}">
    ${label}
  </label>
`;

const fieldTable = (
  name: string,
  label: string,
  control: string,
): string => `
  <table id="FrmExecute" class="legacy-field-table" style="width:760px;table-layout:fixed">
    <tbody style="display:table-row-group;width:760px">
      <tr style="display:table-row;width:760px;text-align:center">
        <td class="col0" style="display:table-cell;width:30%;min-width:192px;vertical-align:middle">${label}</td>
        <td class="col1" id="td1${name}" style="display:table-cell;width:70%;min-width:420px;vertical-align:middle">${control}</td>
      </tr>
    </tbody>
  </table>
`;

export function startRealTableMarkup(): string {
  return `
    <main id="containerRequest">
      <header class="page-title"><h1>Solicitar registro</h1></header>
      <section id="ContainerForm" style="overflow-x:auto;min-width:900px">
        <div id="BoxFrmExecute" style="width:760px;text-align:center">
          <table id="FrmExecute" class="legacy-heading-table" style="width:760px;table-layout:fixed">
            <tbody style="display:table-row-group;width:760px">
              <tr class="legacy-heading-row" style="display:table-row;width:760px">
                <td colspan="2" style="display:table-cell;width:50%;white-space:nowrap">Dados pessoais</td>
              </tr>
            </tbody>
          </table>
          ${fieldTable('nomeCompleto', 'Nome completo', '<input id="inpnomeCompleto" data-name="nomeCompleto" type="text">')}
          ${fieldTable('cpfCliente', 'CPF', '<input id="inpcpfCliente" data-name="cpfCliente" type="text">')}
          ${fieldTable('nacionalidade', 'Nacionalidade', '<input id="inpnacionalidade" data-name="nacionalidade" type="text">')}
          ${fieldTable(
            'estadoCivil',
            'Estado civil',
            `<div class="radio-options" style="display:block;width:700px;white-space:nowrap">
              ${radioChoice('estadoCivil', 'solteiro', 'Solteiro(a)')}
              ${radioChoice('estadoCivil', 'casado', 'Casado(a)')}
              ${radioChoice('estadoCivil', 'divorciado', 'Divorciado(a)')}
              ${radioChoice('estadoCivil', 'viuvo', 'Viúvo(a)')}
              ${radioChoice('estadoCivil', 'uniao', 'União estável')}
              ${radioChoice('estadoCivil', 'nao-informado', 'Não informado')}
            </div>`,
          )}
          ${fieldTable('profissao', 'Profissão', '<input id="inpprofissao" data-name="profissao" type="text">')}
          ${fieldTable(
            'tipoDocumento',
            'Tipo de documento',
            `<div class="radio-options" style="display:block;width:700px;white-space:nowrap">
              ${radioChoice('tipoDocumento', 'cin', 'CIN')}
              ${radioChoice('tipoDocumento', 'rg', 'RG')}
              ${radioChoice('tipoDocumento', 'cnh', 'CNH')}
              ${radioChoice('tipoDocumento', 'passaporte', 'Passaporte')}
            </div>`,
          )}
          ${fieldTable('numeroDocumento', 'Número do documento', '<input id="inpnumeroDocumento" data-name="numeroDocumento" type="text">')}
        </div>
      </section>
      <div id="controllers"><div id="buttons"><button id="BtnSend">Enviar solicitação</button></div></div>
    </main>
  `;
}
