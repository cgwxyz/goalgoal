#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

from tornado import gen
from tornado.web import RequestHandler
import json
from bson.objectid import ObjectId
from bson.json_util import dumps
import time
import utils


class JoinedHandler(RequestHandler):
    @gen.coroutine
    def get(self):
        pid = self.get_argument('primary_id',0)
        if pid == 0:
            self.write(json.dumps({'code':0,'msg':'no pid assigned'}))
        else:
            db = self.settings['db']
            curr_join_col = db['schedule_join']
            final_rs = {'code':200,'joined_list':[]}
            all_joined_cursor = curr_join_col.find({'sche_id':pid}).sort('t_join')
            while(yield all_joined_cursor.fetch_next):
                uinfo = all_joined_cursor.next_object()
                if uinfo is not None:
                    final_rs['joined_list'].append(uinfo)
            self.write(dumps(final_rs))
     
    @gen.coroutine
    def post(self):
        pid = self.get_argument('pid',0)
        if pid == 0:
            self.write(json.dumps({'code':0,'msg':'no pid assigned'}))
            return

        openid = self.get_argument('openId',0)
        if openid == 0:
            self.write(json.dumps({'code':0,'msg':'no openid assigned'}))
            return

        name = self.get_argument('name','')
        if name == '':
            self.write(json.dumps({'code':0,'msg':'no openid assigned'}))
            return

        avatar = self.get_argument('avatar','')
        if avatar == '':
            self.write(json.dumps({'code':0,'msg':'no avatar assigned'}))
            return

        form_id = self.get_argument('formId', 0)

        db = self.settings['db']
        curr_join_col = db['schedule_join']
        curr_col = db['schedule']
        curr_redis = self.settings['redis']

        schedule_info, join_info = yield [curr_col.find_one({'_id': ObjectId(pid)}),
                                         curr_join_col.find_one({'openid': openid, 'sche_id': pid})]
        if join_info is None:
            #goto add
            rs = curr_join_col.insert_one({"sche_id": pid,'status': 1,'openid': openid,'name': name,\
                                           'avatar': avatar, 't_join': int(time.time())})
            try:
                final_rs = {'code': 200}
                curr_access_token = curr_redis.get('micro_token')
                base_url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=%s'

                template_data = {
                    "touser": openid,
                    "template_id": 'YKDb172tDj5a-Pm8vqsf1tEnAG3zlVAAVLfbb155X30',
                    "page": '/pages/join/join?pid=%s' % pid,
                    "form_id": form_id,
                    "data": {
                        "keyword1": {
                            "value": "%s %s:00" % (schedule_info['date'], schedule_info['time'])
                        },
                        "keyword2": {
                            "value": schedule_info['area']
                        },
                        "keyword3": {
                           "value": schedule_info['contact']
                        },
                        "keyword4": {
                           "value": schedule_info['remark']
                        }
                    }
                }
                rs = yield utils.postWX(base_url % curr_access_token, json.dumps(template_data))
                self.write(json.dumps(final_rs))
            except AttributeError,e:
                self.write('{"code":0,"errorCode":"500","errorMsg":"insert to Db error"}')
            finally:
                pass
        else:
            if join_info['status'] == 1:#donothing
                final_rs = {'code': 301}
                self.write(json.dumps(final_rs))
            else:#gotoupdate
                result = yield curr_join_col.update_one({'sche_id': pid, 'openid': openid, 'status': 0},\
                                                         {'$set': {'status': 1, 't_join': int(time.time())}})
                if result.modified_count == 1:
                    self.write(json.dumps({'code':200}))
                else:
                    self.write(json.dumps({'code':0,"msg":"update error"}))
            
 