// sw.js - 运行在浏览器后台的代理服务器
const TARGET_HOST = 'http://61.147.97.234:15868';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // 强制立即激活
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 拦截页面的所有请求
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 如果你的请求路径符合代理规则（比如访问了 /proxy/xxx）
    if (url.pathname.includes('/proxy/')) {
        // 提取出实际要请求后端的路径（比如 /login.php）
        const realPath = url.pathname.split('/proxy/')[1] || '/';
        const targetUrl = `${TARGET_HOST}/${realPath}${url.search}`;

        // 构造一个新的请求发给后端
        const proxyRequest = new Request(targetUrl, {
            method: event.request.method,
            headers: event.request.headers,
            body: event.request.body,
            credentials: 'include',
            redirect: 'manual' // 防止拦截 302 重定向
        });

        // 发送请求并将结果返回给页面
        event.respondWith(
            fetch(proxyRequest).then(response => {
                // 允许跨域（实际上 Service Worker 内部已经不受浏览器跨域限制了）
                return response;
            }).catch(err => {
                return new Response(`Proxy Error: ${err.message}`, { status: 500 });
            })
        );
    }
});