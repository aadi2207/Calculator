// Programmer Calculator Engine with 64-bit BigInt bitwise math

import { ProgrammerRadix, ProgrammerWordSize } from '../types/calculator';

export const WORD_SIZE_BITS: Record<ProgrammerWordSize, number> = {
  QWORD: 64,
  DWORD: 32,
  WORD: 16,
  BYTE: 8,
};

export const WORD_SIZE_MASKS: Record<ProgrammerWordSize, bigint> = {
  QWORD: 0xFFFFFFFFFFFFFFFFn,
  DWORD: 0xFFFFFFFFn,
  WORD: 0xFFFFn,
  BYTE: 0xFFn,
};

// Mask a BigInt to word size
export function maskToWordSize(val: bigint, size: ProgrammerWordSize): bigint {
  const mask = WORD_SIZE_MASKS[size];
  let res = val & mask;
  if (res < 0n) {
    res = (res + (mask + 1n)) & mask;
  }
  return res;
}

// Convert unsigned BigInt to signed based on word size
export function toSigned(val: bigint, size: ProgrammerWordSize): bigint {
  const bits = BigInt(WORD_SIZE_BITS[size]);
  const unsigned = maskToWordSize(val, size);
  const signBit = 1n << (bits - 1n);
  if ((unsigned & signBit) !== 0n) {
    return unsigned - (1n << bits);
  }
  return unsigned;
}

// Format BigInt to HEX string
export function toHexString(val: bigint, size: ProgrammerWordSize): string {
  const masked = maskToWordSize(val, size);
  return masked.toString(16).toUpperCase();
}

// Format BigInt to DEC string (signed or unsigned)
export function toDecString(val: bigint, size: ProgrammerWordSize, isSigned: boolean = false): string {
  if (isSigned) {
    const s = toSigned(val, size);
    return s.toString(10);
  }
  const masked = maskToWordSize(val, size);
  return masked.toString(10);
}

// Format BigInt to OCT string
export function toOctString(val: bigint, size: ProgrammerWordSize): string {
  const masked = maskToWordSize(val, size);
  return masked.toString(8);
}

// Format BigInt to BIN string grouped in 4-bit nibbles
export function toBinString(val: bigint, size: ProgrammerWordSize): string {
  const masked = maskToWordSize(val, size);
  const bits = WORD_SIZE_BITS[size];
  let bin = masked.toString(2);
  if (bin.length < bits) {
    bin = bin.padStart(bits, '0');
  } else if (bin.length > bits) {
    bin = bin.slice(bin.length - bits);
  }

  // Group into nibbles
  const nibbles: string[] = [];
  for (let i = 0; i < bin.length; i += 4) {
    nibbles.push(bin.slice(i, i + 4));
  }
  return nibbles.join(' ');
}

// Parse string in given radix to BigInt
export function parseRadix(str: string, radix: ProgrammerRadix, size: ProgrammerWordSize): bigint {
  const cleaned = str.replace(/[\s,]/g, '');
  if (!cleaned) return 0n;

  let r = 10;
  if (radix === 'HEX') r = 16;
  if (radix === 'OCT') r = 8;
  if (radix === 'BIN') r = 2;

  try {
    let val: bigint;
    if (r === 16) {
      val = BigInt('0x' + cleaned);
    } else if (r === 8) {
      val = BigInt('0o' + cleaned);
    } else if (r === 2) {
      val = BigInt('0b' + cleaned);
    } else {
      val = BigInt(cleaned);
    }
    return maskToWordSize(val, size);
  } catch {
    return 0n;
  }
}

// Bit manipulation
export function getBit(val: bigint, index: number): 0 | 1 {
  const bit = (val >> BigInt(index)) & 1n;
  return bit === 1n ? 1 : 0;
}

export function toggleBit(val: bigint, index: number, size: ProgrammerWordSize): bigint {
  const bitMask = 1n << BigInt(index);
  const flipped = val ^ bitMask;
  return maskToWordSize(flipped, size);
}

// Bitwise Operations
export function bitwiseNot(val: bigint, size: ProgrammerWordSize): bigint {
  return maskToWordSize(~val, size);
}

export function bitwiseAnd(a: bigint, b: bigint, size: ProgrammerWordSize): bigint {
  return maskToWordSize(a & b, size);
}

export function bitwiseOr(a: bigint, b: bigint, size: ProgrammerWordSize): bigint {
  return maskToWordSize(a | b, size);
}

export function bitwiseXor(a: bigint, b: bigint, size: ProgrammerWordSize): bigint {
  return maskToWordSize(a ^ b, size);
}

export function bitwiseNand(a: bigint, b: bigint, size: ProgrammerWordSize): bigint {
  return maskToWordSize(~(a & b), size);
}

export function bitwiseNor(a: bigint, b: bigint, size: ProgrammerWordSize): bigint {
  return maskToWordSize(~(a | b), size);
}

export function bitwiseLsh(a: bigint, shift: bigint = 1n, size: ProgrammerWordSize): bigint {
  return maskToWordSize(a << shift, size);
}

export function bitwiseRsh(a: bigint, shift: bigint = 1n, size: ProgrammerWordSize): bigint {
  return maskToWordSize(a >> shift, size);
}

// Circular bit rotation
export function bitwiseRol(val: bigint, shift: bigint = 1n, size: ProgrammerWordSize): bigint {
  const bits = BigInt(WORD_SIZE_BITS[size]);
  const s = shift % bits;
  const masked = maskToWordSize(val, size);
  const left = masked << s;
  const right = masked >> (bits - s);
  return maskToWordSize(left | right, size);
}

export function bitwiseRor(val: bigint, shift: bigint = 1n, size: ProgrammerWordSize): bigint {
  const bits = BigInt(WORD_SIZE_BITS[size]);
  const s = shift % bits;
  const masked = maskToWordSize(val, size);
  const right = masked >> s;
  const left = masked << (bits - s);
  return maskToWordSize(left | right, size);
}

// Check which key characters are valid for a given radix
export function isCharAllowedForRadix(char: string, radix: ProgrammerRadix): boolean {
  const upper = char.toUpperCase();
  switch (radix) {
    case 'BIN':
      return /^[01]$/.test(upper);
    case 'OCT':
      return /^[0-7]$/.test(upper);
    case 'DEC':
      return /^[0-9]$/.test(upper);
    case 'HEX':
      return /^[0-9A-F]$/.test(upper);
    default:
      return false;
  }
}
