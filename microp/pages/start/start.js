const _moment = require('../../static/js/libs/moment.min.js')
const app = getApp()
const util = require('../../static/js/libs/util')

const wxShowToast = util.wxPromisify(wx.showToast)
// pages/start/start.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: _moment().format('YYYY-MM-DD'),
    today: _moment().format('YYYY-MM-DD'),
    next_month: _moment().add(31,'d').format('YYYY-MM-DD'),
    start_time: _moment().add(10,'m').format('HH:mm'),
    end_time:"14:00",
    map_scale:15,
    show_location:true,
    host_name:'',
    area:'',
    latitude:'',
    longitude:'',
    remark_length:14,
    remark_max_length:200,
    remark:"请统一着装，提前15分钟到场",
    showLoading: true,
    markers: [{
      iconPath: "/static/imgs/marker.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 50,
      height: 50
    }],
    hots:[],
  },

  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
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
    that.cancelLoading()
    app.fetchOpenId().then(() => {
      console.log('get openid done')
      return app.retrieveUinfo()
    }).then(() => {
      console.log('goto fetch detail')
      var app_data = app.globalData;
      that.setData({
        host_name: app.globalData.userInfo.nickName,
        area: options.area,
        latitude: options.latitude,
        longitude: options.longitude
      })
    }).catch(function (err) {
      console.log('获取用户信息失败:' + err)
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

  showDialog:function(content){
    wx.showModal({
      content: content,
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('confirmed')
        }
      }
    });
  },
  
  formSubmit: function(e) {
    var that = this;
    if (that.data.area == undefined || (that.data.area == '' && that.data.area.length == 0) || that.data.latitude == '' ) {
      that.showDialog("请从地图中选择场馆所在地")
      return false
    }
    that.showLoading();
    wx.request({
      url: app.globalData.url + '/schedule', //仅为示例，并非真实的接口地址
      data: {
        openId:app.globalData.openId,
        date:that.data.date,
        time:that.data.start_time,
        host_tel: that.data.host_tel,
        host_name: that.data.host_name,
        area: that.data.area,
        address: that.data.address,
        longitude: that.data.longitude,
        latitude: that.data.latitude,
        remark: that.data.remark,
        ss:Math.random()
      },
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        that.cancelLoading();
        if(res.data.code==200){
          wxShowToast({
            title:'成功',
            icon:'success',
            duration:2000
          }).then(function(){
            wx.navigateTo({
              url: '../join/join?pid=' + res.data.primary_id
            })
          }).catch(function(err){
            //donothing
          })
        }
      },
      fail: function (res) {
        that.cancelLoading();
        that.showDialog("发起活动失败，错误:"+red.data.msg)
      }
    });
  },

  formReset: function() {
    console.log('form发生了reset事件')
  },

  getContactTel:function(e){
    this.setData({
      host_tel:e.detail.value
    });
  },

  getContactName: function (e) {
    this.setData({
      host_name: e.detail.value
    });
  },

  saveContactPerson:function(e){
    this.setData({
      contact_person:e.detail.value
    });
  },
  saveContactTel: function (e) {
    this.setData({
      contact_tel: e.detail.value
    });
  },

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindStartTimeChange: function (e) {
    this.setData({
      start_time: e.detail.value
    })
  },
  gotoChooseLocation:function(e){
    var that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.chooseLocation({
          latitude: latitude,
          longitude: longitude,
          scale: 28,
          success:function(res){
            console.log(res);
            that.setData({
              area:res.name,
              address:res.address,
              longitude: res.longitude,
              latitude: res.latitude,
            });
          },
          complete:function(e){console.log('complete')}
        })
      },
      fail:function(e){
        console.log('auth failed,retry');
      }
    })
  },
  handleRemarkInput:function(e){
    var curr_inputed = e.detail.value.length;
    this.setData({
      remark_length: curr_inputed
    });
    console.log(e.detail.value);
    console.log(curr_inputed)
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})