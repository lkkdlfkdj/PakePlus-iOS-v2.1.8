/**
 * 歌词解析和显示模块
 */
class LyricsManager {
    constructor() {
        this.lyrics = [];
        this.currentIndex = -1;
        this.container = null;
        this.isScrolling = false;
    }

    /**
     * 解析 LRC 格式歌词
     * @param {string} lrcText - LRC 歌词文本
     * @returns {Array} 解析后的歌词数组
     */
    parse(lrcText) {
        if (!lrcText || typeof lrcText !== 'string') {
            return [];
        }

        const lines = lrcText.split('\n');
        const lyrics = [];
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // 匹配所有时间标签
            const timeMatches = [...line.matchAll(timeRegex)];
            if (timeMatches.length === 0) return;

            // 提取歌词文本
            const text = line.replace(timeRegex, '').trim();
            if (!text) return;

            // 为每个时间标签创建一个歌词对象
            timeMatches.forEach(match => {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
                const time = minutes * 60 + seconds + milliseconds / 1000;

                lyrics.push({
                    time: time,
                    text: text,
                    originalLine: line
                });
            });
        });

        // 按时间排序
        lyrics.sort((a, b) => a.time - b.time);

        this.lyrics = lyrics;
        return lyrics;
    }

    /**
     * 设置歌词容器
     * @param {HTMLElement} container - 歌词容器元素
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * 渲染歌词到容器
     */
    render() {
        if (!this.container) return;

        if (this.lyrics.length === 0) {
            this.container.innerHTML = '<div class="lyrics-placeholder">暂无歌词</div>';
            return;
        }

        this.container.innerHTML = this.lyrics.map((item, index) => 
            `<div class="lyrics-line" data-index="${index}" data-time="${item.time}">${this.escapeHtml(item.text)}</div>`
        ).join('');

        // 添加点击事件
        this.container.querySelectorAll('.lyrics-line').forEach(line => {
            line.addEventListener('click', (e) => {
                const time = parseFloat(e.target.dataset.time);
                if (window.player) {
                    window.player.seek(time);
                }
            });
        });

        this.currentIndex = -1;
    }

    /**
     * 更新当前播放位置
     * @param {number} currentTime - 当前播放时间（秒）
     */
    update(currentTime) {
        if (!this.container || this.lyrics.length === 0) return;

        // 找到当前应该高亮的歌词行
        let newIndex = -1;
        for (let i = 0; i < this.lyrics.length; i++) {
            if (this.lyrics[i].time <= currentTime) {
                newIndex = i;
            } else {
                break;
            }
        }

        // 如果索引变化，更新高亮
        if (newIndex !== this.currentIndex) {
            this.currentIndex = newIndex;
            this.highlightLine(newIndex);
        }
    }

    /**
     * 高亮指定行
     * @param {number} index - 歌词行索引
     */
    highlightLine(index) {
        if (!this.container) return;

        const lines = this.container.querySelectorAll('.lyrics-line');
        lines.forEach((line, i) => {
            if (i === index) {
                line.classList.add('active');
                this.scrollToLine(line);
            } else {
                line.classList.remove('active');
            }
        });
    }

    /**
     * 滚动到指定歌词行
     * @param {HTMLElement} line - 歌词行元素
     */
    scrollToLine(line) {
        if (!this.container || this.isScrolling) return;

        const containerHeight = this.container.clientHeight;
        const lineHeight = line.clientHeight;
        const lineTop = line.offsetTop;
        const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2;

        this.container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    }

    /**
     * 清空歌词
     */
    clear() {
        this.lyrics = [];
        this.currentIndex = -1;
        if (this.container) {
            this.container.innerHTML = '<div class="lyrics-placeholder">暂无歌词</div>';
        }
    }

    /**
     * HTML 转义
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 加载歌词文件
     * @param {string} url - 歌词文件 URL
     * @returns {Promise} 加载完成的 Promise
     */
    async loadFromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load lyrics');
            }
            const text = await response.text();
            this.parse(text);
            this.render();
            return true;
        } catch (error) {
            console.warn('Failed to load lyrics:', error);
            this.clear();
            return false;
        }
    }
}

// 创建全局歌词管理器实例
window.lyricsManager = new LyricsManager();
