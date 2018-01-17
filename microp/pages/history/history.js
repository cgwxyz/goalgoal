const app = getApp()
// pages/history/history.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true,
    openId:0,
    host_list:[]
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    var that = this
    app.fetchOpenId().then(() => {
      wx.request({
        url: app.globalData.url + '/schedule', //获取当前预约活动信息
        data: {
          openId: app.globalData.openId,
          action:'history',
          ss: Math.random()
        },
        method: 'GET',
        success: function (res) {
          console.log(res.data)
          if (parseInt(res.data.code) === 200) {
            
            that.setData({
              host_list:res.data.list
            })
          }
          that.cancelLoading()
        },
        fail: function (res) {
          console.log('failed')
          that.cancelLoading()
        }
      })
    }).catch(function(err){
      console.log('get err:'+err)
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