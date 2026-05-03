"""
Voice Chat Monitoring & Metrics - Rastreamento de performance e uso de tokens.
Monitora: latência, token usage, taxa de erro, cache hit rate.
"""

import time
import logging
from typing import Dict, Any
from collections import deque
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class VoiceMetrics:
    """Coleta e reporta métricas de voice chat."""
    
    def __init__(self, window_size: int = 100):
        """
        Args:
            window_size: Número de requests recentes para manter em memória
        """
        self.window_size = window_size
        self.requests = deque(maxlen=window_size)
        self.errors = deque(maxlen=window_size)
        self.start_time = time.time()
    
    def record_request(
        self,
        classification: str,
        model: str,
        latency_ms: int,
        tokens_consumed: int,
        user_id: int = 0,
        error: bool = False
    ):
        """Registra métrica de requisição."""
        record = {
            "timestamp": datetime.now(),
            "classification": classification,
            "model": model,
            "latency_ms": latency_ms,
            "tokens_consumed": tokens_consumed,
            "user_id": user_id,
            "error": error,
        }
        self.requests.append(record)
        
        if error:
            self.errors.append(record)
        
        # Log warning se latência alta
        if latency_ms > 5000:
            logger.warning(f"[SLOW-REQUEST] {latency_ms}ms | model: {model} | user: {user_id}")
        
        # Log warning se tokens altos
        if tokens_consumed > 1500:
            logger.warning(f"[HIGH-TOKENS] {tokens_consumed} | model: {model} | user: {user_id}")
    
    def get_summary(self) -> Dict[str, Any]:
        """Retorna sumário de métricas."""
        if not self.requests:
            return {
                "total_requests": 0,
                "total_errors": 0,
                "error_rate_percent": 0,
                "avg_latency_ms": 0,
                "p95_latency_ms": 0,
                "p99_latency_ms": 0,
                "avg_tokens": 0,
                "total_tokens": 0,
            }
        
        # Latências
        latencies = [r["latency_ms"] for r in self.requests if not r["error"]]
        if latencies:
            latencies.sort()
            avg_lat = sum(latencies) / len(latencies)
            p95_lat = latencies[int(len(latencies) * 0.95)] if len(latencies) > 20 else latencies[-1]
            p99_lat = latencies[int(len(latencies) * 0.99)] if len(latencies) > 100 else latencies[-1]
        else:
            avg_lat = p95_lat = p99_lat = 0
        
        # Tokens
        tokens = [r["tokens_consumed"] for r in self.requests]
        avg_tokens = sum(tokens) / len(tokens) if tokens else 0
        total_tokens = sum(tokens)
        
        # Errors
        total_requests = len(self.requests)
        total_errors = len(self.errors)
        error_rate = (total_errors / total_requests * 100) if total_requests > 0 else 0
        
        # Breakdown by classification
        classifications = {}
        for req in self.requests:
            clf = req["classification"]
            if clf not in classifications:
                classifications[clf] = {"count": 0, "avg_tokens": 0}
            classifications[clf]["count"] += 1
            classifications[clf]["avg_tokens"] = (
                (classifications[clf]["avg_tokens"] * (classifications[clf]["count"] - 1) + req["tokens_consumed"]) 
                / classifications[clf]["count"]
            )
        
        return {
            "total_requests": total_requests,
            "total_errors": total_errors,
            "error_rate_percent": round(error_rate, 2),
            "avg_latency_ms": round(avg_lat, 2),
            "p95_latency_ms": round(p95_lat, 2),
            "p99_latency_ms": round(p99_lat, 2),
            "avg_tokens": round(avg_tokens, 2),
            "total_tokens": total_tokens,
            "uptime_seconds": int(time.time() - self.start_time),
            "by_classification": classifications,
        }
    
    def clear(self):
        """Limpa métricas."""
        self.requests.clear()
        self.errors.clear()
        logger.info("[METRICS] Cleared")


# Instância global de métricas
voice_metrics = VoiceMetrics(window_size=1000)
