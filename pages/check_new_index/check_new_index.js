// 引入跳转js
import router from '../../utils/router.js';
const util = require('../../utils/util_time.js')
var app = getApp()
//各tab参数 
var request_dataParam_map = new Map();
Page({
  data: {
    rightId:wx.getStorageSync('rightId') || 0,
    requestUrl: '', //请求路径
    terminalUserId: '', //调查员id
    title_disabled: true, //控制修改表头名字
    management_good: false, //隐藏批量操作变量
    select_all: false, //选中全部
    middlearr: [], //多选中的值
    //任务列表、通过checked来判断
    taskList: [

    ],
    index: null, //下拉框选中的值
    // 初次待审核：{result=3,auditType=0}
    // 多次待审核：{result=3,auditType=1}
    // 未整改：{result=1,auditType不传}longTask:0
    // 整改合格：{result=0,auditType不传}
    //长期整改 {result=1,auditType不传}longTask:1
    //权属异议 result: 3
    indexDep: null,
    pickerDep: [],
    TabCur: 3,
    // problemType_user: [{
    //   id: 3,
    //   name: '初次待审核'
    // }, {
    //   id: 2, //接口需要+1
    //   name: '多次待审核'
    // }, {
    //   id: 1,
    //   name: '未整改'
    // }, /*{
    //   id: 5,
    //   name: '长期整改'
    // },*/ {
    //   id: 0,
    //   name: '整改合格'
    // }, {
    //   id: 4,
    //   name: '权属异议'
    // }],
    problemType_user: [{
      id: 3,
      name: '待审核'
    },{
      id: 9,
      name: '未整改'
    },{
      id: 0,
      name: '整改合格'
    }],
    //项目id
    projectId: '',
    //任务列表初始页（默认1）
    pageNum: 1,
    //赋值任务列表总页数（默认1）
    maxPageNum: 1,
    pageCount: 0, //总任务数量
    idNeed: true, //是否需要批量操作的控制变量
    modalHidden: true, //控制弹框的变量 
    tId: '', //选中的任务id字符串
    desc1: '', //输入的数字
    desc2: '', //审批意见
    depList: [], //部门列表
    taskIdByDep: '', //点击更改部门获取任务id
    fontSize: '',
    fontSize35: '',
    fontSize28: '',
    fontSize20: '',
    bgColor: '',
    isNull: '',
    isDepartType: 0,//是否是朝阳模式 0否 1是
    //任务列表清楚参数实体
    task_request_dataParam: {
    },
    //权属异议直接默认时间
    dissent_time: '00:00',
    //权属异议直接默认日期
    dissent_date: util.formatTimeByNew(new Date(), 'Y-M-D'),
    children_page_data:'',//子页面返回的任务列表参数
    projectList:[]//项目列表
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    var that = this;
    var requestUrl = app.globalData.requestUrl; //请求路径
    var projectId = app.projectId; //项目id
    var fontSize = wx.getStorageSync('fontSize');
    var bgColor = wx.getStorageSync('bgColor');
    var terminalUserId = app.terminalUserId; //调查员id
    wx.setNavigationBarTitle({
      title: app.projectName,
    })
    that.setData({
      projectId: projectId,
      requestUrl: requestUrl,
      terminalUserId: terminalUserId,
      fontSize: fontSize,
      bgColor: bgColor,
      fontSize35: parseInt(fontSize) + 2,
      fontSize28: parseInt(fontSize) - 2,
      fontSize20: parseInt(fontSize) - 10,
    })
    //加载项目列表
    that.getProjectList();
    //that.getDepList();
  },
  onShow:function(){
    var that = this;
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
    this.getTabBar().setData({
      selected: 1
    })
  }
    //console.log(that.data.children_page_data)
    if(that.data.children_page_data){
      var task_list_param = that.data.children_page_data
      var pageScrollto_id = task_list_param.pageScrollto_id
      var search_param_str = task_list_param.search_param_str
      var TabCur = task_list_param.tabCur
      var pageNum = task_list_param.pagenum
      //var maxPageNum = task_list_param.maxPageNum
      //console.log(search_param_str)   
      if(search_param_str){
       var search_param = JSON.parse(search_param_str)
       request_dataParam_map.set(TabCur,search_param)
      }
      that.setData({
        taskList: [],
        pagenum:1,
        maxPageNum: 0, //总页数
        isNull: '',
        TabCur:TabCur
      })
      //加载任务列表
      if (this.data.TabCur == 4) {
        this.getDissentFieldTaskList(pageNum*5,pageScrollto_id)
      } else {
        this.getCheckFieldTaskList(pageNum*5,pageScrollto_id)
      }
    }else{
      that.setData({
        taskList: [],
        maxPageNum: 0, //总页数
        isNull: '',
      })
     //加载任务列表
     if (this.data.TabCur == 4) {
      this.getDissentFieldTaskList()
    } else {
      this.getCheckFieldTaskList()
    }
    }
  },
  showListModel(e){
    var that = this;
    that.setData({
      modalName: e.currentTarget.dataset.target
    })
    //console.log(that.data.modalName)
  },
    /**
   * 获取当前政府项目列表
   */
  getProjectList(){
    //console.log('政府code',wx.getStorageSync('code'))
    let govCode = wx.getStorageSync('code');
    let that = this;
    var requestUrl = that.data.requestUrl;
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + "/home/manage/getPublicProjectList",
      {
        "govCode": govCode
      },
      app.seesionId,
      (res) =>{
        if (res.data.status === "success") {
          console.log(res)
          that.setData({
            projectList: res.data.retObj
          })
        }
      },
      (err) =>{
        app.msg('系统错误')
      }
    )
  },
    /**
   * 查询项目任务列表
   */
  showProjectTask(e){
    let that =this;
    wx.setNavigationBarTitle({
      title: e.currentTarget.dataset.name,
    })
    that.setData({
      taskList: [],
      maxPageNum: 0, //总页数
      isNull: '',
      TabCur:3,
      projectId:e.currentTarget.dataset.id,
    })
   //加载任务列表
    this.getCheckFieldTaskList()
  },
  //获取项目下部门
  getDepList: function () {
    var that = this;
    var projectId = that.data.projectId;
    var requestUrl = that.data.requestUrl;
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + '/mobile/fieldTask/getDepartmentListByProjectId',
      {
        projectId: projectId
      },
      app.seesionId,
      (res) => {
        console.log("后台返回的部门数据：", res)
        if (res.data.status === "success") {
          var list = res.data.retObj;
          var depName = [];
          for (var i = 0; i < list.length; i++) {
            depName.push(
              list[i].name
            )
          }
          that.setData({
            depList: list,
            pickerDep: depName
          })
        } else {
          wx.showToast({
            title: '获取部门数据失败',
            icon: 'none', // "success", "loading", "none"
            duration: 1500,
            mask: false,

          })
        }

      },
      (err) => {

      }
    )
  },
  /**
   * 动态改变问题类型的ID，传参加载ID下的任务列表
   */
  tabSelect: function (e) {
    var that = this;
    var tabId = e.currentTarget.dataset.id;
    if (tabId != null) {
      this.setData({
        TabCur: tabId,
        taskList: [], //任务列表置空
        select_all: false, //全选按钮图标判断
        pageCount: '', //总任务数置空
        //每次切换问题，给pagenum重新赋值为1
        pageNum: 1,
        isNull: ''
      })
      if (tabId == 4) {
        that.getDissentFieldTaskList();
      } else {
        //传参问题Id获取任务列表
        that.getCheckFieldTaskList();
      }
    } else {
      this.setData({
        TabCur: null,
        isNull: ''
      })
    }
  },

  //------------- 获取审核任务列表--------
  getCheckFieldTaskList: function (pageSize,pageScrollto_id) {
    var that = this;
    var projectId = that.data.projectId;
    var requestUrl = that.data.requestUrl; //服务器路径
    var terminalUserId = that.data.terminalUserId; //调查员id
    var pageNum = that.data.pageNum; //当前页
    var TabCur = that.data.TabCur//当前tab
    if (request_dataParam_map.has(that.data.TabCur)) {
      that.setData({
        task_request_dataParam: request_dataParam_map.get(that.data.TabCur),
      })
    } else {
      that.setData({
        task_request_dataParam: {},
      })
    }
    //当前tab
    if (TabCur >= 0) {
      that.data.task_request_dataParam.projectId = projectId;
      that.data.task_request_dataParam.pageNum = pageNum;
      if (!pageSize) {
        that.data.task_request_dataParam.pageSize = 5;
      } else {
        that.data.task_request_dataParam.pageSize = pageSize;
      }
      that.data.task_request_dataParam.terminalUserId = terminalUserId;
      if (TabCur == 3) {//初次待审核
        that.data.task_request_dataParam.result = 3
        //that.data.task_request_dataParam.auditType = 0
      } else if (TabCur == 2) {//多次待审核
        that.data.task_request_dataParam.result = 3
        that.data.task_request_dataParam.auditType = 1
      } else if (TabCur == 9) {//未整改
        that.data.task_request_dataParam.result = 1
        //that.data.task_request_dataParam.longTask = 0
      } else if (TabCur == 5) {//长期整改
        that.data.task_request_dataParam.result = 1
        that.data.task_request_dataParam.longTask = 1
      } else if (TabCur == 0) {//整改合格
        that.data.task_request_dataParam.result = 0
      } else if (TabCur == 4) {//权属异议
        that.data.task_request_dataParam.result = 3
      }
    }
    var now_timestamp = new Date().getTime()
    console.log( that.data.task_request_dataParam)
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + '/home/manage/getPublicFieldTaskCheckList',
      that.data.task_request_dataParam,
      app.seesionId,
      (res) => {
        if (res.data.status === "success") {
          if (res.data.retObj.list && res.data.retObj.list.length > 0) {
            var list = res.data.retObj.list;
            var arr = list;
            console.log(list)
            for (var i = 0; i < arr.length; i++) {
              if (TabCur == 5) {
                if (arr[i].finishTime) {
                  var date = new Date(arr[i].finishTime).getTime();
                  if (date < now_timestamp) {
                    arr[i].islate = true
                  } else {
                    arr[i].islate = false
                  }
                } else {
                  arr[i].islate = false
                }
              }
              arr[i].checked = false
            }
            //console.log("这是转换后的数组：", arr)
            that.setData({
              pageCount: res.data.retObj.count, //总任务数
              maxPageNum: res.data.retObj.pageCount, //总页数
              taskList: that.data.taskList.concat(arr),
              modalName: ''
            })
            if(pageScrollto_id){//如果id不为空 则为测评页面返回 定位到跳转之前的位置
              wx.pageScrollTo({
                selector:'#'+pageScrollto_id,//选择器
                offsetTop:-200,//偏移距离，需要和 selector 参数搭配使用，可以滚动到 selector 加偏移距离的位置，单位 px
                duration: 0,//滚动动画的时长，单位 ms
              })
            }
            //console.log("待审核数据：", that.data.taskList)
          } else {
            that.setData({
              //isNull: 'true',
              modalName: ''
            })
            app.msg('暂无数据')
          }
        } else {
          wx.showToast({
            title: '获取任务失败',
            icon: 'none', // "success", "loading", "none"
            duration: 1500,
            mask: false,

          })
        }

      },
      (err) => {

      }
    )
  },
  //查询触发方法
  search_fun() {
    this.setData({
      //每次切换问题，清空问题列表
      taskList: [],
      //每次切换问题，给pagenum重新赋值为1
      pagenum: 1
    })
    if (this.data.TabCur == 4) {
      this.getDissentFieldTaskList()
    } else {
      this.getCheckFieldTaskList()
    }
  },
  //------------- 获取权属异议任务列表--------
  getDissentFieldTaskList: function (pageSize,pageScrollto_id) {
    var that = this;
    if (that.data.TabCur != 4) {//非权属异议tab
      return
    }
    var requestUrl = that.data.requestUrl; //服务器路径
    var projectId = that.data.projectId;
    var terminalUserId = that.data.terminalUserId; //调查员id
    var pageNum = that.data.pageNum; //当前页
    if (request_dataParam_map.has(that.data.TabCur)) {
      that.setData({
        task_request_dataParam: request_dataParam_map.get(that.data.TabCur),
      })
    } else {
      that.setData({
        task_request_dataParam: {},
      })
    }
    //当前tab
    that.data.task_request_dataParam.projectId = projectId;
    that.data.task_request_dataParam.pageNum = pageNum;
    if (!pageSize) {
      that.data.task_request_dataParam.pageSize = 5;
    } else {
      that.data.task_request_dataParam.pageSize = pageSize;
    }
    that.data.task_request_dataParam.terminalUserId = terminalUserId;
    that.data.task_request_dataParam.result = 3
    //调用全局 请求方法
    app.wxRequest(
      'GET',
      requestUrl + '/home/manage/getDissentListByPub',//"/fieldTask/getDissentList.json",
      that.data.task_request_dataParam,
      app.seesionId,
      (res) => {
        if (res.data.status === "success") {
           console.log("打印出来看看权属异议？",res.data.retObj)
          if (res.data.retObj.list.length != 0) {
            that.setData({
              pageCount: res.data.retObj.count, //总任务数
              maxPageNum: res.data.retObj.pageCount, //总页数
              taskList: that.data.taskList.concat(res.data.retObj.list),
              modalName: ''
            })
            //console.log("权属异议数据：", that.data.taskList)
            if(pageScrollto_id){//如果id不为空 则为测评页面返回 定位到跳转之前的位置
              wx.pageScrollTo({
                selector:'#'+pageScrollto_id,//选择器
                offsetTop:-200,//偏移距离，需要和 selector 参数搭配使用，可以滚动到 selector 加偏移距离的位置，单位 px
                duration: 0,//滚动动画的时长，单位 ms
              })
            }
          } else {
            that.setData({
              //isNull: 'true',
              modalName: ''
            })
            wx.showToast({
              title: '该状态下无任务',
              icon: 'none', // "success", "loading", "none"
              duration: 1500,
              mask: false,
            })
          }
        } else {
          wx.showToast({
            title: '获取任务失败',
            icon: 'none', // "success", "loading", "none"
            duration: 1500,
            mask: false,

          })
        }

      },
      (err) => {

      }
    )
  },

  //--------上拉函数-----------
  onReachBottom: function () { //触底开始下一页
    var that = this;
    var pagenum = that.data.pageNum + 1; //获取当前页数并+1
    var TabCur = that.data.TabCur;
    that.setData({
      pageNum: pagenum, //更新当前页数
    })
    if (that.data.maxPageNum >= pagenum) {
      if (TabCur != null) {
        // 权属异议
        if (TabCur == 4) {
          that.getDissentFieldTaskList();
        } else {
          that.getCheckFieldTaskList();
        }
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
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
  },


  //------------- 管理---------------
  //取消
  cancel: function () {
    var that = this;
    that.setData({
      modalHidden: true
    })
    console.log("取消了")
  },

  // 全选
  select_all: function () {
    let that = this;
    that.setData({
      select_all: !that.data.select_all
    })
    if (that.data.select_all) {
      let arr = that.data.taskList;
      let arr2 = [];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].checked == true) {
          arr2.push(arr[i]);
        } else {
          arr[i].checked = true;
          arr2.push(arr[i]);
        }
      }
      that.setData({
        taskList: arr2,
        middlearr: arr2
      })
    }
  },
  // 取消全选
  select_none: function () {
    let that = this;
    that.setData({
      select_all: !that.data.select_all
    })
    let arr = that.data.taskList;
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
      arr[i].checked = false;
      arr2.push(arr[i]);
    }
    that.setData({
      taskList: arr2,
      middlearr: []
    })
  },

  showSearchModal(e) {
    var that = this;
    if (request_dataParam_map.has(that.data.TabCur)) {
      that.setData({
        task_request_dataParam: request_dataParam_map.get(that.data.TabCur),
        modalName: e.currentTarget.dataset.target
      })
    } else {
      that.setData({
        task_request_dataParam: {},
        modalName: e.currentTarget.dataset.target
      })
    }
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  //日期选项
  DateChange(e) {
    var that = this
    var data_param;
    if (request_dataParam_map.has(that.data.TabCur)) {
      data_param = request_dataParam_map.get(that.data.TabCur)
    } else {
      data_param = {};
    }
    data_param.date = e.detail.value
    request_dataParam_map = request_dataParam_map.set(that.data.TabCur, data_param)
    that.setData({
      task_request_dataParam: request_dataParam_map.get(that.data.TabCur)
    })
  },
  task_code_input(e) {
    var that = this;
    var type = e.currentTarget.dataset.type
    var data_param;
    if (request_dataParam_map.has(that.data.TabCur)) {
      data_param = request_dataParam_map.get(that.data.TabCur)
    } else {
      data_param = {};
    }
    if (type == 'code') {
      data_param.taskCode = e.detail.value
    } else if (type == 'location') {
      data_param.locationName = e.detail.value
    } else if (type == 'question') {
      data_param.question = e.detail.value
    } else if (type == 'point') {
      data_param.pointName = e.detail.value
    } else if (type == 'deptname') {
      data_param.departmentName = e.detail.value
    }
    request_dataParam_map = request_dataParam_map.set(that.data.TabCur, data_param)
  },
  //长按复制任务编号
  copyCode: function (e) {
    var code = e.currentTarget.dataset.key;
    wx.setClipboardData({
      data: code
    })
  },
  //多选框监听方法
  save_taskIds: function (e) {
    this.setData({
      batch_process_taskIdArr: e.detail.value
    })
  },
  //选中任务点击批量审批按钮 弹窗显示审批意见输入框
  show_auditContent_modal(e) {
    var that = this;
    var taskArr = that.data.batch_process_taskIdArr
    if (!taskArr || taskArr.length < 1) {
      app.msg('请先选择任务~')
      return
    } else {
      this.setData({
        processType: e.currentTarget.dataset.type,
        modalName: 'auditContent_modal'
      })
    }
  },
  set_auditContent: function (e) {
    this.setData({
      process_auditContent: e.detail.value,
    })
  },
  //批量审核方法
  batch_process: function (e) {
    //合格 0  0
    //不合格 2  0
    //长期整改  2  1
    var that = this;
    // console.log(that.data.batch_process_taskIdArr)
    // console.log(that.data.process_auditContent)
    // console.log(e.currentTarget.dataset.resulttype)
    // 0批量通过  1批量不通过  2批量长期整改
    var result_type = e.currentTarget.dataset.resulttype
    var taskIds = that.data.batch_process_taskIdArr + ''
    var auditContent = that.data.process_auditContent
    if (!auditContent) {
      app.msg('请输入审批意见~')
      return
    }
    if (auditContent.length > 500) {
      app.msg('审批意见不能超过500字')
      return
    }
    var param;
    if (result_type == 0) {
      //批量合格
      param = {
        taskIds: taskIds,
        result: 0,
        auditContent: auditContent,
      }
    } else {
      //批量不合格\长期整改
      param = {
        taskIds: taskIds,
        result: 2,
        longTask: result_type == 1 ? 0 : 1,
        auditContent: auditContent,
      }
    }
    param.userId = app.terminalUserId
    //调用全局 请求方法
    app.wxRequest(
      'POST',
      that.data.requestUrl + "/home/manage/batchCheck",
      param,
      app.seesionId,
      (res) => {
        console.log(res)
        var data = res.data
        if (data.status = "success") {
          app.alert("审核成功")
          that.setData({
            modalName: '',
            process_auditContent: ''
          })
          //刷新列表
          that.search_fun()
        } else {
          app.alert("请求失败")
        }
      },
      (err) => {
        app.alert("网络错误")
      }
    )
  },//setProjectDissentTime
  openSetDissentTimefun() {
    var that = this;
    that.setData({
      modalName: 'set_dissentTime_modal',
    })
  },
  //权属异议截止时间 监听fun
  dissent_timeChange(e) {
    var that = this;
    that.setData({
      dissent_time: e.detail.value,
    })
  },
  //权属异议截止日期 监听fun
  dissent_dateChange(e) {
    var that = this;
    that.setData({
      dissent_date: e.detail.value,
    })
  },
  setProjectDissentTime() {
    var that = this;
    //调用全局 请求方法
    app.wxRequest(
      'POST',
      that.data.requestUrl + "/mobile/fieldTask/setProjectDissentTimeByMoblie",
      {
        id: that.data.projectId,
        dissentTime: that.data.dissent_date + " " + that.data.dissent_time
      },
      app.seesionId,
      (res) => {
        var data = res.data
        if (data.status = "success") {
          that.setData({
            modalName: '',
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
  //跳转详情页
  goDetailPage: function (e) {
    var that = this;
    var TabCur = that.data.TabCur;
    var taskId = e.currentTarget.dataset.taskid; //任务id
    var projectId = e.currentTarget.dataset.projectid; //项目id
    var pageScrollto_id = e.currentTarget.id;
    //当前页数
    var pagenum = that.data.pageNum
    //最大页数
    var maxPageNum = that.data.maxPageNum
    var search_param = request_dataParam_map.get(that.data.TabCur)//undefined
    var search_param_str = ''
    //console.log(search_param)
    if(search_param){
      search_param_str = JSON.stringify(search_param)
    }
    var url = '../check_new_detail/check_new_detail?projectId=' + projectId + "&id=" + taskId + "&tabCur=" + TabCur+'&pageScrollto_id='+pageScrollto_id+'&search_param_str='+search_param_str+'&pagenum='+pagenum+'&maxPageNum='+maxPageNum
    if(TabCur == 4){//权属异议 增加单位参数
      url += '&departmentId='+e.currentTarget.dataset.deptid;
    }
    router.navigateTo({
      url: url,
      events:{
        acceptDataFromOpenedPage: function(data) {
          that.setData({
            children_page_data:data
          })
        },
      }
    })
    //初次待审核
    // if (TabCur == 3 || TabCur == 2) {
    //   console.log("跳转审核页面")
    //   router.navigateTo({
    //     url: '../check_check_detail/check_check_detail?projectId=' + projectId + "&taskId=" + taskId
    //   })
    // }
    // //未整改、整改合格
    // if (TabCur == 1 || TabCur == 0) {
    //   console.log("跳转未整改、整改合格页面")
    //   router.navigateTo({
    //     url: '../check_noAndSu_Detail/check_noAndSu_Detail?projectId=' + projectId + "&taskId=" + taskId
    //   })
    // }
    // // 权属异议
    // if (TabCur == 4) {
    //   console.log("跳转权属异议页面")
    //   router.navigateTo({
    //     url: '../check_objection_detail/check_objection_detail?projectId=' + projectId + "&taskId=" + taskId
    //   })
    // }
  },
})