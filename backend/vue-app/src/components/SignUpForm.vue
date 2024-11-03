<template>
  <div class="container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card shadow-sm p-4" style="max-width: 400px; width: 100%;">
      <h3 class="text-center mb-4">회원가입</h3>
      <form @submit.prevent="handleSignUp">
        <div class="mb-3">
          <label for="username" class="form-label text-start w-100">사용자명</label>
          <input 
            type="text" 
            class="form-control" 
            id="username" 
            v-model="username" 
            placeholder="사용자명을 입력하세요" 
            required 
          />
        </div>
        <div class="mb-3">
          <label for="email" class="form-label text-start w-100">이메일</label>
          <input 
            type="email" 
            class="form-control" 
            id="email" 
            v-model="email" 
            placeholder="이메일을 입력하세요" 
            required 
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label text-start w-100">비밀번호</label>
          <input 
            type="password" 
            class="form-control" 
            id="password" 
            v-model="password" 
            placeholder="비밀번호를 입력하세요" 
            required 
          />
        </div>
        <!-- 관리자 권한 체크박스 -->
        <div class="mb-3 form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="isSuperuser" 
            v-model="isSuperuser" 
          />
          <label for="isSuperuser" class="form-check-label">관리자 권한 부여</label>
        </div>
        <button type="submit" class="btn btn-primary w-100">회원가입</button>
        <div class="text-center mt-3">
          <router-link to="/login">로그인 페이지로 돌아가기</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { register } from '@/api/auth';

export default {
  name: "SignUpForm",
  data() {
    return {
      username: '',
      email: '',
      password: '',
      isSuperuser: false // 관리자 권한 기본값
    };
  },
  methods: {
    async handleSignUp() {
      try {
        await register(this.username, this.email, this.password, this.isSuperuser);
        alert('회원가입이 완료되었습니다!');
        this.$router.push('/login'); // 회원가입 후 로그인 페이지로 이동
      } catch (error) {
        alert('회원가입 실패: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>

</style>
