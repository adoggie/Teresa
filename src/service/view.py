#coding:utf-8
from flask import Flask,send_file
from flask.ext.cas import login_required
from flask import render_template

from camel.fundamental.application.app import instance

def index():
    cfgs = instance.getConfig().get('services',{})
    rhino_server = cfgs.get('rhino_server',{}).get('url','')
    teresa_server = cfgs.get('teresa_server',{}).get('url','')

    return render_template('entiremonitor.html',rhino_server=rhino_server,teresa_server=teresa_server)

def replay():
    cfgs = instance.getConfig().get('services', {})
    rhino_server = cfgs.get('rhino_server', {}).get('url', '')
    teresa_server = cfgs.get('teresa_server', {}).get('url', '')

    return render_template('index.html',rhino_server=rhino_server)