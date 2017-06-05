//app.js
var dialog = require("./utils/dialog.js")
App({
  onLaunch: function () {
    // this.getTypes();
    //调用API从本地缓存中获取数据
    let types = wx.getStorageSync("types");
    if(!types){
      wx.setStorageSync("types", this.globalData.types);
    }
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  getTypes:function(){
    console.log("getTypes: ");
    dialog.loading()
        var that = this
        //请求数据
        wx.request({
          url:this.globalData.api.mingxingurl+"tags",
          success:function(ret){
            ret = ret['data']
            if(ret['code'] == '0' ){
                that.globalData.types = ret.data
            }else{
              setTimeout(function(){
                dialog.toast("网络超时啦~")
              },1)
            }
          },
          complete:function(){
            wx.stopPullDownRefresh()
            setTimeout(function(){
              dialog.hide()
            },1000)
          }
        })
  },
  globalData:{
    api:{
      // mingxingurl:"http://localhost:8080/",
      mingxingurl:"https://51mingxingtu.applinzi.com/",
    },
    currentType:'',
     types:[
      {
        title:"女神",
        value:"nv",
        is_show:true
      },
      {
        title:"男神",
        value:"nan",
        is_show:true
      },
    ]
  }
  
})