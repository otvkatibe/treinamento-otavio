# Tema Visual Corporativo FIEB para Zeev (Ambiente h-Zeev)

Customização visual estática, sóbria, moderna e acessível desenvolvida para a plataforma Zeev, compatível com a identidade institucional do **Sistema FIEB**.

- **Aplicativo Zeev Target**: `Treinamento - Otávio Katibe`
- **Ambiente**: `h-Zeev / Homologação`
- **Versão do Tailwind CSS**: `Tailwind CSS v4.3.3` (compilado estaticamente via `@tailwindcss/cli`)
- **Arquivo CSS Final**: `dist/zeev-fieb.css` (~21.7 KB)

---

## 1. Arquitetura e Decisões de Projeto

- **CSS Estático Puro no Zeev**: O Zeev recebe unicamente um arquivo CSS compilado (`dist/zeev-fieb.css`). Não há dependência de Node.js, CDN runtime ou scripts Tailwind no navegador.
- **Design Tokens FIEB**: As cores e medidas principais estão centralizadas em variáveis CSS (`:root`). 
  > `/* PALETA PROVISÓRIA — substituir por tokens oficiais FIEB */`
- **Seletores Defensivos**: A estilização mapeia os identificadores estáveis do Zeev (`nomeCompleto`, `cpfCliente`, `nacionalidade`, `estadoCivil`, `profissao`, `tipoDocumento`, `numeroDocumento`) e wrappers do grupo `Dados pessoais` sem utilizar seletores frágeis (`:nth-child`, IDs dinâmicos).
- **Indicador Visual Temporário de Debug**: O stylesheet inicia com a regra `/* DEBUG EXTERNAL CSS */` exibindo uma barra discreta no topo da página para confirmar o carregamento no `h-Zeev`.

---

## 2. Estrutura do Projeto

```text
treinamento-otaviokatibe/
├── package.json               # Dependências do build (Tailwind v4.3.3)
├── README.md                  # Documentação principal
├── LIMITACOES.md              # Limitações técnicas e próximos passos
├── .gitignore                 # Arquivos ignorados pelo Git
│
├── src/
│   └── zeev-fieb.css          # Estylesheet fonte com tokens e utilitários
│
├── dist/
│   └── zeev-fieb.css          # Estylesheet estático compilado para produção/Zeev
│
├── docs/
│   ├── seletores.md           # Mapeamento e auditoria dos seletores CSS do Zeev
│   ├── instalacao-zeev.md     # Guia de injeção no h-Zeev e Rollback
│   └── testes.md              # Roteiro de testes funcionais e visuais
│
└── index.html                 # Visualizador local e demonstração no GitHub Pages
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

## 4. Publicação no GitHub Pages e Controle de Cache

1. Suba o repositório para o GitHub.
2. Ative o **GitHub Pages** nas configurações do repositório (`Settings` -> `Pages`) apontando para o branch `main` e raiz `/` ou pasta `/docs`.
3. A URL pública do stylesheet será:
   ```text
   https://<USUARIO>.github.io/<REPOSITORIO>/dist/zeev-fieb.css
   ```

### Controle de Cache durante Homologação no h-Zeev
Para forçar a atualização imediata pelo navegador e evitar cache do GitHub Pages durante os testes no `h-Zeev`, adicione o parâmetro de versão na tag `<link>`:

```html
<link rel="stylesheet" href="https://<USUARIO>.github.io/<REPOSITORIO>/dist/zeev-fieb.css?v=0.1.0">
```

Sempre que publicar alterações no CSS durante a homologação, incremente a versão na URL (`?v=0.1.1`, `?v=0.1.2`, etc.).

---

## 5. Procedimento de Rollback Trivial

Caso haja qualquer instabilidade ou seja necessário reverter para o visual nativo do Zeev:

1. Acesse o Zeev no aplicativo `Treinamento - Otávio Katibe`.
2. Vá em **Scripts e Estilos** -> **Fontes externas** -> **Scripts e estilos nas atividades**.
3. Remova ou comente a tag `<link>` do CSS.
4. Salve e publique a alteração. O formulário voltará imediatamente ao estilo nativo sem afetar dados ou regras de negócio.
