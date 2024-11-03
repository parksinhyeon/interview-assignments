<template>
  <div class="container mt-5">
    <h2 class="mb-4">메인 페이지</h2>
    
    <!-- 사용자 정보 수정 폼 -->
    <div class="card mb-4 p-3">
      <div v-if="!user" class="alert alert-info mt-3">
        사용자 정보를 불러오는 중...
      </div>
      <div v-else>
        <h3>안녕하세요, {{ user.username }}!</h3>
        <p>이메일: {{ user.email }}</p>
        <p>가입 날짜: {{ formatDate(user.created_at) }}</p>
        <button class="btn btn-primary" @click="logout">로그아웃</button>
      </div>
    </div>
    
    <!-- 게시판 글 목록 -->
    <div class="card mb-4 p-3">
      <h3>게시판 글 목록</h3>
      <button class="btn btn-success" @click="showCreatePostModal">게시글 작성</button>
      <div v-if="posts.length === 0" class="alert alert-info">작성된 게시글이 없습니다.</div>
      <ul class="list-group">
        <li v-for="item in posts" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.content }}</p>
            <small>작성자: {{ item.username }}</small>
            <small class="ms-2">{{ formatDate(item.created_at) }}</small> 
          </div>
          <div>
            <button
              v-if="user && user.id === item.author_id"
              class="btn btn-warning btn-sm"
              @click="showEditPostModal(item.id)"
            >
              수정
            </button>
            <button
              v-if="user && user.id === item.author_id"
              class="btn btn-danger btn-sm"
              @click="deletePost(item.id)"
            >
              삭제
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- 사용자 목록 관리 -->
    <div  v-if="user && user.is_superuser" class="card mb-4 p-3">
      <h3>사용자 목록</h3>
      <button class="btn btn-primary" @click="showCreateUserModal">새 사용자 추가</button>
      <!-- <div v-if="users.length === 0" class="alert alert-info">등록된 사용자가 없습니다.</div> -->
      <ul class="list-group mt-3">
        <li v-for="user in users" :key="user.id" class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ user.username }}</strong>
            <p>{{ user.email }}</p>
          </div>
          <div>
            <button class="btn btn-warning btn-sm" @click="showEditUserModal(user)">수정</button>
            <button class="btn btn-danger btn-sm" @click="deleteUser(user.id)">삭제</button>
          </div>
        </li>
      </ul>
    </div>
    <!-- 사용자 생성 모달 -->
    <div v-if="isCreateUserModalVisible" class="modal fade show" tabindex="-1" style="display: block;" @click.self="closeCreateUserModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">새 사용자 추가</h5>
            <button type="button" class="btn-close" @click="closeCreateUserModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="newUsername" class="form-label">사용자 이름:</label>
              <input type="text" id="newUsername" class="form-control" v-model="editingUser.username" />
            </div>
            <div class="mb-3">
              <label for="newEmail" class="form-label">이메일:</label>
              <input type="email" id="newEmail" class="form-control" v-model="editingUser.email" />
            </div>
            <div class="mb-3">
              <label for="newPassword" class="form-label">비밀번호:</label>
              <input type="password" id="newPassword" class="form-control" v-model="editingUser.password" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateUserModal">닫기</button>
            <button type="button" class="btn btn-primary" @click="createUser">추가하기</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 사용자 정보 수정 모달 -->
    <div v-if="isEditUserModalVisible" class="modal fade show" tabindex="-1" style="display: block;" @click.self="closeEditUserModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">유저 정보 수정</h5>
            <button type="button" class="btn-close" @click="closeEditUserModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="username" class="form-label">사용자 이름:</label>
              <input type="text" id="username" class="form-control" v-model="editingUser.username" />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">비밀번호:</label>
              <input type="password" id="password" class="form-control" v-model="editingUser.password" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEditUserModal">닫기</button>
            <button type="button" class="btn btn-primary" @click="updateUserInfo">수정하기</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 게시글 작성 모달 -->
    <div v-if="isCreatePostModalVisible" class="modal fade show" tabindex="-1" style="display: block;" @click.self="closeCreatePostModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">게시글 작성</h5>
            <button type="button" class="btn-close" @click="closeCreatePostModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="postTitle" class="form-label">제목:</label>
              <input type="text" id="postTitle" class="form-control" v-model="post.title" required />
            </div>
            <div class="mb-3">
              <label for="postContent" class="form-label">내용:</label>
              <textarea id="postContent" class="form-control" v-model="post.content" required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreatePostModal">닫기</button>
            <button type="button" class="btn btn-success" @click="submitPost">게시하기</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 게시글 수정 모달 -->
    <div v-if="isEditPostModalVisible" class="modal fade show" tabindex="-1" style="display: block;" @click.self="closeEditPostModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">게시글 수정</h5>
            <button type="button" class="btn-close" @click="closeEditPostModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="editPostTitle" class="form-label">제목:</label>
              <input type="text" id="editPostTitle" class="form-control" v-model="editingPost.title" />
            </div>
            <div class="mb-3">
              <label for="editPostContent" class="form-label">내용:</label>
              <textarea id="editPostContent" class="form-control" v-model="editingPost.content"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEditPostModal">닫기</button>
            <button type="button" class="btn btn-primary" @click="updatePost">수정하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProtectedData } from '../api/protected';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
} from '../api/board'; // API 호출 함수 가져오기

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  
} from '../api/users'; // API 호출 함수 가져오기

export default {
  name: 'MainPage',
  data() {
    return {
      user: null,
      post: {
        title: '',
        content: '',
      },
      posts: [], // 게시글 목록
      users: [], // 사용자 목록
      isEditUserModalVisible: false, // 사용자 정보 수정 모달 표시 여부
      isCreatePostModalVisible: false, // 게시글 작성 모달 표시 여부
      isEditPostModalVisible: false, // 게시글 수정 모달 표시 여부
      editingPost: {}, // 수정 중인 게시글
      editingUser: { username: '', email: '', password: '' },
      isCreateUserModalVisible: false, // 사용자 생성 모달 표시 여부
    };
  },
  async created() {
    await this.fetchUserInfo();
    await this.fetchPosts(); // 게시글 불러오기
    await this.fetchUsers(); // 사용자 목록 불러오기
  },
  methods: {
    async fetchUserInfo() {
      try {
        const data = await getProtectedData();
        if (!data) {
          alert('인증되지 않은 사용자');
          location.href = '/login';
          return;
        }
        this.user = data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        alert('인증되지 않은 사용자');
        location.href = '/login';
      }
    },
    async fetchPosts() {
      try {
        this.posts = await getPosts(); // API 호출하여 게시글 목록 불러오기
      } catch (error) {
        console.error('게시글 로드 중 오류 발생:', error);
      }
    },
    async fetchUsers() {
      try {
        this.users = await getUsers();
        // console.log(response)
        // response.data; // 사용자 목록 불러오기
      } catch (error) {
        console.error('사용자 목록 로드 중 오류 발생:', error);
      }
    },
    showEditUserModal(user) {
      this.editingUser = { ...user };
      this.isEditUserModalVisible = true;
    },
    async updateUserInfo() {
      try {
        await updateUser(this.editingUser.id, this.editingUser);
        this.isEditUserModalVisible = false;
        await this.fetchUsers(); // 사용자 목록 새로 고침
      } catch (error) {
        console.error('사용자 정보 수정 중 오류 발생:', error);
      }
    },
    async deleteUser(userId) {
      if (confirm('정말로 삭제하시겠습니까?')) {
        try {
          await deleteUser(userId);
          await this.fetchUsers(); // 사용자 목록 새로 고침
        } catch (error) {
          console.error('사용자 삭제 중 오류 발생:', error);
        }
      }
    },
    showCreateUserModal() {
      this.editingUser = { username: '', email: '' };
      this.isCreateUserModalVisible = true;
    },
    closeCreateUserModal() {
      this.isCreateUserModalVisible = false;
    },
    async createUser() {
      try {
        await createUser(this.editingUser); // 비밀번호 포함하여 사용자 생성 API 호출
        this.isCreateUserModalVisible = false;
        await this.fetchUsers();
      } catch (error) {
        console.error('사용자 추가 중 오류 발생:', error);
      }
    },
 
    async showEditPostModal(postId) {
      console.log(postId);
      this.editingPost = await getPostById(postId);
      this.isEditPostModalVisible = true;
    },
    async updatePost() {
      try {
        console.log(this.editingPost)
        await updatePost(this.editingPost);
        this.isEditPostModalVisible = false;
        await this.fetchPosts(); // 게시글 목록 새로 고침
      } catch (error) {
        console.error('게시글 수정 중 오류 발생:', error);
      }
    },
    async deletePost(postId) {
      if (confirm('정말로 삭제하시겠습니까?')) {
        try {
          await deletePost(postId);
          await this.fetchPosts(); // 게시글 목록 새로 고침
        } catch (error) {
          console.error('게시글 삭제 중 오류 발생:', error);
        }
      }
    },
    showCreatePostModal() {
      this.post = { title: '', content: '' };
      this.isCreatePostModalVisible = true;
    },
    async submitPost() {
      try {
        await createPost(this.post);
        this.isCreatePostModalVisible = false;
        await this.fetchPosts(); // 게시글 목록 새로 고침
      } catch (error) {
        console.error('게시글 생성 중 오류 발생:', error);
      }
    },
    closeEditUserModal() {
      this.isEditUserModalVisible = false;
    },
    closeCreatePostModal() {
      this.isCreatePostModalVisible = false;
    },
    closeEditPostModal() {
      this.isEditPostModalVisible = false;
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },async logout() {
      // 로그아웃 처리
      localStorage.removeItem('token'); //  토큰 제거
      location.href = '/login'; // 로그인 페이지로 리다이렉션
    },
  },
};
</script>

<style scoped>
/* 여기에 필요한 스타일 추가 */
</style>
