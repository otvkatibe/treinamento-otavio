import type { FormSection } from '../../types';

export const EXPECTED_T05_NATIVE_SECTIONS: readonly FormSection[] = [
  {
    id: '7727',
    label: 'Dados da prestação de serviço',
    fields: [
      { name: 'numeroContrato', label: 'Numero do contrato' },
      { name: 'dataContrato', label: 'Data do contrato' },
      { name: 'valorContrato', label: 'Valor do contrato' },
      { name: 'documentoContratoPdf', label: 'Contrato em PDF' },
    ],
  },
  {
    id: '7728',
    label: 'Documentos',
    fields: [
      {
        name: 'documentoCadastroPdf',
        label: 'Documento escolhido no cadastro em pdf',
      },
    ],
  },
  {
    id: '7729',
    label: 'Validação',
    fields: [
      {
        name: 'correcaoRealizada',
        label: 'Correções realizadas:',
      },
    ],
  },
] as const;

export function t05RealSectionsMarkup(): string {
  return `
    <main id="containerRequest">
      <header class="page-title"><h1>T05 - Validar o contrato</h1></header>
      <section id="ContainerForm">
        <div id="BoxFrmExecute">
          <table id="FrmExecute">
            <tbody>
              <tr>
                <td>
                  <table class="form" id="Dados da prestação de serviço" data-groupid="7727">
                    <tbody>
                      <tr class="group">
                        <td colspan="2" class="group">
                          <b id="group7727" data-key="7727">Dados da prestação de serviço</b>
                        </td>
                      </tr>
                      <tr codgroup="7727">
                        <td id="td0numeroContrato" class="col0">Numero do contrato</td>
                        <td id="td1numeroContrato" class="col1">
                          <input type="hidden" data-name="numeroContrato" value="CTR-2026-001">
                          <div class="form-control-static"><span>CTR-2026-001</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7727">
                        <td id="td0dataContrato" class="col0">Data do contrato</td>
                        <td id="td1dataContrato" class="col1">
                          <input type="hidden" data-name="dataContrato" value="2026-08-14">
                          <div class="form-control-static"><span>14/08/2026</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7727">
                        <td id="td0valorContrato" class="col0">Valor do contrato</td>
                        <td id="td1valorContrato" class="col1">
                          <input type="hidden" data-name="valorContrato" value="50000.00">
                          <div class="form-control-static"><span>R$ 50.000,00</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7727">
                        <td id="td0documentoContratoPdf" class="col0">Contrato em PDF</td>
                        <td id="td1documentoContratoPdf" class="col1">
                          <input type="hidden" data-name="documentoContratoPdf">
                          <a href="/download/contrato.pdf">contrato.pdf</a>
                          <button id="btnDownload_documentoContratoPdf" type="button">Baixar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="form" id="Documentos" data-groupid="7728">
                    <tbody>
                      <tr class="group">
                        <td colspan="2" class="group">
                          <b id="group7728" data-key="7728">Documentos</b>
                        </td>
                      </tr>
                      <tr codgroup="7728">
                        <td id="td0documentoCadastroPdf" class="col0">Documento escolhido no cadastro em pdf</td>
                        <td id="td1documentoCadastroPdf" class="col1">
                          <input type="hidden" data-name="documentoCadastroPdf">
                          <a href="/download/cadastro.pdf">cadastro.pdf</a>
                          <button id="btnDownload_documentoCadastroPdf" type="button">Baixar</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="form" id="Validação" data-groupid="7729">
                    <tbody>
                      <tr class="group">
                        <td colspan="2" class="group">
                          <b id="group7729" data-key="7729">Validação</b>
                        </td>
                      </tr>
                      <tr codgroup="7729">
                        <td id="td0correcaoRealizada" class="col0">Correções realizadas:</td>
                        <td id="td1correcaoRealizada" class="col1">
                          <input type="hidden" data-name="correcaoRealizada" value="">
                          <div class="form-control-static"><span></span></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <div id="controllers">
        <div id="buttons">
          <button id="customBtn_Aprovar o contrato" type="button">Aprovar o contrato</button>
          <button id="customBtn_Reprovar o contrato" type="button">Reprovar o contrato</button>
        </div>
      </div>
    </main>
  `;
}
