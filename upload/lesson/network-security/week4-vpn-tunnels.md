# Week 4: VPN & Encrypted Tunnels

## 🎯 Learning Outcomes

By the end of this week, you will:

- Set up OpenVPN for secure remote access
- Configure IPSec VPN tunnels
- Implement encryption for network traffic
- Create secure site-to-site tunnels
- Monitor VPN connections
- Troubleshoot VPN issues

---

## 📚 Module Overview

| Aspect        | Details                                   |
| ------------- | ----------------------------------------- |
| **Duration**  | 1 week                                    |
| **VPN Types** | OpenVPN, IPSec, WireGuard                 |
| **Labs**      | 3 hands-on VPN configuration labs         |
| **Focus**     | Encryption, secure tunnels, remote access |

---

## Part 1: OpenVPN Setup

### 🔐 Lab 1: Configure OpenVPN Server

**Task 1: Install & Initialize OpenVPN**

```bash
# Install OpenVPN
sudo apt-get install -y openvpn openvpn-dkms

# Create keys and certificates directory
sudo mkdir -p /etc/openvpn/easy-rsa
cd /etc/openvpn/easy-rsa

# Initialize Easy-RSA for certificate management
sudo easyrsa init-pki
# Created PKI directory

# Build CA (Certificate Authority)
sudo easyrsa build-ca
# Generating RSA private key
# Common Name: My VPN CA

# Generate server certificate
sudo easyrsa gen-req server nopass
sudo easyrsa sign-req server server

# Generate Diffie-Hellman parameters (takes ~5 minutes)
sudo easyrsa gen-dh

# Generate HMAC firewall key
sudo openvpn --genkey secret /etc/openvpn/ta.key
```

**Task 2: Create OpenVPN Server Config**

```bash
# Create server configuration
sudo tee /etc/openvpn/server/server.conf > /dev/null << 'EOF'
port 1194
proto udp
dev tun

# Certificates
ca easyrsa/pki/ca.crt
cert easyrsa/pki/issued/server.crt
key easyrsa/pki/private/server.key
dh easyrsa/pki/dh.pem
tls-auth ta.key 0

# VPN network (clients will get IPs from 10.8.0.0/24)
server 10.8.0.0 255.255.255.0

# Allow clients to route to each other
client-to-client

# Encryption
cipher AES-256-CBC
auth SHA256

# Compression
comp-lzo

# Keep connections alive
keepalive 10 120

# User permissions
user nobody
group nogroup

# Persist keys/address
persist-key
persist-tun

# Logging
status /var/log/openvpn/openvpn-status.log
log-append /var/log/openvpn/openvpn.log
verb 3

# Enable IP forwarding for VPN traffic
push "route 10.8.0.0 255.255.255.0"
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
EOF

# Create log directory
sudo mkdir -p /var/log/openvpn
sudo chown nobody:nogroup /var/log/openvpn

# Start OpenVPN
sudo systemctl start openvpn@server
sudo systemctl enable openvpn@server

# Verify it's running
sudo systemctl status openvpn@server
```

**Task 3: Create Client Configuration**

```bash
# Generate client certificate
sudo easyrsa gen-req client1 nopass
sudo easyrsa sign-req client client1

# Create client config file
sudo tee /home/student/client.ovpn > /dev/null << 'EOF'
client
dev tun
proto udp

# Server details
remote vpn.example.com 1194
resolv-retry infinite

# Certificates (embedded in config)
<ca>
[contents of /etc/openvpn/easy-rsa/pki/ca.crt]
</ca>

<cert>
[contents of /etc/openvpn/easy-rsa/pki/issued/client1.crt]
</cert>

<key>
[contents of /etc/openvpn/easy-rsa/pki/private/client1.key]
</key>

tls-auth ta.key 1

# Same encryption as server
cipher AES-256-CBC
auth SHA256
comp-lzo

# Route all traffic through VPN
redirect-gateway def1 bypass-dhcp
dhcp-option DNS 8.8.8.8

# Persistence
persist-key
persist-tun

verb 3
EOF

# Set proper permissions
sudo chmod 600 /home/student/client.ovpn

# Client can now connect with:
# sudo openvpn --config client.ovpn
```

---

## Part 2: Advanced VPN Features

### 🔐 Lab 2: VPN Security & Monitoring

**Task 1: Configure VPN Client Authentication**

```bash
# Create username/password file
sudo tee /etc/openvpn/clients.txt > /dev/null << 'EOF'
user1 password123
user2 password456
user3 password789
EOF

# Restrict permissions
sudo chmod 600 /etc/openvpn/clients.txt

# Add to server config
sudo nano /etc/openvpn/server/server.conf
# Add: auth-user-pass-verify /etc/openvpn/verify-username-password.sh via-env

# Create verification script
sudo tee /etc/openvpn/verify-username-password.sh > /dev/null << 'EOF'
#!/bin/bash
CORRECT_PASSWORD=$(grep "^$username:" /etc/openvpn/clients.txt | cut -d: -f2)
if [ "$password" = "$CORRECT_PASSWORD" ]; then
    exit 0
fi
exit 1
EOF

sudo chmod +x /etc/openvpn/verify-username-password.sh
```

**Task 2: Monitor VPN Connections**

```bash
# View connected clients
sudo cat /var/log/openvpn/openvpn-status.log
# Output shows:
# Virtual Address,Real Address,Bytes Received,Bytes Sent,Connected Since
# 10.8.0.6,192.168.1.100:52345,1024000,2048000,2026-03-28 14:32:15

# Real-time VPN monitoring
watch -n 1 'cat /var/log/openvpn/openvpn-status.log | grep "ROUTING TABLE"'

# Check VPN network interfaces
ip addr show | grep -A 10 "tun0"

# Monitor bandwidth usage
sudo iftop -i tun0
```

**Task 3: Create VPN Management Script**

```bash
cat > /usr/local/bin/vpn-admin.sh << 'EOF'
#!/bin/bash

echo "=== OpenVPN Admin Tool ==="
echo
echo "1. Show connected clients"
echo "2. Disconnect client"
echo "3. Show VPN status"
echo "4. View VPN logs"
echo "5. Restart VPN service"
echo

read -p "Choose option: " choice

case $choice in
  1) cat /var/log/openvpn/openvpn-status.log | tail -20 ;;
  2)
    read -p "Client IP to disconnect: " client_ip
    # Kill connection (would require management interface)
    ;;
  3) sudo systemctl status openvpn@server ;;
  4) sudo tail -50 /var/log/openvpn/openvpn.log ;;
  5) sudo systemctl restart openvpn@server ;;
esac
EOF

chmod +x /usr/local/bin/vpn-admin.sh
```

---

## Part 3: WireGuard (Modern VPN Alternative)

### 🔐 Lab 3: WireGuard Setup

**Task 1: Install & Configure WireGuard**

```bash
# Install WireGuard
sudo apt-get install -y wireguard wireguard-tools

# Generate server keys
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey

# Create WireGuard interface config
sudo tee /etc/wireguard/wg0.conf > /dev/null << 'EOF'
[Interface]
Address = 10.0.0.1/24
ListenPort = 51820
PrivateKey = [server_private_key_from_above]

# Enable IP forwarding
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -A FORWARD -o wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -D FORWARD -o wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Client: user1
[Peer]
PublicKey = [user1_public_key]
AllowedIPs = 10.0.0.2/32

# Client: user2
[Peer]
PublicKey = [user2_public_key]
AllowedIPs = 10.0.0.3/32
EOF

# Set permissions
sudo chmod 600 /etc/wireguard/wg0.conf

# Start WireGuard
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0

# Verify
sudo wg show
# interface: wg0
#   public key: [key]
#   private key: (hidden)
#   listening port: 51820
```

**Task 2: Generate Client Keys**

```bash
# For each client user:
wg genkey | tee privatekey | wg pubkey > publickey

# Client config (wg-client.conf):
[Interface]
PrivateKey = [client_private_key]
Address = 10.0.0.2/32
DNS = 8.8.8.8

[Peer]
PublicKey = [server_public_key]
Endpoint = vpn.example.com:51820
AllowedIPs = 10.0.0.0/24
```

---

## ✅ Completion Checklist

- [ ] Installed OpenVPN server
- [ ] Generated certificates and keys
- [ ] Configured OpenVPN server
- [ ] Created client configuration
- [ ] Connected with VPN client
- [ ] Verified encrypted tunnel
- [ ] Set up client authentication
- [ ] Monitored VPN connections
- [ ] Installed WireGuard
- [ ] Created WireGuard peers
- [ ] Tested modern VPN alternative

**Next Week:** Network segmentation and zero-trust architecture.
