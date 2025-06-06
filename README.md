# 웹 플래피버드

웹 브라우저에서 즐기는 플래피버드 스타일의 게임입니다. HTML5 Canvas와 JavaScript를 이용하여 구현되었습니다.

## 개요

웹 플래피버드는 클래식 모바일 게임 "Flappy Bird"에서 영감을 받은 웹 기반 게임입니다. 플레이어는 장애물 사이를 통과하여 최대한 멀리 날아가는 새를 조종합니다.

## 특징

- HTML5 Canvas 기반 렌더링
- 모바일 및 데스크톱 환경 모두 지원
- 직관적인 조작 방식 (마우스 클릭, 터치, 스페이스바)
- 로컬 스토리지를 이용한 최고 점수 저장
- 반응형 디자인

## 기술 스택

- HTML5
- CSS3
- JavaScript (ES6+)

## 실행 방법

1. 저장소를 클론합니다.
   ```
   git clone https://github.com/yourusername/web-flappy-bird.git
   ```

2. 프로젝트 폴더로 이동합니다.
   ```
   cd web-flappy-bird
   ```

3. 간단한 로컬 서버를 통해 실행하는 것이 좋습니다. 예를 들어, Python의 내장 HTTP 서버를 사용할 수 있습니다.
   ```
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```

4. 웹 브라우저에서 `http://localhost:8000`으로 접속합니다.

## 게임 조작법

- **마우스 클릭/터치**: 새를 점프시킵니다.
- **스페이스바**: 새를 점프시킵니다.
- **게임 시작 화면**: 클릭이나 스페이스바를 눌러 게임을 시작합니다.
- **게임 오버 화면**: 재시작 버튼을 클릭하거나 스페이스바를 눌러 게임을 재시작합니다.

## 라이선스

MIT 라이선스 