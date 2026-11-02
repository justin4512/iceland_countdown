import type { TripDay } from '../types';

// From the route list in the Iceland site (OSRM distances). Area names only — no addresses.
export const ITINERARY: TripDay[] = [
  {
    day: 1, date: '2027-03-01', title: '抵達日', km: 14.5, stay: 'Sandgerði',
    stops: [{ name: 'KEF 機場', lat: 63.985, lon: -22.605 }, { name: '桑德格迪', lat: 64.061, lon: -22.704 }],
  },
  {
    day: 2, date: '2027-03-02', title: '首都日：博物館、小豬超市、Sky Lagoon', km: 144.3, stay: 'Grímsnes',
    stops: [
      { name: '陰莖博物館', lat: 64.148, lon: -21.938 },
      { name: 'Sky Lagoon', lat: 64.116, lon: -21.946 },
      { name: 'Grímsnes', lat: 64.038, lon: -20.781 },
    ],
  },
  {
    day: 3, date: '2027-03-03', title: '黃金圈：Silfra 是主角', km: 209.6, stay: 'Hvolsvöllur 一帶',
    stops: [
      { name: '凱瑞斯', lat: 64.041, lon: -20.885 },
      { name: '辛格韋德利', lat: 64.256, lon: -21.13 },
      { name: '間歇泉', lat: 64.31, lon: -20.302 },
      { name: '黃金瀑布', lat: 64.327, lon: -20.12 },
      { name: 'Hvolsvöllur', lat: 63.746, lon: -20.228 },
    ],
  },
  {
    day: 4, date: '2027-03-04', title: '南岸瀑布與黑沙灘', km: 124.3, stay: 'Vík',
    stops: [
      { name: '塞里雅蘭瀑布', lat: 63.616, lon: -19.989 },
      { name: '斯科加瀑布', lat: 63.532, lon: -19.511 },
      { name: 'Dyrhólaey', lat: 63.402, lon: -19.131 },
      { name: '雷尼斯黑沙灘', lat: 63.404, lon: -19.045 },
      { name: 'Vík', lat: 63.438, lon: -19.06 },
    ],
  },
  {
    day: 5, date: '2027-03-05', title: '冰川健行、卡特拉冰洞、羽毛峽谷', km: 163.0, stay: 'Kirkjubæjarklaustur 一帶',
    stops: [
      { name: '索爾黑馬冰川', lat: 63.53, lon: -19.372 },
      { name: '卡特拉冰洞', lat: 63.418, lon: -19.014 },
      { name: '教堂鎮', lat: 63.79, lon: -18.05 },
      { name: '羽毛峽谷', lat: 63.771, lon: -18.172 },
      { name: '住宿', lat: 63.671, lon: -18.414 },
    ],
  },
  {
    day: 6, date: '2027-03-06', title: '鑽石沙灘與冰河湖', km: 210.8, stay: 'Höfn',
    stops: [
      { name: '鑽石沙灘', lat: 64.042, lon: -16.214 },
      { name: '冰河湖', lat: 64.048, lon: -16.18 },
      { name: 'Höfn', lat: 64.262, lon: -15.212 },
    ],
  },
  {
    day: 7, date: '2027-03-07', title: '東峽灣長征（最長的一天）', km: 379.0, stay: 'Eskifjörður 一帶',
    stops: [
      { name: '天空之鏡', lat: 64.244, lon: -14.967 },
      { name: '橘色燈塔', lat: 64.402, lon: -14.54 },
      { name: '迪尤皮沃格爾', lat: 64.656, lon: -14.283 },
      { name: '哈洛姆斯塔德森林', lat: 65.093, lon: -14.744 },
      { name: '埃伊爾斯塔濟', lat: 65.265, lon: -14.395 },
      { name: '住宿', lat: 65.06, lon: -13.994 },
    ],
  },
  {
    day: 8, date: '2027-03-08', title: '火山、地熱谷、米湖', km: 310.7, stay: 'Mývatn 西側',
    stops: [
      { name: '火山區 Víti', lat: 65.718, lon: -16.758 },
      { name: '地熱谷', lat: 65.643, lon: -16.803 },
      { name: '米湖', lat: 65.642, lon: -16.91 },
      { name: '黑色城堡', lat: 65.592, lon: -16.913 },
      { name: '偽火山口', lat: 65.569, lon: -17.038 },
      { name: '住宿', lat: 65.848, lon: -17.546 },
    ],
  },
  {
    day: 9, date: '2027-03-09', title: '眾神瀑布與阿克雷里', km: 70.2, stay: 'Akureyri 近郊',
    stops: [
      { name: '眾神瀑布', lat: 65.683, lon: -17.55 },
      { name: '瓦拉森林', lat: 65.716, lon: -17.89 },
      { name: '阿克雷里', lat: 65.68, lon: -18.091 },
    ],
  },
  {
    day: 10, date: '2027-03-10', title: '雪橇犬、森林溫泉、冰島馬', km: 77.9, stay: 'Akureyri 近郊',
    stops: [
      { name: 'Forest Lagoon', lat: 65.67, lon: -18.042 },
      { name: 'Polar Hestar', lat: 65.93, lon: -18.104 },
    ],
  },
  {
    day: 11, date: '2027-03-11', title: '阿克雷里散步、向西換宿', km: 106.5, stay: 'Varmahlíð',
    stops: [
      { name: '阿克雷里大教堂', lat: 65.68, lon: -18.091 },
      { name: 'Varmahlíð', lat: 65.546, lon: -19.439 },
    ],
  },
  {
    day: 12, date: '2027-03-12', title: '熔岩瀑布、溫泉眼、博加內斯加油', km: 319.0, stay: 'Borgarnes 西北',
    stops: [
      { name: '布倫迪歐斯', lat: 65.66, lon: -20.29 },
      { name: '赫倫瀑布群', lat: 64.703, lon: -20.978 },
      { name: '溫泉眼', lat: 64.664, lon: -21.411 },
      { name: '博加內斯', lat: 64.539, lon: -21.92 },
      { name: '住宿', lat: 64.712, lon: -22.344 },
    ],
  },
  {
    day: 13, date: '2027-03-13', title: '斯奈山半島', km: 345.0, stay: 'Mosfellsbær',
    stops: [
      { name: 'Ytri Tunga 海豹', lat: 64.804, lon: -23.08 },
      { name: '黑教堂', lat: 64.822, lon: -23.384 },
      { name: '阿納斯塔皮', lat: 64.767, lon: -23.633 },
      { name: '黑沙灘', lat: 64.754, lon: -23.895 },
      { name: '教會山', lat: 64.942, lon: -23.306 },
      { name: 'Mosfellsbær', lat: 64.111, lon: -21.634 },
    ],
  },
  {
    day: 14, date: '2027-03-14', title: '首都散步、藍湖收尾', km: 93.2, stay: 'Hafnir',
    stops: [
      { name: '雷克雅維克', lat: 64.142, lon: -21.927 },
      { name: '藍湖', lat: 63.88, lon: -22.45 },
      { name: 'Hafnir', lat: 63.933, lon: -22.683 },
    ],
  },
  {
    day: 15, date: '2027-03-15', title: '返程：04:30 出發還車', km: 11.4, stay: '飛機上',
    stops: [{ name: 'KEF 機場', lat: 63.985, lon: -22.605 }],
  },
];

export const TOTAL_KM = Math.round(ITINERARY.reduce((s, d) => s + d.km, 0));

/** Link to the existing interactive map site */
export const MAP_SITE_URL = '';
