# Chapter 8

## Previous requirements
- Working Vagrant and VirtualBox installation.
- Running "Swarm" environemnt.

>NOTE:
>
>You can use your own host (laptop or server), we provide you mock environments to avoid any change in your system.
>
>These labs should be executed on Docker Swarm. We peovide you with a fully functional environment ready to deploy Docker Swarm. This will run 4 virtual nodes on your host. __You will need at least 8GB of RAM and 4 vCPUs__.
>
>Follow the specific instructions to deploy the [Swarm environment](../../environments/swarm/Readme.md) before starting these labs. 
>
>
>All Vagrant environment can easily be removed executing _vagrant destroy -f_ once you have finished all the labs.
---

### Following labs can be found under labs/chapter8 directory.


---
## __Lab1__: Creating a Swarm Cluster

In this lab we will create a Docker Swarm cluster from the very begining.

1 - Connect to node1 and initialize a new cluster using _docker swarm init_: 
```
$ vssh node1
vagrant@node1:~$ docker swarm init
Error response from daemon: could not choose an IP address to advertise
since this system has multiple addresses on different interfaces (10.0.2.15
on eth0 and 10.10.10.11 on eth1) - specify one with --advertise-addr
```
We get an error and this is completely normal because you are using Vagrant and nodes at least will have 2 interfaces. First one is internal for Vagrant, and we will have others, defined to be used on lab environments. In this case we will need to specify which interface to use for the cluster with _--advertise-addr_.

Let's try again using _--advertise-addr 10.10.10.11_:
```
vagrant@node1:~$ docker swarm init --advertise-addr 10.10.10.11
Swarm initialized: current node (b1t5o5x8mqbz77e9v4ihd7cec) is now a manager.
To add a worker to this swarm, run the following command:
docker swarm join --token SWMTKN-1-3xfi4qggreh81lbr98d63x7299gtz1fanwfjkselg9ok5wroje-didcmb39w7apwokrah6xx4cus 10.10.10.11:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```

Now Swarm was initialized correctly.

2 - Add a second node connecting to node2 and executing described command in initialization output.
```
$ vssh node2
vagrant@node2:~$ docker swarm join --token SWMTKN-1-3xfi4qggreh81lbr98d63x7299gtz1fanwfjkselg9ok5wroje-didcmb39w7apwokrah6xx4cus 10.10.10.11:2377
This node joined a swarm as a worker.
```

Node was added as worker.

3 - Verify on node1 that new node was added.
```
$ vssh node1
vagrant@node1:~$ docker node ls
ID                        HOSTNAME STATUS AVAILABILITY MANAGER STATUS ENGINE VERSION
b1t5o5x8mqbz77e9v4ihd7cec * node1  Ready  Active          Leader          19.03.5
rj3rgb9egnb256cms0zt8pqew   node2  Ready  Active                          19.03.5
```

4 - We will execute same joining process on node3.
```
vagrant@node1:~$ docker node ls
ID                          HOSTNAME STATUS AVAILABILITY MANAGER STATUS ENGINE VERSION
b1t5o5x8mqbz77e9v4ihd7cec * node1     Ready Active        Leader          19.03.5
rj3rgb9egnb256cms0zt8pqew   node2     Ready Active                        19.03.5
ui67xyztnw8kn6fjjezjdtwxd   node3     Ready Active                        19.03.5
```

5 - Now we will review the token for managers so next node will be added as manager.
```
vagrant@node1:~$ docker swarm join-token manager
To add a manager to this swarm, run the following command:
docker swarm join --token SWMTKN-1-3xfi4qggreh81lbr98d63x7299gtz1fanwfjkselg9ok5wroje-aidvtmglkdyvvqurnivcsmyzm 10.10.10.11:2377
```

Now, we connect to node4 and execute shown joinning command.
```
vagrant@node4:~$ docker swarm join --token SWMTKN-1-3xfi4qggreh81lbr98d63x7299gtz1fanwfjkselg9ok5wroje-aidvtmglkdyvvqurnivcsmyzm 10.10.10.11:2377
This node joined a swarm as a manager
```

6 - Cluster now have 4 nodes, 2 managers and 2 workers. This will not provide high availability if Leader fails. Letś promote node2 to manager too for example.
```
vagrant@node4:~$ docker node update --role manager node2
node2
```

And we can review node status again. Managers are show as "Reachable" or "Leader", indicating that this node is the cluster leader.
```
vagrant@node4:~$ docker node ls
ID                        HOSTNAME STATUS AVAILABILITY MANAGER STATUS ENGINE VERSION
b1t5o5x8mqbz77e9v4ihd7cec   node1     Ready Active            Leader      19.03.5
rj3rgb9egnb256cms0zt8pqew   node2     Ready Active            Reachable   19.03.5
ui67xyztnw8kn6fjjezjdtwxd   node3     Ready Active                        19.03.5
jw9uvjcsyg05u1slm4wu0hz6l * node4     Ready Active            Reachable   19.03.5
```

7 - We will just leave one manager for the rest of the Labs, but first we will kill node1 Docker Engine Daemon to see what happens in the cluster.
```
$ vssh node1
vagrant@node1:~$ sudo systemctl stop docker
Connecting to other manager (node2 for example, recently promoted node).
$ vssh node2
vagrant@node2:~$ docker node ls
ID HOSTNAME STATUS AVAILABILITY MANAGER STATUS ENGINE VERSION
b1t5o5x8mqbz77e9v4ihd7cec node1 Down Active Unreachable 19.03.5
rj3rgb9egnb256cms0zt8pqew * node2 Ready Active Reachable 19.03.5
ui67xyztnw8kn6fjjezjdtwxd node3 Ready Active 19.03.5
jw9uvjcsyg05u1slm4wu0hz6l node4 Ready Active Leader 19.03.5
New leader was elected between one of the managers.
We now start again node1 Docker Engine Daemon.
$ vssh node1
vagrant@node1:~$ sudo systemctl start docker
vagrant@node1:~$ docker node ls
ID HOSTNAME STATUS AVAILABILITY MANAGER STATUS ENGINE VERSION
b1t5o5x8mqbz77e9v4ihd7cec * node1 Ready Active Reachable 19.03.5
rj3rgb9egnb256cms0zt8pqew node2 Ready Active Reachable 19.03.5
ui67xyztnw8kn6fjjezjdtwxd node3 Ready Active 19.03.5
jw9uvjcsyg05u1slm4wu0hz6l node4 Ready Active Leader 19.03.5
Node remains as manager but it is not now the leader of the cluster because a new one was
elected when it failed.
8 - Let's demote all non-leader nodes to workers for the rest of the labs.
vagrant@node1:~$ docker node update --role worker node2
node2
vagrant@node1:~$ docker node update --role worker node1
node1
vagrant@node1:~$ docker node ls
Error response from daemon: This node is not a swarm manager. Worker nodes
can't be used to view or modify cluster state. Please run this command on a
manager node or promote the current node to a manager.
Notice the error when listing again. Node1 is not manager now hence we can not manage
the cluster from this node anymore. All management commands will run now from node4
for the rest of the labs. Node4 is the only manager hence it is the cluster leader.
$ vssh node4
vagrant@node4:~$ docker node ls
ID
 HOSTNAME
 STATUS
AVAILABILITY
 MANAGER STATUS
 ENGINE VERSION
b1t5o5x8mqbz77e9v4ihd7cec
 node1
 Ready
Active
 19.03.5
rj3rgb9egnb256cms0zt8pqew
 node2
 Ready
Active
 19.03.5
ui67xyztnw8kn6fjjezjdtwxd
 node3
 Ready
Active
 19.03.5
jw9uvjcsyg05u1slm4wu0hz6l *
 node4
 Ready
Active
 Leader
 19.03.5
On next lab we will deploy a simple webserver service.


## __Lab2__: Deploy a Simple Replicated Service

In this lab we will deploy a simple replicated service. From node4, we will create a replicated service (by default) and test how we can distributemore replicas on different nodes.

1 - Deploy _webserver_ service using a simple _nginx:alpine_ image.
```
vagrant@node4:~$ docker service create --name webserver nginx:alpine
kh906v3xg1ni98xk466kk48p4
overall progress: 1 out of 1 tasks
1/1: running [==================================================>]
verify: Service converged
Notice that we waited few seconds until all instances are correctly running. Time may vary if image has some configured healthcheck.
```

2 - Once it is deployed we can review where replica was started.
```
vagrant@node4:~$ docker service ps webserver
ID           NAME         IMAGE        NODE   DESIRED STATE CURRENT STATE ERROR PORTS
wb4knzpud1z5 webserver.1  nginx:alpine node3    Running     Running 14 seconds ago
```

In this case nginx was deployed on _node4_. This may vary in your environment.

3 - We can scale the number of replicas to 3 and review how they were distributed.
```
$ docker service update --replicas 3 webserver
webserver
overall progress: 3 out of 3 tasks
1/3: running [==================================================>]
2/3: running [==================================================>]
3/3: running [==================================================>]
verify: Service converged
If we review replicas distribution we will discover where containers are running.
vagrant@node4:~$ docker service ps webserver
ID NAME IMAGE NODE DESIRED STATE CURRENT STATE ERROR PORTS
wb4knzpud1z5 webserver.1 nginx:alpine node3 Running Running 2 minutes ago
ie9br2pblxu6 webserver.2 nginx:alpine node4 Running Running 50 seconds ago
9d021pmvnnrq webserver.3 nginx:alpine node1 Running Running 50 seconds ago
We notice in this case that node2 did not receive any replica. But we can force replicas to
run there.
4 - To force specific locations we can add labels to specific nodes and add constraints to nodes.
```
$ docker node update --label-add tier=front node2
node2
```

And now we modify the current service.
```
vagrant@node4:~$ docker service update --constraint-add node.labels.tier==front webserver
webserver
overall progress: 3 out of 3 tasks
1/3: running  [==================================================>]
2/3: running  [==================================================>]
3/3: running  [==================================================>]
verify: Service converged


vagrant@node4:~$ docker service ps webserver
ID            NAME             IMAGE         NODE   DESIRED STATE   CURRENT STATE ERROR     PORTS
wjgkgkn0ullj  webserver.1      nginx:alpine  node2    Running         Running 24 seconds ago
wb4knzpud1z5
               \_ webserver.1  nginx:alpine  node3    Shutdown        Shutdown 25 seconds ago
bz2b4dw1emvw   webserver.2     nginx:alpine  node2    Running         Running 26 seconds ago
ie9br2pblxu6   \_ webserver.2  nginx:alpine  node4    Shutdown        Shutdown 27 seconds ago
gwzvykixd5oy   webserver.3     nginx:alpine  node2    Running         Running 28 seconds ago
9d021pmvnnrq   \_ webserver.3  nginx:alpine  node1    Shutdown        Shutdown 29 seconds ago
```

Now all replicas are running on node2.


5 - Now we will do some maintenance on node2. In this situation we will remove service constraint before draining node2. If we do not do that, no other node will receive workloads because they are restricted to tier=front node labels.
```
vagrant@node4:~$ docker service update --constraint-rm
node.labels.tier==front webserver
webserver
overall progress: 3 out of 3 tasks
1/3: running  [==================================================>]
2/3: running  [==================================================>]
3/3: running  [==================================================>]
verify: Service converged
```

Execute _docker service ps webserver_ to review workloads distribution.
```
vagrant@node4:~$ docker service ps webserver
```

Tasks did not move because tasks already satisfy service constraints (no constraint in the new situation).


.
6 - On this step we will pause node3 and drain node2.
```
vagrant@node4:~$ docker node update --availability pause node3
node3

vagrant@node4:~$ docker node update --availability drain node2
node2
```

Now, let's review service replica distribution


vagrant@node4:~$ docker service ps webserver --filter desired-state=running
ID
 NAME
 IMAGE
 NODE
DESIRED STATE
 CURRENT STATE
 ERROR
 PORTS
6z55nch0q8ai
 webserver.1
 nginx:alpine
 node4
Running
 Running 3 minutes ago
8il59udc4iey
 webserver.2
 nginx:alpine
 node4
Running
 Running 3 minutes ago
1y4q96hb3hik
 webserver.3
 nginx:alpine
 node1
Running
 Running 3 minutes ago
Notice that only node1 and node4 get some tasks because node3 is paused and we removed
all tasks on node2.


7 - We will remove webserver service and enable nodes node2 and node3 again.
vagrant@node4:~$ docker service rm webserver
webserver
vagrant@node4:~$ docker node update --availability active node2
node2
vagrant@node4:~$ docker node update --availability active node3
node3


## __Lab3__: Deploy a Global Service

In this lab we will deploy a global service.

1 - We learned that global services will deploy one replica on each node. Let's create one and review its distribution.
```
vagrant@node4:~$ docker service create --name webserver --mode global nginx:alpine
4xww1in0ozy3g8q6yb6rlbidr
overall progress: 4 out of 4 tasks
ui67xyztnw8k: running [==================================================>]
b1t5o5x8mqbz: running [==================================================>]
rj3rgb9egnb2: running [==================================================>]
jw9uvjcsyg05: running [==================================================>]
verify: Service converged
```

All nodes will receive their own replica.
```
vagrant@node4:~$ docker service ps webserver --filter desired-state=running

ID
 NAME
 IMAGE
NODE
 DESIRED STATE
 CURRENT STATE
 ERROR
PORTS
0jb3tolmta6u
 webserver.ui67xyztnw8kn6fjjezjdtwxd
 nginx:alpine
node3
 Running
 Running about a minute ago
im69ybzgd879
 webserver.rj3rgb9egnb256cms0zt8pqew
 nginx:alpine
node2
 Running
 Running about a minute ago
knh5ntkx7b3r
 webserver.jw9uvjcsyg05u1slm4wu0hz6l
 nginx:alpine
node4
 Running
 Running about a minute ago
26kzify7m7xd
 webserver.b1t5o5x8mqbz77e9v4ihd7cec
 nginx:alpine
node1
 Running
 Running about a minute ago
```

2 - We will now drain node1 for example and review the new tasks distribution.
```
vagrant@node4:~$ docker node update --availability drain node1
node1

vagrant@node4:~$ docker service ps webserver --filter desired-state=running

ID
 NAME
 IMAGE
NODE
 DESIRED STATE
 CURRENT STATE
 ERROR
PORTS
0jb3tolmta6u
 webserver.ui67xyztnw8kn6fjjezjdtwxd
 nginx:alpine
node3
 Running
 Running 3 minutes ago
im69ybzgd879
 webserver.rj3rgb9egnb256cms0zt8pqew
 nginx:alpine
node2
 Running
 Running 3 minutes ago
knh5ntkx7b3r
 webserver.jw9uvjcsyg05u1slm4wu0hz6l
 nginx:alpine
node4
 Running
 Running 3 minutes ago
```

None received node2 task. Because global services will only run one replica of defined service.

3 - If we enable again node2, its replica will start to run again.
```
vagrant@node4:~$ docker node update --availability active node1
node1

vagrant@node4:~$ docker service ps webserver --filter desired-state=running
ID
 NAME
 IMAGE
NODE
 DESIRED STATE
 CURRENT STATE
 ERROR
PORTS
sun8lxwu6p3k
 webserver.b1t5o5x8mqbz77e9v4ihd7cec
 nginx:alpine
node1
 Running
 Running 1 second ago
0jb3tolmta6u
node3
im69ybzgd879
node2
knh5ntkx7b3r
node4
webserver.ui67xyztnw8kn6fjjezjdtwxd
 nginx:alpine
Running
 Running 5 minutes
 ago
webserver.rj3rgb9egnb256cms0zt8pqew
 nginx:alpine
Running
 Running 5 minutes
 ago
webserver.jw9uvjcsyg05u1slm4wu0hz6l
 nginx:alpine
Running
 Running 5 minutes
 ago

4 - We will remove webserver service again to clear cluster for the next labs.
```
vagrant@node4:~$ docker service rm webserver
webserver
```

## __Lab4__: Update Service Base Image

We will now take a quick look to service update to learn how to update service base image for example.
We will quick and easy refresh a new image version of deployed and running servicewithout user access interruption.

1-First we created a 6 replicas webserver service.
```
vagrant@node4:~$ docker service create --name webserver \
--replicas 6 --update-delay 10s --update-order start-first \
nginx:alpine
vpllw7cxlma7mwojdyswbkmbk

overall progress: 6 out of 6 tasks
1/6: running [==================================================>]
2/6: running [==================================================>]
3/6: running [==================================================>]
4/6: running [==================================================>]
5/6: running [==================================================>]
6/6: running [==================================================>]
verify: Service converged
```

2 - We update now to an specific nginx:alpine version with perl support for example.
```
vagrant@node4:~$ docker service update --image nginx:alpine-perl webserver
webserver

overall progress: 6 out of 6 tasks
1/6: running [==================================================>]
2/6: running [==================================================>]
3/6: running [==================================================>]
4/6: running [==================================================>]
5/6: running [==================================================>]
6/6: running [==================================================>]
verify: Service converged
```

Update took more than 60 seconds because Swarm updated tasks one by one in 10 seconds intervals. It will first start the new container with the new defined image. Once it is healthy, it will stop old version container. This must be done on each task therefore takes more time but we can ensure that there were always a webserver task running. In this example we have not publish webserver ports so no user interaction was expected. It is just a simple lab but real life environment will work same way and internal Swarm load balancing will always guide user requests to alive instances while update is running.

New version is running now
```
vagrant@node4:~$ docker service ps webserver --filter desired-state=running
ID
 NAME
 IMAGE
 NODE
DESIRED STATE
 CURRENT STATE
 ERROR
 PORTS
n9s6lrk8zp32
 webserver.1
 nginx:alpine-perl
 node4
Running
 Running 4 minutes ago
68istkhse4ei
 webserver.2
 nginx:alpine-perl
 node1
Running
 Running 5 minutes ago
j6pqig7njhdw
 webserver.3
 nginx:alpine-perl
 node1
Running
 Running 6 minutes ago
k4vlmeb56kys
 webserver.4
 nginx:alpine-perl
 node2
Running
 Running 5 minutes ago
k50fxl1gms44
 webserver.5
 nginx:alpine-perl
 node3
Running
 Running 5 minutes ago
apur3w3nq95m
 webserver.6
 nginx:alpine-perl
 node3
Running
 Running 5 minutes ago
```

3 - We will remove webserver service again to clear cluster for the next labs.
```
vagrant@node4:~$ docker service rm webserver
webserver
```

## __Lab5__: Deploying using Docker Stacks

In this lab we will deploy a PostgreSQL database using secrets, configurations and volumes on a infrastructure as code file.

1 - We will first create secrets for required PostgreSQL admin user password using _docker service create_:
```
vagrant@node4:~$ echo SuperSecretPassword|docker secret create postgres_password -
u21mmo1zoqqguh01u8guys9gt
```

We will use it as external secret inside Docker Compose file.

2 - We are going to create a simple initialization script to create a new database when PostgresSQL starts. We will create a simple file on current directory named [create-docker-database.sh](./create-docker-database.sh) with following content and appropiate 755 permissions.
```
#!/bin/bash
set -e
psql -v ON_ERROR_STOP=0 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"
<<-EOSQL
CREATE USER docker;
CREATE DATABASE docker;
GRANT ALL PRIVILEGES ON DATABASE docker TO docker;
EOSQL
```
We will add execute permissions:
```
vagrant@node4:~$ chmod 755 create-docker-database.sh

vagrant@node4:~$ ls -lrt create-docker-database.sh
-rwxr-xr-x 1 vagrant vagrant 219 Jan 1 20:00 create-docker-database.sh
```

We will then create a config file with file content. We will use this file to create a database named _docker_ on PostgreSQL start. This is something we can use because it is provided by official Docker Hub PostgreSQL image.
```
vagrant@node4:~$ docker config create create-docker-database ./create-docker-database.sh
uj6zvrdq0682anzr0kobbyhk2
```

3 - We will add a label on some of the nodes to ensure database is running always there as we will create an external volume only on that node. We will use for example _node2_.
```
$ vssh node2
vagrant@node2:~$ docker volume create PGDATA
PGDATA
```

This volume will only exist on node2 therefore we will create a constraint based on a node label to run service task only on _node2_.
```
vagrant@node4:~$ docker node update --label-add tier=database node2
node2
```

4 - Now we will create following Docker Compose file named postgres-stack.yaml:
```
version: '3.7'
services:
  database:
    image: postgres:alpine
    deploy:
      placement:
        constraints:
          - node.role == worker
          - node.labels.tier == database
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
    
    secrets:
      - source: postgres_password
        target: "/run/secrets/postgres_password"  
    
    configs:
      - source: create-docker-database
        target: "/docker-entrypoint-initdb.d/create-db.sh"
        mode: 0755
        uid: "0"
    volumes:
      - type: volume
        source: PGDATA
        target: /var/lib/postgresql/data
    ports:
      - target: 5432
        published: 15432
        protocol: tcp
    networks:
      net:
        aliases:
         - postgres
         - mydatabase

configs:
  create-docker-database:
    external: true

secrets:
  postgres_password:
    external: true

volumes:
  PGDATA:
    external: true

networks:
  net:
    driver: overlay
    attachable: true
```

5 - We deploy postgres stack using docker stack deploy:
```
vagrant@node4:~$ docker stack deploy -c postgres-stack.yaml postgres
Creating network postgres_net
Creating service postgres_database
```

We easely review stack status
```
vagrant@node4:~$ docker stack ps postgres
ID NAME IMAGE NODE DESIRED STATE CURRENT STATE ERROR PORTS
53in2mik27r0 postgres_database.1 postgres:alpine node2 Running Running 19 seconds ago
```

It is running on node2 as we expected.

6 - We published port 5432 on port 15432. We can connect to this port from any node IP address in the cluster because Swarm uses Routing Mesh.
```
vagrant@node4:~$ curl 0.0.0.0:15432
curl: (52) Empty reply from server

vagrant@node2:~$ curl 0.0.0.0:15432
curl: (52) Empty reply from server

vagrant@node3:~$ curl 0.0.0.0:15432
curl: (52) Empty reply from server
```

We get this response to curl because we are not using the right client. Let's run a simple _alpine_ container with postgres client.

7 - We now run a simple alpine container attached to stack deployed network, in this example it is _postgres_net_.
```
vagrant@node4:~$ docker network ls --filter name=postgres_net
NETWORK ID    NAME         DRIVER   SCOPE
mh53ek97pi3a  postgres_net overlay  swarm
```

We run a simple alpine container and we install postgresql-client package.
```
vagrant@node4:~$ docker container run -ti --network postgres_net alpine
Unable to find image 'alpine:latest' locally
latest: Pulling from library/alpine
e6b0cf9c0882: Pull complete
Digest:
sha256:2171658620155679240babee0a7714f6509fae66898db422ad803b951257db78
Status: Downloaded newer image for alpine:latest
/ # apk add --update --no-cache postgresql-client --quiet
```

Remember that we added "mydatabase" and "postgres" aliases to "database" service. Therefore any of them will be valid for testing database connectivity because Swarm added these entries on internal DNS.
```
/ # ping -c 1 mydatabase
PING mydatabase (10.0.3.2): 56 data bytes
64 bytes from 10.0.3.2: seq=0 ttl=64 time=0.237 ms
--- mydatabase ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max = 0.237/0.237/0.237 ms

/ # ping -c 1 postgres
PING postgres (10.0.3.2): 56 data bytes
64 bytes from 10.0.3.2: seq=0 ttl=64 time=0.177 ms
--- postgres ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max = 0.177/0.177/0.177 ms

/ # ping -c 1 database
PING database (10.0.3.2): 56 data bytes
64 bytes from 10.0.3.2: seq=0 ttl=64 time=0.159 ms
--- database ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max = 0.159/0.159/0.159 ms
```

We will use installed client to test deployed PostgreSQL. Remember to use previously
defined password created as secret, "SuperSecretPassword".
```
/ # psql -h mydatabase -U postgres
Password for user postgres:
psql (12.1)
Type "help" for help.
postgres=# \l
List of databases
Name | Owner | Encoding | Collate | Ctype | Access privileges
-----------+----------+----------+------------+------------+---------------
--------
docker | postgres | UTF8 | en_US.utf8 | en_US.utf8 | =Tc/postgres +| | | | | postgres=CTc/postgres+ | | | | | docker=CTc/postgres
postgres | postgres | UTF8 | en_US.utf8 | en_US.utf8 |
template0 | postgres | UTF8 | en_US.utf8 | en_US.utf8 | =c/postgres + | | | | | postgres=CTc/postgres
template1 | postgres | UTF8 | en_US.utf8 | en_US.utf8 | =c/postgres + | | | | | postgres=CTc/postgres
(4 rows)
postgres=#
```

We listed the deployed databases using "\l" and "docker" database, created with our initialization script was created. Notice that we used default PostgreSQL database port 5432 (we omitted any port customization on client request), instead of 15432. This is because docker container was connecting internally. Both, postgres_database.1 task and externally run container, are using the same network, postgres_net.

We will exit running container and remove the postgres stack and node2 volume for next labs.
```
postgres=# exit
/ # exit
```
Then we will remove deployed stack:
```
vagrant@node4:~$ docker stack rm postgres
Removing service postgres_database
Removing network postgres_net
```

## __Lab5__: Swarm Ingress Internal Load Balancing

In this lab we will launch a simple replicated service and we will review internal ingress load balacing.

We will use codegazers/colors:1.13 image. This is a simple application that will show different random front page colors or texts.

1 - Let's create a service named _colors_ based on _codegazers/colors:1.13_ image. We will not set any color using environment variables so random ones will be choosen.
```
vagrant@node4:~$ docker service create --name colors \
--publish 8000:3000 \
--constraint node.role==worker \
codegazers/colors:1.13
mkyz0d94ovb144xmvo0q4py41
overall progress: 1 out of 1 tasks
1/1: running [==================================================>]
verify: Service converged
```
We chose not run any replica on manager node because we will use _curl_ from _node4_ on this lab.

2 - Let's test connectivity from manager node4.
vagrant@node4:~$ curl 0.0.0.0:8000/text
APP_VERSION: 1.0
COLOR: orange
CONTAINER_NAME: d3a886d5fe34
CONTAINER_IP: 10.0.0.11 172.18.0.3
CLIENT_IP: ::ffff:10.0.0.5
CONTAINER_ARCH: linux
We deployed one replica and it is running "orange" color. Notice container IP address and
its name.
3 - Let's run 5 more replicas.
vagrant@node4:~$ docker service update --replicas 6 colors --quiet
colors
4 - If we test again service port 8080, we will get different colors as containers were
launched without color settings.
vagrant@node4:~$ curl 0.0.0.0:8000/text
APP_VERSION: 1.0
COLOR: red
CONTAINER_NAME: 64fb2a3009b2
CONTAINER_IP: 10.0.0.12 172.18.0.4
CLIENT_IP: ::ffff:10.0.0.5
CONTAINER_ARCH: linux
vagrant@node4:~$ curl 0.0.0.0:8000/text
APP_VERSION: 1.0
COLOR: cyan
CONTAINER_NAME: 73b07ee0c287
CONTAINER_IP: 10.0.0.14 172.18.0.3
CLIENT_IP: ::ffff:10.0.0.5
CONTAINER_ARCH: linux
We get different colors on different containers. Router Mesh is guiding our requests using
ingress overlay network to "colors" tasks containers.

5 - Let's execute remove "colors" service for next and final lab.
$ docker service rm colors
colors


## __Lab6__: Service Discovery

In this lab we will review service endpoint modes and how DNS resolve vip and dnsrr situations. We will create a test overlay attachable network and we will review DNS entries for vip and dnsrr endpoint modes.

1 - We create attachable overaly "test" network.
```
vagrant@node4:~$ docker network create --attachable -d overlay test
32v9pibk7cqfseknretmyxfsw
```

2 - Now we will create 2 different "colors" services. Each one will use different endpoint modes.
```
vagrant@node4:~$ docker service create --replicas 2 \
--name colors-vip --network test --quiet codegazers/colors:1.13
4m2vvbnqo9wgf8awnf53zr5b2
```

And another one for dnsrr
```
vagrant@node4:~$ docker service create --replicas 2 \
--name colors-dnsrr --network test --quiet --endpoint-mode dnsrr
codegazers/colors:1.13
wqpv929pe5ehniviclzkdvcl0
```

3 - Now run a simple alpine container on _test_ network and verify name resolution. We will install _bind-tools_ package to be able to use _host_ and _nslookup_ tools.
```
vagrant@node4:~$ docker run -ti --rm --network test alpine
/ # apk add --update --no-cache bind-tools --quiet
/ # host colors-vip
colors-vip has address 10.0.4.2

/ # host colors-dnsrr
colors-dnsrr has address 10.0.4.7
colors-dnsrr has address 10.0.4.8

/ #exit
```

As expected, using __vip__ endpoint mode, service receives a virtual IP address. All request will be redirected to that address and ingress will route to the appropiate container using internal load balancing.

On the other hand, using __dnsrr__ endpoint will not provide any virtual IP address. Internal DNS will add an entry for each container IP.

We can also take a look at containers attached to _test_"_ network. These will get one internal IP address and one that will be routed on overlay network. We have just launched an _ip
add show_"_ command attached to one of the running _colors-dnsrr_"_ task containers.
```
vagrant@node4:~$ docker exec -ti colors-dnsrr.1.vtmpdf0w82daq6fdyk0wwzqc7
ip add show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1
  link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
  inet 127.0.0.1/8 scope host lo
    valid_lft forever preferred_lft forever
111: eth0@if112: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1450 qdisc noqueue state UP
  link/ether 02:42:0a:00:04:07 brd ff:ff:ff:ff:ff:ff
  inet 10.0.4.7/24 brd 10.0.4.255 scope global eth0
    valid_lft forever preferred_lft forever
113: eth1@if114: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue state UP
  link/ether 02:42:ac:12:00:04 brd ff:ff:ff:ff:ff:ff
  inet 172.18.0.4/16 brd 172.18.255.255 scope global eth1
    valid_lft forever preferred_lft forever
```

