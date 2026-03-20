// 导出选项页面交互功能

// 关闭按钮
const closeBtn = document.querySelector('.close-btn');
closeBtn.addEventListener('click', () => {
    // 在实际应用中，这里会关闭弹窗
    alert('关闭导出选项');
});

// 选项卡片选择
const optionCards = document.querySelectorAll('.option-card');
optionCards.forEach(card => {
    card.addEventListener('click', () => {
        const checkbox = card.querySelector('.checkbox');
        checkbox.classList.toggle('checked');
        card.classList.toggle('selected');
    });
});

// 取消按钮
const cancelBtn = document.querySelector('.cancel-btn');
cancelBtn.addEventListener('click', () => {
    // 在实际应用中，这里会关闭弹窗
    alert('取消导出');
});

// 导出格式选择
const formatOptions = document.querySelectorAll('.format-option');
formatOptions.forEach(option => {
    option.addEventListener('click', () => {
        formatOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
    });
});

// 确认导出按钮
const confirmBtn = document.querySelector('.confirm-btn');
confirmBtn.addEventListener('click', () => {
    // 收集选中的选项
    const selectedOptions = [];
    optionCards.forEach(card => {
        if (card.classList.contains('selected')) {
            const optionTitle = card.querySelector('.option-title span').textContent;
            selectedOptions.push(optionTitle);
        }
    });

    if (selectedOptions.length === 0) {
        alert('请至少选择一项导出内容');
        return;
    }

    // 收集选中的导出格式
    const selectedFormat = document.querySelector('.format-option.selected .format-name').textContent;
    
    console.log('选中的导出选项：', selectedOptions);
    console.log('选中的导出格式：', selectedFormat);
    
    // 跳转到导出进度页面
    window.location.href = 'export-progress.html';
});
