# 7TX — Telegram Mini App R7

**Estado:** frontend Telegram-native implementado; publicação GitHub Pages **PASS**; vínculo ao BotFather, teste Telegram físico e acervo real **pendentes**.

**URL HTTPS pública verificada:** https://andreewmr22-byte.github.io/prototitotxminiapp/7tx-r7/

**Comprovação:** GitHub Actions run 41573083039 (branch `gh-pages`, commit `8bc0c156615cdcbc05d10508557eab823fba61af`) concluiu **success** e o endereço respondeu com o R7.


## Arquivos
- `demos/7tx-telegram-miniapp-r7.html` — aplicativo de interface única, mobile-first, compatível com Telegram WebApp SDK.
- `demos/7tx-laboratorio-chat-miniapp-r6.html` — laboratório R6 original, preservado.

## Fluxo implementado
1. Início → 11 tópicos (busca e detalhes).
2. Início → Acervo (busca, filtros e exemplos sintéticos).
3. Qualquer tela → Chat (orientação para voltar à conversa original).
4. Botão Voltar nativo do Telegram e controle de tema claro/escuro.
5. Fallback de prévia quando aberto fora do Telegram.

## O que muda do R6 para o R7 (layout preservado)
- **Visual:** leão TX, paleta verde/dourada, cards e 11 tópicos são os mesmos do R6.
- **Experiência:** em vez das duas molduras de celular do laboratório, o Mini App R7 ocupa diretamente a tela do Telegram.
- **SDK:** `Telegram.WebApp.ready()`, `expand()`, `BackButton` e `close()` implementados para execução dentro do Telegram.
- **Firefox:** prévia navegável em navegador comum; abrir o HTML no Firefox **não equivale** a uma sessão Telegram.
- **Diferenças explicadas dentro do produto:** seção retrátil `R6 → R7 · O que mudou?`, sem poluição visual.
- **Bot já conhecido:** [@dk_tx_play_navigator_bot](https://t.me/dk_tx_play_navigator_bot) — link público de entrada verificado; não há prova de que o botão do Mini App esteja configurado.
- **Ainda pendente:** URL HTTPS sem intersticial; vinculação do bot pelo BotFather; dados reais e autenticação no backend; teste em WebView Telegram iOS/Android.

## Como instalar no Telegram
1. **Concluído:** o R7 foi publicado em `https://andreewmr22-byte.github.io/prototitotxminiapp/7tx-r7/` (sem intersticial). Não usar RawCDN/GitHack como URL final.
2. **Pendente de sessão Telegram do proprietário:** no **@BotFather**, executar `/setmenubutton`, escolher `@dk_tx_play_navigator_bot`, definir botão `Abrir 7TX` e usar a URL acima. Opcional: `/mybots` → bot → Bot Settings → Configure Mini App → Enable Mini App para botão principal.
3. Abrir o bot no Telegram iOS/Android e testar entrada, quatro abas, busca, detalhes, retorno e tema claro/escuro.
4. Para dados reais, criar backend próprio que **valide `Telegram.WebApp.initData` no servidor**, incluindo integridade, expiração e permissões, antes de consultar ou modificar dados.
5. Somente após essa prova, vincular acervo/mídias oficiais e atendimento; nenhuma integração real existe no arquivo frontend.

## Segurança / limites
- Não colocar token de bot, chave de API ou segredo no HTML/JavaScript.
- Nunca tratar `initDataUnsafe` como prova de identidade; nesta versão ele é usado, quando presente, **apenas para escolher um tópico visual permitido**.
- Nenhum dado é enviado ao bot; o botão Chat fecha a Mini App quando executado no Telegram, retornando à conversa de origem.
- Conteúdo de acervo apenas sintético; áreas Puxada e CC apenas descrições demonstrativas e dados fictícios.
- O R6 e os demais caminhos do repositório não são alterados.
- Antes de divulgar ao público, validar no Telegram físico, domínio, permissões e políticas do bot.

## Provas pendentes
- HTTPS estável sem aviso intermediário: **PASS** (GitHub Pages).
- Bot Telegram real identificado e vinculado.
- Assinatura e validade do `initData` verificadas em backend.
- Testes físicos no iPhone e Android.
- Acervo oficial com autorização do titular.

Fonte oficial: https://core.telegram.org/bots/webapps
