#!/bin/sh

CONFIGFILE="/etc/nginx/nginx.conf"

sed -i "s/__APPLICATION_PORT__/${APPLICATION_PORT}/g" ${CONFIGFILE}

#EXECUTE CMD ;P

exec "$@"
