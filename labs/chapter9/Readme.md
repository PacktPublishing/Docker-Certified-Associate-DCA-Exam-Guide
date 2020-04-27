# Chapter 9

## Previous requirements
- Working Vagrant and VirtualBox installation.
- Running "Kubernetes" environemnt.

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

### Following labs can be found under labs/chapter9 directory.


---
## __Lab1__: Kubernetes Application Deployment

In this lab we will create a Docker Swarm cluster from the very begining.

Once Vagrant (or your own environment) is deployed, we will have 3 nodes (named kuberentes-node<index> from 1 to 3) with Ubuntu Xenial and Docker Engine installed. Kubernetes will also be up and running for you, with 1 master node and 2 workers.
First review your node IP addresses (10.10.10.11 to 10.10.10.13 if you used Vagrant, because first interface will be Vagrant internal).

1 - Connect to kubernetes-node1 and review the deployed Kubernetes cluster.
```
$ vagrant ssh kubernetes-node1
vagrant@kubernetes-node1:~$ kubectl get nodes
NAME STATUS ROLES AGE VERSION
kubernetes-node1 Ready master 7m2s v1.14.0
kubernetes-node2 Ready <none> 4m23s v1.14.0
kubernetes-node3 Ready <none> 116s v1.14.0
```

Kubernetes cluster version 1.14.00 was deployed and running. Notice that kubernetes-node1 is the unique master node in this cluster, thus does not provide high availability.
Currently we are using "admin" user and by default all deployments will run on "default" namespace, unless other is specified.

>NOTE: Calico CNI was also deployed hence host to containers networking should work cluster wide.

2 - Under /labs directory on kubernetes-node1, we will find some deployment files prepared for these labs. Let's review first one, [blue-deployment-simple.yaml](./blue-deployment-simple.yaml). 
Here is its content:
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

This will deploy 2 replicas of codegazers/colors:1.12 image. We set COLOR environment variable to "blue", as a result all application components will be blue. Containers will expose port 3000.

3 - Let's deploy this "blue-app" application.
```
vagrant@kubernetes-node1:/labs$ kubectl create -f blue-deployment-simple.yaml
deployment.extensions/blue-app created
```

This command-line has created a deployment named "blue-app". With 2 replicas.
```
vagrant@kubernetes-node1:/labs$ kubectl get deployments -o wide
NAME READY UP-TO-DATE AVAILABLE AGE CONTAINERS IMAGES SELECTOR
blue-app 2/2 2 2 103s blue codegazers/colors:1.12 app=blue
```

Therefore, 2 pods will be running, associated to "blue-app" deployment.
```
vagrant@kubernetes-node1:/labs$ kubectl get pods -o wide
NAME READY STATUS RESTARTS AGE IP NODE NOMINATED NODE READINESS GATES
blue-app-54485c74fc-wgw7r 1/1 Running 0 2m8s 192.168.135.2 kubernetes-node3 <none> <none> 
blue-app-54485c74fc-x8p92 1/1 Running 0 2m8s 192.168.104.2 kubernetes-node2 <none> <none>
```

In this case one runs on kubernetes-node2 and other runs on kubernetes-node3. Let's try to connect to their virtual assigned IP addresses on exposed port. Remember that IP addreses will be assigned randomly hence they may vary on your environment.
```
vagrant@kubernetes-node1:/labs$ curl 192.168.104.2:3000/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-x8p92
CONTAINER_IP: 192.168.104.2
CLIENT_IP: ::ffff:192.168.166.128
CONTAINER_ARCH: linux
```

We can connect from kubernetes-node1 to pods running on other hosts correctly. Calico is working correctly.

We should be able to connect to any pods deployed IP addresses but they will change whenever some container dies and new pod is deployed. We will never connect to Pods for consuming their application processes. We will use services instead as we learned on this chapter. They will not change their IP addresses when application components have to be recreated.


4 - Let's create a service to load balance requests between deployed pods with a fixed virtual IP address. This is the content of file [blue-service-simple.yaml](./blue-service-simple.yaml):
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

A random service IP address will be associated to service, but it will be valid although pods die. Notice that we have exposed a new port for the service. This will be the service port and requests reaching port 80 will be routed to port 3000 on each pod.
```
vagrant@kubernetes-node1:/labs$ kubectl create -f blue-service-simple.yaml
service/blue-svc created

vagrant@kubernetes-node1:/labs$ kubectl get svc
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
blue-svc ClusterIP 10.100.207.49 <none> 80/TCP 7s
kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 53m
```

Let's verify internal load balance sending some requests to service blue-svc using _curl_.
```
vagrant@kubernetes-node1:/labs$ curl 10.100.207.49:80/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-x8p92
CONTAINER_IP: 192.168.104.2
CLIENT_IP: ::ffff:192.168.166.128
CONTAINER_ARCH: linux
```

Let's try again.
```
vagrant@kubernetes-node1:/labs$ curl 10.100.207.49:80/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-wgw7r
CONTAINER_IP: 192.168.135.2
CLIENT_IP: ::ffff:192.168.166.128
CONTAINER_ARCH: linux
```

Therefore service has load balanced our requests between both pods. Let's now try expose service to be accessible to users.

5 - Now we will remove previous service definition and deploy a new one with service type "NodePort".
```
vagrant@kubernetes-node1:/labs$ kubectl delete -f blue-service-simple.yaml
service "blue-svc" deleted
```

New definition file is [blue-service-nodeport.yaml](blue-service-nodeport.yaml) with the following content:
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

We now just create service definition and notice a random port associated.
```
vagrant@kubernetes-node1:/labs$ kubectl create -f blue-service-nodeport.yaml
service/blue-svc created

vagrant@kubernetes-node1:/labs$ kubectl get svc
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
blue-svc NodePort 10.100.179.60 <none> 80:32648/TCP 5s
kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 58m
```

6 -We learned that NodePort service will act as Swarm Router Mesh ones. Therefore service port will be fixed on everynode. Let's verify this feature.
```
vagrant@kubernetes-node1:/labs$ curl 0.0.0.0:32648/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-x8p92
CONTAINER_IP: 192.168.104.2
CLIENT_IP: ::ffff:192.168.166.128
CONTAINER_ARCH: linux
```

Locally on kubernetes-node1 port 32648 service is accessible. It should be on any node using same port. Let's try on kubernetes-node3 for example.
```
vagrant@kubernetes-node1:/labs$ curl 10.10.10.13:32648/text
APP_VERSION: 1.0
COLOR: blue
CONTAINER_NAME: blue-app-54485c74fc-wgw7r
CONTAINER_IP: 192.168.135.2
CLIENT_IP: ::ffff:10.0.2.15
CONTAINER_ARCH: linux
```

We learned that even if node does not run any related workload, service will be accessible on defined (or random in this case) port when NodePort type is used.


7 -We will finish this lab upgrading deployment images to a newer version.
```
vagrant@kubernetes-node1:/labs$ kubectl set image deployment blue-app blue=codegazers/colors:1.15 
deployment.extensions/blue-app image updated
```

Let's review deployments now to verify update was done.
```
vagrant@kubernetes-node1:/labs$ kubectl get all -o wide
NAME READY STATUS RESTARTS AGE IP NODE NOMINATED NODE READINESS GATES 
pod/blue-app-787648f786-4tz5b 1/1 Running 0 76s 192.168.104.3 kubernetes-node2 <none> <none>
pod/blue-app-787648f786-98bmf 1/1 Running 0 76s 192.168.135.3 kubernetes-node3 <none> <none>

NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE SELECTOR
service/blue-svc NodePort 10.100.179.60 <none> 80:32648/TCP 22m app=blue
service/kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 81m <none>

NAME READY UP-TO-DATE AVAILABLE AGE CONTAINERS IMAGES SELECTOR
deployment.apps/blue-app 2/2 2 2 52m blue codegazers/colors:1.15 app=blue

NAME DESIRED CURRENT READY AGE CONTAINERS IMAGES SELECTOR
replicaset.apps/blue-app-54485c74fc 0 0 0 52m blue codegazers/colors:1.12 app=blue,pod-template-hash=54485c74fc
replicaset.apps/blue-app-787648f786 2 2 2 76s blue codegazers/colors:1.15 app=blue,pod-template-hash=787648f786
```

Notice that new pods were created to accomplish newer image.

We can verify the update using kubectl rollout status
```
vagrant@kubernetes-node1:/labs$ kubectl rollout status deployment.apps/blue-app
deployment "blue-app" successfully rolled out
```

We can go back to previous image version just executing kubectl rollout undo. Let's go back to previous image version.
```
vagrant@kubernetes-node1:/labs$ kubectl rollout undo deployment.apps/blue-app
deployment.apps/blue-app rolled back
```

And now we verify that current "blue-app" deployment runs again "codegazers/colors:1.12" images.
```
vagrant@kubernetes-node1:/labs$ kubectl get all -o wide
NAME READY STATUS RESTARTS AGE IP NODE NOMINATED NODE READINESS GATES
pod/blue-app-54485c74fc-kslgw 1/1 Running 0 62s 192.168.104.4 kubernetes-node2 <none> <none>
pod/blue-app-54485c74fc-lrkxv 1/1 Running 0 62s 192.168.135.4 kubernetes-node3 <none> <none>

NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE SELECTOR
service/blue-svc NodePort 10.100.179.60 <none> 80:32648/TCP 29m app=blue
service/kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 87m <none>

NAME READY UP-TO-DATE AVAILABLE AGE CONTAINERS IMAGES SELECTOR
deployment.apps/blue-app 2/2 2 2 58m blue codegazers/colors:1.12 app=blue

NAME DESIRED CURRENT READY AGE CONTAINERS IMAGES SELECTOR
replicaset.apps/blue-app-54485c74fc 2 2 2 58m blue codegazers/colors:1.12 app=blue,pod-template-hash=54485c74fc
replicaset.apps/blue-app-787648f786 0 0 0 7m46s blue codegazers/colors:1.15 app=blue,pod-template-hash=787648f786
```

These labs were very simple just to show you how to deploy a small application on kubernetes.

All labs can be easily removed destroying all vagrant nodes using vagrant destroy from kubernetes environment directroy. We will execute _vagrant destroy_:
```
$ vagrant destroy -f
```
