import React, { useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_CASES, APP_NAME } from './constants';
import { User, UserRole, Case, DocType, Document, ViewState } from './types';
import { Button3D, Input3D, Card3D, Badge, Select3D } from './components/UIComponents';
import { LegalAssistant } from './components/LegalAssistant';

// --- SUB-COMPONENTS DEFINED OUTSIDE APP TO PREVENT RE-RENDER FOCUS LOSS ---

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
         <Button3D 
          variant="ghost" 
          className="w-full text-left justify-start"
          onClick={() => setViewState({ currentView: 'DASHBOARD' })}
         >
          Dashboard
         </Button3D>
      )}
      
      {currentUser?.role === UserRole.ADMIN && (
        <Button3D 
          variant="ghost" 
          className="w-full text-left"
          onClick={() => setViewState({ currentView: 'USERS' })}
        >
          Usuarios
        </Button3D>
      )}

      <Button3D 
        variant="ghost" 
        className="w-full text-left"
        onClick={() => setViewState({ currentView: 'CASES' })}
      >
        Expedientes
      </Button3D>
    </nav>

    <div className="p-4 border-t border-slate-800">
      <div className="flex items-center gap-3 mb-4">
        <img src={currentUser?.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full border border-legal-gold" />
        <div>
          <p className="text-sm font-bold text-slate-200">{currentUser?.name}</p>
          <p className="text-xs text-legal-gold">{currentUser?.role}</p>
        </div>
      </div>
      <Button3D variant="danger" className="w-full text-xs" onClick={handleLogout}>Cerrar Sesión</Button3D>
    </div>
  </div>
);

const LoginView = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  loginError, 
  handleLogin 
}: {
  email: string, 
  setEmail: (val: string) => void, 
  password: string, 
  setPassword: (val: string) => void,
  loginError: string,
  handleLogin: (e: React.FormEvent) => void
}) => (
  <div className="min-h-screen flex items-center justify-center bg-[#050505] perspective-1000 overflow-hidden relative">
      {/* Abstract 3D Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-legal-gold/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md transform transition-all duration-700 hover:rotate-y-1">
        <Card3D className="border-t-4 border-t-legal-gold">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-white mb-2">{APP_NAME}</h2>
            <p className="text-slate-400 text-sm">Acceso Seguro a Expedientes</p>
          </div>
          
          <form onSubmit={handleLogin}>
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

            <Button3D type="submit" className="w-full mt-4">Entrar al Sistema</Button3D>
            
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

const UsersView = ({ 
  users, 
  currentUser, 
  toggleUserStatus,
  onAddUser,
  onEditUser,
  onDeleteUser
}: {
  users: User[],
  currentUser: User | null,
  toggleUserStatus: (id: string) => void,
  onAddUser: (data: { name: string, email: string, role: UserRole }) => void,
  onEditUser: (id: string, data: { name: string, email: string, role: UserRole }) => void,
  onDeleteUser: (id: string) => void
}) => {
  const [formState, setFormState] = useState({ name: '', email: '', role: UserRole.CLIENT });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email) return;

    if (editingId) {
        onEditUser(editingId, formState);
        setSuccessMsg('Usuario actualizado correctamente');
    } else {
        onAddUser(formState);
        setSuccessMsg('Usuario guardado exitosamente');
    }

    // Reset Form
    setFormState({ name: '', email: '', role: UserRole.CLIENT });
    setEditingId(null);

    // Clear msg
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditClick = (user: User) => {
    setFormState({ name: user.name, email: user.email, role: user.role });
    setEditingId(user.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormState({ name: '', email: '', role: UserRole.CLIENT });
    setEditingId(null);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
        onDeleteUser(id);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-end pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-serif text-white">Administración de Usuarios</h2>
          <p className="text-slate-400 text-sm mt-1">Gestión de acceso para empleados y clientes.</p>
        </div>
      </div>

      {/* User Form (Add/Edit) */}
      <Card3D className={`border-l-4 ${editingId ? 'border-l-blue-500' : 'border-l-legal-gold'}`}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className={`text-xl ${editingId ? 'text-blue-500' : 'text-legal-gold'}`}>
             {editingId ? '✎' : '+'}
          </span> 
          {editingId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
        </h3>
        
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-500/50 rounded-lg flex items-center gap-2 text-emerald-400 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input3D 
            label="Nombre Completo" 
            name="name" 
            value={formState.name} 
            onChange={(e) => setFormState({...formState, name: e.target.value})} 
            placeholder="Ej. Dr. Roberto..." 
          />
          <Input3D 
            label="Correo Electrónico" 
            name="email" 
            value={formState.email} 
            onChange={(e) => setFormState({...formState, email: e.target.value})} 
            placeholder="correo@ejemplo.com" 
          />
          <Select3D 
            label="Rol de Usuario" 
            name="role"
            value={formState.role} 
            onChange={(e) => setFormState({...formState, role: e.target.value as UserRole})} 
            options={[
              { label: 'Cliente', value: UserRole.CLIENT },
              { label: 'Empleado', value: UserRole.EMPLOYEE },
              { label: 'Administrador', value: UserRole.ADMIN },
            ]}
          />
          <div className="md:col-span-3 flex justify-end gap-2">
            {editingId && (
                <Button3D type="button" variant="ghost" onClick={handleCancelEdit}>Cancelar</Button3D>
            )}
            <Button3D type="submit" variant={editingId ? 'primary' : 'primary'}>
                {editingId ? 'Guardar Cambios' : 'Dar de Alta'}
            </Button3D>
          </div>
        </form>
      </Card3D>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <Card3D key={user.id} className="flex flex-col items-center text-center">
             <div className="relative mb-4">
                <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full border-2 border-slate-700 shadow-lg object-cover" />
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
             </div>
             <h3 className="font-bold text-lg text-white">{user.name}</h3>
             <p className="text-slate-400 text-sm mb-4">{user.email}</p>
             <div className="mb-6">
               <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono uppercase text-legal-gold border border-legal-gold/20">
                 {user.role}
               </span>
             </div>
             
             {user.id !== currentUser?.id && (
                <div className="w-full flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Button3D 
                            variant="ghost"
                            className="text-xs border border-white/10"
                            onClick={() => handleEditClick(user)}
                        >
                            ✏️ Editar
                        </Button3D>
                        <Button3D 
                            variant="danger"
                            className="text-xs"
                            onClick={() => handleDeleteClick(user.id)}
                        >
                            🗑️ Eliminar
                        </Button3D>
                    </div>
                    <Button3D 
                        variant={user.isActive ? 'danger' : 'success'}
                        onClick={() => toggleUserStatus(user.id)}
                        className="w-full text-xs"
                    >
                        {user.isActive ? 'Desactivar Acceso' : 'Activar Acceso'}
                    </Button3D>
                </div>
             )}
          </Card3D>
        ))}
      </div>
    </div>
  );
};

const CasesView = ({ 
  currentUser, 
  cases, 
  users, 
  handleAddCase, 
  handleUploadDocument 
}: {
  currentUser: User | null,
  cases: Case[],
  users: User[],
  handleAddCase: (e: React.FormEvent<HTMLFormElement>) => void,
  handleUploadDocument: (caseId: string, e: React.ChangeEvent<HTMLInputElement>, type: DocType) => void
}) => {
  // Clients only see their own cases
  const filteredCases = currentUser?.role === UserRole.CLIENT 
    ? cases.filter(c => c.clientId === currentUser.id)
    : cases;

  const clients = users.filter(u => u.role === UserRole.CLIENT);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-end pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-serif text-white">Expedientes</h2>
          <p className="text-slate-400 text-sm mt-1">Gestión documental y estado procesal.</p>
        </div>
      </div>

      {/* Create Case Form (Only Employee/Admin) */}
      {currentUser?.role !== UserRole.CLIENT && (
        <Card3D className="mb-8 border-l-4 border-l-legal-gold">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-legal-gold text-xl">+</span> Nuevo Expediente
          </h3>
          <form onSubmit={handleAddCase} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input3D label="Título del Caso" name="title" value="" onChange={() => {}} placeholder="Ej. Divorcio..." />
            <Select3D 
              label="Cliente Asignado" 
              value="" 
              onChange={() => {}} 
              options={[
                { label: 'Seleccione un cliente', value: '' },
                ...clients.map(c => ({ label: c.name, value: c.id }))
              ]}
              name="clientId"
            />
             <div className="md:col-span-2">
                <Input3D label="Descripción" name="description" value="" onChange={() => {}} placeholder="Detalles iniciales..." />
             </div>
             <div className="md:col-span-2 flex justify-end">
                <Button3D type="submit">Crear Expediente</Button3D>
             </div>
          </form>
        </Card3D>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredCases.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No hay expedientes asignados.</div>
        ) : (
          filteredCases.map(c => (
            <Card3D key={c.id} className="group">
               <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-legal-gold transition-colors">{c.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{c.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                       <span>Creado: {c.createdAt}</span>
                       <span>ID: {c.id}</span>
                       <span>Cliente: {users.find(u => u.id === c.clientId)?.name}</span>
                    </div>
                  </div>
                  <Badge active={c.status === 'En Proceso' || c.status === 'Abierto'} text={c.status} />
               </div>

               {/* Documents Section */}
               <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documentación Legal</h4>
                  
                  <div className="space-y-2">
                    {c.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700 text-legal-gold">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-slate-200 font-medium">{doc.name}</p>
                              <p className="text-xs text-slate-500">{doc.type} • {doc.size} • {doc.uploadDate}</p>
                            </div>
                         </div>
                         <button className="text-legal-accent hover:text-white text-xs font-bold uppercase">Ver</button>
                      </div>
                    ))}
                  </div>

                  {/* Upload Area (Only Employee/Admin) */}
                  {currentUser?.role !== UserRole.CLIENT && (
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="relative overflow-hidden group/upload">
                          <label className="flex items-center justify-center w-full h-10 border border-dashed border-slate-600 rounded cursor-pointer hover:border-legal-gold hover:bg-legal-gold/10 transition-all">
                             <span className="text-xs text-slate-400 group-hover/upload:text-legal-gold">Subir Demanda</span>
                             <input type="file" className="hidden" onChange={(e) => handleUploadDocument(c.id, e, DocType.DEMANDA)} />
                          </label>
                       </div>
                       <div className="relative overflow-hidden group/upload">
                          <label className="flex items-center justify-center w-full h-10 border border-dashed border-slate-600 rounded cursor-pointer hover:border-legal-gold hover:bg-legal-gold/10 transition-all">
                             <span className="text-xs text-slate-400 group-hover/upload:text-legal-gold">Subir Documento</span>
                             <input type="file" className="hidden" onChange={(e) => handleUploadDocument(c.id, e, DocType.OTRO)} />
                          </label>
                       </div>
                    </div>
                  )}
               </div>
            </Card3D>
          ))
        )}
      </div>
    </div>
  );
};


function App() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Mock password check
  const [loginError, setLoginError] = useState('');

  // View State
  const [viewState, setViewState] = useState<ViewState>({ currentView: 'LOGIN' });

  // --- HANDLERS ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email);
    
    if (user) {
      if (!user.isActive) {
        setLoginError('Cuenta desactivada. Contacte al administrador.');
        return;
      }
      // Simple mock authentication success
      setCurrentUser(user);
      setViewState({ 
        currentView: user.role === UserRole.CLIENT ? 'CASES' : 'DASHBOARD' 
      });
      setLoginError('');
    } else {
      setLoginError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setViewState({ currentView: 'LOGIN' });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) return { ...u, isActive: !u.isActive };
      return u;
    }));
  };

  const addUser = (userData: { name: string, email: string, role: UserRole }) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isActive: true,
      avatarUrl: `https://picsum.photos/200/200?random=${Date.now()}`
    };

    setUsers(prev => [...prev, newUser]);
  };

  const editUser = (id: string, userData: { name: string, email: string, role: UserRole }) => {
    setUsers(prev => prev.map(u => {
        if (u.id === id) {
            return { ...u, ...userData };
        }
        return u;
    }));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddCase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newCase: Case = {
      id: `c${Date.now()}`,
      title: formData.get('title') as string,
      clientId: formData.get('clientId') as string,
      status: 'Abierto',
      description: formData.get('description') as string,
      createdAt: new Date().toISOString().split('T')[0],
      documents: []
    };

    setCases(prev => [...prev, newCase]);
    form.reset();
  };

  const handleUploadDocument = (caseId: string, e: React.ChangeEvent<HTMLInputElement>, type: DocType) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: Document = {
        id: `d${Date.now()}`,
        name: file.name,
        type: type,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      };

      setCases(prev => prev.map(c => {
        if (c.id === caseId) {
          return { ...c, documents: [...c.documents, newDoc] };
        }
        return c;
      }));
    }
  };

  // --- RENDER ---

  if (!currentUser || viewState.currentView === 'LOGIN') {
    return (
      <LoginView 
        email={email} 
        setEmail={setEmail} 
        password={password} 
        setPassword={setPassword} 
        loginError={loginError} 
        handleLogin={handleLogin} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-legal-gold selection:text-black">
      <Sidebar 
        currentUser={currentUser} 
        setViewState={setViewState} 
        handleLogout={handleLogout} 
      />
      <main className="ml-64 p-8 min-h-screen relative overflow-hidden">
        {/* Background Gradients for Main Area */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
           <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-legal-gold/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {viewState.currentView === 'DASHBOARD' && (
             <div className="animate-[fadeIn_0.5s_ease-out]">
                <h2 className="text-3xl font-serif text-white mb-8">Dashboard General</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   <Card3D className="bg-gradient-to-br from-blue-900/40 to-slate-900/40">
                      <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-2">Expedientes Activos</h3>
                      <p className="text-4xl font-serif text-white">{cases.filter(c => c.status === 'En Proceso').length}</p>
                   </Card3D>
                   <Card3D className="bg-gradient-to-br from-purple-900/40 to-slate-900/40">
                      <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-2">Clientes Activos</h3>
                      <p className="text-4xl font-serif text-white">{users.filter(u => u.role === UserRole.CLIENT && u.isActive).length}</p>
                   </Card3D>
                   <Card3D className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40">
                      <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-2">Documentos Totales</h3>
                      <p className="text-4xl font-serif text-white">{cases.reduce((acc, c) => acc + c.documents.length, 0)}</p>
                   </Card3D>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <Card3D>
                      <h3 className="font-bold text-white mb-4">Actividad Reciente</h3>
                      <ul className="space-y-4 text-sm text-slate-400">
                        <li className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                           <span>Nuevo expediente creado: <strong>{cases[0]?.title}</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                           <span>Documento cargado por <strong>Lic. Ana Martinez</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-legal-gold"></div>
                           <span>Usuario cliente activado: <strong>Juan Perez</strong></span>
                        </li>
                      </ul>
                   </Card3D>
                </div>
             </div>
          )}
          {viewState.currentView === 'USERS' && (
            <UsersView 
              users={users} 
              currentUser={currentUser} 
              toggleUserStatus={toggleUserStatus}
              onAddUser={addUser}
              onEditUser={editUser}
              onDeleteUser={deleteUser}
            />
          )}
          {viewState.currentView === 'CASES' && (
            <CasesView 
              currentUser={currentUser} 
              cases={cases} 
              users={users} 
              handleAddCase={handleAddCase} 
              handleUploadDocument={handleUploadDocument} 
            />
          )}
        </div>
      </main>
      
      {/* Legal AI Assistant - Available for Employees/Admin to help with work */}
      {currentUser.role !== UserRole.CLIENT && <LegalAssistant />}
    </div>
  );
}

export default App;