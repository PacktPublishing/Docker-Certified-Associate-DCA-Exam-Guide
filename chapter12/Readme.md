# Chapter 12

## Previous requirements
In this chapter we will learn Docker Swarm orchestrator features. We provide some labs at the end of the chapter that will help you understand and learn shown concepts. These labs can be run on your laptop or PC using the provided vagrant Docker Enterprise environment or any already deployed Docker Enteprise cluster at your own. Check additional information in this book's github code repository available in this link https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git.

You will need at least (all labs were tested on Linux and Windows):

    - Internet connection.
    - Some Linux, MacOS or Windows basic skills to edit files (using Notepad, Vim, Emacs or any other editor).
    - Git command-line, Vagrant and Virtualbox installed on your PC or laptop.
    - Already cloned book' s repository https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git.
    - Enough hardware resources: 2vCPU, 6GB of RAM per node (4 nodes) and 120 GB of available disk space on your hard drive for all nodes.

Extended instructions can be found on Github book's repository. These labs will use "environments/enterprise" folder for the creation of the virtual environment and "chapter12" folder.
>NOTE: To clone book' s repository https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git, prepare a directory on your laptop or PC and execute git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git. This will download all required files on your current folder.

All labs will start executing vagrant up  using your command-line from the environment directory "environments/enterprise". This command will start all the required nodes for you. If you are using your own Docker Enterprise cluster, you can use "chapter12" folder. Ask your Docker administrator for the cluster-required credentials for your environment to execute the provided labs.

Once all environment nodes are up and running, go to "chapter12" folder and follow each lab instructions.

After completed the labs (__chapters 12 and 13 labs require a running UCP environment__), you can use vagrant destroy -f from "environments/enterprise" directory to completely remove all the lab-deployed nodes and free your disk.

### Following labs can be found under chapter12 directory.


---

Before starting these labs, ensure all your nodes are up and running using _vagrant status_.

```
Docker-Certified-Associate-DCA-Exam-Guide/environments/enterprise$ vagrant status
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
 ```
---
>__NOTE: These labs require an already running Docker Entreprise platform. It is recommended to execute these labs after chapter11 because we learned in that chapter how to deploy Docker Entperise platform. If you have not destroyed your enterprise labs environment, you wil have a Docker Enteprise platform already to deploy these labs.__
---


## __Lab1__: Enable Interlock and verify its components.

In this lab we will enable Interlock on Docker Enterprise cluster and we will review its components. Interlock's components were described in chapter 12.

>NOTE: For easy access, add "192.168.56.11 ucp.vagrant.labs" to your hosts file. This will help us accessing UCP directly. We prepared the environment with internal resolution. It will work for you.

1 - Connect to our already deployed Docker Enterprise's UCP's Web UI. If you are using the provided Vagrant environment your UCP Web UI will be accesible in https://ucp.vagrant.labs (we haven't used any external load balancer for these labs, therefore this FQDN points to first node's IP address). If you haven't changed installation's "admin" user's password it will be "changeme". We will get into "admin" > "Admin Settings" configuration settings. Notice that "Admin Settings" menu will be available to any UCP's administrator user. In fact you will find these settings inside each administrator's username menu.

You will get a warning message because we are using autosigned-certificates if you didn't accept them yet. We will trust this certificate or simple follow your browser instructions to accept the risk and continue to our UCP's URL.

![UCP Warning](../images/UCP_Warning.png)

Login page will appear and we will use "admin" username and its password (defined during installation).

![UCP Login](../images/UCP_Login.png)

We will have access to UCP's Dashboard.

![UCP Dashboard](../images/UCP_Dashboard.png)

We will click on admin's username and we will get into "Admin Settings" endpoint.

![UCP Admin_Settings](../images/Interlock_admin.png)

Then we will navigate to "Layer 7 Routing (Interlock)" features and we will enable "Layer 7 Routing"

![UCP Dashboard](../images/Interlock_enabled.png)

2 - Once Interlock is enabled, its services will be visible and running in our cluster. Let's connect to the cluster using UCP's admin's bundle. If you are not sure how to use this feature, please review chapter 11 labs section (Lab2). If you followed chapter 11 labs, your___ node has already downloaded your UCP's admin's bundle. We will now load UCP's environment in our session:


 ```
Docker-Certified-Associate-DCA-Exam-Guide/environments/enterprise$ vagrant ssh enterprise-node1
--------------------------------------------------------------------------------------------
 DOCKER ENTERPRISE Vagrant Environment
 Engine Version: current
--------------------------------------------------------------------------------------------
....
....

vagrant@enterprise-node3:~$

vagrant@enterprise-node3:~$ cd ~/admin-bundle/

vagrant@enterprise-node3:~/admin-bundle$ source env.sh

vagrant@enterprise-node3:~/admin-bundle$ cd 
```

3 - We list deployed services to find out Interlock's components:
```
vagrant@enterprise-node3:~/admin-bundle$ docker service ls
ID                  NAME                      MODE                REPLICAS            IMAGE                                  PORTS
mcyb2zg252az        ucp-auth-api              global              3/3                 docker/ucp-auth:3.2.5                  
jvbj9jrlvc02        ucp-auth-worker           global              3/3                 docker/ucp-auth:3.2.5                  
xfbvp7q9athi        ucp-cluster-agent         replicated          1/1                 docker/ucp-agent:3.2.5                 
xs5bti3gq0dt        ucp-interlock             replicated          1/1                 docker/ucp-interlock:3.2.5             
mqfep3upef2i        ucp-interlock-extension   replicated          1/1                 docker/ucp-interlock-extension:3.2.5   
kkv97z498ayk        ucp-interlock-proxy       replicated          2/2                 docker/ucp-interlock-proxy:3.2.5       *:8080->80/tcp, *:8443->443/tcp
k67fzi3o1u9s        ucp-manager-agent         global              3/3                 docker/ucp-agent:3.2.5                 
k6auso5rqq3l        ucp-worker-agent-win-x    global              0/0                 docker/ucp-agent-win:3.2.5             
tpvwjk76p8me        ucp-worker-agent-x        global              1/1                 docker/ucp-agent:3.2.5                 
```

Notice that only __ucp-interlock-proxy__ component is published. As we learned this component is a reverse proxy and it should be able to access requests from users. By default, ports 8080 and 8443 wil be used for HTTP and HTTPS communications, respectively. These ports can be changed from "Layer 7 Routing (Interlock)" page.

```
vagrant@enterprise-node3:~/admin-bundle$ docker service ps ucp-interlock-proxy
ID                  NAME                    IMAGE                              NODE                DESIRED STATE       CURRENT STATE               ERROR               PORTS
zenue531bzbm        ucp-interlock-proxy.1   docker/ucp-interlock-proxy:3.2.5   enterprise-node1    Running             Running about an hour ago                       
p7vodxikfdww        ucp-interlock-proxy.2   docker/ucp-interlock-proxy:3.2.5   enterprise-node4    Running             Running about an hour ago                       
v
```

__ucp-interlock-proxy__ component will deploy more than one instance for better performance while __ucp-interlock__ and __ucp-interlock-extension__ will run just one replica. __ucp-interlock__ only runs on manager nodes because it requires access to UCP's API.

NOTE: There are several configurations that can improve Interlock's security for production environments. Please take a look at [Configure layer 7 routing for production](https://docs.docker.com/ee/ucp/interlock/deploy/production/) for best practices.

4 - Router Mesh allows us to access __ucp-interlock-proxy__ from any UCP's cluster node. Therefore, we can access even locally although this component is not running on enterprise-node3.
```
vagrant@enterprise-node3:~/admin-bundle$ curl 0.0.0.0:8080
<!DOCTYPE html>
<html>
<head>
<title>Error</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>An error occurred.</h1>
<p>Sorry, the page you are looking for is currently unavailable.<br/>
Please try again later.</p>
<p>If you are the system administrator of this resource then you should check
the <a href="http://nginx.org/r/error_log">error log</a> for details.</p>
<p><em>Faithfully yours, nginx.</em></p>
</body>
</html>
```

Service is up and running but we haven't defined any default service.

5 - Let's define a stack with a simple service to get all default traffic (without any specific header). For these labs we will deploy the simple "COLORS" application, used on different chapters in this book. It is quite simple but it can give us a good idea for more complex deployments. Let's define a black page as default for Interlock.
We will create a [default-color.stack.yaml](./default-color.stack.yaml) using your favorite editor on node enterprise-node3 with the following content:
```
version: "3.2"
services:
  black:
    image: codegazers/colors:1.16
    environment:
      COLOR: "black"
    deploy:
      replicas: 1
      labels:
        com.docker.lb.default_backend: "true"
        com.docker.lb.port: 3000
    networks:
      - black-network

networks:
  black-network:

```

>__NOTE: You can also clone [Docker-Certified-Associate-DCA-Exam-Guide](https://github.com/frjaraur/Docker-Certified-Associate-DCA-Exam-Guide.git) books' Github code repository.__
>


>__NOTE: We can also use this simple trick:__
>
>```
>cat <<-EOF>default-color.stack.yaml
>version: "3.2"
>
>services:
>  black:
>    image: codegazers/colors:1.16
>    environment:
>      COLOR: "black"
>    deploy:
>      replicas: 1
>      labels:
>        com.docker.lb.default_backend: "true"
>        com.docker.lb.port: 3000
>    networks:
>      - black-network
>
>networks:
>  black-network:
>
>EOF
>```


6 - We now create this default stack.
```
vagrant@enterprise-node3:~$ docker stack deploy -c default-color.stack.yaml default
Creating network default_black-network
Creating service default_black
```
We can review "default" stack either using Web UI or command-line:

![UCP Dashboard](../images/Interlock_default_stack.png)

```
vagrant@enterprise-node3:~$ docker stack ls
NAME                SERVICES            ORCHESTRATOR
default             1                   Swarm
vagrant@enterprise-node3:~$ docker stack ps default 
ID                  NAME                IMAGE                    NODE                DESIRED STATE       CURRENT STATE           ERROR               PORTS
lx0rp9cj9zuw        default_black.1     codegazers/colors:1.16   enterprise-node4    Running             Running 7 minutes ago                       
vagrant@enterprise-node3:~$ 
```

Notice that default_black service is deployed on node enterprise-node4. This node has less workloads because it is a worker node and UCP's core components are running on manager nodes.

7 - We can now review default page executing ___curl___ again:
```
vagrant@enterprise-node3:~$ curl 0.0.0.0:8080/                      
<html>
<head>
    <title>black</title>
    <meta charset="utf-8" />
    <style>
        body {
            background-color: black;
        }
        .center {
            padding: 70px 0;
        }
        h2 {
            color: grey;
            text-align: left;
            font-family: "Sans-serif", Arial;
            font-style: oblique;
            font-size: 14px;
        }
        table {
            border-collapse: collapse;
            margin-left:auto; 
            margin-right:auto;
            background-color: #F0F8FF;
        }

        table, th, td {
            border: 1px solid black;
            
        }
        tr:hover {background-color: #DCDCDC}

        p.padding {
            padding-top: 2cm;
        }
    </style>
</head>
<body>
<div class="center">
    <table style="float:center" >
        <tr><td>Container IP:</td><td> 10.0.12.10 172.18.0.5</td></tr>
        <tr><td>Client IP:</td><td>undefined</td></tr>
        <tr><td>Container Name:</td><td>cb9fe97655c3</td></tr>
        <tr><td>Color:</td><td>black</td></tr>
        <tr><td>Application Version:</td><td>1.20</td></tr>
    </table>
</div>
</body>

</html>
</body>
</html>
```

There is "/text" endpoint in this application that show results easier:
```
vagrant@enterprise-node3:~$ curl 0.0.0.0:8080/text
APP_VERSION: 1.20
COLOR: black
CONTAINER_NAME: cb9fe97655c3
CONTAINER_IP:  10.0.12.10 172.18.0.5
CLIENT_IP: 10.0.0.4
CONTAINER_ARCH: linux
```

## __Lab2__: Simple application publishing for specific host headers.

In this lab we will use Interlock deploying an application with specific host headers. This is the normal behavior and allows us to deploy multiple applications using just one published service (interlock-proxy) within the cluster. This improves security and applications management.

1 - Let's deploy a COLORS application with 3 replicas. In this case we will deploy random colors backends, leaving COLORS variable empty.
We will create a [colors.stack.yaml](./colors.stack.yaml) using your favorite editor on node enterprise-node3 with the following content:
```
version: "3.2"
services:
  colors:
    image: codegazers/colors:1.16
    deploy:
      replicas: 3
      labels:
        com.docker.lb.hosts: colors.lab.local
        com.docker.lb.network: colors-network
        com.docker.lb.port: 3000
    networks:
      - colors-network

networks:
  colors-network:
```

2 - We deploy this new stack and review how interlock changed.
```
vagrant@enterprise-node3:~$ docker stack deploy -c colors.stack.yaml colors
Creating network colors_colors-network
Creating service colors_colors

vagrant@enterprise-node3:~$ curl 0.0.0.0:8080/text
APP_VERSION: 1.20
COLOR: black
CONTAINER_NAME: cb9fe97655c3
CONTAINER_IP:  10.0.12.10 172.18.0.5
CLIENT_IP: 10.0.0.4
CONTAINER_ARCH: linux
```

As expected, default backend has not changed. We will need to use defined specific header.

3 - Let's try now using "colors.lab.local" host header:
```
vagrant@enterprise-node3:~$ curl -H "host: colors.lab.local" 0.0.0.0:8080/text
APP_VERSION: 1.20
COLOR: yellow
CONTAINER_NAME: a980afe726a4
CONTAINER_IP:  10.0.14.3 172.18.0.6
CLIENT_IP: 10.0.0.4
CONTAINER_ARCH: linux

vagrant@enterprise-node3:~$ curl -H "host: colors.lab.local" 0.0.0.0:8080/text
APP_VERSION: 1.20
COLOR: yellow
CONTAINER_NAME: a980afe726a4
CONTAINER_IP:  10.0.14.3 172.18.0.6
CLIENT_IP: 10.0.0.4
CONTAINER_ARCH: linux

vagrant@enterprise-node3:~$ curl -H "host: colors.lab.local" 0.0.0.0:8080/text
APP_VERSION: 1.20
COLOR: grey
CONTAINER_NAME: a63603b6eb92
CONTAINER_IP:  10.0.14.4 172.18.0.3
CLIENT_IP: 10.0.0.4
CONTAINER_ARCH: linux

vagrant@enterprise-node3:~$ curl -H "host: colors.lab.local" 0.0.0.0:8080/text
APP_VERSION: 1.20
COLOR: grey
CONTAINER_NAME: a63603b6eb92
CONTAINER_IP:  10.0.14.4 172.18.0.3
CLIENT_IP: 10.0.0.4
CONTAINER_ARCH: linux

vagrant@enterprise-node3:~$ curl -H "host: colors.lab.local" 0.0.0.0:8080/text
APP_VERSION: 1.20
COLOR: white
CONTAINER_NAME: 7af627b31d04
CONTAINER_IP:  10.0.14.5 172.19.0.4
CLIENT_IP: 10.0.0.4
CONTAINER_ARCH: linux
vagrant@enterprise-node3:~$ 
```

We get different "COLORS" application's backends (yellow, grey and white). It wors as expected.

>NOTE: We can test "COLORS" applications' deployments using our web browser and either modifying requests headers with some browser extensions or add FQDN application's entries in our __hosts__ file using 192.168.56.11 (internal host-to-VM IP address). Anyway, it is easier to use curl with "/text" endpoint because "COLORS" application is prepared for these labs.

4 - We can remove this stack using ___docker stack rm___:
```
vagrant@enterprise-node3:~$ docker stack rm colors
Removing service colors_colors
Removing network colors_colors-network
Failed to remove network 4kmv0mzre5432o79je0b63rve: Error response from daemon: Error response from daemon: rpc error: code = FailedPrecondition desc = network 4kmv0mzre5432o79je0b63rve is in use by service kkv97z498ayk9nv7pnu4xf8t8Failed to remove some resources from stack: colors
```

Notice the error received. This is very interesting and a normal behavior using Interlock. This error means that interlock-proxy service is attached to our application's network. This is the normal behavior as we described in chapter 12. We will execute doker stack rm some seconds after getting this error because Interlock will notice the changes and automatically interlock-proxy will be reloaded, freeing application's network.

```
vagrant@enterprise-node3:~$ docker stack rm colors
Removing network colors_colors-network
vagrant@enterprise-node3:~$ 
```

Let's deploy something more complicated.

## __Lab3__: Simple application redirection.

In this lab we will enable redirection for .