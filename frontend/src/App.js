import React from 'react';
import { BrowserRouter as Router , Routes, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import './App.css';

import Dashboard from './Components/Dashboard/Dashboard';
import Login from './Components/Login/Login';

const App = () => {
  
  return (
    
    <Router>
        <Routes>
            <Route path="/" element={<Login />} className="login"/>
            <Route path="/login" element={<Login />}/>
            <Route path="/dashboard" element={<Dashboard />}/>
        </Routes>
    </Router>
    
    );
  };
  
  export default App;