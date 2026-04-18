/**
 * 测试夹具：合成校友数据工厂。Phase 1b 会扩展为完整 faker 链。
 */
const SYNTH_NAMES = ['王昭然', '李寒雪', '张明哲', '陈思远', '周若溪'];
export function buildSyntheticAlumni(count = 5) {
    return Array.from({ length: count }, (_, i) => {
        const seq = String(i + 1).padStart(3, '0');
        return {
            idCard: `11010119${1990 + i}0101${seq}X`,
            name: SYNTH_NAMES[i % SYNTH_NAMES.length] ?? `合成校友${seq}`,
            phone: `138${String(10000000 + i).padStart(8, '0')}`,
            year: 2015 + (i % 5),
            collegeId: `college-${(i % 3) + 1}`,
            deptId: `dept-${(i % 5) + 1}`,
            classId: `class-${seq}`,
        };
    });
}
//# sourceMappingURL=index.js.map