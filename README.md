# Barbearia Clandestina • Abrantes (Website Oficial & Dashboard)

Website oficial cinematográfico e brutalista da **Barbearia Clandestina** (Abrantes, desde 2019), desenvolvido com foco em estética estritamente preto e branco (monocromática), motor acústico procedural e painel de administração autónomo com criptografia SHA-256.

---

## 📁 Estrutura Organizada de Ficheiros e Pastas

```text
Clandestina/
│
├── index.html                   # Website principal (Página pública)
├── dashboard.html               # Painel de controlo e gestão da galeria (Área restrita)
├── README.md                    # Documentação do projeto e manual de administração
│
├── assets/                      # Todos os recursos estáticos organizados
│   ├── css/                     # Folhas de estilo dedicadas (CSS puro)
│   │   ├── style.css            # Estilos personalizados, animações e efeitos do site
│   │   └── dashboard.css        # Estilos específicos do painel de administração
│   │
│   ├── fonts/                   # Tipografias locais dedicadas
│   │   └── RoyalKing-Free.ttf   # Fonte vintage vitoriana Royal King (Hero Title)
│   │
│   ├── js/                      # Lógica de interatividade e segurança (JavaScript)
│   │   ├── tailwind-config.js   # Configuração modular e temas do Tailwind
│   │   ├── main.js              # Motor de áudio, scroll da navalha, animações e lightbox
│   │   └── dashboard.js         # Autenticação SHA-256, compressão de fotos e gestão
│   │
│   ├── images/                  # Logotipos oficiais e fotografias em cores naturais
│   │   ├── logo_semfundo.png    # Logotipo oficial recortado em alta resolução
│   │   ├── logo.jpg             # Logotipo com moldura
│   │   ├── 5_anos.jpg           # Registo #01: 5 Anos em Abrantes
│   │   ├── arte_tesoura.jpg     # Registo #02: A Arte na Tesoura
│   │   ├── life_clandestina.jpg # Registo #03: O Espaço Real
│   │   └── cartao_cliente.jpeg  # Registo #04: Caderneta & Lealdade
│   │
│   └── sounds/                  # Áudios e gravações reais de barbearia
│       ├── real_scissors.wav    # Corte duplo de tesoura de barbeiro
│       ├── real_scissors_snip.wav # Estalido rápido de tesoura
│       ├── real_clipper_binaural.wav # Zumbido contínuo de máquina de corte
│       ├── clipper.mp3          # Som de shaver de alta rotação
│       ├── real_razor.wav       # Lâmina de navalha no couro
│       └── real_spray.wav       # Pulverizador / spray de água
│
└── backups/                     # Salvaguardas e versões anteriores do projeto
    └── index.html.bak           # Cópia de segurança da versão inicial
```

---

## 🔐 Painel de Gestão (Dashboard)

Acede diretamente pelo ficheiro `dashboard.html` ou pelo link discreto `[🔒 Painel]` no rodapé do website:

- **Ficheiro**: [`dashboard.html`](dashboard.html)
- **Utilizadores autorizados**: `admin`, `clandestina` ou `barbeiro`
- **Palavra-passe predefinida**: `clandestina2019`
- **Segurança**:
  - Hash criptográfico SHA-256 via Web Crypto API nativa.
  - Proteção contra força bruta (bloqueio temporário de 15 minutos após 5 tentativas falhadas).
  - Gestão de tokens de sessão com encerramento automático após inatividade.
  - Possibilidade de alterar a palavra-passe diretamente no painel.

---

## 📸 Gestão da Secção "TRABALHO REAL. CUIDADO SEM PRESSAS."

Através do Dashboard podes:
1. **Adicionar Fotos**: Envia novas fotos por Drag & Drop ou ficheiro local com compressão automática em Canvas para otimizar velocidade de carregamento.
2. **Definir Títulos e Legendas**: Configura a tag do cartão (`REGISTO #0X`) e a descrição do modal em ecrã inteiro.
3. **Reordenar Registos**: Move as fotos para a esquerda ou direita com um clique.
4. **Sincronização em Tempo Real**: Qualquer alteração na dashboard atualiza o site público instantaneamente sem necessidade de recarregar a página.
5. **Backups**: Exporta ou restaura a galeria em formato JSON a qualquer altura.

---

## 💬 Gestão da Secção de Feedbacks & Avaliações

Na aba **"Feedbacks & Avaliações"** do Dashboard é possível:
1. **Adicionar Avaliações**: Insere o nome do cliente, serviço/tag, classificação em estrelas (1 a 5 ⭐), data e o testemunho real.
2. **Editar Comentários**: Altera qualquer detalhe ou texto através do modal de edição dedicado.
3. **Reordenar Avaliações**: Move os comentários para cima ou para baixo para destacar os melhores testemunhos.
4. **Remover Avaliações**: Elimina comentários com confirmação de segurança.
5. **Sincronização em Tempo Real**: Atualização instantânea na secção `#feedbacks` do site público através do evento `storage`.
6. **Repor de Fábrica & Backup**: Repõe os 3 testemunhos originais ou exporta cópia de segurança em formato JSON.

---

## ✂️ Tabela Oficial de Serviços (Slider Horizontal Compacto)

A secção `#servicos` foi concebida num slider horizontal com `scroll-snap` e controlos táteis, garantindo que os 8 serviços oficiais não ocupem espaço vertical desnecessário:
1. **Corte** — `15 €` (Máquina & Tesoura, fade ou clássico)
2. **Cabelo + Barba** — `21 €` (Combo essencial de corte e barba com toalha quente)
3. **Corte + Barboterapia** — `23 €` (★ Mais Pedido • Combo VIP com vapor de ozono)
4. **Barba (c/ toalha quente)** — `8 €` (Ritual tradicional com navalha afiada)
5. **Corte sénior (+60 anos)** — `12 €` (Tarifa especial dedicada)
6. **Barboterapia** — `11 €` (Definição, modelagem, vaporização de ozono e óleos)
7. **Corte + tratamento de rosto** — `34 €` (Corte de precisão e esfoliação/skincare)
8. **Tratamento de rosto** — `21 €` (Limpeza profunda, vapor de ozono e hidratação)

---

## 🎨 Paleta e Identidade Visual

- **Base Principal**: Preto Profundo (`#080808`, `#121212`) e Branco Puro (`#ffffff`).
- **Estética Rigorosamente Monocromática**: Preto Profundo (`#080808`, `#121212`), Aço Escovado e Branco Puro (`#ffffff`).
- **Zero Azul e Zero Vermelho**: Cumprimento estrito das regras de identidade visual monocromática solicitadas pelo cliente.
- **Tipografia**:
  - **Título Hero**: *Royal King* (serifa vitoriana clássica de barbearia tradicional).
  - **Títulos de Secções**: *Bebas Neue* (display brutalista condensado).
  - **Subtítulos & Tags Técnicas**: *Space Mono* (monoespaçada de precisão cirúrgica).
  - **Corpo de Texto**: *Plus Jakarta Sans* (leitura editorial moderna).
