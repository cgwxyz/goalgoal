//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    count_start:0,
    count_join:0,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    defaultSize:'default'
  },
  onLoad: function () {
    var that = this
    app.fetchOpenId().then(() => {
      return app.retrieveUinfo()
    }).then(() => {
        that.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
    })
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  gotoSchedule:function(e){
    wx.navigateTo({
      url: '../start/start',
    })
  },
  gotoHistory: function (e) {
    wx.navigateTo({
      url: '../history/history',
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: 'GoalGoal约战',
      path: '/pages/index/index',
      imageUrl:'/static/imgs/goalgoal_5_4.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
