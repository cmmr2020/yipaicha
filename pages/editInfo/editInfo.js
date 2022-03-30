// pages/editInfo/editInfo.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId:'',
    uname:'',
    gname:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var openId = options.openid;
    if(!openId){
      wx.showToast({
        title: '获取用户失败!',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return;
    }else{
      this.setData({
        openId: options.openid,
    })
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      app.globalData.requestUrl+'/member/manage/getUser',
      {
        openId:options.openid,
      },
      app.seesionId,
      (res) =>{
        if (res.data.status == 'success') {
          //console.log(res)
          var obj = res.data.retObj;
          if(!obj.uname){
            return
          }
          var gname = '';
          if(obj.groupNname){
            gname = obj.groupNname;
          }
          this.setData({
            uname:obj.uname,
            gname:gname
          })
        }else{
          wx.showToast({
            title: '系统错误!',
            icon: 'none',
            duration: 1500,
            mask: true
          })
        }

      },
      (err) =>{
        wx.showToast({
          title: '系统错误!',
          icon: 'none',
          duration: 1500,
          mask: true
        })

      }
    )
    // wx.request({
    //   url: app.globalData.requestUrl+'/member/manage/getUser',
    //   method: "GET",
    //   data:{
    //     openId:options.openid,
    //   },
    //   header: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   success:(res)=>{
    //     if (res.data.status == 'success') {
    //       //console.log(res)
    //       var obj = res.data.retObj;
    //       if(!obj.uname){
    //         return
    //       }
    //       var gname = '';
    //       if(obj.groupNname){
    //         gname = obj.groupNname;
    //       }
    //       this.setData({
    //         uname:obj.uname,
    //         gname:gname
    //       })
    //     }else{
    //       wx.showToast({
    //         title: '系统错误!',
    //         icon: 'none',
    //         duration: 1500,
    //         mask: true
    //       })
    //     }
    //   },
    //   fail:()=>{
    //     wx.showToast({
    //       title: '系统错误!',
    //       icon: 'none',
    //       duration: 1500,
    //       mask: true
    //     })
    //   }
    // })
    }
  },

  textareaAInput(e) {
    this.setData({
      uname: e.detail.value
    })
  },
  textareaBInput(e) {
    this.setData({
      gname: e.detail.value
    })
  },
  back(){
    wx.navigateBack({
      delta: 1
    })
  },
  save(){
    var that = this;
    var uname = that.data.uname;
    var gname = that.data.gname;
    if(!uname){
      wx.showToast({
        title: '请输入您的姓名~',
        icon: 'none',
        duration: 1500,
        mask: true
      })
    }else{
    //调用全局 请求方法
    app.wxRequest(
      'POST',
      app.globalData.requestUrl+'/member/manage/updateUserForInfo',
      {
          openId:that.data.openId,
          uname:uname,
          gname:gname,
      },
      app.seesionId,
      (res) =>{
        if (res.data.status == 'success') {
          wx.showToast({
            title: '成功',
            icon: 'none',
            duration: 1500,
            mask: true,
            success:()=>{
              that.back();
            }
          })
        }else{
          wx.showToast({
            title: '系统错误!',
            icon: 'none',
            duration: 1500,
            mask: true
          })
        }
      },
      (err) =>{
        wx.showToast({
          title: '系统错误!',
          icon: 'none',
          duration: 1500,
          mask: true
        })

      }
    )
      // wx.request({
      //   url: app.globalData.requestUrl+'/member/manage/updateUserForInfo',
      //   method: "POST",
      //   data:{
      //     openId:that.data.openId,
      //     uname:uname,
      //     gname:gname,
      //   },
      //   header: {
      //     'Content-Type': 'application/x-www-form-urlencoded'
      //   },
      //   success:(res)=>{
      //     if (res.data.status == 'success') {
      //       wx.showToast({
      //         title: '成功',
      //         icon: 'none',
      //         duration: 1500,
      //         mask: true,
      //         success:()=>{
      //           that.back();
      //         }
      //       })
      //     }else{
      //       wx.showToast({
      //         title: '系统错误!',
      //         icon: 'none',
      //         duration: 1500,
      //         mask: true
      //       })
      //     }
      //   },
      //   fail:()=>{
      //     wx.showToast({
      //       title: '系统错误!',
      //       icon: 'none',
      //       duration: 1500,
      //       mask: true
      //     })
      //   }
      // })
    }
  }
})