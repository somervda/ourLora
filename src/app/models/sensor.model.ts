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
  "RH" = 5,
  "pascal" = 6,
  "meters_sec" = 7,
  "meters" = 8,
  "dimensionless" = 9,
}

export interface UOMInfoItem {
  uom: UOM;
  name: string;
}

export const UOMInfo: UOMInfoItem[] = [
  {
    uom: UOM.bit,
    name: "Bit (On/Off, 0/1)",
  },
  {
    uom: UOM.centigrade,
    name: "Centigrade (Temperature)",
  },
  {
    uom: UOM.degrees,
    name: "Degrees (Angle 0-360)",
  },
  {
    uom: UOM.dimensionless,
    name: "Dimensionless (Pure scaler)",
  },
  {
    uom: UOM.meters,
    name: "Meters (Length)",
  },
  {
    uom: UOM.meters_sec,
    name: "M/s (speed)",
  },
  {
    uom: UOM.pascal,
    name: "Pascal (Pressure)",
  },
  {
    uom: UOM.RH,
    name: "RH (Relative Humidity%)",
  },
  {
    uom: UOM.volts,
    name: "Volts",
  },
];
