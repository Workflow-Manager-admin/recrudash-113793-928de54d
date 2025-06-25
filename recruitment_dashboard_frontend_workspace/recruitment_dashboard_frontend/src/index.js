import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { supabase } from './supabaseClient';

// Expose supabase for Navbar dev/demo role-switching (not for production real-world use)
window.supabase = supabase;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
