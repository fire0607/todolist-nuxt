export interface SignUpResponse {
    nickname: string;
    email: string;
  }
  
export interface SignUpPayload {
    email: string;
    password: string;
    nickname: string;
  }

export interface LogInPayload {
    email: string;
    password: string;
  }

export interface UserState {
    user: {
      email: string;
      nickname: string;
    } | null;
    token: string | null;
  }