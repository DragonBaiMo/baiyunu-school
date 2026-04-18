import type { EduAlumniRecord, IEduSystemAdapter } from './interface.js';

const FIXTURES: EduAlumniRecord[] = [
  { idCard: '110101199001010001', name: '王昭然', year: 2015, college: '计算机学院', major: '软件工程' },
  { idCard: '110101199101010002', name: '李寒雪', year: 2016, college: '经济与管理学院', major: '会计学' },
  { idCard: '110101199201010003', name: '张明哲', year: 2017, college: '外国语学院', major: '英语' },
];

export class MockEduSystemAdapter implements IEduSystemAdapter {
  async queryAlumni(idCard: string): Promise<EduAlumniRecord | null> {
    return FIXTURES.find((f) => f.idCard === idCard) ?? null;
  }

  async listGraduates(year: number): Promise<EduAlumniRecord[]> {
    return FIXTURES.filter((f) => f.year === year);
  }

  async verifyEnrollment(payload: { idCard: string; year: number }): Promise<boolean> {
    return FIXTURES.some((f) => f.idCard === payload.idCard && f.year === payload.year);
  }
}
