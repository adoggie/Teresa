#coding:utf-8

import sys
import os
import getopt
from server import run

def usage():
    print """usage: server.py -s service -i sid
    service - [ mas | mexs | mgws ]
    sid - [mgws_server | mexs_server ]
    """

if __name__ == '__main__':
    service_name = ''
    sid = ''
    options, args = getopt.getopt(sys.argv[1:], 'hs:i:', ['help', 'service=', 'config=','id='])  # : 带参数
    for name, value in options:
        if name in ['-h', "--help"]:
            usage()
            sys.exit()
        if name in ('-s', '--service'):
            service_name = value
        if name in ('-i','--id'):
            sid = value

    run('teresa')


