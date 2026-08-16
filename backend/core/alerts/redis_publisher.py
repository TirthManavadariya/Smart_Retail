"""
Redis Pub/Sub publisher with in-memory fallback.
Relocated to backend/core/alerts/redis_publisher.py
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import json
from datetime import datetime
from collections import deque
from typing import Optional, Callable

from config.settings import REDIS_HOST, REDIS_PORT


class InMemoryPubSub:
    """In-memory Pub/Sub fallback when Redis is unavailable."""
    def __init__(self):
        self.channels = {}
        self.subscribers = {}

    def publish(self, channel: str, message: str) -> int:
        if channel not in self.channels:
            self.channels[channel] = deque(maxlen=1000)
        self.channels[channel].append({"type": "message", "channel": channel,
                                        "data": message, "timestamp": datetime.now().isoformat()})
        for callback in self.subscribers.get(channel, []):
            try: callback(message)
            except Exception: pass
        return len(self.subscribers.get(channel, []))

    def subscribe(self, channel: str, callback: Optional[Callable] = None):
        if channel not in self.subscribers:
            self.subscribers[channel] = []
        if callback:
            self.subscribers[channel].append(callback)

    def get_messages(self, channel: str, count: int = 50) -> list:
        return list(self.channels.get(channel, []))[-count:]


class RedisPublisher:
    """Publishes alerts to Redis Pub/Sub channels. Falls back to in-memory queue."""
    CHANNEL_ALL      = "alerts:all"
    CHANNEL_STOCKOUT = "alerts:stockout"
    CHANNEL_PLANOGRAM = "alerts:planogram"
    CHANNEL_PRICE    = "alerts:price"

    def __init__(self):
        self.redis_client = None
        self.fallback = InMemoryPubSub()
        self.use_redis = False
        self._connect()

    def _connect(self):
        try:
            import redis
            self.redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT,
                                            decode_responses=True, socket_connect_timeout=2)
            self.redis_client.ping()
            self.use_redis = True
        except Exception:
            self.use_redis = False

    def publish_alert(self, alert) -> bool:
        data = alert.to_dict() if hasattr(alert, "to_dict") else (alert if isinstance(alert, dict) else {"message": str(alert)})
        message = json.dumps(data, default=str)
        alert_type = data.get("alert_type", "")
        channels = [self.CHANNEL_ALL]
        if "STOCKOUT" in alert_type or "LOW_STOCK" in alert_type:
            channels.append(self.CHANNEL_STOCKOUT)
        elif "PLANOGRAM" in alert_type:
            channels.append(self.CHANNEL_PLANOGRAM)
        elif "PRICE" in alert_type:
            channels.append(self.CHANNEL_PRICE)
        success = True
        for ch in channels:
            try:
                (self.redis_client if self.use_redis else self.fallback).publish(ch, message)
            except Exception:
                success = False
        return success

    def get_recent_messages(self, channel: str = None, count: int = 50) -> list:
        channel = channel or self.CHANNEL_ALL
        return self.fallback.get_messages(channel, count) if not self.use_redis else []

    def get_status(self) -> dict:
        return {"backend": "Redis" if self.use_redis else "In-Memory",
                "host": f"{REDIS_HOST}:{REDIS_PORT}" if self.use_redis else "local",
                "connected": self.use_redis,
                "channels": [self.CHANNEL_ALL, self.CHANNEL_STOCKOUT, self.CHANNEL_PLANOGRAM, self.CHANNEL_PRICE]}


publisher = RedisPublisher()
