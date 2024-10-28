export interface SignUpResponse {
    nickname: string;
    email: string;
  }
  
  export interface SignUpPayload {
    email: string;
    password: string;
    nickname: string;
  }