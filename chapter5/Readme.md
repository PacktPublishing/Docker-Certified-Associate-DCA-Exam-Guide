# Chapter 5

## Technical requirements

In this chapter we will learn Docker multi-containers applications. We provide some labs at the end of the chapter that will help you understand and learn shown concepts. These labs can be run on your laptop or PC using the provided vagrant standalone environment or any already deployed Docker host at your own.

You will need at least (all labs were tested on Linux and Windows):
    
- Internet connection.    
    
- Some Linux, MacOS or Windows basic skills to edit files (using Notepad, Vim, Emacs or any other editor).
    
- Git command-line, Vagrant and Virtualbox installed on your PC or laptop.
    
- Already cloned book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git).

- Enough hardware resources: 1vCPU, 3GB of RAM and 10 GB of available disk space on your hard drive for virtual nodes.

Extended instructions can be found on Github book's repository. These labs will use "environments/standalone-environment" folder for the creation of the virtual environment and "chapter5" folder.
To clone book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git), prepare a directory on your laptop or PC and execute git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git. This will dowload all required files on your current folder.

All labs will start executing vagrant up  using your command-line from the environment directory "environments/standalone-environment". This command will start all the required nodes for you. If you are using your own Docker host, you can move directly to "chapter5" folder.

Once all environment nodes are up and running, go to "chapter5" folder and follow each lab instructions.

This environment will be used for labs from chapter 1 to chapter 6. You can keep it on your host stopped, not cosumming RAM and CPU resources. You can execute vagrant halt to stop running virtual node. This will not remove your environment and you will be able to continue using it on next chapter's labs.

After completed the labs, you can use vagrant destroy -f from "environments/standalone-environment" directory to completely remove all the lab-deployed nodes and free your disk.

---

## Previous requirements
- Working Vagrant and VirtualBox installation.
- Running "Standalone" environemnt.

>NOTE:
>
>You can use your own host (laptop or server), we provide you mock environments to avoid any change in your system. 

---

### Following labs can be found under chapter5 directory.


---
## __Lab1__: Colors lab application

We will run a simple application that will show us a different color using variables. We will be able to review 's IP address and hostname. We will use docker-compose hence it must be installed. This is explained in the book. If you are using "Standalone" Environment, you are usin a Linux node for the labs and you can follow these instructions:

```
vagrant@standalone:~$ sudo curl -L --fail https://github.com/docker/compose/releases/download/1.24.1/run.sh -o /usr/local/bin/docker-compose

vagrant@standalone:~$ sudo chmod +x /usr/local/bin/docker-compose
```

1 - In this first lab we will run a random color application using [docker-compose.random.yaml](./docker-compose.random.yaml). This is the content of this file:
```
version: "3.7"
services:
    random:
        build: app
        labels:
            role: backend
        ports:
        - 3000
        networks:
        - lab
networks:
    lab:
```

It is very simple. We defined "random" service using the code contained in "app" directory. We will expose  port 3000 to a random host one.

2 - We will now build images using "lab1" as project name. Notice that we defined "lab" network. Docker daemon will create "lab1_random" image and "lab1_lab" network.
```
vagrant@standalone:~$ docker-compose -p lab1 -f docker-compose.random.yaml build
Building random
Step 1/9 : FROM node:alpine
alpine: Pulling from library/node
89d9c30c1d48: Already exists
5320ee7fe9ff: Pull complete
...
...
---> 61bbe191216e
Step 3/9 : WORKDIR ${APPDIR}
---> Running in 0c2c4f546121
...
...
npm notice created a lockfile as package-lock.json. You should commit this
file.
npm WARN app@1.0.0 No description
npm WARN app@1.0.0 No repository field.
added 3 packages from 1 contributor and audited 3 packages in 1.17s
found 0 vulnerabilities
Removing intermediate  4c11ecc0b606
---> e183421a2f83
Step 6/9 : COPY app.js app.js
...
...

---> 23942ce67aee
Step 9/9 : EXPOSE 3000
---> Running in 51379c5e7630
Removing intermediate  51379c5e7630
---> c0dce423a972
Successfully built c0dce423a972
Successfully tagged lab1_random:latest
```

3 - Now we execute our multi- application (in this case we just have one service definition).
```
vagrant@standalone:~$ docker-compose -p lab1 -f docker-compose.random.yaml up -d
Creating network "lab1_lab" with the default driver
Creating lab1_random_1 ... done
Let's review the docker-compose project "lab1" execution:
vagrant@standalone:~$ docker-compose -p lab1 -f docker-compose.random.yaml ps
Name Command State Ports
--------------------------------------------------------------------------------
lab1_random_1 docker-entrypoint.sh node ... Up 0.0.0.0:32780->3000/tcp
```

4 - We notice that application's port 3000 is linked to Docker host port 32780 (using NAT). Therefore we can access application via that random port:
```
vagrant@standalone:~$ curl 0.0.0.0:32780/text
APP_VERSION: 1.0
COLOR: blue
_NAME: 17bc24f60799
_IP: 172.27.0.2
CLIENT_IP: ::ffff:172.27.0.1
_ARCH: linux
```

5 - We can use a web browser to access the running application but it is enough using curl because application is prepared to show a text response using "/text" endpoint. A random color will be used. In this case we get a "blue" page. It may vary in your environment because a random color will be choosen if "COLOR" variable is not set.

6 - We can now remove the application and continue to next lab using _docker-compose down_.
```
vagrant@standalone:~$ docker-compose -p lab1 -f docker-compose.random.yaml down
Stopping lab1_random_1 ... done
Removing lab1_random_1 ... done
Removing network lab1_lab
```

## __Lab2__: Executing a RED application

Let's execute now a "red" application. In this case we have just changed service name and
added an environment variable to define the backend color ("COLOR" key and "red"
value).

1 - This the content of [docker-compose.red.yaml](./docker-compose.red.yaml) file:
```
version: "3.7"
services:
    red:
        build: app
        environment:
            COLOR: "red"
        labels:
            role: backend
        ports:
        - 3000
        networks:
        - lab
networks:
    lab:
```

>NOTE: We can reuse "lab1" project name or use a new one. If we use "lab2" as new project name, new tags will be added. 

2 - Building will not create new layers because we have not change any code. We will simply use _docker-compose up -d_.
```
vagrant@standalone:~$ docker-compose -p lab2 -f docker-compose.red.yaml up -d
Creating network "lab2_lab" with the default driver
Building red
Step 1/9 : FROM node:alpine
---> fac3d6a8e034
Step 2/9 : ENV APPDIR /APP
---> Using cache
---> 61bbe191216e
Step 3/9 : WORKDIR ${APPDIR}
---> Using cache
...
...
---> Using cache
---> df0f6838dfca
Step 9/9 : EXPOSE 3000
---> Using cache
---> 24ae28db3e15
Successfully built 24ae28db3e15
Successfully tagged lab2_red:latest
WARNING: Image for service red was built because it did not already exist.
To rebuild this image you must use `docker-compose build` or `docker-
compose up --build`.
Creating lab2_red_1 ... done
```

3 - We can review deployment status using docker-compose ps.
```
vagrant@standalone:~$ docker-compose -p lab2 -f docker-compose.red.yaml ps
Name Command State Ports
---------------------------------------------------------------------------
--
lab2_red_1 docker-entrypoint.sh node ... Up 0.0.0.0:32781->3000/tcp
```

4 - We can easily access 0.0.0.0:32781 to get "red" application using curl.
```
vagrant@standalone:~$ curl 0.0.0.0:32781/text
APP_VERSION: 1.0
COLOR: red
_NAME: fc05e400d02a
_IP: 172.29.0.2
CLIENT_IP: ::ffff:172.29.0.1
_ARCH: linux
```

## __Lab3__: Scaling RED backends

Let's try now to scale up the number of application instances.

1 - We will just set the new number of instances required for the application using _docker-compose scale_.
```
vagrant@standalone:~$ docker-compose -p lab3 -f docker-compose.red.yaml scale red=5
WARNING: The scale command is deprecated. Use the up command with the --
scale flag instead.
Starting lab3_red_1 ... done
Creating lab3_red_2 ... done
Creating lab3_red_3 ... done
Creating lab3_red_4 ... done
Creating lab3_red_5 ... done
```

2 - Notice that in this case we are deploying a staless application, without any persistency. There is something else in this case, we left unset the host linked port. Therefore a random one is always used for each  instance. Let's review new instance number with _docker-compose ps_.
```
vagrant@standalone:~$ docker-compose -p lab3 -f docker-compose.red.yaml ps
Name Command State Ports
-----------------------------------------------------------------------------
lab3_red_1 docker-entrypoint.sh node ... Up 0.0.0.0:32781->3000/tcp
lab3_red_2 docker-entrypoint.sh node ... Up 0.0.0.0:32784->3000/tcp
lab3_red_3 docker-entrypoint.sh node ... Up 0.0.0.0:32785->3000/tcp
lab3_red_4 docker-entrypoint.sh node ... Up 0.0.0.0:32783->3000/tcp
lab3_red_5 docker-entrypoint.sh node ... Up 0.0.0.0:32782->3000/tcp
```

3 - Now we can access all instances. Each one using its own NAT port available in the Docker host. We can check again using curl (use curl on a loop or just run it 10 times):
```
vagrant@standalone:~$ curl 0.0.0.0:32781/text
APP_VERSION: 1.0
COLOR: red
_NAME: fc05e400d02a
_IP: 172.29.0.2
CLIENT_IP: ::ffff:172.29.0.1
_ARCH: linux


vagrant@standalone:~$ curl 0.0.0.0:32782/text
APP_VERSION: 1.0
COLOR: red
_NAME: f5de33465357
_IP: 172.29.0.3
CLIENT_IP: ::ffff:172.29.0.1
_ARCH: linux


vagrant@standalone:~$ curl 0.0.0.0:32783/text
APP_VERSION: 1.0
COLOR: red
_NAME: 5be016aadadb
_IP: 172.29.0.4
CLIENT_IP: ::ffff:172.29.0.1
_ARCH: linux


vagrant@standalone:~$ curl 0.0.0.0:32784/text
APP_VERSION: 1.0
COLOR: red
_NAME: 413c9d605bd5
_IP: 172.29.0.5
CLIENT_IP: ::ffff:172.29.0.1
_ARCH: linux


vagrant@standalone:~$ curl 0.0.0.0:32785/text
APP_VERSION: 1.0
COLOR: red
_NAME: fe879a59c3aa
_IP: 172.29.0.6
CLIENT_IP: ::ffff:172.29.0.1
_ARCH: linux
```

All IP addresses are different because we are accessing different s. But all are "red" as we expected.

4 - Let's remove all application instances.
```
vagrant@standalone:~$ docker-compose -p lab3 -f docker-compose.red.yaml down
Stopping lab3_red_2  ... done
Stopping lab3_red_3  ... done
Stopping lab3_red_4 ... done
Stopping lab3_red_5 ... done
Stopping lab3_red_1 ... done
Removing lab3_red_2 ... done
Removing lab3_red_3 ... done
Removing lab3_red_4 ... done
Removing lab3_red_5 ... done
Removing lab3_red_1 ... done
Removing network lab3_lab
```

## __Lab4__: Using a single file to launch multiple services.

In this lab we will add more colors using a single file.

1 - Let's add more color applications in [docker-compose.multicolor.yaml](./docker-compose.multicolor.yaml). Let's review the content of this file:
```
version: "3.7"
services:
    red:
        build: app
        environment:
            COLOR: "red"
        labels:
            role: backend
        ports:
        - 3000
        networks:
        - lab
    green:
        build: app
        environment:
            COLOR: "green"
        labels:
            role: backend
        ports:
        - 3000
        networks:
        - lab
    white:
        build: app
        environment:
            COLOR: "white"
        labels:
            role: backend
        ports:
        - 3000
        networks:
        - lab
networks:
    lab:

```

2 - We will launch "red", "green" and "white" applications using _docker-compose up_.
```
vagrant@standalone:~$ docker-compose -p lab4 -f docker-compose.multicolor.yaml up -d
Creating network "lab4_lab" with the default driver
Building white
Step 1/9 : FROM node:alpine
---> fac3d6a8e034
...
Successfully built 24ae28db3e15
Successfully tagged lab4_white:latest
...
Building green
...
Successfully tagged lab4_green:latest
...
Building red
...
Successfully tagged lab4_red:latest
WARNING: Image for service red was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
Creating lab4_green_1 ... done
Creating lab4_white_1 ... done
Creating lab4_red_1 ... done
```

3 - We will be able to access different applications. Let's review their processes and ports using _docker-compose ps_ and then access each instance using _curl_.
```
vagrant@standalone:~$ docker-compose -p lab4 -f docker-compose.multicolor.yaml ps
Name Command State Ports
-------------------------------------------------------------------------------
lab4_green_1 docker-entrypoint.sh node ... Up 0.0.0.0:32789->3000/tcp
lab4_red_1 docker-entrypoint.sh node ... Up 0.0.0.0:32791->3000/tcp
lab4_white_1 docker-entrypoint.sh node ... Up 0.0.0.0:32790->3000/tcp

vagrant@standalone:~$ curl 0.0.0.0:32789/text
APP_VERSION: 1.0
COLOR: green
_NAME: a25a4cc36232
_IP: 172.31.0.2
CLIENT_IP: ::ffff:172.31.0.1
_ARCH: linux

vagrant@standalone:~$ curl 0.0.0.0:32791/text
APP_VERSION: 1.0
COLOR: red
_NAME: 5e12b0de196c
_IP: 172.31.0.4
CLIENT_IP: ::ffff:172.31.0.1
_ARCH: linux

vagrant@standalone:~$ curl 0.0.0.0:32790/text
APP_VERSION: 1.0
COLOR: white
_NAME: b67b09c8c836
_IP: 172.31.0.3
CLIENT_IP: ::ffff:172.31.0.1
_ARCH: linux
```

>NOTE: Ramdom ports may be different on your lab environment.

In this situation all application components are accessible using random published ports. We can use fixed ports to route users requests on external load balancers for example. We will not use random ports in production.


## __Lab5__: Multiple services with a load balancer.

In this lab we add a simple nginx load balancer to route traffic to different color backends.

1 - Let's add _loadbalancer_ service to our multi-color applications in [docker-compose.loadbalancer.yaml ](./docker-compose.loadbalancer.yaml ). Let's review the content of this file:
```
version: "3.7"
services:
    loadbalancer:
        build: lb
        environment:
            APPLICATION_PORT: 3000
        ports:
        - 8080:80
        networks:
        - lab
    red:
        build: app
        environment:
            COLOR: "red"
        labels:
            role: backend
        ports:
        - 3000
        networks:
        - lab
    green:
        build: app
        environment:
            COLOR: "green"
        labels:
            role: backend
        ports:
        - 3000
        networks:
        - lab
    white:
        build: app
        environment:
            COLOR: "white"
        labels:
            role: backend
        ports:
        - 3000
        networks:
        - lab
networks:
    lab:
```

>NOTE: Notice that we have removed all colors service backends ports and now we are just exposing port 8080 linked to internal nginx component port 80.

2 - We will launch application deployment and review the results using _docker-compose-d up_.
```
vagrant@standalone:~$ docker-compose -p lab5 -f docker-compose.loadbalancer.yaml up -d
Creating network "lab5_lab" with the default driver
Building white
...
Successfully tagged lab5_white:latest
WARNING: Image for service white was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
Building green
...
Successfully tagged lab5_green:latest
WARNING: Image for service green was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.

Building red
...
Successfully tagged lab5_red:latest
WARNING: Image for service red was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
Building loadbalancer
...
Successfully tagged lab5_loadbalancer:latest
WARNING: Image for service loadbalancer was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
Creating lab5_loadbalancer_1 ... done
Creating lab5_white_1 ... done
Creating lab5_red_1 ... done
Creating lab5_green_1 ... done
```

3 - Once all components are ready, we can test all color backends using differnet host headers to reach each backend. We prepared a simple nginx load balancing configuration (take a quick review of load balancer configuration file in lb/nginx.conf). Everytime we ask for an specific host header using each color, we will be routed to the right backend.
```
vagrant@standalone:~$ cat lb/nginx.conf
...
...
server {
listen 80;
set $port "__APPLICATION_PORT__";
...
...
location / {
proxy_pass http://$host:$port;
}
...
...
```

4 - Using curl we can test all backends.
```
vagrant@standalone:~$ curl -H "Host: white" 0.0.0.0:8080/text
APP_VERSION: 1.0
COLOR: white
_NAME: 86871cba5a71
_IP: 192.168.208.5
CLIENT_IP: ::ffff:192.168.208.4
_ARCH: linux

vagrant@standalone:~$ curl -H "Host: green" 0.0.0.0:8080/text
APP_VERSION: 1.0
COLOR: green
_NAME: f7d90dc89255
_IP: 192.168.208.2
CLIENT_IP: ::ffff:192.168.208.4
_ARCH: linux

vagrant@standalone:~$ curl -H "Host: red" 0.0.0.0:8080/text
APP_VERSION: 1.0
COLOR: red
_NAME: 25bb1b66bab8
_IP: 192.168.208.3
CLIENT_IP: ::ffff:192.168.208.4
_ARCH: linux
```

5 - Remember, none of the services is accessible but loadbalancer. Let's review published ports using _docker-compose ps_.
```
vagrant@standalone:~$ docker-compose -p lab5 -f docker-compose.loadbalancer.yaml ps
Name Command State Ports
-----------------------------------------------------------------------------------
lab5_green_1 docker-entrypoint.sh node ... Up 3000/tcp
lab5_loadbalancer_1 /entrypoint.sh /bin/sh -c ... Up 0.0.0.0:8080->80/tcp
lab5_red_1 docker-entrypoint.sh node ... Up 3000/tcp
lab5_white_1 docker-entrypoint.sh node ... Up 3000/tcp
```

6 - What will happen if we now scale up the "green" service to 4 instances?. We expect to reach all instances because service instances will be added to internal DNS. Let's scale up this service using _docker-compose up -d_.
```
vagrant@standalone:~$ docker-compose -p lab5 -f docker-compose.loadbalancer.yaml up -d --scale green=4
Starting lab5_green_1 ...
lab5_white_1 is up-to-date
lab5_red_1 is up-to-date
Starting lab5_green_1 ... done
Creating lab5_green_2 ... done
Creating lab5_green_3 ... done
Creating lab5_green_4 ... done
```

7 - Let's ask for the "green" service again using _curl_ a couple of times.
```
vagrant@standalone:~$ curl -H "Host: green" 0.0.0.0:8080/text
APP_VERSION: 1.0
COLOR: green
_NAME: ba90c57914f9
_IP: 192.168.208.7
CLIENT_IP: ::ffff:192.168.208.4
_ARCH: linux

vagrant@standalone:~$ curl -H "Host: green" 0.0.0.0:8080/text
APP_VERSION: 1.0
COLOR: green
_NAME: c1a9ebcf82ac
_IP: 192.168.208.6
CLIENT_IP: ::ffff:192.168.208.4
_ARCH: linux

vagrant@standalone:~$ curl -H "Host: green" 0.0.0.0:8080/text
APP_VERSION: 1.0
COLOR: green
_NAME: d5436822ca8f
_IP: 192.168.208.8
CLIENT_IP: ::ffff:192.168.208.4
_ARCH: linux

vagrant@standalone:~$ curl -H "Host: green" 0.0.0.0:8080/text
APP_VERSION: 1.0
COLOR: green
_NAME: f7d90dc89255
_IP: 192.168.208.2
CLIENT_IP: ::ffff:192.168.208.4
_ARCH: linux
```

As we expected, we get different backends on each request because DNS gave load balancer a different backend IP address.

8 - To fininsh this lab let's install "bind-tools" on loadbalancer  and query internal DNS using _host_ tool. We will query _red_ and _green_ services. We will use docker-compose exec to install _bin-tools_ package in loadbalancer . Once package is installed, we will use _docker-compose exec_ again with _host_ command to query DNS.
```
vagrant@standalone:~$ docker-compose -p lab5 -f docker-compose.loadbalancer.yaml exec loadbalancer apk add -q --update bind-tools

vagrant@standalone:~$ docker-compose -p lab5 -f docker-compose.loadbalancer.yaml exec loadbalancer host red
red has address 192.168.208.3

vagrant@standalone:~$ docker-compose -p lab5 -f docker-compose.loadbalancer.yaml exec loadbalancer host green
green has address 192.168.208.8
green has address 192.168.208.2
green has address 192.168.208.7
green has address 192.168.208.6
```

Internal DNS gave us all the IP addresses associated with _green_ and _red_ services. Those are the associated s IP addresses. Therefor our defined _green_ service is load balanced to all running _green_ backends.

9 - Remove all labs using _docker-compose down_ with the appropiate docker-compose file and project name.
```
vagrant@standalone:~$ docker-compose -p lab5 -f docker-compose.loadbalancer.yaml down
```