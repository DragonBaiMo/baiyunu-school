// utils/mock.js - 本地 mock 数据种子与持久化
const KEY = {
  NEWS: 'mock_news',
  ACTIVITIES: 'mock_activities',
  DONATION_STATS: 'mock_donation_stats',
  DONATION_ORDERS: 'mock_donation_orders',
  RESERVATIONS: 'mock_reservations',
  ENROLLMENTS: 'mock_enrollments',
  MEMBERS: 'mock_members',
  APPLICATIONS: 'mock_applications',
  SEED_VERSION: 'mock_seed_version'
};

const SEED_VERSION = '1';

const SEED_NEWS = [
  { id: 'n1', title: '白云大学2026届校友返校日圆满举行', summary: '来自全球各地的500余位校友齐聚母校，共叙同窗情谊。', date: '2026-04-10', category: '校友动态', cover: '' },
  { id: 'n2', title: '计算机学院成立30周年庆典系列活动预告', summary: '4月下旬起，学院将举办学术论坛、校友沙龙等十余场活动。', date: '2026-04-08', category: '学院通告', cover: '' },
  { id: 'n3', title: '"白云之光"校友奖学金2026年度开放申请', summary: '面向在读本科生，资助名额60人，申请截止5月31日。', date: '2026-04-05', category: '奖助学金', cover: '' },
  { id: 'n4', title: '校友企业联合招聘季正式启动', summary: '200余家校友企业释放岗位3000+，覆盖互联网、金融、制造业。', date: '2026-04-01', category: '就业招聘', cover: '' },
  { id: 'n5', title: '校史馆改造升级完成，向校友全面开放', summary: '新增数字长碑、荣誉校友墙及互动展区。', date: '2026-03-28', category: '校园建设', cover: '' }
];

const SEED_ACTIVITIES = [
  { id: 'a1', title: '2026届毕业十周年返校日', date: '2026-05-20', location: '白云大学礼堂', category: '校友聚会', capacity: 300, enrolled: 187, coverTag: '热门', description: '毕业十周年，我们与你再聚首。含校园参观、茶话会、晚宴及校友论坛。' },
  { id: 'a2', title: '创新创业校友沙龙·第8期', date: '2026-04-28', location: '商学院报告厅', category: '学术沙龙', capacity: 120, enrolled: 95, coverTag: '即将开始', description: '邀请连续创业校友分享从0到1的实战经验。' },
  { id: 'a3', title: '校友足球联赛·小组赛', date: '2026-05-05', location: '北区运动场', category: '文体活动', capacity: 200, enrolled: 142, coverTag: '报名中', description: '16支校友队伍角逐，欢迎组队或以个人身份参与啦啦队。' },
  { id: 'a4', title: '校史文化讲座·第3讲', date: '2026-04-26', location: '图书馆学术厅', category: '文化讲座', capacity: 80, enrolled: 58, coverTag: '', description: '资深校史研究者讲述白云大学的时代变迁。' },
  { id: 'a5', title: '校友企业招聘宣讲会', date: '2026-05-10', location: '就业中心', category: '就业', capacity: 400, enrolled: 231, coverTag: '推荐', description: '20家校友企业现场宣讲，可对接HR和校友前辈。' }
];

const SEED_DONATION_STATS = {
  totalAmount: 2_845_600,
  totalDonors: 1283,
  ongoingProjects: 12,
  highlights: [
    { name: '白云之光奖学金', amount: 1_200_000, progress: 80 },
    { name: '校史馆数字化升级', amount: 680_000, progress: 62 },
    { name: '计算机学院教学实验室', amount: 965_600, progress: 48 }
  ]
};

const SEED_MEMBERS = [
  { id: 'u001', name: '张三', class: '2016级计算机', company: '某互联网公司', position: '技术专家', status: 'approved', joinedAt: '2023-09-12' },
  { id: 'u002', name: '李四', class: '2014级经管', company: '投资机构', position: '投资总监', status: 'approved', joinedAt: '2022-06-30' },
  { id: 'u003', name: '王五', class: '2018级建筑', company: '设计院', position: '主任设计师', status: 'approved', joinedAt: '2024-01-15' },
  { id: 'u004', name: '赵六', class: '2020级外语', company: '教育机构', position: '创始人', status: 'pending', joinedAt: '2026-04-15' },
  { id: 'u005', name: '孙七', class: '2012级机械', company: '制造企业', position: '运营副总', status: 'approved', joinedAt: '2021-11-02' },
  { id: 'u006', name: '周八', class: '2019级医学', company: '三甲医院', position: '主治医师', status: 'pending', joinedAt: '2026-04-18' }
];

function ensureMockSeed() {
  const currentVer = wx.getStorageSync(KEY.SEED_VERSION);
  if (currentVer === SEED_VERSION) return;
  wx.setStorageSync(KEY.NEWS, SEED_NEWS);
  wx.setStorageSync(KEY.ACTIVITIES, SEED_ACTIVITIES);
  wx.setStorageSync(KEY.DONATION_STATS, SEED_DONATION_STATS);
  wx.setStorageSync(KEY.MEMBERS, SEED_MEMBERS);
  if (!wx.getStorageSync(KEY.DONATION_ORDERS)) wx.setStorageSync(KEY.DONATION_ORDERS, []);
  if (!wx.getStorageSync(KEY.RESERVATIONS)) wx.setStorageSync(KEY.RESERVATIONS, []);
  if (!wx.getStorageSync(KEY.ENROLLMENTS)) wx.setStorageSync(KEY.ENROLLMENTS, []);
  if (!wx.getStorageSync(KEY.APPLICATIONS)) wx.setStorageSync(KEY.APPLICATIONS, []);
  wx.setStorageSync(KEY.SEED_VERSION, SEED_VERSION);
}

module.exports = { KEY, ensureMockSeed };
