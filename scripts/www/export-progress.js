// 导出进度页面交互功能

// 模拟进度更新
let progress = 60;
const progressBar = document.querySelector('.progress-bar');
const progressPercent = document.querySelector('.progress-percent');
const remainingTime = document.querySelector('.remaining-time');

// 模拟进度更新
const progressInterval = setInterval(() => {
    progress += 5;
    if (progress > 100) {
        progress = 100;
        clearInterval(progressInterval);
        // 跳转到导出成功页面
        setTimeout(() => {
            window.location.href = 'export-success.html';
        }, 1000);
    }
    
    // 更新进度条
    progressBar.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;
    
    // 更新剩余时间
    const timeLeft = Math.max(0, Math.ceil((100 - progress) / 5) * 0.5);
    remainingTime.textContent = `剩余时间：约${timeLeft}秒`;
}, 500);

// 取消导出按钮
const cancelExportBtn = document.querySelector('.cancel-export-btn');
cancelExportBtn.addEventListener('click', () => {
    clearInterval(progressInterval);
    alert('导出已取消');
    // 在实际应用中，这里会关闭弹窗或返回上一页
    window.history.back();
});
