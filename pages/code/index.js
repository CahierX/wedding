const { shared, Easing, timing, delay, repeat } = wx.worklet;
const { friendMap, locationMap } = require('../../mock/index');
Page({
  data: {
    textArray: [],
    inviteData: {},
    currentText: '', // 当前显示的文本
    showButton: false, // 控制按钮是否显示
    countdown: 10, // 新增：倒计时
    userId: '',
  },

  onLoad(options) {
    const { userId, name, welcome, location } = options;

    let inviteData = {};
    if (userId && friendMap[userId]) {
      inviteData = friendMap[userId];
    } else if (name) {
      inviteData = {
        name,
        welcome: welcome.split('↵'),
        ...locationMap[location],
      };
    } else {
      inviteData = friendMap.default;
    }
    this.setData({
      userId: userId,
      textArray: inviteData.welcome,
      inviteData,
    });

    // 开始播放婚礼邀请音乐
    const app = getApp();
    app.playMusic();

    setTimeout(() => {
      this.startTypingEffect();
    }, 500);
    this.preLoad();
  },
  preLoad() {
    wx.loadFontFace({
      family: 'xcFont',
      source:
        'url("https://fs-im-kefu.7moor-fs1.com/ly/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/1744117362323/xc.ttf")',
    });
  },

  // 打字机效果
  async startTypingEffect() {
    let currentText = '';
    for (const line of this.data.textArray) {
      for (const char of line) {
        currentText += char;
        this.setData({
          currentText,
        });
        await this.sleep(100); // 控制打字速度
      }
      currentText += '\n'; // 换行
      this.setData({
        currentText,
      });
      await this.sleep(300); // 换行间隔
    }
    this.showButton(); // 文字结束后显示按钮
  },

  // Worklet 按钮动画
  showButton() {
    this.setData({
      showButton: true,
    });

    this.btnY = shared(80);
    this.btnOpacity = shared(0);
    this.btnScale = shared(0.97);
    this.applyAnimatedStyle('.end-animate', () => {
      'worklet';
      return {
        transform: `translateY(${this.btnY.value}px) scale(${this.btnScale.value})`,
        opacity: this.btnOpacity.value,
      };
    });
    this.btnOpacity.value = timing(1, {
      duration: 1000,
      easing: Easing.ease,
    });

    this.btnY.value = timing(0, {
      duration: 1000,
      easing: Easing.ease,
    });
    this.btnScale.value = delay(
      0,
      repeat(
        timing(1.03, {
          duration: 1000,
          easing: Easing.ease,
        }),
        -1,
        true,
      ),
    );

    // 倒计时逻辑
    this.startCountdown();
  },
  startCountdown() {
    let remaining = 8;
    this.countdownTimer = setInterval(() => {
      remaining--;
      this.setData({
        countdown: remaining,
      });

      if (remaining <= 0) {
        this.onButtonClick();
      }
    }, 1000);
  },

  // 跳转到 map 页面
  onButtonClick() {
    clearInterval(this.countdownTimer);
    wx.vibrateShort({
      type: 'medium',
      complete: () => {
        wx.redirectTo({
          url: `/pages/map/index?userId=${
            this.data.userId
          }&inviteData=${JSON.stringify(this.data.inviteData)}`,
        });
      },
    });
  },

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  onUnload() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    // 注意：不要在这里停止音乐，因为要让音乐在跳转到 map 页面时继续播放
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
