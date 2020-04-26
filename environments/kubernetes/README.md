# Quick 4 nodes Docker Swarm Mode Cluster using Vagrant and Virtualbox

## This repository will create a working swarm mode cluster for quick deploying, demo and testing of your service and applications.

----
## Requirements (follow each product guide):
 - Install Vagrant - https://www.vagrantup.com/
 - Install Virtualbox - https://www.virtualbox.org/
 
----

## Basic Usage:

1. Download or clone this respository
 
2. Execute **vagrant up** to create a new environment.

3. This will create nodes defined in **config.yml** with latest Docker Engine installed (it is configurable on config.yml).

 Default node names:
  * node1
  * node2
  * node3
  * node4

4. Connect to nodes using vagrant as usual (**vagrant ssh node1**).
>NOTE:
>
>It could be useful to define simple alias:
> alias vssh='vagrant ssh'
>

5. When you have finnished all your labs, simple execute **vagrant destroy -f**. This will delete all virtual nodes.


---
>## __Additional Notes__
>
>* Deployment will create 3 interfaces on everynode
> * vagrant internal communication (**internal**)
> * internal docker network with ips configured in **config.yml** (**internal**)
> * host-only interface (**host-only**)
>
>
>* **config.yml** will let you configure your environment 
(for example adding more nodes, **docker engine version to use and mode**, changing default roles, node ips, domain, etc..)
>
>* If you execut vagrant up for each node, you will have the following options:
>  *  **--engine-version** - You can choose between 'experimental', 'test' and 'current' versions and deployment will download
>  the required version using its url.
>  * **--engine-mode** - Will let you choose between 'default' or 'experimental'.
>  * If none of these options is used, deployment will use **config.yml** values.
