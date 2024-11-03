import axios from 'axios';

const API_URL = 'http://localhost:3003/api/board'; // API 기본 URL

// 토큰을 가져오는 함수
function getToken() {
  return localStorage.getItem('token'); // 로컬 스토리지에서 토큰을 가져옵니다
}

// 게시글 생성
export async function createPost(postData) {
  try {
    const response = await axios.post(API_URL, postData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('게시글 생성 중 오류 발생:', error);
    throw error;
  }
}

// 게시글 목록 조회
export async function getPosts() {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data.posts;
  } catch (error) {
    console.error('게시글 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

// 특정 게시글 조회
export async function getPostById(postId) {
  try {
    const response = await axios.get(`${API_URL}/${postId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data.post;
  } catch (error) {
    console.error('게시글 조회 중 오류 발생:', error);
    throw error;
  }
}

// 특정 게시글 수정
export async function updatePost(postData) {
    try {
      const response = await axios.put(`${API_URL}/${postData.id}`, postData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('게시글 수정 중 오류 발생:', error);
      throw error;
    }
  }

// 특정 게시글 삭제
export async function deletePost(id) {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  } catch (error) {
    console.error('게시글 삭제 중 오류 발생:', error);
    throw error;
  }
}
