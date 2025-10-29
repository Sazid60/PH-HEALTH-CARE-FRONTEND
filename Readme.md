## PH-HEALTHCARE-FRONTEND-PART-2

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/part-2


## 66-1 Login flow and discussion about cookies

- for token the ip address should be same .
- we use `samesite : none`. This means site is different and the token is passed using `https` or other protocol.
- when  `samesite : lax` this means site is different but the token is passed using `http` protocol. and its customizable.
- when `samesite : strict` this means site is same and the token is passed using `http` protocol.
- when we use `http` protocol the token is not secure.
- when we use `https` protocol the token is secure.
- We are dealing the cookie from the backend. we have to get and use the cookie in frontend.
- `We can easily grab the cookie easily when frontend and backend uses the similar server.` but next.js backend is not perfect enough.there is some issues in scalability and it will be bit slower and further upgradation in micro service will not be available.
- `We can not grab the cookie easily when frontend and backend uses different server.` there are some extra layer like cors.
- we can solve this cookie will be handled by backend no much lingering in frontend. we will just send from frontend and backend will verify the cookie token.