# Redis 准备目录

这个目录用于存放后续 Redis 接入配置。

## 计划用途

- 热门文章缓存
- 后台会话缓存
- 接口限流
- 异步任务队列预留

## 建议文件

- `redis.conf`
- `usage-notes.md`
- `cache-design.md`

## 建议接入方向

- 开发阶段可本机 Redis
- 生产阶段建议开启密码认证
- 如部署在公网服务器，禁止直接暴露 Redis 端口
