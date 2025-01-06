def sanitize_message(message):
    base_info = {
        'userId': str(message['userId']),
        'username': str(message['username'])[:20],
        'timestamp': message.get('timestamp', '')
    }
    
    # 处理不同类型的消息
    if message.get('type') == 'image':
        return {
            **base_info,
            'message': message['message'],
            'type': 'image'
        }
    else:
        return {
            **base_info,
            'message': str(message['message'])[:500],
            'type': 'text'
        } 