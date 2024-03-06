import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { NavBar } from 'react-bootstrap/NavBar';
import { Container } from 'react-bootstrap/Container';
import { Row } from 'react-bootstrap/Row';
import { Col } from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from '.react-bootstrap/Nav';

import Dashboard from './Components/Dashboard/Dashboard';
import Login from './Components/Login/Login';

function App() {
  return (
    <>
      <Router>
        <Container>
          <Row>
            <Col md={12}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </Col>
          </Row>
        </Container>
      </Router>
    </>
  );
}

export default App;
