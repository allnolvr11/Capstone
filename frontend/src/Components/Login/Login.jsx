import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './loginStyle.css';

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = JSON.parse(localStorage.getItem('token'));
        setUser(response.data);
        navigate("/dashboard");
      } catch (error) {
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    try {
      const response = await axios.post('https://parkingsystem-7aqu.onrender.com/api/login', {
        username,
        password
      });
      localStorage.setItem('token', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch(error) {
      console.error('Login Failed', error);
    }
  };

  return (
    <div className="container">
      <div className="login-container">
          <input type='username' value={username} onChange={(e) => setUsername(e.target.value)}/>
          <input type='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
          <Button onClick={handleLogin}>Login</Button>
      </div>
    </div>
  );
};

export default Login;