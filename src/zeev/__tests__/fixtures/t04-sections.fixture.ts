import type { FormSection } from '../../types';

export const EXPECTED_T04_NATIVE_SECTIONS: readonly FormSection[] = [
  {
    id: '7724',
    label: 'Dados pessoais',
    fields: [
      { name: 'nomeCompleto', label: 'Nome completo' },
      { name: 'cpfCliente', label: 'CPF' },
      { name: 'nacionalidade', label: 'Nacionalidade' },
      { name: 'estadoCivil', label: 'Estado civil' },
      { name: 'profissao', label: 'Profissão' },
      { name: 'tipoDocumento', label: 'Tipo de documento' },
      { name: 'numeroDocumento', label: 'Número do documento' },
    ],
  },
  {
    id: '7725',
    label: 'Contato',
    fields: [
      { name: 'telefone', label: 'Telefone' },
    ],
  },
  {
    id: '7726',
    label: 'Endereço',
    fields: [
      { name: 'logradouro', label: 'Logradouro' },
      { name: 'cepEndereco', label: 'CEP' },
      { name: 'numeroEndereco', label: 'Número' },
    ],
  },
  {
    id: '7727',
    label: 'Dados da prestação de serviço',
    fields: [
      { name: 'numeroContrato', label: 'Numero do contrato', editable: true },
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
] as const;

export function t04RealSectionsMarkup(): string {
  return `
    <main id="containerRequest">
      <header class="page-title"><h1>T04 - Fazer o contrato</h1></header>
      <section id="ContainerForm">
        <input type="hidden" data-name="correcaoRealizada" value="">
        <div id="BoxFrmExecute">
          <table id="FrmExecute">
            <tbody>
              <tr>
                <td>
                  <table class="form" id="Dados pessoais" data-groupid="7724">
                    <tbody>
                      <tr class="group">
                        <td colspan="2" class="group">
                          <b id="group7724" data-key="7724">Dados pessoais</b>
                        </td>
                      </tr>
                      <tr codgroup="7724">
                        <td id="td0nomeCompleto" class="col0">Nome completo</td>
                        <td id="td1nomeCompleto" class="col1">
                          <input type="hidden" data-name="nomeCompleto" value="João Silva">
                          <div class="form-control-static"><span>João Silva</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7724">
                        <td id="td0cpfCliente" class="col0">CPF</td>
                        <td id="td1cpfCliente" class="col1">
                          <input type="hidden" data-name="cpfCliente" value="123.456.789-00">
                          <div class="form-control-static"><span>123.456.789-00</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7724">
                        <td id="td0nacionalidade" class="col0">Nacionalidade</td>
                        <td id="td1nacionalidade" class="col1">
                          <input type="hidden" data-name="nacionalidade" value="Brasileira">
                          <div class="form-control-static"><span>Brasileira</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7724">
                        <td id="td0estadoCivil" class="col0">Estado civil</td>
                        <td id="td1estadoCivil" class="col1">
                          <input type="hidden" data-name="estadoCivil" value="SOLTEIRO">
                          <div class="form-control-static"><span>Solteiro(a)</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7724">
                        <td id="td0profissao" class="col0">Profissão</td>
                        <td id="td1profissao" class="col1">
                          <input type="hidden" data-name="profissao" value="Engenheiro">
                          <div class="form-control-static"><span>Engenheiro</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7724">
                        <td id="td0tipoDocumento" class="col0">Tipo de documento</td>
                        <td id="td1tipoDocumento" class="col1">
                          <input type="hidden" data-name="tipoDocumento" value="RG">
                          <div class="form-control-static"><span>RG</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7724">
                        <td id="td0numeroDocumento" class="col0">Número do documento</td>
                        <td id="td1numeroDocumento" class="col1">
                          <input type="hidden" data-name="numeroDocumento" value="MG-12.345.678">
                          <div class="form-control-static"><span>MG-12.345.678</span></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="form" id="Contato" data-groupid="7725">
                    <tbody>
                      <tr class="group">
                        <td colspan="2" class="group">
                          <b id="group7725" data-key="7725">Contato</b>
                        </td>
                      </tr>
                      <tr codgroup="7725">
                        <td id="td0telefone" class="col0">Telefone</td>
                        <td id="td1telefone" class="col1">
                          <input type="hidden" data-name="telefone" value="(31) 98765-4321">
                          <div class="form-control-static"><span>(31) 98765-4321</span></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="form" id="Endereço" data-groupid="7726">
                    <tbody>
                      <tr class="group">
                        <td colspan="2" class="group">
                          <b id="group7726" data-key="7726">Endereço</b>
                        </td>
                      </tr>
                      <tr codgroup="7726">
                        <td id="td0logradouro" class="col0">Logradouro</td>
                        <td id="td1logradouro" class="col1">
                          <input type="hidden" data-name="logradouro" value="Av. Contorno">
                          <div class="form-control-static"><span>Av. Contorno</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7726">
                        <td id="td0cepEndereco" class="col0">CEP</td>
                        <td id="td1cepEndereco" class="col1">
                          <input type="hidden" data-name="cepEndereco" value="30110-000">
                          <div class="form-control-static"><span>30110-000</span></div>
                        </td>
                      </tr>
                      <tr codgroup="7726">
                        <td id="td0numeroEndereco" class="col0">Número</td>
                        <td id="td1numeroEndereco" class="col1">
                          <input type="hidden" data-name="numeroEndereco" value="1000">
                          <div class="form-control-static"><span>1000</span></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

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
                          <input type="text" data-name="numeroContrato" value="">
                        </td>
                      </tr>
                      <tr codgroup="7727">
                        <td id="td0dataContrato" class="col0">Data do contrato</td>
                        <td id="td1dataContrato" class="col1">
                          <input type="text" data-name="dataContrato" value="">
                        </td>
                      </tr>
                      <tr codgroup="7727">
                        <td id="td0valorContrato" class="col0">Valor do contrato</td>
                        <td id="td1valorContrato" class="col1">
                          <input type="text" data-name="valorContrato" value="">
                        </td>
                      </tr>
                      <tr codgroup="7727">
                        <td id="td0documentoContratoPdf" class="col0">Contrato em PDF</td>
                        <td id="td1documentoContratoPdf" class="col1">
                          <input type="file" data-name="documentoContratoPdf">
                          <button id="btnUpload_documentoContratoPdf" type="button">Enviar arquivo</button>
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <div id="controllers">
        <div id="buttons">
          <button id="btnFinish" type="button">Concluir</button>
        </div>
      </div>
    </main>
  `;
}
