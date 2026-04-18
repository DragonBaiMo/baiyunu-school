/**
 * 测试夹具：合成校友数据工厂。Phase 1b 会扩展为完整 faker 链。
 */
export interface SyntheticAlumni {
    idCard: string;
    name: string;
    phone: string;
    year: number;
    collegeId: string;
    deptId: string;
    classId: string;
}
export declare function buildSyntheticAlumni(count?: number): SyntheticAlumni[];
//# sourceMappingURL=index.d.ts.map