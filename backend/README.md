
# macOS에서 Node.js 및 Docker 설치

## Homebrew 설치 (아직 설치하지 않은 경우):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Node.js 설치:
```bash
brew install node
```

## Docker 설치:
- [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)에서 다운로드하여 설치합니다.
- 설치 후 Docker Desktop을 실행합니다.

## Docker Compose 설치:
- Docker Desktop에 포함되어 있으므로 별도 설치 필요 없음.
```bash
docker-compose --version
```

---

# Windows에서 Node.js 및 Docker 설치

## Node.js 설치:
- [Node.js 공식 웹사이트](https://nodejs.org/)에서 Windows Installer (.msi)를 다운로드하여 설치합니다.
- 설치 중 "Add to PATH" 옵션을 선택하여 Node.js와 npm을 PATH에 추가합니다.

## Docker 설치:
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)에서 다운로드하여 설치합니다.
- 설치 후 Docker Desktop을 실행하고 Windows Subsystem for Linux (WSL) 또는 Hyper-V를 사용하여 Docker를 설정합니다.

## Docker Compose 설치:
- Docker Desktop에 포함되어 있으므로 별도 설치 필요 없음.
```bash
docker-compose --version
```


## Microservices Test Guide

이 문서는 `auth-service`, `user-service`, `board-service`에 대한 테스트 시나리오와 가이드를 제공합니다. 각 서비스는 독립적으로 테스트 가능하며, 테스트 환경 설정과 테스트 케이스가 포함되어 있습니다.

## 공통 테스트 환경 설정

- 각 서비스의 루트 디렉토리에서 `.env` 파일을 준비하여 필요한 환경 변수를 설정합니다.
- 테스트 실행 전, 각 서비스의 종속성이 모두 정상적으로 시작되었는지 확인합니다.

### Docker Compose 설정

다음 명령어로 테스트에 필요한 서비스를 Docker Compose로 실행할 수 있습니다.

```bash
docker-compose up --build
```

## vue-app
- 테스트 용도로 간단한 vue-app을 개발하였습니다.
- docker 실행 후 http://localhost:3000 으로 접속해서 테스트 가능합니다.
- 로그인 후 메인화면 : http://localhost:3000/
- 로그인 : http://localhost:3000/login
- 회원가입 : http://localhost:3000/signup