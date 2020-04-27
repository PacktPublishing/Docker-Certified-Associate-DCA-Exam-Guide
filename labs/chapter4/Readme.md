# Chapter 4

## Previous requirements
- Working Vagrant and VirtualBox installation.
- Running "Standalone" environemnt.

>NOTE:
>
>You can use your own host (laptop or server), we provide you mock environments to avoid any change in your system. 

---

### Following labs can be found under labs/chapter4 directory.


---
## __Lab1__: Using Volumes to Code on your Laptop

In this lab we will run a container with our application code inside. As application is created using an interpreted language, any change or code modification will be refreshed. 

1 - We created a simple Python Flask application. This is the content of [_app.py_](./app.py) file.
```
from flask import Flask, render_template
app = Flask(__name__)
@app.route('/')
def just_run():
  return render_template('index.html')
if __name__ == '__main__':
  app.run(debug=True,host='0.0.0.0')
```

2 - We only require Flask Python Module, therefore we will only have one line on [_requirements.txt_](./requirements.txt).
```
Flask
```

3 - We will use a simple template html file under [_templates/index.html_](./templates/index.html) with this content.
```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Simple Flask Application</title>
</head>
<body>
<h1>Simple Flask Application</h1>
<h1>Version 1</h1>
</body>
</html>
```


4 - We will run this application inside a container. We will create a Dockerfile and build an image called _simpleapp_ , with tag _v1.0_.
This is the content of [Dockerfile](./Dockerfile):
```
FROM python:alpine
WORKDIR /app
COPY ./requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY app.py .
COPY templates templates
EXPOSE 5000
CMD ["python", "app.py"]
```

5 - Let's build our application image (simpleapp:v1.0):
```
vagrant@standalone:~$ docker image build -q -t simpleapp:v1.0 .
sha256:1cf398d39b51eb7644f98671493767267be108b60c3142b3ca9e0991b4d3e45b
```

6 - We can run this simple application executing a detached container and exposing 5000 port.
```
vagrant@standalone:~$ docker container run -d --name v1.0 simpleapp:v1.0
1e775843a42927c25ee350af052f3d8e34c0d26f2510fb2d85697094937f574f
```

7 - We can review container's IP address. We are running container in a host, consequently we can access process port and defined IP address:
```
vagrant@standalone:~$ docker container ls --filter name=v1.0
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
1e775843a429 simpleapp:v1.0 "python app.py" 35 seconds ago

vagrant@standalone:~$ docker container inspect v1.0 --format "{{.NetworkSettings.Networks.bridge.IPAddress }}"
172.17.0.6
```

8 - We can access our application as expected using defined IP and port.
```
vagrant@standalone:~$ curl http://172.17.0.6:5000
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Simple Flask Application</title>
</head>
<body>
<h1>Simple Flask Application</h1>
<h1>Version 1</h1>
</body>
</html>
```

9 - It is simple to change index.html if we get into container. The problem is that as we run a new container, changes will not be stored and _index.html_ will be the same as defined on base image.
As a result, if we want changes to persist, we need to use volumes. Let's use a bind mount to change _index.html_ while container is running.
```
vagrant@standalone:~$ docker container run -d --name v1.0-bindmount -v $(pwd)/templates:/app/templates simpleapp:v1.0
fbf3c35c2f11121ed4a0eedc2f47b42a5ecdc6c6ff4939eb4658ed19999f87d4

vagrant@standalone:~$ docker container inspect v1.0-bindmount --format "{{.NetworkSettings.Networks.bridge.IPAddress }}"
172.17.0.6

vagrant@standalone:~$ curl http://172.17.0.6:5000
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Simple Flask Application</title>
</head>
<body>
<h1>Simple Flask Application</h1>
<h1>Version 1</h1>
</body>
</html>
```

10 - We can now change templates/index.html because we have used _-v $(pwd)/templates:/app/templates_, assuming current directory. Using vi (or your favorite editor) we modify _templates/index.html_ content.:
```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Simple Flask Application</title>
</head>
<body>
<h1>Simple Flask Application</h1>
<h1>Version 2</h1>
</body>
</html>
~
~
```

11 - We changed the line containing _"Version"_. and we access again using curl:
```
vagrant@standalone:~$ curl http://172.17.0.6:5000
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Simple Flask Application</title>
</head>
<body>
<h1>Simple Flask Application</h1>
<h1>Version 2</h1>
</body>
</html>
```

Changes are reflected because in fact we did on our host file and it is mounted insidecontainer. We can change also application code, mounting app.py. Depending on what programing language we are using, we can change appliation code __on-the-fly__. If changes must be persistent and we need to follow versioning strategy, we will create a new image with these changes.


## __Lab2__: Mounting SSHFS

In this lab we will install and use sshfs volume plugin.

1 -First we install the sshfs plugin.
```
vagrant@standalone:~$ docker plugin install vieux/sshfs
Plugin "vieux/sshfs" is requesting the following privileges:
- network: [host]
- mount: [/var/lib/docker/plugins/]
- mount: []
- device: [/dev/fuse]
- capabilities: [CAP_SYS_ADMIN]
Do you grant the above permissions? [y/N] y
latest: Pulling from vieux/sshfs
52d435ada6a4: Download complete
Digest:
sha256:1d3c3e42c12138da5ef7873b97f7f32cf99fb6edde75fa4f0bcf9ed277855811
Status: Downloaded newer image for vieux/sshfs:latest
Installed plugin vieux/sshfs
```

2 - Let's take our host IP address and start sshd server (if it is not running yet).
```
vagrant@standalone:~$ sudo systemctl status ssh
● ssh.service - OpenBSD Secure Shell server
Loaded: loaded (/lib/systemd/system/ssh.service; enabled; vendor preset:
enabled)
Active: active (running) since Mon 2019-11-11 23:59:38 CET; 6s ago
Main PID: 13711 (sshd)
Tasks: 1 (limit: 4915)
CGroup: /system.slice/ssh.service
└─13711 /usr/sbin/sshd -D
nov 11 23:59:38 sirius systemd[1]: Starting OpenBSD Secure Shell server...
nov 11 23:59:38 sirius sshd[13711]: Server listening on 0.0.0.0 port 22.
nov 11 23:59:38 sirius sshd[13711]: Server listening on :: port 22.
nov 11 23:59:38 sirius systemd[1]: Started OpenBSD Secure Shell server.
```
__(If it is not started, start ssh service).__

3 - Let 's review installed plugin.
```
vagrant@standalone:~$ docker plugin ls
ID NAME DESCRIPTION ENABLED
eb37e5a2e676 vieux/sshfs:latest sshFS plugin for Docker true
```

As plugins are objects, w ecan inspect installed plugin. We can review important aspects like version, debug mode, or type of mount points that will be managed with this pulgin.
```
vagrant@standalone:~$ docker plugin inspect eb37e5a2e676
[
  {
  "Config": {
    "Args": {
      "Description": "",
      "Name": "",
      "Settable": null,
      "Value": null
    },
    "Description": "sshFS plugin for Docker",
    "DockerVersion": "18.05.0-ce-rc1",
    "Documentation":
    "https://docs.docker.com/engine/extend/plugins/",
  "Entrypoint": [
    "/docker-volume-sshfs"
  ],
...
...
  },
  "Mounts": [
  {
    "Description": "",
    "Destination": "/mnt/state",
    "Name": "state",
    "Options": [
      "rbind"
    ],
    "Settable": [
      "source"
    ],
    "Source": "/var/lib/docker/plugins/",
    "Type": "bind"
  },
...
...
  "WorkDir": "",
  "rootfs": {
    "diff_ids": [
      "sha256:ce2b7a99c5db05cfe263bcd3640f2c1ce7c6f4619339633d44e65a8168ec3587"
    ],
    "type": "layers"
  }
  },
  "Enabled": true,
  "Id":
  "eb37e5a2e676138b6560bd91715477155f669cd3c0e39ea054fd2220b70838f1",
  "Name": "vieux/sshfs:latest",
  "PluginReference": "docker.io/vieux/sshfs:latest",
  "Settings": {
    "Args": [],
    "Devices": [
...
...
]
```
4 - We create a new volume named sshvolume (we assumed here a valid SSH username and password). Notice that we used 127.0.0.1 and /tmp directory or filesystem for demo purposes.
```
vagrant@standalone:~$ docker volume create -d vieux/sshfs \
-o sshcmd=ssh_user@127.0.0.1:/tmp \
-o password=ssh_userpasswd \
sshvolume
```

5 - Now we can easily run an alpine container mounting sshvolume created.

```
vagrant@standalone:~$ docker container run --rm -it -v sshvolume:/data alpine sh
/ # ls -lart /data
total 92
drwx------ 1 root root 17 Nov 9 08:27 systemd-private-809bb564862047608c79c2cc81f67f24-systemd-timesyncd.service-gQ5tZx
drwx------ 1 root root 17 Nov 9 08:27 systemd-private-809bb564862047608c79c2cc81f67f24-systemd-resolved.service-QhsXg9
drwxrwxrwt 1 root root 6 Nov 9 08:27 .font-unix
drwxrwxrwt 1 root root 6 Nov 9 08:27 .XIM-unix
drwxr-xr-x 1 root root 30 Nov 11 23:13 ..
drwxrwxrwt 1 root root 4096 Nov 11 23:13 .
/ #

```

## __Lab3__: Multihomed Containers

We will now have a quick lab, attaching containers to multiple networks.

1 - We create two different zones, _zone-a_ and _zone-b_.
```
vagrant@standalone:~$ docker network create zone-a
bb7cb5d22c03bffdd1ef52a7469636fe2e635b031b7528a687a85ff9c7ee4141

$ docker network create zone-b
818ba644512a2ebb44c5fd4da43c2b1165f630d4d0429073c465f0fe4baff2c7
```

2 - We start a container named _cont1_ on _zone-a_,
```
vagrant@standalone:~$ docker container run -d --name cont1 --network zone-a alpine sleep 3000
ef3dfd6a354b5310a9c97fa9247739ac320da1b4f51f6a2b8da2ca465b12f95e
```

3 - Then, we connect cont1 container to _zone-b_ and review its IP addresses.
```
vagrant@standalone:~$ docker network connect zone-b cont1

vagrant@standalone:~$ docker exec cont1 ip add
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
  link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
  inet 127.0.0.1/8 scope host lo valid_lft forever preferred_lft forever

92: eth0@if93: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue state UP
  link/ether 02:42:ac:13:00:02 brd ff:ff:ff:ff:ff:ff
  inet 172.19.0.2/16 brd 172.19.255.255 scope global eth0
  valid_lft forever preferred_lft forever
94: eth1@if95: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue state UP
  link/ether 02:42:ac:14:00:02 brd ff:ff:ff:ff:ff:ff
  inet 172.20.0.2/16 brd 172.20.255.255 scope global eth1
  valid_lft forever preferred_lft forever
```

4 - Now we can run two containers with just ine interface. One of them will run attached to _zone-a_ while the other one will just have zone-b attached.
```
vagrant@standalone:~$ docker container run -d --name cont2 --network zone-b --cap-add NET_ADMIN alpine sleep 3000
048e362ea27b06f5077306a71cf8adc95ea9844907aec84ec09c0b991d912a33

vagrant@standalone:~$ docker container run -d --name cont3 --network zone-a --cap-add NET_ADMIN alpine sleep 3000
20c7699c54786700c65a0bbe002c750672ffb3986f41d106728b3d598065ecb5
```

5 - Let's review the IP addresses and routes on both containers.
```
vagrant@standalone:~$ docker exec cont2 ip route default via 172.20.0.1 dev eth0
172.20.0.0/16 dev eth0 scope link src 172.20.0.3

vagrant@standalone:~$ docker exec cont3 ip route default via 172.19.0.1 dev eth0
172.19.0.0/16 dev eth0 scope link src 172.19.0.3
```

6 - If we want container _cont3_ contact container _cont2_, we should add a route through container _cont1_, which has both networks.

- On cont2 container
```
vagrant@standalone:~$ docker exec cont2 route add -net 172.19.0.0 netmask 255.255.255.0 gw 172.20.0.2

vagrant@standalone:~$ docker exec cont2 ip route
default via 172.20.0.1 dev eth0
172.19.0.0/24 via 172.20.0.2 dev eth0
172.20.0.0/16 dev eth0 scope link src 172.20.0.3
```

- On cont3 container
```
vagrant@standalone:~$ docker exec cont3 route add -net 172.20.0.0 netmask 255.255.255.0 gw 172.19.0.2

$ docker exec cont3 ip route
default via 172.19.0.1 dev eth0
172.19.0.0/16 dev eth0 scope link src 172.19.0.3
172.20.0.0/24 via 172.19.0.2 dev eth0
```

7 - Remember that we don't have resolution between different networks. Therefore, we can not reach _cont2_ by its name.
```
vagrant@standalone:~$ docker exec cont3 ping -c 3 cont2
ping: bad address 'cont2'

vagrant@standalone:~$ docker exec cont3 ping -c 3 cont1
PING cont1 (172.19.0.2): 56 data bytes
64 bytes from 172.19.0.2: seq=0 ttl=64 time=0.063 ms
64 bytes from 172.19.0.2: seq=1 ttl=64 time=0.226 ms
64 bytes from 172.19.0.2: seq=2 ttl=64 time=0.239 ms
--- cont1 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.063/0.176/0.239 ms
```

As we expected, name resolution within _zone-a_ network works fine. Any other container on other networks will not be able to resolve containers by their names.

8 - We should be able to ping from container _cont3_ to _cont2_ IP address.
```
vagrant@standalone:~$ docker exec cont3 ping -c 3 172.20.0.3
PING 172.20.0.3 (172.20.0.3): 56 data bytes
64 bytes from 172.20.0.3: seq=0 ttl=63 time=0.151 ms
64 bytes from 172.20.0.3: seq=1 ttl=63 time=0.229 ms
64 bytes from 172.20.0.3: seq=2 ttl=63 time=0.201 ms
--- 172.20.0.3 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.151/0.193/0.229 ms
```

So, althoug we do not have name resolution, we can reach containers on other newtorks using a container gateway which has interfaces on all networks. For this to work, we have added a route on each network container to route all other network traffic to the gateway container.


## __Lab4__: Multihomed Containers

In this lab we are going to deploy a simple three-layer application. In fact it is a two-layer application with the addition of a load balancer for lab purposes.

1 - First we create a bridge network named _simplenet_, where we will attach all application components.
```
vagrant@standalone:~$ docker network create simplenet
b5ff93985be84095e70711dd3c403274c5ab9e8c53994a09e4fa8adda97f37f7
```

2 - We will deploy a postgres database with "changeme" as password for root user. We created a simple database named _demo_ with a _demo_ user with "d3m0" password for this lab.
```
vagrant@standalone:~$ docker container run -d \
--name simpledb \
--network simplenet \
--env "POSTGRES_PASSWORD=changeme" \
codegazers/simplestlab:simpledb
```
>NOTE: Notice that we have not published any port for database.

3 - Now we launch backend application component, named _simpleapp_. Notice that in this case we used many environment variables to configure the application side. We set the database host, the database name and the required credentials.
```
vagrant@standalone:~$ docker container run -d \
--name simpleapp \
--network simplenet \
--env dbhost=simpledb \
--env dbname=demo \
--env dbuser=demo \
--env dbpasswd=d3m0 \
codegazers/simplestlab:simpleapp
556d6301740c1f3de20c9ff2f30095cf4a49b099190ac03189cff3db5b6e02ce
```
We have not published the application. Therefore, it is only accesible locally.

4 - Let's review application component IP addresses deployed right now. We will inspect containers attached to _simplenet_.
```
vagrant@standalone:~$ docker network inspect simplenet --format "{{range .Containers}} {{.IPv4Address }} {{.Name}} {{end}}"
172.22.0.4/16 simpleapp 172.22.0.3/16 simpledb
```
>NOTE: Your environment may provide a different IP addresses. Use your IPs on next steps.


5 - If we take a look at exposed (not published) ports on each image definitions we observe:
- On database component:
```
vagrant@standalone:~$ docker inspect codegazers/simplestlab:simpledb --format "{{json .Config.ExposedPorts }}"
{"5432/tcp":{}}
```

- On application backend:
```
vagrant@standalone:~$ docker inspect codegazers/simplestlab:simpleapp --format "{{json .Config.ExposedPorts }}"
{"3000/tcp":{}}
```

6 - We now have all information to test connections to both components. We can just use _curl_ command to test even if server is a database server.

Let's try database, on 172.22.0.3 IP address and 5432 port. We will use _curl -I_ becasue wedon't really care about the response content. We just want to be able to connect to the exposed port.
```
vagrant@standalone:~$ curl -I 172.22.0.3:5432
curl: (52) Empty reply from server
```

In this case, "Empty reply from server" is an OK. Database is listening on that IP-port combination.

Same will happen on application backend, on 172.22.0.4 IP address and 3000 port.
```
vagrant@standalone:~$ curl -I 172.22.0.4:3000
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Date: Sat, 16 Nov 2019 11:38:22 GMT
Connection: keep-alive
```

In this situation we will be able to open our browse pointing to http://172.22.0.4:3000. Application will be visible. But it will only be consumed locally. It is not published yet.

7 - Let's deploy the load balancer component. This component will publish a port on our host. Notice that we added two environment variables to allow load balancer to connect to backend application (we configure the load balancer on the fly with these variables because this image is modified for this behavior).
```
vagrant@standalone:~$ docker container run -d \
--name simplelb \
--env APPLICATION_ALIAS=simpleapp \
--env APPLICATION_PORT=3000 \
--network simplenet \
--publish 8080:80 \
codegazers/simplestlab:simplelb
35882fb4648098f7c1a1d29a0a12f4668f46213492e269b6b8262efd3191582b
```

8 - Let's take a look to our local iptables. Docker daemon has added a NAT rule to guide traffic from port 8080 to port 80 on load balancer component.
```
vagrant@standalone:~$ sudo iptables -L DOCKER -t nat --line-numbers --numeric
Chain DOCKER (2 references)
num target prot opt source destination
1 RETURN all -- 0.0.0.0/0 0.0.0.0/0
2 RETURN all -- 0.0.0.0/0 0.0.0.0/0
3 RETURN all -- 0.0.0.0/0 0.0.0.0/0
4 RETURN all -- 0.0.0.0/0 0.0.0.0/0
5 RETURN all -- 0.0.0.0/0 0.0.0.0/0
6 DNAT tcp -- 0.0.0.0/0 0.0.0.0/0 tcp dpt:8080 to:172.22.0.2:80
```

>NOTE: Notice that load balancer will be available on all host IP addresses because we have not setany specific IP on publish option.

9 - Now, open your web browser using http://localhost:8080. You will be able to consume deployed application. We will have this GUI on your browser.

![SimpleApp](https://github.com/frjaraur/Docker-Certified-Associate-DCA-Exam-Guide/raw/master/images/chapter4.png)

This GUI is in fact the application backend front page. As we mentioned before it is not a
real 3-layer application. We added a load balancer as frontend just to publish and add some
rules there.
