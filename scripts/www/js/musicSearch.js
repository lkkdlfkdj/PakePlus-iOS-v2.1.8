/**
 * 音乐搜索模块
 * 使用多个API源搜索和获取音乐
 */
class MusicSearch {
    constructor() {
        // 使用多个音乐API源（多个备选）
        this.apis = {
            // 网易云音乐API（主API）
            netease: {
                search: 'https://music-api.heheda.top/search',
                detail: 'https://music-api.heheda.top/song/detail',
                url: 'https://music.163.com/song/media/outer/url',
                lyrics: 'https://music-api.heheda.top/lyric'
            },
            // 备选API 1
            netease2: {
                search: 'https://api.music.imsyy.top/search',
                detail: 'https://api.music.imsyy.top/song/detail',
                url: 'https://music.163.com/song/media/outer/url',
                lyrics: 'https://api.music.imsyy.top/lyric'
            },
            // 备选API 2
            netease3: {
                search: 'https://netease-cloud-music-api-five-roan-88.vercel.app/search',
                detail: 'https://netease-cloud-music-api-five-roan-88.vercel.app/song/detail',
                url: 'https://music.163.com/song/media/outer/url',
                lyrics: 'https://netease-cloud-music-api-five-roan-88.vercel.app/lyric'
            },
            // Openwhyd（免费音乐流）
            openwhyd: {
                hot: 'https://openwhyd.org/hot',
                genre: 'https://openwhyd.org/hot'
            },
            // Radio Browser（免费电台）
            radio: {
                stations: 'https://de1.api.radio-browser.info/json/stations'
            },
            // 免费音乐库
            freeMusic: {
                soundhelix: 'https://www.soundhelix.com/examples/mp3/'
            }
        };
        
        // 音乐分类（类似于汽水音乐）
        this.musicCategories = {
            'chill': { name: '放松', icon: 'fa-couch', color: '#6c5ce7' },
            'electronic': { name: '电子', icon: 'fa-headphones', color: '#00cec9' },
            'classical': { name: '古典', icon: 'fa-music', color: '#fd79a8' },
            'pop': { name: '流行', icon: 'fa-star', color: '#fdcb6e' },
            'jazz': { name: '爵士', icon: 'fa-wine-glass', color: '#e17055' },
            'nature': { name: '自然', icon: 'fa-leaf', color: '#00b894' },
            'study': { name: '学习', icon: 'fa-book', color: '#0984e3' },
            'sleep': { name: '睡眠', icon: 'fa-moon', color: '#6c5ce7' }
        };
        
        this.searchResults = [];
        this.isSearching = false;
        this.currentApiIndex = 0;
        this.apiList = ['netease', 'netease2', 'netease3'];
    }
    
    /**
     * 获取当前使用的API配置
     */
    getCurrentApi() {
        const apiName = this.apiList[this.currentApiIndex];
        return this.apis[apiName];
    }
    
    /**
     * 切换到下一个API
     */
    switchToNextApi() {
        this.currentApiIndex = (this.currentApiIndex + 1) % this.apiList.length;
        console.log(`切换到API: ${this.apiList[this.currentApiIndex]}`);
        return this.getCurrentApi();
    }

    /**
     * 搜索音乐 - 自动切换多个API
     * @param {string} keyword - 搜索关键词
     * @param {number} limit - 返回数量限制
     * @returns {Promise<Array>} 搜索结果
     */
    async search(keyword, limit = 20) {
        if (!keyword || keyword.trim() === '') {
            return [];
        }

        this.isSearching = true;
        
        // 尝试多个API
        for (let i = 0; i < this.apiList.length; i++) {
            try {
                const results = await this.searchWithCurrentApi(keyword, limit);
                if (results.length > 0) {
                    return results;
                }
            } catch (error) {
                console.warn(`API ${this.apiList[this.currentApiIndex]} 失败，尝试下一个...`);
                this.switchToNextApi();
            }
        }
        
        // 所有API都失败，返回免费音乐库（确保有可播放的音乐）
        this.isSearching = false;
        console.log('所有API都失败，返回免费音乐库');
        return this.getFreeMusicLibrary();
    }

    /**
     * 使用当前API搜索
     */
    async searchWithCurrentApi(keyword, limit = 20) {
        const api = this.getCurrentApi();
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
            
            const response = await fetch(
                `${api.search}?keywords=${encodeURIComponent(keyword)}&limit=${limit}&type=1`,
                { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('搜索失败');
            }

            const data = await response.json();
            
            if (data.code !== 200 || !data.result || !data.result.songs) {
                return [];
            }

            // 格式化搜索结果
            this.searchResults = data.result.songs.map(song => ({
                id: song.id.toString(),
                title: song.name,
                artist: song.artists.map(a => a.name).join(' / '),
                album: song.album.name,
                duration: Math.floor(song.duration / 1000),
                cover: song.album.picUrl || `https://picsum.photos/400/400?random=${song.id}`,
                url: this.getAudioUrl(song.id),
                source: 'netease'
            }));

            return this.searchResults;
        } catch (error) {
            console.error('网易云搜索失败:', error);
            return [];
        }
    }

    /**
     * 获取Openwhyd免费音乐（完整版）
     * @param {string} genre - 音乐类型
     * @returns {Promise<Array>} 音乐列表
     */
    async getOpenwhydMusic(genre = 'electro') {
        try {
            const response = await fetch(`${this.apis.openwhyd.genre}/${genre}?format=json`);
            
            if (!response.ok) {
                throw new Error('获取失败');
            }

            const data = await response.json();
            
            if (!data.tracks || data.tracks.length === 0) {
                return [];
            }

            return data.tracks.map((track, index) => ({
                id: `openwhyd_${index}`,
                title: track.name.split(' - ')[1] || track.name,
                artist: track.name.split(' - ')[0] || 'Unknown Artist',
                album: 'Openwhyd',
                duration: 0, // YouTube视频需要单独获取时长
                cover: track.img.replace('default.jpg', 'hqdefault.jpg'),
                url: `https://www.youtube.com/watch?v=${track.eId.replace('/yt/', '')}`,
                youtubeId: track.eId.replace('/yt/', ''),
                source: 'openwhyd'
            }));
        } catch (error) {
            console.error('Openwhyd获取失败:', error);
            return [];
        }
    }
    
    /**
     * 获取分类音乐（汽水音乐风格）
     * @param {string} category - 分类ID
     * @returns {Array} 分类音乐列表
     */
    getCategoryMusic(category) {
        const allMusic = this.getFreeMusicLibrary();
        const categoryMap = {
            'chill': ['Chill', 'Relaxation', 'Mood', 'Peaceful', 'Coffee'],
            'electronic': ['Electronic', 'Synthwave', 'Electric', 'Urban', 'Night'],
            'classical': ['Classical'],
            'pop': ['Pop', 'Acoustic', 'Uplifting', 'Happy'],
            'jazz': ['Jazz', 'Indie'],
            'nature': ['Nature', 'Ocean', 'Forest', 'Mountain', 'Rain'],
            'study': ['Study', 'Concentration', 'Focus', 'Work'],
            'sleep': ['Sleep', 'Meditation', 'Wellness', 'Dream']
        };
        
        const keywords = categoryMap[category] || [];
        if (keywords.length === 0) {
            return allMusic;
        }
        
        return allMusic.filter(song => 
            keywords.some(kw => song.album.toLowerCase().includes(kw.toLowerCase()) || 
                               song.title.toLowerCase().includes(kw.toLowerCase()) ||
                               song.artist.toLowerCase().includes(kw.toLowerCase()))
        );
    }
    
    /**
     * 获取所有分类
     * @returns {Array} 分类列表
     */
    getCategories() {
        return Object.entries(this.musicCategories).map(([id, data]) => ({
            id,
            ...data
        }));
    }

    /**
     * 获取免费音乐库的音乐（完整版）
     * @returns {Array} 免费音乐列表
     */
    getFreeMusicLibrary() {
        const freeMusic = [
            // ===== 电子/氛围音乐 =====
            {
                id: 'free1',
                title: 'Moonlight Sonata',
                artist: 'Beethoven',
                album: 'Classical',
                duration: 360,
                cover: 'https://picsum.photos/400/400?random=101',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                source: 'free'
            },
            {
                id: 'free2',
                title: 'Night Drive',
                artist: 'Ambient',
                album: 'Chill',
                duration: 424,
                cover: 'https://picsum.photos/400/400?random=102',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                source: 'free'
            },
            {
                id: 'free3',
                title: 'Electric Dreams',
                artist: 'Synthwave',
                album: 'Electronic',
                duration: 335,
                cover: 'https://picsum.photos/400/400?random=103',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                source: 'free'
            },
            {
                id: 'free4',
                title: 'Midnight City',
                artist: 'Urban',
                album: 'Night',
                duration: 384,
                cover: 'https://picsum.photos/400/400?random=104',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                source: 'free'
            },
            {
                id: 'free5',
                title: 'Ocean Waves',
                artist: 'Nature',
                album: 'Relaxation',
                duration: 297,
                cover: 'https://picsum.photos/400/400?random=105',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
                source: 'free'
            },
            {
                id: 'free6',
                title: 'Rainy Day',
                artist: 'Chill',
                album: 'Mood',
                duration: 420,
                cover: 'https://picsum.photos/400/400?random=106',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
                source: 'free'
            },
            {
                id: 'free7',
                title: 'Sunrise',
                artist: 'Morning',
                album: 'Nature',
                duration: 389,
                cover: 'https://picsum.photos/400/400?random=107',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
                source: 'free'
            },
            {
                id: 'free8',
                title: 'Starlight',
                artist: 'Dream',
                album: 'Ambient',
                duration: 445,
                cover: 'https://picsum.photos/400/400?random=108',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
                source: 'free'
            },
            {
                id: 'free9',
                title: 'Forest Walk',
                artist: 'Nature',
                album: 'Ambient',
                duration: 312,
                cover: 'https://picsum.photos/400/400?random=109',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
                source: 'free'
            },
            {
                id: 'free10',
                title: 'Coffee Shop',
                artist: 'Lo-Fi',
                album: 'Chill',
                duration: 378,
                cover: 'https://picsum.photos/400/400?random=110',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
                source: 'free'
            },
            // ===== 古典音乐 =====
            {
                id: 'free11',
                title: 'Für Elise',
                artist: 'Beethoven',
                album: 'Classical',
                duration: 180,
                cover: 'https://picsum.photos/400/400?random=111',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
                source: 'free'
            },
            {
                id: 'free12',
                title: 'Clair de Lune',
                artist: 'Debussy',
                album: 'Classical',
                duration: 240,
                cover: 'https://picsum.photos/400/400?random=112',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
                source: 'free'
            },
            {
                id: 'free13',
                title: 'Canon in D',
                artist: 'Pachelbel',
                album: 'Classical',
                duration: 300,
                cover: 'https://picsum.photos/400/400?random=113',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
                source: 'free'
            },
            {
                id: 'free14',
                title: 'Ave Maria',
                artist: 'Schubert',
                album: 'Classical',
                duration: 360,
                cover: 'https://picsum.photos/400/400?random=114',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
                source: 'free'
            },
            {
                id: 'free15',
                title: 'Swan Lake',
                artist: 'Tchaikovsky',
                album: 'Classical',
                duration: 420,
                cover: 'https://picsum.photos/400/400?random=115',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
                source: 'free'
            },
            {
                id: 'free16',
                title: 'Nocturne Op.9 No.2',
                artist: 'Chopin',
                album: 'Classical',
                duration: 270,
                cover: 'https://picsum.photos/400/400?random=116',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
                source: 'free'
            },
            // ===== 流行/轻音乐 =====
            {
                id: 'free17',
                title: 'Summer Breeze',
                artist: 'Acoustic',
                album: 'Pop',
                duration: 210,
                cover: 'https://picsum.photos/400/400?random=117',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
                source: 'free'
            },
            {
                id: 'free18',
                title: 'Happy Moments',
                artist: 'Uplifting',
                album: 'Pop',
                duration: 195,
                cover: 'https://picsum.photos/400/400?random=118',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                source: 'free'
            },
            {
                id: 'free19',
                title: 'Peaceful Mind',
                artist: 'Meditation',
                album: 'Wellness',
                duration: 330,
                cover: 'https://picsum.photos/400/400?random=119',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                source: 'free'
            },
            {
                id: 'free20',
                title: 'Work Focus',
                artist: 'Study',
                album: 'Concentration',
                duration: 450,
                cover: 'https://picsum.photos/400/400?random=120',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                source: 'free'
            },
            {
                id: 'free21',
                title: 'Morning Coffee',
                artist: 'Lo-Fi',
                album: 'Chill',
                duration: 225,
                cover: 'https://picsum.photos/400/400?random=121',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                source: 'free'
            },
            {
                id: 'free22',
                title: 'Sunset Drive',
                artist: 'Indie',
                album: 'Relaxation',
                duration: 280,
                cover: 'https://picsum.photos/400/400?random=122',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
                source: 'free'
            },
            {
                id: 'free23',
                title: 'Dreamland',
                artist: 'Electronic',
                album: 'Ambient',
                duration: 320,
                cover: 'https://picsum.photos/400/400?random=123',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
                source: 'free'
            },
            {
                id: 'free24',
                title: 'Winter Snow',
                artist: 'Piano',
                album: 'Seasonal',
                duration: 265,
                cover: 'https://picsum.photos/400/400?random=124',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
                source: 'free'
            },
            {
                id: 'free25',
                title: 'Tropical Paradise',
                artist: 'World',
                album: 'Travel',
                duration: 310,
                cover: 'https://picsum.photos/400/400?random=125',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
                source: 'free'
            },
            {
                id: 'free26',
                title: 'City Lights',
                artist: 'Urban',
                album: 'Night',
                duration: 285,
                cover: 'https://picsum.photos/400/400?random=126',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
                source: 'free'
            },
            {
                id: 'free27',
                title: 'Ocean Journey',
                artist: 'Ambient',
                album: 'Nature',
                duration: 340,
                cover: 'https://picsum.photos/400/400?random=127',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
                source: 'free'
            },
            {
                id: 'free28',
                title: 'Mountain High',
                artist: 'Instrumental',
                album: 'Nature',
                duration: 295,
                cover: 'https://picsum.photos/400/400?random=128',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
                source: 'free'
            },
            {
                id: 'free29',
                title: 'Soft Rain',
                artist: 'Nature',
                album: 'Relaxation',
                duration: 355,
                cover: 'https://picsum.photos/400/400?random=129',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
                source: 'free'
            },
            {
                id: 'free30',
                title: 'Starlit Night',
                artist: 'Ambient',
                album: 'Night',
                duration: 410,
                cover: 'https://picsum.photos/400/400?random=130',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
                source: 'free'
            }
        ];

        return freeMusic;
    }

    /**
     * 获取音乐播放链接
     * @param {string} songId - 歌曲ID
     * @param {string} source - 音乐源
     * @returns {Promise<string>} 播放链接
     */
    async getMusicUrl(songId, source = 'netease') {
        try {
            if (source === 'netease') {
                // 使用代理服务器获取网易云真实播放链接
                const response = await fetch(`/proxy/music?id=${songId}`);
                if (response.ok) {
                    const data = await response.json();
                    return data.url;
                }
            }
            return null;
        } catch (error) {
            console.error('获取播放链接失败:', error);
            return null;
        }
    }

    /**
     * 获取音频流链接 - 使用多个备选URL格式
     * @param {string} songId - 歌曲ID
     * @returns {string} 音频流链接
     */
    getAudioUrl(songId) {
        // 尝试多个网易云音乐外链格式
        const urls = [
            `https://music.163.com/song/media/outer/url?id=${songId}`,
            `http://music.163.com/song/media/outer/url?id=${songId}.mp3`,
        ];
        // 返回第一个（最可靠的）
        return urls[0];
    }

    /**
     * 获取歌词
     * @param {string} songId - 歌曲ID
     * @returns {Promise<string>} 歌词文本
     */
    async getLyrics(songId) {
        try {
            const response = await fetch(`${this.apis.netease.lyrics}?id=${songId}`);
            
            if (!response.ok) {
                throw new Error('获取歌词失败');
            }

            const data = await response.json();
            
            if (data.code !== 200) {
                return null;
            }

            // 优先获取翻译歌词，如果没有则获取原歌词
            const lrc = data.tlyric?.lyric || data.lrc?.lyric || data.klyric?.lyric;
            return lrc;
        } catch (error) {
            console.error('获取歌词失败:', error);
            return null;
        }
    }

    /**
     * 获取热门搜索 - 自动切换API
     * @returns {Promise<Array>} 热门搜索关键词
     */
    async getHotSearch() {
        for (let i = 0; i < this.apiList.length; i++) {
            try {
                const api = this.getCurrentApi();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const response = await fetch(`${api.search}/hot`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) continue;

                const data = await response.json();
                
                if (data.code === 200 && data.result && data.result.hots) {
                    return data.result.hots.map(h => h.first);
                }
            } catch (error) {
                console.warn(`API ${this.apiList[this.currentApiIndex]} 获取热门搜索失败`);
                this.switchToNextApi();
            }
        }
        
        // 返回默认热门搜索
        return ['周杰伦', '林俊杰', '薛之谦', '邓紫棋', '陈奕迅', '毛不易', '李荣浩', '张学友'];
    }

    /**
     * 获取推荐歌单 - 自动切换API
     * @param {number} limit - 数量限制
     * @returns {Promise<Array>} 推荐歌单
     */
    async getRecommendPlaylists(limit = 10) {
        for (let i = 0; i < this.apiList.length; i++) {
            try {
                const api = this.getCurrentApi();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(
                    `${api.search.replace('/search', '')}/personalized?limit=${limit}`,
                    { signal: controller.signal }
                );
                
                clearTimeout(timeoutId);
                
                if (!response.ok) continue;

                const data = await response.json();
                
                if (data.code === 200 && data.result) {
                    return data.result.map(playlist => ({
                        id: playlist.id.toString(),
                        name: playlist.name,
                        cover: playlist.picUrl,
                        playCount: playlist.playCount
                    }));
                }
            } catch (error) {
                console.warn(`API ${this.apiList[this.currentApiIndex]} 获取推荐歌单失败`);
                this.switchToNextApi();
            }
        }
        
        return [];
    }

    /**
     * 获取歌单详情 - 自动切换API
     * @param {string} playlistId - 歌单ID
     * @returns {Promise<Array>} 歌单中的歌曲
     */
    async getPlaylistDetail(playlistId) {
        for (let i = 0; i < this.apiList.length; i++) {
            try {
                const api = this.getCurrentApi();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(
                    `${api.search.replace('/search', '')}/playlist/detail?id=${playlistId}`,
                    { signal: controller.signal }
                );
                
                clearTimeout(timeoutId);
                
                if (!response.ok) continue;

                const data = await response.json();
                
                if (data.code === 200 && data.playlist && data.playlist.tracks) {
                    return data.playlist.tracks.map(song => ({
                        id: song.id.toString(),
                        title: song.name,
                        artist: song.ar.map(a => a.name).join(' / '),
                        album: song.al.name,
                        duration: Math.floor(song.dt / 1000),
                        cover: song.al.picUrl,
                        url: this.getAudioUrl(song.id),
                        source: 'netease'
                    }));
                }
            } catch (error) {
                console.warn(`API ${this.apiList[this.currentApiIndex]} 获取歌单详情失败`);
                this.switchToNextApi();
            }
        }
        
        return [];
    }

    /**
     * 获取模拟搜索结果（当 API 失败时使用）
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 模拟搜索结果
     */
    getMockSearchResults(keyword) {
        const mockSongs = [
            { id: 'mock1', title: `${keyword} - 热门版本`, artist: '未知艺术家', album: '热门专辑', duration: 240 },
            { id: 'mock2', title: `${keyword} (Live)`, artist: '现场版', album: '演唱会专辑', duration: 280 },
            { id: 'mock3', title: `${keyword} -  acoustic`, artist: '原声版', album: '精选集', duration: 200 },
            { id: 'mock4', title: `${keyword} (Remix)`, artist: 'DJ版', album: 'Remix专辑', duration: 320 },
            { id: 'mock5', title: `${keyword} - 经典`, artist: '经典歌手', album: '经典专辑', duration: 260 }
        ];

        return mockSongs.map((song, index) => ({
            ...song,
            cover: `https://picsum.photos/400/400?random=${index + 100}`,
            url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(index % 5) + 1}.mp3`,
            isBackup: true,
            source: 'mock'
        }));
    }

    /**
     * 完整的歌曲信息获取（包括播放链接和歌词）- 自动切换API
     * @param {string} songId - 歌曲ID
     * @param {string} source - 音乐源
     * @returns {Promise<Object>} 完整的歌曲信息
     */
    async getFullSongInfo(songId, source = 'netease') {
        try {
            if (source === 'free') {
                // 免费音乐直接返回
                const freeMusic = this.getFreeMusicLibrary();
                return freeMusic.find(s => s.id === songId) || null;
            }

            if (source === 'openwhyd') {
                // Openwhyd音乐
                const music = await this.getOpenwhydMusic();
                return music.find(s => s.id === songId) || null;
            }
            
            if (source === 'local') {
                // 本地音乐已在播放列表中
                return window.playlistManager.getSongById(songId);
            }

            // 尝试多个API获取歌曲信息
            for (let i = 0; i < this.apiList.length; i++) {
                try {
                    const api = this.getCurrentApi();
                    
                    // 获取歌词
                    const lyrics = await this.getLyricsWithApi(songId, api);
                    
                    // 获取歌曲详情
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);
                    
                    const detailResponse = await fetch(
                        `${api.detail}?ids=${songId}`,
                        { signal: controller.signal }
                    );
                    
                    clearTimeout(timeoutId);
                    
                    if (detailResponse.ok) {
                        const data = await detailResponse.json();
                        if (data.code === 200 && data.songs && data.songs.length > 0) {
                            const song = data.songs[0];
                            return {
                                id: song.id.toString(),
                                title: song.name,
                                artist: song.ar.map(a => a.name).join(' / '),
                                album: song.al.name,
                                cover: song.al.picUrl,
                                url: this.getAudioUrl(songId),
                                lyrics: lyrics,
                                isRealMusic: true,
                                source: 'netease'
                            };
                        }
                    }
                } catch (error) {
                    console.warn(`API ${this.apiList[this.currentApiIndex]} 获取歌曲详情失败，尝试下一个...`);
                    this.switchToNextApi();
                }
            }
            
            // 所有API都失败，返回搜索缓存中的基本信息
            const cachedSong = this.searchResults.find(s => s.id === songId);
            if (cachedSong) {
                return {
                    ...cachedSong,
                    url: this.getAudioUrl(songId),
                    isRealMusic: true,
                    source: 'netease'
                };
            }
            
            return null;
        } catch (error) {
            console.error('获取完整歌曲信息失败:', error);
            return null;
        }
    }
    
    /**
     * 使用指定API获取歌词
     */
    async getLyricsWithApi(songId, api) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(`${api.lyrics}?id=${songId}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) return null;
            
            const data = await response.json();
            return data.tlyric?.lyric || data.lrc?.lyric || null;
        } catch (error) {
            return null;
        }
    }
}

// 创建全局音乐搜索实例
window.musicSearch = new MusicSearch();
