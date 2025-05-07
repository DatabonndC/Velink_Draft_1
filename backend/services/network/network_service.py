# Import functions from net_capture module
from .net_capture import (
    start_capture_for_api,
    stop_capture,
    get_detected_urls,
    get_suspicious_connections
)

def start_capture(interface: str = "eth0", filter_str: str = ""):
    """Start network packet capture"""
    return start_capture_for_api(interface, filter_str)

def end_capture():
    """Stop network packet capture"""
    return stop_capture()

def get_urls():
    """Get captured URLs"""
    return get_detected_urls()

def get_suspicious():
    """Get suspicious connections"""
    return get_suspicious_connections()