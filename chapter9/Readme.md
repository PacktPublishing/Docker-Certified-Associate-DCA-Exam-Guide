# Chapter 9

## Technical requirements

In this chapter we will learn basic Kubernetes orchestrator concepts. We provide some labs at the end of the chapter that will help you understand and learn shown concepts. These labs can be run on your laptop or PC using the provided vagrant Kubernetes environment or any already deployed Kubernetes cluster at your own.

You will need at least (all labs were tested on Linux and Windows hosts):

    - Some Linux, MacOS or Windows basic skills to edit files (using Notepad, Vim, Emacs or any other editor).
    - Git command-line, Vagrant and Virtualbox installed on your PC or laptop.
    - Already cloned book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git).
    - Enough hardware resources: 4vCPU, 8GB of RAM and 75 GB of available diskspace on your hard drive for virtual nodes.

Extended instructions can be found on Github book's repository. These labs will use _"environments/kubernetes-environment"_ folder for the creation of the virtual environment and _"labs/chapter9"_ folder.

>NOTE:
>
>To clone book' s repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git), prepare a directory on your laptop or PC and execute ___git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git___. This will dowload all required files on your current folder.
>
All labs will start executing ___vagrant up___  using your command-line from the environment directory _"environments/kubernetes-environment"_. This command will start all the required nodes for you. If you are using your own Kubernetes cluster, you can use _"labs/chapter9"_ folder. Ask your Kubernetes administrator for the cluster-required credentials for your environment to execute the provided labs.

Once all environment nodes are up and running, move yourself to "labs/chapter9" folder and follow each lab instructions.

After completed the labs, you can use ___vagrant destroy -f___ from _"environments/kubernetes-environment"_ directory to completely remove all the deployed nodes and free your disk.

---

## Previous requirements
- Working Vagrant and VirtualBox installation.
- Running "Kubernetes" environment.

>NOTE:
>
>You can use your own host (laptop or server), we provide you mock environments to avoid any change in your system.
>
>These labs should be executed on Kuberentes. We provide you with a fully functional environment ready with a running Kubernetes cluster. This will run 43 virtual nodes on your host. __You will need at least 8GB of RAM and 4 vCPUs__.
>
>We will run a complete deployment lab in which we will be able to update some of the application components and we will publish application to be consumed using ingress.
>All nodes will be deployed with latest Docker Engine installed. Nodes are big enough for working with Kubernetes.
>
>Follow the specific instructions to deploy the [Kubernetes environment](../../environments/kubernetes/Readme.md) before starting these labs.
>
>
>All Vagrant environment can easily be removed executing _vagrant destroy -f_ once you have finished all the labs.
---

### Following labs can be found under chapter9 directory.


---
## __Lab1__: Kubernetes Application Deployment

Wait until all nodes are running. We can check nodes status using vagrant status. Connect to your lab node using vagrant ssh swarm-node1. Vagrant deployed 3 nodes for you and you will be using vagrant user with root privileges using sudo. You should have following output:
```
Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$ vagrant up
--------------------------------------------------------------------------------------------
 KUBERNETES Vagrant Environment
 Engine Version: current
 Kubernetes Version: 1.14.0-00
 Kubernetes CNI: https://docs.projectcalico.org/v3.8/manifests/calico.yaml
--------------------------------------------------------------------------------------------
Bringing machine 'kubernetes-node1' up with 'virtualbox' provider...
Bringing machine 'kubernetes-node2' up with 'virtualbox' provider...
Bringing machine 'kubernetes-node3' up with 'virtualbox' provider...

...
Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$
```
Nodes will have 3 interfaces (IP addresses and virtual hardware resources can be modified changing config.yml file):

  - eth0 [10.0.2.15] - Internal, required for Vagrant.
  - eth1 [10.10.10.X/24] - Prepared for Docker Swarm internal communication. First node will get 10.10.10.11 IP address and so on.
  - eth2 [192.168.56.X/24] - Host-only interface for communication between your host and the virtual nodes. First node will get 192.168.56.11 IP address and so on.

We will use eth1 interface for Kubernetes and we will be able to connect to published applications using 192.168.56.X/24 IP addresses range. All nodes have Docker Engine Community Edition installed and vagrant user is allowed to execute docker. A small Kubernetes cluster with 1 master (kubernetes-node1) and 2 worker nodes (kubernetes-node2 and kubernetes-node3) will be deployed for you.

We can now connect to the first deployed virtual node using vagrant ssh kubernetes-node1. Process may vary if you already deployed Kuberenetes virtual environment before and you just started it using vagrant up.
```
Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$ vagrant ssh kubernetes-node1
vagrant@kubernetes-node1:~$
```
Now you are ready to start the labs. We will start these labs by deploying a simple application.

## Lab1 - Kubernetes application deployment

Once Vagrant (or your own environment) is deployed, we will have three nodes (named kubernetes-node<index> from 1 to 3) with Ubuntu Xenial and Docker Engine installed. Kubernetes will also be up and running for you, with one master node and two workers. Calico CNI will also be deployed for you automatically.

First, review your node IP addresses (10.10.10.11 to 10.10.10.13 if you used Vagrant, because the first interface will be Vagrant-internal).
The steps for deploying our application are as follows:

1 - Connect to kubernetes-node1 and review the deployed Kubernetes cluster using kubectl get nodes. A  file named config including the required credentials and the Kubernetes API endpoint will be copied under the ~/.kube directory automatically. We'll also refer to this file as Kubeconfig. This file configured the kubectl command line for you:
```
Docker-Certified-Associate-DCA-Exam-Guide/environments/kubernetes$ vagrant ssh kubernetes-node1

vagrant@kubernetes-node1:~$ kubectl get nodes
NAME STATUS ROLES AGE VERSION
kubernetes-node1 Ready master 6m52s v1.14.0
kubernetes-node2 Ready <none> 3m57s v1.14.0
kubernetes-node3 Ready <none> 103s v1.14.0
```

Kubernetes cluster version 1.14.00 was deployed and is running. Notice that kubernetes-node1 is the only master node in this cluster, thus we are not providing high availability.

Currently, we are using the admin user and, by default, all deployments will run on the default namespace, unless any other is specified. This configuration is also done in the ~/.kube/config file.

>NOTE: Calico CNI was also deployed hence host to containers networking should work cluster wide.

2 - Create a deployment file named [blue-deployment-simple.yaml](./blue-deployment-simple.yaml) using your favorite editor with the following content:
```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: blue-app
  labels:
    color: blue
    example: blue-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: blue
  template:
    metadata:
      labels:
        app: blue
    spec:
      containers:
      - name: blue
        image: codegazers/colors:1.12
        env:
        - name: COLOR
          value: blue
        ports:
        - containerPort: 3000
```
This will deploy two replicas of the codegazers/colors:1.12 image. We will expect two running pods after it is deployed. We set the COLOR environment variable to blue and as a result, all application components will be blue. Containers will expose port 3000 internally within the cluster.

3 - Let's deploy this blue-app application using __kubectl create -f <KUBERNETES_RESOURCES_FILE>.yaml__:
```
vagrant@kubernetes-node1:~$ kubectl create -f blue-deployment-simple.yaml
deployment.extensions/blue-app created
```

This command line has created a deployment named blue-app with two replicas. Let's review the deployment created using kubectl get deployments:
```
vagrant@kubernetes-node1:~$ kubectl get deployments -o wide
NAME READY UP-TO-DATE AVAILABLE AGE CONTAINERS IMAGES SELECTOR
blue-app 2/2 2 2 103s blue codegazers/colors:1.12 app=blue
```

Therefore, two Pods will be running, associated with the blue-app deployment. Let's now review the deployed Pods using kubectl get pods:
```
vagrant@kubernetes-node1:~$ kubectl get pods -o wide
NAME READY STATUS RESTARTS AGE IP NODE NOMINATED NODE READINESS GATES
blue-app-54485c74fc-wgw7r 1/1 Running 0 2m8s 192.168.135.2 kubernetes-node3 <none> <none>
blue-app-54485c74fc-x8p92 1/1 Running 0 2m8s 192.168.104.2 kubernetes-node2 <none> <none>
```

In this case, one Pod runs on kubernetes-node2 and another one runs on kubernetes-node3. Let's try to connect to their virtual assigned IP addresses on the exposed port. Remember that IP addresses will be assigned randomly, hence they may vary on your environment. We will just use curl against the IP address of kubernetes-node1 and the Pod's internal port:
```
vagrant@kubernetes-node1:~$ curl 192.168.104.2:3000/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-x8p92
CONTAINER_IP: 192.168.104.2
CLIENT_IP: ::ffff:192.168.166.128
CONTAINER_ARCH: linux
```

We can connect from kubernetes-node1 to Pods running on other hosts correctly. Calico is working correctly.

We should be able to connect to any Pods' deployed IP addresses. These IP addresses will change whenever a container dies and a new Pod is deployed. We will never connect to Pods to consume their application processes. We will use Services instead of Pods for publishing applications, as we learned in this chapter. They will not change their IP addresses when application components, running as pods, have to be recreated.

4 - Let's create a Service to load balance requests between deployed Pods with a fixed virtual IP address. Create file [blue-service-simple.yaml](./blue-service-simple.yaml) with the following content:
```
apiVersion: v1
kind: Service
metadata:
  name: blue-svc
spec:
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: blue
```

A random IP address will be associated with this service. This IP address will be fixed and it will be valid although Pods die. Notice that we have exposed a new port for the service. This will be the Service's port and requests reaching defined port 80 will be routed to port 3000 on each Pod. We will use kubectl get svc to retrieve the Service's port and IP address:
```
vagrant@kubernetes-node1:~$ kubectl create -f blue-service-simple.yaml
service/blue-svc created

vagrant@kubernetes-node1:~$ kubectl get svc
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
blue-svc ClusterIP 10.100.207.49 <none> 80/TCP 7s
kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 53m
```

5 - Let's verify the internal load balance by sending some requests to the blue-svc Service using curl against its IP address, accessing port 80:
```
vagrant@kubernetes-node1:~$ curl 10.100.207.49:80/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-x8p92
CONTAINER_IP: 192.168.104.2
CLIENT_IP: ::ffff:192.168.166.128
CONTAINER_ARCH: linux
```

6 - Let's try again using curl. We will test the internal load balancing by executing some requests to the Service's IP address and port:
```
vagrant@kubernetes-node1:~$ curl 10.100.207.49:80/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-wgw7r
CONTAINER_IP: 192.168.135.2
CLIENT_IP: ::ffff:192.168.166.128
CONTAINER_ARCH: linux
```

Therefore, the Service has load balanced our requests between both Pods. Let's now try to expose this Service to be accessible for application's users.

7 - Now we will remove the previous Service's definition and deploy a new one with the Service's NodePort type. We will use __kubectl delete -f <KUBERNETES_RESOURCES_FILE>.yaml_:
```
vagrant@kubernetes-node1:~$ kubectl delete -f blue-service-simple.yaml
service "blue-svc" deleted
```

Create a new definition, [blue-service-nodeport.yaml](./blue-service-nodeport.yaml), with the following content:
```
apiVersion: v1
kind: Service
metadata:
  name: blue-svc
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: blue
```

8 - We now just create a service definition and notice a random port associated with it. We will also use kubectl create and kubectl get svc after it is deployed:
```
vagrant@kubernetes-node1:~$ kubectl create -f blue-service-nodeport.yaml
service/blue-svc created

vagrant@kubernetes-node1:~$ kubectl get svc
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
blue-svc NodePort 10.100.179.60 <none> 80:32648/TCP 5s
kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 58m
```

9 - We learned that the NodePort Service will act as Docker Swarm's router mesh. Therefore, the Service's port will be fixed on every node. Let's verify this feature using curl against any node's IP address and assigned port. In this example, it is 32648. This port may vary on your environment because it will be assigned dynamically:
```
vagrant@kubernetes-node1:~$ curl 0.0.0.0:32648/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-x8p92
CONTAINER_IP: 192.168.104.2
CLIENT_IP: ::ffff:192.168.166.128
CONTAINER_ARCH: linux
```

10 - Locally, on node1 port 32648, the Service is accessible. It should be accessible on any of the nodes on the same port. Let's try on node3, for example, using curl:
```
vagrant@kubernetes-node1:~$ curl 10.10.10.13:32648/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-wgw7r
CONTAINER_IP: 192.168.135.2
CLIENT_IP: ::ffff:10.0.2.15
CONTAINER_ARCH: linux
```

We learned that even if a node does not run a related workload, the Service will be accessible on the defined (or random, in this case) port using NodePort.

11 - We will finish this lab by upgrading the deployment images to a newer version. We will use kubectl set image deployment:
```
vagrant@kubernetes-node1:~$ kubectl set image deployment blue-app blue=codegazers/colors:1.15
deployment.extensions/blue-app image updated
```

12 - Let's review the deployment again to verify that the update was done. We will use kubectl get all -o wide to retrieve all created resources and their locations:
```
vagrant@kubernetes-node1:~$ kubectl get all -o wide
NAME READY STATUS RESTARTS AGE IP NODE NOMINATED NODE READINESS GATES
pod/blue-app-787648f786-4tz5b 1/1 Running 0 76s 192.168.104.3 node2 <none> <none>
pod/blue-app-787648f786-98bmf 1/1 Running 0 76s 192.168.135.3 node3 <none> <none>

NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE SELECTOR
service/blue-svc NodePort 10.100.179.60 <none> 80:32648/TCP 22m app=blue
service/kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 81m <none>

NAME READY UP-TO-DATE AVAILABLE AGE CONTAINERS IMAGES SELECTOR
deployment.apps/blue-app 2/2 2 2 52m blue codegazers/colors:1.15 app=blue

NAME DESIRED CURRENT READY AGE CONTAINERS IMAGES SELECTOR
replicaset.apps/blue-app-54485c74fc 0 0 0 52m blue codegazers/colors:1.12 app=blue,pod-template-hash=54485c74fc
replicaset.apps/blue-app-787648f786 2 2 2 76s blue codegazers/colors:1.15 app=blue,pod-template-hash=787648f786
```

13 - Notice that new Pods were created with a newer image. We can verify the update using kubectl rollout status:
```
vagrant@kubernetes-node1:~$ kubectl rollout status deployment.apps/blue-app
deployment "blue-app" successfully rolled out
```

14 - We can go back to the previous image version just by executing kubectl rollout undo. Let's go back to the previous image version:
```
vagrant@kubernetes-node1:~$ kubectl rollout undo deployment.apps/blue-app
deployment.apps/blue-app rolled back
```

15 - And now, we verify that the current blue-app deployment runs codegazers/colors:1.12 images again. We will again review deployment locations using kubectl get all:
```
vagrant@kubernetes-node1:~$ kubectl get all -o wide
NAME READY STATUS RESTARTS AGE IP NODE NOMINATED NODE READINESS GATES
pod/blue-app-54485c74fc-kslgw 1/1 Running 0 62s 192.168.104.4 node2 <none> <none>
pod/blue-app-54485c74fc-lrkxv 1/1 Running 0 62s 192.168.135.4 node3 <none> <none>

NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE SELECTOR
service/blue-svc NodePort 10.100.179.60 <none> 80:32648/TCP 29m app=blue
service/kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 87m <none>

NAME READY UP-TO-DATE AVAILABLE AGE CONTAINERS IMAGES SELECTOR
deployment.apps/blue-app 2/2 2 2 58m blue codegazers/colors:1.12 app=blue

NAME DESIRED CURRENT READY AGE CONTAINERS IMAGES SELECTOR
replicaset.apps/blue-app-54485c74fc 2 2 2 58m blue codegazers/colors:1.12 app=blue,pod-template-hash=54485c74fc
replicaset.apps/blue-app-787648f786 0 0 0 7m46s blue codegazers/colors:1.15 app=blue,pod-template-hash=787648f786
```

Going back to the previous state was very easy.

>NOTE: We can set comments for each change using the __--record__ option on update commands.

## Lab2 - Using Volumes

In this lab we will deploy a simple webserver using different volumes. We will use webserver.deployment.yaml.

We have prepared following volumes:

- congigMap - config-volume (with "/etc/nginx/conf.d/default.conf" - configuration file)
- emptyDir - empty-volume for Nginx logs "/var/log/nginx".
- secret - secret-volume to specify some variables to compose index.html page.
- persistentVolumeClaim - data-volume binded to hostPath's persistentVolume using host's "/mnt".
NOTE: We have declared one specific node for our webserver to ensure index.html file location under "/mnt" directory. We have used nodeName: kubernetes-node2 in our Deployment file webserver.deployment.yaml.

1 - First we verify that there is not any file under /mnt directory in kubernetes-node2 node. We connect to kubernetes-node2 and then we will review /mnt content.
```
$ vagrant ssh kubernetes-node2

vagrant@kubernetes-node2:~$ ls  /mnt/
```

2 - Then we change to kubernetes-node1 to clone our repository and launch webserver deployment.
```
$ vagrant ssh kubernetes-node1

vagrant@kubernetes-node1:~$ git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git
```

We move to "chapter9/nginx-lab/yaml".
```
vagrant@kubernetes-node1:~$ cd Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml/

vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$
```

3 - We will use a __ConfigMap__, a __Secret__, a __Service__, a __PersistentVolume__ and a __PersistentVolumeClaim__ resources in this lab using YAMLs files. We will deploy all the resource files in th directory "yaml".
```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl create -f .
configmap/webserver-test-config created
deployment.apps/webserver created
persistentvolume/webserver-pv created
persistentvolumeclaim/werbserver-pvc created
secret/webserver-secret created
service/webserver-svc created
```

4 - Now we will review all the resources created. We have not defined any __Namespace__, hence "default" namespace will be used (we omitted it in our commands because it is our default namespace). We will use kubectl get all to list all the resources available in default namespace:
```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get all
NAME                            READY   STATUS    RESTARTS   AGE
pod/webserver-d7fbbf4b7-rhvvn   1/1     Running   0          31s

NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/kubernetes      ClusterIP   10.96.0.1       <none>        443/TCP        107m
service/webserver-svc   NodePort    10.97.146.192   <none>        80:30080/TCP   31s

NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/webserver   1/1     1            1           31s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/webserver-d7fbbf4b7   1         1         1       31s
```

But not all resources are listed. __PersistentVolume__ and __PersistentVolumeClaim__ resources are not show. Therefor we will ask Kubernetes API about these resources using kubectl get pv (PersisteVolumes) and kubectl get pvs (PersistenVolumeClaims):
```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get pv
NAME           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                    STORAGECLASS   REASON   AGE
webserver-pv   500Mi      RWO            Retain           Bound    default/werbserver-pvc   manual                  6m13s

vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get pvc
NAME             STATUS   VOLUME         CAPACITY   ACCESS MODES   STORAGECLASS   AGE
werbserver-pvc   Bound    webserver-pv   500Mi      RWO            manual         6m15s
```

5 - Let's send some requests to our webserver. You can notice in the previous list that "webserver-svc" is published using as __NodePort__ in port 30080, associating hosts' port 30080 with service's port 80. As mentioned, all hosts will publish port 30080, hence we can use curl on current host (kubernetes-node1) and port 30080 and try to reach our webserver's Pods.
```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ curl 0.0.0.0:30080
<!DOCTYPE html>
<html>
<head>
<title>DEFAULT_TITLE</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>DEFAULT_BODY</h1>
</body>
</html>
```

6 - We have used a __ConfigMap__ resource to specify an Nginx configuration file webserver.configmap.yaml:
```
apiVersion: v1
data:
  default.conf: |+
        server {
            listen       80;
            server_name  test;

            location / {
                root   /wwwroot;
                index  index.html index.htm;
            }

            error_page   500 502 503 504  /50x.html;
            location = /50x.html {
                root   /usr/share/nginx/html;
            }

        }

kind: ConfigMap
metadata:
  creationTimestamp: null
  name: webserver-test-config
```

This configuration is included in our Deloymentwebserver.deployment.yaml. Here is the piece of code where it is defined:
```
...
        volumeMounts:
        - name: config-volume
          mountPath: /etc/nginx/conf.d/
...
      volumes:
      - name: config-volume
        configMap:
          name: webserver-test-config
...
```

First piece declares where this configuration file will be mounted while second part links the defined resource webserver-test-config. Therefore the data defined inside __ConfigMap__ resource will be integrated inside webserver's Pod as /etc/nginx/conf.d/default.conf (take a look at the data block).

7 - As mentioned before, we also have a __Secret__ resource (webserver.secret.yaml):
```
apiVersion: v1
data:
  PAGEBODY: SGVsbG9fV29ybGRfZnJvbV9TZWNyZXQ=
  PAGETITLE: RG9ja2VyX0NlcnRpZmllZF9EQ0FfRXhhbV9HdWlkZQ==
kind: Secret
metadata:
  creationTimestamp: null
  name: webserver-secret
```

We can verify here that keys are visible while values are not (base64 coded).

>NOTE: We can create this Secret also using imperative format with kubectl command-line:
>
>```
>kubectl create secret generic webserver-secret \
>--from-literal=PAGETITLE="Docker_Certified_DCA_Exam_Guide" \
>--from-literal=PAGEBODY="Hello_World_from_Secret"
>```

We also used this __Secret__ resource in our deployment:
```
...
        env:
...
        - name: PAGETITLE
          valueFrom:
            secretKeyRef:
              name: webserver-secret
              key: PAGETITLE
        - name: PAGEBODY
          valueFrom:
            secretKeyRef:
              name: webserver-secret
              key: PAGEBODY
...
```

In this case PAGETITLE and PAGEBODY keys will be integrated as environment variables inside webserver's Pod. This values will be used in our lab as values for the index.html page. DEFAULT_BODY and DEFAULT_TITLE will be changed from the Pods's container's process.

8 - This lab has another volume definition. In fact we have a __PersistenctVolumeclaim__ included as a volume in our Deployment's definition:
```
...
        volumeMounts:
...
        - mountPath: /wwwroot
          name: data-volume
...
      - name: data-volume
        persistentVolumeClaim:
          claimName: werbserver-pvc
...
```

This volume claim is used here and mounted in "/wwwroot" inside webserver's Pod. __PersistentVolume__ and __PersistentVolumeClaim__ are defined in webserver.persistevolume.yaml and webserver.persistevolumeclaim.yaml, respectively.

9 - Finally, we have an __emptyDir_ volume definition. This will be used to bypass container's filesystem and save Nginx logs.
```
...
        volumeMounts:
...
        - mountPath: /var/log/nginx
          name: empty-volume
          readOnly: false
...
      volumes:
...
      - name: empty-volume
        emptyDir: {}
...
```

10 - First Pod execution will create default "/wwwroot/index.html" inside it. This is mounted inside "kubernetes-node2" node's filesystem inside "/mount" directory. Therefore after this first execution, we can find that "/mnt/index.html" was created (you can verify following step 1 again). This file was published and we get it when we executed curl 0.0.0.0:30080 in step 5.

11 - Our application is quite simple but it is prepared to modify the content of the "index.html" file. As mentioned before, default title and body will be changed with the values defined in the Secret resource. This will happen on container creation if "index.html" file already exist. Now that it is created as we verified in step 10, we can delete webserver's Pod. Kubernetes will create a new one and therefore application will change its content. We use kubectl delete pod.
```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl delete pod/webserver-d7fbbf4b7-rhvvn
pod "webserver-d7fbbf4b7-rhvvn" deleted
```

After few seconds, a new pod is created (we are using a Deployment and Kubernetes takes care of application's components resilience).

```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
webserver-d7fbbf4b7-sz6dx   1/1     Running   0          17s
```

12 - Let's verify again the content of our webserver using curl.
```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ curl 0.0.0.0:30080
<!DOCTYPE html>
<html>
<head>
<title>Docker_Certified_DCA_Exam_Guide</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Hello_World_from_Secret</h1>
</body>
</html>
```

Now content has changed inside the defined PersistentVolume.

13 - We can also verify "/mnt/index.html" content in "kubernetes-node2".
```
$ vagrant ssh kubernetes-node2

vagrant@kubernetes-node2:~$ cat /mnt/index.html
<!DOCTYPE html>
<html>
<head>
<title>Docker_Certified_DCA_Exam_Guide</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Hello_World_from_Secret</h1>
</body>
</html>
```

In this lab we have used 4 different Volume resources, with different definitions and features.

These labs were very simple, just to show you how to deploy a small application on Kubernetes.

All labs can be easily removed by destroying all Vagrant nodes using __vagrant destroy__ from the environments/kubernetes directory.

We highly recommend going further with Kubernetes.
