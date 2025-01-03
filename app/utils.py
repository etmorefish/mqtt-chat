def sanitize_message(message):
    return {
        'username': str(message['username'])[:20],
        'message': str(message['message'])[:500],
        'timestamp': message.get('timestamp', '')
    } 