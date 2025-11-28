export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
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
}

export interface Case {
  id: string;
  title: string;
  clientId: string; // Links to a User with CLIENT role
  status: 'Abierto' | 'En Proceso' | 'Cerrado' | 'Pausado';
  description: string;
  documents: Document[];
  createdAt: string;
}

export interface ViewState {
  currentView: 'LOGIN' | 'DASHBOARD' | 'USERS' | 'CASES' | 'SETTINGS';
  selectedCaseId?: string;
}