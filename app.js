const eventBus = require('./utils/eventBus')
App({
  eventBus: eventBus,
  changeUserRight() {
    const id = wx.getStorageSync('rightId') || 0
    //const id = i === 0 ? 1 : 0
    //console.log('菜单类型:'+id)
    wx.setStorageSync('rightId', id)
    getApp().eventBus.emit('rightChange', id)
  },
  seesionId : '',
  openid:'',
  departmentId:'',//当前账号所属部门id
  departmentName:'',//当前账号所属部门名称
  terminalUserId:'',//登录用户id
  terminalName:'',//登录用户名称
     /**
 * 封装wx.request请求
 * method： 请求方式
 * url: 请求地址
 * data： 要传递的参数
 * callback： 请求成功回调函数
 * errFun： 请求失败回调函数
 **/
 wxRequest(method, url, data,seesionid, callback, errFun) {
  wx.showLoading();
  wx.request({
   url: url,
   method: method,
   data: data,
   header: {
    'content-type': method == 'GET'?'application/json':'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    "cookie":seesionid
   },
   dataType: 'json',
   success: function (res) { 
     //console.log(res)
     //超时  重新登录
    if(res.header["sessionstatus"] == "timeout"){
      const app = getApp()
      //console.log(app)
      wx.request({
        url : app.globalData.requestUrl+'/member/manage/silenceuserLogin',
        method : "POST",
        data: {
          openid:app.openid,
          projectId:app.projectId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded',
         },
         dataType: 'json',
         success: function (res) {
           //console.log(res)
          if (res.data.status == 'success'){
            var seesionId =res.header["Set-Cookie"]; 
            app.seesionId = seesionId
            console.log(app.seesionId)
            app.wxRequest(method, url, data,seesionId, callback, errFun)
          }else{
            if(res.data.path == "isInBlackList"){
              wx.redirectTo({
                url: '../error_tip/error_tip?msgCode=m_10001'
              })
            }
          }
        },
          fail: function () {
            
          }

      })
    }else{
      callback(res);
    }
   },
   fail: function (err) {
    console.log(err)
    errFun(err);
   },
   complete:(res) => {
    wx.hideLoading()
  }
  })
 },
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //初始tabl-bar type为0
    wx.setStorageSync('rightId', 0)
    //this.changeUserRight()
  },

  // 权限询问
  getRecordAuth: function () {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              console.log("succ auth")
            }, fail() {
              console.log("fail auth")
            }
          })
        } else {
          console.log("record has been authed")
        }
      }, fail(res) {
        console.log("fail")
        console.log(res)
      }
    })
  },
    globalData: {
    userInfo: null,
      // requestUrl:'http://47.92.38.70:8285'//线上
     
      requestUrl: 'http://192.168.20.59:8082'//本地
      //requestUrl:'http://221.216.95.200:8285'//35
     // requestUrl:'https://wxpu.diaochaonline.com'//35域名
      //requestUrl: 'https://wmccpu.diaochaonline.com'//线上
  },
  msgData:{
    m_10001:'抱歉，因为您之前的不规范操作，现已将您拉入黑名单，因此无法继续使用 “文明创城随手拍”小程序，进行不文明现象上报！',
    m_10002:'抱歉，您所在城市不在当前项目的执行城市范围之内，无法继续使用 “文明创城随手拍”小程序，进行不文明现象上报！',
    m_10003:'抱歉，您未授权获取您的地理位置，因此无法继续使用 “文明创城随手拍”小程序，进行不文明现象上报！请根据引导开启获取位置权限再试~',
    m_10004:'抱歉，您所在行政区域暂未开启“文明创城随手拍”相关活动,无法进行不文明现象上报！',
  }
   
})