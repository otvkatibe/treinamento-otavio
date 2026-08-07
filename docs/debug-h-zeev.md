# Guia de Debug e Validação Real no h-Zeev (v0.1.0)

Este guia descreve os passos para realizar o primeiro teste real de injeção CSS do tema FIEB no ambiente **h-Zeev** e diagnosticar o carregamento do stylesheet.

---

## Passo 1. Injeção da Tag no Zeev

1. Acesse o ambiente de homologação **h-Zeev**.
2. Abra a edição do aplicativo `Treinamento - Otávio Katibe`.
3. Navegue até:
   ```text
   Desenho do Processo
     ↓
   Scripts e Estilos
     ↓
   Fontes externas
     ↓
   Scripts e estilos nas atividades
   ```
4. Cole a tag `<link>` exata:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css?v=0.1.0">
```

> **Nota de Cache**: Durante a homologação, utilize o parâmetro `?v=0.1.0` para forçar o navegador e o CDN a ignorarem o cache. Em atualizações futuras, incremente para `?v=0.1.1`, `?v=0.1.2`, etc.

---

## Passo 2. Executar uma Tarefa Humana

1. Inicie uma nova instância do processo ou abra uma tarefa pendente (ex: `Solicitar registro` ou `T01 - Fazer o cadastro`).
2. Mantenha a tela da tarefa carregada no navegador.

---

## Passo 3. Abrir o DevTools e Verificar a Rede (Network)

1. Pressione `F12` (ou `Ctrl + Shift + I` / `Cmd + Option + I`) para abrir as Ferramentas do Desenvolvedor.
2. Acesse a aba **Network** (Rede).
3. No filtro de busca, digite: `zeev-fieb`
4. Recarregue a página (`F5` ou `Ctrl + R`).

### Resultado Esperado
- Arquivo: `zeev-fieb.css`
- Status: **200 OK** (ou **304 Not Modified**)

### Cenários Possíveis para Registro
- **200 OK**: CSS baixado com sucesso diretamente do GitHub Pages.
- **304 Not Modified**: CSS carregado com sucesso do cache do navegador.
- **404 Not Found**: A URL está incorreta ou o build/deploy do GitHub Pages ainda não concluiu.
- **CSP blocked (Content Security Policy)**: O ambiente Zeev bloqueou o domínio externo `github.io`.
- **failed (Network Error / CORS)**: Falha de conexão de rede ou bloqueio de origem.
- **other**: Outros códigos ou erros de conexão.

---

## Passo 4. Diagnóstico de Aplicação Visual

Se o resultado da aba Network for **200 OK** (ou 304), mas **nenhum estilo visual da FIEB for aplicado** na tela do Zeev:

> ⚠️ **ATENÇÃO**: Isso **NÃO** significa falha do GitHub Pages ou da injeção do arquivo!
>Significa que a folha de estilo foi baixada corretamente pelo navegador, mas os **seletores CSS atualmente configurados no projeto (hipóteses e mock)** não correspondem à estrutura do **DOM real** gerado pela plataforma Zeev.

---

## Passo 5. Coleta do DOM Real via DevTools (Inspetor)

Para ajustar os seletores na v0.2.0, utilize a ferramenta de inspeção do DevTools (`Elements` -> Ícone do ponteiro de seleção):

1. Clique com o botão direito no elemento desejado e selecione **Inspecionar** (ou use `Ctrl + Shift + C`).
2. Copie o HTML exato e inspecione as classes, atributos `data-*`, `id` e `name`.
3. Registre as evidências coletadas no arquivo [`docs/dom-a-validar.md`](file:///c:/Users/otavio.katibe/Downloads/processos%20-%20zeev/treinamento-otavio/docs/dom-a-validar.md) para os seguintes elementos:
   - Wrapper principal do formulário
   - Agrupamento Dados pessoais
   - Campo Nome completo (`nomeCompleto`)
   - Campo CPF (`cpfCliente`)
   - Campo Estado civil (`estadoCivil`)
   - Campo Tipo de documento (`tipoDocumento`)
   - Mensagem de validação / erro
   - Botão primário
   - Botões de ação do Zeev (Aprovar / Reprovar / Solicitar correção)
