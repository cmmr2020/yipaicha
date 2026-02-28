//举报上传页面
const QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
//同步js
//import regeneratorRuntime from '../../libs/regenerator-runtime/runtime.js';
let qqmapsdk;
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

const plugin = requirePlugin("WechatSI")

// 获取**全局唯一**的语音识别管理器**recordRecoManager**
const manager = plugin.getRecordRecognitionManager()

Page({
  data: {
    rightId: wx.getStorageSync('rightId') || 0,
    requestUrl: '', //服务器路径
    address: "正在获取地址...",
    longitude: 116.397452,
    latitude: 39.909042,
    // key: 'W4WBZ-TUD65-IDAIR-QPM36-HMFQ5-CGBZP',
    key: 'MYQBZ-CZ2W3-N5Z3H-YM2RD-BNDGZ-HHB2O',
    //框架属性
    CustomBar: app.globalData.CustomBar,
    //分类显示判断标志
    isShow: false,
    //框架测试多选框属性
    //ColorList: app.globalData.ColorList,
    //问题分类多选框数组
    problemType: [],
    //问题分类已选择显示数组
    showProblemType: [],
    //图片上传数据
    imgList: [],
    //视频上传数据
    videoList: [],
    //举报视频资源路径
    //videoSrcs:[],
    //地址图片或视频缩略图
    addressImgList: [],
    //地址图片或视频上传数据
    addressVideoList: [],
    //地址视频资源路径
    //addrvideoSrcs:[],
    //举报内容
    textareaAValue: '',
    //上传资源所属类别(举报or地址)
    type: '',
    //地址资源总长度   限制上传数量
    addslength: 0,
    //举报资源总长度  限制上传数量
    reportlength: 0,
    //举报描述
    desc: '',
    ids: [],
    test: [],
    //上传资源绑定的问题ID
    answerId: '',
    //openid
    openid: '',
    // 项目地址
    projectCity: '',
    // 用户地址
    userCity: '',
    bottomButtonDisabled: false, // 底部按钮disabled
    recording: false, // 正在录音
    recordStatus: 0, // 状态： 0 - 录音中 1- 翻译中 2 - 翻译完成/二次翻译
    resourceList: [], // 封装资源列表
    hidden: false,
    hiddenUser: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    addIsShow: true,
    addIsShowB: true,
    addIsShowA: false,
    i: 0,
    sortTipIsShow: false,
    sortNameBymodal: '',
    sortTipBymodal: '',
    locationName: '',
    isDisabled: true, //解决文本框 禁用显示空白的bug
    //点位名称动态下拉选
    inputValue: '',
    showDropdown: false,
    storageLocationNameList:new Array(),//缓存中的点位名称
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var requestUrl = app.globalData.requestUrl;
    var openid = app.openid;
    var projectId = wx.getStorageSync('projectId');
    var nickname = wx.getStorageSync('nickname');
    console.log("projectId", projectId)
    if (nickname) {
      // console.log("有值")
      this.setData({
        hidden: true
      })
    } else {
      // console.log("无值")
      this.setData({
        hiddenUser: true
      })
    }
    this.setData({
      requestUrl: requestUrl,
      openid: openid,
      projectId: projectId
    })
    this.initRecord()
    qqmapsdk = new QQMapWX({
      key: this.data.key
    });
    this.currentLocation();
    this.getProblemType();
  },
  onShow: function () {
    let that = this;
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    wx.getSetting({
      success(res) {
        //没有的话  引导用户开启后台定位权限
        if (!res.authSetting['scope.userLocation']) {
          wx.showModal({
            title: '提示',
            content: '上报问题需要获取您的位置信息,请根据引导开启权限 ！若拒绝授权,您将无法上报问题 ！',
            success(res) {
              if (res.confirm) {
                //二次验证  若没点选系统弹出的允许  则引导用户开启定位权限
                wx.getSetting({
                  success(res) {
                    if (!res.authSetting['scope.userLocation']) {
                      that.setData({
                        modalName: 'bottomModal'
                      })
                    }
                  }
                })
              } else if (res.cancel) {
                wx.redirectTo({
                  url: '../error_tip/error_tip?msgCode=m_10003'
                })
              }
            }
          })
        }
      }
    })
  },
  goSetting: function () {
    let that = this;
    that.setData({
      modalName: ''
    })
    wx.openSetting({
      success(res) {
        //console.log(res.authSetting)
        if (res.authSetting['scope.userLocation']) {
          that.currentLocation();
        }
      }
    })
  },
  //地址拍摄的控制
  addressGoA: function () {
    this.setData({
      addIsShow: false,
      addIsShowA: true,
      addIsShowB: false
    })
  },
  addressGoB: function () {
    this.setData({
      addIsShow: true,
      addIsShowA: false,
      addIsShowB: true,
      addressImgList: [],
      addressVideoList: []
    })

  },


  bindGetUserInfo: function (res) {

    if (res.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      // console.log("信息如下：",res);
      // console.log(res.detail.userInfo);
      //授权成功后,通过改变 hidden 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        hidden: true,
        hiddenUser: false
      });
      var requestUrl = that.data.requestUrl;
      var city = res.detail.userInfo.city;
      var country = res.detail.userInfo.country;
      var gender = res.detail.userInfo.gender;
      var language = res.detail.userInfo.language;
      var nickName = res.detail.userInfo.nickName;
      var province = res.detail.userInfo.province;
      var openid = that.data.openid;

      //调用全局 请求方法
      app.wxRequest(
        'POST',
        requestUrl + '/member/manage/saveUser', {
          city: city,
          country: country,
          gender: gender,
          language: language,
          nickName: nickName,
          province: province,
          openid: openid
        },
        app.seesionId,
        (res) => {

        },
        (err) => {

        }
      )
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
  /**
   * 按住按钮开始语音识别
   */
  streamRecord: function (e) {
    console.log("streamrecord", e)
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success () {
              
            },
            fail(){
              wx.showModal({
                title: '提示信息',
                content: '您拒绝授权麦克风权限,将无法使用语音转换功能',
                showCancel:true,
                cancelText:'知道了',
                confirmText:'授权',
                success (res) {
                  if (res.confirm) {
                    that.setData({
                      modalName: 'bottomModal'
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
            })
              console.log('用户拒绝')
              return
            }
        })
      }
    }
    })
    wx.showToast({
      title: '请按住讲话~',
      icon: 'loading',
      //image: '/images/loading_transition.gif',
      duration: 60000,
      success: function (res) {

      },
      fail: function (res) {
        //console.log(res);
      }
    });
    manager.start({})
  },


  /**
   * 松开按钮结束语音识别
   */
  streamRecordEnd: function (e) {

    console.log("streamRecordEnd", e)
    wx.showToast({
      title: '正在转换~',
      icon: 'loading',
      duration: 1000,
      success: function (res) {

      },
      fail: function (res) {
        //console.log(res);
      }
    });
    manager.stop()
    this.setData({
      bottomButtonDisabled: true,
    })
  },
  /**
   * 识别内容为空时的反馈
   */
  showRecordEmptyTip: function () {
    this.setData({
      recording: false,
      bottomButtonDisabled: false,
    })
    wx.showToast({
      title: '请大声点~',
      icon: 'success',
      image: '/images/no_voice.png',
      duration: 1000,
      success: function (res) {

      },
      fail: function (res) {
        //console.log(res);
      }
    });
  },


  /**
   * 初始化语音识别回调
   * 绑定语音播放开始事件
   */
  initRecord: function () {
    //有新的识别内容返回，则会调用此事件
    manager.onRecognize = (res) => {
      //console.log('新的内容');
    }

    // 识别结束事件
    manager.onStop = (res) => {
      let text = res.result
      //console.log(text)
      if (text == '') {
        this.showRecordEmptyTip()
        return
      }
      this.data.desc = text
      this.setData({
        desc: text
      })

    }

    // 识别错误事件
    manager.onError = (res) => {

      this.setData({
        recording: false,
        bottomButtonDisabled: false,
      })

    }

    // 语音播放开始事件
    wx.onBackgroundAudioPlay(res => {

      const backgroundAudioManager = wx.getBackgroundAudioManager()
      let src = backgroundAudioManager.src

      this.setData({
        currentTranslateVoice: src
      })

    })
  },

  /**
   * 获取问题类型数据
   */
  getProblemType() {
    var projectId = wx.getStorageSync('projectId');
    let that = this;
    var requestUrl = that.data.requestUrl;
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/home/manage/searchQuestionSorts", {
        "projectId": projectId
      },
      app.seesionId,
      (res) => {
        if (res.data.httpStatusCode === 200) {
          //console.log(res.data.retObj)
          if (res.data.retObj == undefined) {
            wx.redirectTo({
              url: '../error_tip/error_tip?msgCode=m_10004'
            })
            return
          }
          for (let i = 0; i < res.data.retObj.length; i++) {
            i.checked == false;
          }
          that.setData({
            problemType: res.data.retObj
          })
        }

      },
      (err) => {

      }
    )
    // wx.request({
    //   url: requestUrl+"/home/manage/searchQuestionSorts",
    //   // url: "http://221.216.95.200:8285/home/manage/searchQuestionSorts",
    //   data: {
    //     "projectId": projectId
    //   },
    //   success(res) {
    //     if (res.data.httpStatusCode === 200) {
    //        console.log(res.data.retObj)
    //       if(res.data.retObj == undefined){
    //         wx.redirectTo({
    //           url: '../error_tip/error_tip?msgCode=m_10004'
    //         })
    //         return
    //       } 
    //       for (let i = 0; i < res.data.retObj.length; i++) {
    //         i.checked == false;
    //       }
    //       that.setData({
    //         problemType: res.data.retObj
    //       })
    //     }
    //   }
    // })
  },




  regionchange(e) {
    // 地图发生变化的时候，获取中间点，也就是cover-image指定的位置
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      this.setData({
        address: "正在获取地址..."
      })
      this.mapCtx = wx.createMapContext("maps");
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: (res) => {
          //console.log(res)
          this.setData({
            latitude: res.latitude,
            longitude: res.longitude
          })
          this.getAddress(res.longitude, res.latitude);
        }
      })
    }
  },
  getAddress: function (lng, lat) {
    //根据经纬度获取地址信息
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lng
      },
      success: (res) => {
        console.log(res)
        // console.log(res.result.formatted_addresses.recommend)
        //this.checkExeProjectCity(res.result.address_component);
        this.setData({
          address: res.result.formatted_addresses.recommend + '【' + res.result.formatted_addresses.standard_address + '】' //res.result.address
        })
      },
      fail: (res) => {
        console.log(res)
        this.setData({
          address: "获取位置信息失败"
        })
      }
    })
  },
  //验证项目执行城市
  checkExeProjectCity: function (UserAddrData) {
    let app = getApp();
    //console.log(app.projectExeCity)
    //console.log(UserAddrData)
    var flag = true;
    if (app.projectExeCity == undefined) {
      return
    }
    if (app.projectExeCity.length > 0 && UserAddrData) {
      flag = false
      var projectExeCityList = app.projectExeCity
      for (let i = 0; i < projectExeCityList.length; i++) {
        var level = 1;
        let ExeCity = projectExeCityList[i];
        if (ExeCity.exeCity) {
          level = 2;
        }
        if (ExeCity.exeCounty) {
          level = 3;
        }
        if (level == 1) {
          if (UserAddrData.province == ExeCity.exeProvice) {
            flag = true;
            return;
          }
        } else if (level == 2) {
          if (UserAddrData.province == ExeCity.exeProvice && UserAddrData.city == ExeCity.exeCity) {
            flag = true;
            return;
          }
        } else if (level == 3) {
          if (UserAddrData.province == ExeCity.exeProvice && UserAddrData.city == ExeCity.exeCity && UserAddrData.district == ExeCity.exeCounty) {
            flag = true;
            return;
          }
        }
      }
    }
    if (!flag) {
      //console.log('d')
      wx.redirectTo({
        url: '../error_tip/error_tip?msgCode=m_10002'
      })
    }
  },
  getDps: function () {
    wx.getSystemInfo({
      success(res) {
        var isopendingwei = res.locationEnabled;
        if (isopendingwei == false) {
          wx.showModal({
            title: '提示',
            content: '请先开启手机GPS定位,然后点击刷新按钮重试',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                // console.log('用户点击确定')
              }
            }
          })
          return
        }
      }
    })

  },
  manualLocation() {
    let that = this
    wx.chooseLocation({
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      success(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.name + '【' + res.address + '】'
        })
        //console.log(res)
      },
      fail(res) {
        //console.log(res)
      }
    })
  },
  currentLocation() {
    //当前位置
    const that = this;
    //获取系统权限是否开启
    that.getDps();
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        that.getAddress(res.longitude, res.latitude);
        that.getLocationByUsert(res.longitude, res.latitude);
      },
      fail(res) {
        console.log('获取定位失败')
        console.log(res)
      }
    })
    var log = wx.getStorageSync('projectLog')
    var lat = wx.getStorageSync('projectLat')
    that.getLocationByProject(log, lat);

  },

  //经纬度获取用户位置
  getLocationByUsert: function (log, lat) {
    var that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: log
      },
      success: function (res) {
        let UserCity = res.result.address_component.city;
        that.setData({
          userCity: UserCity
        })
        console.log("用户地址：", UserCity)
        // that.userAndProject();
      }
    })
  },
  //经纬度获取项目位置
  getLocationByProject: function (log, lat) {
    var that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: log
      },
      success: function (res) {
        let projectCity = res.result.address_component.city;
        that.setData({
          projectCity: projectCity
        })
        // console.log("项目地址：",projectCity)
      }
    })
  },
  // 对比地址
  userAndProject: function () {
    var projectCity = this.data.projectCity;
    var userCity = this.data.userCity;
    if (projectCity != userCity) {
      this.showToast();
    }
  },
  //提示未开通服务，跳转首页
  showToast() {
    this.toast = this.selectComponent("#tui-tips-ctx")
    let params = {
      icon: true
    };
    params.title = "您所在的位置暂未开通服务";
    params.imgUrl = "/images/toast/info-circle.png";
    params.duration = 3000;
    this.toast.show(params);
    setTimeout(function () {
      wx.reLaunch({
        url: "../index/index"
      })
    }, 3000)
  },
  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          // src: res.tempImagePath
        })
      }
    })
  },
  startRecord() {
    this.ctx.startRecord({
      success: (res) => {
        // console.log('startRecord')
      }
    })
  },
  stopRecord() {
    this.ctx.stopRecord({
      success: (res) => {
        this.setData({
          //src: res.tempThumbPath,
          videoSrc: res.tempVideoPath
        })
      }
    })
  },
  error(e) {
    // console.log(e.detail)
  },
  showModal(e) {
    // console.log(e);
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  showModal2(e) {
    var type = e.currentTarget.dataset.type;
    this.data.type = type;
    this.setData({
      modalName: e.currentTarget.dataset.target,
    })
  },
  //选择问题分类取消按钮
  problemTypeCancel(e) {
    let that = this.data;
    let items = this.data.problemType;
    for (let i = 0; i < items.length; i++) {
      if (items[i].checked == true) {
        items[i].checked = false
      }
    }
    this.setData({
      problemType: items,
      showProblemType: items,
      isShow: false,
      modalName: null
    })
  },
  //选择问题分类  确认按钮
  problemTypeConfirm(e) {
    let that = this.data;
    var show = false;
    var showData = [];
    var num = 0;
    for (let i = 0; i < that.problemType.length; i++) {
      if (that.problemType[i].checked == true) {
        showData.push(that.problemType[i])
        num++
      }
    }
    if (num > 0) {
      show = true
    }
    this.setData({
      showProblemType: showData,
      isShow: show,
      modalName: null
    })
  },
  //问题分类多选框
  ChooseCheckbox(e) {
    let items = this.data.problemType;
    let values = e.currentTarget.dataset.value;
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      if (items[i].id == values) {
        items[i].checked = !items[i].checked;
        break
      }
    }
    this.setData({
      problemType: items
    })
  },
  ChooseImage(e) {
    var type = this.data.type;
    if (type == 'adds') {
      wx.chooseImage({
        count: 1, //默认9
        //sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        //sourceType: ['album', 'camera'], //从相册选择
        sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['camera'],
        success: (res) => {
          if (this.data.addressImgList.length != 0) {
            this.setData({
              addressImgList: this.data.addressImgList.concat(res.tempFilePaths),
              modalName: '',
              addslength: this.data.addslength + 1
            })
          } else {
            this.setData({
              addressImgList: res.tempFilePaths,
              modalName: '',
              addslength: this.data.addslength + 1
            })
          }
        },

      });
    } else {
      wx.chooseImage({
        count: 1, //默认9
        sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['camera'],
        success: (res) => {
          if (this.data.imgList.length != 0) {
            this.setData({
              imgList: this.data.imgList.concat(res.tempFilePaths),
              modalName: '',
              reportlength: this.data.reportlength + 1
            })
          } else {
            this.setData({
              imgList: res.tempFilePaths,
              modalName: '',
              reportlength: this.data.reportlength + 1
            })
          }
        }
      });
    }
  },
  chooseVideo() {
    let vm = this;
    //因为上传视频返回的数据类型与图片不一样  需要建缩略图的url放到数组中
    var urlArray = [];
    var obj = {
      'src': '',
      'poster': ''
    };
    var type = this.data.type;
    if (type == 'adds') {
      wx.chooseVideo({
        sourceType: ['camera'],
        compressed: false,
        maxDuration: 30,
        camera: 'back',
        success: (res) => {
          obj.src = res.tempFilePath
          obj.poster = res.thumbTempFilePath
          urlArray.push(obj)
          if (vm.data.addressVideoList.length != 0) {
            vm.setData({
              addressVideoList: vm.data.addressVideoList.concat(urlArray),
              modalName: '',
              addslength: vm.data.addslength + 1
            })
            //   vm.data.addrvideoSrcs.push(res.tempFilePath)
          } else {
            vm.setData({
              addressVideoList: urlArray,
              modalName: '',
              addslength: vm.data.addslength + 1
            })
            //    vm.data.addrvideoSrcs.push(res.tempFilePath)
          }
        }
      })
    } else {
      wx.chooseVideo({
        sourceType: ['camera'],
        compressed: false,
        maxDuration: 30,
        camera: 'back',
        success: (res) => {
          obj.src = res.tempFilePath
          obj.poster = res.thumbTempFilePath
          urlArray.push(obj)
          if (vm.data.videoList.length != 0) {
            vm.setData({
              videoList: vm.data.videoList.concat(urlArray),
              modalName: '',
              reportlength: vm.data.reportlength + 1
            })
            //  vm.data.videoSrcs.push(res.tempFilePath)
          } else {
            vm.setData({
              videoList: urlArray,
              modalName: '',
              reportlength: vm.data.reportlength + 1
            })
            //  vm.data.videoSrcs.push(res.tempFilePath)
          }
        }
      })
    }


  },
  ViewImageForreport(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  ViewVideoForreport(e) {
    // console.log("视频的啥？：", e);
    this.VideoContext = wx.createVideoContext('reportVideo' + e.currentTarget.dataset.index);
    this.VideoContext.requestFullScreen(0);
  },
  ViewImageForadds(e) {
    wx.previewImage({
      urls: this.data.addressImgList,
      current: e.currentTarget.dataset.url
    });
  },
  ViewVideoForadds(e) {
    this.VideoContext = wx.createVideoContext('addsVideo' + e.currentTarget.dataset.index);
    this.VideoContext.requestFullScreen(0);
  },
  start(e) {
    let fullScreen = e.detail.fullScreen;
    if (!fullScreen) {
      this.VideoContext.pause();
    } else {
      this.VideoContext.play();
    }

  },
  DelImg(e) {
    // 'reportImg' 举报图片  'reportVideo' 举报视频 'addsImg'地址图片 'addsVideo' 地址视频
    var type = e.currentTarget.dataset.type;
    wx.showModal({
      // title: '召唤师',
      content: '确定要删除这条图片/视频吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          if (type == "reportImg") {
            this.data.imgList.splice(e.currentTarget.dataset.index, 1);
            this.setData({
              imgList: this.data.imgList,
              reportlength: this.data.reportlength - 1
            })
          }
          if (type == "reportVideo") {
            this.data.videoList.splice(e.currentTarget.dataset.index, 1);
            this.setData({
              videoList: this.data.videoList,
              reportlength: this.data.reportlength - 1
            })
          }
          if (type == "addsImg") {
            this.data.addressImgList.splice(e.currentTarget.dataset.index, 1);
            this.setData({
              addressImgList: this.data.addressImgList,
              addslength: this.data.addslength - 1
            })
          }
          if (type == "addsVideo") {
            this.data.addressVideoList.splice(e.currentTarget.dataset.index, 1);
            this.setData({
              addressVideoList: this.data.addressVideoList,
              addslength: this.data.addslength - 1
            })
          }

        }
      }
    })
  },
  textareaAInput(e) {
    // console.log(e.detail.value)
    this.data.desc = e.detail.value;
  },
  hideModal(e) {
    // console.log("点击了",e)
    this.setData({
      modalName: null
    })
  },
  submit_syn: function () {
    var that = this;
    //获取系统权限是否开启
    wx.getSystemInfo({
      success(res) {
        var isopendingwei = res.locationEnabled;
        if (isopendingwei == false) {
          wx.showModal({
            title: '提示',
            content: '请先开启手机GPS定位,然后点击刷新按钮重试',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                // console.log('用户点击确定')
              }
            }
          })
        } else {
          that.submit_syn_ready();
        }
      }
    })
    var address = that.data.address;
    if (address == "正在获取地址...") {
      wx.showToast({
        title: '请点击刷新按钮获取位置',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return
    }
  },
  //提交按钮111
  submit_syn_ready: async function () {
    var that = this;
    //举报图片集合
    var reportImg = that.data.imgList;
    //举报视频集合
    var reportVideo = that.data.videoList;
    //地址图片集合
    var addsImg = that.data.addressImgList;
    //地址视频集合
    var addsVideo = that.data.addressVideoList;
    //问题分类
    var qustionSort = this.data.showProblemType;
    // 举报描述
    var desc = this.data.desc;
    if (qustionSort.length < 1) {
      wx.showToast({
        title: '请选择问题类型',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return
    }
    if ((reportImg.length + reportVideo.length) < 1) {
      wx.showToast({
        title: '请拍摄举报图片/视频',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return
    }
    //信息描述非必填
    // if (desc == '') {
    //   wx.showToast({
    //     title: '请填写信息描述',
    //     icon: 'none',
    //     duration: 1000,
    //     mask: true
    //   })
    //   return
    // };
    wx.showLoading({
      title: '上传中',
      mask: true
    })
    //举报图片
    for (var index = 0; index < reportImg.length; index++) {
      await that.reportImg_syn(reportImg[index], index).then((res) => {
        // console.log("举报图片上传完了resourceList:",that.data.resourceList);
      })
    }
    //举报视频
    for (var index = 0; index < reportVideo.length; index++) {
      await that.reportVideo_syn(reportVideo[index].src, index).then((res) => {
        // console.log("视频上传完了resourceList:",that.data.resourceList);
      });
    }
    //地址图片
    for (var index = 0; index < addsImg.length; index++) {
      await that.addsImg_syn(addsImg[index], index).then((res) => {
        // console.log("地址图片上传完了resourceList:",that.data.resourceList);
      })
    }
    //地址视频
    for (var index = 0; index < addsVideo.length; index++) {
      await that.addsVideo_syn(addsVideo[index].src, index).then((res) => {
        // console.log("地址视频上传完了resourceList:",that.data.resourceList);
      })
    }
    wx.hideLoading();
    var length = reportImg.length + reportVideo.length + addsImg.length + addsVideo.length;

    // 上传成功的资源长度
    var rsLength = that.data.resourceList.length;
    // console.log("上传成功总资源：", rsLength);
    // console.log("本地总资源:", length)
    // 资源全部上传成功 上传答案
    if (length == rsLength) {
      // wx.showToast({
      //   title: '资源上传中',
      //   icon: 'none',
      //   duration: 1000,
      //   mask: true
      // })
      that.uploadAnswerTrue();
    } else { //有资源上传失败
      wx.showToast({
        title: '有资源上传失败',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      // 清空资源列表
      that.setData({
        resourceList: []
      })
    }
  },
  //上传答案/资源
  uploadAnswerTrue: function () {
    var that = this;

    var openid = that.data.openid;
    var projectId = that.data.projectId;
    var requestUrl = that.data.requestUrl;
    //问题分类
    var qustionSort = that.data.showProblemType;
    //举报描述
    var desc = that.data.desc;
    //举报经纬度
    var longitude = that.data.longitude;
    var latitude = that.data.latitude;
    //举报地址
    var address = that.data.address;
    //自定义点位名称
    var locationName = that.data.locationName
    //问题分类
    var qustionSort = that.data.showProblemType;
    var sortIds = '';
    for (let i = 0; i < qustionSort.length; i++) {
      sortIds += qustionSort[i].id + ','
    }
    sortIds = sortIds.substring(0, sortIds.length - 1)
    var resourceList = that.data.resourceList;

    //发送请求到后台，存储：经纬度、地址、描述、问题ID 
    //调用全局 请求方法
    app.wxRequest(
      'POST',
      requestUrl + "/home/manage/createAnswer_syn", {
        "longitude": longitude,
        "latitude": latitude,
        "address": address,
        "locationName": locationName,
        "desc": desc,
        "qustionSort": sortIds,
        "openid": openid,
        "projectId": projectId,
        "resourceListStr": JSON.stringify(resourceList)
      },
      app.seesionId,
      (res) => {
        // console.log("上传答案结束,",res)
        if (res.data.status === 'success') {
          if(locationName){//将上传的点位名称放到本地缓存中
            var storageLocationNameList = that.data.storageLocationNameList
            var index = storageLocationNameList.indexOf(locationName)
            //如果是新的点位名称,则放到缓存list中
            if(index == -1){
              //如果数量大于5,则删除最早的
              if(storageLocationNameList.length >= 5) {
                storageLocationNameList.shift()
              }
              storageLocationNameList.push(locationName)
              wx.setStorageSync('storageLocationName',storageLocationNameList)
            }
            
          }
          wx.reLaunch({
            url: "../success/success"
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000,
            mask: true
          })
        }

      },
      (err) => {

      }
    )
    // wx.request({
    //   // url: "http://192.168.15.146:8080/home/manage/createAnswer",
    //   url: requestUrl+"/home/manage/createAnswer_syn",
    //   data: {
    //     "longitude": longitude,
    //     "latitude": latitude,
    //     "address": address,
    //     "desc": desc,
    //     "qustionSort": sortIds,
    //     "openid": openid,
    //     "projectId": projectId,
    //     "resourceListStr":JSON.stringify(resourceList)
    //   },
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   method: 'POST',
    //   dataType: 'json',
    //   success(res) {
    //       // console.log("上传答案结束,",res)
    //       if (res.data.status==='success') {
    //           wx.reLaunch({
    //             url: "../success/success"
    //           })
    //       }else{
    //         wx.showToast({
    //           title: res.data.message,
    //           icon: 'none',
    //           duration: 1000,
    //           mask: true
    //         })
    //       }
    //   },
    //   //请求失败
    //   fail: function(err) {
    //     // console.log("请求失败：", err)
    //   },
    //   complete: function() {} //请求完成后执行的函数
    // })
  },

  //举报图片集合
  reportImg_syn: function (filePath, index) {
    var that = this;
    var requestUrl = that.data.requestUrl; //服务器路径
    var projectId = that.data.projectId;
    var openid = that.data.openid;
    var resourceList = that.data.resourceList;
    //上传举报图片
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        // url: 'http://192.168.15.146:8080/home/manage/upload',
        url: requestUrl + '/home/manage/upload_syn',
        name: 'reportImg-' + index + '-' + openid,
        filePath: filePath,
        formData: {
          'key': 'reportImg-' + index + '-' + openid,
          'openid': openid,
          'projectId': projectId,
          'type': 0
        },
        success(res) {
          var imageMap = JSON.parse(res.data);
          if (imageMap.url != null && imageMap.url != '') {
            // 操作成功
            resolve(res.data)
            resourceList.push({
              url: imageMap.url,
              type: 0,
              style: 0,
              delUrl: imageMap.delUrl
            })
          } else {
            wx.showToast({
              title: '举报图片资源上传失败',
              icon: 'none',
              duration: 1000,
              mask: true
            })
          }

        },
        //请求失败
        fail: function (err) {},
        complete: () => {

        }
      })
    })
  },
  //举报视频集合
  reportVideo_syn: function (filePath, index) {
    var that = this;
    var requestUrl = that.data.requestUrl; //服务器路径
    var projectId = that.data.projectId;
    var openid = that.data.openid;
    var resourceList = that.data.resourceList;
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: requestUrl + '/home/manage/upload_syn',
        // url: 'http://192.168.15.146:8080/home/manage/upload',
        filePath: filePath,
        name: 'reportVideo-' + index + '-' + openid,
        formData: {
          'key': 'reportVideo-' + index + '-' + openid,
          'openid': openid,
          'projectId': projectId,
          'type': 2
        },
        success(res) {
          // console.log("后台返回的举报视频片数据：", res)
          var imageMap = JSON.parse(res.data);
          if (imageMap.url != null && imageMap.url != '') {
            // 操作成功
            resolve(res.data)
            resourceList.push({
              url: imageMap.url,
              type: 2,
              style: 0,
              delUrl: imageMap.delUrl
            })
          } else {
            wx.showToast({
              title: '举报视频资源上传失败',
              icon: 'none',
              duration: 1000,
              mask: true
            })
          }
        },
        //请求失败
        fail: function (err) {},
        complete: () => {
          // console.log('上传举报视频执行完毕');
        }

      })
    })
  },
  //地址图片集合
  addsImg_syn: function (filePath, index) {
    var that = this;
    var requestUrl = that.data.requestUrl; //服务器路径
    var projectId = that.data.projectId;
    var openid = that.data.openid;
    var resourceList = that.data.resourceList;
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        // url: 'http://192.168.15.146:8080/home/manage/upload',
        url: requestUrl + '/home/manage/upload_syn',
        filePath: filePath,
        name: 'addsImg-' + index + '-' + openid,
        formData: {
          'key': 'addsImg-' + index + '-' + openid,
          'openid': openid,
          'projectId': projectId,
          'type': 0
        },
        success(res) {
          // console.log("后台返回的地址图片数据：", res)
          var imageMap = JSON.parse(res.data);
          if (imageMap.url != null && imageMap.url != '') {
            // 操作成功
            resolve(res.data)
            resourceList.push({
              url: imageMap.url,
              type: 0,
              style: 1,
              delUrl: imageMap.delUrl
            })
          } else {
            wx.showToast({
              title: '地址图片资源上传失败',
              icon: 'none',
              duration: 1000,
              mask: true
            })
          }
        },
        //请求失败
        fail: function (err) {},
        complete: () => {
          // console.log('---上传地址图片执行完毕---');
        }
      })
    })
  },
  //地址视频
  addsVideo_syn: function (filePath, index) {
    var that = this;
    var requestUrl = that.data.requestUrl; //服务器路径
    var projectId = that.data.projectId;
    var openid = that.data.openid;
    var resourceList = that.data.resourceList;
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        // url: 'http://192.168.15.146:8080/home/manage/upload',
        url: requestUrl + '/home/manage/upload_syn',
        filePath: filePath,
        name: 'addsVideo-' + index + '-' + openid,
        formData: {
          'key': 'addsVideo-' + index + '-' + openid,
          'projectId': projectId,
          'openid': openid,
          'type': 2
        },
        success(res) {
          // console.log("后台返回的地址视频数据：", res)
          var imageMap = JSON.parse(res.data);
          if (imageMap.url != null && imageMap.url != '') {
            // 操作成功
            resolve(res.data)
            resourceList.push({
              url: imageMap.url,
              type: 2,
              style: 1,
              delUrl: imageMap.delUrl
            })
          } else {
            wx.showToast({
              title: '地址视频资源上传失败',
              icon: 'none',
              duration: 1000,
              mask: true
            })
          }
        },
        //请求失败
        fail: function (err) {},
        complete: () => {
          // console.log('上传地址视频执行完毕');
        }

      })
    })
  },
  alertTip: function (e) {
    if (!e.currentTarget.dataset.tips) {
      return
    }
    this.setData({
      sortNameBymodal: e.currentTarget.dataset.sortname,
      sortTipBymodal: e.currentTarget.dataset.tips,
      sortTipIsShow: true
    })
  },
  hideSortModal: function () {
    this.setData({
      sortTipIsShow: false
    })
  },

  saveLocationName(e) {
    let that = this
    if(e.detail.value.length > 0){
      //用户自定义输入,关闭弹窗
      that.setData({
        locationName: e.detail.value,
        showDropdown:false
      })
    }else{
      that.setData({
        locationName: e.detail.value
      })
    }
    
  },
  closePage(){
    this.setData({
      showDropdown:false
    })
  },
  onSearchInput(e) {
    var storageLocationNameList = wx.getStorageSync('storageLocationName');
    console.log(storageLocationNameList)
    if(storageLocationNameList){
      this.setData({
        storageLocationNameList : storageLocationNameList,
        dropdownHeight:storageLocationNameList.length*44,
        showDropdown:true
      })
    }
    // const inputValue = e.detail.value;
    // this.setData({ inputValue, showDropdown: true }); // 显示下拉列表
    // this.filterList(inputValue); // 过滤数据列表
  },
  filterList(inputValue) {
    const that =this;
    const originalList = that.data.originalList
    const filtered = [];
    for(let i=0; i<originalList.length;i++){
      if(originalList[i].name.includes(inputValue)){
        filtered.push(originalList[i])
      }
    }
    //手动添加其他选项
    filtered.push({name:'其他'})
   that.setData({ filteredList: filtered, dropdownHeight: filtered.length * 44}); // 设置过滤后的数据到页面数据对象中
  },
  onItemTap(e) {
    console.log(e)
    const selectedItem = e.currentTarget.dataset.item; // 获取选中的项（如果有需要）
    this.setData({ locationName: selectedItem,inputValue:selectedItem, showDropdown: false }); // 隐藏下拉列表，并更新输入框的值
    // 可选：执行其他操作，如跳转页面等
  },


})