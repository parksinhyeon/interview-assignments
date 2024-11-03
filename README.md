# Microservices Test Guide

이 문서는 `auth-service`, `user-service`, `board-service`에 대한 테스트 시나리오와 가이드를 제공합니다. 각 서비스는 독립적으로 테스트 가능하며, 테스트 환경 설정과 테스트 케이스가 포함되어 있습니다.

## 공통 테스트 환경 설정

- 각 서비스의 루트 디렉토리에서 `.env` 파일을 준비하여 필요한 환경 변수를 설정합니다.
- `db_test`는 테스트용 데이터베이스를 사용하며, Docker Compose로 설정됩니다.
- 테스트 실행 전, 각 서비스의 종속성이 모두 정상적으로 시작되었는지 확인합니다.

### Docker Compose 설정

다음 명령어로 테스트에 필요한 서비스를 Docker Compose로 실행할 수 있습니다.

```bash
docker-compose up --build
