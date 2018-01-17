#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-


from tornado import httpclient, gen, web
import config
import json


def echoJson(code, msg, data=[]):
    return json.dumps({'code': code, 'data': data, 'msg': msg})


@gen.coroutine
def requestWX(url, method):
    http_header = {'User-Agent': config.USER_AGENT,
                   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                   'Accept-Encoding': 'gzip, deflate',
                   'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
                   }

    httpclient.AsyncHTTPClient.configure(None,
                                         defaults=dict(user_agent=config.USER_AGENT))
    
    try:
        response = yield httpclient.AsyncHTTPClient().fetch(url, headers=http_header, method=method)
    except web.HTTPError as e:
        raise gen.Return('')
    finally:
        pass

    html = response.body if isinstance(response.body, str) \
        else response.body.decode()
    raise gen.Return(html)


@gen.coroutine
def postWX(url, post_data):
    http_header = {'User-Agent': config.USER_AGENT,
                   'Cache-Control': 'max-age=0',
                   'Content-Type': 'application/x-www-form-urlencoded',
                   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                   'Accept-Encoding': 'gzip, deflate',
                   'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
                   }

    httpclient.AsyncHTTPClient.configure(None,
                                         defaults=dict(user_agent=config.USER_AGENT))

    try:
        response = yield httpclient.AsyncHTTPClient().fetch(url, headers=http_header, body=post_data, method='POST')
    except web.HTTPError as e:
        raise gen.Return('')
    finally:
        pass

    html = response.body if isinstance(response.body, str) \
        else response.body.decode()
    raise gen.Return(html)

