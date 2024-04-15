import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import './loginStyle.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        jwtDecode(token); // validate the token
        navigate('/dashboard');
      } catch (error) {
        sessionStorage.removeItem('token'); // remove invalid token
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    try {
      const response = await axios.post('https://parkingsystem-7aqu.onrender.com/api/login', {
        username,
        password
      });
      sessionStorage.setItem('token', JSON.stringify(response.data));
      const token = sessionStorage.getItem("token");
      try {
        jwtDecode(token); // validate the token
        navigate('/dashboard');
      } catch (error) {
        sessionStorage.removeItem('token'); // remove invalid token
        console.error('Invalid token', error);
      }
    } catch(error) {
      console.error('Login Failed', error);
    }
  };

  return (
    <div className="login-log">
      <div className="login-container">
          <label className='label-login'>Username</label>
          <input className='item-login' type='username' value={username} onChange={(e) => setUsername(e.target.value)}/>
          <label className='label-login'>Password</label>
          <input className='item-login' type='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
          <div className='button-container'>
            <Button className='login-button' onClick={handleLogin}>Login</Button>
          </div>
      </div>
    </div>
  );
};

export default Login;