FROM alpine AS compiler 
RUN apk update && \ 
apk add --update -q --no-cache alpine-sdk 
RUN mkdir /myapp 
WORKDIR /myapp 
ADD helloworld.c /myapp 
RUN mkdir bin 
RUN gcc -Wall helloworld.c -o bin/helloworld 
 
FROM alpine 
COPY --from=compiler /myapp/bin/helloworld /myapp/helloworld 
CMD /myapp/helloworld