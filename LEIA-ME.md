# Ovos Dionísio — Gestão (primeira etapa PWA)

Este pacote prepara o HTML existente para instalação como aplicativo web (PWA) e adiciona cache básico para reabertura offline.

## O que esta etapa faz
- Mantém a interface e a lógica do HTML original.
- Adiciona manifesto e ícones para instalação.
- Registra um Service Worker para armazenar o app shell e tentar armazenar as bibliotecas externas.
- Mostra um aviso quando o aparelho está sem internet.

## Limitações importantes
- **Esta etapa ainda NÃO sincroniza dados entre aparelhos.**
- Os registros continuam no `localStorage` do navegador/aparelho. Isso significa que dados de um vendedor não aparecem automaticamente no celular de outro.
- O modo offline precisa ser validado em aparelho real, depois da primeira abertura online. O app atual carrega React, Tailwind e Babel de CDNs; o Service Worker tenta armazenar essas bibliotecas, mas a disponibilidade offline de CDNs não deve ser considerada garantida antes dos testes.
- Não apague os dados do navegador nem desinstale o app antes de exportar um backup.
- O PWA exige hospedagem HTTPS (por exemplo, GitHub Pages ou Vercel); abrir `index.html` diretamente como arquivo não ativa o Service Worker.

## Como publicar para teste com GitHub Pages
1. Entre em https://github.com e crie um repositório privado chamado `ovos-dionisio-gestao` (ou outro nome).
2. Envie para a raiz do repositório os arquivos `index.html`, `manifest.webmanifest`, `sw.js` e a pasta `icons`.
3. Nas configurações do repositório, abra **Pages** e escolha publicar a partir da branch principal (`main`), pasta `/ (root)`.
4. Aguarde o endereço HTTPS ser criado e abra-o no Android usando o Chrome.
5. No Chrome, menu ⋮ → **Adicionar à tela inicial** ou **Instalar app**, conforme a opção exibida.
6. Abra o app uma vez com internet, confirme que carrega e faça um teste offline controlado.

## Próxima etapa antes de uso real
Projetar o banco de dados online e a sincronização offline-first. Recomenda-se autenticação por usuário, políticas de acesso por vendedor/rota e operações transacionais para impedir saldo negativo e duplicidade de sincronização. Não coloque chaves secretas de servidor dentro do HTML.
