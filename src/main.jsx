import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// ONLY put <BrowserRouter> here if NOT in App.jsx!

import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
