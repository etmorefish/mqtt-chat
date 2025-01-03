import os
import logging
from logging.handlers import RotatingFileHandler
from .config import Config

def setup_logger():
    # 创建logs目录
    if not os.path.exists('logs'):
        os.makedirs('logs')

    logger = logging.getLogger(__name__)
    logger.setLevel(getattr(logging, Config.LOG_LEVEL))

    # 配置日志格式
    formatter = logging.Formatter(
        Config.LOG_FORMAT,
        datefmt=Config.LOG_DATE_FORMAT
    )

    # 文件处理器
    file_handler = RotatingFileHandler(
        Config.LOG_FILE,
        maxBytes=Config.LOG_MAX_BYTES,
        backupCount=Config.LOG_BACKUP_COUNT,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger

logger = setup_logger() 