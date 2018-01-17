#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

from __future__ import absolute_import
import os
import sys
import tornado.httpserver
import tornado.options
import tornado.ioloop
import tornado.web

import redis
import motor.motor_tornado
import config

from handlers import index, detail, initconfig, history, schedule, login, joined


import logging
from tornado import log

logger = logging.getLogger()
fm = log.LogFormatter(fmt='[%(asctime)s]%(color)s[%(levelname)s]%(end_color)s[(module)s:%(lineno)d] %(message)s',datefmt='%Y-%m-%d %H:%M:%S')
log.enable_pretty_logging(logger=logger)
logger.handlers[0].setFormatter(fm)


port = int(sys.argv[1].split('=')[1])
if port == 0:
    exit(1)

goal_mongodb = motor.motor_tornado.MotorClient(config.MONGO_SCHEMA).goalgoal
global_redis = redis.StrictRedis(host=config.REDIS_HOST, port=config.REDIS_PORT, db=0)


def main():
    application = tornado.web.Application([
            (r"/", index.IndexHandler),
            (r"/config", initconfig.ConfigHandler),
            (r"/login", login.AuthHandler),
            (r"/schedule", schedule.ScheduleHandler),
            (r"/detail", detail.DetailHandler),
            (r"/joined", joined.JoinedHandler),
            (r"/history", history.HistoryHandler),
        ],
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        template_path=os.path.join(os.path.dirname(__file__), "template"),
        db=goal_mongodb,
        redis=global_redis,
        logging=logging,
        debug=True
    )
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()

