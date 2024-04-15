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
        const token = localStorage.getItem('token');
        if (token) {
          const decoded_token = jwtDecode(token);
          setUser(decoded_token);
        } else {
          throw new Error('No token found');
        }
      } catch (error) {
        localStorage.removeItem('token'); // remove invalid token
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]); // only re-run the effect if navigate changes

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      navigate("/login");
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (!user) {
    return null; // or a loading spinner
  }

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