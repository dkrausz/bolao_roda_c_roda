import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
        <span className="nav-icon">🏆</span>
        <span className="nav-label">Ranking</span>
      </NavLink>
      <NavLink to="/jogos" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
        <span className="nav-icon">⚽</span>
        <span className="nav-label">Jogos</span>
      </NavLink>
    </nav>
  );
}
