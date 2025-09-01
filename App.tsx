import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AdminLogin from '@/pages/AdminLogin';
import AdminPanel from '@/pages/AdminPanel';
import StoryDetail from '@/pages/StoryDetail';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      <AuthContext.Provider
        value={{ isAuthenticated, setIsAuthenticated, logout }}
      >
        <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/story/:id" element={<StoryDetail />} />
           <Route path="/category/:categoryId" element={<CategoryPage />} />
           <Route path="/admin/login" element={<AdminLogin />} />
           <Route path="/admin/*" element={<AdminPanel />} />
           <Route path="*" element={<div className="text-center text-xl py-10">Page not found</div>} />
        </Routes>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
