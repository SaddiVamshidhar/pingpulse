import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import MonitorForm from './pages/MonitorForm.jsx';
import MonitorDetail from './pages/MonitorDetail.jsx';
import StatusPage from './pages/StatusPage.jsx';

const App = () => (
  <>
    <nav className="navbar">
      <NavLink to="/" className="brand">
        <span className="pulse-dot" /> PingPulse
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/new">Add Monitor</NavLink>
        <NavLink to="/status">Status Page</NavLink>
      </div>
    </nav>
    <main className="container">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<MonitorForm />} />
        <Route path="/edit/:id" element={<MonitorForm />} />
        <Route path="/monitor/:id" element={<MonitorDetail />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </main>
  </>
);

export default App;
