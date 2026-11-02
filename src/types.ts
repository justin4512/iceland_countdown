export type QuoteCategory =
  | 'prep' // 準備
  | 'caution' // 注意
  | 'weather' // 氣候
  | 'culture' // 文化
  | 'wear' // 穿著
  | 'drive' // 行車
  | 'spot' // 網美景點
  | 'after'; // 回國後症候群

export interface Quote {
  /** Taipei calendar date, YYYY-MM-DD */
  date: string;
  /** 詼諧幹話 */
  joke: string;
  /** 正經提醒一行 */
  tip: string;
  category: QuoteCategory;
  /** optional spot id (see spots.ts) to show a photo card */
  spotId?: string;
}

export type ChecklistGroup =
  | 'docs' // 證件與預約
  | 'money' // 金錢與保險
  | 'car' // 租車與行車
  | 'wear' // 穿著
  | 'warm' // 避寒裝備（需購買）
  | 'tech' // 電子產品
  | 'health' // 藥品與保養
  | 'misc'; // 其他

export interface ChecklistItem {
  id: string;
  group: ChecklistGroup;
  title: string;
  note?: string;
  /** recommended to finish when this many days remain before departure */
  dueDaysBefore: number;
  /** true = needs to be bought */
  buy?: boolean;
}

export interface Stop {
  name: string;
  lat: number;
  lon: number;
}

export interface TripDay {
  day: number;
  date: string; // YYYY-MM-DD
  title: string;
  km: number;
  stops: Stop[];
  stay: string; // area name only, no address
}

export interface Spot {
  id: string;
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  day: number;
  blurb: string;
  photo?: {
    file: string; // path under public/photos/
    author: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
  };
}
