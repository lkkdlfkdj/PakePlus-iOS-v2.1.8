/**
 * 播放列表管理模块
 */
class PlaylistManager {
    constructor() {
        this.songs = [];
        this.currentIndex = 0;
        this.container = null;
        this.onSongSelect = null;
    }

    /**
     * 设置播放列表容器
     * @param {HTMLElement} container - 播放列表容器元素
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * 设置歌曲选择回调
     * @param {Function} callback - 选择歌曲时的回调函数
     */
    setOnSongSelect(callback) {
        this.onSongSelect = callback;
    }

    /**
     * 添加歌曲到播放列表
     * @param {Object} song - 歌曲对象
     * @param {string} song.id - 歌曲ID
     * @param {string} song.title - 歌曲标题
     * @param {string} song.artist - 艺术家
     * @param {string} song.url - 音频URL
     * @param {string} song.cover - 封面图片URL
     * @param {string} song.lyrics - 歌词URL或文本
     * @param {number} song.duration - 时长（秒）
     */
    addSong(song) {
        if (!song.id) {
            song.id = 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        this.songs.push(song);
        this.render();
        this.updateCount();
    }

    /**
     * 批量添加歌曲
     * @param {Array} songs - 歌曲数组
     */
    addSongs(songs) {
        songs.forEach(song => {
            if (!song.id) {
                song.id = 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
        });
        this.songs.push(...songs);
        this.render();
        this.updateCount();
    }

    /**
     * 移除歌曲
     * @param {string} songId - 歌曲ID
     */
    removeSong(songId) {
        const index = this.songs.findIndex(s => s.id === songId);
        if (index > -1) {
            this.songs.splice(index, 1);
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = Math.max(0, this.songs.length - 1);
            }
            this.render();
            this.updateCount();
        }
    }

    /**
     * 清空播放列表
     */
    clear() {
        this.songs = [];
        this.currentIndex = 0;
        this.render();
        this.updateCount();
    }

    /**
     * 获取当前歌曲
     * @returns {Object|null} 当前歌曲对象
     */
    getCurrentSong() {
        if (this.songs.length === 0) return null;
        return this.songs[this.currentIndex];
    }

    /**
     * 获取下一首歌曲
     * @param {string} mode - 播放模式: 'sequence' | 'random' | 'single' | 'loop'
     * @returns {Object|null} 下一首歌曲对象
     */
    getNextSong(mode = 'sequence') {
        if (this.songs.length === 0) return null;

        switch (mode) {
            case 'random':
                // 随机播放（避免连续播放同一首）
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * this.songs.length);
                } while (nextIndex === this.currentIndex && this.songs.length > 1);
                this.currentIndex = nextIndex;
                break;

            case 'single':
                // 单曲循环，不改变索引
                break;

            case 'loop':
                // 列表循环
                this.currentIndex = (this.currentIndex + 1) % this.songs.length;
                break;

            case 'sequence':
            default:
                // 顺序播放
                if (this.currentIndex < this.songs.length - 1) {
                    this.currentIndex++;
                } else {
                    return null; // 列表结束
                }
                break;
        }

        return this.getCurrentSong();
    }

    /**
     * 获取上一首歌曲
     * @returns {Object|null} 上一首歌曲对象
     */
    getPrevSong() {
        if (this.songs.length === 0) return null;

        this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
        return this.getCurrentSong();
    }

    /**
     * 切换到指定索引的歌曲
     * @param {number} index - 歌曲索引
     * @returns {Object|null} 歌曲对象
     */
    goToIndex(index) {
        if (index < 0 || index >= this.songs.length) return null;
        this.currentIndex = index;
        this.render();
        return this.getCurrentSong();
    }

    /**
     * 切换到指定歌曲
     * @param {string} songId - 歌曲ID
     * @returns {Object|null} 歌曲对象
     */
    goToSong(songId) {
        const index = this.songs.findIndex(s => s.id === songId);
        if (index > -1) {
            return this.goToIndex(index);
        }
        return null;
    }

    /**
     * 渲染播放列表
     */
    render() {
        if (!this.container) return;

        if (this.songs.length === 0) {
            this.container.innerHTML = '<div class="playlist-empty">播放列表为空</div>';
            return;
        }

        this.container.innerHTML = this.songs.map((song, index) => {
            const isActive = index === this.currentIndex;
            const isPlaying = isActive && window.player && window.player.isPlaying;
            
            return `
                <div class="playlist-item ${isActive ? 'active' : ''} ${isPlaying ? 'playing' : ''}" 
                     data-index="${index}" 
                     data-id="${song.id}">
                    <div class="song-number">${index + 1}</div>
                    <div class="playing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="song-info-mini">
                        <div class="song-name">${this.escapeHtml(song.title)}</div>
                        <div class="song-artist-mini">${this.escapeHtml(song.artist)}</div>
                    </div>
                    <div class="song-duration">${this.formatTime(song.duration)}</div>
                </div>
            `;
        }).join('');

        // 添加点击事件
        this.container.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(item.dataset.index, 10);
                const song = this.goToIndex(index);
                if (song && this.onSongSelect) {
                    this.onSongSelect(song);
                }
            });
        });
    }

    /**
     * 更新当前播放状态
     * @param {boolean} isPlaying - 是否正在播放
     */
    updatePlayingState(isPlaying) {
        if (!this.container) return;

        const items = this.container.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            if (index === this.currentIndex) {
                if (isPlaying) {
                    item.classList.add('playing');
                } else {
                    item.classList.remove('playing');
                }
            } else {
                item.classList.remove('playing');
            }
        });
    }

    /**
     * 更新歌曲数量显示
     */
    updateCount() {
        const countElement = document.getElementById('playlist-count');
        if (countElement) {
            countElement.textContent = `${this.songs.length} 首歌曲`;
        }
    }

    /**
     * 格式化时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * HTML 转义
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 获取播放列表长度
     * @returns {number} 歌曲数量
     */
    getLength() {
        return this.songs.length;
    }

    /**
     * 获取当前索引
     * @returns {number} 当前歌曲索引
     */
    getCurrentIndex() {
        return this.currentIndex;
    }
}

// 创建全局播放列表管理器实例
window.playlistManager = new PlaylistManager();
