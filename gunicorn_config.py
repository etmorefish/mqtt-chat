from gevent import monkey
monkey.patch_all()

bind = "0.0.0.0:8000"
workers = 4
worker_class = "gevent"
keepalive = 65
timeout = 120 