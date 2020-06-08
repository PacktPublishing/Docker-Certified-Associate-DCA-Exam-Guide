# Docker Enterprise using Vagrant and Virtualbox

## This repository will create a working Docker Enterprise cluster for chapters 11, 12 and 13.

----
## Requirements (follow each product guide):
 - Install Vagrant (tested on 2.2.7+) - https://www.vagrantup.com/
    - https://www.vagrantup.com/intro/getting-started/install.html
    - https://www.vagrantup.com/downloads


 - Install Virtualbox (tested on 6.0.0+)- https://www.virtualbox.org/
    - https://www.virtualbox.org/wiki/Downloads
 
----

## Basic Usage:

1. Download or clone this respository using git clone if you haven't done yet:
```
[YOUR COMPUTER]$ git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git
```

 
2. Navigate to "environments/enterprise" and execute ___vagrant up___ to create a new environment.
```
[YOUR COMPUTER]$ cd Docker-Certified-Associate-DCA-Exam-Guide
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/enterprise/
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/enterprise$ vagrant up

--------------------------------------------------------------------------------------------
 DOCKER ENTERPRISE Vagrant Environment
 Engine Version: current
--------------------------------------------------------------------------------------------
Bringing machine 'enterprise-node1' up with 'virtualbox' provider...
Bringing machine 'enterprise-node2' up with 'virtualbox' provider...
Bringing machine 'enterprise-node3' up with 'virtualbox' provider...
Bringing machine 'enterprise-node4' up with 'virtualbox' provider...
==> enterprise-node1: Checking if box 'frjaraur/xenial64' version '1.4' is up to date...
==> enterprise-node1: Clearing any previously set forwarded ports...
...
...
```

After some minutes (depending on your hosts' free resources), your environment will be up and ready for execting the labs.

Verify virtual platform status executing ___vagrant status___:
```
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/enterprise$ vagrant status
--------------------------------------------------------------------------------------------
 DOCKER ENTERPRISE Vagrant Environment
 Engine Version: current
--------------------------------------------------------------------------------------------
Current machine states:

enterprise-node1          running (virtualbox)
enterprise-node2          running (virtualbox)
enterprise-node3          running (virtualbox)
enterprise-node4          running (virtualbox)

This environment represents multiple VMs. The VMs are all listed
above with their current state. For more information about a specific
VM, run `vagrant status NAME`.

[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/enterprise$ 
```

3. This will create the nodes defined in **config.yml** with latest Docker Engine installed. This is configurable via [config.yml](./config.yml) among other options, such as the number of nodes. In this case, we will simply comment all the lines regarding an specific __box__.
```
environment:
  # Valid Engine Versions are 'experimental', 'test' and 'current'
  engine_version: "current"
  experimental: false
  base_box: "frjaraur/xenial64"
  base_box_version: "1.4"
  #proxy: "http://your_proxy_goes_here:with_the_port"
  ucp_fqdn: "ucp.vagrant.labs"
  ucp_ip: "10.10.10.11"
  domain: "vagrant.labs" 

boxes:
- name: "enterprise-node1"
  swarm_role: "manager"
  mgmt_ip: "10.10.10.11"
  hostonly_ip: "192.168.56.11"
  bridge_interface: "br0"
  mem: "4096"
  cpu: "2"

- name: "enterprise-node2"
  swarm_role: "manager"
  mgmt_ip: "10.10.10.12"
  hostonly_ip: "192.168.56.12"
  bridge_interface: "br0"
  mem: "4096"
  cpu: "2"

- name: "enterprise-node3"
  swarm_role: "manager"
  mgmt_ip: "10.10.10.13"
  hostonly_ip: "192.168.56.13"
  bridge_interface: "br0"
  mem: "4096"
  cpu: "2"
  
- name: "enterprise-node4"
  swarm_role: "worker"
  mgmt_ip: "10.10.10.14"
  hostonly_ip: "192.168.56.14"
  bridge_interface: "br0"
  mem: "4096"
  cpu: "2"
```



 Default node names:
  * enterprise-node1
  * enterprise-node2
  * enterprise-node3
  * enterprise-node4

4. Connect to nodes using vagrant as usual (**vagrant ssh**).
```
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/enterprise$ vagrant ssh enterprise-node1

--------------------------------------------------------------------------------------------
 DOCKER ENTERPRISE Vagrant Environment
 Engine Version: current
--------------------------------------------------------------------------------------------
Welcome to Ubuntu 16.04.4 LTS (GNU/Linux 4.4.0-116-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

215 packages can be updated.
138 updates are security updates.

New release '18.04.4 LTS' available.
Run 'do-release-upgrade' to upgrade to it.


Last login: Sun May 17 21:40:14 2020 from 10.0.2.2
vagrant@enterprise-node1:~$ 
```

Then you are "in" your virtual node "enterprise-node1" and you can follow all Docker Enterprise's labs.


>NOTE:
>
>It could be useful to define simple alias:
> alias vssh='vagrant ssh'
>

5. When you have finnished all your labs, simple execute **vagrant destroy -f**. This will delete all virtual nodes.
```
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/enterprise$ vagrant destroy -f
```

---
>## __Additional Notes__
>
>* Deployment will create 2 interfaces on each node.
> * vagrant internal communication (**internal**)
> * internal docker network with IP addresses configured in [config.yml](./config.yml)
>
>
>* [config.yml](./config.yml) will let you configure your environment and the amount of nodes to be deployed. You can avoid some labs steps and execute just two nodes, one for UCP and another for DTR.
