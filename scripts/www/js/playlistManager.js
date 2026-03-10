/**
 * 播放列表管理系统
 * 支持创建、保存、切换多个播放列表
 */
class PlaylistStorage {
    constructor() {
        this.storageKey = 'sui_bian_ting_playlists';
        this.currentPlaylistKey = 'sui_bian_ting_current';
        this.playlists = this.loadPlaylists();
        this.currentPlaylistId = this.loadCurrentPlaylistId();
        
        // 如果没有播放列表，创建默认播放列表
        if (Object.keys(this.playlists).length === 0) {
            this.createDefaultPlaylists();
        }
    }
    
    /**
     * 从本地存储加载播放列表
     */
    loadPlaylists() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('加载播放列表失败:', e);
            return {};
        }
    }
    
    /**
     * 保存播放列表到本地存储
     */
    savePlaylists() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.playlists));
        } catch (e) {
            console.error('保存播放列表失败:', e);
        }
    }
    
    /**
     * 加载当前播放列表ID
     */
    loadCurrentPlaylistId() {
        try {
            return localStorage.getItem(this.currentPlaylistKey) || 'default';
        } catch (e) {
            return 'default';
        }
    }
    
    /**
     * 保存当前播放列表ID
     */
    saveCurrentPlaylistId(id) {
        this.currentPlaylistId = id;
        try {
            localStorage.setItem(this.currentPlaylistKey, id);
        } catch (e) {
            console.error('保存当前播放列表失败:', e);
        }
    }
    
    /**
     * 创建默认播放列表
     */
    createDefaultPlaylists() {
        // 默认的免费音乐库播放列表
        this.playlists = {
            'default': {
                id: 'default',
                name: '免费音乐库',
                description: '精选免费完整版音乐',
                cover: 'https://picsum.photos/400/400?random=1',
                songs: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isDefault: true
            },
            'favorites': {
                id: 'favorites',
                name: '我的喜欢',
                description: '收藏喜爱的歌曲',
                cover: 'https://picsum.photos/400/400?random=2',
                songs: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isDefault: true
            },
            'recent': {
                id: 'recent',
                name: '最近播放',
                description: '最近听过的歌曲',
                cover: 'https://picsum.photos/400/400?random=3',
                songs: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isDefault: true
            }
        };
        this.savePlaylists();
    }
    
    /**
     * 创建新播放列表
     */
    createPlaylist(name, description = '') {
        const id = 'playlist_' + Date.now();
        const playlist = {
            id: id,
            name: name,
            description: description,
            cover: `https://picsum.photos/400/400?random=${Date.now()}`,
            songs: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDefault: false
        };
        this.playlists[id] = playlist;
        this.savePlaylists();
        return playlist;
    }
    
    /**
     * 删除播放列表
     */
    deletePlaylist(id) {
        if (this.playlists[id] && !this.playlists[id].isDefault) {
            delete this.playlists[id];
            this.savePlaylists();
            
            // 如果删除的是当前播放列表，切换到默认
            if (this.currentPlaylistId === id) {
                this.currentPlaylistId = 'default';
                this.saveCurrentPlaylistId('default');
            }
            return true;
        }
        return false;
    }
    
    /**
     * 重命名播放列表
     */
    renamePlaylist(id, newName) {
        if (this.playlists[id]) {
            this.playlists[id].name = newName;
            this.playlists[id].updatedAt = Date.now();
            this.savePlaylists();
            return true;
        }
        return false;
    }
    
    /**
     * 获取所有播放列表
     */
    getAllPlaylists() {
        return Object.values(this.playlists).sort((a, b) => b.updatedAt - a.updatedAt);
    }
    
    /**
     * 获取当前播放列表
     */
    getCurrentPlaylist() {
        return this.playlists[this.currentPlaylistId] || this.playlists['default'];
    }
    
    /**
     * 切换到指定播放列表
     */
    switchPlaylist(id) {
        if (this.playlists[id]) {
            this.saveCurrentPlaylistId(id);
            return this.playlists[id];
        }
        return null;
    }
    
    /**
     * 添加歌曲到播放列表
     */
    addSongToPlaylist(playlistId, song) {
        const playlist = this.playlists[playlistId];
        if (!playlist) return false;
        
        // 检查是否已存在
        const exists = playlist.songs.some(s => s.id === song.id);
        if (exists) return false;
        
        playlist.songs.push({
            ...song,
            addedAt: Date.now()
        });
        playlist.updatedAt = Date.now();
        this.savePlaylists();
        return true;
    }
    
    /**
     * 从播放列表移除歌曲
     */
    removeSongFromPlaylist(playlistId, songId) {
        const playlist = this.playlists[playlistId];
        if (!playlist) return false;
        
        const index = playlist.songs.findIndex(s => s.id === songId);
        if (index > -1) {
            playlist.songs.splice(index, 1);
            playlist.updatedAt = Date.now();
            this.savePlaylists();
            return true;
        }
        return false;
    }
    
    /**
     * 添加歌曲到"我的喜欢"
     */
    addToFavorites(song) {
        return this.addSongToPlaylist('favorites', song);
    }
    
    /**
     * 从"我的喜欢"移除
     */
    removeFromFavorites(songId) {
        return this.removeSongFromPlaylist('favorites', songId);
    }
    
    /**
     * 检查歌曲是否在"我的喜欢"中
     */
    isInFavorites(songId) {
        const favorites = this.playlists['favorites'];
        if (!favorites) return false;
        return favorites.songs.some(s => s.id === songId);
    }
    
    /**
     * 添加歌曲到"最近播放"
     */
    addToRecent(song) {
        const recent = this.playlists['recent'];
        if (!recent) return;
        
        // 移除已存在的相同歌曲
        const index = recent.songs.findIndex(s => s.id === song.id);
        if (index > -1) {
            recent.songs.splice(index, 1);
        }
        
        // 添加到开头
        recent.songs.unshift({
            ...song,
            addedAt: Date.now()
        });
        
        // 只保留最近50首
        if (recent.songs.length > 50) {
            recent.songs = recent.songs.slice(0, 50);
        }
        
        recent.updatedAt = Date.now();
        this.savePlaylists();
    }
    
    /**
     * 获取播放列表中的歌曲
     */
    getPlaylistSongs(playlistId) {
        const playlist = this.playlists[playlistId];
        return playlist ? playlist.songs : [];
    }
    
    /**
     * 更新播放列表封面
     */
    updatePlaylistCover(playlistId, coverUrl) {
        if (this.playlists[playlistId]) {
            this.playlists[playlistId].cover = coverUrl;
            this.playlists[playlistId].updatedAt = Date.now();
            this.savePlaylists();
            return true;
        }
        return false;
    }
}

// 创建全局播放列表存储实例
window.playlistStorage = new PlaylistStorage();
