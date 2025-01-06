from flask_socketio import emit
from .logger import logger
from .utils import sanitize_message
import json

class SocketEvents:
    def __init__(self, mqtt_client):
        self.mqtt_client = mqtt_client

    def register_handlers(self, socketio):
        @socketio.on('connect')
        def handle_connect():
            logger.info('Client connected')

        @socketio.on('disconnect')
        def handle_disconnect():
            logger.info('Client disconnected')

        @socketio.on('chat_message')
        def handle_message(data):
            try:
                logger.info(f"Received message: {data}")
                if not all(k in data for k in ['username', 'message']):
                    raise ValueError("Invalid message format")

                # 处理图片消息
                if data.get('type') == 'image':
                    # 可以在这里添加图片验证、大小限制等
                    pass
                    
                sanitized_message = sanitize_message(data)
                logger.info(f"Sanitized message: {sanitized_message}")
                
                self.mqtt_client.publish(
                    f"chat/room1/{sanitized_message['username']}", 
                    json.dumps(sanitized_message)
                )
            except Exception as e:
                logger.error(f"Error handling message: {e}", exc_info=True)
                emit('error', {'error': str(e)}) 