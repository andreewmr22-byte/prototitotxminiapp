# TX 26 · Central navegável

Adição **isolada** ao repositório `prototitotxminiapp`: não substitui a MiniApp principal, o R6, o R7 ou o piloto de mídia R2. Sem credenciais, envio automático ou API de mensagens.

## Abrir

A partir da raiz do repositório: `python -m http.server 8090` e abrir `http://localhost:8090/central/` no Firefox. Os links relativos para o MiniApp, R6 e mídia R2 dependem de servir o repositório inteiro.

## Funcionalidade

- Rotas navegáveis por hash: visão geral, WhatsApp, acervo, listas, frentes, auditoria.
- WhatsApp Web, Telegram Web e Discord somente através dos clientes oficiais em novas abas. Não há login embutido nem captura de conversas.
- Importação por seleção explícita de imagens/vídeos. Prévia apenas durante a sessão do navegador, por Blob URL. Sem upload de arquivos.
- Criar, excluir, salvar localmente e exportar listas TXT. Não inventa preços/quantidades. Mídias são referenciadas pelo nome do arquivo, não persistidas.
- Autoteste de elementos e capacidades de navegador; registros de validação manual **não são** prova de conectividade com canais.

## Limites de prova

Uma página estática não comprova conexão da sessão existente da Central TX R20 (Windows/WebView2) nem integra sua sessão com WhatsApp Web. E2E real exige navegador/telefone autenticado, host local e escopo de acesso autorizado. Os canais Telegram e Discord são somente atalhos até haver conectores validados.

## Responsividade

Breakpoints até 1230px, 800px e 480px; validar visualmente no Firefox desktop, 320/390/430px e Safari do iPhone antes de declarar PASS físico.