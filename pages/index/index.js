//首页
// const regeneratorRuntime = require('../utils/runtime.js');
var app = getApp()
Page({
  data: {
    rightId:wx.getStorageSync('rightId') || 0,
    requestUrl: '',//服务器路径
    swiperIndex: 0, //初始化swiper索引
    swiperHeight: 350,
    // 问题栏默认值
    TabCur: null,
    // 轮播图数据
    swiperList: [],
    // 问题类型数据
    problemType: [],
    //任务列表数据
    taskList: [],
    //任务列表初始页（默认1）
    pagenum: 1,
    //赋值任务列表总页数（默认1）
    maxPageNum: 1,
    //空内容提示标识
    isNull: '',
    loadShow:'true',
    contentShow:'false',
    canIUseGetUserProfile:false,
    modalName:''
  },
//分享小程序
  onShareAppMessage: function (res) {
    return {
      title: '易拍查',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    that.loadModal(); //加载动画
    var requestUrl = app.globalData.requestUrl;
    that.setData({
      requestUrl:requestUrl
    })
    // console.log("这是啥",requestUrl)
    var govCode = wx.getStorageSync('code')
    var projectCode= wx.getStorageSync('project_code')
    console.log("code转过来了吗", govCode)
    console.log("code转过来了吗",projectCode )
    
    that.login(govCode,projectCode);
    //wx.clearStorage()
  },
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    // app.eventBus.on('rightChange', data =>{
    //   if(data !== this.data.rightId){
    //     this.setData({
    //       rightId: data
    //     })
    //   }
    // })
  },
  login(govCode,projectCode){
  // 获取用户信息
    let that = this;
    var requestUrl = that.data.requestUrl;
    if (!govCode) {
      var govCode='0'
    }
    var appId = wx.getAccountInfoSync().miniProgram.appId;
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: requestUrl+'/member/manage/userLogin',
            method: "GET",
            header: {
              "Content-Type": "application/json"
            },
            data: {
               govCode: govCode,
               projectCode:projectCode,
               code: res.code,
               appId:appId
            },
            success(res) {
              console.log("请求用户：",res)
              that.closeModal();
              if (res.data.status == 'success') {
                if(res.data.retObj.isInBlackList=='true'){
                  wx.redirectTo({
                    url: '../error_tip/error_tip?msgCode=m_10001'
                  })
                  return;
                }
                if(res.data.retObj.projectId=='0'){
                  wx.redirectTo({
                    url: '../error_tip/error_tip?msgCode=m_10004'
                  })
                  return;
                }
                if(res.data.retObj.govDelFlag=='0'){
                  wx.redirectTo({
                    url: '../error_tip/error_tip?msgCode=m_10005'
                  })
                  return;
                }
                var app = getApp();
                app.openid = res.data.retObj.openid;
                app.projectId = res.data.retObj.projectId;
                app.projectName = res.data.retObj.projectName;
                app.sessionKey = res.data.retObj.sessionKey;
                app.nickname = res.data.retObj.nickname;
                app.headUrl = res.data.retObj.headUrl;
                app.projectLat = res.data.retObj.projectLat;
                app.projectLog = res.data.retObj.projectLog;
                app.govName = res.data.retObj.govName;
                app.projectExeCity = res.data.retObj.projectExeCity=="0"?[]:res.data.retObj.projectExeCity;
                app.seesionId =res.header["Set-Cookie"]; 
                // app.judge = res.data.retObj.openid;
                wx.setStorageSync('projectId', app.projectId)
                wx.setStorageSync('nickname', app.nickname)
                wx.setStorageSync('projectLat', app.projectLat)
                wx.setStorageSync('projectLog', app.projectLog)
                wx.setStorageSync('code', govCode)
                wx.setStorageSync('fontSize',34);
                wx.setStorageSync('bgColor','purple');
                let menuType = 0;
                if(res.data.retObj2){
                  var list = res.data.retObj2.qxRole;
                  var terminalUserName = res.data.retObj2.sysUserName;
                  var departmentName = res.data.retObj2.departmentName
                  app.terminalUserId = res.data.retObj2.sysUserId;
                  app.terminalName = res.data.retObj2.sysUserName.split('#')[1];
                  app.departmentName = departmentName;
                //此角色只可设置一个  tab-bar最多可配置五个  最少两个
                for(let i=0; i<list.length; i++){
                  let menu = list[i]
                  if(menu.name == '责任单位-P'){//整改上报
                    menuType = 1
                  }else if(menu.name == '创文办-P'){//整改上传
                    menuType = 2
                  }
                }
                }
                that.changeRole(menuType)
                // console.log("这是初始化nickname：", app.nickname)
                // console.log("这是初始化openid：", app.openid)
                // console.log("项目id", res.data.retObj.projectId);
              //  if(res.data.retObj.updateInfo == 'true'){
              //   that.setData({
              //     canIUseGetUserProfile: true,
              //     modalName:'bottomModal'
              //   })
              //  }
                //用户没有绑定政府
                if(res.data.retObj.isGodCode==="false"){
                  wx.showToast({
                    title: '跳转中',
                    icon: 'loading',
                    duration: 6000
                  })
                  wx.reLaunch({
                        url: '../tip/tip'
                      })
                  
                }else{
                  //加载轮播图
                    //that.getSwiperList();
                    //加载问题栏
                    that.getProblemType();
                    //默认第一次加载任务列表（全部）
                    that.getTaskListAll();
                    that.setData({
                      loadShow:'false',
                      contentShow:'true',
                    })
                }
                
              } else {
                that.closeModal();
                // console.log('error')
              }

            }
          })
        } else {
          that.closeModal();
          console.log('登录失败！' + res.errMsg)
        }
      },
      fail(res){
        console.log('请求失败!')
        console.log(res)
      }
    })
},
  //改变tabbar
  changeRole(roleType){
    wx.setStorageSync('rightId', roleType)
    app.changeUserRight()
  },
 /*用户下拉页面时间 */
onPullDownRefresh:function(){
  var that = this;
  //console.log('下拉刷新')
  that.onLoad()
        //加载轮播图
      //   that.getSwiperList();
      // //加载问题栏
      // that.getProblemType();
      // //默认第一次加载任务列表（全部）
      // that.getTaskListAll();
  wx.stopPullDownRefresh();

  // wx.startPullDownRefresh({
  //   success:function(){

  //   }
  // })
},

  bindchange(e) {
    this.setData({
      swiperIndex: e.detail.current
    })
  },
  toswiper: function(e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    var requestUrl = that.data.requestUrl;
    wx.request({
      // url: "http://192.168.15.146:8080/home/manage/findViewArticle",
      url: requestUrl+"/home/manage/findViewArticle",
      data: {
        "viewId": id
      },
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success(res) {
        console.log(res)
        if (res.data.status === "success" && res.data.retObj != null) {
          that.setData({
            ArticleList: res.data.retObj,
            list: res.data.retObj.content.replace(/\\n/g, "\n")
          })
          wx.navigateTo({
            url: "../swiper/swiper?id=" + e.currentTarget.dataset.id
          })
        }
      }
    })
  },
  /**
   * 获取轮播图数据
   */
  getSwiperList() {
    var projectId = wx.getStorageSync('projectId')
    // console.log("项目idsdaddafsfadfsads",projectId)
    // console.log(projectId)
    let that = this;
    var requestUrl = that.data.requestUrl;
    
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/home/manage/searchViewPages",
      {
        "projectId": projectId
      },
      app.seesionId,
      (res) =>{
        if (res.data.status === "success") {
          that.setData({
            swiperList: res.data.retObj
          })
        }
      },
      (err) =>{

      }
    )

    // wx.request({
    //   url: requestUrl+"/home/manage/searchViewPages",
    //   // url: "http://192.168.15.146:8080/home/manage/searchViewPages",
    //   data: {
    //     "projectId": projectId
    //   },
    //   method: "GET",
    //   header: {
    //     "Content-Type": "application/json"
    //   },
    //   success(res) {
    //     // console.log(res);
    //     if (res.data.status === "success") {
    //       that.setData({
    //         swiperList: res.data.retObj
    //       })
    //     }
    //   }
    // })
  },

  /**
   * 获取问题类型数据
   */
  getProblemType() {
    var projectId = wx.getStorageSync('projectId')
    let that = this;
    var requestUrl = that.data.requestUrl;
    
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + '/home/manage/searchQuestionSorts',
      {
        "projectId": projectId
      },
      app.seesionId,
      (res) =>{
        // console.log(res);
        if (res.data.status === "success") {
          that.setData({
            problemType: res.data.retObj
          })
        }
      },
      (err) =>{

      }
    )
    // wx.request({
    //   url: requestUrl+"/home/manage/searchQuestionSorts",
    //   // url: 'http://192.168.15.146:8080/home/manage/searchQuestionSorts',
    //   data: {
    //     "projectId": projectId
    //   },
    //   method: "GET",
    //   header: {
    //     "Content-Type": "application/json"
    //   },
    //   success(res) {
    //     // console.log(res);
    //     if (res.data.status === "success") {
    //       that.setData({
    //         problemType: res.data.retObj
    //       })
    //     }
    //   }
    // })
  },
  /**
   * 动态改变问题类型的ID，传参加载ID下的任务列表
   */
  tabSelect: function(e) {
    var that = this;
    //console.log(e);
    //  给TabCurf赋值
    if (e.currentTarget.dataset.id != null) {
      this.setData({
        TabCur: e.currentTarget.dataset.id,
        //每次切换问题，清空问题列表
        taskList: [],
        //每次切换问题，给pagenum重新赋值为1
        pagenum: 1
      })
    } else {
      this.setData({
        taskList: [],
        TabCur: null,
      })
    }

    //根据问题Id发请求
    if (e.currentTarget.dataset.id != null) {
      //传参问题Id获取任务列表
      that.getTaskList(that.data.TabCur);
    } else {
      //获取全部任务列表
      that.getTaskListAll();
    }

  },


  /**
   * 获取任务列表数据
   * 第一次默认加载全部，这里只加载一次，后面根据当前问题的ID发送请求
   */
  getTaskList: function(e) {
    var projectId = wx.getStorageSync('projectId')
    var that = this;

var requestUrl = that.data.requestUrl;
    //console.log(e);
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + '/home/manage/searchTaskListIndex',
      {
        "sortId": e,
        "page": that.data.pagenum,
        "projectId": projectId
      },
      app.seesionId,
      (res) =>{
        //console.log(res);
        if (res.data.status === "success") {
          that.setData({
            taskList: that.data.taskList.concat(res.data.retObj),
            maxPageNum: res.data.retObj[0].maxPageNum,
            isNull: ''
          })
        } else {
          that.setData({
            isNull: 'true',
            maxPageNum: 1
          })
        }
      },
      (err) =>{

      }
    )
    // wx.request({

    //   url: requestUrl+"/home/manage/searchTaskListIndex",
    //   // url: "http://192.168.15.146:8080/home/manage/searchTaskList",
    //   data: {
    //     "sortId": e,
    //     "page": that.data.pagenum,
    //     "projectId": projectId
    //   },
    //   method: "GET",
    //   header: {
    //     "Content-Type": "application/json"
    //   },
    //   success(res) {
    //     //console.log(res);
    //     if (res.data.status === "success") {
    //       that.setData({
    //         taskList: that.data.taskList.concat(res.data.retObj),
    //         maxPageNum: res.data.retObj[0].maxPageNum,
    //         isNull: ''
    //       })
    //     } else {
    //       that.setData({
    //         isNull: 'true',
    //         maxPageNum: 1
    //       })
    //     }
    //   },
    //   fail: function(err) {}, //请求失败
    //   complete: function() {} //请求完成后执行的函数
    // })
  },
  //获取全部任务列表（页面加载）
  getTaskListAll: function() {
    var projectId = wx.getStorageSync('projectId')
    var that = this;
    var requestUrl = that.data.requestUrl;
    that.setData({
      //1、that.data.taskList  获取当前页面存的taskList数组
      //2、res.data.retObj   获取当前请求得到的taskList数组
      //3、xxx.concat  把新加载的数组追加到当前页面之后
      taskList:[],
      //从当前请求得到总页数给maxPageNum赋值
      maxPageNum: 1,
      isNull: '',
    })
    
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + '/home/manage/searchTaskListIndex',
      {
        "page": that.data.pagenum,
        "projectId": projectId
      },
      app.seesionId,
      (res) =>{
        if (res.data.status === "success") {
          // console.log("任务列表",res)
          that.setData({
            //1、that.data.taskList  获取当前页面存的taskList数组
            //2、res.data.retObj   获取当前请求得到的taskList数组
            //3、xxx.concat  把新加载的数组追加到当前页面之后
            taskList: that.data.taskList.concat(res.data.retObj),
            //从当前请求得到总页数给maxPageNum赋值
            maxPageNum: res.data.retObj[0].maxPageNum,
            isNull: '',
          })
        } else {
          isNull: 'true'
        }

      },
      (err) =>{

      }
    )
    // wx.request({
    //   url: requestUrl+"/home/manage/searchTaskListIndex",
    //   // url: "http://192.168.15.146:8080/home/manage/searchTaskList",
    //   data: {
    //     "page": that.data.pagenum,
    //     "projectId": projectId
    //   },
    //   method: "GET",
    //   header: {
    //     "Content-Type": "application/json"
    //   },
    //   success(res) {
    //     if (res.data.status === "success") {
    //       // console.log("任务列表",res)
    //       that.setData({
    //         //1、that.data.taskList  获取当前页面存的taskList数组
    //         //2、res.data.retObj   获取当前请求得到的taskList数组
    //         //3、xxx.concat  把新加载的数组追加到当前页面之后
    //         taskList: that.data.taskList.concat(res.data.retObj),
    //         //从当前请求得到总页数给maxPageNum赋值
    //         maxPageNum: res.data.retObj[0].maxPageNum,
    //         isNull: '',
    //       })
    //     } else {
    //       isNull: 'true'
    //     }
    //     // 隐藏加载框
    //     wx.hideLoading();
    //   },
    //   fail: function(err) {
    //     // console.log('gg')
    //   }, //请求失败
    //   complete: function() {} //请求完成后执行的函数
    // })

  },
  //上拉函数
  onReachBottom: function() { //触底开始下一页
    var that = this;
    var pagenum = that.data.pagenum + 1; //获取当前页数并+1
    that.setData({
      pagenum: pagenum, //更新当前页数
    })

    if (that.data.maxPageNum >= pagenum) {
      if (that.data.TabCur != null) {
        that.getTaskList(that.data.TabCur); //重新调用请求获取下一页数据
      } else {
        that.getTaskListAll(); //全部
      }
      // 显示加载图标
      wx.showLoading({
        title: '玩命加载中',
      })

    } else {
      // 显示加载图标
      wx.showLoading({
        title: '没有更多了',
      })

    }
    // 隐藏加载框
    setTimeout(function() {
      wx.hideLoading()
    }, 1000)


  },
  loadModal: function() {
    this.setData({
      loadModal: true
    })
  },
  closeModal:function(){
    this.setData({
      loadModal: false
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        var userInfo = res.userInfo
        this.setData({
          modalName : ''
        })
        var requestUrl = this.data.requestUrl;
        var openId = getApp().openid;
        //调用全局 请求方法
      app.wxRequest(
        'POST',
        requestUrl + '/member/manage/updateUserForWx',
        {
            "openId":openId,
            "nickName":userInfo.nickName,
            //"sex":userInfo.gender,
            //"city":userInfo.city,
            //"country":userInfo.country,
            //"province":userInfo.province,
            "language":userInfo.language
        },
        app.seesionId,
        (res) =>{

        },
        (err) =>{

        }
      )
        // wx.request({
        //   url: requestUrl+"/member/manage/updateUserForWx",
        //   data: {
        //     "openId":openId,
        //     "nickName":userInfo.nickName,
        //     "sex":userInfo.gender,
        //     "city":userInfo.city,
        //     "country":userInfo.country,
        //     "province":userInfo.province,
        //     "language":userInfo.language
        //   },
        //   method: "POST",
        //   header: {
        //     "Content-Type": "application/x-www-form-urlencoded"
        //   },
        //   success(res) {
        //     // console.log(res)
        //   }
        // })
      },
      fail:(res) =>{

      }
    })
  },
})