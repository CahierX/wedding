const { Utils } = require('../../utils/http');
const {
  getSunsetGradients,
  getColorByQuality,
} = require('../../config/sunsetColors');

Page({
  data: {
    statusBarHeight: 0,
    currentTime: '',
    dailyQuote: {
      content: '',
      author: '',
    },
    searchCity: '',
    currentBgColor: '',
    colorIndex: 0,
    textColor: 'white',

    // 新增：晚霞动画相关数据
    currentLevelIndex: 3, // 默认小烧
    sliderProgress: 40, // 滑动条进度（百分比）

    // 动画元素位置和透明度
    sunPosition: {
      x: 0,
      y: 0,
    },
    sunOpacity: 0.8,
    cloudOpacity: {
      cloud1: 0.6,
      cloud2: 0.4,
      cloud3: 0.3,
      cloud4: 0.5,
      cloud5: 0.2,
    },
    cloudPosition: {
      x1: 0,
      x2: 20,
      x3: -15,
      x4: 30,
      x5: -25,
    },
    cloudColors: {
      cloud1: 'rgba(255, 255, 255, 0.6)',
      cloud2: 'rgba(255, 255, 255, 0.4)',
      cloud3: 'rgba(255, 255, 255, 0.3)',
      cloud4: 'rgba(255, 255, 255, 0.5)',
      cloud5: 'rgba(255, 255, 255, 0.2)',
    },
    raysOpacity: 0.5,
    raysRotation: 0,

    // 级别标签 - 更细分的级别，包含主级别和刻度
    levelLabels: [
      '不烧',
      '极微烧',
      '微烧',
      '轻微烧',
      '小烧',
      '小到中烧',
      '中烧',
      '中到大烧',
      '大烧',
      '世纪大烧',
    ],

    // 详细刻度系统 - 每个主级别之间有10个刻度
    detailedScale: [],

    // 滑块相关
    sliderWidth: 375, // 屏幕宽度（px）- 初始值，会在onLoad中更新
    screenWidth: 375, // 真实屏幕宽度
    rpxRatio: 2, // rpx与px的转换比例，初始值
    itemWidth: 6, // 每个刻度的宽度（px）- 增大间隔
    centerIndex: 4, // 中心指针对应的级别索引（小烧对应索引4）
    translateX: 0, // 滑块容器的位移
    isSliding: false, // 是否正在滑动
    startX: 0, // 触摸开始位置
    lastTranslateX: 0, // 上次的位移值

    // 动画相关
    animationDuration: 300, // 动画持续时间
    isAnimating: false, // 是否正在动画中

    // 振动相关
    lastVibratedScaleIndex: 40, // 上次振动的刻度索引，用于避免重复振动（初始值对应小烧级别）
  },

  colorChangeInterval: null,
  animationTimer: null,

  onLoad() {
    this.initPage();
    this.startAnimationLoop();
  },

  onShow() {
    // 如果进入晚霞预测页面，停止婚礼邀请音乐
    const app = getApp();
    if (app.globalData.isPlay) {
      app.stopMusic();
    }

    // 检查城市是否发生变化，如果是则更新预测状态
    this.checkAndUpdateCityPrediction();
  },

  // 检查城市变化并更新预测状态
  async checkAndUpdateCityPrediction() {
    const currentCity = wx.getStorageSync('lastSearchCity');

    // 如果存储中的城市与当前显示的城市不同，说明用户搜索了新城市
    if (currentCity) {
      // 更新显示的城市名
      this.setData({
        searchCity: currentCity,
      });

      // 重新获取预测数据并更新状态
      await this.fetchAndSetSunsetLevel(currentCity);
    }
  },

  // 初始化页面
  initPage() {
    this.getSystemInfo();
    this.loadLastSearchCity();
    this.initDetailedScale();
    this.initSunsetController();
  },

  // 获取系统信息
  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync();
    const screenWidth = systemInfo.screenWidth || 375;
    // 微信小程序中，750rpx = screenWidth px，所以1px = 750/screenWidth rpx
    const rpxRatio = 750 / screenWidth;
    // 增大刻度宽度，每个刻度占用大约15rpx，转换为px
    const itemWidth = Math.max(15 / rpxRatio, 6); // 转换为物理像素，最小6px

    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 44,
      sliderWidth: screenWidth,
      screenWidth: screenWidth,
      itemWidth: itemWidth,
      rpxRatio: rpxRatio, // 保存rpx比例，用于调试
    });
  },

  onUnload() {
    if (this.colorChangeInterval) {
      clearInterval(this.colorChangeInterval);
    }
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
    }
  },

  // 初始化晚霞控制器
  initSunsetController() {
    const gradientColors = getSunsetGradients();
    const initialIndex = this.data.currentLevelIndex;

    // 初始化滑块位置
    this.initSliderPosition(initialIndex);

    // 设置初始背景色和动画状态
    this.updateSunsetLevel(initialIndex);
    this.setData({
      currentBgColor: gradientColors[initialIndex],
      textColor: this.getTextColorByIndex(initialIndex),
      centerIndex: initialIndex,
    });
  },

  // 初始化滑块位置
  initSliderPosition(targetIndex) {
    const { itemWidth, sliderWidth, detailedScale } = this.data;
    const centerOffset = sliderWidth / 2; // 屏幕中心
    const totalItems = detailedScale.length;

    // 每个主级别对应10个详细刻度，目标索引直接对应主级别
    const targetScaleIndex = targetIndex * 10; // 主级别对应的刻度索引

    // 三组数据布局：[组0][组1][组2]
    // 我们要让中间组（组1）的目标索引居中
    // 中间组的起始位置是 totalItems * itemWidth
    // 主级别刻度位于每个10刻度区间的第一个位置，所以不需要+0.5
    const middleGroupStartPosition = totalItems * itemWidth;
    // 主级别刻度位于每个10刻度区间的第一个位置，所以不需要+0.5
    const targetItemCenterPosition =
      middleGroupStartPosition + targetScaleIndex * itemWidth;
    const translateX = centerOffset - targetItemCenterPosition;

    this.setData({
      translateX: translateX,
      lastTranslateX: translateX,
      centerIndex: targetIndex,
    });
  },

  // 启动动画循环
  startAnimationLoop() {
    let rotation = 0;
    this.animationTimer = setInterval(() => {
      rotation += 1;
      this.setData({
        raysRotation: rotation % 360,
      });
    }, 100);
  },

  // 更新晚霞级别
  updateSunsetLevel(levelIndex) {
    const levels = [
      {
        text: '不烧',
        desc: '夜幕深沉，云层厚重遮蔽太阳',
        sunY: 60, // 太阳被完全遮挡，位置很低
        sunOpacity: 0.0, // 完全不可见
        cloudOpacity: {
          cloud1: 1.0,
          cloud2: 0.9,
          cloud3: 0.8,
          cloud4: 0.7,
          cloud5: 0.6,
        },
        cloudColors: {
          cloud1: 'rgba(100, 100, 120, 0.9)',
          cloud2: 'rgba(90, 90, 110, 0.8)',
          cloud3: 'rgba(80, 80, 100, 0.7)',
          cloud4: 'rgba(70, 70, 90, 0.6)',
          cloud5: 'rgba(60, 60, 80, 0.5)',
        },
        raysOpacity: 0,
      },
      {
        text: '极微烧',
        desc: '云缝中透出微弱光线',
        sunY: 50,
        sunOpacity: 0.1, // 微弱可见
        cloudOpacity: {
          cloud1: 0.9,
          cloud2: 0.8,
          cloud3: 0.7,
          cloud4: 0.6,
          cloud5: 0.5,
        },
        cloudColors: {
          cloud1: 'rgba(120, 120, 130, 0.8)',
          cloud2: 'rgba(110, 110, 120, 0.7)',
          cloud3: 'rgba(100, 100, 110, 0.6)',
          cloud4: 'rgba(90, 90, 100, 0.5)',
          cloud5: 'rgba(80, 80, 90, 0.4)',
        },
        raysOpacity: 0.05,
      },
      {
        text: '微烧',
        desc: '云层边缘泛起微光',
        sunY: 40,
        sunOpacity: 0.2,
        cloudOpacity: {
          cloud1: 0.8,
          cloud2: 0.7,
          cloud3: 0.6,
          cloud4: 0.5,
          cloud5: 0.4,
        },
        cloudColors: {
          cloud1: 'rgba(140, 130, 120, 0.7)',
          cloud2: 'rgba(130, 120, 110, 0.6)',
          cloud3: 'rgba(120, 110, 100, 0.5)',
          cloud4: 'rgba(110, 100, 90, 0.4)',
          cloud5: 'rgba(100, 90, 80, 0.3)',
        },
        raysOpacity: 0.1,
      },
      {
        text: '轻微烧',
        desc: '太阳露出一角，云彩微红',
        sunY: 25,
        sunOpacity: 0.4,
        cloudOpacity: {
          cloud1: 0.7,
          cloud2: 0.6,
          cloud3: 0.5,
          cloud4: 0.4,
          cloud5: 0.3,
        },
        cloudColors: {
          cloud1: 'rgba(180, 150, 130, 0.6)',
          cloud2: 'rgba(170, 140, 120, 0.5)',
          cloud3: 'rgba(160, 130, 110, 0.4)',
          cloud4: 'rgba(150, 120, 100, 0.3)',
          cloud5: 'rgba(140, 110, 90, 0.2)',
        },
        raysOpacity: 0.2,
      },
      {
        text: '小烧',
        desc: '太阳半露，云层染上橙色',
        sunY: 10,
        sunOpacity: 0.6,
        cloudOpacity: {
          cloud1: 0.6,
          cloud2: 0.5,
          cloud3: 0.4,
          cloud4: 0.3,
          cloud5: 0.2,
        },
        cloudColors: {
          cloud1: 'rgba(220, 180, 140, 0.5)',
          cloud2: 'rgba(210, 170, 130, 0.4)',
          cloud3: 'rgba(200, 160, 120, 0.3)',
          cloud4: 'rgba(190, 150, 110, 0.2)',
          cloud5: 'rgba(180, 140, 100, 0.1)',
        },
        raysOpacity: 0.3,
      },
      {
        text: '小到中烧',
        desc: '太阳大部分可见，云彩橙红',
        sunY: 0,
        sunOpacity: 0.8,
        cloudOpacity: {
          cloud1: 0.8,
          cloud2: 0.7,
          cloud3: 0.6,
          cloud4: 0.5,
          cloud5: 0.4,
        },
        cloudColors: {
          cloud1: 'rgba(255, 180, 100, 0.7)',
          cloud2: 'rgba(245, 170, 90, 0.6)',
          cloud3: 'rgba(235, 160, 80, 0.5)',
          cloud4: 'rgba(225, 150, 70, 0.4)',
          cloud5: 'rgba(215, 140, 60, 0.3)',
        },
        raysOpacity: 0.5,
      },
      {
        text: '中烧',
        desc: '太阳清晰可见，云层鲜艳',
        sunY: -10,
        sunOpacity: 0.9,
        cloudOpacity: {
          cloud1: 0.9,
          cloud2: 0.8,
          cloud3: 0.7,
          cloud4: 0.6,
          cloud5: 0.5,
        },
        cloudColors: {
          cloud1: 'rgba(255, 200, 80, 0.8)',
          cloud2: 'rgba(250, 190, 70, 0.7)',
          cloud3: 'rgba(245, 180, 60, 0.6)',
          cloud4: 'rgba(240, 170, 50, 0.5)',
          cloud5: 'rgba(235, 160, 40, 0.4)',
        },
        raysOpacity: 0.7,
      },
      {
        text: '中到大烧',
        desc: '太阳光芒四射，云彩金红',
        sunY: -20,
        sunOpacity: 1.0,
        cloudOpacity: {
          cloud1: 1.0,
          cloud2: 0.9,
          cloud3: 0.8,
          cloud4: 0.7,
          cloud5: 0.6,
        },
        cloudColors: {
          cloud1: 'rgba(255, 180, 60, 0.9)',
          cloud2: 'rgba(255, 170, 50, 0.8)',
          cloud3: 'rgba(255, 160, 40, 0.7)',
          cloud4: 'rgba(255, 150, 30, 0.6)',
          cloud5: 'rgba(255, 140, 20, 0.5)',
        },
        raysOpacity: 0.8,
      },
      {
        text: '大烧',
        desc: '太阳辉煌，火烧云满天',
        sunY: -30,
        sunOpacity: 1.0,
        cloudOpacity: {
          cloud1: 1.0,
          cloud2: 0.95,
          cloud3: 0.9,
          cloud4: 0.85,
          cloud5: 0.8,
        },
        cloudColors: {
          cloud1: 'rgba(255, 140, 40, 1.0)',
          cloud2: 'rgba(255, 130, 30, 0.9)',
          cloud3: 'rgba(255, 120, 20, 0.8)',
          cloud4: 'rgba(255, 110, 10, 0.7)',
          cloud5: 'rgba(255, 100, 0, 0.6)',
        },
        raysOpacity: 0.9,
      },
      {
        text: '世纪大烧',
        desc: '金光万道，天空如熔金',
        sunY: -40,
        sunOpacity: 1.0,
        cloudOpacity: {
          cloud1: 1.0,
          cloud2: 1.0,
          cloud3: 0.95,
          cloud4: 0.9,
          cloud5: 0.85,
        },
        cloudColors: {
          cloud1: 'rgba(255, 100, 0, 1.0)',
          cloud2: 'rgba(255, 80, 0, 0.95)',
          cloud3: 'rgba(255, 60, 0, 0.9)',
          cloud4: 'rgba(255, 40, 0, 0.85)',
          cloud5: 'rgba(255, 20, 0, 0.8)',
        },
        raysOpacity: 1.0,
      },
    ];

    const level = levels[levelIndex];
    const progress = (levelIndex / (levels.length - 1)) * 100;

    this.setData({
      currentLevelIndex: levelIndex,
      sliderProgress: progress,
      sunPosition: {
        x: 0,
        y: level.sunY,
      },
      sunOpacity: level.sunOpacity,
      cloudOpacity: level.cloudOpacity,
      cloudColors: level.cloudColors,
      raysOpacity: level.raysOpacity,
      textColor: this.getTextColorByIndex(levelIndex),
    });
  },

  // 根据颜色索引获取文字颜色
  getTextColorByIndex(index) {
    // 根据颜色索引判断文字颜色
    // 金黄色系列（大烧、世纪大烧）使用深色文字，其他使用白色文字
    const goldenIndexes = [7, 8, 9]; // 中到大烧、大烧、世纪大烧的索引
    return goldenIndexes.includes(index) ? '#2c2c2c' : 'white';
  },

  // 加载上次搜索的城市
  async loadLastSearchCity() {
    const lastCity = wx.getStorageSync('lastSearchCity');
    if (lastCity) {
      this.setData({
        searchCity: lastCity,
      });

      // 静默获取晚霞预测数据并设置级别
      await this.fetchAndSetSunsetLevel(lastCity);
    }
  },

  // 获取晚霞预测数据并设置级别
  async fetchAndSetSunsetLevel(city) {
    try {
      const { SunsetAPI } = require('../../utils/http');
      const result = await SunsetAPI.getSunsetPredict(city);

      if (result.success && result.data) {
        // 直接从API数据获取质量值和颜色配置
        const qualityStr = result.data.tb_quality || '0.001（微烧）';
        const qualityNum = parseFloat(qualityStr);

        // 使用共享的颜色配置，同时获取级别索引
        const colorResult = getColorByQuality(qualityNum);
        const { bgColor, textColor, levelIndex } = colorResult;
        // 验证级别索引的有效性
        if (levelIndex >= 0 && levelIndex <= 9) {
          // 更新级别索引和相关UI
          this.setData({
            currentLevelIndex: levelIndex,
            currentBgColor: bgColor,
            textColor: textColor,
            centerIndex: levelIndex,
          });

          // 重新初始化滑块位置和晚霞效果
          this.initSliderPosition(levelIndex);
          this.updateSunsetLevel(levelIndex);
        }
      }
    } catch (error) {
      // 静默处理错误，不影响页面正常显示
    }
  },
  // 输入城市名称
  onCityInput(e) {
    this.setData({
      searchCity: e.detail.value,
    });
  },

  // 搜索晚霞预测
  onSearch() {
    // 振动
    wx.vibrateShort({
      type: 'medium',
    });
    const city = this.data.searchCity.trim();
    if (!city) {
      Utils.showError('请输入城市名称');
      return;
    }

    // 保存到本地存储
    wx.setStorageSync('lastSearchCity', city);

    // 跳转到详情页
    Utils.hideLoading();
    wx.navigateTo({
      url: `/pages/sunsetDetail/detail?city=${encodeURIComponent(city)}`,
    });
  },

  // 点击级别标签
  onLevelTap(e) {
    const { index } = e.currentTarget.dataset;

    // 只处理主级别的点击（整数索引）
    const targetIndex = Math.floor(index);
    if (targetIndex === this.data.centerIndex) return;

    this.scrollToIndex(targetIndex);
  },

  // 滚动到指定索引
  scrollToIndex(targetIndex) {
    if (targetIndex === this.data.centerIndex) return;

    const { itemWidth } = this.data;

    // 点击时触发振动反馈
    wx.vibrateShort({
      type: 'medium',
    });

    // 计算距离，选择最短路径（支持循环）
    let distance = targetIndex - this.data.centerIndex;

    // 如果距离超过一半，选择反方向的更短路径
    if (distance > this.data.levelLabels.length / 2) {
      distance = distance - this.data.levelLabels.length;
    } else if (distance < -this.data.levelLabels.length / 2) {
      distance = distance + this.data.levelLabels.length;
    }

    const newTranslateX = this.data.translateX - distance * itemWidth * 10; // 乘以10因为每个主级别有10个刻度

    this.setData({
      isAnimating: true,
      translateX: newTranslateX,
      lastTranslateX: newTranslateX,
      centerIndex: targetIndex,
      lastVibratedIndex: targetIndex, // 更新振动索引
    });

    // 使用过渡效果更新晚霞级别
    this.updateSunsetLevelWithTransition(targetIndex);

    // 动画结束后重置状态
    setTimeout(() => {
      this.setData({
        isAnimating: false,
      });
      this.normalizePosition();
    }, this.data.animationDuration);
  },

  // 带过渡效果的更新晚霞级别
  updateSunsetLevelWithTransition(levelIndex) {
    // 更新动画元素（太阳、云层等）
    this.updateSunsetLevel(levelIndex);

    // 更新背景颜色，CSS 过渡会自动处理颜色渐变
    const gradientColors = getSunsetGradients();
    this.setData({
      currentBgColor: gradientColors[levelIndex],
    });
  },

  // 滑动条触摸开始
  onSliderTouchStart(e) {
    if (this.data.isAnimating) return;

    this.setData({
      isSliding: true,
      startX: e.touches[0].clientX,
      lastTranslateX: this.data.translateX,
    });
  },

  // 滑动条触摸移动
  onSliderTouchMove(e) {
    if (!this.data.isSliding || this.data.isAnimating) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - this.data.startX;
    const newTranslateX = this.data.lastTranslateX + deltaX;

    this.setData({
      translateX: newTranslateX,
    });

    // 实时计算当前中心索引
    this.updateCenterIndex();
  },

  // 滑动条触摸结束
  onSliderTouchEnd() {
    if (!this.data.isSliding) return;

    this.setData({
      isSliding: false,
    });

    // 自动吸附到最近的位置
    this.snapToNearestItem();
  },

  // 更新中心索引
  updateCenterIndex() {
    const { translateX, itemWidth, sliderWidth, detailedScale, levelLabels } =
      this.data;
    const totalItems = detailedScale.length;
    const centerOffset = sliderWidth / 2; // 使用屏幕中心

    // 计算当前中心对应的刻度索引
    const currentCenterPosition = centerOffset - translateX;
    // 中间组的起始位置
    const middleGroupStartPosition = totalItems * itemWidth;
    // 减去中间组起始位置，得到在中间组内的相对位置
    const relativePosition = currentCenterPosition - middleGroupStartPosition;
    // 计算刻度索引（不需要减去0.5，因为主级别就在每10个刻度的起始位置）
    const rawScaleIndex = relativePosition / itemWidth;
    let centerScaleIndex = Math.round(rawScaleIndex);

    // 处理循环边界，确保索引在有效范围内
    centerScaleIndex =
      ((centerScaleIndex % totalItems) + totalItems) % totalItems;

    // 转换为主级别索引（每10个刻度对应1个主级别）
    let centerIndex = Math.floor(centerScaleIndex / 10);
    centerIndex =
      ((centerIndex % levelLabels.length) + levelLabels.length) %
      levelLabels.length;

    // 检查是否需要振动（只在滑动时振动，且刻度发生变化时）
    if (
      this.data.isSliding &&
      centerScaleIndex !== this.data.lastVibratedScaleIndex
    ) {
      // 判断是主刻度还是小刻度
      const isMainScale = centerScaleIndex % 10 === 0;

      if (isMainScale) {
        // 主刻度（大刻度）：中等振动
        wx.vibrateShort({
          type: 'medium',
        });
      } else {
        // 小刻度：轻微振动
        wx.vibrateShort({
          type: 'light',
        });
      }

      this.setData({
        lastVibratedScaleIndex: centerScaleIndex,
      });
    }

    if (centerIndex !== this.data.centerIndex) {
      this.setData({
        centerIndex,
      });
      this.updateSunsetLevelWithTransition(centerIndex);
    }
  },

  // 自动吸附到最近的项目
  snapToNearestItem() {
    const { itemWidth, sliderWidth, detailedScale, levelLabels } = this.data;
    const centerOffset = sliderWidth / 2; // 使用屏幕中心
    const totalItems = detailedScale.length;

    // 计算当前最接近中心的刻度索引
    const currentCenterPosition = centerOffset - this.data.translateX;
    // 中间组的起始位置
    const middleGroupStartPosition = totalItems * itemWidth;
    // 减去中间组起始位置，得到在中间组内的相对位置
    const relativePosition = currentCenterPosition - middleGroupStartPosition;
    // 计算刻度索引
    const rawScaleIndex = relativePosition / itemWidth;
    let nearestScaleIndex = Math.round(rawScaleIndex);

    // 标准化刻度索引到有效范围
    nearestScaleIndex =
      ((nearestScaleIndex % totalItems) + totalItems) % totalItems;

    // 转换为主级别索引（每10个刻度对应1个主级别）
    let nearestIndex = Math.floor(nearestScaleIndex / 10);
    nearestIndex =
      ((nearestIndex % levelLabels.length) + levelLabels.length) %
      levelLabels.length;

    // 将刻度索引调整到最近的主级别（每10个刻度一个主级别）
    const adjustedScaleIndex = nearestIndex * 10;

    // 计算目标位移
    const targetItemCenterPosition =
      middleGroupStartPosition + adjustedScaleIndex * itemWidth;
    let targetTranslateX = centerOffset - targetItemCenterPosition;

    // 调整到最接近当前位置的等效位置
    const currentTranslateX = this.data.translateX;
    const totalWidth = totalItems * itemWidth;

    // 找到最接近当前位置的等效目标位置
    while (
      Math.abs(targetTranslateX + totalWidth - currentTranslateX) <
      Math.abs(targetTranslateX - currentTranslateX)
    ) {
      targetTranslateX += totalWidth;
    }
    while (
      Math.abs(targetTranslateX - totalWidth - currentTranslateX) <
      Math.abs(targetTranslateX - currentTranslateX)
    ) {
      targetTranslateX -= totalWidth;
    }

    // 吸附时根据刻度类型触发不同强度的振动反馈
    const isMainScale = adjustedScaleIndex % 10 === 0;

    if (isMainScale) {
      // 主刻度（大刻度）：中等振动
      wx.vibrateShort({
        type: 'medium',
      });
    } else {
      // 小刻度：轻微振动
      wx.vibrateShort({
        type: 'light',
      });
    }

    this.setData({
      isAnimating: true,
      translateX: targetTranslateX,
      lastTranslateX: targetTranslateX,
      centerIndex: nearestIndex,
      lastVibratedScaleIndex: adjustedScaleIndex, // 更新振动索引到刻度级别
    });

    // 滑动结束时使用过渡效果更新晚霞级别
    this.updateSunsetLevelWithTransition(nearestIndex);

    setTimeout(() => {
      this.setData({
        isAnimating: false,
      });
      this.normalizePosition();
    }, this.data.animationDuration);
  },

  // 规范化位置（处理无限滚动）
  normalizePosition() {
    const { translateX, itemWidth, detailedScale, sliderWidth } = this.data;
    const totalItems = detailedScale.length;
    const totalWidth = totalItems * itemWidth;
    const centerOffset = sliderWidth / 2; // 使用屏幕中心

    let normalizedTranslateX = translateX;

    // 计算理想的中心组位置范围
    const middleGroupStartPosition = totalItems * itemWidth;
    const idealCenterPosition = centerOffset - middleGroupStartPosition;
    const maxDeviation = totalWidth; // 允许的最大偏差

    // 如果偏移量过大，调整到等效位置（保持视觉连续性）
    if (normalizedTranslateX > idealCenterPosition + maxDeviation) {
      // 向左偏移过多，调整到右侧等效位置
      while (normalizedTranslateX > idealCenterPosition + maxDeviation) {
        normalizedTranslateX -= totalWidth;
      }
    } else if (normalizedTranslateX < idealCenterPosition - maxDeviation) {
      // 向右偏移过多，调整到左侧等效位置
      while (normalizedTranslateX < idealCenterPosition - maxDeviation) {
        normalizedTranslateX += totalWidth;
      }
    }

    // 只有在需要显著调整时才更新位置
    if (Math.abs(normalizedTranslateX - translateX) > totalWidth / 2) {
      this.setData({
        translateX: normalizedTranslateX,
        lastTranslateX: normalizedTranslateX,
      });
    }
  },

  // 初始化详细刻度系统
  initDetailedScale() {
    const { levelLabels } = this.data;
    const detailedScale = [];

    levelLabels.forEach((label, index) => {
      // 添加主级别
      detailedScale.push({
        type: 'major',
        label: label,
        levelIndex: index,
        scaleIndex: index * 10,
      });

      // 在主级别之间添加9个小刻度
      for (let i = 1; i <= 9; i++) {
        detailedScale.push({
          type: 'minor',
          label: '',
          levelIndex: index + i / 10, // 计算插值级别
          scaleIndex: index * 10 + i,
        });
      }
    });

    // 添加额外的间隔刻度，防止循环时重叠
    // 在最后添加一些小刻度作为缓冲区
    for (let i = 1; i <= 9; i++) {
      detailedScale.push({
        type: 'spacer',
        label: '',
        levelIndex: levelLabels.length - 1 + i / 10,
        scaleIndex: levelLabels.length * 10 + i,
      });
    }

    this.setData({
      detailedScale: detailedScale,
    });
  },
  onShareAppMessage() {
    return {
      title: `晚霞预测 - ${this.data.searchCity || '我的城市'}`,
      path: '/pages/sunsetIndex/index',
    };
  },
});
