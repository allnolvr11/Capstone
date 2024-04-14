import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.css';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = JSON.parse(localStorage.getItem('token'));
        const decoded_token = jwtDecode(response.data.token);
        setUser(decoded_token);
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    // Navigate to "/login" if user is null
    if (user === null) {
      navigate("/login");
    }
  }, [user, navigate]); // add a new useEffect that depends on user and navigate

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      navigate("/login");
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand href="#home">React35 Web Application</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link className="text-decoration-none text-white">Nav1</Nav.Link>
          <Nav.Link className="text-decoration-none text-white">Nav2</Nav.Link>
        </Nav>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Welcome: {user ? user.id : 'id'} {user ? user.name : 'name'}
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Dashboard;
