const util = require('../../utils/util_time.js')
//import regeneratorRuntime from '../../libs/regenerator-runtime/runtime.js'
// 引入跳转js
import router from '../../utils/router.js';
var app = getApp();
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
Page({
  data: {
    requestUrl: '', //请求路径
    gradualColor: ["red", "#4a67d6"],
    //任务ID
    taskId: '',
    projectId: '', //项目id
    terminalUserId: '', //用户id
    dissent:0,//是否首页展示
    task_log_list: [],//任务日志集合
    can_qs: true,//权属异议选择框 与长期整改互斥  默认显示 未选中
    can_long: true,//长期整改选择框 与权属异议互斥  默认显示 未选中
    long_setTime: false,//长期整改结束日期选择框
    long_task_finish_Time: '',//长期整改结束时间
    process_auditContent: '',//整改审核审批意见
    //资源
    retObj: [],
    imgDescList: [{
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }], //图片对应描述
    voidDescList: [{
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }, {
      description: " "
    }], //视频对应描述 
    //举报图片
    reportImgSrc: [],
    //举报视频
    reportVideoSrc: [],
    //图片上传数据
    imgList_No: [],
    imgList_Dep: [],
    imgList: [],
    //视频上传数据
    videoList_No: [],
    videoList_Dep: [],
    videoList: [],
    //门头照资源
    imgList_door: [],
    //举报资源总长度  限制上传数量
    reportlength: 0,

    //上传资源绑定的问题ID
    answerId: '',

    //倒计时变量
    remainTimeText: '00:00',
    log: {},
    isRuning: false,
    //录音变量
    audioSrc: [],
    audioSrc_No: [],
    audioSrc_Dep: [],
    isShow: 1,
    isShow_No: 1,
    isShow_Dep: 1,
    modalHidden: true,
    fuzhi: 0, //定义一个变量来控制取消的时候不给已有的录音赋值  0-赋值，

    resourceList: [], //资源集合

    address: '', //地址
    latitude: '', //地址经纬度
    longitude: '',
    code: '', //任务编码
    isSwitch: false, //复选框是否权属异议，默认false
    dissent: 0, //是否权属异议,o否，1是
    longtask: 0,//是否权属异议,o否，1是
    textDesc: '', //文本描述
    i: 0,
    success: 0, //成功个数
    fail: 0, //失败个数
    locationName: '', //点位
    pointName: '', //点位类型
    questionContent: '', //问题
    checkShow: false, //是否显示责任单位审核资源
    auditContent: '',
    fontSize: '',
    fontSize28: '',
    fontSize35: '',
    bgColor: '',
    // 0待整改（未整改/整改不达标继续整改）  1 已整改 2 长期整改 3 整改合格 4 待审核
    tabCur: '',
    update_select_dept: ''//选中的部门
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    var terminalUserId = app.terminalUserId;
    var taskId = e.id;
    var projectId = e.projectId;
    var tabCur = e.tabCur
    var pageScrollto_id = e.pageScrollto_id
    var search_param_str = e.search_param_str
    var maxPageNum = e.maxPageNum
    var pagenum = e.pagenum
    var title = '';
    var departmentId = '';
    //console.log(tabCur)
    if (tabCur == 0) {
      title = '整改合格'
    } else if (tabCur == 1) {
      title = '未整改'
    } else if (tabCur == 2) {
      title = '多次待审核'
    } else if (tabCur == 3) {
      title = '初次待审核'
    } else if (tabCur == 4) {
      title = '权属异议'
      departmentId = e.departmentId
    } else if (tabCur == 5) {
      title = '长期整改'
    }
    wx.setNavigationBarTitle({
      title: title
    })
    var requestUrl = app.globalData.requestUrl; //请求路径
    var fontSize = wx.getStorageSync('fontSize');
    var bgColor = wx.getStorageSync('bgColor');
    that.setData({
      requestUrl: requestUrl,
      taskId: taskId,
      tabCur: tabCur,
      projectId: projectId,
      terminalUserId: terminalUserId,
      fontSize: fontSize,
      bgColor: bgColor,
      fontSize35: parseInt(fontSize) + 4,
      fontSize28: parseInt(fontSize) - 2,
      departmentId: departmentId
    })
    //console.log("任务id：", this.data.taskId, ", 项目id：", this.data.projectId)
    //获取数据
    that.detail();
    //将当前列表状态和任务id传回父页面, 当前页面返回事加载数据用
    const eventChannel = that.getOpenerEventChannel()
    eventChannel.emit('acceptDataFromOpenedPage', { pageScrollto_id: pageScrollto_id, tabCur: tabCur, search_param_str: search_param_str, pagenum: pagenum, maxPageNum: maxPageNum });
  },

  //提示
  tip: function (msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false
    })
  },
  // 开始录音
  startRecord: function (e) {
    var that = this;
    that.setData({
      modalHidden: false,
      idModelShow: 0,
      fuzhi: 0,
      modalName: e.currentTarget.dataset.target
    })

    const options = {
      duration: 60000, //指定录音的时长，单位 ms
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 96000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    }
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('recorder start')
    });

    that.startTimer();
  },

  // 停止录音

  stopRecord: function () {
    var that = this;
    var audioSrc = this.data.audioSrc;
    var remainTime = that.data.remainTime;
    that.setData({
      idModelShow: 1
    })

    recorderManager.stop();
    recorderManager.onStop((res) => {

      if (that.data.fuzhi == 1) {
        that.setData({
          isShow: 0
        })
        that.tip("录音已取消")
      } else {

        if (this.data.audioSrc.length != 0) {
          audioSrc.push({
            bl: false,
            src: res.tempFilePath,
            time: remainTime
          })
          that.setData({
            modalHidden: true,
            audioSrc: audioSrc,
            isShow: 0
          })
        } else {
          audioSrc.push({
            bl: false,
            src: res.tempFilePath,
            time: remainTime
          })
          that.setData({
            modalHidden: true,
            audioSrc: audioSrc,
            isShow: 0
          })
        }

        that.tip("录音完成")
        console.log("这是录音列表：", that.data.audioSrc);
      }
      // console.log("录音文件：",that.data.audioSrc,"长度：",that.data.audioSrc.length)
    })

    that.stopTimer();
  },


  /**
   * 播放录音
   */

  playRecord: function (e) {
    var that = this;
    var audioSrc = this.data.audioSrc;
    var index = e.currentTarget.dataset.id;

    if (audioSrc == '') {
      this.tip("请先录音！")
      return;
    }
    audioSrc.forEach((v, i, array) => {
      v.bl = false;
      if (i == index) {
        v.bl = true;
      }
    })
    that.setData({
      audioSrc: audioSrc
    })
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.data.audioSrc[index].src,
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })

    // 监听音频自然播放至结束的事件
    innerAudioContext.onEnded(() => {
      console.log("播放结束")
      audioSrc[index].bl = false;
      that.setData({
        audioSrc: audioSrc,
      })
      // 取消自然播放至结束的事件
      innerAudioContext.offEnded();

    })

    // console.log("播放录音", that.data.audioSrc[index])
  },
  /**
   * 播放录音
   */

  playRecord_No: function (e) {
    var that = this;
    var audioSrc_No = this.data.audioSrc_No;
    var index = e.currentTarget.dataset.id;
    audioSrc_No.forEach((v, i, array) => {
      v.bl = false;
      if (i == index) {
        v.bl = true;
      }
    })
    that.setData({
      audioSrc: audioSrc_No
    })
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.data.audioSrc_No[index].src,
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
    // 监听音频自然播放至结束的事件
    innerAudioContext.onEnded(() => {
      console.log("播放结束")
      audioSrc_No[index].bl = false;
      that.setData({
        audioSrc_No: audioSrc_No,
      })
      // 取消自然播放至结束的事件
      innerAudioContext.offEnded();

    })
    // console.log("播放录音", that.data.audioSrc[index])
  },
  /**
   * 播放录音
   */

  playRecord_Dep: function (e) {
    var that = this;
    var audioSrc_Dep = this.data.audioSrc_Dep;
    var index = e.currentTarget.dataset.id;
    audioSrc_Dep.forEach((v, i, array) => {
      v.bl = false;
      if (i == index) {
        v.bl = true;
      }
    })
    that.setData({
      audioSrc_Dep: audioSrc_Dep
    })
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.data.audioSrc_Dep[index].src,
      console.log(innerAudioContext.src)
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    // 监听音频自然播放至结束的事件
    innerAudioContext.onEnded(() => {
      console.log("播放结束")
      audioSrc_Dep[index].bl = false;
      that.setData({
        audioSrc_Dep: audioSrc_Dep,
      })
      // 取消自然播放至结束的事件
      innerAudioContext.offEnded();

    })
    // console.log("播放录音", that.data.audioSrc[index])
  },
  /**
   * 点击取消
   */
  modalCandel: function () {
    var that = this;
    var audioSrc = that.data.audioSrc;
    if (audioSrc == '') {
      // do something
      this.setData({
        modalHidden: true,
        audioSrc: '',
        idModelShow: 1,
        fuzhi: 1,
        modalName: null
      })
    } else {
      this.setData({
        modalHidden: true,
        idModelShow: 1,
        fuzhi: 1,
        modalName: null
      })
    }
    that.stopRecord();
    that.stopTimer();
  },
  //删除音频
  delAudio: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.id;
    wx.showModal({
      content: '确定要删除这条录音吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          // console.log("删除之前的音频集合：",this.data.audioSrc,"长度：",this.data.audioSrc.length)
          that.data.audioSrc.splice(index, 1);
          that.setData({
            audioSrc: this.data.audioSrc
          })
          // console.log("删除之后的音频集合：",this.data.audioSrc,"长度：",this.data.audioSrc.length)
        }
      }
    })
  },



  /**
   ***********************************倒计时**************************************
   */
  updateTimer: function () {
    let log = this.data.log
    let now = Date.now()
    let remainingTime = Math.round((now - log.endTime) / 1000)
    let M = util.formatTime(Math.floor(remainingTime / (60)) % 60, 'MM')
    let S = util.formatTime(Math.floor(remainingTime) % 60, 'SS')
    if (remainingTime > 58) {
      wx.setKeepScreenOn({
        keepScreenOn: false
      })
      this.stopTimer()
      recorderManager.stop();
      this.data.isRecord = false;
      this.setData({
        buttonTxt: '开始录音'
      });
      return
    } else {
      let remainTimeText = M + ":" + S;
      this.setData({
        remainTimeText: remainTimeText
      })
    }
  },
  stopTimer: function () {
    this.timer && clearInterval(this.timer)
    this.setData({
      isRuning: false,
      remainTimeText: '00:00',
    })
  },
  startTimer: function (e) {
    let isRuning = this.data.isRuning
    let startTime = Date.now()
    if (!isRuning) {
      this.timer = setInterval((function () {
        this.updateTimer()
      }).bind(this), 1000)
    } else {
      this.stopTimer()
    }
    this.setData({
      isRuning: !isRuning,
      remainTimeText: '00:00',
    })
    this.data.log = {
      endTime: startTime
    }
    this.saveLog(this.data.log)
  },
  saveLog: function (log) {
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(log)
    wx.setStorageSync('logs', logs)
  },



  // ViewImageForreport(e) {
  //   // console.log("图片数据：", e);
  //   wx.previewImage({
  //     urls: this.data.reportImgSrc,
  //     current: e.currentTarget.dataset.url
  //   });
  // },
  // ViewVideoForreport(e) {
  //   //console.log("视频数据：",e);
  //   this.VideoContext = wx.createVideoContext('reportVideo' + e.currentTarget.dataset.index);
  //   this.VideoContext.requestFullScreen(0);
  // },


  //发送请求获取数据
  detail: function () {
    var that = this;
    var projectId = that.data.projectId; //项目id
    var taskId = that.data.taskId; //任务id
    var requestUrl = that.data.requestUrl; //请求路径
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/home/manage/getPublicTaskResource",
      {
        //'projectId': projectId,
        'id': taskId
      },
      app.seesionId,
      (res) => {
        console.log("任务详情：", res.data.retObj)
        if (res.data.status === "success") {
          var data = res.data.retObj
          //实地资源
          // var images = res.data.retObj.answerResourceMap[0];
          // var videos = res.data.retObj.answerResourceMap[2];
          // var audios = res.data.retObj.answerResourceMap[1];
          var images = [];
          var videos = [];
          var audios = [];
          var answerResourceList = data.publicResourceList
          if (answerResourceList && answerResourceList.length > 0) {
            for (let i = 0; i < answerResourceList.length; i++) {
              var answerResource = answerResourceList[i]
              if (answerResource.type == 0) {//类型，0图片，1音频，2视频
                images.push(answerResource)
              } else if (answerResource.type == 1) {
                audios.push(answerResource)
              } else {
                videos.push(answerResource)
              }
            }
          }
          //console.log("图片列表：", images, "---------视频列表：", videos, "-------音频列表：", audios)

          // console.log("图片列表：",images,"---------视频列表：",videos,"-------音频列表：",audios )
          //整改资源
          // var images_dep = res.data.retObj.taskResourceMap[0];
          // var videos_dep = res.data.retObj.taskResourceMap[2];
          // var audios_dep = res.data.retObj.taskResourceMap[1];
          var images_dep = [];
          var videos_dep = [];
          var audios_dep = [];
          var taskResourceList = data.taskResourceList
          if (taskResourceList && taskResourceList.length > 0) {
            for (let i = 0; i < taskResourceList.length; i++) {
              var taskResource = taskResourceList[i]
              if (taskResource.type == 0) {//类型，0图片，1音频，2视频
                images_dep.push(taskResource)
              } else if (taskResource.type == 1) {
                audios_dep.push(taskResource)
              } else {
                videos_dep.push(taskResource)
              }
            }
          }
          //门头照
          // var doorPicList = data.doorPicList.doorPic
          // var images_door = [];
          // if (doorPicList && doorPicList.length > 0) {
          //   images_door = doorPicList;
          // }
          //如果整改资源为空则隐藏整改资源页面
          if (images_dep.length < 1 && videos_dep.length < 1 && audios_dep.length < 1) {
            that.setData({
              checkShow: true
            })
          }
          that.downlodaResource(images, videos, audios);
          that.downlodaResource_dep(images_dep, videos_dep, audios_dep);
          //that.downlodaResource_door(images_door);
          var departmentName = '';
          if (res.data.retObj.departmentName) {
            departmentName = res.data.retObj.departmentName
          } else {
            var departmentTaskVoList = res.data.retObj.departmentTaskVoList
            if (departmentTaskVoList && departmentTaskVoList.length > 0) {
              for (let i = 0; i < departmentTaskVoList.length; i++) {
                departmentName += departmentTaskVoList[i].name + "、"
              }
            }
            departmentName = departmentName.substring(0, departmentName.length - 1)
          }
          that.setData({
            address: res.data.retObj.address,
            //经纬度
            latitude: res.data.retObj.latitude,
            longitude: res.data.retObj.longitude,
            code: res.data.retObj.code,
            pointName: res.data.retObj.pointName,
            locationName: res.data.retObj.locationName,
            auditContent: res.data.retObj.auditContent,
            questionContent: res.data.retObj.remarks,
            quotaContent: res.data.retObj.quotaContent,
            commitContent: res.data.retObj.commitContent,
            findTime: res.data.retObj.findTime,
            finishTime: res.data.retObj.finishTime,
            longTask: res.data.retObj.longTask,
            departmentName: departmentName,
            uploadTime: res.data.retObj.uploadTime
          })

        }

      },
      (err) => {

      }
    )
    // wx.request({
    //   url: requestUrl + "/mobile/fieldTask/getFieldTaskDetail",
    //   // url: "http://192.168.15.71:8083/mobile/fieldTask/getFieldTaskAnswerDetail",
    //   data: {
    //     'projectId': projectId,
    //     'taskId': taskId
    //   },
    //   success(res) {
    //     console.log("任务详情：", res.data.retObj)
    //     if (res.data.status === "success") {

    //       var images = res.data.retObj.answerResourceMap[0];
    //       var videos = res.data.retObj.answerResourceMap[2];
    //       var audios = res.data.retObj.answerResourceMap[1];
    //       console.log("图片列表：", images, "---------视频列表：", videos, "-------音频列表：", audios)

    //       // console.log("图片列表：",images,"---------视频列表：",videos,"-------音频列表：",audios )

    //       var images_dep = res.data.retObj.taskResourceMap[0];
    //       var videos_dep = res.data.retObj.taskResourceMap[2];
    //       var audios_dep = res.data.retObj.taskResourceMap[1];
    //       //如果整改资源为空则隐藏整改资源页面
    //       if (images_dep == null && videos_dep == null && audios_dep == null) {
    //         that.setData({
    //           checkShow: true
    //         })
    //       }

    //       that.downlodaResource(images, videos, audios);
    //       that.downlodaResource_dep(images_dep, videos_dep, audios_dep);

    //       that.setData({
    //         address: res.data.retObj.address,
    //         //经纬度
    //         latitude: res.data.retObj.latitude,
    //         longitude: res.data.retObj.longitude,
    //         code: res.data.retObj.code,
    //         pointName: res.data.retObj.pointName,
    //         locationName: res.data.retObj.locationName,
    //         auditContent: res.data.retObj.auditContent,
    //         questionContent: res.data.retObj.questionContent,
    //         commitContent: res.data.retObj.commitContent
    //       })

    //     }
    //   },
    //   //请求失败
    //   fail: function(err) {},
    //   //请求完成后执行的函数
    //   complete: function() {}
    // })
  },


  downlodaResource: async function (images, videos, audios) {
    var that = this;
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })
    //如果录音有值显示录音
    if (audios.length > 0) {
      that.setData({
        isShow_No: 0
      })
    }
    var imgDesc = []; //图片描述
    var videoDesc = []; //视频描述

    var mapImage = []; //图片下载
    if (images != null) {
      for (var i = 0; i < images.length; i++) {
        mapImage.push(images[i].url.replaceAll('http:', 'https:'))
        imgDesc.push({
          description: images[i].description
        });
      }
    }

    var mapVoid = []; //视频下载
    if (videos != null) {
      for (var i = 0; i < videos.length; i++) {
        mapVoid.push(videos[i].url.replaceAll('http:', 'https:'))
        videoDesc.push({
          description: videos[i].description
        })
      }
    }

    that.setData({
      imgDescList: imgDesc, //图片描述
      voidDescList: videoDesc, //视频描述
    })

    for (var index = 0; index < mapImage.length; index++) {
      await that.downlodaImage(mapImage[index]).then((res) => { })
    }


    for (var index = 0; index < mapVoid.length; index++) {
      await that.downlodaVideo(mapVoid[index]).then((res) => { })
    }

    var mapAudio = []; //音频下载
    if (audios != null) {


      for (var i = 0; i < audios.length; i++) {
        mapAudio.push(audios[i].url.replaceAll('http:', 'https:'))

      }
    }
    for (var index = 0; index < mapAudio.length; index++) {
      await that.downlodaAudio(mapAudio[index]).then((res) => { })
    }
    wx.hideLoading();
  },

  downlodaResource_dep: async function (images_dep, videos_dep, audios_dep) {
    var that = this;
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })
    //如果录音有值显示录音
    if (audios_dep != null && audios_dep.length > 0) {
      that.setData({
        isShow_Dep: 0
      })
    }
    var mapImage = []; //图片下载
    if (images_dep != null) {
      for (var i = 0; i < images_dep.length; i++) {
        //console.log("图片的啥啊啊啊啊：", images_dep[i].url)
        mapImage.push(images_dep[i].url.replaceAll('http:', 'https:'))
      }
    }

    var mapVoid = []; //视频下载
    if (videos_dep != null) {
      //console.log("进来了吗")
      for (var i = 0; i < videos_dep.length; i++) {
        mapVoid.push(videos_dep[i].url.replaceAll('http:', 'https:'))
      }
    }

    for (var index = 0; index < mapImage.length; index++) {
      await that.downlodaImage_dep(mapImage[index]).then((res) => { })
    }


    for (var index = 0; index < mapVoid.length; index++) {
      await that.downlodaVideo_dep(mapVoid[index]).then((res) => { })
    }

    var mapAudio = []; //音频下载
    if (audios_dep != null) {


      for (var i = 0; i < audios_dep.length; i++) {
        mapAudio.push(audios_dep[i].url.replaceAll('http:', 'https:'))

      }
    }
    for (var index = 0; index < mapAudio.length; index++) {
      await that.downlodaAudio_dep(mapAudio[index]).then((res) => { })
    }
    //console.log("视频数据：", that.data.videoList, "----", that.data.videoList_Dep)
    wx.hideLoading();
  },
  downlodaResource_door: async function (images_door) {
    var that = this;
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })
    var mapImage = []; //图片下载
    if (images_door != null) {
      for (var i = 0; i < images_door.length; i++) {
        mapImage.push({ url: images_door[i].url.replaceAll('http:', 'https:'), desc: images_door[i].description })
      }
    }
    for (var index = 0; index < mapImage.length; index++) {
      await that.downlodaImage_door(mapImage[index]).then((res) => { })
    }
    wx.hideLoading();
  },
  /**
   ***********************************下载图片资源**************************************
   */

  downlodaImage: function (filePath) {
    var that = this;
    var imgList = that.data.imgList_No;
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: filePath,
        success(res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            resolve(res.data)
            // console.log('图片下载成功' + res.tempFilePath)
            imgList.push(res.tempFilePath)
            that.setData({
              imgList_No: imgList
            })
          }
        }
      })
    })

  },
  /**
   ***********************************下载整改图片资源**************************************
   */

  downlodaImage_dep: function (filePath) {
    var that = this;
    var imgList = that.data.imgList_Dep;
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: filePath,
        success(res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            resolve(res.data)
            // console.log('图片下载成功' + res.tempFilePath)
            imgList.push(res.tempFilePath)
            that.setData({
              imgList_Dep: imgList
            })
          }
        }
      })
    })

  },
  downlodaImage_door: function (images_door) {
    var that = this;
    var imgList = that.data.imgList_door;
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: images_door.url,
        success(res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            resolve(res.data)
            // console.log('图片下载成功' + res.tempFilePath)
            imgList.push({ url: res.tempFilePath, desc: images_door.desc })
            that.setData({
              imgList_door: imgList
            })
          }
        }
      })
    })

  },
  /**
   ***********************************下载视频资源**************************************
   */

  downlodaVideo: function (filePath) {

    var that = this;
    var videoList = that.data.videoList_No;
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: filePath,
        success(res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            resolve(res.data)
            videoList.push({
              url: res.tempFilePath
            })
            that.setData({
              videoList_No: videoList
            })
          }
        }
      })
    })
  },
  /**
   ***********************************下载整改视频资源**************************************
   */

  downlodaVideo_dep: function (filePath) {

    var that = this;
    var videoList = that.data.videoList_Dep;
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: filePath,
        success(res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            resolve(res.data)
            videoList.push({
              url: res.tempFilePath
            })
            that.setData({
              videoList_Dep: videoList
            })
          }
        }
      })
    })
  },
  /**
   ***********************************下载音频资源**************************************
   */

  downlodaAudio: function (filePath) {
    var that = this;
    var audioSrc = that.data.audioSrc_No;
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: filePath,
        success(res) {
          // console.log("音频的res：",res)
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            resolve(res.data)
            // console.log("下载的音频:",res.tempFilePath)
            audioSrc.push({
              bl: false,
              src: res.tempFilePath,
            })
            that.setData({
              audioSrc_No: audioSrc
            })
          }
        }
      })
    })
  },
  /**
   ***********************************下载整改音频资源**************************************
   */

  downlodaAudio_dep: function (filePath) {
    var that = this;
    var audioSrc = that.data.audioSrc_Dep;
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: filePath,
        success(res) {
          // console.log("音频的res：",res)
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            resolve(res.data)
            // console.log("下载的音频:",res.tempFilePath)
            audioSrc.push({
              bl: false,
              src: res.tempFilePath,
            })
            that.setData({
              audioSrc_Dep: audioSrc
            })
          }
        }
      })
    })
  },



  // 拍摄


  showModal2(e) {

    this.setData({
      modalName: e.currentTarget.dataset.target,
    })
  },


  ChooseImage(e) {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], //从相册选择
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
    })
  },

  chooseVideo() {
    let vm = this;
    //因为上传视频返回的数据类型与图片不一样  需要建缩略图的url放到数组中
    var urlArray = [];
    var obj = {
      'src': '',
      'poster': ''
    };
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
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



  },
  ViewImageFordoor(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.url],
      current: e.currentTarget.dataset.url
    });
  },
  ViewImageForreport(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  ViewImageForreport_No(e) {
    wx.previewImage({
      urls: this.data.imgList_No,
      current: e.currentTarget.dataset.url
    });
  },
  ViewImageForreport_Dep(e) {
    wx.previewImage({
      urls: this.data.imgList_Dep,
      current: e.currentTarget.dataset.url
    });
  },
  ViewVideoForreport(e) {
    console.log("视频的啥？：", e);
    this.VideoContext = wx.createVideoContext('reportVideo' + e.currentTarget.dataset.url);
    this.VideoContext.requestFullScreen({ direction: 0 });
  },
  ViewVideoForreport_Dep(e) {
    console.log("部门视频的啥？：", e);
    this.VideoContext = wx.createVideoContext('reportVideoDep' + e.currentTarget.dataset.index);
    this.VideoContext.requestFullScreen({ direction: 0 });
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
        }
      }
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  textareaAInput(e) {
    this.data.textDesc = e.detail.value;
  },
  go() {
    var that = this;
    var latitude = Number(that.data.latitude);
    var longitude = Number(that.data.longitude);
    var address = that.data.address;
    // console.log(latitude)
    wx.openLocation({
      name: address,
      address: address,
      latitude,
      longitude,
      scale: 18
    })
  },

  // 权属异议复选开关
  qs_switch(e) {
    var that = this;
    if (e.detail.value == false) {
      that.setData({
        can_long: true,
        long_setTime: false,
        dissent: 0
      })
    } else {
      that.setData({
        can_long: false,
        long_setTime: false,
        dissent: 1,
        longtask: 0
      })
    }
  },
  // 长期整改复选开关
  long_switch(e) {
    var that = this;
    if (e.detail.value == false) {
      that.setData({
        can_qs: true,
        long_setTime: false,
        longtask: 0
      })
    } else {
      that.setData({
        can_qs: false,
        long_setTime: true,
        dissent: 0,
        longtask: 1
      })
    }
  },
  //日期选项
  DateChange(e) {
    var that = this
    that.setData({
      long_task_finish_Time: e.detail.value
    })
  },

  //提交按钮
  submit: async function () {
    var that = this;
    //举报图片集合
    var reportImg = that.data.imgList;
    //举报视频集合
    var reportVideo = that.data.videoList;
    //录音
    var audioSrc = that.data.audioSrc;
    //整改说明
    var textDesc = that.data.textDesc;
    if ((reportImg.length + reportVideo.length) < 1) {
      wx.showToast({
        title: '请上传图片/视频',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return
    }
    if (textDesc == null || textDesc == '') {
      wx.showToast({
        title: '整改说明不能为空',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return
    }
    if (that.data.longtask == 1 && !that.data.long_task_finish_Time) {
      wx.showToast({
        title: '您已开启长期整改,请设置任务结束时间',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return
    }
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    for (var index = 0; index < reportImg.length; index++) {
      //举报图片
      await that.uploadImage(reportImg[index]).then((res) => {
        // console.log("图片上传完了resourceList:",that.data.resourceList.length);

      })
    }
    for (var index = 0; index < reportVideo.length; index++) {
      //举报视频
      await that.uploadVideo(reportVideo[index].src).then((res) => {
        // console.log("视频上传完了resourceList:",that.data.resourceList.length);
      });
    }
    for (var index = 0; index < audioSrc.length; index++) {
      //举报音频
      await that.uploadAudioSrc(audioSrc[index].src).then((res) => {
        // console.log("视频上传完了resourceList:",that.data.resourceList.length);
      });
    }

    var length = reportImg.length + reportVideo.length + audioSrc.length;

    // 上传成功的资源长度
    var rsLength = that.data.resourceList.length;
    console.log("上传成功总资源：", rsLength);
    console.log("本地总资源:", length)
    // 资源全部上传成功 上传答案
    wx.hideLoading()
    if (length == rsLength) {
      wx.showLoading({
        title: '资源上传中',
        mask: true
      })
      // wx.showToast({
      //   title: '资源上传中',
      //   icon: 'none',
      //   duration: 1000,
      //   mask: true
      // })
      console.log("全部上传成功了")
      that.uploadAnswerTrue();
      wx.hideLoading()
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

  //举报图片集合
  uploadImage: function (filePath) {
    var that = this;
    var requestUrl = that.data.requestUrl; //请求路径
    //举报图片集合
    var reportImg = that.data.imgList;
    console.log("图片长传集合：", reportImg, "图片长度：", reportImg.length)
    var i = that.data.i;
    var success = that.data.success;
    var fail = that.data.fail;
    var resourceList = that.data.resourceList;

    var terminalUserId = that.data.terminalUserId;
    var projectId = that.data.projectId;
    var taskId = that.data.taskId;
    var code = that.data.code;


    //上传举报图片
    //
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: requestUrl + '/mobile/fieldTask/upload',
        filePath: filePath,
        name: 'reportImg' + i + terminalUserId,
        formData: {
          'path': 'reportImg' + i + terminalUserId,
          'type': '0',
          'projectId': projectId,
          'taskId': taskId,
          'code': code
        },
        success(res) {
          var imageMap = JSON.parse(res.data);
          if (imageMap.url != null && imageMap.url != '') {
            resolve(res.data)
            console.log("新的提交数据：", imageMap)
            success++;
            // 操作成功
            resourceList.push({
              url: imageMap.url,
              type: 0,
              name: '现在没找到方法'
            })

          } else {
            wx.showToast({
              title: '图片资源上传失败',
              icon: 'none',
              duration: 1000,
              mask: true
            })
          }

        },
        //请求失败
        fail: function (err) {
          fail++;
        },
        complete: () => {
          i++;
          if (i >= reportImg.length) { //当图片传完时，停止调用  
            that.data.resourceList = resourceList;
            console.log("图片返回数据：", that.data.resourceList)
            console.log('---上传举报图片执行完毕---');
            console.log('成功：' + success + " 失败：" + fail);
          } else { //若图片还没有传完，则继续调用函数
            that.data.i = i;
            that.data.success = success;
            that.data.fail = fail;
            // that.uploadImage();
          }
        }

      })
    })

  },
  //举报视频集合
  uploadVideo: function (filePath) {
    var that = this;
    var requestUrl = that.data.requestUrl; //请求路径
    //举报视频集合
    var reportVideo = that.data.videoList;
    var terminalUserId = that.data.terminalUserId;
    var i = that.data.i;
    var success = that.data.success;
    var fail = that.data.fail;
    var resourceList = that.data.resourceList;
    var projectId = that.data.projectId;
    var taskId = that.data.taskId;
    var code = that.data.code;

    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: requestUrl + '/mobile/fieldTask/upload',
        filePath: filePath,
        name: 'reportVideo' + i + terminalUserId,
        formData: {
          'path': 'reportVideo' + i + terminalUserId,
          'type': '2',
          'projectId': projectId,
          'taskId': taskId,
          'code': code
        },
        success(res) {
          var voidMap = JSON.parse(res.data);
          if (voidMap.url != null && voidMap.url != '') {
            resolve(res.data)
            success++;
            // 操作成功
            resourceList.push({
              url: voidMap.url,
              type: 2,
              name: '还没找到方法'
            })
          } else {
            wx.showToast({
              title: '视频资源上传失败',
              icon: 'none',
              duration: 1000,
              mask: true
            })
          }
        },
        //请求失败
        fail: function (err) {
          fail++;
        },
        complete: () => {
          i++;
          if (i >= reportVideo.length) { //当视频传完时，停止调用     
            that.data.resourceList = resourceList;
            console.log("视频返回数据：", that.data.resourceList)
            console.log('----上传视频执行完毕----');
            console.log('成功：' + success + " 失败：" + fail);

          } else { //若视频还没有传完，则继续调用函数
            that.data.i = i;
            that.data.success = success;
            that.data.fail = fail;
            // that.uploadVideo();
          }
        }

      })
    })

  },

  //录音
  uploadAudioSrc: function (filePath) {
    var that = this;
    var requestUrl = that.data.requestUrl; //请求路径
    var i = that.data.i;
    var audioSrc = that.data.audioSrc;
    var terminalUserId = that.data.terminalUserId;
    var success = that.data.success;
    var fail = that.data.fail;
    var resourceList = that.data.resourceList;

    var projectId = that.data.projectId;
    var taskId = that.data.taskId;
    var code = that.data.code;


    console.log('格式', audioSrc)
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: requestUrl + '/mobile/fieldTask/upload',
        filePath: filePath,
        name: 'audioSrc' + terminalUserId,
        formData: {
          'path': 'audioSrc' + terminalUserId,
          'type': '1',
          'projectId': projectId,
          'taskId': taskId,
          'code': code
        },
        success(res) {
          var audioMap = JSON.parse(res.data);
          if (audioMap.url != null && audioMap.url != '') {
            resolve(res.data)
            // 操作成功
            success++;
            resourceList.push({
              url: audioMap.url,
              type: 1,
              name: '现在还没找到方法'
            })
          } else {
            wx.showToast({
              title: '音频资源上传失败',
              icon: 'none',
              duration: 1000,
              mask: true
            })
          }
        },
        //请求失败
        fail: function (err) {
          fail++;
        },
        complete: () => {
          i++;
          if (i >= audioSrc.length) { //当音频传完时，停止调用     
            console.log('----上传音频执行完毕----');
            console.log('成功：' + success + " 失败：" + fail);
          } else { //若音频还没有传完，则继续调用函数
            that.data.i = i;
            that.data.success = success;
            that.data.fail = fail;
          }
        }

      })

    })
  },


  // 资源全部上传成功，上传答案
  uploadAnswerTrue: function () {
    var that = this;
    var requestUrl = that.data.requestUrl; //请求路径
    //资源列表
    var resourceList = that.data.resourceList;
    console.log("要上传的资源集合：", resourceList)
    // 调查员id
    var terminalUserId = app.terminalUserId;
    // 任务id
    var taskId = that.data.taskId;
    //整改说明
    var remarks = that.data.textDesc;
    //项目id
    var projectId = that.data.projectId;
    //复选框
    var dissent = that.data.dissent;

    //调用全局 请求方法
    app.wxRequest(
      'POST',
      requestUrl + '/mobile/fieldTask/saveResourceByNew',
      {
        terminalUserId: terminalUserId,
        taskId: taskId,
        remarks: remarks,
        dissent: dissent,
        longTask: that.data.longtask,
        endTime: that.data.long_task_finish_Time,
        resourceListStr: JSON.stringify(resourceList)
      },
      app.seesionId,
      (res) => {
        if (res.data.status == 'success') {
          router.navigateBack({
            delta: 1,
            //url: "../dept_index/dept_index?projectId=" + projectId
          })
          // wx.navigateTo({
          //   url: "../dept_index/dept_index?projectId=" + projectId
          // })
          //console.log("好了，这下上传成功了。")
        }
      },
      (err) => {
        wx.showToast({
          title: '资源上传失败',
          icon: 'none',
          duration: 1000,
          mask: true
        })
      }
    )
  },
  getTaskLog: function () {
    var that = this;
    //调用全局 请求方法
    app.wxRequest(
      'POST',
      that.data.requestUrl + '/mobile/fieldTask/getTaskLogByTaskId',
      {
        taskId: that.data.taskId,
      },
      app.seesionId,
      (res) => {
        console.log(res)
        if (res.data.status == 'success') {
          var logData = res.data.retObj
          if (logData && logData.length > 0) {
            var logList = [];
            for (let i = 0; i < logData.length; i++) {
              var log = {};
              log.recordBy = logData[i].recordBy.indexOf('#') > -1 ? logData[i].recordBy.split('#')[1] : logData[i].recordBy
              log.remarks = logData[i].remarks.indexOf('#') > -1 ? logData[i].remarks.split('#')[1] : logData[i].remarks
              log.year = util.formatTimeByNew(logData[i].time, 'Y-M-D')
              log.day = util.formatTimeByNew(logData[i].time, 'h:m:s')
              logList.push(log)
            }
            that.setData({
              modalName: 'TaskLog',
              task_log_list: logList
            })
          } else {
            app.alert('暂无数据')
          }
        }
      },
      (err) => {
        app.alert('网络错误')
      }
    )
  },
  set_auditContent: function (e) {
    this.setData({
      process_auditContent: e.detail.value,
    })
  },
  //更新全权属异议原因
  set_dissent_auditContent: function (e) {
    this.setData({
      dissent_auditContent: e.detail.value,
    })
  },
  //审核方法
  //合格 0  0
  //不合格 2  0
  //长期整改  2  1
  process_fun: function (e) {
    //合格 0  0
    //不合格 2  0
    //长期整改  2  1
    var that = this;
    var projectId = that.data.projectId;
    // 0批量通过  1批量不通过  2批量长期整改
    var result_type = e.currentTarget.dataset.resulttype
    var taskId = that.data.taskId
    var auditContent = that.data.process_auditContent
    if (auditContent.length > 500) {
      app.msg('审批意见不能超过500字')
      return
    }
    var param;
    if (result_type == 0) {
      //批量合格
      param = {
        id: taskId,
        projectId: projectId,
        result: 0,
        auditContent: auditContent,
      }
    } else {
      //批量不合格\长期整改
      param = {
        id: taskId,
        projectId: projectId,
        result: 2,
        longTask: result_type == 1 ? 0 : 1,
        auditContent: auditContent,
      }
    }
    param.userId = app.terminalUserId
    param.dissent = that.data.dissent
    //调用全局 请求方法
    app.wxRequest(
      'POST',
      that.data.requestUrl + "/home/manage/check",
      param,
      app.seesionId,
      (res) => {
        console.log(res)
        var data = res.data
        if (data.status = "success") {
          app.alert("审核成功")
          router.navigateBack({
            delta: 1,
          })
          //刷新列表
          //that.search_fun()
        } else {
          app.alert("请求失败")
        }
      },
      (err) => {
        app.alert("网络错误")
      }
    )
  },
  //权属异议 拒绝调整单位
  refuse_fun: function (e) {
    var that = this;
    var auditContent = that.data.process_auditContent
    if (auditContent.length > 500) {
      app.msg('审批意见不能超过500字')
      return
    }
    var param = {
      id: that.data.taskId,
      departmentId: e.currentTarget.dataset.departmentid,
      auditContent: that.data.process_auditContent,
      userId:app.terminalUserId
    }
    wx.showModal({
      title: '提示',
      content: '您即将将该任务打回所属单位，是否确认？',
      success(res) {
        if (res.confirm) {
          //调用全局 请求方法
          app.wxRequest(
            'POST',
            that.data.requestUrl + "/home/manage/refuse",
            param,
            app.seesionId,
            (res) => {
              console.log(res)
              var data = res.data
              if (data.status = "success") {
                app.alert("审核成功")
                router.navigateBack({
                  delta: 1,
                })
                //刷新列表
                //that.search_fun()
              } else {
                app.alert("请求失败")
              }
            },
            (err) => {
              app.alert("网络错误")
            }
          )
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  //权属异议 调整单位页面
  open_update_dept_page: function (e) {
    var that = this;
    //调用全局 请求方法
    app.wxRequest(
      'POST',
      that.data.requestUrl + "/home/manage/getDeptListByProjectId",
      { projectId: that.data.projectId },
      app.seesionId,
      (res) => {
        console.log(res)
        var data = res.data
        if (data.status = "success") {
          var departmentList = data.retObj
          // for (let i = 0; i < departmentList.length; i++) {
          //   var department = departmentList[i]
          //   for (let t = 0; t < task_departmentList.length; t++) {
          //     if (department.id == task_departmentList[t].departmentId) {
          //       that.setData({
          //         update_select_dept: department
          //       })
          //       break;
          //     }
          //   }
          // }
          that.setData({
            departmentList: departmentList,
            modalName: 'updateDept'
          })
          //that.check_dept(departmentList)
        } else {
          app.alert("请求失败")
        }
      },
      (err) => {
        app.alert("网络错误")
      }
    )
  },
  check_dept: function (departmentList) {
    if (departmentList) {
      var that = this;
      //调用全局 请求方法
      app.wxRequest(
        'POST',
        that.data.requestUrl + "/mobile/fieldTask/getDepartmentListByTaskIdByNew",
        { taskId: that.data.taskId, projectId: that.data.projectId },
        app.seesionId,
        (res) => {
          var data = res.data
          if (data.status = "success") {
            var obj = data.retObj
            var isDepartType = obj.isDepartType
            var task_departmentList = obj.departmentList
            var task_leadDepartmentList = obj.leadDepartmentList
            var leadDepartment_ids = '';
            var department_ids = '';
            if (isDepartType == 1) {//牵头模式
              var show_leadDepartmentList = [];
              var show_departmentList = [];
              for (let i = 0; i < departmentList.length; i++) {
                var department = departmentList[i]
                for (let t = 0; t < task_departmentList.length; t++) {
                  if (department.id == task_departmentList[t].departmentId) {
                    department_ids += task_departmentList[t].departmentId + ','
                    department.check = true
                    show_departmentList.push(department)
                    continue;
                  }
                }
                for (let y = 0; y < task_leadDepartmentList.length; y++) {
                  if (department.id == task_leadDepartmentList[y].departmentId) {
                    leadDepartment_ids += task_leadDepartmentList[y].departmentId + ','
                    department.check = true
                    show_leadDepartmentList.push(department);
                    continue;
                  }
                }
                if (!department.check) {
                  department.check = false
                  show_leadDepartmentList.push(department);
                  show_departmentList.push(department)
                }
              }
              that.setData({
                isDepartType: isDepartType,
                departmentList: show_departmentList,
                leadDepartmentList: show_leadDepartmentList,
                select_deptIds: department_ids.substring(0, department_ids.length - 1),
                select_lead_deptIds: leadDepartment_ids.substring(0, department_ids.length - 1),
                modalName: 'updateDept'
              })
            } else {
              for (let i = 0; i < departmentList.length; i++) {
                var department = departmentList[i]
                for (let t = 0; t < task_departmentList.length; t++) {
                  if (department.id == task_departmentList[t].departmentId) {
                    that.setData({
                      update_select_dept: department
                    })
                    break;
                  }
                }
              }
              that.setData({
                isDepartType: isDepartType,
                departmentList: departmentList,
                modalName: 'updateDept'
              })
            }
          } else {
            app.alert("请求失败")
          }
        },
        (err) => {
          app.alert("网络错误")
        }
      )
    }
  },
  updateDeptChange: function (e) {
    var that = this;
    that.setData({
      update_select_dept: that.data.departmentList[e.detail.value]
    })
  },
  //监听责任单位多选框
  set_select_deptIds: function (e) {
    var that = this;
    that.setData({
      select_deptIds: e.detail.value + ''
    })
  },
  //监听牵头责任单位多选框
  set_select_lead_deptIds: function (e) {
    var that = this;
    that.setData({
      select_lead_deptIds: e.detail.value + ''
    })
  },
  updateDept: function (e) {
    var that = this;
    var projectId = that.data.projectId
    var taskId = that.data.taskId;
    var auditContent = ''
    if (that.data.dissent_auditContent) {
      auditContent = that.data.dissent_auditContent
    }
    if (auditContent && auditContent.length > 500) {
      app.msg('审批意见不能超过500字')
      return
    }
    var param = {
      id: taskId,
      projectId: projectId,
      auditContent: auditContent,
      userId:app.terminalUserId
    }
      if (!that.data.update_select_dept) {
        app.alert('请选择部门')
        return
      }
      param.departmentId = that.data.update_select_dept.id
    //调用全局 请求方法
    app.wxRequest(
      'POST',
      that.data.requestUrl + "/home/manage/updateDepartment",
      param,
      app.seesionId,
      (res) => {
        //console.log(res)
        var data = res.data
        if (data.status = "success") {
          app.alert("更新成功")
          that.setData({
            modalName: ''
          })
          router.navigateBack({
            delta: 1,
          })
        } else {
          app.alert("请求失败")
        }
      },
      (err) => {
        app.alert("网络错误")
      }
    )
  },
  get_switch_result(e){
    if(e.detail.value){
      this.setData({
        dissent:1
      })
    }else{
      this.setData({
        dissent:0
      })
    }
  }
})