/* eslint-disable camelcase */
/**
 * 网络请求工具类
 */

class Http {
  /**
   * 通用请求方法
   */
  static async request(options) {
    return new Promise((resolve) => {
      wx.request({
        url: options.url,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          ...options.header,
        },
        timeout: options.timeout || 10000,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve({
              success: true,
              data: res.data,
            });
          } else {
            resolve({
              success: false,
              error: `请求失败: ${res.statusCode}`,
            });
          }
        },
        fail: (err) => {
          resolve({
            success: false,
            error: err.errMsg || '网络请求失败',
          });
        },
      });
    });
  }

  /**
   * GET 请求
   */
  static get(url, data) {
    return this.request({
      url,
      method: 'GET',
      data,
    });
  }

  /**
   * POST 请求
   */
  static post(url, data) {
    return this.request({
      url,
      method: 'POST',
      data,
    });
  }
}

/**
 * 晚霞预测API
 */
class SunsetAPI {
  /**
   * 获取晚霞预测数据
   */
  static async getSunsetPredict(city, model = 'GFS') {
    const baseURL = 'https://sunsetbot.top/';
    return Http.get(baseURL, {
      query_id: '6674781',
      intend: 'select_city',
      query_city: city,
      event_date: 'None',
      event: 'set_1',
      times: 'None',
      model: model,
    });
  }
}

/**
 * 第三方API集成
 */
class ThirdPartyAPI {
  /**
   * 获取必应每日一图
   */
  static async getBingDailyImage() {
    return Http.get(
      'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1',
    );
  }

  /**
   * 获取每日一言
   */
  static async getDailyQuote() {
    return Http.get('https://v1.hitokoto.cn/');
  }
}

/**
 * 工具函数
 */
class Utils {
  /**
   * 显示加载提示
   */
  static showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true,
    });
  }

  /**
   * 隐藏加载提示
   */
  static hideLoading() {
    wx.hideLoading();
  }

  /**
   * 显示成功提示
   */
  static showSuccess(title) {
    wx.showToast({
      title,
      icon: 'success',
      duration: 2000,
    });
  }

  /**
   * 显示错误提示
   */
  static showError(title) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 3000,
    });
  }

  /**
   * 格式化时间
   */
  static formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  /**
   * 获取时间问候语
   */
  static getTimeGreeting() {
    const hour = new Date().getHours();

    if (hour < 6) {
      return '深夜好';
    }
    if (hour < 12) {
      return '早上好';
    }
    if (hour < 18) {
      return '下午好';
    }
    return '晚上好';
  }

  /**
   * 节流函数
   */
  static throttle(func, delay) {
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      }
    };
  }

  /**
   * 防抖函数
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

module.exports = {
  Http,
  SunsetAPI,
  ThirdPartyAPI,
  Utils,
};
