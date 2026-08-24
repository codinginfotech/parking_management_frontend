/**
 * Minimal ESC/POS command builder for 58/80mm thermal roll printers — the
 * printers used at parking gates. Layout targets 32 characters per line
 * (Font A on 58mm paper; 80mm printers simply gain side margins).
 */

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const LINE_WIDTH = 32;

/** Thermal printers speak ASCII — strip anything they would garble. */
function toAscii(text: string): string {
  return text
    .replace(/[·•]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/₹/g, 'Rs.')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

class EscPosBuilder {
  private bytes: number[] = [];

  raw(...values: number[]): this {
    this.bytes.push(...values);
    return this;
  }

  init(): this {
    return this.raw(ESC, 0x40);
  }

  alignCenter(): this {
    return this.raw(ESC, 0x61, 0x01);
  }

  bold(on: boolean): this {
    return this.raw(ESC, 0x45, on ? 0x01 : 0x00);
  }

  /** 0x00 normal · 0x11 double · 0x22 triple (width and height nibbles). */
  size(value: number): this {
    return this.raw(GS, 0x21, value);
  }

  text(value: string): this {
    for (const char of toAscii(value)) {
      this.bytes.push(char.charCodeAt(0));
    }
    return this.raw(LF);
  }

  divider(): this {
    return this.text('-'.repeat(LINE_WIDTH));
  }

  feed(lines: number): this {
    for (let i = 0; i < lines; i += 1) this.raw(LF);
    return this;
  }

  /** QR via GS ( k — supported by effectively all ESC/POS roll printers. */
  qr(data: string, moduleSize = 6): this {
    const payload = toAscii(data).length === data.length ? data : toAscii(data);
    const store = payload.length + 3;
    const pL = store % 256;
    const pH = Math.floor(store / 256);
    this.raw(GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00); // model 2
    this.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, moduleSize); // module size
    this.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31); // error correction M
    this.raw(GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30); // store
    for (const char of payload) this.bytes.push(char.charCodeAt(0));
    this.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30); // print
    return this;
  }

  /** Partial cut with feed — printers without a cutter ignore it. */
  cut(): this {
    return this.raw(GS, 0x56, 0x42, 0x00);
  }

  build(): Uint8Array {
    return Uint8Array.from(this.bytes);
  }
}

export interface SlipPrintData {
  businessName?: string;
  lotName?: string;
  token: string;
  plate: string;
  entryLine: string;
  slotLine?: string;
  passCovered: boolean;
  qrValue: string;
}

export function buildSlipEscPos(data: SlipPrintData): Uint8Array {
  const builder = new EscPosBuilder().init().alignCenter();

  builder.bold(true).text((data.businessName ?? 'PARKING').toUpperCase()).bold(false);
  if (data.lotName) builder.text(data.lotName);
  builder.divider();

  builder.text('TOKEN NO.');
  builder.size(0x22).bold(true).text(data.token).bold(false).size(0x00);
  builder.feed(1);
  builder.size(0x11).bold(true).text(data.plate).bold(false).size(0x00);
  builder.text(data.entryLine);
  if (data.slotLine) builder.text(data.slotLine);
  if (data.passCovered) builder.bold(true).text('MONTHLY PASS - NO CHARGE').bold(false);

  builder.feed(1).qr(data.qrValue).feed(1);
  builder.divider();
  builder.text('Keep this slip');
  builder.text('Required at exit');
  builder.feed(4).cut();

  return builder.build();
}

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Uint8Array -> base64 without Buffer/btoa (neither is guaranteed in RN). */
export function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    output += BASE64_CHARS[b0 >> 2];
    output += BASE64_CHARS[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    output += b1 === undefined ? '=' : BASE64_CHARS[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    output += b2 === undefined ? '=' : BASE64_CHARS[b2 & 0x3f];
  }
  return output;
}
