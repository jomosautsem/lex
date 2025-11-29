
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';
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
        data: { name }
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
      phone: data.phone, // Map phone
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
      phone: u.phone, // Map phone
      role: u.role as UserRole,
      isActive: u.is_active,
      avatarUrl: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=cca43b&color=0f172a`
    }));
  },

  updateUser: async (id: string, updates: Partial<User>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', id);
    if (error) throw error;
  },

  // "Ghost Client" Strategy: Creates a user using a temporary, non-persisting client.
  // This avoids logging out the main admin user and avoids CORS errors from Edge Functions.
  adminCreateUser: async (userData: { email: string, name: string, phone: string, role: string, password?: string }) => {
    // 1. Create a temporary client configuration that DOES NOT persist session to localStorage
    const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false, // Vital: prevents overwriting the admin's session
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });

    // 2. Use the provided password or fallback to a temp one (though UI enforces input)
    const passwordToUse = userData.password || Math.random().toString(36).slice(-8) + "Aa1!";

    // 3. Register the user using the temporary client
    const { data, error } = await tempClient.auth.signUp({
        email: userData.email,
        password: passwordToUse,
        options: {
            data: { name: userData.name }
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error("No se pudo crear el usuario (Auth response empty)");

    // 4. Update the profile with extra details (Role, Phone) using the ADMIN's authenticated client
    // We wait a moment for the database trigger to create the initial profile row
    await new Promise(resolve => setTimeout(resolve, 500));

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            phone: userData.phone,
            role: userData.role
        })
        .eq('id', data.user.id);

    // If update fails (e.g. trigger didn't run fast enough), we upsert to ensure data integrity
    if (updateError) {
        console.warn("Update failed, attempting upsert...", updateError);
        await supabase.from('profiles').upsert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            role: userData.role
        });
    }

    return data.user;
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
        size: d.size,
        url: d.url
      })) : []
    }));
  },

  create: async (caseData: { title: string, clientId: string, description: string, status?: string }) => {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        title: caseData.title,
        client_id: caseData.clientId,
        description: caseData.description,
        status: caseData.status || 'Abierto'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Case>) => {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.clientId) dbUpdates.client_id = updates.clientId;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.status) dbUpdates.status = updates.status;

    const { error } = await supabase.from('cases').update(dbUpdates).eq('id', id);
    if (error) throw error;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('cases').delete().eq('id', id);
    if (error) throw error;
  }
};

// --- DOCUMENTS (STORAGE + DB) ---

export const dbDocuments = {
  upload: async (caseId: string, file: File, type: DocType) => {
    const filePath = `${caseId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

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
