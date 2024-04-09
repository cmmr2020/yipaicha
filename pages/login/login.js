// 登录页面
const form = require("../../components/utils/formValidation.js")
// const md5 = require('../../libs/md5.js');
import md5 from '../../libs/md5.js';
//获取应用实例
const app = getApp()
Page({
  data: {
    requestUrl: '', //服务器路径
    fontSize:'',
    bgColor:'',
  },
  onLoad: function(options) {
    var that = this;
    // console.log(md5('123456'))
    //var fontSize = wx.getStorageSync('fontSize');
    //var bgColor = wx.getStorageSync('bgColor');
    var requestUrl = app.globalData.requestUrl;
    that.setData({
      requestUrl: requestUrl,
      // fontSize:fontSize,
      // bgColor:bgColor
    })
  },
  formSubmit: function(e) {
    var that = this;
    var requestUrl = that.data.requestUrl; //服务器路径
    //表单规则
    // let rules = [{
    //   name: "name",
    //   rule: ["required", "isChinese", "minLength:2", "maxLength:6"], //可使用区间，此处主要测试功能
    //   msg: ["请输入姓名", "姓名必须全部为中文", "姓名必须2个或以上字符", "姓名不能超过6个字符"]
    // }, {
    //   name: "pwd",
    //   rule: ["required", "isEnAndNo"],
    //   msg: ["请输入密码", "密码为8~20位数字和字母组合"]
    // }];
    let rules = [{
      name: "name",
      rule: ["required"], //可使用区间，此处主要测试功能
      msg: ["请输入姓名"]
    }, {
      name: "pwd",
      rule: ["required"],
      msg: ["请输入密码"]
    }];
    //进行表单检查
    let formData = e.detail.value;
    let checkRes = form.validation(formData, rules);
    if (!checkRes) {
      // console.log("跳转")
      var gov_code = 'TJBH01CS';
      var name = e.detail.value.name;
      if(gov_code){
        name = gov_code + '#' + name
      }
      var password = md5(e.detail.value.pwd);
      var openid = app.openid;
      // console.log("openid",openid)
      //校验。得到用户账号密码，后台判断返回信息跳转菜单页。
      // wx.navigateTo({
      //   url:"../menus/menu"
      // })

      //调用全局 请求方法
    app.wxRequest(
      'POST',
      requestUrl + '/member/manage/bindSurveyor',
      {
          openid: openid,
          name: name,
          password: password,
          appId:app.appId
      },
      app.seesionId,
      (res) =>{
        console.log("后台传输的数据：", res)
        if (res.data.status == 'success') {
          var list = res.data.retObj.qxMenus;
          var terminalUserName = res.data.retObj.terminalUserName;
          var departmentName = res.data.retObj.departmentName
          app.terminalUserId = res.data.retObj.terminalUserId;
          app.terminalName = res.data.retObj.terminalUserName.split('#')[1];
          app.departmentId = res.data.retObj.departmentId;
          app.departmentName = departmentName;
          let menuType = 0;
          //此角色只可设置一个  tab-bar最多可配置五个  最少两个
          for(let i=0; i<list.length; i++){
            let menu = list[i]
            if(menu.code == 'TC-0014'){//整改上报
              menuType = 1
            }else if(menu.code == 'TC-0015'){//整改上传
              menuType = 2
            }
          }
          that.changeRole(menuType)
          wx.navigateBack();
          //解决 当用户在一次使用小程序中，多次切换不同角色账号时，造成小程序值栈存满，页面无法跳转的问题
          //关闭所有页面，打开到应用内的某个页面
          // wx.reLaunch({
          //   url: '../user/user'
          // })
          // wx.navigateTo({
          //   url: '../menus/menu',
          //   success: function(res) {
          //     // 通过eventChannel向被打开页面传送数据
          //     res.eventChannel.emit('loginPage', {
          //       data: list,
          //       terminalUserName: terminalUserName,
          //       departmentName: departmentName
          //     })
          //   }
          // })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }

      },
      (err) =>{

      }
    )
    } else {
      wx.showToast({
        title: checkRes,
        icon: "none"
      });
    }
  },
  //改变tabbar
  changeRole(roleType){
    wx.setStorageSync('rightId', roleType)
    app.changeUserRight()
  },
  formReset: function(e) {
    // console.log("清空数据")
  }
})