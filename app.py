from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS
from app.config import Config
from app.mqtt_client import MQTTClient
from app.socket_events import SocketEvents
from app.logger import logger

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')
    
    # 初始化MQTT客户端
    mqtt_client = MQTTClient(socketio)
    
    # 注册Socket事件处理
    socket_events = SocketEvents(mqtt_client)
    socket_events.register_handlers(socketio)
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    return app, socketio, mqtt_client

app, socketio, mqtt_client = create_app()

if __name__ == '__main__':
    mqtt_client.start()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 