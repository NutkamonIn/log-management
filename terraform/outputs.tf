output "server_public_ip" {
  description = "Public IP address of the Log Management Server"
  value       = aws_instance.log_server.public_ip
}

output "ssh_command" {
  description = "Command to SSH into the server"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.log_server.public_ip}"
}

output "web_url" {
  description = "URL to access the Dashboard"
  value       = "http://${aws_instance.log_server.public_ip}"
}
