import { Toaster } from "@/components/ui"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from '@/pages/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { CartProvider } from '@/lib/CartContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Personalizar from '@/pages/Personalizar';
import Coleccion from '@/pages/Coleccion';
import Intranet from '@/pages/Intranet';
import Login from '@/pages/Login';
import Cart from '@/pages/Cart';
import React, { useEffect } from 'react';

import ProtectedRoute from '@/components/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white gap-4 p-8">
          <p className="text-red-400 font-mono text-sm">Error: {this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })} className="px-4 py-2 bg-gold text-black rounded font-mono text-xs">Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, authChecked } = useAuth();

  if (isLoadingAuth && !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-obsidian">
        <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/personalizar" element={<Personalizar />} />
        <Route path="/coleccion" element={<Coleccion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requireEmployee={true} unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/intranet" element={<Intranet />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <ScrollToTop />
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App