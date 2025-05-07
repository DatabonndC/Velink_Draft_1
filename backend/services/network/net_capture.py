import pyshark
import json
import time
import os
from datetime import datetime

# Configuration
INTERFACE = 'eth0'  # Replace with your network interface name
OUTPUT_PATH = 'network_urls.jsonl'
SUSPICIOUS_LOG_PATH = 'suspicious_connections.jsonl'
DEBUG_LOG_PATH = 'capture_debug.log'

# Global variables
running = False
packet_counter = 0
http_packet_counter = 0
tls_packet_counter = 0
dns_packet_counter = 0

def debug_log(message):
    """Write debug message to debug log."""
    timestamp = datetime.now().isoformat()
    with open(DEBUG_LOG_PATH, 'a', encoding='utf-8') as f:
        f.write(f"[{timestamp}] {message}\n")
    print(f"[DEBUG] {message}")

def write_jsonl(record, path, mode='a'):
    """Write a JSON line to the specified file."""
    with open(path, mode, encoding='utf-8') as f:
        json.dump(record, f, ensure_ascii=False)
        f.write('\n')

def extract_domain(url):
    """Extract domain name from a URL."""
    if not url:
        return None
    
    # Handle http:// and https:// prefixes
    if url.startswith(('http://', 'https://')):
        url = url.split('://', 1)[1]
    
    # Extract domain (everything before the first slash)
    domain = url.split('/', 1)[0].lower()
    return domain

def check_suspicious(record):
    """Check if traffic might be suspicious based on various heuristics."""
    suspicious_reasons = []
    
    # Check for HTTP (non-HTTPS) connections
    if record.get('layer') == 'http':
        suspicious_reasons.append("Insecure HTTP connection")
    
    # Check for unusual ports
    suspicious_ports = {
        '22': "SSH", '23': "Telnet", '445': "SMB", '1080': "SOCKS proxy", '3389': "RDP",
        '4444': "Metasploit", '5800': "VNC", '5900': "VNC", '6667': "IRC", '9001': "Tor"
    }
    
    if record.get('dst_port') in suspicious_ports.keys():
        port_name = suspicious_ports[record.get('dst_port')]
        suspicious_reasons.append(f"Connection to suspicious port {port_name}")
    
    return suspicious_reasons

def process_packet(packet):
    """Process a captured packet to extract URLs and check for suspicious activity."""
    global packet_counter, http_packet_counter, tls_packet_counter, dns_packet_counter
    
    packet_counter += 1
    
    try:
        # Basic packet info
        timestamp = packet.sniff_time
        record = {
            'timestamp': timestamp.isoformat(),
            'protocol': packet.transport_layer if hasattr(packet, 'transport_layer') else None,
        }
        
        # Extract IP addresses and ports
        if hasattr(packet, 'ip'):
            record['src_ip'] = packet.ip.src
            record['dst_ip'] = packet.ip.dst
            
            if hasattr(packet, 'tcp'):
                record['src_port'] = packet.tcp.srcport
                record['dst_port'] = packet.tcp.dstport
            elif hasattr(packet, 'udp'):
                record['src_port'] = packet.udp.srcport
                record['dst_port'] = packet.udp.dstport
        
        # Handle HTTP packets
        if hasattr(packet, 'http'):
            http_packet_counter += 1
            record['layer'] = 'http'
            
            # Extract URL from HTTP request
            if hasattr(packet.http, 'request_full_uri'):
                record['url'] = packet.http.request_full_uri
                record['domain'] = extract_domain(record['url'])
                debug_log(f"HTTP request: {record['url']}")
            elif hasattr(packet.http, 'host'):
                host = packet.http.host
                path = getattr(packet.http, 'request_uri', '/')
                record['url'] = f"http://{host}{path}"
                record['domain'] = host
                debug_log(f"HTTP host + path: {record['url']}")
        
        # Handle TLS packets
        elif hasattr(packet, 'tls'):
            tls_packet_counter += 1
            record['layer'] = 'tls'
            
            # Try to extract SNI (Server Name Indication)
            if hasattr(packet.tls, 'handshake_extensions_server_name'):
                sni = packet.tls.handshake_extensions_server_name
                record['sni'] = sni
                record['domain'] = sni
                record['url'] = f"https://{sni}/"
                debug_log(f"TLS SNI: {sni}")
        
        # Handle DNS packets
        elif hasattr(packet, 'dns'):
            dns_packet_counter += 1
            record['layer'] = 'dns'
            
            # Extract DNS query
            if hasattr(packet.dns, 'qry_name'):
                domain = packet.dns.qry_name
                record['dns_query'] = domain
                record['domain'] = domain
                record['url'] = f"http://{domain}/"
                debug_log(f"DNS query: {domain}")
        
        # Check for suspicious activity
        suspicious_reasons = check_suspicious(record)
        if suspicious_reasons:
            record['suspicious'] = True
            record['suspicious_reasons'] = suspicious_reasons
            
            # Log suspicious activity
            suspicious_entry = record.copy()
            suspicious_entry['detected_at'] = datetime.now().isoformat()
            write_jsonl(suspicious_entry, SUSPICIOUS_LOG_PATH)
        
        # Skip if no useful information
        if not (record.get('url') or record.get('domain') or 
                record.get('sni') or record.get('dns_query')):
            return
        
        # Write to log
        print(json.dumps(record, ensure_ascii=False))
        write_jsonl(record, OUTPUT_PATH)
            
    except Exception as e:
        debug_log(f"Error processing packet: {str(e)}")

def capture_packets(interface=None, filter_str=None, output_buffer=None):
    """Begin network packet capture to detect URLs."""
    global running, INTERFACE, packet_counter
    
    if interface:
        INTERFACE = interface
    
    # Reset counters
    packet_counter = 0
    http_packet_counter = 0
    tls_packet_counter = 0
    dns_packet_counter = 0
    
    # Initialize logs
    write_jsonl({"event": "capture_start", "timestamp": datetime.now().isoformat()}, OUTPUT_PATH, 'w')
    write_jsonl({"event": "capture_start", "timestamp": datetime.now().isoformat()}, SUSPICIOUS_LOG_PATH, 'w')
    
    debug_log(f"Starting capture on interface: {INTERFACE}")
    
    running = True
    
    try:
        # Create capture object
        capture = pyshark.LiveCapture(
            interface=INTERFACE,
            display_filter="http or tls or dns"  # Focus on web traffic
        )
        
        # Start capture with a maximum duration of 5 minutes as a safety mechanism
        max_duration = 300  # 5 minutes in seconds
        start_time = time.time()
        
        # Use a timeout to allow checking the running flag
        while running and (time.time() - start_time < max_duration):
            try:
                capture.sniff(timeout=1)
                for packet in capture._packets:
                    process_packet(packet)
                
                # Clear processed packets
                capture._packets = []
            except Exception as e:
                debug_log(f"Error during packet capture: {str(e)}")
                # Continue trying to capture rather than stopping entirely
    
    except KeyboardInterrupt:
        debug_log("Capture stopped by user")
    except Exception as e:
        debug_log(f"Capture error: {str(e)}")
    finally:
        running = False
        # Log end event
        write_jsonl({"event": "capture_end", "timestamp": datetime.now().isoformat()}, OUTPUT_PATH)
        debug_log("=== Network Traffic Capture Ended ===")
        
        # Return final status
        return {
            "status": "completed", 
            "packets_captured": packet_counter,
            "duration": time.time() - start_time
        }

def start_capture_for_api(interface=None, filter_str=None):
    """Adapter function for the API to start a capture"""
    global INTERFACE, running
    
    if running:
        return {"status": "already_running"}
    
    # Override interface if provided
    if interface:
        INTERFACE = interface
    
    # Initialize logs
    write_jsonl({"event": "capture_start", "timestamp": datetime.now().isoformat()}, OUTPUT_PATH, 'w')
    write_jsonl({"event": "capture_start", "timestamp": datetime.now().isoformat()}, SUSPICIOUS_LOG_PATH, 'w')
    
    debug_log(f"Starting capture on interface: {INTERFACE}")
    
    # Start capture in a separate thread
    import threading
    thread = threading.Thread(target=capture_packets, args=(interface, filter_str, None))
    thread.daemon = True
    thread.start()
    
    return {"status": "started", "interface": INTERFACE}

def stop_capture():
    """Stop the current capture"""
    global running
    
    if not running:
        return {"status": "not_running"}
    
    running = False
    debug_log("Stopping capture")
    
    return {"status": "stopped"}

def get_detected_urls():
    """Retrieve URLs that have been captured"""
    try:
        with open(OUTPUT_PATH, 'r') as f:
            urls = [json.loads(line) for line in f if '"url"' in line]
        return {"urls": urls}
    except Exception as e:
        return {"urls": [], "error": str(e)}

def get_suspicious_connections():
    """Retrieve suspicious connections that have been detected"""
    try:
        with open(SUSPICIOUS_LOG_PATH, 'r') as f:
            connections = [json.loads(line) for line in f 
                          if '"suspicious"' in line and '"suspicious": true' in line]
        return {"connections": connections}
    except Exception as e:
        return {"connections": [], "error": str(e)}
# Example usage
def stop_capture():
    """Stop the current capture"""
    global running
    
    if not running:
        return {"status": "not_running"}
    
    # Force stop the capture
    running = False
    debug_log("Stopping capture")
    
    # Add a short delay to ensure processes complete
    import time
    time.sleep(0.5)
    
    # Log end event
    write_jsonl({"event": "capture_end", "timestamp": datetime.now().isoformat()}, OUTPUT_PATH)
    
    return {"status": "stopped"}