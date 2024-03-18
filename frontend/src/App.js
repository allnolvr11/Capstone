import React from 'react';
import { BrowserRouter as Router , Routes, Route} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "bootstrap/dist/css/bootstrap.css";
import './App.css';

import Dashboard from './Components/Dashboard/Dashboard';
import Login from './Components/Login/Login';

const App = () => {
  
  return (
    
    <Router>
      <Container className="app-container">
        <Row className="app-row">
          <Col className="app-col">
            <Routes>
              <Route path="/" element={<Login />}/>
              <Route path="/login" element={<Login />}/>
              <Route path="/dashboard" element={<Dashboard />}/>
            </Routes>
          </Col>
        </Row>
      </Container>
    </Router>
    
    );
  };
  
  export default App;