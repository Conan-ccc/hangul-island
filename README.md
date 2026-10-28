# 한글 섬 여행

아이패드 홈 화면 웹앱으로 동작하는 만 4세용 한글 놀이 게임. 외부 라이브러리 없이 HTML, CSS, JS, SVG로 만들었다.

- 주소: https://conan-ccc.github.io/hangul-island/
- 발음 확인(보호자용): https://conan-ccc.github.io/hangul-island/tools/voice-check.html

## 아이패드 설치

1. 사파리로 위 주소를 연다.
2. 공유 버튼 → "홈 화면에 추가"를 누른다.
3. 홈 화면의 "한글 섬" 아이콘으로 실행한다. (사파리 탭에서만 쓰면 7일 동안 안 열 때 기록이 지워질 수 있다.)
4. 처음 설정 화면에 아이 이름과 가족 이름을 입력한다. 이름은 이 아이패드 안에만 저장된다.
5. 보호자 공간: 화면 오른쪽 위 모서리를 2초 길게 누른 뒤 덧셈 문제를 푼다. 백업 코드를 메모해 두면 기록을 옮기거나 되살릴 수 있다.

## 개발

- 테스트: `npm test` (Node 20 이상)
- 로컬 실행: `node tools/serve.mjs` 후 http://localhost:8765/
- 배포할 때는 `shared/config.js`와 `sw.js`의 `VERSION`을 같이 올린다.
