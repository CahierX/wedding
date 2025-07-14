import updateManager from './common/updateManager';

App({
  onShow() {
    updateManager();
  },

  globalData: {
    audioCtx: null,
    isPlay: false, // 音乐播放状态
    audioInited: false, // 音频是否已初始化
  },

  // 初始化音频上下文
  initAudio() {
    if (!this.globalData.audioInited) {
      this.globalData.audioCtx = wx.createInnerAudioContext();
      this.globalData.audioCtx.src =
        'https://fs-im-kefu.7moor-fs1.com/ly/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/1744098791826/EverybodyKnowsILoveYou.mp3';
      this.globalData.audioCtx.loop = true;
      this.globalData.audioCtx.obeyMuteSwitch = false;
      this.globalData.audioInited = true;
    }
  },

  playMusic() {
    this.initAudio();
    this.globalData.isPlay = true;
    this.globalData.audioCtx.play();
  },

  pauseMusic() {
    if (this.globalData.audioCtx) {
      this.globalData.isPlay = false;
      this.globalData.audioCtx.pause();
    }
  },

  stopMusic() {
    if (this.globalData.audioCtx) {
      this.globalData.isPlay = false;
      this.globalData.audioCtx.stop();
    }
  },
  onShareAppMessage() {},
});
