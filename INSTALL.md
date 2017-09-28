
#Koala 系统安装部署

##1.运行环境
    # Centos7
    # MongoDB  (mongo_server)
        yum install mongodb
        mkdir -p /data/mongo
        mongod --dbpath=/data/mongo --logpath=/data/mongo.log --fork
        
        port=27017
        
        初始化 app 应用账号表 ( koala.application )
        python $project/tests/init_data.py 
        
        
    # Redis-Server (redis_server)
        yum install redis
        redis-server -a <password>
        
        port = 6379
        
    # QPID  (mq_server)
        yum install qpid
        service qpidd start
         
        /etc/qpid/qpidd.conf: 
            auto=no
            
        port = 5672  
        
    # 消息队列
        mq_gateway_1            queue durable 
        mq_gateway_broadcast    topic 
        mq_user_event_listener  topic 
        mq_messageserver        queue durable 
    
#2.运行配置
   
    设置主机名(/etc/hosts) 到对应的ip: 
       redis_server
       mongo_server
       mq_server  
          
##2.1 MGWS
    配置文件: 
    $project/etc/settings_mgws.yaml
    $project/etc/config.yaml
    $project/etc/serivce.xml
    
    socket: port=14002
    
    
##2.2 MAS
    $project/etc/settings_mas.xml
    
    http: port= 15555

##2.3 MEXS
    $project/etc/settings_mexs.xml
    $project/etc/server_eps.conf


        

#3.系统运行 
    
    bash $project/run/start-server-mexs.sh
    bash $project/run/start-server-mas.sh
    bash $project/run/start-server-mgws.sh
    