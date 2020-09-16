export interface Sensor {
  id?: string;
  name: string;
  description: string;
  uom: UOM;
  acquisitionMap: {
    timestamp: string;
    value: string;
    latitude: string;
    longitude: string;
  };
}

export enum UOM {
  "centigrade" = 1,
  "volts" = 2,
  "degrees" = 3,
  "bit" = 4,
  "relativeHumidity" = 5,
  "pascal" = 6,
  "meters/sec" = 7,
  "meters" = 8,
  "dimensionless" = 9,
}
