import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Hello from create-user function!")

serve(async (req) => {
  // 1. Configuración de CORS (Permite que tu página web llame a esta función)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  try {
    // 2. Crear cliente de Supabase con permisos de Super Administrador (Service Role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Leer los datos que envía el formulario de React
    const { email, password, name, phone, role } = await req.json()

    // 4. Crear el usuario en el sistema de Autenticación
    const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password,
      email_confirm: true, // Esto confirma el correo automáticamente para que puedan entrar ya
      user_metadata: { name }
    })

    if (authError) {
      throw authError
    }

    // 5. Actualizar la tabla de perfiles con el Rol y Teléfono
    if (userAuth.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          phone: phone,
          role: role || 'CLIENT'
        })
        .eq('id', userAuth.user.id)
      
      if (profileError) {
        console.error("Error al actualizar perfil:", profileError)
      }
    }

    return new Response(
      JSON.stringify({ message: "Usuario creado exitosamente", user: userAuth.user }),
      { 
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } 
      },
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
    })
  }
})