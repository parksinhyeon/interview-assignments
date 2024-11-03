import axios from 'axios';

export async function getProtectedData() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await axios.get('http://localhost:3001/api/auth/user-data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data.user;
}