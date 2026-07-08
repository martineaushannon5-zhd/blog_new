# Nginx 准备目录

这个目录用于存放云服务器部署时的 Nginx 反向代理配置。

## 计划用途

- 托管前端静态资源
- 将 `/api` 请求反向代理到 Node.js 服务
- 接入 HTTPS
- 配置 Gzip / Brotli
- 配置缓存头

## 建议文件

- `default.conf`
- `blog.conf`
- `ssl-notes.md`

## 建议反代结构

- `https://your-domain.com/` -> 前端静态文件
- `https://your-domain.com/api/` -> `http://127.0.0.1:4000/api/`
