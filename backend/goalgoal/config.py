import os, platform

version = '1.0'
OS = platform.system()
DIR = os.getcwd()
USER_AGENT='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36'

MICROP_APP_ID = '************' # APP_ID
MICROP_APP_SECRET = '*****' #APP_SECRET

REDIS_HOST = '127.0.0.1'
REDIS_PORT = 6379

MONGO_SCHEMA='mongodb://localhost:27017/goalgoal'
BASE_URL = 'https://api.weixin.qq.com/cgi-bin'


