

In this lab we will deploy a simple webserver using different volumes. We will use [webserver.deployment.yaml](./nginx-lab/yaml/webserver.deployment.yaml).

We have prepared following volumes:
- __congigMap__ - config-volume (with "/etc/nginx/conf.d/default.conf" configuration file)
- __emptyDir__ - empty-volume for Nginx logs "/var/log/nginx".
- __secret__ - secret-volume to specify some variables to compose _index.html_ page.
- __persistentVolumeClaim__ - data-volume binded to hostPath's persistentVolume using host's  "/mnt".

>NOTE: We have declared one specific node for our webserver to ensure _index.html_ file location under "/mnt" directory. We have used __nodeName: kubernetes-node2__ in our Deployment file  [webserver.deployment.yaml](./nginx-lab/yaml/webserver.deployment.yaml).


1 - First we verify that there is not any file under /mnt directory in _kubernetes-node2_ node. We connect to kubernetes-node2 and then we will review /mnt content.
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

4 - Now we will review all the resources created. We have not defined any __Namespace__, hence __default__ namespace will be used (we omitted it in our commands because it is our default namespace).
We will use __kubectl get all__ to list all the resources available in __default__ namespace:
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
But not all resources are listed. PersistentVolume and PersistentVolumeClaim resources are not show. Therefor we will ask Kubernetes API about these resources using __kubectl get pv__ (PersisteVolumes) and __kubectl get pvs__ (PersistenVolumeClaims):

```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get pv
NAME           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                    STORAGECLASS   REASON   AGE
webserver-pv   500Mi      RWO            Retain           Bound    default/werbserver-pvc   manual                  6m13s

vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get pvc
NAME             STATUS   VOLUME         CAPACITY   ACCESS MODES   STORAGECLASS   AGE
werbserver-pvc   Bound    webserver-pv   500Mi      RWO            manual         6m15s
```

5 - Let's send some requests to our webserver. You can notice in the previous list that "webserver-svc" is published using as __NodePort__ in port 30080, associating hosts' port 30080 with service's port 80. As mentioned, all hosts will publish port 30080, hence we can use curl on current host (kubernetes-node1) and port 30080 and try to reach our webserver's __Pods__.
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

6 - We have used a __ConfigMap__ resource to specify an Nginx configuration file [webserver.configmap.yaml](./nginx-lab/yaml/webserver.configmap.yaml):
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

This configuration is included in our __Deloyment__[webserver.deployment.yaml](./nginx-lab/yaml/webserver.deployment.yaml). Here is the piece of code where it is defined:
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
First piece declares where this configuration file will be mounted while second part links the defined resource __webserver-test-config__. Therefore the data defined inside __ConfigMap__ resource will be integrated inside webserver's __Pod__ as /etc/nginx/conf.d/default.conf (take a look at the data block).

7 - As mentioned before, we also have a __Secret__ resource ([webserver.secret.yaml](./nginx-lab/yaml/webserver.secret.yaml)):
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
>NOTE: We can create this __Secret__ also using _imperative_ format with kubectl command-line:
>```
>kubectl create secret generic webserver-secret \
> --from-literal=PAGETITLE="Docker_Certified_DCA_Exam_Guide" \
> --from-literal=PAGEBODY="Hello_World_from_Secret"
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

In this case PAGETITLE and PAGEBODY keys will be integrated as environment variables inside webserver's __Pod__. This values will be used in our lab as values for the __index.html__ page. DEFAULT_BODY and DEFAULT_TITLE will be changed from the __Pods__'s container's process.

8 - This lab has another volume definition. In fact we have a __PersistenctVolumeclaim__ included as a volume in our __Deployment__'s definition:
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
This volume claim is used here and mounted in "/wwwroot" inside webserver's __Pod__. PersistentVolume and PersistentVolumeClaim are defined in [webserver.persistevolume.yaml](./nginx-lab/yaml/webserver.persistevolume.yaml) and [webserver.persistevolumeclaim.yaml](./nginx-lab/yaml/webserver.persistevolumeclaim.yaml), respectively.

9 - Finally, we have an __emptyDir__ volume definition. This will be used to bypass container's filesystem and save Nginx logs.
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

10 - First __Pod__ execution will create default "/wwwroot/index.html" inside it. This is mounted inside "kubernetes-node2" node's filesystem inside "/mount" directory. Therefore after this first execution, we can find that "/mnt/index.html" was created (you can verify following __step 1__ again). This file was published and we get it when we executed __curl 0.0.0.0:30080__ in __step 5__. 


11 - Our application is quite simple but it is prepared to modify the content of the "index.html" file. As mentioned before, default title and body will be changed with the values defined in the __Secret__ resource. This will happen on container creation if "index.html" file already exist. Now that it is created as we verified in __step 10__, we can delete webserver's __Pod__. Kubernetes will create a new one and therefore application will change its content. We use __kubectl delete pod__. 
```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl delete pod/webserver-d7fbbf4b7-rhvvn
pod "webserver-d7fbbf4b7-rhvvn" deleted
```

After few seconds, a new pod is created.
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

Now content has changed inside the defined __PersistentVolume__.

We can also verify "/mnt/index.html" content in "kubernetes-node2".
```
$ vagrant ssh kubernetes-node2

vagrant@kubernetes-node2:~$ ls  /mnt/
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

In this lab we have used 4 different __Volume__ resources, with different definitions and features.






