// 成功页面按钮功能
const viewRecordBtn = document.querySelector('.view-record-btn');
const continueReportBtn = document.querySelector('.continue-report-btn');
const backHomeBtn = document.querySelector('.back-home-btn');

// 查看上报记录按钮
viewRecordBtn.addEventListener('click', () => {
    window.location.href = 'detail.html';
});

// 继续上报其他隐患按钮
continueReportBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// 返回首页按钮
backHomeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});
