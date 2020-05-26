# Chapter 6

## Technical requirements

In this chapter we will learn Docker Content Trust concepts. We provide some labs at the end of the chapter that will help you understand and learn shown concepts. These labs can be run on your laptop or PC using the provided vagrant standalone environment or any already deployed Docker host at your own.

You will need at least (all labs were tested on Linux and Windows):
    
- Internet connection.    
    
- Some Linux, MacOS or Windows basic skills to edit files (using Notepad, Vim, Emacs or any other editor).
    
- Git command-line, Vagrant and Virtualbox installed on your PC or laptop.
    
- Already cloned book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git).

- Enough hardware resources: 1vCPU, 3GB of RAM and 10 GB of available disk space on your hard drive for virtual nodes.

Extended instructions can be found on Github book's repository. These labs will use "environments/standalone-environment" folder for the creation of the virtual environment and "chapter6" folder.
>NOTE: To clone book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git), prepare a directory on your laptop or PC and execute git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git. This will dowload all required files on your current folder.

All labs will start executing vagrant up  using your command-line from the environment directory "environments/standalone-environment". This command will start all the required nodes for you. If you are using your own Docker host, you can move directly to "chapter6" folder.

Once all environment nodes are up and running, go to "chapter6" folder and follow each lab instructions.

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

### Following labs can be found under chapter6 directory.


---
## __Lab1__: Signing Images for Docker Hub

In this lab we will learn how to sign images.
Create an account in [DockerHub](https:/​/​hub.​docker.​com/​signup) if you do not already have one. You can use your own registry but you should have a Notary server running too.

1 - In this lab we will start from the very beginning.
___
>_NOTE: This a lab, don't remove your .docker/trust directory if you have been signing images before. In that case, backup your trust directory somewhere safe to recover later or just create a dummy user in your Docker host system. (Avoid this step if you have been signing images and you do not have prepared a backup executing_ __cp -pR ~/.docker/trust ~/.docker/trust.BKP__).
___
To start in your system we will remove previous trust content (create a backup before removing _trust_ content).
``` 
vagrant@standalone:~$ rm -rf ~/.docker/trust/
```

2.Now, enable Docker Content Trust and create a directory for this lab:
```
[vagrant@standalone ~]$ export DOCKER_CONTENT_TRUST=1

[vagrant@standalone ~]$ cd $HOME
[vagrant@standalone ~]$ mkdir chapter6
```

3 - We have prepared a quite simple Dockerfile executing _ping to 8.8.8.8_ 300 times. This is the [Dockerfile](./Dockerfile) file content:
```
FROM alpine:3.8
RUN apk add --update curl
CMD ping 8.8.8.8 -c 300
```

4 - We now build the image. Remember that _Content Trust_ was enabled.
```
[vagrant@standalone chapter6]$ docker image build -t frjaraur/pingo:trusted .
Sending build context to Docker daemon 2.048kB
Step 1/3 : FROM
alpine@sha256:04696b491e0cc3c58a75bace8941c14c924b9f313b03ce5029ebbc040ed9d
cd9
sha256:04696b491e0cc3c58a75bace8941c14c924b9f313b03ce5029ebbc040ed9dcd9:
Pulling from library/alpine
c87736221ed0: Pull complete
Digest:
sha256:04696b491e0cc3c58a75bace8941c14c924b9f313b03ce5029ebbc040ed9dcd9
Status: Downloaded newer image for
alpine@sha256:04696b491e0cc3c58a75bace8941c14c924b9f313b03ce5029ebbc040ed9d
cd9
---> dac705114996
Step 2/3 : RUN apk add --update curl
---> Running in 5f9a40eb4960
fetch http://dl-cdn.alpinelinux.org/alpine/v3.8/main/x86_64/APKINDEX.tar.gz
fetch
http://dl-cdn.alpinelinux.org/alpine/v3.8/community/x86_64/APKINDEX.tar.gz
(1/5) Installing ca-certificates (20190108-r0)
(2/5) Installing nghttp2-libs (1.39.2-r0)
(3/5) Installing libssh2 (1.9.0-r1)
(4/5) Installing libcurl (7.61.1-r3)
(5/5) Installing curl (7.61.1-r3)
Executing busybox-1.28.4-r3.trigger
Executing ca-certificates-20190108-r0.trigger
OK: 6 MiB in 18 packages
Removing intermediate container 5f9a40eb4960
---> d7ab320d1e7a
Step 3/3 : CMD ping 8.8.8.8 -c 300
---> Running in 0772c6a1a0c8
Removing intermediate container 0772c6a1a0c8
---> b3aba563b2ff
Successfully built b3aba563b2ff
Successfully tagged frjaraur/pingo:trusted
Tagging alpine@sha256:04696b491e0cc3c58a75bace8941c14c924b9f313b03ce5029ebbc040ed9d cd9 as alpine:3.8
```

>NOTE: You may have notice new messages from Docker daemon. Daemon used _alpine:3.8_ image hash _sha256:04696b491e0cc3c58a75bace8941c14c924b9f313b03ce5029ebbc040ed9dcd9_ instead of image name and tag. If we had an image locally with same image:tag keys, it would have been verified. If hash did not match it would have been avoided and real image would have been downloaded from Docker Hub. This will ensure that trusted _alpine:3.8_ will be downloaded.

5 - Now we will sign this image using "docker trust sign". This process will ask us to create a root passphrase, a repository passphrase and a user passphrase (this is new in this chapter because we did not use docker trust to sign images before in this chapter). This will create a new _trust_ directory under _.docker_. When image is pushed, you will be asked again about your registry user passphrase. This is not your Docker Hub password, is the passphrase to allow you signing.
```
[vagrant@standalone chapter6]$ docker trust sign frjaraur/pingo:trusted
You are about to create a new root signing key passphrase. This passphrase will be used to protect the most sensitive key in your signing system.
Please choose a long, complex passphrase and be careful to keep the password and the key file itself secure and backed up. It is highly recommended that you use a password manager to generate the passphrase and keep it safe. There will be no way to recover this key. You can find the key in your config directory.
Enter passphrase for new root key with ID 9e788ed:
Repeat passphrase for new root key with ID 9e788ed:
Enter passphrase for new repository key with ID fb7b8fd:
Repeat passphrase for new repository key with ID fb7b8fd:
Enter passphrase for new frjaraur key with ID f1916d7:
Repeat passphrase for new frjaraur key with ID f1916d7:
Created signer: frjaraur
Finished initializing signed repository for frjaraur/pingo:trusted
Signing and pushing trust data for local image frjaraur/pingo:trusted, may overwrite remote trust data
The push refers to repository [docker.io/frjaraur/pingo]
6f02cc23eebe: Pushed
d9ff549177a9: Mounted from library/alpine
trusted: digest: sha256:478cd976c78306bbffd51a4b5055e28873697d01504e70ef85bddd9cc348450b
size: 739
Signing and pushing trust metadata
Enter passphrase for frjaraur key with ID f1916d7:
Successfully signed docker.io/frjaraur/pingo:trusted
```

6 - Image was signed and pushed to Docker Hub. We can verify that the image was uploaded using _curl_.
```
[vagrant@standalone chapter6]$ curl -s https://hub.docker.com/v2/repositories/frjaraur/pingo/tags|jq
{

  "count": 1,
  "next": null,
  "previous": null,
  "results": [
      {
        "name": "trusted",
        "full_size": 4306493,
        "images": [
      {
        "size": 4306493,
        "digest":
        "sha256:478cd976c78306bbffd51a4b5055e28873697d01504e70ef85bddd9cc348450b",
        "architecture": "amd64",
        "os": "linux",
        "os_version": null,
        "os_features": "",
        "variant": null,
        "features": ""
      }
    ],
      "id": 78277337,
      "repository": 8106864,
      "creator": 380101,
      "last_updater": 380101,
      "last_updater_username": "frjaraur",
      "image_id": null,
      "v2": true,
      "last_updated": "2019-11-30T22:03:28.820429Z"
    }
  ]
}
```

7 - Finally we will review the image signatures:
```
[vagrant@standalone chapter6]$ docker trust inspect --pretty frjaraur/pingo:trusted
Signatures for frjaraur/pingo:trusted
SIGNED TAG DIGEST SIGNERS
trusted 478cd976c78306bbffd51a4b5055e28873697d01504e70ef85bddd9cc348450b
frjaraur
List of signers and their keys for frjaraur/pingo:trusted
SIGNER KEYS
frjaraur f1916d7ad60b
Administrative keys for frjaraur/pingo:trusted
Repository Key:
fb7b8fdaa22738c44b927110c377aaa7c56a6a15e2fa0ebc554fe92a57b5eb0b
Root Key: 4a739a076032b94a79c6d376721649c79917f4b5f8c8035ca11e36a0ed0696b4
```
