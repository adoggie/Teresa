#coding:utf-8


"""

mongodb api:
  http://api.mongodb.com/python/current/tutorial.html

"""

import time
from flask import request,g
from camel.biz.application.flasksrv import instance
from camel.koala.token import encode_user_token
from camel.koala.webapi import CallReturn,ErrorDefs,ErrorReturn

def getTickets():
    """
    用户登陆业务服务器成功之后,业务服务器请求 分配用户访问令牌

    :param app_id
    :param secrect_key
    :param user_id  业务用户id
    :return:
    """
    app_id = request.values.get('app_id')
    secret_key = request.values.get('secret_key')
    user_id = request.values.get('user_id')

    db = instance.getMongoDatabaseConnection().db
    app = db.application.find_one({'app_id':app_id,'secret_key':secret_key})

    if not app:
        return ErrorReturn(ErrorDefs.ApplicationNotExisted).response
    realm = app.get('realm','koala')

    encrypt_key = instance.getConfig().get('encryption',{}).get('secret_key','abc123')
    ticket_duration = instance.getConfig().get('access_token_duration',864000)
    access_user = dict(app_id=app_id,user_id=user_id,realm=realm,create_time= int(time.time()) , expire_time= int(time.time()) + ticket_duration)
    token = encode_user_token(access_user,encrypt_key)

    return CallReturn(result=token).response


