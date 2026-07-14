/* IMPERO — Cenários de investimento do projeto de marca.
 * Três faixas fixas. Edite preços e itens aqui. */

/* ============ CONFIG ============
 * Cole a URL do seu Web App do Google Apps Script (termina em /exec).
 * É pra lá que o formulário envia — e o Apps Script grava na planilha. */
const CONFIG = {
  sheetsUrl: 'https://script.google.com/macros/s/AKfycbz12iX0tc1uw9HhgvQhhXm7HdfNUy1A-8G52rnzAMJphhETf27kln3B-xfPBH84HXskjw/exec',
};

const SCENARIOS = [
  {
    id: 'essencia',
    nome: 'Essência',
    preco: 5000,
    tag: 'O necessário para nascer com força',
    resumo: 'A base sólida da marca: estratégia enxuta, símbolo e sistema mínimo para já existir bem.',
    entregaveis: [
      'Diagnóstico & posicionamento essencial',
      'Logotipo & marca principal (3 versões)',
      'Paleta de cores',
      'Sistema tipográfico',
      'Mini-guia de uso da marca',
    ],
    prazo: '3 a 4 semanas',
  },
  {
    id: 'sistema',
    nome: 'Sistema',
    preco: 10000,
    destaque: true,
    tag: 'A marca completa, pronta para o mercado',
    resumo: 'Identidade visual completa e consistente, com manual e aplicações para operar em todos os canais.',
    entregaveis: [
      'Tudo do plano Essência',
      'Naming ou refinamento de nome',
      'Grafismos & biblioteca de ícones',
      'Manual de marca completo (Brandbook)',
      'Mockups & aplicações principais',
      'Kit de redes sociais (templates)',
    ],
    prazo: '5 a 7 semanas',
  },
  {
    id: 'cinematografico',
    nome: 'Cinematográfico',
    preco: 15000,
    tag: 'A marca como experiência audiovisual',
    resumo: 'A identidade elevada ao nível cinema: assinatura 3D, movimento e renders que fazem a marca respirar.',
    entregaveis: [
      'Tudo do plano Sistema',
      'Assinatura 3D cinematográfica',
      'Motion / animação de logo',
      'Renders de aplicação fotorrealistas',
      'Identidade verbal & tom de voz',
      'Papelaria corporativa completa',
    ],
    prazo: '7 a 10 semanas',
  },
];
