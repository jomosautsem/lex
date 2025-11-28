import { User, UserRole, Case, DocType, LegalEvent, EventType } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Roberto Gomez',
    email: 'admin@lexcorp.com',
    role: UserRole.ADMIN,
    isActive: true,
    avatarUrl: 'https://picsum.photos/200/200'
  },
  {
    id: 'u2',
    name: 'Lic. Ana Martinez',
    email: 'ana@lexcorp.com',
    role: UserRole.EMPLOYEE,
    isActive: true,
    avatarUrl: 'https://picsum.photos/201/201'
  },
  {
    id: 'u3',
    name: 'Juan Perez',
    email: 'juan@cliente.com',
    role: UserRole.CLIENT,
    isActive: true,
    avatarUrl: 'https://picsum.photos/202/202'
  },
  {
    id: 'u4',
    name: 'Maria Lopez',
    email: 'maria@cliente.com',
    role: UserRole.CLIENT,
    isActive: false, // Inactive example
    avatarUrl: 'https://picsum.photos/203/203'
  }
];

export const MOCK_CASES: Case[] = [
  {
    id: 'c1',
    title: 'Divorcio Perez vs Lopez',
    clientId: 'u3',
    status: 'En Proceso',
    description: 'Proceso de divorcio incausado. Pendiente de sentencia.',
    createdAt: '2023-10-15',
    documents: [
      { id: 'd1', name: 'Acta_Matrimonio.pdf', type: DocType.OTRO, uploadDate: '2023-10-15', size: '2.4 MB' },
      { id: 'd2', name: 'Demanda_Inicial.pdf', type: DocType.DEMANDA, uploadDate: '2023-10-16', size: '1.1 MB' }
    ]
  },
  {
    id: 'c2',
    title: 'Mercantil - Cobranza X',
    clientId: 'u4',
    status: 'Pausado',
    description: 'Cobro de pagarés vencidos.',
    createdAt: '2023-11-01',
    documents: [
        { id: 'd3', name: 'CURP_Cliente.pdf', type: DocType.CURP, uploadDate: '2023-11-01', size: '0.5 MB' }
    ]
  }
];

export const MOCK_EVENTS: LegalEvent[] = [
  {
    id: 'e1',
    title: 'Audiencia de Pruebas',
    date: new Date().toISOString().split('T')[0], // Today
    time: '10:00',
    type: EventType.AUDIENCIA,
    caseId: 'c1',
    description: 'Presentación de testigos en juzgado 5to.'
  },
  {
    id: 'e2',
    title: 'Vencimiento Contestación',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '23:59',
    type: EventType.TERMINO,
    caseId: 'c2',
    description: 'Último día para presentar contestación de demanda.'
  },
  {
    id: 'e3',
    title: 'Reunión Mensual',
    date: new Date(Date.now() + 432000000).toISOString().split('T')[0], // +5 days
    time: '16:00',
    type: EventType.REUNION,
    caseId: '',
    description: 'Revisión de estatus con el cliente Juan Perez.'
  }
];

export const APP_NAME = "LEXCORP JURÍDICO";