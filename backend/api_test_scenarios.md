# 서비스 테스트 시나리오 및 가이드

이 문서는 각 서비스의 테스트 시나리오 및 가이드를 설명합니다. 각 섹션에서는 서비스의 기능, 예상 동작, 그리고 테스트 방법을 다룹니다.

## 1. 사용자 관리 서비스

### 1.1 기능 설명
- 사용자 생성
- 사용자 목록 조회
- 사용자 삭제

### 1.2 테스트 시나리오

#### 1.2.1 사용자 생성
- **목적**: 새로운 사용자를 생성한다.
- **테스트 단계**:
  1. 관리자 권한이 있는 사용자의 JWT를 사용하여 POST 요청을 `/api/users`로 전송.
  2. 필요한 필드(사용자명, 이메일, 비밀번호)를 포함한다.
  3. 응답 상태 코드가 201인지 확인한다.
  4. 응답 본문에 생성된 사용자 정보가 포함되어 있는지 확인한다.

#### 1.2.2 사용자 목록 조회
- **목적**: 모든 사용자의 목록을 가져온다.
- **테스트 단계**:
  1. 관리자 권한이 있는 사용자의 JWT를 사용하여 GET 요청을 `/api/users`로 전송.
  2. 응답 상태 코드가 200인지 확인한다.
  3. 응답 본문에 사용자의 배열이 포함되어 있는지 확인한다.

#### 1.2.3 사용자 삭제
- **목적**: 특정 사용자를 삭제한다.
- **테스트 단계**:
  1. 삭제할 사용자 ID를 알아낸다.
  2. 관리자 권한이 있는 사용자의 JWT를 사용하여 DELETE 요청을 `/api/users/:id`로 전송.
  3. 응답 상태 코드가 204인지 확인한다.
  4. 삭제 후 다시 사용자 목록을 조회하여 해당 사용자가 목록에 없는지 확인한다.

### 1.3 테스트 가이드
- **사전 준비**: 테스트를 수행하기 전에 데이터베이스가 초기화되어 있어야 하며, 필요한 테스트 데이터가 삽입되어 있어야 한다.
- **테스트 도구**: Postman 또는 Supertest를 사용하여 API 요청을 보낸다.
- **확인 사항**: 각 테스트 후에는 데이터베이스 상태를 확인하여 데이터가 올바르게 업데이트되었는지 검증한다.

---

## 2. 인증 서비스

### 2.1 기능 설명
- 사용자 로그인
- 사용자 로그아웃
- 비밀번호 재설정

### 2.2 테스트 시나리오

#### 2.2.1 사용자 로그인
- **목적**: 사용자 인증을 수행한다.
- **테스트 단계**:
  1. 등록된 사용자 이메일과 비밀번호로 POST 요청을 `/api/login`에 전송.
  2. 응답 상태 코드가 200인지 확인한다.
  3. 응답 본문에 JWT가 포함되어 있는지 확인한다.

#### 2.2.2 사용자 로그아웃
- **목적**: 사용자를 로그아웃 처리한다.
- **테스트 단계**:
  1. 유효한 JWT를 사용하여 POST 요청을 `/api/logout`에 전송.
  2. 응답 상태 코드가 200인지 확인한다.

#### 2.2.3 비밀번호 재설정
- **목적**: 사용자의 비밀번호를 재설정한다.
- **테스트 단계**:
  1. 사용자 이메일로 비밀번호 재설정 요청을 보낸다.
  2. 응답 상태 코드가 200인지 확인한다.
  3. 이메일로 전송된 링크를 통해 비밀번호를 새로 설정한다.

### 2.3 테스트 가이드
- **사전 준비**: 등록된 사용자 계정이 필요하다.
- **테스트 도구**: Postman 또는 Supertest를 사용하여 API 요청을 보낸다.
- **확인 사항**: 테스트 후에는 응답 데이터와 상태 코드를 항상 검증한다.

---

## 3. 데이터베이스 서비스

### 3.1 기능 설명
- 데이터 저장 및 조회
- 데이터 업데이트 및 삭제

### 3.2 테스트 시나리오

#### 3.2.1 데이터 저장
- **목적**: 데이터를 데이터베이스에 저장한다.
- **테스트 단계**:
  1. POST 요청을 사용하여 데이터를 `/api/data`에 전송.
  2. 응답 상태 코드가 201인지 확인한다.
  3. 저장된 데이터가 데이터베이스에 존재하는지 확인한다.

#### 3.2.2 데이터 조회
- **목적**: 데이터베이스에서 데이터를 조회한다.
- **테스트 단계**:
  1. GET 요청을 사용하여 `/api/data/:id`에 전송.
  2. 응답 상태 코드가 200인지 확인한다.
  3. 응답 본문에 조회한 데이터가 포함되어 있는지 확인한다.

### 3.3 테스트 가이드
- **사전 준비**: 테스트 데이터가 존재해야 하며, 데이터베이스가 초기화되어 있어야 한다.
- **테스트 도구**: Postman 또는 Supertest를 사용하여 API 요청을 보낸다.
- **확인 사항**: 데이터베이스의 상태를 항상 검증하여 데이터가 올바르게 처리되었는지 확인한다.

---

## 결론

각 서비스의 테스트는 서비스의 기능이 기대한 대로 작동하는지 확인하는 데 중요합니다. 이 가이드를 통해 체계적으로 테스트를 진행하여 서비스의 품질을 높일 수 있습니다.
