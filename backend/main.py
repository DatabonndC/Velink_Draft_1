# Import the network service
from services.network import network_service
from fastapi import FastAPI

# Create FastAPI app instance
app = FastAPI()

# Add these API endpoints
@app.post("/api/capture/start")
async def start_capture(interface: str = "eth0", filter_str: str = ""):
    """Start network packet capture"""
    result = network_service.start_capture(interface, filter_str)
    return result

@app.post("/api/capture/stop")
async def stop_capture():
    """Stop network packet capture"""
    result = network_service.end_capture()
    return result

@app.get("/api/urls")
async def get_urls():
    """Get captured URLs"""
    return network_service.get_urls()

@app.get("/api/suspicious")
async def get_suspicious():
    """Get suspicious connections"""
    return network_service.get_suspicious()