/* IMPERO — Diagnóstico de Desenvolvimento de Marca
 * Estrutura de seções e campos. Renderizado dinamicamente por app.js.
 *
 * tipos de campo:
 *   text | textarea | select | chips (multi) | swatches (cores) | slider (eixo semântico)
 */

/* Paleta de referência para o cliente montar o gosto visual */
const PALETTE = [
  '#0c1b2e', '#1e3a5f', '#c9a96e', '#8c6d3f', '#f5f3ef', '#ffffff',
  '#111111', '#3f3f46', '#b91c1c', '#dc2626', '#ea580c', '#f59e0b',
  '#15803d', '#059669', '#0e7490', '#2563eb', '#7c3aed', '#db2777',
  '#f9a8d4', '#fca5a5', '#a7f3d0', '#bfdbfe', '#e9d5ff', '#fde68a',
];

const ARCHETYPES = [
  'O Sábio', 'O Herói', 'O Fora-da-lei', 'O Mago', 'O Cara Comum',
  'O Amante', 'O Bobo da Corte', 'O Prestativo', 'O Criador',
  'O Governante', 'O Inocente', 'O Explorador',
];

const DIAG = [
  /* ============ 1. ESSÊNCIA ============ */
  {
    id: 'essencia', nome: 'Essência & Propósito',
    desc: 'A raiz da marca. Antes da forma, o significado.',
    campos: [
      { id: 'proposito', tipo: 'textarea', req: true,
        label: 'Por que essa marca existe, além de dar lucro?',
        ph: 'A crença que move o negócio. O que o mundo perde se ela deixar de existir?' },
      { id: 'promessa', tipo: 'text',
        label: 'A promessa da marca em uma frase',
        ph: 'Ex.: devolver ao cliente o tempo que a burocracia rouba.' },
      { id: 'valores', tipo: 'chips',
        label: 'Valores inegociáveis',
        opts: ['Excelência', 'Transparência', 'Ousadia', 'Cuidado', 'Simplicidade', 'Rigor',
               'Liberdade', 'Tradição', 'Inovação', 'Sustentabilidade', 'Comunidade', 'Discrição'] },
      { id: 'inimigo', tipo: 'text',
        label: 'Contra o que a marca luta?',
        ph: 'O vilão da história: o amadorismo, o desperdício, a mesmice...' },
    ],
  },

  /* ============ 2. MERCADO ============ */
  {
    id: 'mercado', nome: 'Mercado & Concorrência',
    desc: 'Onde a marca joga e como ela se distingue.',
    campos: [
      { id: 'categoria', tipo: 'text', req: true,
        label: 'Categoria / setor', ph: 'Ex.: arquitetura de interiores de alto padrão' },
      { id: 'concorrentes', tipo: 'textarea',
        label: 'Principais concorrentes',
        ph: 'Nomes e, se possível, links. Como eles se parecem entre si?' },
      { id: 'diferencial', tipo: 'textarea', req: true,
        label: 'O que só vocês fazem (ou fazem melhor)?',
        ph: 'A vantagem real, não o clichê. Por que trocar o concorrente por você?' },
      { id: 'preco', tipo: 'select',
        label: 'Posicionamento de preço',
        opts: ['Acessível / volume', 'Intermediário', 'Premium', 'Luxo / exclusivo'] },
    ],
  },

  /* ============ 3. PÚBLICO ============ */
  {
    id: 'publico', nome: 'Público & Percepção',
    desc: 'Para quem a marca fala e o que ela precisa provocar.',
    campos: [
      { id: 'quem', tipo: 'textarea', req: true,
        label: 'Quem é o cliente ideal?',
        ph: 'Idade, contexto, poder aquisitivo, o que consome, onde vive.' },
      { id: 'dor', tipo: 'textarea',
        label: 'Qual dor ou desejo o traz até você?', ph: 'O que tira o sono dele.' },
      { id: 'percepcao', tipo: 'chips',
        label: 'O que a pessoa deve SENTIR ao ver a marca',
        opts: ['Confiança', 'Desejo', 'Segurança', 'Admiração', 'Curiosidade', 'Pertencimento',
               'Urgência', 'Calma', 'Poder', 'Aconchego', 'Sofisticação', 'Alívio'] },
    ],
  },

  /* ============ 3.5 PROJEÇÕES (associação) ============ */
  {
    id: 'projecoes', nome: 'Se a marca fosse...',
    desc: 'Um exercício de imaginação. Responda pelo instinto — é aqui que a personalidade escapa.',
    campos: [
      { id: 'proj_pessoa', tipo: 'text',
        label: 'Se a marca fosse uma pessoa, quem seria?',
        ph: 'Uma celebridade, um tipo, um personagem. E por quê?' },
      { id: 'proj_lugar', tipo: 'text',
        label: 'Se a marca fosse um lugar, onde seria?',
        ph: 'Ex.: um ateliê em Paris, um bar de vinil, um laboratório.' },
      { id: 'proj_objeto', tipo: 'text',
        label: 'Se a marca fosse um objeto ou um carro, qual seria?',
        ph: 'Algo que traduza o jeito dela. Ex.: um relógio suíço, um jipe.' },
      { id: 'proj_som', tipo: 'text',
        label: 'Que som ou trilha a marca teria?',
        ph: 'Um gênero, uma música, um instrumento, um silêncio.' },
    ],
  },

  /* ============ 4. SEMIÓTICA ============ */
  {
    id: 'semiotica', nome: 'Semiótica & Significado',
    desc: 'O que a marca deve significar — e os eixos que definem a forma. Arraste as barras.',
    campos: [
      { id: 'arquetipo', tipo: 'select', req: true,
        label: 'Arquétipo dominante', opts: ARCHETYPES },
      { id: 'arquetipo2', tipo: 'select',
        label: 'Arquétipo de apoio (opcional)', opts: ['—', ...ARCHETYPES] },

      { id: 'ax_abstracao', tipo: 'slider', label: 'Nível de abstração do símbolo',
        esq: 'Figurativo', dir: 'Abstrato', def: 50,
        hint: 'Um símbolo que representa literalmente o objeto, ou um sinal puro?' },
      { id: 'ax_forma', tipo: 'slider', label: 'Linguagem da forma',
        esq: 'Orgânico', dir: 'Geométrico', def: 50 },
      { id: 'ax_tempo', tipo: 'slider', label: 'Eixo temporal',
        esq: 'Clássico / atemporal', dir: 'Contemporâneo / futurista', def: 50 },
      { id: 'ax_tom', tipo: 'slider', label: 'Temperatura emocional',
        esq: 'Sério / sóbrio', dir: 'Lúdico / expressivo', def: 40 },
      { id: 'ax_exclusividade', tipo: 'slider', label: 'Alcance simbólico',
        esq: 'Popular / acessível', dir: 'Exclusivo / raro', def: 60 },
      { id: 'ax_densidade', tipo: 'slider', label: 'Densidade visual',
        esq: 'Minimalista', dir: 'Detalhado / ornamentado', def: 35 },

      { id: 'significados', tipo: 'chips',
        label: 'A marca deve SIGNIFICAR',
        opts: ['Movimento', 'Solidez', 'Precisão', 'Origem', 'Ascensão', 'Proteção', 'Conexão',
               'Transformação', 'Herança', 'Ruptura', 'Equilíbrio', 'Infinito', 'Luz', 'Profundidade'] },
      { id: 'simbolos_sim', tipo: 'textarea',
        label: 'Símbolos, metáforas ou imagens que combinam',
        ph: 'Ex.: a montanha, o arco, a semente, a órbita, o traço da caligrafia.' },
      { id: 'simbolos_nao', tipo: 'textarea',
        label: 'O símbolo NUNCA pode remeter a...',
        ph: 'Leituras acidentais, gestos ambíguos, clichês do setor, conotações indesejadas.' },
    ],
  },

  /* ============ 5. CORES ============ */
  {
    id: 'cores', nome: 'Cor & Significado Cromático',
    desc: 'Cor não é gosto — é código. O que ela deve comunicar antes da palavra.',
    campos: [
      { id: 'paleta', tipo: 'swatches',
        label: 'Monte a paleta de referência', hint: 'Clique para selecionar. Não é a paleta final — é o gosto.' },
      { id: 'cores_txt', tipo: 'text',
        label: 'Descreva as cores em palavras', ph: 'Ex.: azul profundo, dourado envelhecido, off-white' },
      { id: 'cor_significado', tipo: 'chips',
        label: 'A cor deve comunicar',
        opts: ['Confiança', 'Energia', 'Luxo', 'Natureza', 'Pureza', 'Força', 'Calma',
               'Tecnologia', 'Calor humano', 'Tradição', 'Ousadia', 'Minimalismo'] },
      { id: 'ax_saturacao', tipo: 'slider', label: 'Saturação',
        esq: 'Dessaturado / neutro', dir: 'Vibrante / saturado', def: 40 },
      { id: 'ax_luminancia', tipo: 'slider', label: 'Luminosidade dominante',
        esq: 'Escuro / noturno', dir: 'Claro / luminoso', def: 50 },
      { id: 'cores_proibidas', tipo: 'text',
        label: 'Cores proibidas', ph: 'Do concorrente, ou que o cliente detesta.' },
    ],
  },

  /* ============ 6. TIPOGRAFIA ============ */
  {
    id: 'tipografia', nome: 'Tipografia & Voz Visual',
    desc: 'A letra também fala. Que sotaque ela deve ter?',
    campos: [
      { id: 'tipo_estilo', tipo: 'chips',
        label: 'Estilos tipográficos que agradam',
        opts: ['Serifada clássica', 'Serifada moderna', 'Sem serifa geométrica', 'Sem serifa humanista',
               'Display / expressiva', 'Manuscrita', 'Condensada', 'Monoespaçada'] },
      { id: 'ax_peso', tipo: 'slider', label: 'Peso e presença',
        esq: 'Leve / delicado', dir: 'Pesado / imponente', def: 50 },
      { id: 'tipo_ref', tipo: 'text',
        label: 'Alguma tipografia que você admira?', ph: 'Se souber o nome, ótimo. Se não, descreva.' },
    ],
  },

  /* ============ 7. COMUNICAÇÃO ============ */
  {
    id: 'comunicacao', nome: 'Como a marca se comunica',
    desc: 'Tom de voz, vocabulário e o jeito de chegar.',
    campos: [
      { id: 'ax_formalidade', tipo: 'slider', label: 'Formalidade',
        esq: 'Informal / próximo', dir: 'Formal / institucional', def: 50 },
      { id: 'ax_humor', tipo: 'slider', label: 'Humor',
        esq: 'Sério', dir: 'Bem-humorado', def: 35 },
      { id: 'ax_autoridade', tipo: 'slider', label: 'Postura',
        esq: 'Parceiro / conselheiro', dir: 'Autoridade / especialista', def: 55 },
      { id: 'personalidade', tipo: 'chips',
        label: 'A personalidade da marca em palavras',
        opts: ['Confiável', 'Inovador', 'Premium', 'Acessível', 'Acolhedor', 'Disruptivo',
               'Preciso', 'Humano', 'Exclusivo', 'Energético', 'Sereno', 'Direto'] },
      { id: 'palavras_sim', tipo: 'text',
        label: 'Palavras que a marca usa', ph: 'Ex.: cuidado, projeto, precisão' },
      { id: 'palavras_nao', tipo: 'text',
        label: 'Palavras que a marca NUNCA usa', ph: 'Ex.: barato, promoção, "top"' },
      { id: 'slogan', tipo: 'text',
        label: 'Já existe uma tagline ou slogan?', ph: 'Se sim, escreva. Se não, deixe em branco.' },
    ],
  },

  /* ============ 8. REFERÊNCIAS ============ */
  {
    id: 'referencias', nome: 'Referências & Repertório',
    desc: 'O que o cliente ama, o que detesta. Links valem ouro.',
    campos: [
      { id: 'admira', tipo: 'textarea', req: true,
        label: 'Marcas, sites ou campanhas que você admira',
        ph: 'Não precisa ser do seu setor. Diga por que admira cada uma.' },
      { id: 'evita', tipo: 'textarea',
        label: 'O que você NÃO gosta / quer evitar',
        ph: 'Estilos, marcas, cores ou clichês com que não quer se parecer.' },
      { id: 'moodboard', tipo: 'text',
        label: 'Links de referência (Pinterest, Behance, Drive...)', ph: 'Cole os links aqui.' },
    ],
  },

  /* ============ 9. APLICAÇÃO ============ */
  {
    id: 'aplicacao', nome: 'Onde a marca vai viver',
    desc: 'O contexto define a forma. Uma marca de fachada não é uma marca de app.',
    campos: [
      { id: 'canais', tipo: 'chips', req: true,
        label: 'Canais e suportes principais',
        opts: ['Instagram', 'Site', 'Embalagem', 'Fachada / loja física', 'Vídeo / YouTube',
               'Aplicativo', 'Uniforme', 'Frota / veículos', 'Impressos', 'Eventos / estande'] },
      { id: 'cinematografico', tipo: 'select',
        label: 'A marca precisa de uma assinatura 3D cinematográfica?',
        opts: ['Sim, é essencial', 'Seria interessante', 'Não faz sentido agora', 'Não sei ainda'] },
      { id: 'restricoes', tipo: 'textarea',
        label: 'Restrições e obrigatoriedades',
        ph: 'Símbolo que precisa ser mantido, cor de franquia, exigência legal, prazo fixo...' },
    ],
  },
];

/* Rótulos de leitura dos eixos, usados no resumo e no relatório */
const AXIS_READS = {
  ax_abstracao:     ['Figurativo', 'Abstrato'],
  ax_forma:         ['Orgânico', 'Geométrico'],
  ax_tempo:         ['Clássico', 'Contemporâneo'],
  ax_tom:           ['Sério', 'Lúdico'],
  ax_exclusividade: ['Popular', 'Exclusivo'],
  ax_densidade:     ['Minimalista', 'Detalhado'],
  ax_saturacao:     ['Dessaturado', 'Vibrante'],
  ax_luminancia:    ['Escuro', 'Luminoso'],
  ax_peso:          ['Leve', 'Pesado'],
  ax_formalidade:   ['Informal', 'Formal'],
  ax_humor:         ['Sério', 'Bem-humorado'],
  ax_autoridade:    ['Parceiro', 'Autoridade'],
};
