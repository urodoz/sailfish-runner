FROM ubuntu:14.04
MAINTAINER Albert Lacarta <urodoz@gmail.com>

#Open SSH Server
RUN apt-get install -y openssh-server

#Node JS
RUN apt-get install -y software-properties-common
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get update && apt-get install -y nodejs
RUN npm install -g npm

RUN mkdir -p /var/run/sshd

RUN mkdir -p /workspace
WORKDIR /workspace

CMD ["/usr/sbin/sshd", "-D"]