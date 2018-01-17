#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

from tornado import gen
from tornado.web import RequestHandler
from bson.json_util import dumps
import json


class HistoryHandler(RequestHandler):
    @gen.coroutine
    def get(self):
        openid = self.get_argument('openid',0)
        if openid == 0:
            self.write(json.dumps({'code':0,'msg':'no openid assigned'}))
        else:
            db = self.settings['db']
            curr_col = db['schedule']
            final_rs = {'code':200,'host_list':[]}
            all_joined_cursor =  curr_col.find({'host_id':openid}).sort([('t_add',-1)])

            while(yield all_joined_cursor.fetch_next):
                uinfo = all_joined_cursor.next_object()
                if uinfo is not None:
                    final_rs['host_list'].append(uinfo)
            self.write(dumps(final_rs))
 