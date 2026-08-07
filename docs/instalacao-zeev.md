# Guia de Injeção do Tema FIEB no Zeev e Rollback

Este guia descreve os passos para aplicar o arquivo CSS compilado `dist/zeev-fieb.css` ao aplicativo `Treinamento - Otávio Katibe` no ambiente `h-Zeev`.

---

## 1. Tag de Injeção HTML

Insira a seguinte tag `<link>` no Zeev:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css?v=0.1.0">
```

> **Nota sobre o parâmetro `?v=0.1.0`**: Utilize o parâmetro de versão ao atualizar a folha de estilo durante a homologação para forçar o navegador e o CDN a ignorar o cache local.

---

## 2. Onde Injetar no Zeev

1. Acesse a plataforma **h-Zeev**.
2. Abra a edição do aplicativo `Treinamento - Otávio Katibe`.
3. No menu de navegação lateral ou superior, acesse:
   ```text
   Desenho do Processo
     ↓
   Scripts e Estilos
     ↓
   Fontes externas
     ↓
   Scripts e estilos nas atividades
   ```
4. Cole a tag `<link>` no campo destinado a folhas de estilo/estilos das atividades.
5. Clique em **Salvar** e publique/simule o aplicativo.

---

## 3. Considerações sobre Subresource Integrity (SRI)

Nesta etapa inicial de homologação:
- **NÃO estamos utilizando o atributo `integrity="..."` (SRI)** na tag `<link>`.
- **Motivo**: Durante a homologação no `h-Zeev`, o arquivo `dist/zeev-fieb.css` será recompilado e alterado frequentemente. Se o hash SRI não for atualizado a cada build, o navegador bloqueará o arquivo.

### Produção / Versão Estabilizada
Quando o tema estiver finalizado e pronto para produção, o SRI poderá ser gerado com o comando:

```bash
cmd /c "openssl dgst -sha384 -binary dist/zeev-fieb.css | openssl base64 -A"
```

E adicionado à tag em produção:

```html
<link rel="stylesheet" href="https://otvkatibe.github.io/treinamento-otavio/dist/zeev-fieb.css" integrity="sha384-HASH_GERADO..." crossorigin="anonymous">
```

---

## 4. Verificação de Carregamento (`DEBUG EXTERNAL CSS`)

Assim que a tag for inserida e a tela da tarefa (ex: `Solicitar registro` ou `T01 - Fazer o cadastro`) for carregada no `h-Zeev`, um banner discreto azul no topo da página deverá exibir:

```text
[DEBUG EXTERNAL CSS] Tema FIEB Ativo (h-Zeev v0.1.0)
```

Isso confirma que a injeção externa do CSS via GitHub Pages funcionou com sucesso.

---

## 5. Procedimento de Rollback Trivial

Se for necessário desativar a customização visual a qualquer momento:

1. Acesse **Scripts e Estilos** -> **Fontes externas** -> **Scripts e estilos nas atividades**.
2. Remova ou comente a tag `<link>`.
3. Salve o processo.
4. O Zeev retornará imediatamente ao estilo nativo da plataforma sem qualquer perda de dados, validações ou regras de negócio.
