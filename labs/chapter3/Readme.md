# Chapter 3

## Previous requirements
- Working Vagrant and VirtualBox installation.
- Running "Standalone" environemnt.

>NOTE:
>
>You can use your own host (laptop or server), we provide you mock environments to avoid any change in your system. 

---

### Following labs can be found under labs/chapter2 directory.


---
## __Lab1__: Review Docker Command-line Object Options

In this simple lab we will just review docker command-line output.

1 - This isn't even a real lab. We will just review the ouput of _docker --help_. 
```
$ docker --help

Usage:  docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Options:
      --config string      Location of client config files (default "/home/zero/.docker")
  -c, --context string     Name of the context to use to connect to the daemon (overrides DOCKER_HOST env var and default context set with "docker context use")
  -D, --debug              Enable debug mode
  -H, --host list          Daemon socket(s) to connect to
  -l, --log-level string   Set the logging level ("debug"|"info"|"warn"|"error"|"fatal") (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlscacert string   Trust certs signed only by this CA (default "/home/zero/.docker/ca.pem")
      --tlscert string     Path to TLS certificate file (default "/home/zero/.docker/cert.pem")
      --tlskey string      Path to TLS key file (default "/home/zero/.docker/key.pem")
      --tlsverify          Use TLS and verify the remote
  -v, --version            Print version information and quit

Management Commands:
  builder     Manage builds
  config      Manage Docker configs
  container   Manage containers
  context     Manage contexts
  engine      Manage the docker engine
  image       Manage images
  network     Manage networks
  node        Manage Swarm nodes
  plugin      Manage plugins
  secret      Manage Docker secrets
  service     Manage services
  stack       Manage Docker stacks
  swarm       Manage Swarm
  system      Manage Docker
  trust       Manage trust on Docker images
  volume      Manage volumes

Commands:
  attach      Attach local standard input, output, and error streams to a running container
  build       Build an image from a Dockerfile
  commit      Create a new image from a container's changes
  cp          Copy files/folders between a container and the local filesystem
  create      Create a new container
  diff        Inspect changes to files or directories on a container's filesystem
  events      Get real time events from the server
  exec        Run a command in a running container
  export      Export a container's filesystem as a tar archive
  history     Show the history of an image
  images      List images
  import      Import the contents from a tarball to create a filesystem image
  info        Display system-wide information
  inspect     Return low-level information on Docker objects
  kill        Kill one or more running containers
  load        Load an image from a tar archive or STDIN
  login       Log in to a Docker registry
  logout      Log out from a Docker registry
  logs        Fetch the logs of a container
  pause       Pause all processes within one or more containers
  port        List port mappings or a specific mapping for the container
  ps          List containers
  pull        Pull an image or a repository from a registry
  push        Push an image or a repository to a registry
  rename      Rename a container
  restart     Restart one or more containers
  rm          Remove one or more containers
  rmi         Remove one or more images
  run         Run a command in a new container
  save        Save one or more images to a tar archive (streamed to STDOUT by default)
  search      Search the Docker Hub for images
  start       Start one or more stopped containers
  stats       Display a live stream of container(s) resource usage statistics
  stop        Stop one or more running containers
  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE
  top         Display the running processes of a container
  unpause     Unpause all processes within one or more containers
  update      Update configuration of one or more containers
  version     Show the Docker version information
  wait        Block until one or more containers stop, then print their exit codes

Run 'docker COMMAND --help' for more information on a command.
```

We can split this output in two pieces:

![Docker Help](https://github.com/frjaraur/Docker-Certified-Associate-DCA-Exam-Guide/raw/master/images/chapter3.png)

Objects will appear on first part, after common options, and on bottom we will have options allowed. As we mentioned on this chapter, not all objects have same actions.

We should use --help with each kind of object to review what actions are available for them. We can deep dive using any action and _--help_ to obtain information about usage of that specified action. As we have not set any _DOCKER_HOST_ variable neither used _-H_ for connecting to remote daemon, we will use local Docker daemon.

## __Lab2__: Executing Containers

This is a long lab in which we are going to review many actions and options available to containers.

1 - Execute an interactive alpine image based container in the background.
```
$ docker container run -ti -d alpine
aa73504ba37299aa7686a1c5d8023933b09a0ff13845a66be0aa69203eea8de7
```

2 - Now we review and rename container as "myalpineshell".
```
$ docker container ls -l
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
aa73504ba372 alpine "/bin/sh" About a minute ago Up About a minute elastic_curran
```

We now rename reusing previous execution, obtaining only containers id.
```
$ docker container rename $(docker container ls -ql) myalpineshell
```

If we review latest container again we have different name. Notice that container is running (output probably will show different times for you):
```
$ docker container ls -l
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
aa73504ba372 alpine "/bin/sh" 11 minutes ago Up 11 minutes myalpineshell
```

3 - We attach to "myalpineshell" container and create an empty file named "TESTFILE" on /tmp and then we exit:
```
$ docker container attach myalpineshell
/ # touch /tmp/TESTFILE
/ # exit
```

4 - If we review container status again we find that it is exited.
```
$ docker container ls -l
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
aa73504ba372 alpine "/bin/sh" 14 minutes ago Exited (0) 46 seconds ago myalpineshell
```

Container now shows a "Exited (0)" status. Alpine image main process is a shell and CMD is "/bin/sh". We exited issuing "exit" command, therefore exit status was 0. No problem was found during execution.

5 - Now we are going to force a failure status, executing for example a command doesn't exist on image. We will execute "curl" command on a new container.
```
$ docker container run alpine curl www.google.com
docker: Error response from daemon: OCI runtime create failed:
container_linux.go:345: starting container process caused "exec: \"curl\": executable file not found in $PATH": unknown.
ERRO[0001] error waiting for container: context canceled
```

As command does not exist, we can not even execute desired command and as a result, container was created but not executed.
```
$ docker container ls -l
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
466cc346e5d3 alpine "curl www.google.com" 17 seconds ago Created fervent_tharp
```

6 - Now we will execute "ls -l /tmp/TESTFILE" on a new container.
```
$ docker container run alpine ls -l /tmp/TESTFILE
ls: /tmp/TESTFILE: No such file or directory

$ docker container ls -l
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
7c328b9a0609 alpine "ls -l /tmp/TESTFILE" 8 seconds ago Exited (1) 6 seconds ago priceless_austin
```

As expected, file does not exist on new container. We created only on "myalpineshell" container. In fact, file is still there. Notice that this time, container was executed and exit status reflects an error code. It is the exit code of the execution of ls command against an inexistent file.

7 - Let's rename last executed
```
$ docker container rename $(docker container ls -ql) secondshell
```

8 - Now we create /tmp/TESTFILE file on our and we copy it to "secondshell" container.
```
$ touch /tmp/TESTFILE
$ docker container cp /tmp/TESTFILE secondshell:/tmp/TESTFILE
```

9 - Let's now start again "secondshell" container and observe results.
```
$ docker container start secondshell
secondshell

$ docker container ls -l
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
7c328b9a0609 alpine "ls -l /tmp/TESTFILE" 32 minutes ago Exited (0) 4 seconds ago secondshell
```

The file now exists on "secondshell" container and as a result execution exited correctly as we can notice on status column ("Exited (0)"). We have manipulated a "dead" container, copying a file inside. Therefore, containers are still present in our host system until we remove them.

10 - Now we remove "secondshell" container. We will try to filter container list output to search for removed and "myalpineshell" containers.
```
$ docker container rm secondshell
secondshell

$ docker container ls --all --filter name=myalpineshell --filter name=secondshell

CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
aa73504ba372 alpine "/bin/sh" 59 minutes ago Exited (0) 45 minutes ago myalpineshell
```

As expected we only get "myalpineshell" container.

11 - To finnish this lab we will start again "myalpineshell" using _docker container start -a -i_ to attach our command line interactively to container. Then we will get it running background using __"Ctrl+p+q"__ escape sequence and finally we will attach a second shell to container using docker container exec.
```
$ docker container start -a -i myalpineshell
/ # read escape sequence

$ docker container exec -ti myalpineshell sh
/ # ps -ef
PID USER TIME COMMAND
1 root 0:00 /bin/sh
6 root 0:00 sh
11 root 0:00 ps -ef
/ # exit
```

We can notice that exiting from new executed shell process does not kill myalpineshell container. It is a process executed using same namespaces, but it is not attached the main process inside container.
```
$ docker container ls --all --filter name=myalpineshell
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
aa73504ba372 alpine "/bin/sh" About an hour ago Up 4 minutes myalpineshell
```

## __Lab3__: Limiting Containers Resources

In this lab we are going to use "frjaraur/stress-ng:alpine" image from Docker Hub. It is an alpine based image built just with stress-ng and required alpine packages. It is small and will help us to stress our containers.

We will start stressing memory. On this labs, we will use two terminals on same host to launch _docker container stats_ on one of them. Keep it in execution during all these labs because it is where we are going to observe different behaviors.
We will launch 2 containers that will try to consume 2GB of memory. We will use _--vm 2 --vm-bytes 1024M_ to create 2 processes with 1024MB of memory each.

1 - We are going to launch a container with a memory reservation. This means that Docker Engine will reserve at least that amount of memory to container. Remember that this is not a limit, it is a reservation.
```
$ docker container run --memory-reservation=250m --name 2GBreserved -d
frjaraur/stress-ng:alpine --vm 2 --vm-bytes 1024M
b07f6319b4f9da3149d41bbe9a4b1440782c8203e125bd08fd433df8bac91ba7
```

2 - Now we will launch a limited container. Only 250MB of memory will be allowed, although container wants to consume 2GB:
```
$ docker container run --memory=250m --name 2GBlimited -d frjaraur/stress-ng:alpine --vm 2 --vm-bytes 1024M
e98fbdd5896d1d182608ea35df39a7a768c0c4b843cc3b425892bee3e394eb81
```

3 - On second terminal we will launch docker stats to review our containers resources consumption. We will show something like this (remember, IDs and usage will vary):
```
$ docker stats
CONTAINER ID NAME CPU % MEM USAGE / LIMIT MEM % NET I/O BLOCK I/O PIDS
b07f6319b4f9 2GBreserved 203.05% 1.004GiB / 11.6GiB 8.65% 6.94kB / 0B 0B / 0B 5
e98fbdd5896d 2GBlimited 42.31% 249.8MiB / 250MiB 99.94% 4.13kB / 0B 1.22GB / 2.85GB 5
```

We can notice that non-limited container is taking more than specified memory. It is not a limit in that case. On the other case, container is limited to 250MB although process could consume more. It is really limited and will not get more than that memory. It is confined to 250MB as we can observe on "MEM USAGE/LIMIT MEM" column. It could reach 100% of confined memory, but it can not overpass it.

4 - Remove "2GBreserved" and "2GBlimited" containers.
```
$ docker container rm -f 2GBlimited 2GBreserved
2GBlimited
2GBreserved
```

5 -In this case we will launch 3 containers. With different CPU limitations and processes
requirements

First Container - Limited to 1 CPU but with 2 CPUs requirement. It is not a real requirement, but process will try to use 2 CPUs if they exist on system.
```
$ docker container run -d --cpus=1 --name CPU2vs1 frjaraur/stress-ng:alpine --cpu 2 --timeout 120
```

Second Container - Limited to 2 CPUs with 2 CPUs requirement. It will try to use both during execution.
```
$ docker container run -d --cpus=2 --name CPU2vs2 frjaraur/stress-ng:alpine --cpu 2 --timeout 120
```

Third Container - Limited to 4 CPUs with 2 CPUs required. In this case processes could consume 4 CPUs, but as they will just use 2 CPUs they will not have a real limitation unless we try to use more than 4 CPUs.
```
$ docker container run -d --cpus=4 --name CPU2vs4 frjaraur/stress-ng:alpine --cpu 2 --timeout 120
```

6 - If we observe docker stats output we can confirm expected results.
```
$ docker stats
CONTAINER ID NAME        CPU % MEM USAGE / LIMIT  MEM %  NET I/O  BLOCK I/O  PIDS
0dc652ed28b0  CPU2vs4  132.47%  7.379MiB / 11.6GiB  0.06%  4.46kB / 0B  0B / 0B  3
ec62ee9ed812  CPU2vs2  135.41%  7.391MiB / 11.6GiB  0.06%  5.71kB / 0B  0B / 0B  3
bb1034c8b588  CPU2vs1  98.90%   7.301MiB / 11.6GiB  0.06%  7.98kB / 0B  262kB / 0B  3
```

## __Lab3__: Formatting and Filtering Container list Output

In this lab we will review docker container ls output.

1 - Launch some containers, for this example we will run 3 nginx:alpine instances with sequence names:
```
$ docker run -d --name web1 --label stage=production nginx:alpine
bb5c63ec7427b6cdae19f9172f5b0770f763847c699ff2dc9076e60623771da3

$ docker run -d --name web2 --label stage=development nginx:alpine
4e7607f3264c52c9c14b38412c95dfc8c286835fd1ffab1d7898c5cfab47c9b8

$ docker run -d --name web3 --label stage=development nginx:alpine
fcef82c80ed0b049705609885bc9c518bf062a39bbe2b6d68b7017bcc6dcaa14
```

2 - Let's list running containers using docker container ls default output:
```
$ docker container ls
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
fcef82c80ed0 nginx:alpine "nginx -g 'daemon of..." About a minute ago Up 59 seconds 80/tcp web3
4e7607f3264c nginx:alpine "nginx -g 'daemon of..." About a minute ago Up About a minute 80/tcp web2
bb5c63ec7427 nginx:alpine "nginx -g 'daemon of..." About a minute ago Up About a minute 80/tcp web1
```

3 - As we want to be able to review current stage of containers, we can format output to include labels information:
```
$ docker container ls --format "table {{.Names}} {{.Command}}\\t{{.Labels}}"
NAMES COMMAND LABELS
web3 "nginx -g 'daemon of..."  maintainer=NGINX Docker Maintainers <docker-maint@nginx.com>,stage=development
web2 "nginx -g 'daemon of..."  stage=development,maintainer=NGINX Docker Maintainers <docker-maint@nginx.com>
web1 "nginx -g 'daemon of..."  stage=production,maintainer=NGINX Docker Maintainers <docker-maint@nginx.com>
```

4 - Let's filter now only development containers:
```
$ docker container ls --format "table {{.Names}} {{.Command}}\\t{{.Labels}}" --filter label=stage=development
NAMES COMMAND LABELS
web3 "nginx -g 'daemon of..." maintainer=NGINX Docker Maintainers <docker-maint@nginx.com>,stage=development
web2 "nginx -g 'daemon of..." maintainer=NGINX Docker Maintainers <docker-maint@nginx.com>,stage=development
```

5 - Let's kill now only develpoment containers:
```
$ docker container kill $(docker container ls --format "{{.ID}}" --filter label=stage=development)

$ docker container ls --format "table {{.Names}}\\t{{.Labels}}"
NAMES LABELS
web1  maintainer=NGINX Docker Maintainers <docker-maint@nginx.com>,stage=production
```

Only web1, labelled as "production", is still running as we expected.
