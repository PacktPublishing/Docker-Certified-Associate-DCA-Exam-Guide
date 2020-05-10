# Chapter 1

## Technical requirements

In this chapter we will learn Docker Engine concepts. We provide some labs at the end of the chapter that will help you understand and learn shown concepts. These labs can be run on your laptop or PC using the provided vagrant standalone environment or any already deployed Docker host at your own.

You will need at least (all labs were tested on Linux and Windows):
    
- Internet connection.    
    
- Some Linux, MacOS or Windows basic skills to edit files (using Notepad, Vim, Emacs or any other editor).
    
- Git command-line, Vagrant and Virtualbox installed on your PC or laptop.
    
- Already cloned book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git).

- Enough hardware resources: 1vCPU, 3GB of RAM and 10 GB of available disk space on your hard drive for virtual nodes.

Extended instructions can be found on Github book's repository. These labs will use "environments/standalone-environment" folder for the creation of the virtual environment and "chapter1" folder.

>NOTE: To clone book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git), prepare a directory on your laptop or PC and execute git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git. This will download all required files on your current folder.

All labs will start executing vagrant up  using your command-line from the environment directory "environments/standalone-environment". This command will start all the required nodes for you. If you are using your own Docker host, you can move directly to "chapter1" folder.

Once all environment nodes are up and running, go to "chapter1" folder and follow each lab instructions.

This environment will be used for labs from chapter 1 to chapter 6. You can keep it on your host stopped, not cosumming RAM and CPU resources. You can execute vagrant halt to stop running virtual node. This will not remove your environment and you will be able to continue using it on next chapter's labs.

After completed the labs, you can use vagrant destroy -f from "environments/standalone-environment" directory to completely remove all the lab-deployed nodes and free your disk.

---


## Previous requirements
- Working Vagrant and VirtualBox installation.
- Running "Standalone" environemnt.

>NOTE:
>
>You can use your own host (laptop or server), we provide you mock environments to avoid any change in your system. 
>All labs an be executed on the "standalone" environment, therefore we will connect to this node using _vagrant ssh_:
>
>```
>$ vagrant ssh standalone
>vagrant@standalone:~$
>```
---

### Following labs can be found under chapter1 directory.


---
## __Lab1__: Installing Docker runtime and executing "hello world" container

This lab will guide you through docker runtime installation steps and running your first container.

1 - To ensure that no previous versions are installed, we will remove any docker* package.
```
vagrant@standalone:~$ sudo yum remove docker*
```


2 - Add the required packages by running the following command:
```
vagrant@standalone:~$ sudo yum install -y yum-utils \
 device-mapper-persistent-data \
 lvm2
```

3 - We will use stable release so we will add its package repository as follows:
```
vagrant@standalone:~$ sudo yum-config-manager \
--add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

4 - We now install docker packages and containerd. We are installing server and client on this host (since version 18.06, docker provides different packages for docker-cli and docker daemon).
```
vagrant@standalone:~$ sudo yum install -y docker-ce docker-ce-cli containerd.io
```

5 - Docker is installed but on Red Hat like operating systems, it is not enabled on boot by default and will not be started. We will verify this situation and we will enable and start docker service.
```
vagrant@standalone:~$ sudo systemctl is-active docker
vagrant@standalone:~$ sudo systemctl enable docker
vagrant@standalone:~$ sudo systemctl start docker
```

6 - Now that Docker is installed and running, we can run our first container.
```
vagrant@standalone:~$ sudo docker container run hello-world

Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
1b930d010525: Pull complete
Digest: sha256:b8ba256769a0ac28dd126d584e0a2011cd2877f3f76e093a7ae560f2a5301c00
Status: Downloaded newer image for hello-world:latest
Hello from Docker!
This message shows that your installation appears to be working correctly.
To generate this message, Docker took the following steps:
1. The Docker client contacted the Docker daemon.
2.  The Docker daemon pulled the "hello-world" image from the Docker Hub. (amd64)
3. The Docker daemon created a new container from that image that runs the executable, which produces the output you are currently reading.
4. The Docker daemon streamed that output to the Docker client, which sent it to your terminal.
To try something more ambitious, you can run an Ubuntu container with:

$ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID: https://hub.docker.com/
For more examples and ideas, visit: https://docs.docker.com/get-started/
```

7 - As you should have noticed, we are always using sudo to root, because our user has not got access to docker unix socket. This is the first security layer an attacker must pass on your system. We usually enable a user to run containers in production environments because we want to isolate operating system responsibilities and management from Docker. Just add our user to the docker group or add a new group of users with access to the socket. In this case, we will just add our lab user to the docker group.
```
vagrant@standalone:~$ docker container ls
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get http://%2Fvar%2Frun%2Fdocker.sock/v1.40/containers/json : dial unix /var/run/docker.sock: connect: permission denied

vagrant@standalone:~$ sudo usermod -a -G docker $USER
vagrant@standalone:~$ newgrp docker

vagrant@standalone:~$ docker container ls -a
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
5f7abd49b3e7 hello-world "/hello" 19 minutes ago Exited (0) 19 minutes ago festive_feynman
```

## __Lab2__: Docker runtime processes and namespaces isolation

In this lab, we are going to review what we learned about process isolation and Docker daemon components and execution workflow.

1 - Take a quick review of Docker systemd daemon.
```
vagrant@standalone:~$ sudo systemctl status docker
● docker.service - Docker Application Container Engine
Loaded: loaded (/usr/lib/systemd/system/docker.service; enabled;
vendor preset: disabled)
Active: active (running) since sáb 2019-09-28 19:34:30 CEST; 25min
ago
Docs: https://docs.docker.com
Main PID: 20407 (dockerd)
Tasks: 10
Memory: 58.9M
CGroup: /system.slice/docker.service
└─20407 /usr/bin/dockerd -H fd:// -- containerd=/run/containerd/containerd.sock
sep 28 19:34:30 centos7-base dockerd[20407]: time="2019-09-28T19:34:30.222200934+02:00" level=info msg="[graphdriver] using prior storage driver: overlay2"
sep 28 19:34:30 centos7-base dockerd[20407]: time="2019-09-28T19:34:30.234170886+02:00" level=info msg="Loading containers: start." 
sep 28 19:34:30 centos7-base dockerd[20407]: time="2019-09-28T19:34:30.645048459+02:00" level=info msg="Default bridge (docker0) is assigned with an IP a... address"
sep 28 19:34:30 centos7-base dockerd[20407]: time="2019-09-28T19:34:30.806432227+02:00" level=info msg="Loading containers: done."
sep 28 19:34:30 centos7-base dockerd[20407]: time="2019-09-28T19:34:30.834047449+02:00" level=info msg="Docker
daemon" commit=6a30dfc graphdriver(s)=over...n=19.03.2
sep 28 19:34:30 centos7-base dockerd[20407]: time="2019-09-28T19:34:30.834108635+02:00" level=info msg="Daemon has completed initialization"
sep 28 19:34:30 centos7-base dockerd[20407]: time="2019-09-28T19:34:30.850703030+02:00" level=info msg="API listen on /var/run/docker.sock"
sep 28 19:34:30 centos7-base systemd[1]: Started Docker Application Container Engine.
sep 28 19:34:43 centos7-base dockerd[20407]: time="2019-09-28T19:34:43.558580560+02:00" level=info msg="ignoring event" module=libcontainerd namespace=mo...skDelete"
sep 28 19:34:43 centos7-base dockerd[20407]: time="2019-09-28T19:34:43.586395281+02:00" level=warning msg="5f7abd49b3e75c58922c6e9d655d1f6279cf98d9c325ba2d3e53c36...
```
This output shows that the service is using a default systemd unit configuration and dockerd is using the default parameters, using file descriptor socket on /var/run/docker.sock and default docker0 bridge interface.

2 - We notice that dockerd uses a separate containerd process to execute containers. Let's
run some container on background and review their processes. We will run a simple alpine with an nginx daemon.
```
vagrant@standalone:~$ docker run -d nginx:alpine
Unable to find image 'nginx:alpine' locally
alpine: Pulling from library/nginx
9d48c3bd43c5: Already exists
1ae95a11626f: Pull complete
Digest:
sha256:77f340700d08fd45026823f44fc0010a5bd2237c2d049178b473cd2ad977d071
Status: Downloaded newer image for nginx:alpine
dcda734db454a6ca72a9b9eef98aae6aefaa6f9b768a7d53bf30665d8ff70fe7
```

3 - Now we will look for nginx and containerd processes (process ids will be completely different on your system, just understand the workflow)
```
vagrant@standalone:~$ ps -efa|grep -v grep|egrep -e containerd -e nginx
root  15755  1 0 sep27 ?  00:00:42 /usr/bin/containerd
root  20407  1 0 19:34 ?  00:00:02 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
root  20848 15755 0 20:06 ?  00:00:00 containerd-shim - namespace moby -workdir /var/lib/containerd/io.containerd.runtime.v1.linux/moby/dcda734db454a6ca72a9 b9eef98aae6aefaa6f9b768a7d53bf30665d8ff70fe7 -address /run/containerd/containerd.sock -containerd-binary /usr/bin/containerd -runtime-root /var/run/docker/runtime-runc
root  20863 20848 0 20:06 ? 00:00:00 nginx: master process nginx -g daemon off;
101  20901 20863 0 20:06 ?  00:00:00 nginx: worker process
```

4 -We notice that at the end, container started from 20848 pid. Following runtime-runc location we discover state.json, which is the container state file.
```
vagrant@standalone:~$ sudo ls -laRt /var/run/docker/runtime-runc/moby
/var/run/docker/runtime-runc/moby:
total 0
drwx--x--x. 2 root root 60 sep 28 20:06 dcda734db454a6ca72a9b9eef98aae6aefaa6f9b768a7d53bf30665d8ff70fe7
drwx------. 3 root root 60 sep 28 20:06 .
drwx------. 3 root root 60 sep 28 13:42 ..
/var/run/docker/runtime- runc/moby/dcda734db454a6ca72a9b9eef98aae6aefaa6f9b768a7d53bf30665d8ff70fe7:
total 28
drwx--x--x. 2 root root  60 sep 28 20:06 .
-rw-r--r--. 1 root root 24966 sep 28 20:06 state.json
drwx------. 3 root root  60 sep 28 20:06 ..
```

This file contains container runtime information: PID, mounts, devices,
capabilities applied, resources, etc..

5 - Our nginx server runs under 20863 pid and nginx child process with pid 20901 on docker host, but let's take a look inside.
```
vagrant@standalone:~$ docker container exec dcda734db454 ps -ef
PID USER TIME COMMAND
1 root 0:00 nginx: master process nginx -g daemon off;
6 nginx 0:00 nginx: worker process
7 root 0:00 ps -ef
```

Using docker container exec, we run a new process using a container namespace. It is like running a new process "inside the container". As we can notice, inside the container, nginx has PID 1 and it is the worker process parent. And of course, we see our command, ps -ef, because it was launched using its namespaces.
We can run other containers using the same image and we will obtain same results. Processes inside each container are isolated from other containers and host processes, but users on docker host will see all processes with their real PIDs.

6 - Let's take a look at nginx process namespaces.
So we confirm that our nginx container is running using different namespaces that provides complete network, processes, mounts, filesystem and time isolation.
```
vagrant@standalone:~$ sudo lsns
NS         TYPE NPROCS  PID    USER COMMAND
4026532197 mnt  2       20863  root  nginx: master process nginx -g daemon off
4026532198 uts  2       20863  root  nginx: master process nginx -g daemon off
4026532199 ipc  2       20863  root  nginx: master process nginx -g daemon off
4026532200 pid  2       20863  root  nginx: master process nginx -g daemon off
4026532202 net  2       20863  root  nginx: master process nginx -g daemon off
```

This lab showed process isolation within a process running inside containers.



## __Lab3__: Docker capabilities

This lab will cover seccopm capabilities management. We will launch containers using dropped capabilites to ensure that using seccomp to avoid some system calls, processes in containers will only execute allowed actions.

1- We will first run a container using default allowed capabilities. During the execution ofthis alpine container, we will change the ownership of /etc/passwd file.
```
vagrant@standalone:~$ docker container run --rm -it alpine sh -c "chown nobody /etc/passwd; ls -l /etc/passwd"
-rw-r--r-- 1 nobody root 1230 Jun 17 09:00 /etc/passwd
```

As we can see, there is nothing to stop changing whatever file ownership insidecontainers filesystem, because the main process (in this case /bin/sh) runs as the root user.

2 - Let's drop all capabilities and see what happens.
```
vagrant@standalone:~$ docker container run --rm -it --cap-drop=ALL alpine sh -c "chown nobody /etc/passwd; ls -l /etc/passwd"
chown: /etc/passwd: Operation not permitted
-rw-r--r-- 1 root root 1230 Jun 17 09:00 /etc/passwd
```

We notice that operation was forbiden. As container runs without any capabilities, the chown command is not allowed to change file ownership.

3 -Now we just add CHOWN capability to allow again to change ownership of files inside the container.
```
vagrant@standalone:~$ docker container run --rm -it --cap-drop=ALL --cap-add CHOWN alpine sh -c "chown nobody /etc/passwd; ls -l /etc/passwd"
-rw-r--r-- 1 nobody root 1230 Jun 17 09:00 /etc/passwd
```
