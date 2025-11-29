import { createClient } from '@supabase/supabase-js';

// URL de tu proyecto Supabase
export const SUPABASE_URL = 'https://dsefhbypnupwkrcmscjl.supabase.co';

// Clave Pública Anónima (ANON_KEY)
// Esta clave es segura para usar en el navegador siempre y cuando tengas configuradas tus políticas RLS (Row Level Security) en Supabase.
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZWZoYnlwbnVwd2tyY21zY2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNDExMDksImV4cCI6MjA3OTkxNzEwOX0.RrEacd6VjBt6vBFQwD593c1HEaHWpnSAAVZIMD2eA0A';

// Crear y exportar el cliente de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);