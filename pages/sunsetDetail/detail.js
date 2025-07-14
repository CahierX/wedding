const { SunsetAPI } = require('../../utils/http');
const { getColorByQuality } = require('../../config/sunsetColors');

Page({
  data: {
    statusBarHeight: 0,
    loading: true,
    error: '',
    city: '',
    predictData: null,
    bgColor: 'linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #283593 100%)',
    adviceText: '',
    textColor: 'white',
    currentModel: 'GFS', // 当前选择的模式
    models: [
      {
        key: 'GFS',
        name: 'GFS',
        desc: '全球预报系统',
      },
      {
        key: 'EC',
        name: 'ECMWF',
        desc: '欧洲中期天气预报中心',
      },
    ],
  },

  onLoad(options) {
    // 设置状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      city: decodeURIComponent(options.city || ''),
    });

    // 设置初始页面背景色，避免滚动时出现白色
    this.setPageBackgroundColor(this.data.bgColor);

    // 开始预测
    this.startPredict();
  },

  // 开始预测
  async startPredict() {
    this.setData({
      loading: true,
      error: '',
    });

    // 显示微信官方 loading
    wx.showLoading({
      title: '预测中...',
      mask: true,
    });

    try {
      const result = await SunsetAPI.getSunsetPredict(
        this.data.city,
        this.data.currentModel,
      );
      if (result.success && result.data && result.data.status === 'ok') {
        this.setData({
          predictData: result.data,
          loading: false,
        });
        this.processResultData(result.data);
      } else {
        this.setData({
          error: result.error || '预测数据获取失败，请稍后重试',
          loading: false,
        });
      }
    } catch (error) {
      this.setData({
        error: '网络连接失败，请检查网络后重试',
        loading: false,
      });
    } finally {
      // 隐藏 loading
      wx.hideLoading();
    }
  },

  // 处理结果数据
  processResultData(data) {
    // 解析质量评级 - 提取数字部分
    const qualityStr = data.tb_quality || '0.001（微烧）';
    const qualityNum = parseFloat(qualityStr);

    // 使用共享的颜色配置
    const { bgColor, textColor } = getColorByQuality(qualityNum);

    let adviceText = '';

    // 根据SUNSET_COLORS等级精准匹配建议文案
    if (qualityNum === 0) {
      // NO_BURN - 深蓝夜色，云层厚重
      adviceText =
        '🌑 不烧。今晚大气层厚重，天空将呈现深蓝夜色，几乎没有晚霞观测条件。建议安排室内活动或关注明天的预测。';
    } else if (qualityNum <= 0.05) {
      // TINY_BURN - 深灰蓝色，微弱光线
      adviceText =
        '🌫️ 极微烧云。大气透明度极低，仅有微弱光线穿透，天空呈现深灰蓝色调。观测价值较低，建议降低期望。';
    } else if (qualityNum <= 0.1) {
      // MICRO_BURN - 灰蓝渐暖
      adviceText =
        '�️ 微烧云。大气条件一般，天空会有灰蓝渐暖的色调变化，但霞光微弱。适合初学者练习观测技巧。';
    } else if (qualityNum <= 0.15) {
      // LIGHT_BURN - 淡橙褐色到暖橙
      adviceText =
        '🌇 轻微烧云。今晚会出现淡橙褐色到暖橙的柔和色彩，虽然不够浓烈，但具有温柔的美感。建议选择安静的观测点慢慢欣赏。';
    } else if (qualityNum <= 0.2) {
      // SMALL_BURN - 温暖浅橙色
      adviceText =
        '🧡 小烧云。天空将呈现温暖的浅橙色调，色彩柔和宜人。适合与家人朋友一起观赏，记录温馨时刻。';
    } else if (qualityNum <= 0.4) {
      // SMALL_TO_MEDIUM - 橙红渐浓
      adviceText =
        '🔥 小烧到中烧云！今晚的晚霞将从橙色逐渐转为红色，层次丰富。建议选择视野开阔的地点，准备好相机捕捉色彩变化！';
    } else if (qualityNum <= 0.5) {
      // MEDIUM_BURN - 鲜艳橙黄
      adviceText =
        '✨ 中烧云！大气条件优秀，今晚将出现鲜艳的橙黄色晚霞，色彩饱满明亮。这是绝佳的摄影时机，记得提前选好机位！';
    } else if (qualityNum <= 0.6) {
      // MEDIUM_TO_LARGE - 金橙转红
      adviceText =
        '🌅 中烧到大烧云！！今晚的晚霞将呈现金橙转红的壮丽景象，色彩层次极其丰富。强烈建议前往制高点或开阔水域观测！';
    } else if (qualityNum <= 0.8) {
      // LARGE_BURN - 金红辉煌
      adviceText =
        '🔥🔥 大烧云！！！大气透明度极佳，今晚将出现金红辉煌的震撼晚霞，整个天空都会被点燃。摄影爱好者千万不要错过这次机会！';
    } else {
      // SUPER_BURN - 极致红色烈焰
      adviceText =
        '🌋✨ 世纪大烧云！！！！极其罕见的大气条件，今晚将出现极致红色烈焰般的晚霞，如同天空燃烧。这是一生难得一见的奇观，务必提前找好最佳观测位置！';
    }

    this.setData({
      bgColor,
      adviceText,
      textColor,
    });
    // 动态设置导航栏颜色
    this.setNavigationBarColor(bgColor, textColor);
    // 动态设置页面背景色，避免滚动时出现白色
    this.setPageBackgroundColor(bgColor);
  },

  // 图片加载成功
  onImageLoad() {
    // 预测图片加载成功
  },

  // 图片加载失败
  onImageError() {
    // 预测图片加载失败
  },

  // 重新预测
  retryPredict() {
    this.startPredict();
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 分享结果
  shareResult() {
    const { predictData } = this.data;
    if (!predictData) return;

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });

    // 可以在这里设置分享内容
    return {
      title: `${predictData.display_city_name} 晚霞预测结果`,
      path: `/pages/sunsetDetail/detail?city=${encodeURIComponent(
        this.data.city,
      )}`,
      imageUrl: '',
    };
  },

  // 预测其他城市
  predictAnother() {
    wx.navigateBack();
  },

  // 页面分享
  onShareAppMessage() {
    return this.shareResult();
  },

  onShareTimeline() {
    return this.shareResult();
  },

  // 切换预测模式
  switchModel(e) {
    const { model } = e.currentTarget.dataset;
    if (model !== this.data.currentModel) {
      this.setData({
        currentModel: model,
      });
      // 重新预测
      this.startPredict();
    }
  },

  // 动态设置页面背景色，避免滚动时出现白色
  setPageBackgroundColor(bgColor) {
    // 从渐变色中提取主色调作为页面背景
    const gradientMatch = bgColor.match(/#[0-9a-fA-F]{6}/);
    let backgroundColor = '#667eea'; // 默认颜色

    if (gradientMatch && gradientMatch.length > 0) {
      backgroundColor = gradientMatch[0];
    }

    // 设置页面背景颜色
    wx.setBackgroundColor({
      backgroundColor: backgroundColor,
      backgroundColorTop: backgroundColor,
      backgroundColorBottom: backgroundColor,
    });
  },

  // 动态设置导航栏颜色
  setNavigationBarColor(bgColor) {
    // 从渐变色中提取主色调
    const gradientMatch = bgColor.match(/#[0-9a-fA-F]{6}/);
    let backgroundColor = '#37474f'; // 默认颜色

    if (gradientMatch && gradientMatch.length > 0) {
      backgroundColor = gradientMatch[0];
    }
    // 设置导航栏颜色
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: backgroundColor,
      animation: {
        duration: 500,
        timingFunc: 'easeInOut',
      },
    });
  },
});
