import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import DrillsPage from "./pages/DrillsPage";
import DrillDetailsPage from "./pages/DrillDetailsPage";
import FavouritesPage from "./pages/FavouritesPage";
import CoachPage from "./pages/CoachPage";
import "./App.css";

const TEST_USER_ID = 1;
const TEST_COACH_ID = 2;

export default function App() {
  return (
    <div className="appShell">
      <div className="container">
        <header className="topbar">
          <div className="brand">
            <div className="brandMark" aria-hidden="true" />
            <div className="brandText">
              <strong>CoachingHub</strong>
              <span>Drills • Favourites • Coach tools</span>
            </div>
          </div>

          <nav className="nav">
            <NavLink
              to="/drills"
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              Drills
            </NavLink>
            <NavLink
              to="/favs"
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              Favourites
            </NavLink>
            <NavLink
              to="/coach"
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              Coach
            </NavLink>
          </nav>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/drills" replace />} />
            <Route path="/drills" element={<DrillsPage userId={TEST_USER_ID} />} />
            <Route path="/drills/:id" element={<DrillDetailsPage />} />
            <Route path="/favs" element={<FavouritesPage userId={TEST_USER_ID} />} />
            <Route path="/coach" element={<CoachPage coachId={TEST_COACH_ID} />} />
          </Routes>

          <hr className="hr" />
          <div className="smallMuted">
            Test userId: <strong>{TEST_USER_ID}</strong> • Test coachId: <strong>{TEST_COACH_ID}</strong>
          </div>
        </main>
      </div>
    </div>
  );
}
