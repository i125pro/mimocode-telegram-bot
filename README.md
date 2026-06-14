# MiMoCode Telegram Bot

Telegram bot client for MiMoCode to run and monitor coding tasks from chat.

## 功能特性

- 通过 Telegram 控制 MiMoCode 编码任务
- 实时监控任务执行状态
- 支持多种模型提供商
- 自动会话恢复和管理
- 安全的多用户权限控制

## 安装要求

- Node.js >= 18
- npm >= 9
- 有效 Telegram Bot Token
- 运行中的 MiMoCode 服务 (默认端口 4096)
- 兼容环境：Linux/Ubuntu（Termux 需要特殊配置）

## 安装步骤

```bash
# 克隆仓库
git clone https://github.com/i125pro/mimocode-telegram-bot.git
cd mimocode-telegram-bot

# 安装依赖
npm install

# 构建项目
npm run build

# 配置环境
cp .env.example .env
# 编辑 .env 文件，填入你的 Telegram Bot Token 和 MiMoCode 服务地址

# 运行 bot
node dist/index.js
```

## 配置说明

创建 `.env` 文件，包含以下配置项：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ALLOWED_USER_ID=your_user_id
OPENCODE_API_URL=http://localhost:4096
OPENCODE_MODEL_PROVIDER=mimo
OPENCODE_MODEL_ID=mimo-auto
BOT_LOCALE=zh
LOG_LEVEL=info
```

### 配置项说明

- `TELEGRAM_BOT_TOKEN`: Telegram Bot 的 API Token
- `TELEGRAM_ALLOWED_USER_ID`: 允许使用 Bot 的 Telegram 用户 ID
- `OPENCODE_API_URL`: MiMoCode 服务的 API 地址
- `OPENCODE_MODEL_PROVIDER`: 模型提供商
- `OPENCODE_MODEL_ID`: 使用的模型 ID
- `BOT_LOCALE`: 语言设置 (zh/ko/en)
- `LOG_LEVEL`: 日志级别

## 运行管理

### 开发模式

```bash
npm run build
node dist/index.js
```

### 生产模式

建议使用 systemd 或 pm2 进行进程管理。

## 故障排除

### 常见问题

1. **Bot 无法启动**
   - 检查 `.env` 文件配置是否正确
   - 确认 MiMoCode 服务正在运行
   - 查看日志文件获取详细错误信息

2. **连接 MiMoCode 失败**
   - 验证 `OPENCODE_API_URL` 地址和端口
   - 确保 MiMoCode 服务已正确启动并监听

3. **权限问题**
   - 确认 `TELEGRAM_ALLOWED_USER_ID` 正确
   - 检查 Bot 是否具有必要的权限

4. **Termux 环境兼容问题**
   - MiMoCode 服务需要 glibc wrapper 运行
   - 使用 `grun` 命令启动 MiMoCode 服务
   - 确保 MiMoCode 服务端口与 `.env` 配置一致

5. **多实例冲突**
   - 确保只有一个 bot 实例在运行
   - 检查是否有重复的 node 进程
   - 使用 `ps -ef | grep "node dist"` 查看进程状态

### 日志位置

Bot 运行日志保存在 `logs/` 目录下。

## 依赖项

本项目使用以下主要依赖项：

- `grammy`: Telegram Bot 框架
- `@opencode-ai/sdk`: MiMoCode SDK
- `dotenv`: 环境变量管理
- `sql.js`: JavaScript 实现的关系数据库

## 安全注意事项

- **不要**将 `.env` 文件提交到版本控制系统
- 确保 `TELEGRAM_ALLOWED_USER_ID` 只包含可信用户
- 定期更新依赖项以修复安全漏洞

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

- GitHub: [i125pro](https://github.com/i125pro)
