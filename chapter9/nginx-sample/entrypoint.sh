#!/bin/sh -x

#/usr/share/nginx/html
#/etc/nginx/nginx.conf
#/etc/nginx/conf.d

[ -n "${TEXT}" ] && sed -i "s|NON_DEFAULT_PAGE|${TEXT}|g" /html/index.html
[ -n "${TEXT}" ] && sed -i "s|DEFAULT_PAGE|${TEXT}|g" /usr/share/nginx/html/index.html

exec /usr/sbin/nginx -g 'daemon off;'
