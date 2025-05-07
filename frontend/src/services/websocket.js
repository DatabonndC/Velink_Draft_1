// src/services/websocket.js

// This is a mock implementation of a WebSocket service for the prototype
// In a real application, you would connect to a real WebSocket server

const websocketService = {
  listeners: {},
  connected: false,
  
  // Connect to the WebSocket server
  connect: function() {
    console.log('Connecting to WebSocket server...');
    this.connected = true;
    console.log('WebSocket connected');
    
    // Simulate receiving data every few seconds (for demo purposes)
    this.simulateDataInterval = setInterval(() => {
      if (this.connected && this.listeners.url && this.listeners.url.length > 0) {
        const urlData = {
          id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: this.getRandomUrl(),
          suspicious: Math.random() > 0.7, // 30% chance of being suspicious
          protocol: Math.random() > 0.5 ? 'HTTPS' : 'HTTP',
          source_ip: '192.168.1.' + Math.floor(Math.random() * 255),
          timestamp: new Date().toISOString()
        };
        
        this.listeners.url.forEach(callback => callback(urlData));
      }
    }, 3000);
  },
  
  // Disconnect from the WebSocket server
  disconnect: function() {
    console.log('Disconnecting from WebSocket server...');
    this.connected = false;
    clearInterval(this.simulateDataInterval);
    console.log('WebSocket disconnected');
  },
  
  // Register a listener for URL updates
  onUrl: function(callback) {
    if (!this.listeners.url) {
      this.listeners.url = [];
    }
    
    this.listeners.url.push(callback);
    
    // Return a function to remove this listener
    return () => {
      this.listeners.url = this.listeners.url.filter(cb => cb !== callback);
    };
  },
  
  // Helper function to generate random URLs for the demo
  getRandomUrl: function() {
    const domains = [
      'example.com',
      'google.com',
      'facebook.com',
      'twitter.com',
      'amazon.com',
      'microsoft.com',
      'apple.com',
      'suspicious-site.net',
      'malware-download.com',
      'phishing-attempt.org'
    ];
    
    const paths = [
      '/login',
      '/download',
      '/search',
      '/index.html',
      '/images',
      '/profile',
      '/settings',
      '/malware.exe',
      '/update',
      '/verify'
    ];
    
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const protocol = Math.random() > 0.3 ? 'https' : 'http'; // 70% chance of HTTPS
    
    return `${protocol}://${domain}${path}`;
  }
};

export default websocketService;