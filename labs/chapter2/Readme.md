# Chapter 2


## Technical requirements

In this chapter we will learn Docker Engine concepts. We provide some labs at the end of the chapter that will help you understand and learn shown concepts. These labs can be run on your laptop or PC using the provided vagrant standalone environment or any already deployed Docker host at your own.

You will need at least (all labs were tested on Linux and Windows):
    
- Internet connection.    
    
- Some Linux, MacOS or Windows basic skills to edit files (using Notepad, Vim, Emacs or any other editor).
    
- Git command-line, Vagrant and Virtualbox installed on your PC or laptop.
    
- Already cloned book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git).

- Enough hardware resources: 1vCPU, 3GB of RAM and 10 GB of available disk space on your hard drive for virtual nodes.

Extended instructions can be found on Github book's repository. These labs will use "environments/standalone-environment" folder for the creation of the virtual environment and "labs/chapter2" folder.
To clone book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git), prepare a directory on your laptop or PC and execute git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git. This will dowload all required files on your current folder.

All labs will start executing vagrant up  using your command-line from the environment directory "environments/standalone-environment". This command will start all the required nodes for you. If you are using your own Docker host, you can move directly to "labs/chapter2" folder.

Once all environment nodes are up and running, go to "labs/chapter2" folder and follow each lab instructions.

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

### Following labs can be found under labs/chapter2 directory.


---
## __Lab1__: Docker build caching

This lab will show us how caching works when building images. We will be able to speed up the building process, but it will depend on how the image layers are sorted.

1 - First, create a directory named chapter2 in your home directory on your Docker host. We will use this directory for these labs:
```
cd $HOME
mkdir chapter2
cd chapter2
```

2 - Create a file named [Dockerfile.cache](./Dockerfile.cache) with the following simple content:
```
FROM alpine:latest
RUN echo "hello world"
```

3 - Now, build an image named test1 using this directory as an image context:
```
[vagrant@standalone chapter2]$ docker image build --file Dockerfile.cache --no-cache \
--label lab=lab1 -t test1 .

 Sending build context to Docker daemon 2.048kB
 Step 1/2 : from alpine:latest
 ---> 961769676411
 Step 2/2 : run echo "hello world"
 ---> Running in af16173c7af8
 hello world
 Removing intermediate container af16173c7af8
 ---> 9b3e0608971f
 Successfully built 9b3e0608971f
 Successfully tagged test1:latest
```

4 - As we have not used any specific tag, Docker adds latest. Now, rebuild the image without any changes:
```
[vagrant@standalone chapter2]$ docker image build --file Dockerfile.cache --no-cache \
--label lab=lab1 -t test2 .

 Sending build context to Docker daemon 2.048kB
 Step 1/2 : from alpine:latest
 ---> 961769676411
 Step 2/2 : run echo "hello world"
 ---> Running in 308e47ddbf7a
 hello world
 Removing intermediate container 308e47ddbf7a
 ---> aa5ec1fe2ca6
 Successfully built aa5ec1fe2ca6
 Successfully tagged test2:latest
```

5 - Now, we list our images using the lab label we created during the build:
```
[vagrant@standalone chapter2]$ docker image ls --filter label=lab=lab1
 REPOSITORY          TAG                 IMAGE ID            CREATED              SIZE
 test2               latest              fefb30027241        About a minute ago   5.58MB
 test1               latest              4fe733b3db42        About a minute ago   5.58MB
 ```

We notice that although we have not changed anything, the image ID is different. This is because we have avoided layer caches and we have always compiled each layer. Because we launched image buildings one after the other, only a few seconds passed between them. However, the meta-information has changed between them and they have different IDs, but the same content. 

6 - Now, we will use caching because it will improve the build time and, in many situations, this can be a big difference. Let's add just a line for installing Python on our Dockerfile.cache file. Updating the package cache and the Python installation with its dependencies will take some time. When we use cached layers, created from previous builds, the building process will be quicker [Dockerfile.cache.step6](./Dockerfile.cache.step6):
```
FROM alpine:latest
RUN echo "hello world"
RUN apk add --update -q python
```

7 - Now, we build again without caching, measuring how many seconds it took for the process to complete:
```
[vagrant@standalone chapter2]$ time docker image build --file Dockerfile.cache.step6 -q -t test3 --no-cache .
 sha256:f2b524ac662682bdc13f77216ded929225d1b4253ebacb050f07d6d7e570bc51
 
 real    0m8.508s
 user    0m0.021s
 sys     0m0.042s
```

8 - Now, add a new line for adding httpie, which needs Python (and the package cache) to be installed. Let's now run the build with and without caching [Dockerfile.cache.step8](./Dockerfile.cache.step8):
```
FROM alpine:latest
RUN echo "hello world"
RUN apk add --update -q python
RUN apk add -q httpie
```

Without caching, it will take more than a minute:

```
[vagrant@standalone chapter2]$ time docker image build --file Dockerfile.cache.step8 -q -t test4 --no-cache .  
 sha256:b628f57340b34e7fd2cba0b50f71f4269cf8e8fb779535b211dd668d7c21912f
real    1m28.745s
 user    0m0.023s
 sys     0m0.030s
```

>NOTE: Before launching a new build with caching, we removed the test4 image using ___docker image rm test4___ because we just wanted to use previous layers.

Using caching, it will just take a few seconds:
```
[vagrant@standalone chapter2]$ time docker image build --file Dockerfile.cache.step8 -q -t test5 .
 sha256:7bfc6574efa9e9600d896264955dcb93afd24cb0c91ee5f19a8e5d231e4c31c7
real 0m15.038s
 user 0m0.025s
 sys 0m0.025s
```

As this process has used the previous cached layers, it only took 15 seconds (test4, without caching, took 1 minute and 28 seconds to build). We have just added one layer and, to install just one package, we got more than 1 minute of difference even though the images are small (around 100 MB in size). It can take hours to compile 5 GB images (which is not recommended but it is a good approach for caching).

## __Lab2__: Where to use volumes in Dockerfiles

In this lab, we will review how the VOLUME key definition will be managed by Docker Daemon to specify a persistent storage or to avoid container space when building.

1 - Let's consider a small Dockerfile using a volume to persist data between layers when building. The volume definition will also inform Docker Daemon about bypassing the volume directory from the CoW mechanism. We will name this Dockerfile [Dockerfile.chapter2.lab2](./Dockerfile.chapter2.lab2):
```
FROM alpine
RUN mkdir /data
RUN echo "hello world" > /data/helloworld
VOLUME /data
```

2 - Let's build this image: 
```
[vagrant@standalone ~]$ docker image build \
-f Dockerfile.chapter2.lab2 -t ch2lab2 --label lab=lab2 .

 Sending build context to Docker daemon  3.072kB
 Step 1/5 : FROM alpine
 ---> 961769676411
 Step 2/5 : RUN mkdir /data
 ---> Running in fc194efe122b
 Removing intermediate container fc194efe122b
 ---> d2d208a0c39e
 Step 3/5 : RUN echo "hello world" > /data/helloworld
 ---> Running in a390abafda32
 Removing intermediate container a390abafda32
 ---> b934d9c51292
 Step 4/5 : VOLUME /data
 ---> Running in 33df48627a75
 Removing intermediate container 33df48627a75
 ---> 8f05e96b072b
 Step 5/5 : LABEL lab=lab2
 ---> Running in 353a4ec552ef
 Removing intermediate container 353a4ec552ef
 ---> 4a1ad6047fea
 Successfully built 4a1ad6047fea
 Successfully tagged ch2lab2:latest
```

3 - Now, run a container using the _ch2lab2_ image to retrieve the container's /data directory content:
```
[vagrant@standalone ~]$ docker container run ch2lab2 ls -lt /data
 total 4
 -rw-r--r--    1 root     root            12 Oct  7 19:30 helloworld
```

4 - Now, we will change the VOLUME instruction order. We write the VOLUME definition before the echo execution. We will use a new file named [Dockerfile.chapter2.lab2-2](./Dockerfile.chapter2.lab2-2):
```
FROM alpine
RUN mkdir /data
VOLUME /data
RUN echo "hello world" > /data/helloworld
```

5 - Now, let's build a new image and review what happened with /data content:
```
[vagrant@standalone ~]$ docker image build \
-f Dockerfile.chapter2.lab2-2 -t ch2lab2-2 --label lab=lab2 .

 Sending build context to Docker daemon  4.096kB
 Step 1/5 : FROM alpine
 ---> 961769676411
 Step 2/5 : RUN mkdir /data
 ---> Using cache
 ---> d2d208a0c39e
 Step 3/5 : VOLUME /data
 ---> Using cache
 ---> 18022eec6fd2
 Step 4/5 : RUN echo "hello world" > /data/helloworld
 ---> Using cache
 ---> dbab99bb29a0
 Step 5/5 : LABEL lab=lab2
 ---> Using cache
 ---> ac8ef5e1b61e
 Successfully built ac8ef5e1b61e
 Successfully tagged ch2lab2-2:latest
```

6 - Let's review the _/data_ content again:
```
[vagrant@standalone ~]$ docker container run ch2lab2-2 ls -lt /data                                                                        
 total 0
```

As we expected, the __VOLUME__ directive allows containers to bypass the CoW filesystem, and during builds, containers will not maintain volume content because the commit action will just transform container content into images, and volumes are not inside containers. 

## __Lab3__: Multistage building

In this lab, we will create a simple hello world binary in C and use an intermediate image to compile this code in the first stage and then copy the binary to a cleaner image. As a result, we will obtain a small image containing just the required components to run our compiled application.

1 - Create a new directory named multistage inside the chapter2 directory:
```
[vagrant@standalone ~]$ cd $HOME/chapter2
[vagrant@standalone ~]$ mkdir multistage
[vagrant@standalone ~]$ cd multistage
```

2 - Now, create a [helloword.c](./helloworld.c) file with the following content:
```
#include <stdio.h>
 int main()
 {
   printf("Hello, World!\n");
   return 0;
 }
```

3 - Prepare a multistage Dockerfile based on alpine with the name [Dockerfile.multistage](./Dockerfile.multistage). The first stage will be named compiler and in it, we will install alpine-sdk to compile C code. We compile in the first stage and we just use a COPY sentence to copy binary from the previous stage. It will look like this:
```
FROM alpine AS compiler 
RUN apk update && \ 
apk add --update -q --no-cache alpine-sdk 
RUN mkdir /myapp 
WORKDIR /myapp 
ADD helloworld.c /myapp 
RUN mkdir bin 
RUN gcc -Wall helloworld.c -o bin/helloworld 
 
FROM alpine 
COPY --from=compiler /myapp/bin/helloworld /myapp/helloworld 
CMD /myapp/helloworld
```

Using the previous code, we will build a new image:
```
[vagrant@standalone multistage]$ docker build \
--file Dockerfile.multistage --no-cache -t helloworld --label lab=lab3 .

 Sending build context to Docker daemon  3.072kB
 Step 1/11 : FROM alpine AS compiler
 ---> 961769676411
 Step 2/11 : RUN apk update && apk add --update -q --no-cache alpine-sdk
 ---> Running in f827f4a85626
 fetch http://dl-cdn.alpinelinux.org/alpine/v3.10/main/x86_64/APKINDEX.tar.gz
 fetch http://dl-cdn.alpinelinux.org/alpine/v3.10/community/x86_64/APKINDEX.tar.gz
 v3.10.2-102-ge3e3e39529 [http://dl-cdn.alpinelinux.org/alpine/v3.10/main]
 v3.10.2-103-g1b5ddad804 [http://dl-cdn.alpinelinux.org/alpine/v3.10/community]
 OK: 10336 distinct packages available
 Removing intermediate container f827f4a85626
 ---> f5c469c3ab61
 Step 3/11 : RUN mkdir /myapp
 ---> Running in 6eb27f4029b3
 Removing intermediate container 6eb27f4029b3
 ---> 19df6c9092ba
 Step 4/11 : WORKDIR /myapp
 ---> Running in 5b7e7ef9504a
 Removing intermediate container 5b7e7ef9504a
 ---> 759173258ccb
 Step 5/11 : ADD helloworld.c /myapp
 ---> 08033f10200a
 Step 6/11 : RUN mkdir bin
 ---> Running in eaaff98b5213
 Removing intermediate container eaaff98b5213
 ---> 63b5d119a25e
 Step 7/11 : RUN gcc -Wall helloworld.c -o bin/helloworld
 ---> Running in 247c18ccaf03
 Removing intermediate container 247c18ccaf03
 ---> 612d15bf6d3c
 Step 8/11 : FROM alpine
 ---> 961769676411
 Step 9/11 : COPY --from=compiler /myapp/bin/helloworld /myapp/helloworld
 ---> 18c68d924646
 Step 10/11 : CMD /myapp/helloworld
 ---> Running in 7055927efe3e
 Removing intermediate container 7055927efe3e
 ---> 08fd2f42bba9
 Step 11/11 : LABEL lab=lab3
 ---> Running in 3a4f4a1ad6d8
 Removing intermediate container 3a4f4a1ad6d8
 ---> 0a77589c8ecb
 Successfully built 0a77589c8ecb
 Successfully tagged helloworld:latest 
```

4 - We can now verify that helloworld:latest works as expected and it will just contain the /myapp/helloworld binary on top of a clean alpine:latest image:
```
[vagrant@standalone multistage]$ docker container run helloworld:latest
 Hello, World! 
```

We will now list the images to review the image created recently:
```
[vagrant@standalone multistage]$ docker image ls --filter label=lab=lab3
 REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
 helloworld          latest              0a77589c8ecb        2 minutes ago       5.6MB
 ```

## __Lab4__: Deploying a local registry

In this lab, we will run a local registry and push/pull an image.

1 -  We first deploy a registry using the official Docker Registry image. We will launch it on the standard registry port 5000:
```
[vagrant@standalone ~]$ cd $HOME/chapter2

[vagrant@standalone ~]$ docker container run -d \
-p 5000:5000 --restart=always --name registry registry:2
....
....
0d63bdad4017ce925b5c4456cf9f776551070b7780f306882708c77ce3dce78c
```

2 - Then, we download a simple alpine:latest image (if you don't already have one):
```
[vagrant@standalone ~]$ docker pull alpine
Using default tag: latest
latest: Pulling from library/alpine
e6b0cf9c0882: Pull complete 
Digest: sha256:2171658620155679240babee0a7714f6509fae66898db422ad803b951257db78
Status: Downloaded newer image for alpine:latest
docker.io/library/alpine:latest
```
    
3 - We then add a new tag to this image to be able to upload it to our local registry running on port 5000:
```
[vagrant@standalone ~]$ docker tag alpine localhost:5000/my-alpine
```

4 - Then, we push to our local registry:
```
[vagrant@standalone ~]$ docker image push localhost:5000/my-alpine
The push refers to repository [localhost:5000/my-alpine]
6b27de954cca: Pushed 
latest: digest: sha256:3983cc12fb9dc20a009340149e382a18de6a8261b0ac0e8f5fcdf11f8dd5937e size: 528
```

5 - To ensure that no other alpine image is present, we remove it by its ID:
```
[vagrant@standalone ~]$ docker images --filter=reference='alpine:latest' 
REPOSITORY TAG IMAGE ID CREATED SIZE
alpine latest cc0abc535e36 42 hours ago 5.59MB
```

6 - We remove this ID and all its children (IDs may vary):
```
[vagrant@standalone ~]$ docker image rm cc0abc535e36 --force
Untagged: alpine:latest
Untagged: alpine@sha256:2171658620155679240babee0a7714f6509fae66898db422ad803b951257db78
Untagged: localhost:5000/my-alpine:latest
Untagged: localhost:5000/my-alpine@sha256:3983cc12fb9dc20a009340149e382a18de6a8261b0ac0e8f5fcdf11f8dd5937e
Deleted: sha256:cc0abc535e36a7ede71978ba2bbd8159b8a5420b91f2fbc520cdf5f673640a34
```

7 - Then, we run a container using the localhost:5000/my-alpine:latest image:
```
[vagrant@standalone ~]$ docker container run localhost:5000/my-alpine:latest ls /tmp
Unable to find image 'localhost:5000/my-alpine:latest' locally
latest: Pulling from my-alpine
e6b0cf9c0882: Already exists 
Digest: sha256:3983cc12fb9dc20a009340149e382a18de6a8261b0ac0e8f5fcdf11f8dd5937e
Status: Downloaded newer image for localhost:5000/my-alpine:latest
```

We used the image downloaded from our localhost:5000 registry.

8 - Finally, we remove the registry deployed:
```
[vagrant@standalone ~]$ docker container rm --force registry
registry
```

## __Lab4__: Deploying a local registry

This lab will show us how we can build images for different environments by adding some debugging tools, for example, to debug a container's processes.

Create a new directory named templating inside the chapter2 directory:

[vagrant@standalone ~]$ cd $HOME/chapter2
[vagrant@standalone ~]$ mkdir templating
[vagrant@standalone ~]$ cd templating

We will have a couple of images, one for production and one for development. We will build each one with its own Dockerfile; in this case, we will use a simple nginx:alpine image as the basis for both:

- [Development—Dockerfile.nginx-dev](./Development—Dockerfile.nginx-dev):
```
FROM nginx:alpine 
RUN apk update -q
RUN apk add \ 
curl \ 
httpie
```

- [Production—Dockerfile.nginx](./Production—Dockerfile.nginx):
```
FROM nginx:alpine 
RUN apk update -q
```

Let's build both the images:

1 - We build both images as baseimage:development and baseimage:production:
```
[vagrant@standalone templating]$ docker image build \
--quiet --file Dockerfile.nginx-dev -t baseimage:development --label lab=lab4 .     
            
 sha256:72f13a610dfb1eee3332b87bfdbd77b17f38caf08d07d5772335e963377b5f39
 
[vagrant@standalone templating]$ docker image build \
 --quiet --file Dockerfile.nginx -t baseimage:production --label lab=lab4 .

 sha256:1fc2505b3bc2ecf3f0b5580a6c5c0f018b03d309b6208220fc8b4b7a65be2ec8
```

2 - We can review the image sizes and these are pretty different because the debugging image has curl and httpie for testing (this is an example lab). We will use these images to launch debugging tools to review a container's processes or against other components:
```
[vagrant@standalone templating]$ docker image ls --filter label=lab=lab4                                                                 
 REPOSITORY       TAG         IMAGE ID      CREATED              SIZE
 baseimage    development   72f13a610dfb  13 seconds ago       83.4MB
 baseimage     production   1fc2505b3bc2  4 minutes ago        22.6MB
```

3 - Now, we can build our application image for development and production environments using the ENVIRONMENT variable and a templated [Dockerfile.application](./Dockerfile.application):
```
ARG ENVIRONMENT=development 
FROM baseimage:${ENVIRONMENT} 
COPY html/* /usr/share/nginx/html
```

4 - Now, we simply prepare a simple text file named index.html with some content inside the html directory:
```
[vagrant@standalone templating]$ mkdir html

[vagrant@standalone templating]$ echo "This is a simple test and of course it is not an application!!!" > html/index.html
```

5 - Finally, we just compile both images for the DEV and PROD environments. For development, we use the ENVIRONMENT argument as follows: 
```
[vagrant@standalone templating]$ docker image build \
--file Dockerfile.application \
-t templated:production \
--build-arg ENVIRONMENT=development \
--label lab=lab4 .
 Sending build context to Docker daemon  5.632kB
 Step 1/4 : ARG ENVIRONMENT=development
 Step 2/4 : FROM baseimage:${ENVIRONMENT}
 ---> 1fc2505b3bc2
 Step 3/4 : COPY html/* /usr/share/nginx/html
 ---> Using cache
 ---> e038e952a087
 Step 4/4 : LABEL lab=lab4
 ---> Running in bee7d26757da
 Removing intermediate container bee7d26757da
 ---> 06542624803f
 Successfully built 06542624803f
 Successfully tagged templated:production
```

And for the production environment, we will do the same: 
```
[vagrant@standalone templating]$ docker image build \
--file Dockerfile.application \
-t templated:production \
--build-arg ENVIRONMENT=production \
--label lab=lab4 . 
 Sending build context to Docker daemon  5.632kB
 Step 1/4 : ARG ENVIRONMENT=development
 Step 2/4 : FROM baseimage:${ENVIRONMENT}
 ---> 1fc2505b3bc2
 Step 3/4 : COPY html/* /usr/share/nginx/html
 ---> Using cache
 ---> e038e952a087
 Step 4/4 : LABEL lab=lab4
 ---> Using cache
 ---> 06542624803f
 Successfully built 06542624803f
 Successfully tagged templated:production
```
With this lab, we built different images using just one Dockerfile. Arguments will change the building process.