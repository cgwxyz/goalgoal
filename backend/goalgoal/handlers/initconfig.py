#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-


from tornado.web import RequestHandler
import json
import time


class ConfigHandler(RequestHandler):
    def get(self):
        self.write(json.dumps({"date": time.strftime('%Y-%m-%d', time.localtime(time.time())),\
                'hot':[{"id": 1, 'label': 'labe1'}, {"id": 2, 'label': 'labe12'}]}))
