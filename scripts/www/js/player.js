/**
 * 音乐播放器主模块
 */
class MusicPlayer {
    constructor() {
        // 音频元素
        this.audio = document.getElementById('audio-player');
        
        // 播放状态
        this.isPlaying = false;
        this.playMode = 'sequence'; // sequence, random, single, loop
        this.volume = 0.7;
        this.isMuted = false;
        this.previousVolume = 0.7;
        
        // 进度条拖动状态
        this.isDraggingProgress = false;
        this.isDraggingVolume = false;
        
        // 播放模式配置
        this.playModes = {
            sequence: { icon: 'fa-list-ul', title: '顺序播放' },
            random: { icon: 'fa-random', title: '随机播放' },
            single: { icon: 'fa-redo', title: '单曲循环' },
            loop: { icon: 'fa-infinity', title: '列表循环' }
        };
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化播放器
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.initPlaylist();
        this.initLyrics();
        this.initSearch();
        this.initPlaylistManager();
        this.setVolume(this.volume);
        this.updateModeButton();
        
        // 加载第一首歌
        this.loadCurrentSong();
    }
    
    /**
     * 绑定 DOM 元素
     */
    bindElements() {
        // 控制按钮
        this.playBtn = document.getElementById('play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.modeBtn = document.getElementById('mode-btn');
        this.volumeBtn = document.getElementById('volume-btn');
        this.lyricsToggle = document.getElementById('lyrics-toggle');
        
        // 进度条
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('progress-fill');
        this.progressHandle = document.getElementById('progress-handle');
        
        // 音量条
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeFill = document.getElementById('volume-fill');
        this.volumeHandle = document.getElementById('volume-handle');
        
        // 时间显示
        this.currentTimeEl = document.getElementById('current-time');
        this.totalTimeEl = document.getElementById('total-time');
        
        // 歌曲信息
        this.songTitleEl = document.getElementById('song-title');
        this.songArtistEl = document.getElementById('song-artist');
        this.coverImg = document.getElementById('cover-img');
        this.coverWrapper = document.querySelector('.cover-wrapper');
        
        // 歌词容器
        this.lyricsContent = document.getElementById('lyrics-content');
        this.lyricsContainer = document.querySelector('.lyrics-container');
        
        // 搜索相关元素
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchModal = document.getElementById('search-modal');
        this.searchResults = document.getElementById('search-results');
        this.searchModalTitle = document.getElementById('search-modal-title');
        this.closeSearchModal = document.getElementById('close-search-modal');
        this.hotSearchBtn = document.getElementById('hot-search-btn');
        this.hotSearchModal = document.getElementById('hot-search-modal');
        this.hotSearchList = document.getElementById('hot-search-list');
        this.closeHotSearch = document.getElementById('close-hot-search');
        this.recommendBtn = document.getElementById('recommend-btn');
        this.playlistModal = document.getElementById('playlist-modal');
        this.recommendPlaylists = document.getElementById('recommend-playlists');
        this.closePlaylistModal = document.getElementById('close-playlist-modal');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.playlistTitle = document.getElementById('playlist-title');
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 播放控制
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrev());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.modeBtn.addEventListener('click', () => this.switchMode());
        
        // 歌词开关
        this.lyricsToggle.addEventListener('click', () => this.toggleLyrics());
        
        // 音量控制
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        
        // 音频事件
        this.audio.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.onError(e));
        
        // 进度条拖动
        this.bindProgressBarEvents();
        
        // 音量条拖动
        this.bindVolumeBarEvents();
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // 搜索弹窗关闭
        this.closeSearchModal.addEventListener('click', () => this.hideSearchModal());
        this.closeHotSearch.addEventListener('click', () => this.hideHotSearchModal());
        this.closePlaylistModal.addEventListener('click', () => this.hidePlaylistModal());
        
        // 点击弹窗外部关闭
        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) this.hideSearchModal();
        });
        this.hotSearchModal.addEventListener('click', (e) => {
            if (e.target === this.hotSearchModal) this.hideHotSearchModal();
        });
        this.playlistModal.addEventListener('click', (e) => {
            if (e.target === this.playlistModal) this.hidePlaylistModal();
        });
    }
    
    /**
     * 初始化搜索功能
     */
    initSearch() {
        // 搜索按钮点击
        this.searchBtn.addEventListener('click', () => this.performSearch());
        
        // 输入框回车搜索
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // 清空搜索按钮
        this.clearSearchBtn = document.getElementById('clear-search');
        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.clearSearchBtn.style.display = 'none';
            this.searchInput.focus();
        });
        
        // 搜索输入时显示清空按钮
        this.searchInput.addEventListener('input', () => {
            this.clearSearchBtn.style.display = this.searchInput.value ? 'flex' : 'none';
        });
        
        // 热门搜索按钮
        this.hotSearchBtn.addEventListener('click', () => this.showHotSearch());
        
        // 推荐歌单按钮
        this.recommendBtn.addEventListener('click', () => this.showRecommendPlaylists());
        
        // 本地音乐按钮
        this.localMusicBtn = document.getElementById('local-music-btn');
        this.localMusicInput = document.getElementById('local-music-input');
        
        this.localMusicBtn.addEventListener('click', () => {
            this.localMusicInput.click();
        });
        
        this.localMusicInput.addEventListener('change', (e) => this.handleLocalMusic(e));
        
        // MusicFree 插件切换
        this.pluginSwitchBtn = document.getElementById('plugin-switch-btn');
        this.pluginModal = document.getElementById('plugin-modal');
        
        this.pluginSwitchBtn.addEventListener('click', () => this.showPluginModal());
        document.getElementById('close-plugin-modal').addEventListener('click', () => this.hidePluginModal());
        this.pluginModal.addEventListener('click', (e) => {
            if (e.target === this.pluginModal) this.hidePluginModal();
        });
        
        // 初始化插件列表
        this.renderPluginList();
    }
    
    /**
     * 渲染插件列表
     */
    renderPluginList() {
        const pluginList = document.getElementById('plugin-list');
        if (!pluginList || !window.musicFreePluginManager) return;
        
        const plugins = window.musicFreePluginManager.getAllPlugins();
        const activePlugin = window.musicFreePluginManager.getActivePlugin();
        
        const pluginIcons = {
            // 中国音乐平台
            'netease': { icon: '🎵', color: '#e31436' },
            'migu': { icon: '🎶', color: '#ff6600' },
            'kuwo': { icon: '🎸', color: '#00a0e9' },
            'qq': { icon: '💚', color: '#12b7f5' },
            // 免费音乐
            'free': { icon: '🎧', color: '#6c5ce7' },
            'openwhyd': { icon: '🌐', color: '#00d2d3' },
            // 国外平台
            'youtube': { icon: '▶️', color: '#ff0000' },
            'bilibili': { icon: '📺', color: '#00a1d6' },
            'audiomack': { icon: '🎤', color: '#ff6b35' },
            // AI音乐
            'suno': { icon: '🤖', color: '#a855f7' },
            'udio': { icon: '🎹', color: '#ec4899' },
            // 其他
            'maoerfm': { icon: '🎧', color: '#f472b6' },
            'yinyuetai': { icon: '📹', color: '#2dd4bf' },
            'kuaishou': { icon: '⚡', color: '#f59e0b' },
            // 歌词
            'geciwang': { icon: '📝', color: '#64748b' },
            'geciqianxun': { icon: '📄', color: '#94a3b8' }
        };
        
        pluginList.innerHTML = plugins.map(plugin => {
            const isActive = activePlugin?.id === plugin.id;
            const iconInfo = pluginIcons[plugin.id] || { icon: '🎵', color: '#666' };
            return `
                <div class="plugin-item ${isActive ? 'active' : ''}" data-plugin="${plugin.id}">
                    <div class="plugin-icon" style="background: ${iconInfo.color}">${iconInfo.icon}</div>
                    <div class="plugin-info">
                        <div class="plugin-name">${plugin.name}</div>
                        <div class="plugin-desc">${plugin.description}</div>
                    </div>
                    <div class="plugin-check"><i class="fas fa-check"></i></div>
                </div>
            `;
        }).join('');
        
        // 绑定点击事件
        pluginList.querySelectorAll('.plugin-item').forEach(item => {
            item.addEventListener('click', () => {
                const pluginId = item.dataset.plugin;
                this.switchPlugin(pluginId);
            });
        });
    }
    
    /**
     * 显示插件弹窗
     */
    showPluginModal() {
        this.renderPluginList();
        this.pluginModal.classList.add('active');
    }
    
    /**
     * 隐藏插件弹窗
     */
    hidePluginModal() {
        this.pluginModal.classList.remove('active');
    }
    
    /**
     * 切换插件
     */
    switchPlugin(pluginId) {
        if (window.musicFreePluginManager.setActivePlugin(pluginId)) {
            this.renderPluginList();
            this.hidePluginModal();
            const plugin = window.musicFreePluginManager.getActivePlugin();
            this.showToast(`已切换到：${plugin.name}`);
            
            // 如果有搜索关键词，重新搜索
            const keyword = this.searchInput.value.trim();
            if (keyword) {
                this.performSearch();
            }
        }
    }
    
    /**
     * 处理本地音乐文件
     */
    handleLocalMusic(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        this.showLoading();
        
        const localSongs = [];
        let processedCount = 0;
        
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('audio/')) {
                processedCount++;
                return;
            }
            
            const url = URL.createObjectURL(file);
            
            // 尝试读取音频元数据
            const audio = new Audio();
            audio.preload = 'metadata';
            
            audio.onloadedmetadata = () => {
                const song = {
                    id: `local_${Date.now()}_${index}`,
                    title: file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
                    artist: '本地音乐',
                    album: '本地文件',
                    duration: Math.floor(audio.duration) || 0,
                    cover: 'https://picsum.photos/400/400?random=' + (200 + index),
                    url: url,
                    source: 'local',
                    isLocal: true
                };
                
                localSongs.push(song);
                processedCount++;
                
                if (processedCount === files.length) {
                    this.addLocalSongsToPlaylist(localSongs);
                }
            };
            
            audio.onerror = () => {
                // 即使获取不到元数据也添加
                const song = {
                    id: `local_${Date.now()}_${index}`,
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    artist: '本地音乐',
                    album: '本地文件',
                    duration: 0,
                    cover: 'https://picsum.photos/400/400?random=' + (200 + index),
                    url: url,
                    source: 'local',
                    isLocal: true
                };
                
                localSongs.push(song);
                processedCount++;
                
                if (processedCount === files.length) {
                    this.addLocalSongsToPlaylist(localSongs);
                }
            };
            
            audio.src = url;
        });
        
        // 重置文件输入
        event.target.value = '';
    }
    
    /**
     * 添加本地歌曲到播放列表
     */
    addLocalSongsToPlaylist(songs) {
        this.hideLoading();
        
        if (songs.length === 0) {
            this.showToast('没有有效的音频文件');
            return;
        }
        
        // 清空当前播放列表
        window.playlistManager.clear();
        
        // 添加本地歌曲
        window.playlistManager.addSongs(songs);
        
        // 播放第一首
        const firstSong = window.playlistManager.getCurrentSong();
        if (firstSong) {
            this.loadSong(firstSong);
            this.play();
        }
        
        this.playlistTitle.textContent = '本地音乐';
        this.showToast(`已添加 ${songs.length} 首本地歌曲`);
    }
    
    /**
     * 执行搜索 - 使用MusicFree插件系统
     */
    async performSearch() {
        const keyword = this.searchInput.value.trim();
        if (!keyword) return;
        
        this.showLoading();
        
        try {
            let results = [];
            
            // 优先使用MusicFree插件系统搜索
            if (window.musicFreePluginManager) {
                const activePlugin = window.musicFreePluginManager.getActivePlugin();
                results = await window.musicFreePluginManager.searchWithPlugin(activePlugin.id, keyword, 30);
                
                // 如果当前插件没有结果，尝试所有插件
                if (results.length === 0) {
                    results = await window.musicFreePluginManager.search(keyword, 30);
                }
            }
            
            // 如果插件系统没有结果，回退到musicSearch
            if (results.length === 0 && window.musicSearch) {
                results = await window.musicSearch.search(keyword, 20);
            }
            
            this.hideLoading();
            
            if (results.length === 0) {
                this.showToast('未找到相关歌曲，请尝试其他关键词');
            }
            
            this.displaySearchResults(results, keyword);
        } catch (error) {
            this.hideLoading();
            console.error('搜索失败:', error);
            this.showToast('搜索失败，请稍后重试');
        }
    }
    
    /**
     * 显示搜索结果
     */
    displaySearchResults(results, keyword) {
        this.searchModalTitle.textContent = `"${keyword}" 的搜索结果 (${results.length}首)`;
        
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="lyrics-placeholder">未找到相关歌曲</div>';
        } else {
            this.searchResults.innerHTML = results.map((song, index) => `
                <div class="search-result-item" data-index="${index}">
                    <div class="search-result-cover">
                        <img src="${song.cover}" alt="${song.title}" onerror="this.src='https://picsum.photos/400/400?random=${index}'">
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-title">${this.escapeHtml(song.title)}</div>
                        <div class="search-result-artist">${this.escapeHtml(song.artist)}</div>
                    </div>
                    <div class="search-result-album">${this.escapeHtml(song.album || '')}</div>
                    <div class="search-result-duration">${this.formatTime(song.duration)}</div>
                    <button class="add-to-playlist-btn" data-index="${index}" title="添加到播放列表">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `).join('');
            
            // 绑定点击事件
            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', async (e) => {
                    if (e.target.closest('.add-to-playlist-btn')) return;
                    
                    const index = parseInt(item.dataset.index);
                    const song = results[index];
                    await this.playSearchResult(song);
                });
            });
            
            // 绑定添加按钮事件
            this.searchResults.querySelectorAll('.add-to-playlist-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    const song = results[index];
                    await this.addToPlaylist(song);
                });
            });
        }
        
        this.showSearchModal();
    }
    
    /**
     * 播放搜索结果
     */
    async playSearchResult(song) {
        this.showLoading();
        
        try {
            // 获取完整的歌曲信息（包括播放链接和歌词）
            const fullSongInfo = await window.musicSearch.getFullSongInfo(song.id);
            
            if (fullSongInfo) {
                // 添加到播放列表并播放
                window.playlistManager.addSong(fullSongInfo);
                window.playlistManager.goToSong(fullSongInfo.id);
                this.loadSong(fullSongInfo);
                this.play();
                
                // 更新播放列表标题
                this.playlistTitle.textContent = '搜索结果';
            } else {
                alert('无法获取歌曲信息');
            }
        } catch (error) {
            console.error('播放失败:', error);
            alert('播放失败，请尝试其他歌曲');
        } finally {
            this.hideLoading();
            this.hideSearchModal();
        }
    }
    
    /**
     * 添加到播放列表
     */
    async addToPlaylist(song) {
        this.showLoading();
        
        try {
            const fullSongInfo = await window.musicSearch.getFullSongInfo(song.id);
            
            if (fullSongInfo) {
                window.playlistManager.addSong(fullSongInfo);
                
                // 显示提示
                const btn = event.target.closest('.add-to-playlist-btn');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.background = '#4CAF50';
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 1500);
            }
        } catch (error) {
            console.error('添加失败:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 显示热门搜索
     */
    async showHotSearch() {
        this.showLoading();
        
        try {
            const hotKeywords = await window.musicSearch.getHotSearch();
            
            this.hotSearchList.innerHTML = hotKeywords.map(keyword => `
                <span class="hot-search-tag" data-keyword="${this.escapeHtml(keyword)}">${this.escapeHtml(keyword)}</span>
            `).join('');
            
            // 绑定点击事件
            this.hotSearchList.querySelectorAll('.hot-search-tag').forEach(tag => {
                tag.addEventListener('click', () => {
                    this.searchInput.value = tag.dataset.keyword;
                    this.hideHotSearchModal();
                    this.performSearch();
                });
            });
            
            this.hideLoading();
            this.showHotSearchModal();
        } catch (error) {
            this.hideLoading();
            console.error('获取热门搜索失败:', error);
        }
    }
    
    /**
     * 显示推荐歌单
     */
    async showRecommendPlaylists() {
        this.showLoading();
        
        try {
            const playlists = await window.musicSearch.getRecommendPlaylists(10);
            
            if (playlists.length === 0) {
                this.recommendPlaylists.innerHTML = '<div class="lyrics-placeholder">暂无推荐歌单</div>';
            } else {
                this.recommendPlaylists.innerHTML = playlists.map(playlist => `
                    <div class="playlist-card" data-id="${playlist.id}">
                        <div class="playlist-card-cover">
                            <img src="${playlist.cover}" alt="${playlist.name}" onerror="this.src='https://picsum.photos/400/400?random=${playlist.id}'">
                            <div class="playlist-card-play">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                        <div class="playlist-card-name">${this.escapeHtml(playlist.name)}</div>
                        <div class="playlist-card-count">${this.formatPlayCount(playlist.playCount)}次播放</div>
                    </div>
                `).join('');
                
                // 绑定点击事件
                this.recommendPlaylists.querySelectorAll('.playlist-card').forEach(card => {
                    card.addEventListener('click', async () => {
                        const playlistId = card.dataset.id;
                        await this.loadPlaylist(playlistId);
                    });
                });
            }
            
            this.hideLoading();
            this.showPlaylistModal();
        } catch (error) {
            this.hideLoading();
            console.error('获取推荐歌单失败:', error);
        }
    }
    
    /**
     * 加载歌单
     */
    async loadPlaylist(playlistId) {
        this.showLoading();
        
        try {
            const songs = await window.musicSearch.getPlaylistDetail(playlistId);
            
            if (songs.length > 0) {
                // 清空当前播放列表
                window.playlistManager.clear();
                
                // 获取每首歌的详细信息
                const fullSongs = await Promise.all(
                    songs.slice(0, 20).map(song => window.musicSearch.getFullSongInfo(song.id))
                );
                
                // 过滤掉获取失败的歌曲
                const validSongs = fullSongs.filter(s => s !== null);
                
                if (validSongs.length > 0) {
                    window.playlistManager.addSongs(validSongs);
                    
                    // 播放第一首
                    const firstSong = window.playlistManager.getCurrentSong();
                    if (firstSong) {
                        this.loadSong(firstSong);
                        this.play();
                    }
                    
                    this.playlistTitle.textContent = '推荐歌单';
                }
            }
        } catch (error) {
            console.error('加载歌单失败:', error);
            alert('加载歌单失败');
        } finally {
            this.hideLoading();
            this.hidePlaylistModal();
        }
    }
    
    /**
     * 格式化播放次数
     */
    formatPlayCount(count) {
        if (count >= 100000000) {
            return (count / 100000000).toFixed(1) + '亿';
        } else if (count >= 10000) {
            return (count / 10000).toFixed(1) + '万';
        }
        return count.toString();
    }
    
    /**
     * 显示/隐藏弹窗
     */
    showSearchModal() {
        this.searchModal.classList.add('active');
    }
    
    hideSearchModal() {
        this.searchModal.classList.remove('active');
    }
    
    showHotSearchModal() {
        this.hotSearchModal.classList.add('active');
    }
    
    hideHotSearchModal() {
        this.hotSearchModal.classList.remove('active');
    }
    
    showPlaylistModal() {
        this.playlistModal.classList.add('active');
    }
    
    hidePlaylistModal() {
        this.playlistModal.classList.remove('active');
    }
    
    showLoading() {
        this.loadingOverlay.classList.add('active');
    }
    
    hideLoading() {
        this.loadingOverlay.classList.remove('active');
    }
    
    /**
     * HTML 转义
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 绑定进度条事件
     */
    bindProgressBarEvents() {
        const updateProgress = (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const percent = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
            return percent;
        };
        
        const handleStart = (e) => {
            this.isDraggingProgress = true;
            const percent = updateProgress(e);
            this.updateProgressUI(percent);
        };
        
        const handleMove = (e) => {
            if (!this.isDraggingProgress) return;
            e.preventDefault();
            const percent = updateProgress(e);
            this.updateProgressUI(percent);
        };
        
        const handleEnd = (e) => {
            if (!this.isDraggingProgress) return;
            this.isDraggingProgress = false;
            const percent = updateProgress(e);
            this.seek(percent * this.audio.duration);
        };
        
        // 鼠标事件
        this.progressBar.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        
        // 触摸事件
        this.progressBar.addEventListener('touchstart', handleStart, { passive: true });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
        
        // 点击跳转
        this.progressBar.addEventListener('click', (e) => {
            if (this.isDraggingProgress) return;
            const rect = this.progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.seek(percent * this.audio.duration);
        });
    }
    
    /**
     * 绑定音量条事件
     */
    bindVolumeBarEvents() {
        const updateVolume = (e) => {
            const rect = this.volumeSlider.getBoundingClientRect();
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const percent = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
            return percent;
        };
        
        const handleStart = (e) => {
            this.isDraggingVolume = true;
            const percent = updateVolume(e);
            this.setVolume(percent);
        };
        
        const handleMove = (e) => {
            if (!this.isDraggingVolume) return;
            e.preventDefault();
            const percent = updateVolume(e);
            this.setVolume(percent);
        };
        
        const handleEnd = () => {
            this.isDraggingVolume = false;
        };
        
        // 鼠标事件
        this.volumeSlider.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        
        // 触摸事件
        this.volumeSlider.addEventListener('touchstart', handleStart, { passive: true });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
        
        // 点击设置音量
        this.volumeSlider.addEventListener('click', (e) => {
            if (this.isDraggingVolume) return;
            const rect = this.volumeSlider.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.setVolume(percent);
        });
    }
    
    /**
     * 初始化播放列表
     */
    initPlaylist() {
        const playlistContainer = document.getElementById('playlist-container');
        window.playlistManager.setContainer(playlistContainer);
        window.playlistManager.setOnSongSelect((song) => {
            this.loadSong(song);
            this.play();
        });
        
        // 添加免费音乐库的歌曲（完整版）
        const freeMusic = window.musicSearch.getFreeMusicLibrary();
        window.playlistManager.addSongs(freeMusic);
        
        // 更新播放列表标题
        this.playlistTitle.textContent = '免费音乐库（完整版）';
    }

    /**
     * 加载免费音乐库
     */
    loadFreeMusicLibrary() {
        this.showLoading();
        
        try {
            // 清空当前播放列表
            window.playlistManager.clear();
            
            // 获取免费音乐
            const freeMusic = window.musicSearch.getFreeMusicLibrary();
            window.playlistManager.addSongs(freeMusic);
            
            // 播放第一首
            const firstSong = window.playlistManager.getCurrentSong();
            if (firstSong) {
                this.loadSong(firstSong);
                this.play();
            }
            
            this.playlistTitle.textContent = '免费音乐库（完整版）';
            this.showToast('已加载免费音乐库，所有歌曲都是完整版！');
        } catch (error) {
            console.error('加载免费音乐库失败:', error);
            this.showToast('加载失败，请重试');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 加载Openwhyd免费音乐
     */
    async loadOpenwhydMusic(genre = 'electro') {
        this.showLoading();
        
        try {
            const music = await window.musicSearch.getOpenwhydMusic(genre);
            
            if (music.length > 0) {
                // 清空当前播放列表
                window.playlistManager.clear();
                window.playlistManager.addSongs(music);
                
                // 播放第一首
                const firstSong = window.playlistManager.getCurrentSong();
                if (firstSong) {
                    this.loadSong(firstSong);
                    this.play();
                }
                
                this.playlistTitle.textContent = 'Openwhyd 免费音乐';
                this.showToast(`已加载 ${music.length} 首免费音乐！`);
            } else {
                this.showToast('暂无音乐，请尝试其他分类');
            }
        } catch (error) {
            console.error('加载Openwhyd音乐失败:', error);
            this.showToast('加载失败，请重试');
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 初始化歌词
     */
    initLyrics() {
        window.lyricsManager.setContainer(this.lyricsContent);
        
        // 示例歌词
        const sampleLyrics = `[00:00.00]欢迎使用随便听
[00:03.00]搜索你想听的歌曲
[00:06.00]享受美妙的音乐时光
[00:10.00]
[00:15.00]支持功能：
[00:18.00]• 在线搜索音乐
[00:21.00]• 热门歌曲推荐
[00:24.00]• 歌单播放
[00:27.00]• 歌词同步显示
[00:30.00]
[00:35.00]开始你的音乐之旅吧！`;
        
        window.lyricsManager.parse(sampleLyrics);
        window.lyricsManager.render();
    }
    
    /**
     * 加载当前歌曲
     */
    loadCurrentSong() {
        const song = window.playlistManager.getCurrentSong();
        if (song) {
            this.loadSong(song);
        }
    }
    
    /**
     * 加载指定歌曲
     * @param {Object} song - 歌曲对象
     */
    loadSong(song) {
        if (!song) return;
        
        // 更新音频源
        this.audio.src = song.url;
        this.audio.load();
        
        // 更新 UI
        const isRealMusic = song.isRealMusic || song.url?.includes('music.163.com');
        const isFreeMusic = song.source === 'free' || song.url?.includes('soundhelix');
        const isLocalMusic = song.source === 'local' || song.isLocal;
        let titlePrefix = '';
        if (isLocalMusic) {
            titlePrefix = '[本地] ';
        } else if (isFreeMusic) {
            titlePrefix = '[完整版] ';
        } else if (!isRealMusic) {
            titlePrefix = '[试听] ';
        }
        this.songTitleEl.textContent = titlePrefix + song.title;
        this.songArtistEl.textContent = song.artist;
        this.coverImg.src = song.cover;
        
        // 更新播放列表高亮
        window.playlistManager.render();
        
        // 重置进度
        this.updateProgressUI(0);
        this.currentTimeEl.textContent = '0:00';
        
        // 加载歌词
        if (song.lyrics && isRealMusic) {
            window.lyricsManager.parse(song.lyrics);
            window.lyricsManager.render();
        } else if (isLocalMusic) {
            // 本地音乐的提示歌词
            const defaultLyrics = `[00:00.00]${song.title}
[00:03.00]演唱：${song.artist}
[00:06.00]
[00:10.00]✓ 本地音乐文件
[00:15.00]来自您的设备
[00:20.00]可完整播放
[00:25.00]
[00:30.00]享受音乐！`;
            window.lyricsManager.parse(defaultLyrics);
            window.lyricsManager.render();
        } else if (isFreeMusic) {
            // 免费音乐库的提示歌词
            const defaultLyrics = `[00:00.00]${song.title}
[00:03.00]演唱：${song.artist}
[00:06.00]
[00:10.00]✓ 完整版音乐
[00:15.00]来自免费音乐库
[00:20.00]可完整播放，无版权限制
[00:25.00]
[00:30.00]享受音乐！`;
            window.lyricsManager.parse(defaultLyrics);
            window.lyricsManager.render();
        } else {
            // 使用默认歌词
            const defaultLyrics = `[00:00.00]${song.title}
[00:03.00]演唱：${song.artist}
[00:06.00]
[00:10.00]正在播放...
[00:15.00]享受音乐时光`;
            window.lyricsManager.parse(defaultLyrics);
            window.lyricsManager.render();
        }
    }
    
    /**
     * 播放/暂停切换
     */
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * 播放
     */
    play() {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('播放失败:', error);
            });
        }
    }
    
    /**
     * 暂停
     */
    pause() {
        this.audio.pause();
    }
    
    /**
     * 播放上一首
     */
    playPrev() {
        const song = window.playlistManager.getPrevSong();
        if (song) {
            this.loadSong(song);
            this.play();
        }
    }
    
    /**
     * 播放下一首
     */
    playNext() {
        const song = window.playlistManager.getNextSong(this.playMode);
        if (song) {
            this.loadSong(song);
            this.play();
        }
    }
    
    /**
     * 切换播放模式
     */
    switchMode() {
        const modes = ['sequence', 'random', 'single', 'loop'];
        const currentIndex = modes.indexOf(this.playMode);
        this.playMode = modes[(currentIndex + 1) % modes.length];
        this.updateModeButton();
    }
    
    /**
     * 更新播放模式按钮
     */
    updateModeButton() {
        const mode = this.playModes[this.playMode];
        this.modeBtn.innerHTML = `<i class="fas ${mode.icon}"></i>`;
        this.modeBtn.title = mode.title;
    }
    
    /**
     * 切换歌词显示
     */
    toggleLyrics() {
        this.lyricsContainer.classList.toggle('hidden');
        this.lyricsToggle.classList.toggle('active');
    }
    
    /**
     * 跳转指定时间
     * @param {number} time - 时间（秒）
     */
    seek(time) {
        if (isNaN(time) || !isFinite(time)) return;
        this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    }
    
    /**
     * 设置音量
     * @param {number} volume - 音量（0-1）
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        
        // 更新 UI
        const percent = this.volume * 100;
        this.volumeFill.style.width = `${percent}%`;
        this.volumeHandle.style.left = `${percent}%`;
        
        // 更新音量图标
        this.updateVolumeIcon();
        
        // 如果音量大于0，取消静音
        if (this.volume > 0 && this.isMuted) {
            this.isMuted = false;
        }
    }
    
    /**
     * 切换静音
     */
    toggleMute() {
        if (this.isMuted) {
            this.isMuted = false;
            this.setVolume(this.previousVolume || 0.7);
        } else {
            this.previousVolume = this.volume;
            this.isMuted = true;
            this.audio.volume = 0;
            this.volumeFill.style.width = '0%';
            this.volumeHandle.style.left = '0%';
        }
        this.updateVolumeIcon();
    }
    
    /**
     * 更新音量图标
     */
    updateVolumeIcon() {
        const icon = this.volumeBtn.querySelector('i');
        const vol = this.isMuted ? 0 : this.volume;
        
        if (vol === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (vol < 0.3) {
            icon.className = 'fas fa-volume-off';
        } else if (vol < 0.7) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }
    
    /**
     * 更新进度条 UI
     * @param {number} percent - 进度百分比（0-1）
     */
    updateProgressUI(percent) {
        const p = Math.max(0, Math.min(1, percent)) * 100;
        this.progressFill.style.width = `${p}%`;
        this.progressHandle.style.left = `${p}%`;
    }
    
    /**
     * 格式化时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ========== 音频事件处理 ==========
    
    onLoadedMetadata() {
        this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
        
        // 更新播放列表中的时长
        const currentSong = window.playlistManager.getCurrentSong();
        if (currentSong && currentSong.duration === 0) {
            currentSong.duration = this.audio.duration;
            window.playlistManager.render();
        }
    }
    
    onTimeUpdate() {
        if (this.isDraggingProgress) return;
        
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        
        if (duration > 0) {
            const percent = currentTime / duration;
            this.updateProgressUI(percent);
            this.currentTimeEl.textContent = this.formatTime(currentTime);
        }
        
        // 更新歌词
        window.lyricsManager.update(currentTime);
    }
    
    onEnded() {
        if (this.playMode === 'single') {
            this.audio.currentTime = 0;
            this.play();
        } else {
            this.playNext();
        }
    }
    
    onPlay() {
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.coverWrapper.classList.add('playing');
        window.playlistManager.updatePlayingState(true);
    }
    
    onPause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.coverWrapper.classList.remove('playing');
        window.playlistManager.updatePlayingState(false);
    }
    
    onError(e) {
        console.error('音频加载错误:', e);
        console.error('错误代码:', this.audio.error ? this.audio.error.code : 'unknown');
        console.error('错误信息:', this.audio.error ? this.audio.error.message : 'unknown');
        
        const currentSong = window.playlistManager.getCurrentSong();
        
        // 如果是网易云音乐且加载失败，尝试切换到免费音乐库
        if (currentSong && currentSong.source === 'netease') {
            this.showToast('该歌曲无法播放，正在切换到免费音乐库...');
            
            // 加载免费音乐库
            setTimeout(() => {
                this.loadFreeMusicLibrary();
            }, 1500);
            return;
        }
        
        // 显示错误提示
        this.showToast('歌曲加载失败，自动切换到下一首...');
        
        // 3秒后自动播放下一首
        setTimeout(() => {
            this.playNext();
        }, 2000);
    }
    
    // ========== 键盘快捷键 ==========
    
    onKeyDown(e) {
        // 空格键：播放/暂停
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.togglePlay();
        }
        
        // 左箭头：上一首
        if (e.code === 'ArrowLeft' && e.ctrlKey) {
            e.preventDefault();
            this.playPrev();
        }
        
        // 右箭头：下一首
        if (e.code === 'ArrowRight' && e.ctrlKey) {
            e.preventDefault();
            this.playNext();
        }
        
        // 上箭头：增加音量
        if (e.code === 'ArrowUp' && e.ctrlKey) {
            e.preventDefault();
            this.setVolume(this.volume + 0.1);
        }
        
        // 下箭头：减小音量
        if (e.code === 'ArrowDown' && e.ctrlKey) {
            e.preventDefault();
            this.setVolume(this.volume - 0.1);
        }
        
        // M 键：静音
        if (e.code === 'KeyM') {
            this.toggleMute();
        }
        
        // ESC 键：关闭弹窗
        if (e.code === 'Escape') {
            this.hideSearchModal();
            this.hideHotSearchModal();
            this.hidePlaylistModal();
            this.hideMyPlaylistsModal();
            this.hideCreatePlaylistModal();
        }
    }
    
    // ========== 播放列表管理 ==========
    
    /**
     * 初始化播放列表管理
     */
    initPlaylistManager() {
        // 绑定播放列表管理相关元素
        this.myPlaylistsModal = document.getElementById('my-playlists-modal');
        this.createPlaylistModal = document.getElementById('create-playlist-modal');
        this.myPlaylistsGrid = document.getElementById('my-playlists-grid');
        this.newPlaylistName = document.getElementById('new-playlist-name');
        this.newPlaylistDesc = document.getElementById('new-playlist-desc');
        
        // 绑定事件
        document.getElementById('close-my-playlists').addEventListener('click', () => this.hideMyPlaylistsModal());
        document.getElementById('close-create-playlist').addEventListener('click', () => this.hideCreatePlaylistModal());
        document.getElementById('create-playlist-btn').addEventListener('click', () => this.showCreatePlaylistModal());
        document.getElementById('confirm-create-btn').addEventListener('click', () => this.createNewPlaylist());
        
        // 点击外部关闭
        this.myPlaylistsModal.addEventListener('click', (e) => {
            if (e.target === this.myPlaylistsModal) this.hideMyPlaylistsModal();
        });
        this.createPlaylistModal.addEventListener('click', (e) => {
            if (e.target === this.createPlaylistModal) this.hideCreatePlaylistModal();
        });
        
        // 加载当前播放列表
        this.loadCurrentPlaylist();
        
        // 初始化发现页面
        this.initDiscoverPage();
    }
    
    /**
     * 初始化发现页面（汽水音乐风格）
     */
    initDiscoverPage() {
        this.categoryGrid = document.getElementById('category-grid');
        this.categorySongs = document.getElementById('category-songs');
        this.discoverPage = document.getElementById('discover-page');
        
        if (!this.categoryGrid || !window.musicSearch) return;
        
        // 渲染分类
        const categories = window.musicSearch.getCategories();
        this.categoryGrid.innerHTML = categories.map(cat => `
            <div class="category-item" data-category="${cat.id}" style="background: linear-gradient(135deg, ${cat.color}, ${this.adjustColor(cat.color, -30)})">
                <i class="fas ${cat.icon}"></i>
                <span>${cat.name}</span>
            </div>
        `).join('');
        
        // 绑定分类点击事件
        this.categoryGrid.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.showCategorySongs(category);
            });
        });
        
        // 默认显示全部歌曲
        this.showCategorySongs('chill');
    }
    
    /**
     * 调整颜色亮度
     */
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * 显示分类歌曲
     */
    showCategorySongs(category) {
        if (!this.categorySongs || !window.musicSearch) return;
        
        const songs = window.musicSearch.getCategoryMusic(category);
        const categories = window.musicSearch.getCategories();
        const catInfo = categories.find(c => c.id === category);
        
        // 更新分类歌曲列表
        this.categorySongs.innerHTML = `
            <div class="category-songs-header">
                <h3>${catInfo ? catInfo.name : '全部'}音乐</h3>
                <button onclick="window.player.playCategory('${category}')">播放全部</button>
            </div>
            <div class="category-song-list">
                ${songs.map((song, index) => `
                    <div class="category-song-item" data-index="${index}" onclick="window.player.playCategorySong('${category}', ${index})">
                        <div class="category-song-cover">
                            <img src="${song.cover}" alt="${song.title}" onerror="this.src='https://picsum.photos/400/400?random=1'">
                        </div>
                        <div class="category-song-info">
                            <div class="category-song-title">${this.escapeHtml(song.title)}</div>
                            <div class="category-song-artist">${this.escapeHtml(song.artist)}</div>
                        </div>
                        <div class="category-song-duration">${this.formatTime(song.duration)}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 记录当前分类
        this.currentCategory = category;
    }
    
    /**
     * 播放分类歌曲
     */
    playCategory(category) {
        if (!window.musicSearch) return;
        
        const songs = window.musicSearch.getCategoryMusic(category);
        if (songs.length > 0) {
            window.playlistManager.clear();
            window.playlistManager.addSongs(songs);
            const firstSong = window.playlistManager.getCurrentSong();
            if (firstSong) {
                this.loadSong(firstSong);
                this.play();
            }
            
            const categories = window.musicSearch.getCategories();
            const catInfo = categories.find(c => c.id === category);
            this.playlistTitle.textContent = catInfo ? catInfo.name + '音乐' : '分类音乐';
            this.showToast('正在播放：' + (catInfo ? catInfo.name : '分类') + '音乐');
        }
    }
    
    /**
     * 播放分类中的指定歌曲
     */
    playCategorySong(category, index) {
        if (!window.musicSearch) return;
        
        const songs = window.musicSearch.getCategoryMusic(category);
        
        if (this.currentCategory !== category || window.playlistManager.getCurrentSong() === null) {
            window.playlistManager.clear();
            window.playlistManager.addSongs(songs);
            this.currentCategory = category;
        }
        
        const song = window.playlistManager.getSongByIndex(index);
        if (song) {
            window.playlistManager.setCurrentIndex(index);
            this.loadSong(song);
            this.play();
        }
    }
    
    /**
     * 显示发现页面
     */
    showDiscoverPage() {
        if (this.discoverPage) {
            this.discoverPage.classList.add('active');
            document.querySelector('.player-main').style.display = 'none';
            document.querySelector('.player-controls').style.display = 'none';
        }
    }
    
    /**
     * 隐藏发现页面
     */
    hideDiscoverPage() {
        if (this.discoverPage) {
            this.discoverPage.classList.remove('active');
            document.querySelector('.player-main').style.display = '';
            document.querySelector('.player-controls').style.display = '';
        }
    }
    
    /**
     * 显示我的歌单弹窗
     */
    showMyPlaylistsModal() {
        this.renderMyPlaylists();
        this.myPlaylistsModal.classList.add('active');
    }
    
    /**
     * 隐藏我的歌单弹窗
     */
    hideMyPlaylistsModal() {
        this.myPlaylistsModal.classList.remove('active');
    }
    
    /**
     * 显示创建歌单弹窗
     */
    showCreatePlaylistModal() {
        this.newPlaylistName.value = '';
        this.newPlaylistDesc.value = '';
        this.createPlaylistModal.classList.add('active');
        this.newPlaylistName.focus();
    }
    
    /**
     * 隐藏创建歌单弹窗
     */
    hideCreatePlaylistModal() {
        this.createPlaylistModal.classList.remove('active');
    }
    
    /**
     * 渲染我的歌单列表
     */
    renderMyPlaylists() {
        if (!this.myPlaylistsGrid) return;
        
        const playlists = window.playlistStorage.getAllPlaylists();
        
        this.myPlaylistsGrid.innerHTML = playlists.map(playlist => `
            <div class="playlist-card-item" data-id="${playlist.id}">
                <div class="playlist-card-cover">
                    <img src="${playlist.cover}" alt="${playlist.name}" onerror="this.src='https://picsum.photos/400/400?random=1'">
                    <div class="playlist-card-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="playlist-card-info">
                    <div class="playlist-card-name">${this.escapeHtml(playlist.name)}</div>
                    <div class="playlist-card-count">${playlist.songs.length} 首</div>
                </div>
            </div>
        `).join('');
        
        // 绑定点击事件
        this.myPlaylistsGrid.querySelectorAll('.playlist-card-item').forEach(item => {
            item.addEventListener('click', () => {
                const playlistId = item.dataset.id;
                this.switchToPlaylist(playlistId);
                this.hideMyPlaylistsModal();
            });
        });
    }
    
    /**
     * 创建新歌单
     */
    createNewPlaylist() {
        const name = this.newPlaylistName.value.trim();
        const description = this.newPlaylistDesc.value.trim();
        
        if (!name) {
            this.showToast('请输入歌单名称');
            return;
        }
        
        const playlist = window.playlistStorage.createPlaylist(name, description);
        this.hideCreatePlaylistModal();
        this.renderMyPlaylists();
        this.showToast(`歌单 "${name}" 创建成功`);
    }
    
    /**
     * 切换到指定歌单
     */
    switchToPlaylist(playlistId) {
        const playlist = window.playlistStorage.switchPlaylist(playlistId);
        if (playlist) {
            // 加载歌单歌曲到播放列表
            window.playlistManager.clear();
            if (playlist.songs.length > 0) {
                window.playlistManager.addSongs(playlist.songs);
                const firstSong = window.playlistManager.getCurrentSong();
                if (firstSong) {
                    this.loadSong(firstSong);
                    this.play();
                }
            }
            
            this.playlistTitle.textContent = playlist.name;
            this.showToast(`已切换到：${playlist.name}`);
        }
    }
    
    /**
     * 加载当前播放列表
     */
    loadCurrentPlaylist() {
        const playlist = window.playlistStorage.getCurrentPlaylist();
        if (playlist && playlist.songs.length > 0) {
            window.playlistManager.addSongs(playlist.songs);
            this.playlistTitle.textContent = playlist.name;
        }
    }
    
    /**
     * 添加当前歌曲到收藏
     */
    addToFavorites() {
        const currentSong = window.playlistManager.getCurrentSong();
        if (currentSong) {
            if (window.playlistStorage.addToFavorites(currentSong)) {
                this.showToast('已添加到我的喜欢');
            } else {
                this.showToast('歌曲已在收藏中');
            }
        }
    }
    
    /**
     * 添加歌曲到最近播放
     */
    addToRecent(song) {
        if (song) {
            window.playlistStorage.addToRecent(song);
        }
    }
}

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    window.player = new MusicPlayer();
});
