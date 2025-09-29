export const locationMap = {
  'sichuan': {
    date: '2025-05-01',
    year: 2025,
    month: 5,
    day: 1,
    nongLi: '乙巳年四月初四',
    location: 'xxx',
    latitude: 29.923179,
    longitude: 105.624569,
  },
  "wuhan": {
    date: '2025-05-10',
    year: 2025,
    month: 5,
    day: 10,
    nongLi: '乙巳年四月十三',
    location: 'xxx',
    latitude: 30.640082,
    longitude: 114.138508,
  }
}
const xyFriendMap = {
  'zhiwei': {
    name: 'xx',
    ...locationMap['wuhan'],
    welcome: [
      "xx~ 终于到我发邀请函啦！",
      "2025 年 5 月 10 日，我要结婚咯！",
      "xxxxxxx~",
      "有空的话来吃我的席呀！",
      "望我们，岁岁年年，同欢共乐！",
    ],
  },
}
export const friendMap = {
  'default': {
    name: '默认',
    ...locationMap['wuhan'],
    welcome: [
      "朋友们~ 终于到我发邀请函啦！",
      "2025 年 5 月 10 日，我要结婚咯！",
      "如果你有时间，来吃我的席呀！",
      "望我们，岁岁年年，同欢共乐！"
    ],
  },
  ...xyFriendMap,
  ...cbzFriendMap
}

export const info = {
  woman: '肖亚',
  man: '陈本拯',
}
