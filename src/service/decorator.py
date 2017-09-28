#coding:utf-8

import time
import traceback
from functools import wraps

from flask import Blueprint,request,g
from camel.fundamental.application.app import instance

from camel.koala.webapi import CallReturn,ErrorDefs,ErrorReturn
from camel.koala.token import encode_user_token,decode_user_token


class ObjectBuilder(object):
    @staticmethod
    def create(data):
        """
        从 dict 数据生成 object 对象
        :param data:dict
        :return:
        """
        class _Object:pass
        if not isinstance(data,dict):
            return data
        newobj = _Object()
        for k,v in data.items():
            setattr( newobj,str(k),v)
        return newobj

def user_access_token_check(func):
    """
    验证用户请求携带的访问令牌是否合法，并解析获得用户信息赋值到 g.user 对象
    :param func:
    :return:
    """
    @wraps(func)
    def _wrapper(*args, **kwargs):
        ticket = request.values.get('ticket')
        if not ticket:
            return ErrorReturn(ErrorDefs.TicketInvalid).response

        try:
            encrypt_key = instance.getConfig().get('encryption', {}).get('secret_key', 'abc123')
            data = decode_user_token(ticket,encrypt_key)
            if not data:
                return ErrorReturn(ErrorDefs.TicketInvalid).response

            # app_id = data.get('app_id')
            # realm = data.get('realm')
            # create_time = data.get('create_time')
            # expire_time = data.get('expire_time')
            # user_id = data.get('user_id')

            user = ObjectBuilder.create(data)
            g.user = user
            if  int(time.time()) > user.expire_time:
                return ErrorReturn(ErrorDefs.TicketInvalid,errmsg=u'令牌已过期').response

            return func(*args, **kwargs)
        except:
            traceback.print_exc()
            return ErrorReturn(ErrorDefs.SystemError, errmsg=traceback.format_exc()).response
    return _wrapper

