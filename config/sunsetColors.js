// 晚霞预测颜色配置
const SUNSET_COLORS = {
  // 不烧：深蓝夜色，云层厚重
  NO_BURN: 'linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #283593 100%)',

  // 极微烧：深灰蓝色，微弱光线
  TINY_BURN: 'linear-gradient(135deg, #37474f 0%, #455a64 50%, #546e7a 100%)',

  // 微烧：灰蓝渐暖
  MICRO_BURN: 'linear-gradient(135deg, #607d8b 0%, #78909c 50%, #90a4ae 100%)',

  // 轻微烧：淡橙褐色到暖橙
  LIGHT_BURN:
    'linear-gradient(135deg, #8d6e63 0%, #a0785a 30%, #bf8b66 60%, #d4a573 100%)',

  // 小烧：温暖浅橙色（降低饱和度）
  SMALL_BURN:
    'linear-gradient(135deg, #bf9175 0%, #d4a373 25%, #f4a261 50%, #f2994a 75%, #f39c12 100%)',

  // 小烧到中烧：橙红渐浓
  SMALL_TO_MEDIUM:
    'linear-gradient(135deg, #ff5722 0%, #ff7043 25%, #ff9800 50%, #ffb74d 75%, #ffc947 100%)',

  // 中烧：鲜艳橙红
  MEDIUM_BURN:
    'linear-gradient(135deg, #ff6f00 0%, #ff8f00 25%, #ff9800 50%, #ff7043 75%, #ff5722 100%)',

  // 中烧到大烧：金橙转红
  MEDIUM_TO_LARGE:
    'linear-gradient(135deg, #ff8f00 0%, #ffb300 20%, #ff9800 40%, #ff6f00 60%, #ff5722 80%, #e53935 100%)',

  // 大烧：金红辉煌，开始偏红
  LARGE_BURN:
    'linear-gradient(135deg, #ff6f00 0%, #ff5722 20%, #f44336 40%, #e53935 60%, #d32f2f 80%, #c62828 100%)',

  // 世纪大烧：极致红色烈焰，强烈偏红
  SUPER_BURN:
    'linear-gradient(135deg, #ff5722 0%, #f44336 15%, #e53935 30%, #d32f2f 45%, #c62828 60%, #b71c1c 75%, #8b0000 90%, #660000 100%)',
};

// 获取渐变色数组（按晚霞强度排序）
const getSunsetGradients = () => {
  return [
    SUNSET_COLORS.NO_BURN,
    SUNSET_COLORS.TINY_BURN,
    SUNSET_COLORS.MICRO_BURN,
    SUNSET_COLORS.LIGHT_BURN,
    SUNSET_COLORS.SMALL_BURN,
    SUNSET_COLORS.SMALL_TO_MEDIUM,
    SUNSET_COLORS.MEDIUM_BURN,
    SUNSET_COLORS.MEDIUM_TO_LARGE,
    SUNSET_COLORS.LARGE_BURN,
    SUNSET_COLORS.SUPER_BURN,
  ];
};

// 根据质量值获取背景颜色、文字颜色和级别索引
const getColorByQuality = (qualityNum) => {
  let bgColor = '';
  let textColor = '#ffffff'; // 默认白色
  let levelIndex = 0;

  if (qualityNum === 0 || qualityNum < 0.05) {
    // 不烧：深蓝夜色
    bgColor = SUNSET_COLORS.NO_BURN;
    textColor = '#ffffff';
    levelIndex = 0;
  } else if (qualityNum < 0.1) {
    // 极微烧：深灰蓝色
    bgColor = SUNSET_COLORS.TINY_BURN;
    textColor = '#ffffff';
    levelIndex = 1;
  } else if (qualityNum < 0.15) {
    // 微烧：灰蓝渐暖
    bgColor = SUNSET_COLORS.MICRO_BURN;
    textColor = '#ffffff';
    levelIndex = 2;
  } else if (qualityNum < 0.2) {
    // 轻微烧：淡橙褐色到暖橙
    bgColor = SUNSET_COLORS.LIGHT_BURN;
    textColor = '#f5f5f5';
    levelIndex = 3;
  } else if (qualityNum < 0.3) {
    // 小烧：温暖浅橙色
    bgColor = SUNSET_COLORS.SMALL_BURN;
    textColor = '#E8E8E8';
    levelIndex = 4;
  } else if (qualityNum < 0.45) {
    // 小烧到中烧：橙红渐浓
    bgColor = SUNSET_COLORS.SMALL_TO_MEDIUM;
    textColor = '#ffffff';
    levelIndex = 5;
  } else if (qualityNum < 0.6) {
    // 中烧：鲜艳橙黄
    bgColor = SUNSET_COLORS.MEDIUM_BURN;
    textColor = '#f0f0f0';
    levelIndex = 6;
  } else if (qualityNum < 0.75) {
    // 中烧到大烧：金橙转红
    bgColor = SUNSET_COLORS.MEDIUM_TO_LARGE;
    textColor = '#ffffff';
    levelIndex = 7;
  } else if (qualityNum < 0.9) {
    // 大烧：金红辉煌
    bgColor = SUNSET_COLORS.LARGE_BURN;
    textColor = '#ffffff';
    levelIndex = 8;
  } else {
    // 世纪大烧：极致红色烈焰
    bgColor = SUNSET_COLORS.SUPER_BURN;
    textColor = '#ffffff';
    levelIndex = 9;
  }
  return { bgColor, textColor, levelIndex };
};

module.exports = {
  SUNSET_COLORS,
  getSunsetGradients,
  getColorByQuality,
};
