const app = getApp()
// pages/join/join.js
const util = require('../../static/js/libs/util')
const wxRequest = util.wxPromisify(wx.request)
const wxShowModal = util.wxPromisify(wx.showModal)

// pages/showall/showall.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: '',
    showLoading: true,
    sche_date: '',
    sche_time: '',
    sche_area: '',
    joined_count: 0,//报名人数总计
    joined_ulist: []
  },
  showLoading: function () {
    this.setData({
      showLoading: true
    })
  },
  cancelLoading: function () {
    this.setData({
      showLoading: false
    })
  },

  goBack:function(){
    wx.navigateBack({
      //
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: false
    })
    this.setData({
      options: options
    })

    var that = this
    app.fetchOpenId().then(() => {
      var app_data = app.globalData;
      that.setData({
        pid: that.data.options['pid'],
        joined_count: that.data.options['count'],
        sche_date: that.data.options['date'],
        sche_time: that.data.options['time'],
        sche_area: that.data.options['area'],
        openId: app_data.openId
      })
      that.retrieveMember(that, app_data, that.data.options['pid'], app_data.openId)
      .then(function(rs){
        //do nothing
      })
      .catch(function(err){
        wxShowModal({
          title: '操作提示',
          content: err,
          showCancel: false
        }).then(function (res) {
          //donothing
        }).catch(function (err) {
          //donothing
        })
      })
    }).catch(function (err) {
      console.log('获取用户信息失败:' + err)
    })
  },

  retrieveMember: function (that, app_data, pid, curr_openId) {
    return wxRequest({
      url: app_data.url + '/schedule', //获取当前预约活动信息
      data: {
        primary_id: pid,
        openId: curr_openId,
        action: 'member',
        ss: Math.random()
      },
      method: 'GET'
    }).then(function (res) {
      that.cancelLoading()
      if (res.data.code == 200) {
        that.setData({
          joined_ulist: res.data.joined_list
        })
        return Promise.resolve('ok');
      } else {
        return Promise.reject(res.data.msg);
      }
    }).catch(function (err) {
      that.cancelLoading()
      return Promise.reject(res.data.msg);
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    var app_data = app.globalData;
    that.retrieveMember(that,
      app_data,
      that.data.options['pid'],
      app_data.openId)
      .then(function (rs) {
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideNavigationBarLoading() //完成停止加载
      }).catch(function (err) {
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideNavigationBarLoading() //完成停止加载
      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})