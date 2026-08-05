variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1" # Singapore
}

variable "instance_type" {
  description = "Type of EC2 instance to provision"
  type        = string
  default     = "t3.xlarge" # 4 vCPU, 16GB RAM for Log Management
}

variable "ubuntu_ami" {
  description = "Ubuntu 22.04 LTS AMI ID for the region"
  type        = string
  default     = "ami-012c2e8e24e2adbd5" # ap-southeast-1 Ubuntu 22.04
}

variable "key_name" {
  description = "Name of the SSH Key Pair to use for instance access"
  type        = string
  default     = "my-ssh-key"
}
