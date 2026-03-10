/**
 * 音乐播放器代理服务器
 * 用于处理网易云音乐外链重定向
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;

// MIME 类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 代理音乐请求
    if (pathname === '/proxy/music') {
        const songId = parsedUrl.query.id;
        if (!songId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing song ID' }));
            return;
        }

        try {
            const musicUrl = `https://music.163.com/song/media/outer/url?id=${songId}`;
            
            // 获取重定向后的真实 URL
            const realUrl = await getRedirectUrl(musicUrl);
            
            if (realUrl) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    url: realUrl,
                    id: songId 
                }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Music not found' }));
            }
        } catch (error) {
            console.error('Proxy error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        return;
    }

    // 代理音频流
    if (pathname === '/proxy/stream') {
        const songId = parsedUrl.query.id;
        if (!songId) {
            res.writeHead(400);
            res.end('Missing song ID');
            return;
        }

        try {
            const musicUrl = `https://music.163.com/song/media/outer/url?id=${songId}`;
            const realUrl = await getRedirectUrl(musicUrl);

            if (!realUrl) {
                res.writeHead(404);
                res.end('Music not found');
                return;
            }

            // 代理音频流
            const client = realUrl.startsWith('https') ? https : http;
            const proxyReq = client.get(realUrl, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, {
                    'Content-Type': proxyRes.headers['content-type'] || 'audio/mpeg',
                    'Content-Length': proxyRes.headers['content-length'],
                    'Accept-Ranges': 'bytes',
                });
                proxyRes.pipe(res);
            });

            proxyReq.on('error', (err) => {
                console.error('Proxy stream error:', err);
                res.writeHead(500);
                res.end('Stream error');
            });
        } catch (error) {
            console.error('Stream error:', error);
            res.writeHead(500);
            res.end('Internal error');
        }
        return;
    }

    // 静态文件服务
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在，返回 index.html（支持前端路由）
                fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('Not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content);
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

/**
 * 获取重定向后的 URL
 */
function getRedirectUrl(urlString) {
    return new Promise((resolve, reject) => {
        const client = urlString.startsWith('https') ? https : http;
        
        const options = {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://music.163.com/',
            }
        };

        const req = client.request(urlString, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // 跟随重定向
                resolve(res.headers.location);
            } else if (res.statusCode === 200) {
                resolve(urlString);
            } else {
                resolve(null);
            }
        });

        req.on('error', (err) => {
            console.error('Request error:', err);
            resolve(null);
        });

        req.end();
    });
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is in use, trying ${PORT + 1}...`);
        server.listen(PORT + 1);
    } else {
        console.error('Server error:', err);
    }
});
