# Cloudflare 准备目录

这个目录用于存放后续云服务器上线时的 Cloudflare 配置资料。

## 计划放置内容

- 域名接入说明
- DNS 解析记录
- SSL/TLS 配置
- 缓存规则
- WAF / 安全规则
- Page Rules / Rules
- 回源策略

## 建议配置方向

- 根域与 `www` 统一接入 Cloudflare
- `A` 记录指向云服务器公网 IP
- 开启 `Full (strict)` SSL
- 对静态资源启用缓存
- 对 `/api/*` 关闭页面缓存，仅保留安全与加速能力

## 可扩展内容

- `dns-records.md`
- `cache-rules.md`
- `ssl-notes.md`
- `waf-rules.md`
