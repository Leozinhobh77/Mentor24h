// Crisis detection keywords and patterns
export const CRISIS_KEYWORDS = {
  // Suicídio / Auto-harm
  suicide: ['suicida', 'vou me matar', 'quero morrer', 'não quero viver', 'enforca', 'corda', 'intoxic'],
  selfHarm: ['corte', 'arranho', 'machuca', 'dor intencional', 'firo meu'],

  // Violência / Abuso
  violence: ['bate', 'agride', 'violência', 'machucou', 'agrediu', 'soco', 'tapa', 'chute'],
  abuse: ['abuso', 'estupro', 'assédio', 'molestia'],

  // Drogas / Overdose
  drugs: ['cocaína', 'heroína', 'crack', 'meth', 'overdose', 'peguei uma droga'],

  // Crise psicológica severa
  severeDistress: ['desespero', 'não aguento', 'fim', 'não há saída', 'prisioneiro', 'preso aqui'],
};

// Severity scoring rules
export const SEVERITY_THRESHOLDS = {
  low: 0,      // Casual stress (0-3)
  medium: 4,   // Moderate concerns (4-6)
  high: 7,     // Serious issues (7-8)
  critical: 9, // Immediate danger (9-10)
};

// Assistants configuration
export const ASSISTANTS = {
  mateus: {
    name: 'Mateus',
    title: 'O Profissional',
    personality: 'Objetivo, prático, focado em resultados',
    bestFor: ['organização', 'produtividade', 'planejamento'],
  },
  lucas: {
    name: 'Lucas',
    title: 'O Amigo',
    personality: 'Casual, divertido, conversador',
    bestFor: ['entretenimento', 'motivação', 'leveza'],
  },
  sergio: {
    name: 'Sérgio',
    title: 'O Sábio',
    personality: 'Profundo, reflexivo, filosófico',
    bestFor: ['bem-estar', 'inspiração', 'sabedoria'],
  },
  mariaClara: {
    name: 'Maria Clara',
    title: 'A Executiva',
    personality: 'Determinada, focada, impulsionadora',
    bestFor: ['metas', 'liderança', 'decisões'],
  },
  bianca: {
    name: 'Bianca',
    title: 'A Animada',
    personality: 'Energética, entusiasmada, positiva',
    bestFor: ['exercícios', 'treino', 'energia'],
  },
  luciana: {
    name: 'Luciana',
    title: 'A Cuidadora',
    personality: 'Atenciosa, acolhedora, empática',
    bestFor: ['saúde', 'bem-estar', 'apoio emocional'],
  },
};

// Pillars and categories
export const PILLARS = {
  organization: {
    name: 'Organização',
    color: '#22c55e',
    categories: [
      'Planejamento semanal',
      'Produtividade',
      'Gestão de tempo',
      'Metas e objetivos',
      'Hábitos',
      'Rotina matinal',
      'Rotina noturna',
      'Leitura',
      'Tecnologia',
      'Estudo',
      'Finanças',
      'Saúde',
    ],
  },
  inspiration: {
    name: 'Inspiração',
    color: '#ec4899',
    categories: [
      'Frases motivacionais',
      'Histórias de sucesso',
      'Criatividade',
      'Relacionamentos',
      'Confiança',
      'Autossuperação',
      'Empreendedorismo',
      'Filosofia de vida',
      'Comportamento',
      'Crescimento pessoal',
    ],
  },
  entertainment: {
    name: 'Entretenimento',
    color: '#f43f5e',
    categories: [
      'Comédia',
      'Curiosidades',
      'Notícias',
      'Poesia',
      'Música',
      'Artes',
      'Cinema',
      'Esportes',
      'Viagens',
      'Gastronomia',
    ],
  },
  wellbeing: {
    name: 'Bem-estar',
    color: '#0ea5e9',
    categories: [
      'Meditação',
      'Respiração',
      'Yoga',
      'Exercícios',
      'Nutrição',
      'Sono',
      'Saúde mental',
      'Estresse',
      'Ansiedade',
      'Depressão',
    ],
  },
};

// WhatsApp message templates
export const WHATSAPP_TEMPLATES = {
  welcome: 'Olá! Bem-vindo ao Mentor24h 🌟 Estou aqui para ajudá-lo com organização, inspiração, entretenimento e bem-estar. Como posso ajudá-lo hoje?',

  crisis_high:
    'Percebi que você pode estar passando por um momento difícil. Se está pensando em machucar a si mesmo, procure ajuda imediatamente:\n📞 CVV: 188\n📞 SAMU: 192\n💬 Estou aqui para ouvir.',

  crisis_moderate:
    'Vejo que está enfrentando desafios. Quer conversar sobre o que está acontecendo? Posso oferecer perspectiva e apoio.',

  defaultResponse:
    'Obrigado pela sua mensagem. Estou aqui para ajudar. Pode me contar mais sobre o que está sentindo?',
};

// Routine schedule patterns (cron format)
export const ROUTINE_SCHEDULES = {
  dailyMorning: '0 7 * * *',      // 7:00 AM daily
  dailyAfternoon: '0 14 * * *',   // 2:00 PM daily
  dailyEvening: '0 20 * * *',     // 8:00 PM daily
  weeklyMonday: '0 7 * * 1',      // 7:00 AM every Monday
  monthlyfirst: '0 7 1 * *',      // 7:00 AM first of month
  yearllyJanuary: '0 0 1 1 *',    // 1:00 AM on Jan 1
};

// API endpoints
export const API_ROUTES = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
  messages: {
    list: '/api/messages',
    create: '/api/messages',
    crises: '/api/messages/crises',
  },
  user: {
    profile: '/api/user/profile',
    update: '/api/user/profile',
    delete: '/api/user/account',
  },
  categories: {
    list: '/api/categories',
    select: (id: number) => `/api/categories/${id}/select`,
    deselect: (id: number) => `/api/categories/${id}/deselect`,
  },
  whatsapp: {
    webhook: '/api/whatsapp/webhook',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  unauthorized: 'Você não está autenticado',
  forbidden: 'Você não tem permissão',
  notFound: 'Recurso não encontrado',
  serverError: 'Erro no servidor',
  validationError: 'Dados inválidos',
};

// Success messages
export const SUCCESS_MESSAGES = {
  registered: 'Conta criada com sucesso',
  loggedIn: 'Login realizado com sucesso',
  updated: 'Atualizado com sucesso',
  deleted: 'Deletado com sucesso',
};
