#coding:utf-8



"""

mongodb api:
  http://api.mongodb.com/python/current/tutorial.html

"""

from camel.fundamental.nosql.mongo import MongoConnection

dbname,host,port,user,password = 'koala','127.0.0.1',27017,'',''
dbname,host,port,user,password = 'koala','192.168.1.232',27017,'',''
conn = MongoConnection( dbname,host,port,user,password)

# print conn.db.application
# print dir(conn.db.application)


# conn.db.application.remove( {'app_id':'camel'})
# conn.db.application.insert( {'app_id':'camel','secret_key':'111111','realm':'camel'})
print conn.db.application.find_one()