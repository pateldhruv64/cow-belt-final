import React, { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import MLInsights from "./pages/MLInsights";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      switch (path) {
        case '/ml-insights':
          setCurrentPage('ml-insights');
          break;
        case '/reports':
          setCurrentPage('reports');
          break;
        case '/users':
          setCurrentPage('users');
          break;
        case '/settings':
          setCurrentPage('settings');
          break;
        default:
          setCurrentPage('dashboard');
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'ml-insights':
        return <MLInsights />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="App">
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;