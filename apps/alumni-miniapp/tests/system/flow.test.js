// tests/system/flow.test.js - 端到端用户旅程
const { loadPage, seed, auth, api } = require('../integration/_helper');

describe('E2E 流程 A — 校友完整旅程', () => {
  beforeEach(() => seed());

  it('从 launch 到退出登录，全链路一致', async () => {
    // 1. launch → goAlumni → navigateTo student-login
    const launch = loadPage('launch');
    launch.goAlumni();
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/student-login/index' });

    // 2. student-login → SSO 登录
    const loginPage = loadPage('student-login');
    loginPage.ssoLogin();
    expect(auth().isAuthenticated()).toBe(true);
    expect(auth().getRole()).toBe('alumni');

    // 3. student-home onShow
    const homePage = loadPage('student-home');
    homePage.onShow();
    await homePage.load();
    expect(homePage.data.news.length).toBeGreaterThan(0);
    expect(homePage.data.donationStats).toBeTruthy();
    expect(homePage.data.user).toBeTruthy();

    // 4. student-activities list 长度 5
    const actsPage = loadPage('student-activities');
    actsPage.onShow();
    await actsPage.load();
    expect(actsPage.data.list).toHaveLength(5);

    // 5. 打开 a1 → enroll
    const detail = loadPage('student-activity-detail');
    detail.onLoad({ id: 'a1' });
    await detail.load();
    const enrolledBefore = detail.data.act.enrolled;
    await detail.enroll();
    expect(detail.data.act.enrolled).toBe(enrolledBefore + 1);

    // 6. student-me 报名 ≥ 1
    const mePage = loadPage('student-me');
    mePage.onShow();
    await mePage.load();
    expect(mePage.data.enrollments.length).toBeGreaterThanOrEqual(1);

    // 7. student-donate 提交 100 元
    const donatePage = loadPage('student-donate');
    donatePage.onShow();
    await donatePage.load();
    donatePage.pickAmount({ currentTarget: { dataset: { v: 100 } } });
    await donatePage.submit();
    const myOrders = await api().getMyDonations('u001');
    expect(myOrders).toHaveLength(1);
    expect(myOrders[0].amount).toBe(100);

    // 8. logout → 登录态清空
    const mePage2 = loadPage('student-me');
    mePage2.logout();
    expect(auth().isAuthenticated()).toBe(false);
  });
});

describe('E2E 流程 B — 管理员完整旅程', () => {
  beforeEach(() => seed());

  it('登录 → 审核 → 发布 → 统计同步', async () => {
    // 1. launch → goAdmin
    const launch = loadPage('launch');
    launch.goAdmin();
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/admin-login/index' });

    // 2. admin-login 正确账号
    const login = loadPage('admin-login');
    login.fillDemo();
    login.login();
    expect(auth().getRole()).toBe('admin');

    // 3. admin-dashboard 初始 stats 验证
    const dash = loadPage('admin-dashboard');
    dash.onShow();
    await dash.load();
    const initStats = { ...dash.data.stats };
    expect(initStats.memberTotal).toBe(6);
    expect(initStats.pendingMembers).toBe(2);
    expect(initStats.activityTotal).toBe(5);
    expect(initStats.newsTotal).toBe(5);

    // 4. admin-members: approve u004
    const mem = loadPage('admin-members');
    mem.onShow();
    await mem.load();
    await mem.approve({ currentTarget: { dataset: { id: 'u004' } } });
    const stat2 = await api().adminStats();
    expect(stat2.pendingMembers).toBe(initStats.pendingMembers - 1);

    // 5. admin-activities: 新建活动
    const actAdmin = loadPage('admin-activities');
    actAdmin.onShow();
    await actAdmin.load();
    actAdmin.toggleForm();
    actAdmin.onF({ currentTarget: { dataset: { k: 'title' } }, detail: { value: '新建活动' } });
    actAdmin.onF({ currentTarget: { dataset: { k: 'date' } }, detail: { value: '2026-07-01' } });
    actAdmin.onF({ currentTarget: { dataset: { k: 'location' } }, detail: { value: '礼堂' } });
    actAdmin.onF({ currentTarget: { dataset: { k: 'capacity' } }, detail: { value: '80' } });
    await actAdmin.create();
    expect(actAdmin.data.list).toHaveLength(6);

    // 6. admin-news: 新建资讯
    const newsAdmin = loadPage('admin-news');
    newsAdmin.onShow();
    await newsAdmin.load();
    newsAdmin.toggleForm();
    newsAdmin.onF({ currentTarget: { dataset: { k: 'title' } }, detail: { value: '新资讯' } });
    newsAdmin.onF({ currentTarget: { dataset: { k: 'summary' } }, detail: { value: 'xxx' } });
    await newsAdmin.create();
    expect(newsAdmin.data.list).toHaveLength(6);

    // 7. dashboard 再次 onShow → activityTotal/newsTotal 各 +1
    const dash2 = loadPage('admin-dashboard');
    dash2.onShow();
    await dash2.load();
    expect(dash2.data.stats.activityTotal).toBe(initStats.activityTotal + 1);
    expect(dash2.data.stats.newsTotal).toBe(initStats.newsTotal + 1);
    expect(dash2.data.stats.pendingMembers).toBe(initStats.pendingMembers - 1);
  });
});
