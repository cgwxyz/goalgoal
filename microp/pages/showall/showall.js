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
        var tmp_list = []
        for(var i=0;i<5;i++){
          tmp_list.push(res.data.joined_list[0])
        }
        that.setData({
          //joined_ulist: res.data.joined_list
          joined_ulist: tmp_list
        })
      } else {
        wxShowModal({
          title: '操作提示',
          content: res.data.msg,
          showCancel: false
        }).then(function (res) {
          //donothing
        }).catch(function (err) {
          //donothing
        })
      }
    }).catch(function (err) {
      that.cancelLoading()
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
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