import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import ClientPage from './pages/ClientPage'
import WorkerPage from './pages/WorkerPage'
import AdminPage from './pages/AdminPage'

function Router() {
  const { profile, loading } = useAuth()
  if (loading) return <div style={{minHeight:'100vh',background:'#0d1b2a',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:32,height:32,border:'2px solid #243a52',borderTop:'2px solid #0abf8f',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>
  if (!profile) return <Routes><Route path="*" element={<AuthPage/>}/></Routes>
  const home = profile.role==='worker'?'/worker':profile.role==='admin'?'/admin':'/'
  return (
    <Routes>
      <Route path="/" element={profile.role==='client'?<ClientPage/>:<Navigate to={home}/>}/>
      <Route path="/worker" element={profile.role==='worker'?<WorkerPage/>:<Navigate to={home}/>}/>
      <Route path="/admin" element={profile.role==='admin'?<AdminPage/>:<Navigate to={home}/>}/>
      <Route path="*" element={<Navigate to={home}/>}/>
    </Routes>
  )
}
export default function App() {
  return <BrowserRouter><AuthProvider><Router/></AuthProvider></BrowserRouter>
}
