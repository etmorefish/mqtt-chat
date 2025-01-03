import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    MQTT_USER = os.getenv('MQTT_USER')
    MQTT_PASS = os.getenv('MQTT_PASS')
    MQTT_HOST = os.getenv('MQTT_HOST', 'xxx.xxx.xxx.xxx')
    MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
    MQTT_TOPIC = "chat/room1/#"
    
    # 日志配置
    LOG_LEVEL = "INFO"
    LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
    LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
    LOG_FILE = "logs/chat.log"
    LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT = 10 