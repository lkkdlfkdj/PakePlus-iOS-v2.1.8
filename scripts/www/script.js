// 定位按钮功能
const locateBtn = document.querySelector('.locate-btn');
locateBtn.addEventListener('click', () => {
    // 模拟定位功能
    alert('正在获取您的位置...');
    setTimeout(() => {
        alert('定位成功！');
    }, 1000);
});

// 编辑地址按钮功能
const editBtn = document.querySelector('.edit-btn');
editBtn.addEventListener('click', () => {
    const address = document.querySelector('.address');
    const newAddress = prompt('请输入新的地址：', address.textContent);
    if (newAddress) {
        address.textContent = newAddress;
    }
});



// 现场照片上传功能
const photoInput = document.querySelector('.photo-input');
const photoGrid = document.querySelector('.photo-grid');
const addPhotoItem = document.querySelector('.add-photo');
let uploadedPhotos = 2; // 初始化为2，因为已有两张示例照片
const maxPhotos = 9;

photoInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            if (uploadedPhotos >= maxPhotos) break;
            
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const photoPreview = document.createElement('div');
                    photoPreview.className = 'photo-item';
                    photoPreview.innerHTML = `
                        <img src="${event.target.result}" alt="现场照片">
                        <div class="delete-btn">
                            <i class="ri-close-line"></i>
                        </div>
                    `;
                    
                    // 添加删除照片功能
                    const removeBtn = photoPreview.querySelector('.delete-btn');
                    removeBtn.addEventListener('click', () => {
                        photoPreview.remove();
                        uploadedPhotos--;
                        // 如果删除后数量小于最大值，显示添加按钮
                        if (uploadedPhotos < maxPhotos && !addPhotoItem.parentElement) {
                            photoGrid.appendChild(addPhotoItem);
                        }
                    });
                    
                    // 在添加按钮前插入预览图
                    photoGrid.insertBefore(photoPreview, addPhotoItem);
                    uploadedPhotos++;
                    
                    // 如果达到最大数量，隐藏添加按钮
                    if (uploadedPhotos >= maxPhotos) {
                        addPhotoItem.remove();
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }
});

// 删除示例照片的功能
const deleteButtons = document.querySelectorAll('.photo-item .delete-btn');
deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
        const photoItem = this.closest('.photo-item');
        photoItem.remove();
        uploadedPhotos--;
        // 如果删除后数量小于最大值，显示添加按钮
        if (uploadedPhotos < maxPhotos && !addPhotoItem.parentElement) {
            photoGrid.appendChild(addPhotoItem);
        }
    });
});

// 提交按钮功能
const submitBtn = document.querySelector('.submit-btn');
submitBtn.addEventListener('click', () => {
    // 收集表单数据
    const location = document.querySelector('.address').textContent;
    const ownership = document.querySelector('#ownershipType').value;
    const hazardType = document.querySelector('#hazardType').value;
    
    // 构建表单数据对象
    const formData = {
        location,
        ownership,
        hazardType,
        photos: uploadedPhotos
    };
    
    // 模拟表单提交
    console.log('表单数据：', formData);
    
    // 跳转到成功页面
    window.location.href = 'success.html';
});
