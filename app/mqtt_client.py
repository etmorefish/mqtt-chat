import paho.mqtt.client as mqtt
from .logger import logger
from .config import Config

class MQTTClient:
    def __init__(self, socketio):
        self.socketio = socketio
        self.client = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
            protocol=mqtt.MQTTv5
        )
        self.setup_client()

    def setup_client(self):
        self.client.username_pw_set(
            username=Config.MQTT_USER,
            password=Config.MQTT_PASS
        )
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc, properties=None):
        logger.info(f"Connected with result code {rc}")
        client.subscribe(Config.MQTT_TOPIC)

    def on_message(self, client, userdata, msg):
        message = msg.payload.decode()
        self.socketio.emit('chat_message', {'data': message})

    def start(self):
        try:
            self.client.connect(Config.MQTT_HOST, Config.MQTT_PORT)
            self.client.loop_start()
            logger.info("MQTT client started successfully")
        except Exception as e:
            logger.error(f"Failed to start MQTT client: {e}", exc_info=True)

    def publish(self, topic, message):
        self.client.publish(topic, message) 