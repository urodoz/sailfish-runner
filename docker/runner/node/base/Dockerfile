FROM ubuntu:14.04
MAINTAINER Albert Lacarta <urodoz@gmail.com>

#Open SSH Server
RUN apt-get update
RUN apt-get install -y openssh-server
RUN apt-get install -y curl

RUN mkdir -p /var/run/sshd

RUN mkdir -p /workspace
WORKDIR /workspace

CMD ["/usr/sbin/sshd", "-D"]

RUN apt-get install -y build-essential