import axios from "axios";


export async function login(email, password) {
    const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
    localStorage.setItem('token', response.data.token); // 로그인 후 토큰 저장
    return response.data;
  }
  
  export async function register(username, email, password,is_superuser) {
    const response = await axios.post('http://localhost:3001/api/auth/register', { username, email, password,is_superuser });
    return response.data;
  }