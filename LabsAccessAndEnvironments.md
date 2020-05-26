# __Labs Access and Environment:__
 We provide you a few Vagrant lab environments under __vagrant__ directory. You will need VirtualBox and Vagrant installed on your system. Once installed, just execute _vagrant up_ to deploy them.


----
## Standalone Node

```
Docker-Certified-Associate-DCA-Exam-Guide/environments/standalone$ vagrant up
Bringing machine 'lab-node' up with 'virtualbox' provider...
==> lab-node: Cloning VM...
==> lab-node: Matching MAC address for NAT networking...
==> lab-node: Checking if box 'frjaraur/bionic64' version '1.1' is up to date...
 .....
 .....
==> lab-node: Running provisioner: shell...
    lab-node: Running: inline script
Docker-Certified-Associate-DCA-Exam-Guide/environments/standalone$
```
 We will just execute _vagrant ssh_ or _ssh -i keys/labuser labuser@10.10.10.10_ (default virtual node's IP address). If you get __"Permissions 0775 for 'keys/labuser' are too open."__ error , just change keys directory access (this is due to git-clonning keys directory) using _chmod 700 -R ./keys_.
```
 $ ssh -i keys/labuser labuser@10.10.10.10
 Welcome to Ubuntu 18.04.2 LTS (GNU/Linux 4.15.0-50-generic x86_64)

  * Documentation:  https://help.ubuntu.com
  * Management:     https://landscape.canonical.com
  * Support:        https://ubuntu.com/advantage

   System information as of Mon Apr  6 12:15:43 CEST 2020

   System load:  0.0                Users logged in:     0
   Usage of /:   22.6% of 19.56GB   IP address for eth0: 10.0.2.15
   Memory usage: 10%                IP address for eth1: 10.10.10.10
   Swap usage:   0%                 IP address for eth2: 192.168.200.37
   Processes:    111
  . . . .
  . . . .
 labuser@lab-node:~$
```
__labuser__ has sudo privileges hence just use _sudo -s_ and you will be ready to follow the labs.
```
labuser@lab-node:~$ sudo -s
root@lab-node:~#
```
---
## Kubernetes Small Cluster
>NOTES:
> - Ubuntu 16.04LTS virtual nodes
> - Hardware requierments:
>   - 8GB of RAM
>   - 4 vCPU
>   - 20GB of disk in your home or weherever you have your VirtualBox nodes.
> - config.yml - Let's you choose:
>   - size and number of nodes.
>   - docker engine version (current by default)
>   - docker experimental features
>   - kubernetes release
>   - CNI provider's manifest URL
> - NFS is enabled within master node and workers with 2GB of shared disk. It will be mounted on master node under /data. You can use it for NFS volumes labs.
>
> To remove all labs, simply execure __vagrant destroy -f__. This will remove all lab nodes from your system.
>
>This environment will deploy a small Kubernetes cluster with one master node and defined number of workers (you should usually configure just 1 worker for testing on small laptops).
>
>
We will just execute vagrant up under k8s-webinar/vagrant/kubernetes-cluster directory and you will have a fully functional cluster for testing using vagrant in few minutes.

```
k8s-webinar/vagrant/kubernetes-cluster$ vagrant up
--------------------------------------------------------------------------------------------
 Docker SWARM MODE Vagrant Environment
 Engine Version: current
 Kubernetes Version: 1.18.0-00
 Kubernetes CNI: https://docs.projectcalico.org/v3.8/manifests/calico.yaml
--------------------------------------------------------------------------------------------
Bringing machine 'knode1' up with 'virtualbox' provider...
Bringing machine 'knode2' up with 'virtualbox' provider...
Bringing machine 'knode3' up with 'virtualbox' provider...

...
...
...
knode3: Processing triggers for systemd (229-4ubuntu21.2) ...
knode3: Processing triggers for ureadahead (0.100.0-19)
k8s-webinar/vagrant/kubernetes-cluster$
```

Once deployed, we just connect to knode1 (master node) using vagrant ssh knode1:
```
$ vagrant ssh knode1
--------------------------------------------------------------------------------------------
 Docker SWARM MODE Vagrant Environment
 Engine Version: current
 Kubernetes Version: 1.18.0-00
 Kubernetes CNI: https://docs.projectcalico.org/v3.8/manifests/calico.yaml
--------------------------------------------------------------------------------------------
Welcome to Ubuntu 16.04.4 LTS (GNU/Linux 4.4.0-116-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

211 packages can be updated.
135 updates are security updates.

New release '18.04.4 LTS' available.
Run 'do-release-upgrade' to upgrade to it.


Last login: Tue May 22 12:50:33 2018 from 10.0.2.2
vagrant@knode1:~$
```

Then we can just connect to the cluster using kubectl (already installed for you alongside all cluster components):
```
vagrant@knode1:~$ kubectl get nodes
NAME     STATUS   ROLES    AGE     VERSION
knode1   Ready    master   10m     v1.18.0
knode2   Ready    <none>   6m29s   v1.18.0
knode3   Ready    <none>   3m48s   v1.18.0
vagrant@knode1:~$
```

Enjoy the labs...

