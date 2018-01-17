const app = getApp()
// pages/join/join.js
const util = require('../../static/js/libs/util')
const wxRequest = util.wxPromisify(wx.request)
const wxShowModal = util.wxPromisify(wx.showModal)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:'',
    showLoading:true,
    isOwner:false,//是否我组织，
    hasPast:false, //是否已经过期 当前时间超过了活动预计开始时间视为过期
    hasJoined:false,
    pid:'',
    openId:'',
    name:'',
    avatar:'',
    sche_date:'',
    sche_time: '',
    sche_area:'',
    sche_longitude:0,
    sche_latitude: 0,
    joined_count:0,//报名人数总计
    markers: [],
    joined_ulist:[]
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
    wx.showShareMenu({
      withShareTicket: true
    })
    this.setData({
      options: options
    })

    var that = this
    app.fetchOpenId().then(() => {
      console.log('get openid done')
      return app.retrieveUinfo()
    }).then(() => {
      console.log('goto fetch detail')
      var app_data = app.globalData;
      that.setData({
        pid: that.data.options['pid'],
        openId: app_data.openId,
        name: app_data.userInfo.nickName //当前用户名称
      })
      that.retrieveDetail(that, app_data, that.data.options['pid'], app_data.openId)
    }).catch(function(err){
      console.log('获取用户信息失败:'+err)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {
    
  },

  retrieveDetail: function (that, app_data, pid, curr_openId){
    return wxRequest({
        url: app_data.url + '/schedule', //获取当前预约活动信息
        data: {
          primary_id: pid,
          openId: curr_openId,
          action: 'detail',
          ss: Math.random()
        },
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        }
    }).then(function(res){
        console.log('get detail:'+res)
        if (res.data.code == 200) {
          that.cancelLoading()
          var tmp_markers = [{
            iconPath: "/static/imgs/marker.png",
            id: 0,
            latitude: res.data.schedule.latitude,
            longitude: res.data.schedule.longitude,
            width: 50,
            height: 50
          }];
          console.log(res.data.joined_list)
          that.setData({
            joined_count: res.data.count,
            sche_date: res.data.schedule.date,
            sche_time: res.data.schedule.time,
            sche_area: res.data.schedule.area,
            sche_latitude: res.data.schedule.latitude,
            sche_longitude: res.data.schedule.longitude,
            markers: tmp_markers,
            hasJoined: res.data.joined,
            hasPast: res.data.hasPast,
            isOwner: res.data.isOwner,
            joined_ulist: res.data.joined_list
          })
        } else {
          that.showDialog("错误，" + res.data.msg)
        }
      }).catch(function(err){
        console.log('failed:'+err)
        that.cancelLoading()
      })
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
  onShareAppMessage: function (res) {
    var that = this
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: 'GoalGoal约战',
      path: '/pages/join/join?pid='+that.data.options.pid,
      success: function (res) {
        // 转发成功
        console.log('转发成功')
      },
      fail: function (res) {
        // 转发失败
        console.log('转发失败')
      }
    }
  },

  showDialog: function (content) {
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

  /**
   *  同一地点再次约战
   */
  reSchedule:function(){
    var that = this
    //copy 地点和经度 维度
    wx.navigateTo({
      url: '../start/start?area=' + that.data['sche_area'] + '&longitude=' + that.data['sche_longitude'] + '&latitude='+that.data['sche_latitude']
    })
  },

  /**
   * 获取当前用户名称
   */
  getContactName: function (e) {
    this.setData({
      name: e.detail.value
    });
  },

  /**
   * 我要参加
   */
  formSubmit:function(e){
    var that = this
    that.showLoading()
    wx.request({
      url: app.globalData.url + '/detail', //获取当前预约活动信息
      data: {
        pid: that.data.pid,//当前活动主键
        openId: app.globalData.openId,
        name: that.data.name, //名称
        avatar: app.globalData.userInfo.avatarUrl, //头像
        formId: e.detail.formId,
        ss: Math.random()
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        that.cancelLoading();
        if(res.data.code == 200){
          wx.redirectTo({
            url: '../join/join?pid='+that.data.pid
          })
        } else if (res.data.code == 301) {
          return wxShowModal({
            title: '操作提示',
            content: '您已经报名，无需重复参加',
            showCancel: false
          }).then(function (res) {
            //donothing
          }).catch(function(err){
            //donothing
          })
        }else{
          return wxShowModal({
            title: '操作提示',
            content: res.data.msg+',请联系管理员',
            showCancel: false
          }).then(function (res) {
            //donothing
          }).catch(function (err) {
            //donothing
          })
        }
      }
    })
  },
  showAllJoined:function(){
    var that = this
    wx.navigateTo({
      url: '../showall/showall?pid=' + that.data.options.pid + '&action=all' + '&area=' + that.data.sche_area + '&date=' + that.data.sche_date + '&time=' + that.data.sche_time + '&count=' + that.data.joined_count
    })
  },
  gotoGiveup: function () {
    var that = this
    return wxShowModal({
      title: '操作确认',
      content: '确定退出？',
      showCancel: true
    }).then(function (res) {
      if (res.confirm) {
        return Promise.resolve('confirm')
      } else {
        return Promise.reject('cancel')
      }
    }).then(function(res){
      return wxRequest({
        url: app.globalData.url + '/detail', //获取当前预约活动信息
        data: {
          pid: that.data.options['pid'],
          openId: app.globalData.openId,
          action: 'giveup',
          ss: Math.random()
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        }
      }).then(function(res){
        that.cancelLoading();
        if (res.data.code == 200) {
          wx.redirectTo({
            url: '../join/join?pid=' + that.data.options['pid']
          })
        } else {
          return wxShowModal({
            title: '操作提示',
            content: res.data.msg,
            showCancel: false
          }).then(() => {
            //donothing
          }).catch(() => {
            //donothing
          })
        }
      }).catch(function(err){
        that.cancelLoading();
        return wxShowModal({
          title: '操作提示',
          content: '请求发生错误，'+err,
          showCancel: false
        }).then(()=>{
          //donothing
        }).catch(() => {
          //donothing
        })
      })
    }).catch(function(res){
      //cancel donothing
    })
  }
})