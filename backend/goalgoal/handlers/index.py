#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

from __future__ import absolute_import, unicode_literals
from tornado.web import RequestHandler


class IndexHandler(RequestHandler):
    def get(self):
        self.render("index.html")
