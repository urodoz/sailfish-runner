FROM ubuntu:14.04
MAINTAINER Albert Lacarta <urodoz@gmail.com>

RUN apt-get update && apt-get install -y git-core openssh-server

RUN mkdir /var/run/sshd
RUN echo 'root:sailfish' | chpasswd

RUN mkdir -p /root/.ssh
ADD id_dsa.pub /opt/id_dsa.pub
RUN cat /opt/id_dsa.pub >> ~/.ssh/authorized_keys && rm /opt/id_dsa.pub

RUN chmod go-wrx ~
RUN chmod 700 ~/.ssh
RUN chmod 700 ~/.ssh/authorized_keys

ADD ssh_config /etc/ssh/sshd_config

EXPOSE 22
CMD /usr/sbin/sshd -D

RUN mkdir -p /repository
WORKDIR /repository