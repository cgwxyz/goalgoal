#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

from tornado import gen
from tornado.web import RequestHandler
from bson.objectid import ObjectId
import time
import json
import utils


class DetailHandler(RequestHandler):
    @gen.coroutine
    def post(self):
        action = self.get_argument('action', '')
        openid = self.get_argument('openId', '')
        if openid == '':
            self.write(utils.echoJson(0, '非法访问,#10051'))
            return
 
        pid = self.get_argument('pid', 0)
        if pid == 0:
            self.write(utils.echoJson(0, '非法访问,#10052'))
            return

        form_id = self.get_argument('formId', 0)

        db = self.settings['db']
        curr_col = db['schedule']
        curr_join_col = db['schedule_join']

        schedule_info,join_info = yield [curr_col.find_one({'_id': ObjectId(pid)}),
                               curr_join_col.find_one({'sche_id': pid, 'openid': openid})]

        if schedule_info is None:
            self.write(utils.echoJson(0, '错误,#10056'))
            return

        if action == 'giveup':
            if join_info is None:#no data
                self.write(utils.echoJson(0, '非法访问,#10052'))
                return
            elif join_info['status'] == 0:#has give up
                self.write(utils.echoJson(0, '非法访问,#10052'))
                return
            else:#goto update
                result = yield curr_join_col.update_one({'sche_id': pid, 'openid': openid, 'status': 1},\
                                                         {'$set': {'status': 0}})
                if result.modified_count == 1:
                    self.write(json.dumps({'code': 200}))
                else:
                    self.write(utils.echoJson(0, '内部错误,#10050'))
            return

        name = self.get_argument('name', '')
        if name == '':
            self.write(utils.echoJson(0, '错误,#10054'))
            return

        avatar = self.get_argument('avatar', '')
        if avatar == '':
            self.write(utils.echoJson(0, '错误,#10055'))
            return

        if join_info is None:#goto add
            curr_redis = self.settings['redis']
            rs = curr_join_col.insert_one({"sche_id": pid, 'status': 1, 'openid': openid,\
                                           'name': name, 'avatar': avatar, 't_join': int(time.time())})
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
                #do nothing
            except AttributeError, e:
                self.write(utils.echoJson(0, '错误,#10050')) #update DB ERROR
            finally:
                pass
        else:
            self.write(utils.echoJson(301, '您已经报名了,请勿重复提交'))
