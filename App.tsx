
import React, { useState, useEffect } from 'react';
import { APP_NAME } from './constants';
import { User, UserRole, Case, DocType, Document, ViewState, LegalEvent, EventType } from './types';
import { Button3D, Input3D, Card3D, Badge, Select3D } from './components/UIComponents';
import { LegalAssistant } from './components/LegalAssistant';
import { dbAuth, dbCases, dbDocuments, dbEvents, dbEvents as dbAgenda } from './services/dbService';

// --- SUB-COMPONENTS ---

// v2.0 Real File Viewer
const FileViewerModal = ({ 
  document, 
  caseTitle, 
  onClose 
}: { 
  document: Document | null, 
  caseTitle: string, 
  onClose: () => void 
}) => {
  if (!document) return null;

  const isPdf = document.name.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.name);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col bg-legal-900 border border-legal-gold/30 rounded-xl shadow-2xl overflow-hidden relative">
        <div className="p-4 bg-legal-800 border-b border-white/10 flex justify-between items-center shrink-0">
           <div>
              <h3 className="text-legal-gold font-serif font-bold text-lg">{document.name}</h3>
              <p className="text-xs text-slate-400">Expediente: {caseTitle} • {document.size}</p>
           </div>
           <div className="flex gap-2">
             {document.url && (
               <a 
                 href={document.url} 
                 target="_blank" 
                 rel="noreferrer"
                 className="px-3 py-1 bg-legal-700 hover:bg-legal-600 text-white text-xs rounded transition-colors flex items-center"
               >
                 Descargar
               </a>
             )}
             <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
             >
                ✕
             </button>
           </div>
        </div>
        <div className="flex-1 bg-[#1e293b] flex items-center justify-center overflow-hidden">
             {document.url ? (
               <>
                 {isPdf ? (
                   <iframe 
                     src={document.url} 
                     className="w-full h-full border-none" 
                     title="PDF Viewer"
                   />
                 ) : isImage ? (
                   <img 
                     src={document.url} 
                     alt={document.name} 
                     className="max-w-full max-h-full object-contain"
                   />
                 ) : (
                   <div className="text-center p-10">
                     <div className="mb-4 text-6xl">📄</div>
                     <p className="text-white text-lg mb-4">Vista previa no disponible para este formato.</p>
                     <a 
                       href={document.url} 
                       target="_blank" 
                       rel="noreferrer"
                       className="text-legal-gold hover:underline"
                     >
                       Click aquí para descargar y ver el archivo
                     </a>
                   </div>
                 )}
               </>
             ) : (
               <div className="text-center text-red-400">
                 <p>Error: URL del documento no encontrada.</p>
               </div>
             )}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ 
  currentUser, 
  setViewState, 
  handleLogout 
}: { 
  currentUser: User | null, 
  setViewState: (vs: ViewState) => void, 
  handleLogout: () => void 
}) => (
  <div className="w-64 bg-legal-900 border-r border-slate-800 flex flex-col fixed h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
    <div className="p-6 border-b border-slate-800">
      <h1 className="font-serif text-xl font-bold text-legal-gold tracking-widest">{APP_NAME}</h1>
      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Sistema Integral</p>
    </div>
    
    <nav className="flex-1 p-4 space-y-2">
      {currentUser?.role !== UserRole.CLIENT && (
         <Button3D variant="ghost" className="w-full text-left justify-start" onClick={() => setViewState({ currentView: 'DASHBOARD' })}>
          Dashboard
         </Button3D>
      )}
      
      {currentUser?.role === UserRole.ADMIN && (
        <Button3D variant="ghost" className="w-full text-left" onClick={() => setViewState({ currentView: 'USERS' })}>
          Usuarios
        </Button3D>
      )}

      <Button3D variant="ghost" className="w-full text-left" onClick={() => setViewState({ currentView: 'CASES' })}>
        Expedientes
      </Button3D>

      {currentUser?.role !== UserRole.CLIENT && (
        <Button3D variant="ghost" className="w-full text-left" onClick={() => setViewState({ currentView: 'CALENDAR' })}>
          Agenda Procesal
        </Button3D>
      )}
    </nav>

    <div className="p-4 border-t border-slate-800">
      <div className="flex items-center gap-3 mb-4">
        <img src={currentUser?.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full border border-legal-gold" />
        <div>
          <p className="text-sm font-bold text-slate-200 truncate w-32">{currentUser?.name}</p>
          <p className="text-xs text-legal-gold">{currentUser?.role}</p>
        </div>
      </div>
      <Button3D variant="danger" className="w-full text-xs" onClick={handleLogout}>Cerrar Sesión</Button3D>
    </div>
  </div>
);

const LoginView = ({ 
  email, setEmail, 
  password, setPassword, 
  name, setName,
  loginError,
  setLoginError,
  handleLogin,
  handleRegister,
  isRegistering,
  setIsRegistering
}: {
  email: string, setEmail: (val: string) => void, 
  password: string, setPassword: (val: string) => void,
  name: string, setName: (val: string) => void,
  loginError: string,
  setLoginError: (val: string) => void,
  handleLogin: (e: React.FormEvent) => void,
  handleRegister: (e: React.FormEvent) => void,
  isRegistering: boolean,
  setIsRegistering: (val: boolean) => void
}) => (
  <div className="min-h-screen flex items-center justify-center bg-[#050505] perspective-1000 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-legal-gold/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md transform transition-all duration-700 hover:rotate-y-1">
        <Card3D className="border-t-4 border-t-legal-gold">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-white mb-2">{APP_NAME}</h2>
            <p className="text-slate-400 text-sm">{isRegistering ? 'Crear Nueva Cuenta' : 'Acceso Seguro a Expedientes'}</p>
          </div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <Input3D 
                label="Nombre Completo" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ej. Lic. Roberto..."
              />
            )}

            <Input3D 
              label="Correo Electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="usuario@lexcorp.com"
            />
            <Input3D 
              label="Contraseña" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
            
            {loginError && (
              <div className="p-3 mb-4 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs text-center">
                {loginError}
              </div>
            )}

            <Button3D type="submit" className="w-full mt-4">
              {isRegistering ? 'Registrarse' : 'Entrar al Sistema'}
            </Button3D>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <button 
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setLoginError(''); }}
                className="text-sm text-legal-gold hover:underline"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-600">
                Acceso restringido. Su IP ha sido registrada.
              </p>
            </div>
          </form>
        </Card3D>
      </div>
  </div>
);

const CalendarView = ({
  events,
  cases,
  onAddEvent
}: {
  events: LegalEvent[],
  cases: Case[],
  onAddEvent: (evt: any) => void
}) => {
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: EventType.AUDIENCIA, caseId: '', description: '' });

  const getEventStatusColor = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const eventDate = new Date(dateStr);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) return "border-l-slate-500 bg-slate-900/50 opacity-60";
    if (diffDays <= 2) return "border-l-red-500 bg-red-900/10 shadow-[0_0_15px_rgba(220,38,38,0.1)]";
    if (diffDays <= 7) return "border-l-yellow-500 bg-yellow-900/10";
    return "border-l-emerald-500 bg-emerald-900/10";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newEvent.title && newEvent.date && newEvent.time) {
      onAddEvent(newEvent);
      setNewEvent({ title: '', date: '', time: '', type: EventType.AUDIENCIA, caseId: '', description: '' });
    }
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
       <div className="flex justify-between items-end pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-serif text-white">Agenda Procesal</h2>
          <p className="text-slate-400 text-sm mt-1">Control de Términos, Audiencias y Vencimientos.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
           <Card3D className="sticky top-8 border-l-4 border-l-blue-500">
              <h3 className="font-bold text-white mb-4">Agendar Evento</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <Input3D label="Título" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Ej. Audiencia" />
                 <div className="grid grid-cols-2 gap-2">
                    <Input3D label="Fecha" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                    <Input3D label="Hora" type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                 </div>
                 <Select3D label="Tipo" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})} options={[{ label: 'Audiencia', value: EventType.AUDIENCIA }, { label: 'Vencimiento', value: EventType.TERMINO }, { label: 'Reunión', value: EventType.REUNION }, { label: 'Otro', value: EventType.OTRO }]} />
                 <Select3D label="Vincular a Expediente" value={newEvent.caseId} onChange={e => setNewEvent({...newEvent, caseId: e.target.value})} options={[{ label: 'Ninguno / General', value: '' }, ...cases.map(c => ({ label: c.title, value: c.id }))]} />
                 <Input3D label="Descripción" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                 <Button3D type="submit" className="w-full">Guardar</Button3D>
              </form>
           </Card3D>
        </div>
        <div className="lg:col-span-2 space-y-6 relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-800"></div>
            {sortedEvents.map(evt => (
                <div key={evt.id} className="relative pl-12 group">
                    <div className="absolute left-[11px] top-6 w-3 h-3 rounded-full bg-legal-gold border-2 border-slate-900 z-10 group-hover:scale-125 transition-transform"></div>
                    <Card3D className={`border-l-4 ${getEventStatusColor(evt.date)}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold text-legal-gold uppercase tracking-wider mb-1 block">{evt.type} • {evt.time} hrs</span>
                                <h4 className="text-lg font-bold text-white">{evt.title}</h4>
                                <p className="text-sm text-slate-400 mt-1">{evt.description}</p>
                                {evt.caseId && <div className="mt-3 inline-block px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">Exp: {cases.find(c => c.id === evt.caseId)?.title || 'Caso'}</div>}
                            </div>
                            <div className="text-center bg-black/20 p-2 rounded border border-white/5">
                                <span className="block text-xl font-serif font-bold text-white">{new Date(evt.date).getDate()}</span>
                                <span className="block text-xs uppercase text-slate-500">{new Date(evt.date).toLocaleString('es-ES', { month: 'short' })}</span>
                            </div>
                        </div>
                    </Card3D>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const UsersView = ({ 
  users, currentUser, toggleUserStatus, onAddUser, onEditUser, onDeleteUser
}: any) => {
  const [formState, setFormState] = useState({ name: '', email: '', role: UserRole.CLIENT });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email) return;
    if (editingId) {
        onEditUser(editingId, formState);
        setSuccessMsg('Usuario actualizado');
    } else {
        onAddUser(formState);
        setSuccessMsg('Usuario guardado');
    }
    setFormState({ name: '', email: '', role: UserRole.CLIENT });
    setEditingId(null);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditClick = (user: User) => {
    setFormState({ name: user.name, email: user.email, role: user.role });
    setEditingId(user.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-2xl font-serif text-white mb-4">Administración de Usuarios</h2>
      <Card3D className={`border-l-4 ${editingId ? 'border-l-blue-500' : 'border-l-legal-gold'}`}>
        <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
        {successMsg && <div className="mb-4 text-emerald-400 text-sm">{successMsg}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input3D label="Nombre" value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} placeholder="Nombre" />
          <Input3D label="Email" value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} placeholder="Email" />
          <Select3D label="Rol" value={formState.role} onChange={(e) => setFormState({...formState, role: e.target.value as UserRole})} options={[{ label: 'Cliente', value: UserRole.CLIENT }, { label: 'Empleado', value: UserRole.EMPLOYEE }, { label: 'Admin', value: UserRole.ADMIN }]} />
          <div className="md:col-span-3 flex justify-end gap-2">
            {editingId && <Button3D type="button" variant="ghost" onClick={() => { setFormState({name:'',email:'',role:UserRole.CLIENT}); setEditingId(null); }}>Cancelar</Button3D>}
            <Button3D type="submit">{editingId ? 'Guardar Cambios' : 'Dar de Alta'}</Button3D>
          </div>
        </form>
      </Card3D>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: User) => (
          <Card3D key={user.id} className="flex flex-col items-center text-center">
             <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full mb-2" />
             <h3 className="font-bold text-white">{user.name}</h3>
             <p className="text-slate-400 text-sm mb-4">{user.email}</p>
             <span className="px-2 py-1 bg-slate-800 rounded text-xs text-legal-gold mb-4">{user.role}</span>
             {user.id !== currentUser?.id && (
                <div className="flex gap-2 w-full justify-center">
                    <Button3D variant="ghost" className="text-xs" onClick={() => handleEditClick(user)}>Editar</Button3D>
                    <Button3D variant={user.isActive ? 'danger' : 'success'} onClick={() => toggleUserStatus(user.id)} className="text-xs">
                        {user.isActive ? 'Desactivar' : 'Activar'}
                    </Button3D>
                    <Button3D variant="danger" className="text-xs" onClick={() => onDeleteUser(user.id)}>X</Button3D>
                </div>
             )}
          </Card3D>
        ))}
      </div>
    </div>
  );
};

const CasesView = ({ 
  currentUser, cases, users, handleAddCase, handleUploadDocument 
}: any) => {
  const [newCase, setNewCase] = useState({ title: '', clientId: '', description: '' });
  const [viewingDoc, setViewingDoc] = useState<{ doc: Document, caseTitle: string } | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCase.title && newCase.clientId && newCase.description) {
      handleAddCase(newCase);
      setNewCase({ title: '', clientId: '', description: '' });
    }
  };

  const filteredCases = currentUser?.role === UserRole.CLIENT ? cases.filter((c: Case) => c.clientId === currentUser.id) : cases;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {viewingDoc && <FileViewerModal document={viewingDoc.doc} caseTitle={viewingDoc.caseTitle} onClose={() => setViewingDoc(null)} />}
      <h2 className="text-2xl font-serif text-white">Expedientes</h2>
      {currentUser?.role !== UserRole.CLIENT && (
        <Card3D className="mb-8 border-l-4 border-l-legal-gold">
          <h3 className="text-lg font-bold text-white mb-4">+ Nuevo Expediente</h3>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input3D label="Título" value={newCase.title} onChange={(e) => setNewCase({ ...newCase, title: e.target.value })} placeholder="Ej. Divorcio..." />
            <Select3D label="Cliente" value={newCase.clientId} onChange={(e) => setNewCase({ ...newCase, clientId: e.target.value })} options={[{ label: 'Seleccionar', value: '' }, ...users.filter((u:User) => u.role === UserRole.CLIENT).map((c:User) => ({ label: c.name, value: c.id }))]} />
             <div className="md:col-span-2"><Input3D label="Descripción" value={newCase.description} onChange={(e) => setNewCase({ ...newCase, description: e.target.value })} placeholder="Detalles..." /></div>
             <div className="md:col-span-2 flex justify-end"><Button3D type="submit">Crear Expediente</Button3D></div>
          </form>
        </Card3D>
      )}
      <div className="grid grid-cols-1 gap-6">
          {filteredCases.map((c: Case) => (
            <Card3D key={c.id} className="group">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{c.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{c.description}</p>
                    <p className="text-xs text-slate-500 mt-2">Cliente: {users.find((u:User) => u.id === c.clientId)?.name}</p>
                  </div>
                  <Badge active={c.status === 'Abierto'} text={c.status} />
               </div>
               <div className="bg-black/20 rounded p-4 border border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Documentos</h4>
                  <div className="space-y-2">
                    {c.documents.map((doc: Document) => (
                      <div key={doc.id} className="flex justify-between p-2 hover:bg-white/5 rounded">
                         <span className="text-sm text-slate-200">{doc.name} <span className="text-xs text-slate-500">({doc.type})</span></span>
                         <button onClick={() => setViewingDoc({ doc, caseTitle: c.title })} className="text-legal-accent text-xs uppercase font-bold">Ver</button>
                      </div>
                    ))}
                  </div>
                  {currentUser?.role !== UserRole.CLIENT && (
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                       <label className="text-xs text-center border border-dashed border-slate-600 rounded p-2 cursor-pointer hover:border-legal-gold">
                          Subir Demanda <input type="file" className="hidden" onChange={(e) => handleUploadDocument(c.id, e, DocType.DEMANDA)} />
                       </label>
                       <label className="text-xs text-center border border-dashed border-slate-600 rounded p-2 cursor-pointer hover:border-legal-gold">
                          Subir Otro <input type="file" className="hidden" onChange={(e) => handleUploadDocument(c.id, e, DocType.OTRO)} />
                       </label>
                    </div>
                  )}
               </div>
            </Card3D>
          ))}
      </div>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [events, setEvents] = useState<LegalEvent[]>([]);
  
  // Login/Register State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [viewState, setViewState] = useState<ViewState>({ currentView: 'LOGIN' });

  // Initial Load & Auth Check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await dbAuth.getCurrentSession();
      if (session) {
        const profile = await dbAuth.getUserProfile(session.user.id);
        if (profile) setCurrentUser(profile);
      }
    };
    checkSession();
  }, []);

  // Fetch Data when User logs in
  useEffect(() => {
    if (currentUser) {
      setViewState({ currentView: currentUser.role === UserRole.CLIENT ? 'CASES' : 'DASHBOARD' });
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [uList, cList, eList] = await Promise.all([
        dbAuth.getAllUsers(),
        dbCases.getAll(),
        dbEvents.getAll()
      ]);
      setUsers(uList);
      setCases(cList);
      setEvents(eList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { data, error } = await dbAuth.signIn(email, password);
      if (error) throw error;
      if (data.session) {
        const profile = await dbAuth.getUserProfile(data.session.user.id);
        if (profile) {
            if(!profile.isActive) {
                setLoginError("Cuenta desactivada.");
                await dbAuth.signOut();
                return;
            }
            setCurrentUser(profile);
        } else {
             // Fallback if profile trigger hasn't run yet or failed
             setLoginError("Perfil no encontrado. Intente nuevamente.");
        }
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!name || !email || !password) {
        setLoginError("Todos los campos son obligatorios");
        return;
    }
    try {
        const { error } = await dbAuth.signUp(email, password, name);
        if (error) throw error;
        // Since email confirmation is usually required, we inform user
        setLoginError("Registro iniciado. Por favor revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
        setIsRegistering(false);
    } catch (err: any) {
        setLoginError(err.message || "Error al registrarse");
    }
  };

  const handleLogout = async () => {
    await dbAuth.signOut();
    setCurrentUser(null);
    setEmail(''); setPassword('');
    setViewState({ currentView: 'LOGIN' });
  };

  // --- CRUD WRAPPERS ---

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    try {
        await dbAuth.updateUser(userId, { isActive: !user.isActive });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) { console.error(err); }
  };

  const addUser = async (userData: { name: string, email: string, role: UserRole }) => {
      alert("Para agregar usuarios reales, pídales que se registren o use el panel de Supabase.");
  };

  const editUser = async (id: string, userData: any) => {
      try {
          await dbAuth.updateUser(id, userData);
          setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
      } catch (e) { console.error(e); }
  };

  const deleteUser = (id: string) => {
      alert("La eliminación de usuarios debe hacerse desde el panel de Supabase por seguridad.");
  };

  const handleAddCase = async (caseData: any) => {
    try {
        const newCase = await dbCases.create(caseData);
        if (newCase) {
             const list = await dbCases.getAll();
             setCases(list);
        }
    } catch (e) { console.error(e); }
  };

  const handleAddEvent = async (evtData: any) => {
    try {
        await dbAgenda.create(evtData);
        const list = await dbAgenda.getAll();
        setEvents(list);
    } catch (e) { console.error(e); }
  };

  const handleUploadDocument = async (caseId: string, e: React.ChangeEvent<HTMLInputElement>, type: DocType) => {
    if (e.target.files && e.target.files[0]) {
        try {
            await dbDocuments.upload(caseId, e.target.files[0], type);
            // Refresh cases to see new doc with URL
            const list = await dbCases.getAll();
            setCases(list);
        } catch (err) { console.error(err); }
    }
  };

  if (!currentUser || viewState.currentView === 'LOGIN') {
    return (
      <LoginView 
        email={email} setEmail={setEmail} 
        password={password} setPassword={setPassword} 
        name={name} setName={setName}
        loginError={loginError} 
        setLoginError={setLoginError}
        handleLogin={handleLogin} 
        handleRegister={handleRegister}
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-legal-gold selection:text-black">
      <Sidebar currentUser={currentUser} setViewState={setViewState} handleLogout={handleLogout} />
      <main className="ml-64 p-8 min-h-screen relative overflow-hidden">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
           <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-legal-gold/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {viewState.currentView === 'DASHBOARD' && (
             <div className="animate-[fadeIn_0.5s_ease-out]">
                <h2 className="text-3xl font-serif text-white mb-8">Dashboard General</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   <Card3D className="bg-gradient-to-br from-blue-900/40 to-slate-900/40"><h3 className="text-slate-400 text-xs uppercase mb-2">Expedientes</h3><p className="text-4xl font-serif text-white">{cases.length}</p></Card3D>
                   <Card3D className="bg-gradient-to-br from-purple-900/40 to-slate-900/40"><h3 className="text-slate-400 text-xs uppercase mb-2">Clientes</h3><p className="text-4xl font-serif text-white">{users.filter(u => u.role === UserRole.CLIENT).length}</p></Card3D>
                   <Card3D className="bg-gradient-to-br from-red-900/40 to-slate-900/40"><h3 className="text-slate-400 text-xs uppercase mb-2">Eventos</h3><p className="text-4xl font-serif text-white">{events.length}</p></Card3D>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <Card3D>
                      <h3 className="font-bold text-white mb-4">Actividad</h3>
                      <p className="text-sm text-slate-400">Sistema conectado a Supabase en tiempo real.</p>
                   </Card3D>
                   <Card3D className="border-t-2 border-t-red-500">
                      <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white">Próximos Vencimientos</h3><button onClick={() => setViewState({currentView: 'CALENDAR'})} className="text-xs text-legal-gold hover:underline">Ver Agenda</button></div>
                      <div className="space-y-3">
                        {events.slice(0, 3).map(e => (
                                <div key={e.id} className="flex gap-3 p-2 rounded bg-white/5 border border-white/5">
                                    <div className="text-center min-w-[3rem] px-1 py-1 bg-black/40 rounded"><div className="text-xs font-bold text-red-400">{new Date(e.date).getDate()}</div></div>
                                    <div><p className="text-sm font-bold text-slate-200">{e.title}</p></div>
                                </div>
                        ))}
                      </div>
                   </Card3D>
                </div>
             </div>
          )}
          {viewState.currentView === 'USERS' && <UsersView users={users} currentUser={currentUser} toggleUserStatus={toggleUserStatus} onAddUser={addUser} onEditUser={editUser} onDeleteUser={deleteUser} />}
          {viewState.currentView === 'CASES' && <CasesView currentUser={currentUser} cases={cases} users={users} handleAddCase={handleAddCase} handleUploadDocument={handleUploadDocument} />}
          {viewState.currentView === 'CALENDAR' && <CalendarView events={events} cases={cases} onAddEvent={handleAddEvent} />}
        </div>
      </main>
      {currentUser.role !== UserRole.CLIENT && <LegalAssistant />}
    </div>
  );
}

export default App;
