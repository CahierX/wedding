Component({
  data: {
    selected: 0,
    color: 'rgba(255, 255, 255, 0.7)',
    selectedColor: '#ff6b35',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    list: [
      {
        pagePath: '/pages/sunsetIndex/index',
        text: '晚霞预测',
        iconPath: '/assets/tab-sunset.png',
        selectedIconPath: '/assets/tab-sunset-active.png',
      },
      {
        pagePath: '/pages/code/index',
        text: '婚礼请柬',
        iconPath: '/assets/tab-invite.png',
        selectedIconPath: '/assets/tab-invite-active.png',
      },
    ],
  },
  attached() {},
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({
        selected: data.index,
      });
    },
  },
});
