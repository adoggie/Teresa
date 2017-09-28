#coding:utf-8

# import camel.biz.application.use_gevent
import gevent
from gevent import monkey
# monkey.patch_all()

from camel.koala.tcelib.conn_qpid import RpcConnectionQpidMQ,AF_READ

# mq = RpcConnectionQpidMQ.create('abc',host="rhinoceros/jiangxiaoyu@ytodev2",port="5672",
#     address="mq_messageserver;{create:always,node:{type:queue,durable:true}}",af=AF_READ)

from qpid.messaging import Connection
from qpid.util import URL


host="rhinoceros/jiangxiaoyu@ytodev2"
host="rhinoceros/jiangxiaoyu@118.190.89.205"
host="118.190.89.205"
port="5672"
addr = "mq_messageserver;{create:always,node:{type:queue,durable:true}}"
broker = "%s:%s" % (host, port)
conn = Connection(broker, reconnect=True, tcp_nodelay=True)
conn.open()
ssn = conn.session()
rcv = ssn.receiver(addr)
rcv.capacity = 4000

while True:
    m = rcv.fetch()
    ssn.acknowledge()
    print m
gevent.sleep(1000000)