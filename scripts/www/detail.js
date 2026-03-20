// 导航按钮功能
const backBtn = document.querySelector('.back-btn');
const exportBtn = document.querySelector('.export-btn');
const moreBtn = document.querySelector('.more-btn');

// 返回按钮
backBtn.addEventListener('click', () => {
    window.history.back();
});

// 导出按钮
exportBtn.addEventListener('click', () => {
    window.location.href = 'export-options.html';
});

// 更多按钮
moreBtn.addEventListener('click', () => {
    alert('更多选项功能开发中...');
});

// 星级评分功能
const stars = document.querySelectorAll('.star-rating i');
let selectedRating = 4; // 默认4星

stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        selectedRating = index + 1;
        updateStars();
    });
});

function updateStars() {
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.className = 'ri-star-fill';
        } else {
            star.className = 'ri-star-line';
        }
    });
}

// 提交评价功能
const submitEvaluation = document.querySelector('.submit-evaluation');
const evaluationTextarea = document.querySelector('.evaluation-input textarea');

submitEvaluation.addEventListener('click', () => {
    const evaluationContent = evaluationTextarea.value;
    
    const evaluationData = {
        rating: selectedRating,
        content: evaluationContent
    };
    
    console.log('评价数据：', evaluationData);
    alert('评价提交成功！感谢您的反馈。');
    
    // 清空评价内容
    evaluationTextarea.value = '';
});
