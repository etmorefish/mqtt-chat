# 要多吃鱼聊天室

一个基于 MQTT 协议的实时聊天应用，采用微信风格的界面设计，支持实时消息推送。

## 功能特点

- ✨ 微信风格界面设计
- 🚀 实时消息推送
- 👤 用户头像（首字母显示）
- ⌚ 消息时间戳
- ⌨️ 回车快捷发送
- 📱 移动端适配
- 📝 消息长度限制
- 🔄 自动重连机制
- 🖼️ 图片发送功能
  - 支持点击上传
  - 支持拖拽上传
  - 自动压缩优化
  - 图片预览
- 😊 表情选择器
  - 40个常用表情
  - 点击快速插入
- ✂️ 文本复制
  - 点击消息复制内容
  - 自动复制提示

## 项目结构

```
chat/
├── app/                    # 应用核心代码
│   ├── __init__.py
│   ├── config.py          # 配置管理
│   ├── logger.py          # 日志配置
│   ├── mqtt_client.py     # MQTT客户端
│   ├── socket_events.py   # WebSocket事件
│   └── utils.py           # 工具函数
├── static/                 # 静态资源
│   └── js/
│       └── chat.js        # 前端脚本
├── templates/             # 模板文件
│   └── index.html        # 聊天界面
├── logs/                  # 日志目录
├── app.py                # 应用入口
├── gunicorn_config.py    # Gunicorn配置
├── requirements.txt      # 项目依赖
└── README.md            # 项目文档
```

## 技术栈

### 后端
- Flask + Flask-SocketIO：Web框架和WebSocket支持
- Paho-MQTT：MQTT客户端
- Gevent：异步处理
- Python-dotenv：环境变量管理
- Logging：日志管理

### 前端
- Tailwind CSS：样式框架
- Socket.IO Client：WebSocket客户端
- 原生 JavaScript：前端逻辑

## 快速开始

1. 克隆项目并安装依赖
```bash
git clone [repository-url]
cd mqtt-chat
pip install -r requirements.txt
```

2. 创建 `.env` 文件并配置
```bash
SECRET_KEY=your_secret_key
MQTT_USER=
MQTT_PASS=
MQTT_HOST=xxx.xxx.xxx.xxx
MQTT_PORT=1883
```

3. 运行应用

开发环境：
```bash
python app.py
```

生产环境：
```bash
gunicorn -c gunicorn_config.py app:app
```

## 配置说明

### 应用配置 (app/config.py)
- SECRET_KEY：应用密钥
- MQTT相关配置：用户名、密码、服务器地址等
- 日志配置：级别、格式、文件路径等

### 日志配置
- 日志级别：INFO
- 日志格式：时间戳 - 日志级别 - 消息内容
- 日志存储：
  - 同时输出到控制台和文件
  - 文件位置：logs/chat.log
  - 按大小切分：10MB
  - 保留最近10个备份文件

### Gunicorn配置
- 监听端口：8000
- Worker类型：gevent
- Worker数量：4
- Keep-alive：65秒
- 超时时间：120秒

## 模块说明

### MQTT客户端 (app/mqtt_client.py)
- 处理MQTT连接和消息收发
- 支持自动重连
- 消息转发到WebSocket

### WebSocket事件 (app/socket_events.py)
- 处理客户端连接/断开
- 处理消息发送
- 错误处理和日志记录

### 工具函数 (app/utils.py)
- 消息清理和格式化
- 用户名长度限制：20字符
- 消息长度限制：500字符

## 使用说明

1. 打开聊天室页面
2. 输入您的昵称（最多20字符）
3. 在输入框中输入消息（最多500字符）
4. 点击发送或按回车键发送消息
5. 发送图片：
   - 点击图片按钮选择文件
   - 或直接拖拽图片到聊天区域
6. 使用表情：
   - 点击表情按钮打开选择器
   - 点击表情插入到消息中
7. 复制消息：
   - 点击文本消息可复制内容
   - 点击图片可查看大图

## 注意事项

- 确保MQTT服务器可用
- 建议使用现代浏览器访问
- 日志文件会自动按大小切分
- 建议定期清理旧的日志文件
- 图片大小限制为5MB
- 大尺寸图片会自动压缩

