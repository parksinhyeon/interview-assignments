import axios from 'axios';

const API_URL = 'http://localhost:3002/api/users'; // API 기본 URL

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// 요청 인터셉터를 사용하여 토큰 추가
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰 가져오기
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 모든 유저 정보 조회
export async function getUsers() {
  try {
    const response = await axiosInstance.get('/'); // '/' 경로로 요청
    return response.data.users; // 유저 목록 반환
  } catch (error) {
    console.error('유저 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

// 유저 생성
export async function createUser(userData) {
  try {
    const response = await axiosInstance.post('/', userData); // '/' 경로로 요청
    return response.data; // 생성된 유저 데이터 반환
  } catch (error) {
    console.error('유저 생성 중 오류 발생:', error);
    throw error; // 에러 발생 시 다시 throw
  }
}

// 특정 유저 조회
export async function getUserById(userId) {
  try {
    const response = await axiosInstance.get(`/${userId}`); // '/{userId}' 경로로 요청
    return response.data; // 특정 유저 반환
  } catch (error) {
    console.error('유저 조회 중 오류 발생:', error);
    throw error;
  }
}

// 특정 유저 정보 업데이트
export async function updateUser(userId, userData) {
  try {
    const response = await axiosInstance.put(`/${userId}`, userData); // '/{userId}' 경로로 요청
    return response.data; // 수정된 유저 데이터 반환
  } catch (error) {
    console.error('유저 수정 중 오류 발생:', error);
    throw error;
  }
}

// 특정 유저 삭제
export async function deleteUser(userId) {
  try {
    await axiosInstance.delete(`/${userId}`); // '/{userId}' 경로로 요청
    return; // 성공적으로 삭제되면 아무 것도 반환하지 않음
  } catch (error) {
    console.error('유저 삭제 중 오류 발생:', error);
    throw error;
  }
}
