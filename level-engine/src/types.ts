/** OHLC bar with UTC epoch milliseconds. */
export type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type SessionRails = {
  pdh: number;
  pdl: number;
  pwh: number;
  pwl: number;
  dailyOpen: number;
};
