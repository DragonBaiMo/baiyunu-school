import type { AwardRecord, DisciplineRecord, IStuAffairsAdapter } from './interface.js';

const AWARDS: AwardRecord[] = [
  { idCard: '110101199001010001', title: '国家奖学金', year: 2014 },
  { idCard: '110101199101010002', title: '三好学生', year: 2015 },
];

export class MockStuAffairsAdapter implements IStuAffairsAdapter {
  async queryDiscipline(_idCard: string): Promise<DisciplineRecord[]> {
    return [];
  }
  async queryAwards(idCard: string): Promise<AwardRecord[]> {
    return AWARDS.filter((a) => a.idCard === idCard);
  }
}
