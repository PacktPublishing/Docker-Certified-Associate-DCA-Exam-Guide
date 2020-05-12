

- Already cloned book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git).



```
$ vagrant ssh kubernetes-node2

vagrant@kubernetes-node2:~$ cat <<-EOF |sudo tee /mnt/index.html
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
EOF
```

```
$ vagrant ssh kubernetes-node1

vagrant@kubernetes-node1:~$ git clone https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git
```




```
vagrant@kubernetes-node1:~$ cd Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml/

vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$
```

```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl create -f .
configmap/webserver-test-config created
deployment.apps/webserver created
persistentvolume/webserver-pv created
persistentvolumeclaim/werbserver-pvc created
secret/webserver-secret created
service/webserver-svc created
```

```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get all
NAME                             READY   STATUS    RESTARTS   AGE
pod/webserver-7bc5fbbdd9-zxzms   1/1     Running   0          5m18s

NAME                    TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/kubernetes      ClusterIP   10.96.0.1        <none>        443/TCP        52m
service/webserver-svc   NodePort    10.103.175.217   <none>        80:30080/TCP   5m18s

NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/webserver   1/1     1            1           5m18s

NAME                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/webserver-7bc5fbbdd9   1         1         1       5m18s
```


```
vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get pv
NAME           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                    STORAGECLASS   REASON   AGE
webserver-pv   500Mi      RWO            Retain           Bound    default/werbserver-pvc   manual                  6m13s

vagrant@kubernetes-node1:~/Docker-Certified-Associate-DCA-Exam-Guide/chapter9/nginx-lab/yaml$ kubectl get pvc
NAME             STATUS   VOLUME         CAPACITY   ACCESS MODES   STORAGECLASS   AGE
werbserver-pvc   Bound    webserver-pv   500Mi      RWO            manual         6m15s
```


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






kubectl create secret generic webserver-secret --from-literal=PAGETITLE="Docker_Certified_DCA_Exam_Guide" --from-literal=BODY="Hello_World_from_Secret" --dry-run=client -o yaml >webserver.secret.yaml

