
import { supabase } from './supabaseClient';
import { User, UserRole, Case, Document, DocType, LegalEvent, EventType } from '../types';

// --- AUTH & USERS ---

export const dbAuth = {
  signIn: async (email: string, pass: string) => {
    return await supabase.auth.signInWithPassword({ email, password: pass });
  },
  
  signUp: async (email: string, pass: string, name: string) => {
    return await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { name } // Metadata stored in auth.users, trigger copies to profiles
      }
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getCurrentSession: async () => {
    return await supabase.auth.getSession();
  },

  getUserProfile: async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      isActive: data.is_active,
      avatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=cca43b&color=0f172a`
    };
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    
    return data.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as UserRole,
      isActive: u.is_active,
      avatarUrl: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=cca43b&color=0f172a`
    }));
  },

  updateUser: async (id: string, updates: Partial<User>) => {
    // Map frontend User fields to DB columns if necessary
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', id);
    if (error) throw error;
  },

  createUserProfileDirectly: async (userData: { email: string, name: string, role: UserRole }) => {
    // Note: Usually auth.signUp handles creation, but admins might create users directly via Edge Functions
    // For this client-side demo, we rely on auth.signUp for creation
    throw new Error("Creation should happen via Auth Sign Up");
  }
};

// --- CASES ---

export const dbCases = {
  getAll: async (): Promise<Case[]> => {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        documents (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((c: any) => ({
      id: c.id,
      title: c.title,
      clientId: c.client_id,
      status: c.status,
      description: c.description,
      createdAt: new Date(c.created_at).toISOString().split('T')[0],
      documents: c.documents ? c.documents.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type as DocType,
        uploadDate: new Date(d.upload_date).toISOString().split('T')[0],
        size: d.size
      })) : []
    }));
  },

  create: async (caseData: { title: string, clientId: string, description: string }) => {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        title: caseData.title,
        client_id: caseData.clientId,
        description: caseData.description,
        status: 'Abierto'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// --- DOCUMENTS (STORAGE + DB) ---

export const dbDocuments = {
  upload: async (caseId: string, file: File, type: DocType) => {
    // 1. Upload to Storage
    const filePath = `${caseId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // 3. Insert into DB
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert({
        case_id: caseId,
        name: file.name,
        type: type,
        url: publicUrl,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return data;
  }
};

// --- EVENTS ---

export const dbEvents = {
  getAll: async (): Promise<LegalEvent[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    return data.map((e: any) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      type: e.type as EventType,
      caseId: e.case_id || '',
      description: e.description
    }));
  },

  create: async (evt: Partial<LegalEvent>) => {
    const { error } = await supabase
      .from('events')
      .insert({
        title: evt.title,
        date: evt.date,
        time: evt.time,
        type: evt.type,
        case_id: evt.caseId || null,
        description: evt.description
      });
    
    if (error) throw error;
  }
};
