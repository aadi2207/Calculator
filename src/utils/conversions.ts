// Multi-unit and currency conversion engine with bilateral calculations and live reference matrix

import { ConversionCategory } from '../types/calculator';

export interface UnitItem {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export interface CategoryData {
  id: ConversionCategory;
  name: string;
  baseUnit: string;
  units: UnitItem[];
}

export const CONVERSION_CATEGORIES: CategoryData[] = [
  {
    id: 'length',
    name: 'Length',
    baseUnit: 'm',
    units: [
      { id: 'm', name: 'Meter', symbol: 'm', toBase: v => v, fromBase: v => v },
      { id: 'km', name: 'Kilometer', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', toBase: v => v / 100, fromBase: v => v * 100 },
      { id: 'mm', name: 'Millimeter', symbol: 'mm', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: 'mi', name: 'Mile', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
      { id: 'yd', name: 'Yard', symbol: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      { id: 'ft', name: 'Foot', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { id: 'in', name: 'Inch', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { id: 'nmi', name: 'Nautical Mile', symbol: 'NM', toBase: v => v * 1852, fromBase: v => v / 1852 },
    ]
  },
  {
    id: 'mass',
    name: 'Mass & Weight',
    baseUnit: 'kg',
    units: [
      { id: 'kg', name: 'Kilogram', symbol: 'kg', toBase: v => v, fromBase: v => v },
      { id: 'g', name: 'Gram', symbol: 'g', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: 'mg', name: 'Milligram', symbol: 'mg', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
      { id: 'lb', name: 'Pound', symbol: 'lb', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', toBase: v => v * 0.028349523125, fromBase: v => v / 0.028349523125 },
      { id: 'st', name: 'Stone', symbol: 'st', toBase: v => v * 6.35029318, fromBase: v => v / 6.35029318 },
      { id: 't', name: 'Metric Ton', symbol: 't', toBase: v => v * 1000, fromBase: v => v / 1000 },
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'C',
    units: [
      { id: 'C', name: 'Celsius', symbol: '°C', toBase: v => v, fromBase: v => v },
      { id: 'F', name: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) * (5 / 9), fromBase: v => v * (9 / 5) + 32 },
      { id: 'K', name: 'Kelvin', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
      { id: 'R', name: 'Rankine', symbol: '°R', toBase: v => (v - 491.67) * (5 / 9), fromBase: v => (v + 273.15) * (9 / 5) },
    ]
  },
  {
    id: 'storage',
    name: 'Data Storage',
    baseUnit: 'B',
    units: [
      { id: 'B', name: 'Byte', symbol: 'B', toBase: v => v, fromBase: v => v },
      { id: 'bit', name: 'Bit', symbol: 'b', toBase: v => v / 8, fromBase: v => v * 8 },
      { id: 'KB', name: 'Kilobyte (10³)', symbol: 'KB', toBase: v => v * 1e3, fromBase: v => v / 1e3 },
      { id: 'MB', name: 'Megabyte (10⁶)', symbol: 'MB', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { id: 'GB', name: 'Gigabyte (10⁹)', symbol: 'GB', toBase: v => v * 1e9, fromBase: v => v / 1e9 },
      { id: 'TB', name: 'Terabyte (10¹²)', symbol: 'TB', toBase: v => v * 1e12, fromBase: v => v / 1e12 },
      { id: 'KiB', name: 'Kibibyte (2¹⁰)', symbol: 'KiB', toBase: v => v * 1024, fromBase: v => v / 1024 },
      { id: 'MiB', name: 'Mebibyte (2²⁰)', symbol: 'MiB', toBase: v => v * 1048576, fromBase: v => v / 1048576 },
      { id: 'GiB', name: 'Gibibyte (2³⁰)', symbol: 'GiB', toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
    ]
  },
  {
    id: 'speed',
    name: 'Speed',
    baseUnit: 'm/s',
    units: [
      { id: 'mps', name: 'Meters per second', symbol: 'm/s', toBase: v => v, fromBase: v => v },
      { id: 'kph', name: 'Kilometers per hour', symbol: 'km/h', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { id: 'knot', name: 'Knot', symbol: 'kn', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
      { id: 'fps', name: 'Feet per second', symbol: 'ft/s', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { id: 'mach', name: 'Mach (sea level)', symbol: 'Ma', toBase: v => v * 340.29, fromBase: v => v / 340.29 },
    ]
  },
  {
    id: 'area',
    name: 'Area',
    baseUnit: 'sqm',
    units: [
      { id: 'sqm', name: 'Square Meter', symbol: 'm²', toBase: v => v, fromBase: v => v },
      { id: 'sqkm', name: 'Square Kilometer', symbol: 'km²', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { id: 'sqft', name: 'Square Foot', symbol: 'ft²', toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
      { id: 'sqyd', name: 'Square Yard', symbol: 'yd²', toBase: v => v * 0.836127, fromBase: v => v / 0.836127 },
      { id: 'sqmi', name: 'Square Mile', symbol: 'mi²', toBase: v => v * 2589988.11, fromBase: v => v / 2589988.11 },
      { id: 'acre', name: 'Acre', symbol: 'ac', toBase: v => v * 4046.85642, fromBase: v => v / 4046.85642 },
      { id: 'ha', name: 'Hectare', symbol: 'ha', toBase: v => v * 10000, fromBase: v => v / 10000 },
    ]
  },
  {
    id: 'volume',
    name: 'Volume',
    baseUnit: 'l',
    units: [
      { id: 'l', name: 'Liter', symbol: 'L', toBase: v => v, fromBase: v => v },
      { id: 'ml', name: 'Milliliter', symbol: 'mL', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: 'cum', name: 'Cubic Meter', symbol: 'm³', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'gal', name: 'US Gallon', symbol: 'gal', toBase: v => v * 3.785411784, fromBase: v => v / 3.785411784 },
      { id: 'qt', name: 'US Quart', symbol: 'qt', toBase: v => v * 0.946352946, fromBase: v => v / 0.946352946 },
      { id: 'pt', name: 'US Pint', symbol: 'pt', toBase: v => v * 0.473176473, fromBase: v => v / 0.473176473 },
      { id: 'cup', name: 'US Cup', symbol: 'cup', toBase: v => v * 0.2365882365, fromBase: v => v / 0.2365882365 },
      { id: 'floz', name: 'US Fluid Ounce', symbol: 'fl oz', toBase: v => v * 0.0295735295625, fromBase: v => v / 0.0295735295625 },
    ]
  },
  {
    id: 'time',
    name: 'Time',
    baseUnit: 's',
    units: [
      { id: 's', name: 'Second', symbol: 's', toBase: v => v, fromBase: v => v },
      { id: 'ms', name: 'Millisecond', symbol: 'ms', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: 'us', name: 'Microsecond', symbol: 'μs', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
      { id: 'min', name: 'Minute', symbol: 'min', toBase: v => v * 60, fromBase: v => v / 60 },
      { id: 'hr', name: 'Hour', symbol: 'hr', toBase: v => v * 3600, fromBase: v => v / 3600 },
      { id: 'day', name: 'Day', symbol: 'd', toBase: v => v * 86400, fromBase: v => v / 86400 },
      { id: 'wk', name: 'Week', symbol: 'wk', toBase: v => v * 604800, fromBase: v => v / 604800 },
      { id: 'yr', name: 'Year (365d)', symbol: 'yr', toBase: v => v * 31536000, fromBase: v => v / 31536000 },
    ]
  },
  {
    id: 'currency',
    name: 'Reference Currencies',
    baseUnit: 'USD',
    units: [
      { id: 'USD', name: 'US Dollar', symbol: '$', toBase: v => v, fromBase: v => v },
      { id: 'EUR', name: 'Euro', symbol: '€', toBase: v => v * 1.085, fromBase: v => v / 1.085 },
      { id: 'GBP', name: 'British Pound', symbol: '£', toBase: v => v * 1.282, fromBase: v => v / 1.282 },
      { id: 'JPY', name: 'Japanese Yen', symbol: '¥', toBase: v => v * 0.0065, fromBase: v => v / 0.0065 },
      { id: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', toBase: v => v * 0.725, fromBase: v => v / 0.725 },
      { id: 'AUD', name: 'Australian Dollar', symbol: 'A$', toBase: v => v * 0.655, fromBase: v => v / 0.655 },
      { id: 'CHF', name: 'Swiss Franc', symbol: 'CHF', toBase: v => v * 1.135, fromBase: v => v / 1.135 },
      { id: 'CNY', name: 'Chinese Yuan', symbol: '¥', toBase: v => v * 0.138, fromBase: v => v / 0.138 },
      { id: 'INR', name: 'Indian Rupee', symbol: '₹', toBase: v => v * 0.0118, fromBase: v => v / 0.0118 },
      { id: 'SGD', name: 'Singapore Dollar', symbol: 'S$', toBase: v => v * 0.745, fromBase: v => v / 0.745 },
      { id: 'AED', name: 'UAE Dirham', symbol: 'AED', toBase: v => v * 0.2723, fromBase: v => v / 0.2723 },
    ]
  }
];

export function convertUnits(
  val: number,
  category: ConversionCategory,
  fromUnitId: string,
  toUnitId: string
): number {
  if (isNaN(val)) return 0;
  const cat = CONVERSION_CATEGORIES.find(c => c.id === category);
  if (!cat) return val;

  const fromUnit = cat.units.find(u => u.id === fromUnitId);
  const toUnit = cat.units.find(u => u.id === toUnitId);
  if (!fromUnit || !toUnit) return val;

  const baseVal = fromUnit.toBase(val);
  const converted = toUnit.fromBase(baseVal);
  return converted;
}

export function getFormulaString(
  category: ConversionCategory,
  fromUnitId: string,
  toUnitId: string
): string {
  const cat = CONVERSION_CATEGORIES.find(c => c.id === category);
  if (!cat) return '';

  const fromUnit = cat.units.find(u => u.id === fromUnitId);
  const toUnit = cat.units.find(u => u.id === toUnitId);
  if (!fromUnit || !toUnit) return '';

  if (category === 'temperature') {
    if (fromUnitId === 'C' && toUnitId === 'F') return '°F = (°C × 9/5) + 32';
    if (fromUnitId === 'F' && toUnitId === 'C') return '°C = (°F − 32) × 5/9';
    if (fromUnitId === 'C' && toUnitId === 'K') return 'K = °C + 273.15';
    if (fromUnitId === 'K' && toUnitId === 'C') return '°C = K − 273.15';
    if (fromUnitId === 'F' && toUnitId === 'K') return 'K = (°F − 32) × 5/9 + 273.15';
    if (fromUnitId === 'K' && toUnitId === 'F') return '°F = (K − 273.15) × 9/5 + 32';
    return `${toUnit.symbol} conversion from ${fromUnit.symbol}`;
  }

  const oneUnitConverted = convertUnits(1, category, fromUnitId, toUnitId);
  const cleanVal = oneUnitConverted < 0.0001 || oneUnitConverted > 100000 
    ? oneUnitConverted.toExponential(4) 
    : oneUnitConverted.toLocaleString(undefined, { maximumFractionDigits: 6 });

  return `1 ${fromUnit.symbol} = ${cleanVal} ${toUnit.symbol}`;
}
