const app = getApp()
let sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
// pages/history/history.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true,
    openId:0,
    host_list:[],
    join_list: [],
    tabs: ["我发起的", "我参加的"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
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

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    
    app.fetchOpenId().then(() => {
      that.retrieveData('history')  //at first retireve history
    }).catch(function(err){
      console.log('get err:'+err)
    })
  },

  retrieveData:function(data_type){
    that = this
    wx.request({
      url: app.globalData.url + '/schedule', //获取当前预约活动信息
      data: {
        openId: app.globalData.openId,
        action: data_type,
        ss: Math.random()
      },
      method: 'GET',
      success: function (res) {
        console.log(res.data)
        if (parseInt(res.data.code) === 200) {
          that.setData({
            host_list: res.data.list,
            join_list: res.data.join_list
          })
        }
        that.cancelLoading()
      },
      fail: function (res) {
        console.log('failed')
        that.cancelLoading()
      }
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
  
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})