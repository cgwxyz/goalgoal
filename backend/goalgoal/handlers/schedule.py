#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

from tornado import gen
from tornado.web import RequestHandler
from bson.objectid import ObjectId
from bson.json_util import dumps
import json
import time
import utils


class ScheduleHandler(RequestHandler):
    @gen.coroutine
    def get(self):
        action = self.get_argument('action', 'detail')
        pid = self.get_argument('primary_id', '')
        openid = self.get_argument('openId', '')

        if openid == '':
            self.write(utils.echoJson(0, '非法访问,无法获取OpenID'))
            return

        db = self.settings['db']
        curr_col = db['schedule']
        curr_join_col = db['schedule_join']

        if action == 'member':
            if pid == '':
                self.write(utils.echoJson(0, '无法获取活动信息'))
                return

            final_rs = {'code': 200, 'joined_list': []}
            joined_top4_list_cursor = curr_join_col.find({'sche_id':pid,'status':1}).sort([('t_join', -1)]).limit(1000)
            while(yield joined_top4_list_cursor.fetch_next):
                document = joined_top4_list_cursor.next_object()
                if document is not None:
                    final_rs['joined_list'].append(document)
            self.write(dumps(final_rs))

        elif action == 'history':
            final_rs = {'code': 200, 'list': []}
            joined_top4_list_cursor = curr_col.find({'host_id': openid}).sort([('t_add', -1)]).limit(100)
            now = int(time.time())
            while(yield joined_top4_list_cursor.fetch_next):
                document = joined_top4_list_cursor.next_object()
                if document is not None:
                    sche_time_str = '%s %s:00' % (document['date'], document['time'])
                    sche_timestamp = int(time.mktime(time.strptime(sche_time_str, "%Y-%m-%d %H:%M:%S")))
                    document['hasPast'] = 1 if sche_timestamp < now else 0
                    final_rs['list'].append(document)
            self.write(dumps(final_rs))
        else: #detail
            if pid == '':
                self.write(utils.echoJson(0, 'no primary_id received'))
                return
            data_info, my_join_info, joined_count = yield [curr_col.find_one({'_id':ObjectId(pid)}),\
                                        curr_join_col.find_one({'openid': openid, 'sche_id': pid, 'status': 1}),\
                                        curr_join_col.find({'sche_id': pid, 'status': 1}).count()]

            if data_info is None:
                self.write(utils.echoJson(0, "没有找到活动信息"))
                return

            final_rs = {'code': 200, 'isOwner': False, 'hasPast': False, 'schedule': data_info,\
                        'joined_list': [], 'joined': False, 'count': joined_count}

            final_rs['joined'] = False if my_join_info is None else True
            final_rs['isOwner'] = True if data_info['host_id'] == openid else False
            sche_time_str = '%s %s:00' %(data_info['date'], data_info['time'])
            sche_timestamp = int(time.mktime(time.strptime(sche_time_str, "%Y-%m-%d %H:%M:%S")))
            now = int(time.time())
            final_rs['hasPast'] = True if sche_timestamp < now else False

            self.settings['logging'].info(final_rs)
            joined_top4_list_cursor = curr_join_col.find({'sche_id': pid, 'status': 1}).sort([('t_join', -1)]).limit(4)
            while(yield joined_top4_list_cursor.fetch_next):
                document = joined_top4_list_cursor.next_object()
                if document is not None:
                    final_rs['joined_list'].append(document)
            self.write(dumps(final_rs))

    @gen.coroutine
    def post(self):
        db = self.settings['db']
        curr_col = db['schedule']
        host_id = self.get_argument('openId', '')
        if host_id == '':
            self.write(utils.echoJson(0, '非法访问,无法获取OpenID'))
            return

        sche_date = self.get_argument('date', '')
        if sche_date == '':
            self.write(utils.echoJson(0, '请输入开始日期'))
            return

        sche_time = self.get_argument('time', '')
        if sche_time == '':
            self.write(utils.echoJson(0, '请输入开始时间'))
            return

        area = self.get_argument('area', '')
        if area == '':
            self.write(utils.echoJson(0, '请选择场馆地点'))
            return

        longitude = self.get_argument('longitude', 0)
        if longitude == 0:
            self.write(utils.echoJson(0, '请选择场馆地点'))
            return

        latitude = self.get_argument('latitude', 0)
        if latitude == 0:
            self.write(utils.echoJson(0, '请选择场馆地点'))
            return

        address = self.get_argument('address', '')
        if sche_time == '':
            self.write(utils.echoJson(0, '请选择场馆地点'))
            return

        contact = self.get_argument('host_name', '')
        if sche_time == '':
            self.write(utils.echoJson(0, '请输入组织者昵称'))
            return

        remark = self.get_argument('remark', '')

        insert_fields = {'host_id': host_id, 'date': sche_date, 'time': sche_time, 'area': area,\
                         'address': address, 'contact': contact, 'longitude': longitude,\
                         'remark': remark, 'latitude': latitude, 't_add': int(time.time())}
        result = yield curr_col.insert_one(insert_fields)
        self.settings['logging'].info('insert_one return')
        self.settings['logging'].info(result.inserted_id)
        self.settings['logging'].info(str(result.inserted_id))

        try:
            final_rs = {'code': 200, 'primary_id': str(result.inserted_id)}
            self.write(json.dumps(final_rs))
        except AttributeError, e:
            self.write('{"code":0,"errorCode":"500","errorMsg":"insert to Db error"}')
        finally:
            pass
