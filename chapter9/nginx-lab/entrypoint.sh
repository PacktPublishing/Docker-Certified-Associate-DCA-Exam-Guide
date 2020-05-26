#!/bin/sh -x

HTMLDIR=${HTMLDIR}

#/usr/share/nginx/html
#/etc/nginx/nginx.conf
#/etc/nginx/conf.d

if [ ! -f ${HTMLDIR}/index.html ] 
then
cat <<-EOF | tee ${HTMLDIR}/index.html
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

else

    [ -n "${PAGEBODY}" ] && sed -i "s|DEFAULT_BODY|${PAGEBODY}|g" ${HTMLDIR}/index.html
    [ -n "${PAGETITLE}" ] && sed -i "s|DEFAULT_TITLE|${PAGETITLE}|g" ${HTMLDIR}/index.html

fi



exec /usr/sbin/nginx -g 'daemon off;'
