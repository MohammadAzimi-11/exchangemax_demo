import { BrowserRouter } from 'react-router'
import './App.css'
import { FormCacheProvider } from './context/FormCacheContext.jsx'
import PortalRoutes from './features/router/PortalRoutes.jsx'

function App() {
  return (
    <FormCacheProvider>
      <BrowserRouter>
        <PortalRoutes />
      </BrowserRouter>
    </FormCacheProvider>
  )
}

export default App
