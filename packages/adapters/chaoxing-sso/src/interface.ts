export interface ChaoxingTokenResponse {
  accessToken: string;
  refreshToken: string;
  openId: string;
  expiresIn: number;
}

export interface ChaoxingCourse {
  id: string;
  name: string;
  teacher: string;
}

export interface IChaoxingSsoAdapter {
  buildAuthUrl(state: string): string;
  exchangeToken(code: string): Promise<ChaoxingTokenResponse>;
  listCourses(userId: string): Promise<ChaoxingCourse[]>;
}
