#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

from tornado import gen
from tornado.web import RequestHandler
import config,utils
import json


class AuthHandler(RequestHandler):
    @gen.coroutine
    def post(self):
        code = self.get_argument('code', '')
        if code == '':
            self.write(utils.echoJson(0, 'no code received'))
            return
        
        curr_redis = self.settings['redis']
        curr_access_token = curr_redis.get('micro_token')
        base_url = 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=%s' 
        base_url = base_url % (config.MICROP_APP_ID, config.MICROP_APP_SECRET, code, curr_access_token)
        rs = yield utils.requestWX(base_url, 'GET')
        rs_json = json.loads(rs)
        try:
            curr_redis.set('microp_'+rs_json['openid'], rs_json['session_key'], 86400)
            self.write('{"code":200,"openid":"%s"}' % rs_json['openid'])
        except KeyError,e:
            self.write('{"code":0,"errorCode":"%s","errorMsg":"%s"}' % (rs_json['errcode'],rs_json['errmsg']))
        finally:
            pass