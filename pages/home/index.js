// pages/home/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(_options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 如果进入 home 页面，停止婚礼邀请音乐
    const app = getApp();
    if (app.globalData.isPlay) {
      app.stopMusic();
    }
  },

  /**
   * 导航到晚霞预测页面
   */
  navigateToSunset() {
    // 触发振动反馈
    wx.vibrateShort({
      type: 'light',
    });

    wx.navigateTo({
      url: '/pages/sunsetIndex/index',
      fail: (err) => {
        console.error('导航到晚霞预测页面失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error',
        });
      },
    });
  },

  /**
   * 导航到婚礼邀请函页面
   */
  navigateToWedding() {
    // 触发振动反馈
    wx.vibrateShort({
      type: 'light',
    });

    wx.navigateTo({
      url: '/pages/code/index',
      fail: (err) => {
        console.error('导航到婚礼邀请函页面失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error',
        });
      },
    });
  },

  /**
   * 导航到照片页面
   */
  navigateToPhoto() {
    // 触发振动反馈
    wx.vibrateShort({
      type: 'light',
    });

    wx.navigateTo({
      url: '/pages/photo/index',
      fail: (err) => {
        console.error('导航到照片页面失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error',
        });
      },
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: 'X & C Story',
      path: '/pages/home/index',
      imageUrl: '',
    };
  },
});
