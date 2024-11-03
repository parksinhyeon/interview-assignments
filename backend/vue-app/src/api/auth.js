import axios from "axios";


export async function login(email, password) {
    const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
    localStorage.setItem('token', response.data.token); // 로그인 후 토큰 저장
    return response.data;
  }
  
  export async function register(username, email, password,is_superuser) {
    let url;
    if(is_superuser){
       url ='http://localhost:3001/api/auth/createsuperuser';
    }else{
      url ='http://localhost:3001/api/auth/register';
    }
    const response = await axios.post(url, { username, email, password });
    return response.data;
  }