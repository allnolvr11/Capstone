import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // import useLocation
import { jwtDecode } from 'jwt-decode';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.css';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // get the current location

  /* Verify if User In-Session in LocalStorage */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = JSON.parse(localStorage.getItem('token'));
        const decoded_token = jwtDecode(response.data.token);
        setUser(decoded_token);
      } catch (error) {
        // only navigate to "/login" if the user is not already there
        if (location.pathname !== '/login') {
          navigate("/login");
        }
      }
    };
  
    fetchUser();
  }, [navigate, location.pathname]); // add location.pathname to the dependency array

    /* Performs Logout Method */
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
