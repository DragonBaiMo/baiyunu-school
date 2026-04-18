import type {
  ChaoxingCourse,
  ChaoxingTokenResponse,
  IChaoxingSsoAdapter,
} from './interface.js';

const FIXED_COURSES: ChaoxingCourse[] = [
  { id: 'c-1', name: '数据结构', teacher: '赵老师' },
  { id: 'c-2', name: '计算机组成原理', teacher: '钱老师' },
];

export class MockChaoxingSsoAdapter implements IChaoxingSsoAdapter {
  buildAuthUrl(state: string): string {
    return `https://chaoxing.mock/oauth2/authorize?state=${encodeURIComponent(state)}`;
  }

  async exchangeToken(code: string): Promise<ChaoxingTokenResponse> {
    return {
      accessToken: `mock-at-${code}`,
      refreshToken: `mock-rt-${code}`,
      openId: 'mock-openid-0001',
      expiresIn: 3600,
    };
  }

  async listCourses(_userId: string): Promise<ChaoxingCourse[]> {
    return FIXED_COURSES;
  }
}
