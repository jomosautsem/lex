
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Added phone field
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
}

export enum DocType {
  DEMANDA = 'Demanda',
  ACTA_NACIMIENTO = 'Acta de Nacimiento',
  CURP = 'CURP',
  COMPROBANTE_DOMICILIO = 'Comprobante de Domicilio',
  OTRO = 'Otro'
}

export interface Document {
  id: string;
  name: string;
  type: DocType;
  uploadDate: string;
  size: string;
  url?: string;
}

export interface Case {
  id: string;
  title: string;
  clientId: string;
  status: 'Abierto' | 'En Proceso' | 'Cerrado' | 'Pausado';
  description: string;
  documents: Document[];
  createdAt: string;
}

export enum EventType {
  AUDIENCIA = 'Audiencia',
  TERMINO = 'Vencimiento de Término',
  REUNION = 'Reunión con Cliente',
  OTRO = 'Otro'
}

export interface LegalEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  caseId: string;
  description: string;
}

export interface ViewState {
  currentView: 'LOGIN' | 'DASHBOARD' | 'USERS' | 'CASES' | 'CALENDAR' | 'SETTINGS';
  selectedCaseId?: string;
}