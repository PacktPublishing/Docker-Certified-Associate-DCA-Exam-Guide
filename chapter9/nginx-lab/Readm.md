

- Already cloned book's repository [https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git](https://github.com/PacktPublishing/Docker-Certified-Associate-DCA-Exam-Guide.git).



```
$ vagrant ssh kubernetes-node2

vagrant@kubernetes-node2:~$ cat <<-EOF |sudo tee /mnt/index.html
<!DOCTYPE html>
<html>
<head>
<title>DEFAULT_PAGE</title>
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



kubectl create secret generic webserver-secret --from-literal=PAGETITLE="Docker_Certified_DCA_Exam_Guide" --from-literal=BODY="Hello_World_from_Secret" --dry-run=client -o yaml >webserver.secret.yaml

