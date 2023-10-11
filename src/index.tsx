import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './containers/App';

import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);

  reportWebVitals();
}
