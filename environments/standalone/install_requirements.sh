#!/bin/bash

echo "vagrant:v4grant"|sudo chpasswd


echo "Installing Docker Community Engine using get.docker.com"
curl -sL https://get.docker.com |sudo sh

sudo usermod -aG docker vagrant

sudo systemctl start docker

echo "Installing Docker-Compose from binaries"

sudo  curl -sL "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

echo "**** Execute 'newgrp docker' to update your groups and be able to execute Docker ****"
