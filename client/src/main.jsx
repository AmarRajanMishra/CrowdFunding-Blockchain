import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import { StateContextProvider } from './context';
import { Sepolia } from "@thirdweb-dev/chains";

import App from './App'
import './index.css'

// CrowdFunding Project Using BlckChain Concept
const root = ReactDOM.createRoot(document.getElementById('root'));
// Here am using client id to fetch backend concept
root.render(
    <ThirdwebProvider activeChain={ Sepolia } clientId='24ad784323540be25d710af2f5afd569'> 
    <Router>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </ThirdwebProvider> 
)
