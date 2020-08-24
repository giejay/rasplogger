FROM node:alpine3.11
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
ADD ./app /usr/src/app

WORKDIR /usr/src/app

RUN npm install
RUN chmod +x /usr/src/app/run.sh
CMD ["/usr/src/app/run.sh"]
#RUN node /usr/src/app/rasplogger.js cron pv "*/5 * * * *" ${URL}
