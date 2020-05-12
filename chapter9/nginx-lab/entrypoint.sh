#!/bin/sh -x

HTMLDIR=${HTMLDIR}

#/usr/share/nginx/html
#/etc/nginx/nginx.conf
#/etc/nginx/conf.d

[ -n "${PAGEBODY}" ] && sed -i "s|DEFAULT_BODY|${PAGEBODY}|g" ${HTMLDIR}/index.html
[ -n "${PAGETITLE}" ] && sed -i "s|DEFAULT_TITLE|${PAGETITLE}|g" ${HTMLDIR}/index.html

exec /usr/sbin/nginx -g 'daemon off;'
