// custom-tab-bar/index.js
Component({
  data: {
    rightId:wx.getStorageSync('rightId') || 0,
    list: [
      {
        "pagePath": "/pages/index/index",
        "text": "首页",
        "iconPath": "../images/home.png",
        "selectedIconPath": "../images/home1.png"
      },
      {
        "pagePath": "/pages/jubao/jubao",
        "text": "上报",
        "iconPath": "../images/camera.png",
        "selectedIconPath": "../images/camera1.png"
      },
      {
        "pagePath": "/pages/user/user",
        "text": "个人中心",
        "iconPath": "../images/user.png",
        "selectedIconPath": "../images/user1.png"
      }
    ],
    list1: [{
      "pagePath": "/pages/index/index",
      "text": "首页",
      "iconPath": "../images/home.png",
      "selectedIconPath": "../images/home1.png"
    },
    {
      "pagePath": "/pages/jubao/jubao",
      "text": "上报",
      "iconPath": "../images/camera.png",
      "selectedIconPath": "../images/camera1.png"
    },
    {
      "pagePath": "/pages/ceshi/ceshi",
      "text": "整改上报",
      "iconPath": "../images/work.png",
      "selectedIconPath": "../images/work1.png"
    },
    {
      "pagePath": "/pages/user/user",
      "text": "个人中心",
      "iconPath": "../images/user.png",
      "selectedIconPath": "../images/user1.png"
    }
    ],
    list2: [{
      "pagePath": "/pages/index/index",
      "text": "首页",
      "iconPath": "../images/home.png",
      "selectedIconPath": "../images/home1.png"
    },
    {
      "pagePath": "/pages/jubao/jubao",
      "text": "上报",
      "iconPath": "../images/camera.png",
      "selectedIconPath": "../images/camera1.png"
    },
    {
      "pagePath": "/pages/back/back",
      "text": "整改审核",
      "iconPath": "../images/check.png",
      "selectedIconPath": "../images/check1.png"
    },
    {
      "pagePath": "/pages/user/user",
      "text": "个人中心",
      "iconPath": "../images/user.png",
      "selectedIconPath": "../images/user1.png"
    }
    ]
  },
  attached() {
    this.changeList()
    getApp().eventBus.on('rightChange', data => {
      if (data !== this.data.rightId) {
        this.setData({
          rightId: data
        })
        this.changeList()
      }
    })
  },
  detached() {
    app.eventBus.off('rightChange')
  },
  methods: {
    changeList() {
      this.setData({
        rightId: wx.getStorageSync('rightId') || 0
      })
      if (this.data.rightId === 0) {
        this.setData({
          list: this.data.list
        })
      } else if(this.data.rightId === 1) {
        this.setData({
          list: this.data.list1
        })
      }else{
        this.setData({
          list: this.data.list2
        })
      }
    },
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
    }
  }
})