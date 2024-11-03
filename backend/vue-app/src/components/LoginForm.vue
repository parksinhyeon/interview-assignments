<template>
  <div class="container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card shadow-sm p-4" style="max-width: 400px; width: 100%;">
      <h3 class="text-center mb-4">로그인</h3>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label text-start w-100">이메일</label>
          <input type="text" class="form-control" id="email" placeholder="이메일을 입력하세요" v-model="email">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label text-start w-100">비밀번호</label>
          <input type="password" class="form-control" id="password" placeholder="비밀번호를 입력하세요" v-model="password">
        </div>
        <button type="submit" class="btn btn-primary w-100">로그인</button>
        <div class="text-center mt-3">
          <router-link to="/signup">회원가입</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import { login } from '@/api/auth';

  export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async handleLogin() {
        try {
          await login(this.email, this.password);
          this.$router.push('/'); // 로그인 후 대시보드로 이동
        } catch (error) {
          alert('로그인 실패: ' + error.message);
        }
      }
    }
  };
</script>

