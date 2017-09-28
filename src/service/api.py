#coding:utf-8


import time
from flask import Blueprint,request,g
from camel.fundamental.application.app import instance

from .decorator import user_access_token_check
from camel.fundamental.framework.flask.webapi import CallReturn,ErrorReturn
from errors import ErrorDefs
import requests

# @user_access_token_check
def get_voucher():
    """
    获取票据
    :return:
    """
    access_user_id = request.values.get('username','') # 浏览器发送的当前登陆用户名称

    rhino_cfgs = instance.getConfig().get('services',{}).get('rhino_server',{})
    url = rhino_cfgs.get('auth_url')
    app_id = rhino_cfgs.get('app_id')
    secret_key = rhino_cfgs.get('secret_key')
    user_id = rhino_cfgs.get('user',access_user_id)

    params = {
        'app_id':app_id,
        'secret_key':secret_key,
        'user_id':user_id
    }
    resp = requests.post(url, data=params)
    content = resp.json()
    if content.get('status', -1) != 0:  # 0: okay else false
        return ErrorReturn(ErrorDefs.TicketInvalid).response

    result= content.get('result')

    return CallReturn().assign(result).response

# @user_access_token_check
def get_stations():
    """
    获取票据
    :return:
    """
    return CallReturn().response


# @user_access_token_check
def get_waybills():
    """
    根据车牌列表获取运单数据
    """
    car_names = request.values.get('carname', '')  # 取车牌列表
    names  = car_names.split(',')

    trans_list = instance.trans_list # 运单

    result =[]
    for trans in trans_list:
        entry ={
            'carname':trans.get('plate'),
            'name': trans.get('carrier_name'),
            'stime': trans.get('start_time'),
            'etime': trans.get('end_time'),
            'code': trans.get('trans_number'),#运单号
            'carid': trans.get('cq_number'), #车签号
            'routename': trans.get('line_name')  #线路名称
        }
        result.append(entry)
    return CallReturn().assign(result).response
