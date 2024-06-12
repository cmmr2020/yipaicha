
//个人中心页面
var app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    requestUrl: '',//服务器路径
    icon: ['locationfill'],
    nick:'',
    avataUrl:'',
    icon: ['right'],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
     hidden: false,
     hidden1: true,
     //openid
      openid:'',
      userInfo: {},
      headeSrcPath: defaultAvatarUrl,//'../../images/ic_me.png',
      userName: "",
      userNickName: "微信用户",
      isLogin:false,
      avatarUrl: defaultAvatarUrl,
      theme: wx.getSystemInfoSync().theme,
      modalName:'',
      temp_userNickName:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(option) {
    let that = this
    if(app.nickname){
      that.setData({
        userNickName:app.nickname
      })
    }
    if(app.headUrl){
      that.setData({
        headeSrcPath:app.headUrl
      })
    }
  },
  onShow() {
    var that = this;
    var openid = app.openid;
    var requestUrl = app.globalData.requestUrl;
    if(app.terminalName){
      that.setData({
        openid: openid,
        requestUrl:requestUrl,
        userName: app.terminalName,
        isLogin:true
      })
    }else{
      that.setData({
        openid: openid,
        requestUrl:requestUrl
      })
    }

    let rightId = wx.getStorageSync('rightId') || 0
    //菜单类型0时  个人中心index为1  其他为2
    let num = rightId === 0 ? 1 : 2
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: num
      })
    }
    app.eventBus.on('rightChange', data =>{
      if(data !== rightId){
        num = rightId === 0 ? 2 : 3
        if (typeof this.getTabBar === 'function' &&
          this.getTabBar()) {
          this.getTabBar().setData({
            selected: num
          })
        }
      }
    })
  },
bindGetUserInfo: function (res) {
    if (res.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      //  console.log("信息如下：",res);
      //  console.log(res.detail.userInfo);
      //授权成功后,通过改变 hidden 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        hidden: true,
        hidden1: false
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法上报问题，请授权!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            // console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  getPhoneNumber:function(e){
    // console.log(e)
    // console.log(e.detail.errMsg)
    // console.log(e.detail.iv)
    // console.log(e.detail.encryptedData)
  },
 
 
  goTojubaodetail:function(){
    var that = this;
    var openid = that.data.openid;
    wx.navigateTo({
      url:"../jubaodetail/jubaodetail?openid="+openid
    })
  },
  goToLogin:function(){
    wx.navigateTo({
      url: "../login/login"
    })
  },
  goToabout:function(){
    wx.navigateTo({
      url: "../about/about"
    })
  },
  goToedit:function(){
    var that = this;
    var openid = that.data.openid;
    wx.navigateTo({
      url: "../editInfo/editInfo?openid="+openid
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
  },
  show_edit:function(){
    this.setData({
      modalName:'bottomModal'
    })
  },
  hideModal:function(){
    this.setData({
      modalName:''
    })
  },
  getNickName(e){
    console.log(e.detail.value)
    this.setData({
      temp_userNickName:e.detail.value
    })
  },
  updateUserInfoByWX(){
    let that = this;
    // console.log('昵称:',that.data.temp_userNickName)
    // console.log('头像:',that.data.avatarUrl)
    var requestUrl = that.data.requestUrl;
    var openId = that.data.openid;
    var n_name = that.data.temp_userNickName
    if(that.data.avatarUrl == defaultAvatarUrl){
      app.msg('请先设置头像')
    }
    wx.showLoading();
    wx.uploadFile({
      url: requestUrl + '/member/manage/updateUserForWx',
      filePath: that.data.avatarUrl,
      name: 'avatarUrl_'+openId,
      header: {
        'content-type':'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        "cookie":app.seesionId
       },
      formData: {
        'path':'avatarUrl_'+openId,
        "openId":openId,
        "nickName":n_name
      },
      success(res) {
          console.log(res)
          that.setData({
            headeSrcPath:that.data.avatarUrl,
            userNickName:n_name
          })
          that.hideModal()
      },
      //请求失败
      fail: function (err) {
      },
      complete: () => {
        wx.hideLoading()
      }
    })
        //调用全局 请求方法
      // app.wxRequest(
      //   'POST',
      //   requestUrl + '/member/manage/updateUserForWx',
      //   {
      //       "openId":openId,
      //       "nickName":n_name,
      //   },
      //   app.seesionId,
      //   (res) =>{
      //     console.log(res)
      //     this.setData({
      //       headeSrcPath:this.data.avatarUrl,
      //       userNickName:n_name
      //     })
      //     this.hideModal()
      //   },
      //   (err) =>{

      //   }
      // )

  },
  loginOut(){
    var requestUrl = this.data.requestUrl;
    wx.showModal({
      title: '提示',
      content: '您是否退出当前帐号?',
      success (res) {
        if (res.confirm) {
          //console.log('用户点击确定')
              //调用全局 请求方法
            app.wxRequest(
              'POST',
              requestUrl + '/member/manage/userLoginOut',
              {
                  "openId":app.openid
              },
              app.seesionId,
              (res) =>{
                console.log(res)
                if(res.status = 'success'){
                  //清空登录信息
                  app.departmentId = '',//当前账号所属部门id
                  app.departmentName ='',//当前账号所属部门名称
                  app.terminalUserId ='',//登录用户id
                  app.terminalName ='',//登录用户名称
                  //改变tabbar
                  wx.setStorageSync('rightId', 0)
                  app.changeUserRight()
                  wx.reLaunch({
                    url: '../menuBack/menuBack?c1='+wx.getStorageSync('code')+'&c2='+wx.getStorageSync('project_code')
                  })
                }else{
                  app.alert('操作失败')
                }
              },
              (err) =>{
                app.alert('操作失败')
              }
            )
        }
      }
    })
  }
})