# Kubernetes cluster using Vagrant and Virtualbox

## This repository will create a working Kubernetes cluster for chapter9.

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

 
2. Navigate to "environments/kubernetes" and execute ___vagrant up___ to create a new environment.
```
[YOUR COMPUTER]$ cd Docker-Certified-Associate-DCA-Exam-Guide
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes/
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$ vagrant up

--------------------------------------------------------------------------------------------
 DOCKER kubernetes Vagrant Environment
 Engine Version: current
--------------------------------------------------------------------------------------------
Bringing machine 'kubernetes-node1' up with 'virtualbox' provider...
Bringing machine 'kubernetes-node2' up with 'virtualbox' provider...
Bringing machine 'kubernetes-node3' up with 'virtualbox' provider...
==> kubernetes-node1: Checking if box 'frjaraur/xenial64' version '1.4' is up to date...
==> kubernetes-node1: Clearing any previously set forwarded ports...
...
...
```

After some minutes (depending on your hosts' free resources), your environment will be up and ready for execting the labs.

Verify virtual platform status executing ___vagrant status___:
```
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$ vagrant status
--------------------------------------------------------------------------------------------
 DOCKER kubernetes Vagrant Environment
 Engine Version: current
--------------------------------------------------------------------------------------------
Current machine states:

kubernetes-node1          running (virtualbox)
kubernetes-node2          running (virtualbox)
kubernetes-node3          running (virtualbox)

This environment represents multiple VMs. The VMs are all listed
above with their current state. For more information about a specific
VM, run `vagrant status NAME`.

[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$ 
```

3. This will create the nodes defined in **config.yml** with latest Docker Engine installed. This is configurable via [config.yml](./config.yml) among other options, such as the number of nodes. In this case, we will simply comment all the lines regarding an specific __box__.
```
environment:
  # Valid Engine Versions are 'experimental', 'test' and 'current'
  engine_version: "current"
  experimental: false
  kubernetes_version: "1.14.0-00"
  kubernetes_cni_url: "https://docs.projectcalico.org/v3.8/manifests/calico.yaml"

  base_box: "frjaraur/xenial64"
  base_box_version: "1.4"
  #proxy: "http://your_proxy_goes_here:with_the_port"

  kubernetes_master_ip: "10.10.10.11" # Change it if you modify cluster nodes IP addresses

boxes:
- name: "kubernetes-node1"
  role: "master"
  mgmt_ip: "10.10.10.11"
  hostonly_ip: "192.168.56.11"
  mem: "3524"
  cpu: "2"

- name: "kubernetes-node2"
  role: "worker"
  mgmt_ip: "10.10.10.12"
  hostonly_ip: "192.168.56.12"
  mem: "2048"
  cpu: "1"

- name: "kubernetes-node3"
  role: "worker"
  mgmt_ip: "10.10.10.13"
  hostonly_ip: "192.168.56.13"
  mem: "2048"
  cpu: "1"
```



 Default node names:
  * kubernetes-node1
  * kubernetes-node2
  * kubernetes-node3

4. Connect to nodes using vagrant as usual (**vagrant ssh**).
```
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$ vagrant ssh kubernetes-node1

--------------------------------------------------------------------------------------------
 DOCKER kubernetes Vagrant Environment
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
vagrant@kubernetes-node1:~$ 
```

Then you are "in" your virtual node "kubernetes-node1" and you can follow all Docker kubernetes's labs.


>NOTE:
>
>It could be useful to define simple alias:
> alias vssh='vagrant ssh'
>

5. When you have finnished all your labs, simple execute **vagrant destroy -f**. This will delete all virtual nodes.
```
[YOUR COMPUTER]/Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$ vagrant destroy -f
```

---
>## __Additional Notes__
>
>* Deployment will create 2 interfaces on each node.
> * vagrant internal communication (**internal**)
> * internal docker network with IP addresses configured in [config.yml](./config.yml)
>
>
>* [config.yml](./config.yml) will let you configure your environment and the amount of nodes to be deployed. You can change kubernetes and Docker Engine releases.

---