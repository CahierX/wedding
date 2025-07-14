/* eslint-disable no-unused-expressions */
const { info, friendMap } = require('../../mock/index');
Page({
  data: {
    info: {},
    currentIndex: 0, // 当前显示的组件索引
  },

  onLoad(options) {
    const { userId, inviteData } = options;
    let friendData = {};
    if (userId && friendMap[userId]) {
      friendData = friendMap[userId];
    } else if (inviteData) {
      friendData = JSON.parse(inviteData);
    } else {
      friendData = friendMap.default;
    }
    this.setData({
      info: {
        ...info,
        ...friendData,
      },
    });

    // 确保音乐继续播放
    const app = getApp();
    if (!app.globalData.isPlay) {
      app.playMusic();
    }

    wx.loadFontFace({
      family: 'xcFont',
      source:
        'url("https://fs-im-kefu.7moor-fs1.com/ly/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/1744117362323/xc.ttf")',
    });

    const newComponentId = `invite${this.data.currentIndex + 1}`;
    console.log(newComponentId);
    this.startComponentAnimation(newComponentId);
  },
  onSwiperChange(e) {
    const newIndex = e.detail.current;
    const oldIndex = this.data.currentIndex;

    const oldComponentId = `invite${oldIndex + 1}`;
    this.resetComponentAnimation(oldComponentId);

    // 启动新组件动画
    const newComponentId = `invite${newIndex + 1}`;
    this.startComponentAnimation(newComponentId);

    this.setData({
      currentIndex: newIndex,
    });
  },

  startComponentAnimation(componentId) {
    const component = this.selectComponent(`#${componentId}`);
    component?.startAnimation?.();
  },

  resetComponentAnimation(componentId) {
    const component = this.selectComponent(`#${componentId}`);
    component?.resetAnimation?.();
  },
  onShareAppMessage() {
    return {
      title: '诚邀参加肖亚&陈本拯婚礼',
      path: '/pages/code/index',
      imageUrl:
        'https://h5cdn.hunbei.com/editorTempCustomPic/2025-4-16-jSx6DhDhriAn5CHCBmjiSmGFy2fPdBNt',
    };
  },
  onShareTimeline() {
    return {
      title: '诚邀参加肖亚&陈本拯婚礼',
      path: '/pages/code/index',
      imageUrl:
        'https://h5cdn.hunbei.com/editorTempCustomPic/2025-4-16-jSx6DhDhriAn5CHCBmjiSmGFy2fPdBNt',
    };
  },
});
