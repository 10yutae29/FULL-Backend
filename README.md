## 목적

프론트엔드 





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