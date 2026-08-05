terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Create a Security Group for Log Management
resource "aws_security_group" "log_management_sg" {
  name        = "log-management-sg"
  description = "Allow inbound traffic for Log Management SaaS"

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Syslog Tenant A (UDP)
  ingress {
    from_port   = 5141
    to_port     = 5141
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Syslog Tenant B (UDP)
  ingress {
    from_port   = 5142
    to_port     = 5142
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "log-management-sg"
  }
}

# Create EC2 Instance (Ubuntu 22.04 LTS)
resource "aws_instance" "log_server" {
  ami           = var.ubuntu_ami
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.log_management_sg.id]

  root_block_device {
    volume_size = 40
    volume_type = "gp3"
  }

  # User Data script to install Docker & Docker Compose automatically
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y ca-certificates curl gnupg lsb-release git
              
              # Install Docker
              mkdir -m 0755 -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
              
              # Add ubuntu user to docker group
              usermod -aG docker ubuntu
              systemctl enable docker
              systemctl start docker
              
              # Set vm.max_map_count for OpenSearch
              echo "vm.max_map_count=262144" >> /etc/sysctl.conf
              sysctl -p
              EOF

  tags = {
    Name = "Log-Management-Server"
    Project = "CGA-Log-Demo"
  }
}
