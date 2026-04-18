export interface EduAlumniRecord {
  idCard: string;
  name: string;
  year: number;
  college: string;
  major: string;
}

export interface IEduSystemAdapter {
  queryAlumni(idCard: string): Promise<EduAlumniRecord | null>;
  listGraduates(year: number): Promise<EduAlumniRecord[]>;
  verifyEnrollment(payload: { idCard: string; year: number }): Promise<boolean>;
}
