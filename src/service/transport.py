#coding:utf-8

"""
transport.py

车辆运输清单信息

"""

import time
import json
import hashlib
import traceback

import requests
import gevent
# import camel.biz.application.use_gevent
from camel.biz.application.camelsrv import instance
from camel.fundamental.utils.timeutils import timestamp_to_str

from camel.rhinoceros.connection import PostgreSqlConnection

def filter_trace_objects():
    """
    查询当前运输任务清单,返回手机号与车牌信息。
    与当日轨迹采集数据表 mo_data_yyyymmdd 进行数据差分处理，筛选出未采集到的车辆记录
    :return:
        {phone:plate,..}
    """

    #查询当日车辆有效轨迹记录
    db_cfgs = instance.getConfig().get('database_config',{})
    conn = PostgreSqlConnection(db_cfgs).open()
    cursor = conn.cursor()
    current = int(time.time())
    table = "mo_data_" + timestamp_to_str(current, fmt='%Y%m%d')
    sql = "select distinct(id) from {table} order by id ".format(table=table)
    cursor.execute(sql)
    moids ={}
    for row in cursor:
        moids[row[0].decode('utf-8')] = None

    # 差分哪些车辆未采集到有效定位数据
    unmatched = {}

    trans = get_trans_list()
    for tel,plate in trans.items():
        if not moids.has_key(plate):
            unmatched[tel] = plate
    return unmatched

def get_trans_list():
    """查询运营后台运单
    """
    yonmen_cfgs = instance.getConfig().get('yonmen_config', {})
    url = yonmen_cfgs.get('operator_url', '')
    m = hashlib.md5()
    m.update(yonmen_cfgs.get('password', ''))

    password = m.hexdigest()
    params = {'username': yonmen_cfgs.get('user'), 'password': password, 'role_type': 3, 'device_id': 'web_operation',
        'device_type': 2}
    resp = requests.get(url, params)
    data = resp.json().get('data', {})
    token = data.get('token')

    url = "https://operator.yonmen.com/trans/"
    params = {'token': token,
        'mobile': None,
        'trans_number': None,
        'line_names': None,
        'plate': None,
        'start_date': None,
        'end_date': None,
        'waybill_status': 500,
        'page_index': 1,
        'page_size': yonmen_cfgs.get('trans_query_size',5000)
        }
    resp = requests.get(url, params)
    data = resp.json().get('data', {})
    trans = data.get('trans', [])

    open('trans_test.json', 'w').write(json.dumps(trans))

    result = {}

    for _ in trans:
        tel, plate = _.get('driver_tel'), _.get('plate')
        if tel:
            result[tel] = plate
        else:
            instance.getLogger().error(u'trans data dirty(tel is null): %s' % _.get('voucher'))
    return trans

def queryTransList():
    """拉取运单记录
    :return:
    """
    wait_secs = instance.getConfig().get('yonmen_config', {}).get('trans_query_interval', 600)
    while True:
        print 'queryTransList..'
        try:
            instance.getLogger().debug('try to get_trans ..')
            instance.trans_list = get_trans_list()
            instance.getLogger().debug('get_trans size:%s', len(instance.trans_list))
        except:
            instance.getLogger().error(traceback.format_exc())
            gevent.sleep(10)
            continue
        gevent.sleep(wait_secs)

def init_trans_query_task():
    """
    启动运单查询任务
    :return:
    """
    print 'init_trans_query_task..'
    gevent.spawn(queryTransList)
