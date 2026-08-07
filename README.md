# Tema Visual Corporativo FIEB para Zeev (Ambiente h-Zeev v0.2.0)

Customização visual estática, sóbria, moderna e acessível desenvolvida para a plataforma Zeev, compatível com a identidade institucional do **Sistema FIEB**.

- **Aplicativo Zeev Target**: `Treinamento - Otávio Katibe`
- **Ambiente**: `h-Zeev / Homologação`
- **Versão do Projeto**: `v0.2.0`
- **Versão do Tailwind CSS**: `Tailwind CSS v4.3.3` (compilado estaticamente via `@tailwindcss/cli`)
- **Arquivo CSS Final**: `dist/zeev-fieb.css` (~9.7 KB)

---

## 1. Arquitetura e Decisões de Projeto (v0.2.0)

- **CSS Estático Puro no Zeev**: O Zeev recebe unicamente um arquivo CSS compilado (`dist/zeev-fieb.css`). Não há dependência de Node.js, CDN runtime ou scripts JS no navegador.
- **Escopo Estrito via ID Real (`#containerRequest`)**: Todas as regras CSS são escopadas sob o contêiner raiz real do Zeev (`#containerRequest`), descartando totalmente wrappers fictícios do mock.
- **Seletores 100% Confirmados via `data-name`**: Os campos funcionais utilizam a síntese `[data-name="..."]` (`nomeCompleto`, `cpfCliente`, `nacionalidade`, `estadoCivil`, `profissao`, `tipoDocumento`, `numeroDocumento`).
- **Checkboxes Reais**: Suporte nativo ao layout dos seletores `estadoCivil` e `tipoDocumento` renderizados como `input[type="checkbox"]` dentro de `.form-check`.
- **Barra de Botões e Ações (`#controllers` / `#BtnSend`)**: Estilização institucional sóbria da barra inferior e do botão principal de submissão.
- **Design Tokens FIEB**: As cores e medidas principais estão centralizadas em variáveis CSS (`:root`).
  > `/* PALETA PROVISÓRIA — substituir por tokens oficiais FIEB */`

---

## 2. Estrutura do Projeto

```text
treinamento-otavio/
├── package.json               # Dependências do build (Tailwind v4.3.3 / Version v0.2.0)
├── README.md                  # Documentação principal
├── LIMITACOES.md              # Limitações técnicas e próximos passos
├── .gitignore                 # Arquivos ignorados pelo Git (.env, zeev-docs, etc.)
│
├── src/
│   └── zeev-fieb.css          # Stylesheet fonte v0.2.0 com tokens e seletores escopados
│
├── dist/
│   └── zeev-fieb.css          # Stylesheet estático compilado para homologação (~9.7 KB)
│
├── docs/
│   ├── seletores.md           # Contrato oficial de seletores confirmados do h-Zeev
│   ├── instalacao-zeev.md     # Guia de injeção no h-Zeev e Rollback
│   ├── debug-h-zeev.md        # Roteiro passo a passo para diagnósticos DevTools
│   ├── dom-a-validar.md       # Fragmentos de HTML real inspecionados no h-Zeev
│   └── testes.md              # Roteiro de testes funcionais, acessibilidade e resiliência
│
└── index.html                 # Demonstrador local reproduzindo o DOM real do Zeev
```

---

## 3. Instalação e Build Local

### Pré-requisitos
- Node.js (v18+)
- npm (v9+)

### Comandos principais

```bash
# Instalar dependências
npm install

# Compilar CSS em tempo de desenvolvimento (Watch mode)
npm run dev

# Compilar CSS estático de produção
npm run build
```

O comando `npm run build` gerará/atualizará o arquivo `dist/zeev-fieb.css`.

---

## 4. Publicação para homologação (v0.2.0)

### Passo A: Compilar e Enviar Alterações ao GitHub

Execute os comandos no terminal:

```bash
npm run build

git add .
git commit -m "feat: Zeev FIEB theme v0.2.0"
git push
```

### Passo B: Configurar o GitHub Pages

1. Acesse o repositório no GitHub: `https://github.com/otvkatibe/treinamento-otavio`
2. Acesse: **Settings** → **Pages**
3. Em **Build and deployment** / **Source**: selecione `Deploy from a branch`
4. Selecione a branch `main` e a pasta `/ (root)`
5. Clique em **Save**

### URLs Esperadas
- **URL do Site / Demonstrador**:
  `https://otvkatibe.github.io/treinamento-otavio/`
- **URL do CSS Compilado**:
  `https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css`

### Tag de Injeção no Zeev

Copie a seguinte tag para inserir no ambiente **h-Zeev** (*Scripts e Estilos → Fontes externas → Scripts e estilos nas atividades*):

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css?v=0.2.0">
```

> **Controle de Cache**: O parâmetro `?v=0.2.0` força a atualização pelo navegador e previne cache durante a homologação no h-Zeev.

---

## 5. Procedimento de Rollback Trivial

Caso haja qualquer instabilidade ou seja necessário reverter para o visual nativo do Zeev:

1. Acesse o Zeev no aplicativo `Treinamento - Otávio Katibe`.
2. Vá em **Scripts e Estilos** -> **Fontes externas** -> **Scripts e estilos nas atividades**.
3. Remova ou comente a tag `<link>` do CSS.
4. Salve e publique a alteração. O formulário voltará imediatamente ao estilo nativo sem afetar dados ou regras de negócio.
