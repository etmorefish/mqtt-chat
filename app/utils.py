def sanitize_message(message):
    # 检查消息类型
    if message.get('type') == 'image':
        # 图片消息不限制长度
        return {
            'username': str(message['username'])[:20],
            'message': message['message'],  # 不截断图片数据
            'timestamp': message.get('timestamp', ''),
            'type': 'image'
        }
    else:
        # 文本消息保持原有限制
        return {
            'username': str(message['username'])[:20],
            'message': str(message['message'])[:500],
            'timestamp': message.get('timestamp', ''),
            'type': 'text'  # 添加默认类型
        } 