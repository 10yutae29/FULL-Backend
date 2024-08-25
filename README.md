## 목적

- express.js 활용한 백엔드 기초 학습
- JWT 기반 인증 적용
- OAuth 2.0 구현 및 인증 흐름 학습
- CRUD API 개발 및 RESTful 서비스 구축





## 기술 스택

express.js

postgresql

jsonwebtoken



## 기록

~8/8

- express 시작 코드 작성 및 게시글 작성, 조회 API 개발
- mongodb 연결 및 API에 따라 게시글 데이터 저장 및 조회
- 프론트엔드와 통신을 위해 cors 미들웨어 설정



8/9

- mongodb -> postgresql로 DB 변경
- OAuth2.0(Kakao)로 kakao access_token과 유저 정보 발급
- 위 정보로 서버 자체 access_token과 refresh_token 발급



8/10

- 로그인, 토큰 API 엔드포인트 별로 라우트 파일 분리
- refresh_token을 통해 access_token 재발급



8/12

- 게시글 삭제 API 개발 및 게시글 관련 API 라우트 파일 분리



8/13

- authMiddleware 설정 및 적용
  - access_token이 필요한 API인 경우 authMiddleware에서 토큰 만료 확인 후 만료되었으면 401 반환/만료 안되었으면 이후 정상 API 응답
  - 미들웨어 적용하여 토큰 검증 코드 중복 제거 및 유지보수성 증가
- access_token 만료 시와 refresh_token 만료 시 응답 데이터 구분
  - 둘다 status=401로 응답하기 때문에 프론트에서 axios interceptor로 처리하기 애매
  - 응답의 data.action 값으로 access_token 만료시엔 3, refresh_token 만료시엔 4를 반환
  - 프론트에서 API 요청 시 응답으로 {status: 401, action: 3}을 받으면 refresh_token으로 access_token을 재발급 받고, 재발급 받은 access_token으로 다시 API 요청
  - refresh_token으로 access_token 재발급 API 응답으로 {status: 401, action: 4} 받으면 프론트에서 로그아웃 



8/24

- 게시글 수정 API 개발
  - 수정 권한 검사를 위해 API 요청 유저와 게시글 작성 유저 ID 비교
  - 이전 게시글 조회에서 보낸 게시글 작성 유저 ID와 비교하면 데이터 조작으로인해 잘못된 권한 인증이 될 수 있음
  - 때문에 게시글 ID를 통해 해당 게시글 작성자 ID를 DB에서 비교한 후 수정 권한 확인