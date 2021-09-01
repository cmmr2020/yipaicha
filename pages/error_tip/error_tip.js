// 轮播图详情页面
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     msg:'',
     govName:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
     var app = getApp();
     let m = app.msgData[options.msgCode];
     this.setData({
      govName : app.govName,
      msg:m
     })
  }


})