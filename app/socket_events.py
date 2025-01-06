from flask import request
from flask_socketio import emit
from .logger import logger
from .utils import sanitize_message
import json

class SocketEvents:
    def __init__(self, mqtt_client):
        self.mqtt_client = mqtt_client
        self.online_users = {}  # {userId: user_info}

    def register_handlers(self, socketio):
        @socketio.on('connect')
        def handle_connect():
            logger.info('Client connected')

        @socketio.on('disconnect')
        def handle_disconnect():
            if request.sid in self.online_users:
                user_info = self.online_users[request.sid]
                del self.online_users[request.sid]
                emit('user_offline', user_info, broadcast=True)
            logger.info('Client disconnected')

        @socketio.on('user_join')
        def handle_join(user_info):
            self.online_users[request.sid] = user_info
            emit('user_online', user_info, broadcast=True)
            # 发送当前在线用户列表给新用户
            emit('online_users', list(self.online_users.values()))

        @socketio.on('name_updated')
        def handle_name_update(user_info):
            if request.sid in self.online_users:
                old_info = self.online_users[request.sid]
                self.online_users[request.sid] = user_info
                emit('user_updated', {
                    'old': old_info,
                    'new': user_info
                }, broadcast=True)

        @socketio.on('chat_message')
        def handle_message(data):
            try:
                logger.info(f"Received message: {data}")
                if not all(k in data for k in ['userId', 'username', 'message']):
                    raise ValueError("Invalid message format")

                sanitized_message = sanitize_message(data)
                logger.info(f"Sanitized message: {sanitized_message}")
                
                self.mqtt_client.publish(
                    f"chat/room1/{sanitized_message['userId']}", 
                    json.dumps(sanitized_message)
                )
            except Exception as e:
                logger.error(f"Error handling message: {e}", exc_info=True)
                emit('error', {'error': str(e)}) 