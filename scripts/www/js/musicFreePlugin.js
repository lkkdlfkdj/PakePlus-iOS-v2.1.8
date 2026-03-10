/**
 * MusicFree 风格插件系统
 * 参考 MusicFree 架构，为Web端实现类似的多源音乐插件系统
 * 支持多种音乐源
 */

class MusicFreePlugin {
    constructor(config) {
        this.name = config.name;
        this.id = config.id;
        this.version = config.version || '1.0.0';
        this.author = config.author || '随便听';
        this.description = config.description || '';
        this.apis = config.apis || {};
        this.search = config.search || null;
        this.getUrl = config.getUrl || null;
        this.getLyrics = config.getLyrics || null;
    }

    async search(keyword, limit = 20) {
        if (!this.search) return [];
        try {
            return await this.search(keyword, limit);
        } catch (e) {
            console.error(`插件 ${this.name} 搜索失败:`, e);
            return [];
        }
    }

    async getPlayUrl(songId) {
        if (!this.getUrl) return null;
        try {
            return await this.getUrl(songId);
        } catch (e) {
            console.error(`插件 ${this.name} 获取URL失败:`, e);
            return null;
        }
    }

    async getLyrics(songId) {
        if (!this.getLyrics) return null;
        try {
            return await this.getLyrics(songId);
        } catch (e) {
            return null;
        }
    }
}

class MusicFreePluginManager {
    constructor() {
        this.plugins = new Map();
        this.activePlugin = null;
        this.initDefaultPlugins();
    }

    initDefaultPlugins() {
        // 1. 免费音乐库 (最可靠)
        this.registerPlugin(new MusicFreePlugin({
            id: 'free',
            name: '免费音乐库',
            version: '1.0.0',
            author: '随便听',
            description: '15首免费完整版音乐',
            search: async function(keyword, limit) {
                const freeMusic = this.getFreeMusicList();
                if (!keyword) return freeMusic.slice(0, limit);
                
                const lowerKeyword = keyword.toLowerCase();
                return freeMusic.filter(song => 
                    song.title.toLowerCase().includes(lowerKeyword) ||
                    song.artist.toLowerCase().includes(lowerKeyword)
                ).slice(0, limit);
            },
            getUrl: async function(songId) {
                const freeMusic = this.getFreeMusicList();
                const song = freeMusic.find(s => s.id === songId);
                return song?.url || null;
            },
            getFreeMusicList: function() {
                return [
                    { id: 'free1', title: 'Moonlight Sonata', artist: 'Beethoven', album: 'Classical', duration: 360, cover: 'https://picsum.photos/400/400?random=101', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                    { id: 'free2', title: 'Night Drive', artist: 'Ambient', album: 'Chill', duration: 424, cover: 'https://picsum.photos/400/400?random=102', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
                    { id: 'free3', title: 'Electric Dreams', artist: 'Synthwave', album: 'Electronic', duration: 335, cover: 'https://picsum.photos/400/400?random=103', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
                    { id: 'free4', title: 'Midnight City', artist: 'Urban', album: 'Night', duration: 384, cover: 'https://picsum.photos/400/400?random=104', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
                    { id: 'free5', title: 'Ocean Waves', artist: 'Nature', album: 'Relaxation', duration: 297, cover: 'https://picsum.photos/400/400?random=105', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
                    { id: 'free6', title: 'Rainy Day', artist: 'Chill', album: 'Mood', duration: 420, cover: 'https://picsum.photos/400/400?random=106', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
                    { id: 'free7', title: 'Sunrise', artist: 'Morning', album: 'Nature', duration: 389, cover: 'https://picsum.photos/400/400?random=107', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
                    { id: 'free8', title: 'Starlight', artist: 'Dream', album: 'Ambient', duration: 445, cover: 'https://picsum.photos/400/400?random=108', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
                    { id: 'free9', title: 'Für Elise', artist: 'Beethoven', album: 'Classical', duration: 180, cover: 'https://picsum.photos/400/400?random=109', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
                    { id: 'free10', title: 'Canon in D', artist: 'Pachelbel', album: 'Classical', duration: 300, cover: 'https://picsum.photos/400/400?random=110', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
                    { id: 'free11', title: 'Summer Breeze', artist: 'Acoustic', album: 'Pop', duration: 210, cover: 'https://picsum.photos/400/400?random=111', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
                    { id: 'free12', title: 'Coffee Shop', artist: 'Lo-Fi', album: 'Chill', duration: 225, cover: 'https://picsum.photos/400/400?random=112', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
                    { id: 'free13', title: 'Dreamland', artist: 'Electronic', album: 'Ambient', duration: 320, cover: 'https://picsum.photos/400/400?random=113', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
                    { id: 'free14', title: 'City Lights', artist: 'Urban', album: 'Night', duration: 285, cover: 'https://picsum.photos/400/400?random=114', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },
                    { id: 'free15', title: 'Soft Rain', artist: 'Nature', album: 'Relaxation', duration: 355, cover: 'https://picsum.photos/400/400?random=115', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' }
                ].map(s => ({ ...s, pluginId: 'free', source: 'free' }));
            }
        }));

        // 2. 网易云音乐
        this.registerPlugin(new MusicFreePlugin({
            id: 'netease',
            name: '网易云音乐',
            version: '1.0.0',
            author: '随便听',
            description: '主流音乐平台',
            apis: {
                search: 'https://music-api.heheda.top/search',
                detail: 'https://music-api.heheda.top/song/detail',
                url: 'https://music.163.com/song/media/outer/url',
                lyrics: 'https://music-api.heheda.top/lyric'
            },
            search: async function(keyword, limit) {
                try {
                    const response = await fetch(`${this.apis.search}?keywords=${encodeURIComponent(keyword)}&limit=${limit}&type=1`);
                    const data = await response.json();
                    if (data.code !== 200 || !data.result?.songs) return [];
                    
                    return data.result.songs.map(song => ({
                        id: song.id.toString(),
                        title: song.name,
                        artist: song.artists.map(a => a.name).join(' / '),
                        album: song.album?.name || '未知专辑',
                        duration: Math.floor(song.duration / 1000),
                        cover: song.album?.picUrl || `https://picsum.photos/400/400?random=${song.id}`,
                        pluginId: 'netease',
                        source: 'netease'
                    }));
                } catch (e) {
                    console.error('网易云搜索失败:', e);
                    return [];
                }
            },
            getUrl: async function(songId) {
                return `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;
            },
            getLyrics: async function(songId) {
                try {
                    const response = await fetch(`${this.apis.lyrics}?id=${songId}`);
                    const data = await response.json();
                    return data.lrc?.lyric || data.tlyric?.lyric || null;
                } catch (e) {
                    return null;
                }
            }
        }));

        // 3. 咪咕音乐
        this.registerPlugin(new MusicFreePlugin({
            id: 'migu',
            name: '咪咕音乐',
            version: '1.0.0',
            author: '随便听',
            description: '免费音乐较多',
            apis: {
                search: 'https://migu.musicapi.com/api.php/search.remote'
            },
            search: async function(keyword, limit) {
                try {
                    const response = await fetch(this.apis.search, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `keyword=${encodeURIComponent(keyword)}&page=1&pagesize=${limit}&type=0`
                    });
                    const data = await response.json();
                    if (!data.result?.list) return [];
                    
                    return data.result.list.map(song => ({
                        id: song.id,
                        title: song.name,
                        artist: song.artist || '未知艺术家',
                        album: song.album || '未知专辑',
                        duration: Math.floor((song.time || 180000) / 1000),
                        cover: song.imgUrl || `https://picsum.photos/400/400?random=${song.id}`,
                        pluginId: 'migu',
                        source: 'migu'
                    }));
                } catch (e) {
                    console.error('咪咕搜索失败:', e);
                    return [];
                }
            },
            getUrl: async function(songId) {
                try {
                    const response = await fetch(`https://migu.musicapi.com/api.php/music.remote.getUrl?id=${songId}&format=json`);
                    const data = await response.json();
                    return data.data?.[0]?.url || null;
                } catch (e) {
                    return null;
                }
            }
        }));

        // 4. 酷我音乐
        this.registerPlugin(new MusicFreePlugin({
            id: 'kuwo',
            name: '酷我音乐',
            version: '1.0.0',
            author: '随便听',
            description: '另一个音乐源',
            apis: {
                search: 'https://www.kuwo.cn/api/www/search/searchMusicBykeyWord'
            },
            search: async function(keyword, limit) {
                try {
                    const response = await fetch(`${this.apis.search}?key=${encodeURIComponent(keyword)}&pn=1&rn=${limit}`, {
                        headers: { 'Referer': 'https://www.kuwo.cn/' }
                    });
                    const data = await response.json();
                    if (data.code !== 200 || !data.data?.list) return [];
                    
                    return data.data.list.map(song => ({
                        id: song.rid.toString(),
                        title: song.name,
                        artist: song.artist || '未知艺术家',
                        album: song.album || '未知专辑',
                        duration: Math.floor(song.duration || 180),
                        cover: song.albumpic || `https://picsum.photos/400/400?random=${song.rid}`,
                        pluginId: 'kuwo',
                        source: 'kuwo'
                    }));
                } catch (e) {
                    console.error('酷我搜索失败:', e);
                    return [];
                }
            },
            getUrl: async function(songId) {
                try {
                    const response = await fetch(`https://www.kuwo.cn/api/v1/www/music/playurl?mid=${songId}&type=music`, {
                        headers: { 'Referer': 'https://www.kuwo.cn/' }
                    });
                    const data = await response.json();
                    return data.data?.url || null;
                } catch (e) {
                    return null;
                }
            }
        }));

        // 5. Audiomack (美国Hip-Hop/R&B音乐)
        this.registerPlugin(new MusicFreePlugin({
            id: 'audiomack',
            name: 'Audiomack',
            version: '1.0.0',
            author: '随便听',
            description: '美国Hip-Hop/R&B音乐',
            apis: {
                search: 'https://www.audiomack.com/api/soc-app/search'
            },
            search: async function(keyword, limit) {
                // Audiomack需要API密钥，这里返回示例数据
                return this.getAudiomackDemoData(keyword, limit);
            },
            getUrl: async function(songId) {
                return null;
            },
            getAudiomackDemoData: function(keyword, limit) {
                const demoData = [
                    { id: 'am1', title: ' trending rap', artist: 'Various Artists', album: 'Hot Hip-Hop', duration: 180, cover: 'https://picsum.photos/400/400?random=201' },
                    { id: 'am2', title: 'R&B Vibes', artist: 'Smooth Grooves', album: 'R&B Classics', duration: 210, cover: 'https://picsum.photos/400/400?random=202' },
                ];
                return demoData.slice(0, limit).map(s => ({ ...s, pluginId: 'audiomack', source: 'audiomack' }));
            }
        }));

        // 6. YouTube (需要解析)
        this.registerPlugin(new MusicFreePlugin({
            id: 'youtube',
            name: 'YouTube',
            version: '1.0.0',
            author: '随便听',
            description: '全球最大视频平台',
            apis: {
                search: 'https://www.googleapis.com/youtube/v3/search'
            },
            search: async function(keyword, limit) {
                // YouTube需要API密钥，返回提示
                return [{
                    id: 'yt_demo',
                    title: '🎬 ' + keyword + ' - YouTube视频',
                    artist: '点击查看YouTube',
                    album: 'YouTube',
                    duration: 0,
                    cover: 'https://picsum.photos/400/400?random=301',
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`,
                    pluginId: 'youtube',
                    source: 'youtube',
                    isExternal: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 7. Bilibili (B站)
        this.registerPlugin(new MusicFreePlugin({
            id: 'bilibili',
            name: 'Bilibili',
            version: '1.0.0',
            author: '随便听',
            description: 'B站视频/弹幕音乐',
            apis: {
                search: 'https://api.bilibili.com/x/web-interface/search'
            },
            search: async function(keyword, limit) {
                return [{
                    id: 'bilibili_demo',
                    title: '📺 ' + keyword + ' - B站视频',
                    artist: '点击查看B站',
                    album: 'Bilibili',
                    duration: 0,
                    cover: 'https://picsum.photos/400/400?random=401',
                    url: `https://search.bilibili.com/api/search?search_type=video&keyword=${encodeURIComponent(keyword)}`,
                    pluginId: 'bilibili',
                    source: 'bilibili',
                    isExternal: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 8. Suno AI音乐
        this.registerPlugin(new MusicFreePlugin({
            id: 'suno',
            name: 'Suno AI',
            version: '1.0.0',
            author: '随便听',
            description: 'AI生成音乐',
            apis: {
                base: 'https://studio.ai'
            },
            search: async function(keyword, limit) {
                return [{
                    id: 'suno_demo',
                    title: '🎵 ' + keyword + ' - AI音乐',
                    artist: 'Suno AI',
                    album: 'AI Generated',
                    duration: 180,
                    cover: 'https://picsum.photos/400/400?random=501',
                    url: 'https://suno.ai',
                    pluginId: 'suno',
                    source: 'suno',
                    isExternal: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 9. Udio AI音乐
        this.registerPlugin(new MusicFreePlugin({
            id: 'udio',
            name: 'Udio AI',
            version: '1.0.0',
            author: '随便听',
            description: 'AI生成音乐',
            apis: {
                base: 'https://www.udio.com'
            },
            search: async function(keyword, limit) {
                return [{
                    id: 'udio_demo',
                    title: '🎹 ' + keyword + ' - Udio AI',
                    artist: 'Udio AI',
                    album: 'AI Music',
                    duration: 240,
                    cover: 'https://picsum.photos/400/400?random=601',
                    url: 'https://www.udio.com',
                    pluginId: 'udio',
                    source: 'udio',
                    isExternal: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 10. 猫耳FM (ASMR)
        this.registerPlugin(new MusicFreePlugin({
            id: 'maoerfm',
            name: '猫耳FM',
            version: '1.0.0',
            author: '随便听',
            description: 'ASMR/语音电台',
            apis: {
                search: 'https://www.moer.fm/api'
            },
            search: async function(keyword, limit) {
                return [{
                    id: 'maoer_demo',
                    title: '🎧 ' + (keyword || '放松') + ' - ASMR',
                    artist: '猫耳FM',
                    album: 'ASMR Radio',
                    duration: 600,
                    cover: 'https://picsum.photos/400/400?random=701',
                    url: 'https://www.moer.fm',
                    pluginId: 'maoerfm',
                    source: 'maoerfm',
                    isExternal: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 11. 音悦台
        this.registerPlugin(new MusicFreePlugin({
            id: 'yinyuetai',
            name: '音悦台',
            version: '1.0.0',
            author: '随便听',
            description: 'MV音乐平台',
            apis: {
                search: 'https://search.yinyuetai.com'
            },
            search: async function(keyword, limit) {
                return [{
                    id: 'yyt_demo',
                    title: '📹 ' + keyword + ' - MV',
                    artist: '音悦台',
                    album: 'Music Video',
                    duration: 240,
                    cover: 'https://picsum.photos/400/400?random=801',
                    url: `https://www.yinyuetai.com/search?keyword=${encodeURIComponent(keyword)}`,
                    pluginId: 'yinyuetai',
                    source: 'yinyuetai',
                    isExternal: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 12. 快手
        this.registerPlugin(new MusicFreePlugin({
            id: 'kuaishou',
            name: '快手',
            version: '1.0.0',
            author: '随便听',
            description: '短视频音乐',
            apis: {
                search: 'https://www.kuaishou.com'
            },
            search: async function(keyword, limit) {
                return [{
                    id: 'ks_demo',
                    title: '🎬 ' + keyword + ' - 快手视频',
                    artist: '快手',
                    album: 'Short Video',
                    duration: 60,
                    cover: 'https://picsum.photos/400/400?random=901',
                    url: `https://www.kuaishou.com/search/video?searchKey=${encodeURIComponent(keyword)}`,
                    pluginId: 'kuaishou',
                    source: 'kuaishou',
                    isExternal: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 13. 歌词网
        this.registerPlugin(new MusicFreePlugin({
            id: 'geciwang',
            name: '歌词网',
            version: '1.0.0',
            author: '随便听',
            description: '歌词搜索',
            apis: {
                search: 'https://www.geciwang.com'
            },
            search: async function(keyword, limit) {
                return [{
                    id: 'geci_demo',
                    title: '📝 ' + keyword + ' - 歌词',
                    artist: '歌词网',
                    album: 'Lyrics',
                    duration: 0,
                    cover: 'https://picsum.photos/400/400?random=1001',
                    url: `https://www.geciwang.com/search?${encodeURIComponent(keyword)}`,
                    pluginId: 'geciwang',
                    source: 'geciwang',
                    isExternal: true,
                    isLyrics: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 14. 歌词千寻
        this.registerPlugin(new MusicFreePlugin({
            id: 'geciqianxun',
            name: '歌词千寻',
            version: '1.0.0',
            author: '随便听',
            description: '歌词查询',
            apis: {
                search: 'https://www.geciqianxun.com'
            },
            search: async function(keyword, limit) {
                return [{
                    id: 'gcqx_demo',
                    title: '📄 ' + keyword + ' - 歌词',
                    artist: '歌词千寻',
                    album: 'Lyrics',
                    duration: 0,
                    cover: 'https://picsum.photos/400/400?random=1101',
                    url: `https://www.geciqianxun.com/`,
                    pluginId: 'geciqianxun',
                    source: 'geciqianxun',
                    isExternal: true,
                    isLyrics: true
                }];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 15. Openwhyd (免费音乐流)
        this.registerPlugin(new MusicFreePlugin({
            id: 'openwhyd',
            name: 'Openwhyd',
            version: '1.0.0',
            author: '随便听',
            description: '免费音乐流',
            apis: {
                hot: 'https://openwhyd.org/hot'
            },
            search: async function(keyword, limit) {
                if (!keyword) {
                    try {
                        const response = await fetch(`${this.apis.hot}?format=json`);
                        const data = await response.json();
                        if (!data.tracks || data.tracks.length === 0) return [];
                        
                        return data.tracks.slice(0, limit).map((track, index) => ({
                            id: `openwhyd_${index}`,
                            title: track.name.split(' - ')[1] || track.name,
                            artist: track.name.split(' - ')[0] || 'Unknown Artist',
                            album: 'Openwhyd',
                            duration: 0,
                            cover: track.img.replace('default.jpg', 'hqdefault.jpg'),
                            url: `https://www.youtube.com/watch?v=${track.eId.replace('/yt/', '')}`,
                            youtubeId: track.eId.replace('/yt/', ''),
                            pluginId: 'openwhyd',
                            source: 'openwhyd'
                        }));
                    } catch (e) {
                        console.error('Openwhyd获取失败:', e);
                        return [];
                    }
                }
                return [];
            },
            getUrl: async function(songId) {
                return null;
            }
        }));

        // 设置默认插件
        this.activePlugin = 'free';
    }

    registerPlugin(plugin) {
        this.plugins.set(plugin.id, plugin);
        console.log(`插件已注册: ${plugin.name}`);
    }

    unregisterPlugin(pluginId) {
        this.plugins.delete(pluginId);
    }

    setActivePlugin(pluginId) {
        if (this.plugins.has(pluginId)) {
            this.activePlugin = pluginId;
            return true;
        }
        return false;
    }

    getActivePlugin() {
        return this.plugins.get(this.activePlugin);
    }

    getAllPlugins() {
        return Array.from(this.plugins.values());
    }

    async search(keyword, limit = 20) {
        const results = [];
        
        for (const [id, plugin] of this.plugins) {
            try {
                const pluginResults = await plugin.search(keyword, limit);
                results.push(...pluginResults);
            } catch (e) {
                console.error(`插件 ${plugin.name} 搜索失败:`, e);
            }
        }
        
        return results;
    }

    async searchWithPlugin(pluginId, keyword, limit = 20) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return [];
        return await plugin.search(keyword, limit);
    }

    async getPlayUrl(song, tryAll = true) {
        if (tryAll) {
            for (const [id, plugin] of this.plugins) {
                try {
                    const url = await plugin.getPlayUrl(song.id);
                    if (url) {
                        console.log(`从插件 ${plugin.name} 获取播放链接成功`);
                        return url;
                    }
                } catch (e) {
                    console.error(`插件 ${plugin.name} 获取URL失败:`, e);
                }
            }
            return null;
        } else {
            const plugin = this.plugins.get(song.pluginId || song.source);
            if (!plugin) return null;
            return await plugin.getPlayUrl(song.id);
        }
    }

    async getLyrics(song) {
        const plugin = this.plugins.get(song.pluginId || song.source);
        if (!plugin) return null;
        return await plugin.getLyrics(song.id);
    }
}

// 官方MusicFree插件列表
const musicFreeOfficialPlugins = [
    { name: 'Audiomack', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/audiomack/index.js', version: '0.0.2' },
    { name: '歌词网', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/geciwang/index.js', version: '0.0.0' },
    { name: '歌词千寻', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/geciqianxun/index.js', version: '0.0.0' },
    { name: 'Navidrome', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/navidrome/index.js', version: '0.0.0' },
    { name: 'Suno', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/suno/index.js', version: '0.0.0' },
    { name: 'Udio', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/udio/index.js', version: '0.0.0' },
    { name: '猫耳FM', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/maoerfm/index.js', version: '0.1.4' },
    { name: '快手', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/kuaishou/index.js', version: '0.0.2' },
    { name: '音悦台', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/yinyuetai/index.js', version: '0.0.1' },
    { name: 'YouTube', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/youtube/index.js', version: '0.0.1' },
    { name: 'Bilibili', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/bilibili/index.js', version: '0.2.3' },
    { name: 'WebDAV', url: 'https://raw.gitcode.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/webdav/index.js', version: '0.0.2' }
];

window.musicFreePluginManager = new MusicFreePluginManager();
window.musicFreeOfficialPlugins = musicFreeOfficialPlugins;
