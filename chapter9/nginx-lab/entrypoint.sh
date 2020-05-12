#!/bin/sh -x

HTMLDIR=${HTMLDIR}

#/usr/share/nginx/html
#/etc/nginx/nginx.conf
#/etc/nginx/conf.d

if [ -d ${HTMLDIR} ]
then

[ ! -f ${HTMLDIR}/index.html ] && cat <<-EOF |sudo tee ${HTMLDIR}/index.html
<!DOCTYPE html>
<html>
<head>
<title>EMPTY</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>EMPTY</h1>
</body>
</html>
EOF

fi


[ -n "${PAGEBODY}" ] && sed -i "s|DEFAULT_BODY|${PAGEBODY}|g" ${HTMLDIR}/index.html
[ -n "${PAGETITLE}" ] && sed -i "s|DEFAULT_TITLE|${PAGETITLE}|g" ${HTMLDIR}/index.html

sed -i "s/__WWWROOT__/${HTMLDIR}/g" /etc/nginx/conf.d/default.conf

exec /usr/sbin/nginx -g 'daemon off;'
