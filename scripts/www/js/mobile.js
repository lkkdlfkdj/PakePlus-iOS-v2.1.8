/**
 * 移动端适配模块
 * 处理触摸事件、页面切换、移动端优化
 */
class MobileAdapter {
    constructor() {
        this.isMobile = this.checkIsMobile();
        this.currentPage = 'player';
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.init();
    }

    /**
     * 检查是否为移动设备
     */
    checkIsMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || window.innerWidth <= 768;
    }

    /**
     * 初始化
     */
    init() {
        if (!this.isMobile) return;

        this.bindEvents();
        this.initTouchEvents();
        this.initSwipeGestures();
        this.optimizeForMobile();
        
        // 默认显示播放器页面
        this.showPage('player');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 底部导航切换
        const navItems = document.querySelectorAll('.mobile-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                this.showPage(page);
                this.updateNavActive(item);
            });
        });

        // 窗口大小改变时重新检测
        window.addEventListener('resize', () => {
            this.isMobile = this.checkIsMobile();
        });

        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // 防止页面滚动反弹（iOS）
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.lyrics-content') || 
                e.target.closest('.playlist-container') ||
                e.target.closest('.search-results')) {
                return;
            }
            e.preventDefault();
        }, { passive: false });
    }

    /**
     * 显示指定页面
     */
    showPage(page) {
        this.currentPage = page;

        // 隐藏所有页面
        document.querySelectorAll('.player-left, .player-right').forEach(el => {
            el.classList.remove('active');
        });

        // 显示对应页面
        switch(page) {
            case 'player':
                document.querySelector('.player-left').style.display = 'flex';
                document.querySelector('.player-right').style.display = 'none';
                document.querySelector('.player-left').classList.add('active');
                break;
            case 'playlist':
            case 'discover':
                document.querySelector('.player-left').style.display = 'none';
                document.querySelector('.player-right').style.display = 'flex';
                document.querySelector('.player-right').classList.add('active');
                break;
            case 'lyrics':
                document.querySelector('.player-left').style.display = 'flex';
                document.querySelector('.player-right').style.display = 'none';
                // 歌词全屏显示
                const lyricsContainer = document.querySelector('.lyrics-container');
                if (lyricsContainer) {
                    lyricsContainer.style.maxHeight = '60vh';
                    lyricsContainer.style.flex = '1';
                }
                const coverContainer = document.querySelector('.cover-container');
                if (coverContainer) {
                    coverContainer.style.display = 'none';
                }
                break;
            case 'search':
                // 触发搜索按钮
                document.getElementById('search-btn').click();
                break;
            case 'local':
                // 触发本地音乐按钮
                document.getElementById('local-music-btn').click();
                // 显示播放列表页面
                document.querySelector('.player-left').style.display = 'none';
                document.querySelector('.player-right').style.display = 'flex';
                document.querySelector('.player-right').classList.add('active');
                break;
            case 'playlists':
                // 显示我的歌单管理弹窗
                if (window.player) {
                    window.player.showMyPlaylistsModal();
                }
                break;
        }

        // 恢复歌词页面时的布局
        if (page !== 'lyrics') {
            const lyricsContainer = document.querySelector('.lyrics-container');
            if (lyricsContainer) {
                lyricsContainer.style.maxHeight = '';
                lyricsContainer.style.flex = '';
            }
            const coverContainer = document.querySelector('.cover-container');
            if (coverContainer) {
                coverContainer.style.display = '';
            }
        }
    }

    /**
     * 更新导航激活状态
     */
    updateNavActive(activeItem) {
        document.querySelectorAll('.mobile-nav .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    /**
     * 初始化触摸事件
     */
    initTouchEvents() {
        // 为进度条添加触摸支持
        this.initTouchSlider('progress-bar', 'progress-fill', 'progress-handle', (percent) => {
            if (window.player && window.player.audio.duration) {
                window.player.seek(percent * window.player.audio.duration);
            }
        });

        // 为音量条添加触摸支持
        this.initTouchSlider('volume-slider', 'volume-fill', 'volume-handle', (percent) => {
            if (window.player) {
                window.player.setVolume(percent);
            }
        });
    }

    /**
     * 初始化触摸滑块
     */
    initTouchSlider(barId, fillId, handleId, callback) {
        const bar = document.getElementById(barId);
        const fill = document.getElementById(fillId);
        const handle = document.getElementById(handleId);
        
        if (!bar) return;

        let isDragging = false;

        const updateProgress = (clientX) => {
            const rect = bar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            
            if (fill) fill.style.width = `${percent * 100}%`;
            if (handle) handle.style.left = `${percent * 100}%`;
            
            callback(percent);
        };

        // 触摸开始
        bar.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateProgress(e.touches[0].clientX);
        }, { passive: true });

        // 触摸移动
        bar.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            updateProgress(e.touches[0].clientX);
        }, { passive: false });

        // 触摸结束
        bar.addEventListener('touchend', () => {
            isDragging = false;
        });

        // 触摸取消
        bar.addEventListener('touchcancel', () => {
            isDragging = false;
        });
    }

    /**
     * 初始化滑动手势
     */
    initSwipeGestures() {
        const appContainer = document.querySelector('.app-container');
        
        appContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        appContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            // 水平滑动切换页面
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                const pages = ['player', 'playlist', 'lyrics'];
                const currentIndex = pages.indexOf(this.currentPage);
                
                if (deltaX > 0 && currentIndex > 0) {
                    // 向右滑动，切换到上一个页面
                    this.showPage(pages[currentIndex - 1]);
                    this.updateNavActive(document.querySelector(`[data-page="${pages[currentIndex - 1]}"]`));
                } else if (deltaX < 0 && currentIndex < pages.length - 1) {
                    // 向左滑动，切换到下一个页面
                    this.showPage(pages[currentIndex + 1]);
                    this.updateNavActive(document.querySelector(`[data-page="${pages[currentIndex + 1]}"]`));
                }
            }
        }, { passive: true });
    }

    /**
     * 移动端优化
     */
    optimizeForMobile() {
        // 禁用长按菜单
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 优化滚动性能
        document.querySelectorAll('.lyrics-content, .playlist-container, .search-results').forEach(el => {
            el.style.webkitOverflowScrolling = 'touch';
        });

        // 音频自动播放策略处理
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.addEventListener('play', () => {
                // 请求音频焦点（Android）
                if ('audioSession' in navigator) {
                    navigator.audioSession.type = 'playback';
                }
            });
        }

        // 监听屏幕方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 300);
        });

        // 处理可见性变化（节省电量）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面不可见时，降低动画性能
                document.body.classList.add('low-power');
            } else {
                document.body.classList.remove('low-power');
            }
        });
    }

    /**
     * 处理屏幕方向变化
     */
    handleOrientationChange() {
        const isLandscape = window.orientation === 90 || window.orientation === -90;
        
        if (isLandscape) {
            // 横屏模式：显示所有内容
            document.querySelector('.player-left').style.display = 'flex';
            document.querySelector('.player-right').style.display = 'flex';
        } else {
            // 竖屏模式：根据当前页面显示
            this.showPage(this.currentPage);
        }
    }

    /**
     * 显示提示信息（Toast）
     */
    showToast(message, duration = 2000) {
        // 移除已有的 toast
        const existingToast = document.querySelector('.mobile-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建新的 toast
        const toast = document.createElement('div');
        toast.className = 'mobile-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 24px;
            font-size: 14px;
            z-index: 9999;
            pointer-events: none;
            animation: fadeIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * 震动反馈
     */
    vibrate(pattern = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
}

// 页面加载完成后初始化移动端适配
document.addEventListener('DOMContentLoaded', () => {
    window.mobileAdapter = new MobileAdapter();
});

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
    
    .low-power .cover-wrapper.playing img {
        animation-duration: 40s !important;
    }
    
    .low-power .bg-gradient {
        animation: none !important;
    }
`;
document.head.appendChild(style);
