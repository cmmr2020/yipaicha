
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
      headeSrcPath: '../../images/ic_me.png',
      userNickName: "微信用户",
      avatarUrl: defaultAvatarUrl,
      theme: wx.getSystemInfoSync().theme,
      modalName:'',
      temp_userNickName:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    var that = this;
    var app = getApp();
    var openid = app.openid;
    var requestUrl = app.globalData.requestUrl;
    that.setData({
      openid: openid,
      requestUrl:requestUrl
    })
    // this.wxLogin();
    //查看是否授权
    // wx.getSetting({
    //   success: function (res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       console.log("用户授权了");
    //     } else {
    //       //用户没有授权
    //       console.log("用户没有授权");
    //     }
    //   }
    // })
 
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
    var requestUrl = this.data.requestUrl;
    var openId = this.data.openid;
    var n_name = this.data.temp_userNickName
        //调用全局 请求方法
      app.wxRequest(
        'POST',
        requestUrl + '/member/manage/updateUserForWx',
        {
            "openId":openId,
            "nickName":n_name,
        },
        app.seesionId,
        (res) =>{
          console.log(res)
          this.setData({
            headeSrcPath:this.data.avatarUrl,
            userNickName:n_name
          })
          this.hideModal()
        },
        (err) =>{

        }
      )

  }
})