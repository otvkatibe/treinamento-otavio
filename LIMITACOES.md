# Limitações e fronteiras técnicas — v0.3.1

## Responsabilidade do Zeev

A camada externa não executa transições, não persiste dados e não replica regras BPMN. Botões, gateway, atribuição, histórico, Mensagens, SLA e conclusão de atividades continuam sob responsabilidade do Zeev. Em especial:

- T2 depende das ações nativas `Aprovar`, `Reprovar` e `Solicitar correção`;
- as pendências para T3 vivem nas Mensagens, não em `pendenciasCadastro`;
- T5 depende das ações nativas `Aprovar o contrato` e `Reprovar o contrato`.

## Dependência do DOM

A integração depende dos contratos `#containerRequest`, `.page-title h1`, `#ContainerForm`, `#FrmExecute`, `#controllers`, `#buttons` e `#BtnSend`. Campos dependem de `data-name`. Mudanças estruturais do Zeev podem exigir ajuste do adapter, diagnostics ou CSS.

Popups, modais, calendários e uploads renderizados fora de `#containerRequest #FrmExecute` mantêm o visual nativo para evitar vazamento de estilos. Visualizadores variam conforme o componente entregue pelo Zeev e exigem inspeção humana.

## Detecção e lifecycle

O detector usa correspondência determinística do título com normalização controlada de whitespace. Títulos novos ou alterados caem no fallback desconhecido. O lifecycle acompanha SPA por `MutationObserver`, `popstate` e `hashchange`, mas transições reais e encerramentos devem ser homologados no ambiente Zeev.

O histórico de rota de T3 é efêmero e contextual à instância/tela observada; não substitui o histórico persistido pelo Zeev.

## Diagnostics e automação

`window.__ZEEV_FIEB__.diagnostics()` comprova contratos observáveis no DOM e retorna `PASS`, `FAIL` ou `SKIP/N/A`. Ele não comprova atribuição, persistência, envio de Mensagens, regras do gateway, SLA ou resultado de eventos BPMN.

Testes automatizados usam DOM simulado. Homologação humana continua obrigatória para START → T1, T1 → T2, T2 → T3 → T2, T2 → T4, T4 → T5 e para todos os encerramentos de T2/T5.

## Publicação e rollback

As URLs de `dist/zeev-fieb.js` e `dist/zeev-fieb.css` são estáveis. Cache e propagação do host podem atrasar a versão efetivamente servida; valide a resposta remota e recarregue sem cache. Não trate hashes ou commits antigos como evidência da build atual.

O rollback para `releases/v0.2.1/zeev-fieb.css` remove a camada React/TypeScript e restaura apenas o visual histórico. Essa versão não conhece o contrato v0.3.1.
