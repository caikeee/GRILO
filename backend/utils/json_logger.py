"""
QW12: Production JSON Logging
Estrutura os logs em JSON para melhor análise e debugging em produção.
Pode ser enviado para Sentry, ELK, ou qualquer log aggregator.
"""

import logging
import json
from pythonjsonlogger import jsonlogger
from io import StringIO
import sys
from datetime import datetime


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter com campos adicionais."""
    
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        
        # Adicionar timestamp em ISO format
        log_record['timestamp'] = datetime.utcnow().isoformat()
        
        # Adicionar nível de log
        log_record['level'] = record.levelname
        
        # Adicionar logger name
        log_record['logger'] = record.name
        
        # Adicionar função e linha
        log_record['function'] = record.funcName
        log_record['line'] = record.lineno
        
        # Adicionar exception info se existir
        if record.exc_info:
            log_record['exception'] = self.formatException(record.exc_info)


def setup_json_logging(level: str = "INFO"):
    """
    Configura logging em JSON format.
    
    Args:
        level: Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # JSON Handler para stdout
    json_handler = logging.StreamHandler(sys.stdout)
    json_handler.setLevel(level)
    
    # Usar custom formatter
    formatter = CustomJsonFormatter('%(timestamp)s %(level)s %(logger)s %(message)s')
    json_handler.setFormatter(formatter)
    
    # Remover handlers existentes
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Adicionar novo handler
    root_logger.addHandler(json_handler)
    
    return root_logger


def get_logger(name: str):
    """Get logger instance com nome específico."""
    return logging.getLogger(name)
