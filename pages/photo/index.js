// pages/photo/index.js
const { photoList } = require('../../mock/photo.js');

Page({
  /**
   * Page initial data
   */
  data: {
    list: [], // 当前显示的图片列表
    allPhotos: photoList, // 所有图片数据
    pageSize: 10, // 每页加载数量
    currentPage: 0, // 当前页数
    hasMore: true, // 是否有更多数据
    isLoadingMore: false, // 是否正在加载更多
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad() {
    // 直接加载第一页数据，不显示loading
    this.loadMorePhotos();
  },

  /**
   * 加载更多照片
   */
  loadMorePhotos() {
    const { allPhotos, currentPage, pageSize, list, hasMore } = this.data;

    if (!hasMore) return;

    this.setData({
      isLoadingMore: true,
    });

    // 模拟网络延迟
    setTimeout(() => {
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const newPhotos = allPhotos.slice(startIndex, endIndex);

      if (newPhotos.length === 0) {
        this.setData({
          hasMore: false,
          isLoadingMore: false,
        });
        return;
      }

      const updatedList = [...list, ...newPhotos];

      this.setData({
        list: updatedList,
        currentPage: currentPage + 1,
        hasMore: endIndex < allPhotos.length,
        isLoadingMore: false,
      });
    }, 300);
  },

  /**
   * 打开图片预览
   */
  previewImage(e) {
    const { url } = e.currentTarget.dataset;

    // 添加触觉反馈
    wx.vibrateShort({
      type: 'light',
    });

    // 预览图片
    wx.previewImage({
      urls: [url],
      current: url,
      showmenu: true,
      success: () => {
        // 成功回调
      },
      fail: () => {
        wx.showToast({
          title: '图片加载失败',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },

  /**
   * 下载图片
   */
  downloadImage(e) {
    const { url } = e.currentTarget.dataset;

    wx.vibrateShort({
      type: 'medium',
    });

    wx.showLoading({
      title: '保存中...',
      mask: true,
    });

    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading();
              wx.showToast({
                title: '保存成功 💕',
                icon: 'success',
                duration: 2000,
              });
            },
            fail: () => {
              wx.hideLoading();
              wx.showModal({
                title: '保存失败',
                content: '请检查是否授权访问相册',
                showCancel: false,
              });
            },
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '下载失败',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '我们的美好回忆',
    });
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {
    // 如果进入照片页面，停止婚礼邀请音乐
    const app = getApp();
    if (app.globalData && app.globalData.isPlay) {
      app.stopMusic();
    }
  },

  /**
   * 页面滚动到底部
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoadingMore) {
      this.loadMorePhotos();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    // 重置数据，重新加载
    this.setData({
      list: [],
      currentPage: 0,
      hasMore: true,
      isLoadingMore: false,
    });

    this.loadMorePhotos();

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 分享给好友
   */
  onShareAppMessage() {
    return {
      title: '我们的美好回忆',
      path: '/pages/photo/index',
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '记录每一个幸福瞬间',
      path: '/pages/photo/index',
    };
  },
});
