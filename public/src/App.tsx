import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//Importaciones de las paginas
import Index from './pages/index.tsx';
import Login from './pages/login.tsx';
import RegisProfe from './pages/regisProfe.tsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/regisProfe" element={<RegisProfe/>} />
      </Routes>
    </Router>
  );
}

export default App;