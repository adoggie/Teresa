#coding:utf-8



import os.path
from flask import Flask,send_file
from flask.ext.cas import login_required
from flask import render_template

from camel.biz.application.flasksrv import ServiceFlaskApplication,setup,instance,FlaskApplication
# from camel.fundamental.amqp import AmqpManager,AccessMode
from service.transport import init_trans_query_task

class TeresaService(ServiceFlaskApplication):
    def __init__(self,sid):
        ServiceFlaskApplication.__init__(self,name=sid)
        self.trans_list = [] #运单列表

    def init(self):
        ServiceFlaskApplication.init(self)
        self._setupRpc()
        self._setupDatabase()

    def _initFlaskApp(self):
        FlaskApplication._initFlaskApp(self,Flask(__name__))

        self._setupTemplates()


    def _initFlaskCors(self): pass

    def _setupDatabase(self):
        # self.db_pool = DatabaseConnectionPool(self.getConfig().get('database_config',{}))
        pass

    def _initSignal(self):
        pass

    def _setupTemplates(self):
        from werkzeug.routing import BaseConverter
        class RegexConverter(BaseConverter):
            def __init__(self, map, *args):
                self.map = map
                self.regex = args[0]

        self.app.url_map.converters['regex'] = RegexConverter

        @self.app.route('/<regex(".*\.html$"):template_name>')
        def _template_render(template_name):
            name = os.path.join(self.app.template_folder, template_name)
            return send_file(name)


    def _setupRpc(self):
        pass

    def _initBefore(self):
        # self.config_file = 'settings_mas.yaml'
        pass

    def _setupAmqp(self):
        pass

    def _setupKafka(self):pass
    def _setupCelery(self):pass
    def _setupZk(self):pass

    def run(self):
        print self.app.template_folder
        print self.app.root_path
        print self.app.instance_path

        init_trans_query_task()
        ServiceFlaskApplication.run(self)



    def _terminate(self):
        ServiceFlaskApplication._terminate(self)

Server = TeresaService

def run(sid=''):
    Server(sid).run()

if __name__=='__main__':
    run()

__all__= (run,)