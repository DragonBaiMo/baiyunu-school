export interface DisciplineRecord { idCard: string; type: string; year: number }
export interface AwardRecord { idCard: string; title: string; year: number }

export interface IStuAffairsAdapter {
  queryDiscipline(idCard: string): Promise<DisciplineRecord[]>;
  queryAwards(idCard: string): Promise<AwardRecord[]>;
}
