FROM alpine
RUN apk --update --no-progress --no-cache  add nodejs npm
ENV APPDIR /APP

WORKDIR ${APPDIR}

COPY simplestapp.js simplestapp.js
COPY simplestapp.html simplestapp.html
COPY reset.html reset.html
COPY package.json package.json
COPY dbconfig.json dbconfig.json
RUN npm install
#DEFAULT PORT 3000

ADD https://github.com/chartjs/Chart.js/releases/download/v2.3.0/Chart.js .
RUN chmod 755 Chart.js
USER 1000

CMD ["node","simplestapp.js","3000"]
EXPOSE 3000
