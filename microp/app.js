//app.js

const util = require('static/js/libs/util')

const wxLogin = util.wxPromisify(wx.login)
const wxRequest = util.wxPromisify(wx.request)
const wxGetSetting = util.wxPromisify(wx.getSetting)
const wxGetUserInfo = util.wxPromisify(wx.getUserInfo)
const wxOpenSetting = util.wxPromisify(wx.openSetting)
const wxAuthorize = util.wxPromisify(wx.authorize)
const wxShowModal = util.wxPromisify(wx.showModal)

App({
  //获取openId
  fetchOpenId: function(){
    var that = this
    if (that.globalData.openId.length > 0){
      return Promise.resolve('')
    }
    return wxLogin().then(function(res){
      if (!res.code) {
        return Promise.reject('login error')
      }
      return wxRequest({
          url: that.globalData.url + '/login',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 默认值
          },
          data: {
            code: res.code
          }
        })
      }).then(function (rs) {
          if (parseInt(rs.data.code) === 200) {
            that.globalData.openId = rs.data.openid
          } else {
            console.log('get openid error:' + rs.data.msg)
          }
      }).catch(function (err) {
          console.log('error:'+err);
      })
  },
  
  requestUserInfoAuth:function(){
    var that = this
    return wxGetSetting().then(function (res) {
      console.log('get requestUserInfoAuth setting');
      console.log(res)
      /*res = {
        'authSetting':{
          'scope.userInfo':true
        }
      }*/
      if (res.authSetting['scope.userInfo']) {
        console.log('uinfo auth ok')
        return Promise.resolve('ok')
      }else{
        return Promise.resolve('needauth')
      }
    }).then(function(rs){
        if (rs == 'ok'){
          return Promise.resolve('')
        }
        console.log('goto auth requestUserInfoAuth')
        return wxAuthorize({
            scope: 'scope.userInfo',
        }).then(function(res){
          console.log('check --------')
          if (!res.authSetting['scope.userInfo']) {
            console.log('no scope.userInfo') 
            return wxShowModal({
              title: '用户未授权',
              content: '如需正常使用小程序功能，请按确定并且在【我的】页面中点击授权按钮，勾选用户信息并点击确定。',
              showCancel: false
            }).then(function(res){
                if (res.confirm) {
                  console.log('用户点击确定')
                  return Promise.resolve('')
                } else {
                  return Promise.reject('auth error,use choose deny')
                } 
              })
          } else {
            return Promise.reject('auth error')
          }
        })
    }).catch(function(err){
        console.log('------1----')
    })
  },
  requestUserLocAuth: function () {
    var that = this
    return wxGetSetting().then(function (res) {
      console.log('get requestUserLocAuth setting');
      console.log(res)
      /*res = {
        'authSetting': {
          'scope.userLocation': false
        }
      }*/
      if (res.authSetting['scope.userLocation']) {
        return Promise.resolve('')
      }
      console.log('location is not authed');
      return wxAuthorize({
        scope: 'scope.userLocation',
        }).then(function (res) {
          console.log('user authed requestUserLocAuth:')
          console.log(res)
          if (!res.authSetting['scope.userLocation']) {
            return wxShowModal({
              title: '用户未授权',
              content: '如需正常使用小程序功能，请按确定并且在【我的】页面中点击授权按钮，勾选用户信息并点击确定。',
              showCancel: false
            }).then(function(res){
                if (res.confirm) {
                  console.log('用户点击确定')
                  return Promise.resolve('')
                } else {
                  return Promise.reject('auth error,use choose deny')
                }
            })
          } else {
            return Promise.reject('auth error')
          }
        }).catch(function (res) {
          return Promise.reject('auth error')
        })
      })
  },

  // 获取用户信息
  retrieveUinfo:function(){
    var that = this
    return that.requestUserInfoAuth().then(function () {
      console.log('requestUserInfoAuth done')
      return that.requestUserLocAuth().then(function(){
        console.log('requestUserLocAuth done')
        return wxGetSetting().then(function (res) {
          console.log('get setting');
          console.log(res)
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          return wxGetUserInfo().then(function (res) {
            // 可以将 res 发送给后台解码出 unionId
            that.globalData.userInfo = res.userInfo
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            if (that.userInfoReadyCallback) {
              that.userInfoReadyCallback(res)
            }
          })
        })
      })
    }).catch(function (err) {
      console.log('getuserinfo error2')
      return Promise.reject('getuserinfo error2')
    })
  },

  onLaunch: function () {
    //
  },
  globalData: {
    url:'https://backend_remote', //全局 远端服务器域名
    userInfo: null,
    openId:'' //curr user openid
  }
})