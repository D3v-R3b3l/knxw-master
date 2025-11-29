import React from 'react';
import { Rocket, Cpu, Radio, Shield, Zap, Terminal, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function RoboticsDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Rocket className="w-8 h-8 text-[#00d4ff]" />
        Robotics Control Center Documentation
      </h2>

      <p className="text-[#a3a3a3] text-lg mb-8">
        The knXw Robotics Control Center enables orchestration and monitoring of robotic process automation (RPA) at scale, 
        with real-time command & control, telemetry streaming, and secure HMAC-signed communication.
      </p>

      {/* Architecture Overview */}
      <Card className="bg-[#111111] border-[#262626] mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00d4ff]" />
            System Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
              <Radio className="w-6 h-6 text-[#10b981] mb-2" />
              <h4 className="text-white font-semibold mb-1">Real-Time Comms</h4>
              <p className="text-xs text-[#a3a3a3]">Bidirectional messaging with sub-second latency</p>
            </div>
            <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
              <Shield className="w-6 h-6 text-[#fbbf24] mb-2" />
              <h4 className="text-white font-semibold mb-1">Secure HMAC</h4>
              <p className="text-xs text-[#a3a3a3]">HMAC-SHA256 signed messages prevent tampering</p>
            </div>
            <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#262626]">
              <Activity className="w-6 h-6 text-[#ec4899] mb-2" />
              <h4 className="text-white font-semibold mb-1">Live Telemetry</h4>
              <p className="text-xs text-[#a3a3a3]">Stream sensor data and operational metrics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Getting Started</h3>
      
      <h4 className="text-xl font-semibold text-white mb-3">1. Register Your Robot</h4>
      <p className="text-[#a3a3a3] mb-4">
        Navigate to the Robotics Control Center and click "Register Robot". You'll receive a unique HMAC secret for secure communication.
      </p>

      <Callout type="info" title="HMAC Secret Security">
        Store your HMAC secret securely - it cannot be retrieved after initial registration. Use environment variables or secret managers.
      </Callout>

      <h4 className="text-xl font-semibold text-white mb-3 mt-6">2. Install the SDK</h4>
      <CodeBlock language="bash" code={`# Python SDK
pip install knxw-robotics-sdk

# Node.js SDK
npm install @knxw/robotics-sdk

# Rust SDK
cargo add knxw-robotics`} />

      <h4 className="text-xl font-semibold text-white mb-3 mt-6">3. Initialize Your Robot Client</h4>
      
      <div className="space-y-4 mb-6">
        <div>
          <Badge className="mb-2">Python</Badge>
          <CodeBlock language="python" code={`from knxw_robotics import RobotClient
import asyncio

# Initialize robot client
robot = RobotClient(
    robot_id="robot_001",
    hmac_secret="your_hmac_secret_here",
    api_url="https://api.knxw.io/v1/robots"
)

# Start listening for commands
async def main():
    await robot.connect()
    print(f"Robot {robot.robot_id} online")
    await robot.listen()

if __name__ == "__main__":
    asyncio.run(main())`} />
        </div>

        <div>
          <Badge className="mb-2">Node.js</Badge>
          <CodeBlock language="javascript" code={`const { RobotClient } = require('@knxw/robotics-sdk');

// Initialize robot client
const robot = new RobotClient({
  robotId: 'robot_001',
  hmacSecret: process.env.KNXW_HMAC_SECRET,
  apiUrl: 'https://api.knxw.io/v1/robots'
});

// Connect and start listening
(async () => {
  await robot.connect();
  console.log(\`Robot \${robot.robotId} online\`);
  await robot.listen();
})();`} />
        </div>
      </div>

      {/* Command Handling */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Command Handling</h3>
      
      <p className="text-[#a3a3a3] mb-4">
        Register command handlers to respond to control center instructions. Commands are versioned and can include complex arguments.
      </p>

      <CodeBlock language="python" code={`@robot.command("move")
async def handle_move(args: dict):
    """Move robot to specified coordinates"""
    x = args.get("x", 0)
    y = args.get("y", 0)
    speed = args.get("speed", 1.0)
    
    # Implement movement logic
    await move_to_position(x, y, speed)
    
    # Return success response
    return {
        "success": True,
        "message": f"Moved to ({x}, {y}) at speed {speed}",
        "final_position": {"x": x, "y": y}
    }

@robot.command("scan")
async def handle_scan(args: dict):
    """Perform environmental scan"""
    scan_radius = args.get("radius", 10.0)
    
    # Perform scan
    scan_results = await perform_scan(scan_radius)
    
    return {
        "success": True,
        "objects_detected": len(scan_results),
        "scan_data": scan_results
    }

@robot.command("emergency_stop")
async def handle_emergency_stop(args: dict):
    """Immediate halt of all operations"""
    await emergency_stop()
    return {"success": True, "message": "Emergency stop executed"}`} />

      <Callout type="warning" title="Command Acknowledgment">
        Always acknowledge commands with proper status codes. Use `acked_accepted`, `acked_completed`, `acked_rejected`, or `acked_failed`.
      </Callout>

      {/* Telemetry Streaming */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Telemetry Streaming</h3>
      
      <p className="text-[#a3a3a3] mb-4">
        Stream real-time sensor data, operational metrics, and diagnostic information to the control center for monitoring and analysis.
      </p>

      <CodeBlock language="python" code={`import asyncio

async def telemetry_loop():
    """Continuously send telemetry data"""
    while True:
        telemetry = {
            "timestamp": datetime.utcnow().isoformat(),
            "battery_level": get_battery_level(),
            "temperature": get_cpu_temperature(),
            "position": get_current_position(),
            "velocity": get_current_velocity(),
            "status": "operational",
            "sensor_readings": {
                "lidar": get_lidar_data(),
                "camera": get_camera_status(),
                "accelerometer": get_accelerometer_data()
            }
        }
        
        await robot.send_telemetry(telemetry)
        await asyncio.sleep(1)  # Send every second

# Start telemetry in background
asyncio.create_task(telemetry_loop())`} />

      {/* Security Best Practices */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Security Best Practices</h3>
      
      <div className="bg-[#111111] border-l-4 border-[#fbbf24] p-4 rounded-r-lg mb-6">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#fbbf24]" />
          Critical Security Guidelines
        </h4>
        <ul className="space-y-2 text-[#a3a3a3] text-sm">
          <li>• <strong className="text-white">Never hardcode secrets</strong> - Use environment variables or secure vaults</li>
          <li>• <strong className="text-white">Rotate HMAC secrets</strong> - Implement periodic secret rotation (90 days recommended)</li>
          <li>• <strong className="text-white">Validate all commands</strong> - Implement command whitelisting and argument validation</li>
          <li>• <strong className="text-white">Rate limiting</strong> - Prevent command flooding with rate limits</li>
          <li>• <strong className="text-white">Audit logging</strong> - Log all received commands and sent telemetry</li>
          <li>• <strong className="text-white">Network isolation</strong> - Use VPNs or private networks for robot communication</li>
        </ul>
      </div>

      {/* Advanced: Policy-Based Control */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Policy-Based Control</h3>
      
      <p className="text-[#a3a3a3] mb-4">
        Implement policy checks to automatically reject dangerous commands based on operational constraints.
      </p>

      <CodeBlock language="python" code={`class RobotPolicy:
    """Policy engine for command validation"""
    
    def __init__(self):
        self.max_speed = 5.0
        self.safe_zone = {"x_min": 0, "x_max": 100, "y_min": 0, "y_max": 100}
        self.battery_threshold = 15.0
    
    def check_move_command(self, args: dict) -> tuple[bool, str]:
        """Validate move command against policies"""
        x, y = args.get("x"), args.get("y")
        speed = args.get("speed", 1.0)
        
        # Check speed limit
        if speed > self.max_speed:
            return False, f"Speed {speed} exceeds max {self.max_speed}"
        
        # Check safe zone boundaries
        if not (self.safe_zone["x_min"] <= x <= self.safe_zone["x_max"]):
            return False, f"X coordinate {x} outside safe zone"
        
        # Check battery level
        if get_battery_level() < self.battery_threshold:
            return False, "Battery too low for movement"
        
        return True, "OK"

# Apply policy to command handler
policy = RobotPolicy()

@robot.command("move")
async def handle_move(args: dict):
    # Check policy before executing
    allowed, reason = policy.check_move_command(args)
    if not allowed:
        return {"success": False, "error": reason}
    
    # Execute command
    return await execute_move(args)`} />

      {/* Real-World Use Cases */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Real-World Use Cases</h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base">Warehouse Automation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            Orchestrate fleets of AMRs (Autonomous Mobile Robots) for inventory management, 
            picking operations, and cross-docking with real-time coordination.
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base">Manufacturing QA</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            Deploy vision-based inspection robots for defect detection, coordinate with 
            production lines, and trigger automated rework workflows.
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base">Agricultural Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            Control field robots for crop monitoring, soil analysis, and precision agriculture 
            with GPS-coordinated routes and sensor data collection.
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base">Security Patrols</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            Manage security robots for perimeter patrol, anomaly detection, and incident 
            response with AI-powered threat assessment integration.
          </CardContent>
        </Card>
      </div>

      {/* API Reference */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">API Reference</h3>
      
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-white font-semibold mb-4">Core Methods</h4>
        
        <div className="space-y-4 text-sm">
          <div className="border-b border-[#262626] pb-3">
            <code className="text-[#00d4ff]">robot.connect()</code>
            <p className="text-[#a3a3a3] mt-1">Establish connection to control center</p>
          </div>
          
          <div className="border-b border-[#262626] pb-3">
            <code className="text-[#00d4ff]">robot.listen()</code>
            <p className="text-[#a3a3a3] mt-1">Start listening for incoming commands</p>
          </div>
          
          <div className="border-b border-[#262626] pb-3">
            <code className="text-[#00d4ff]">robot.send_telemetry(payload: dict)</code>
            <p className="text-[#a3a3a3] mt-1">Send telemetry data to control center</p>
          </div>
          
          <div className="border-b border-[#262626] pb-3">
            <code className="text-[#00d4ff]">@robot.command(verb: str)</code>
            <p className="text-[#a3a3a3] mt-1">Decorator to register command handler</p>
          </div>
          
          <div className="pb-3">
            <code className="text-[#00d4ff]">robot.disconnect()</code>
            <p className="text-[#a3a3a3] mt-1">Gracefully disconnect from control center</p>
          </div>
        </div>
      </div>

      <Callout type="success" title="Production Ready">
        The knXw Robotics platform handles 10M+ commands/day in production environments with 99.95% uptime and sub-100ms latency.
      </Callout>
    </div>
  );
}