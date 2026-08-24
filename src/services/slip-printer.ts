import * as IntentLauncher from 'expo-intent-launcher';
import * as Print from 'expo-print';
import { Platform } from 'react-native';
import type { ParkingSession } from '@/types/models';
import { formatDate, formatTime } from '@/utils/datetime';
import { SlipPrintData, buildSlipEscPos, bytesToBase64 } from '@/utils/escpos';

/** Payload encoded in the slip's QR — scannable at exit to find the session. */
export function slipQrValue(session: ParkingSession): string {
  return `PKL1|${session._id}|${session.vehicleNumber}`;
}

export function slipTokenLabel(slipNumber?: number): string {
  return slipNumber !== undefined ? String(slipNumber).padStart(3, '0') : '---';
}

function slipData(
  session: ParkingSession,
  businessName?: string,
  lotName?: string
): SlipPrintData {
  return {
    businessName,
    lotName,
    token: slipTokenLabel(session.slipNumber),
    plate: session.displayNumber,
    entryLine: `Entry: ${formatTime(session.entryTime)} ${formatDate(session.entryTime)}`,
    slotLine: session.slotCode ? `Slot: ${session.slotCode}` : undefined,
    passCovered: session.coveredByPass,
    qrValue: slipQrValue(session),
  };
}

const RAWBT_PACKAGE = 'ru.a402d.rawbtprinter';

/**
 * Instant roll printing: sends raw ESC/POS bytes to the RawBT print service
 * (free Android app that drives Bluetooth/USB 58-80mm thermal printers).
 * The slip prints and cuts immediately — no dialogs. The intent targets the
 * RawBT package explicitly, so this throws (and returns false) when RawBT is
 * not installed instead of being swallowed by a scheme handler.
 */
export async function printSlipToRollPrinter(
  session: ParkingSession,
  businessName?: string,
  lotName?: string
): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  const bytes = buildSlipEscPos(slipData(session, businessName, lotName));
  try {
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: `rawbt:base64,${bytesToBase64(bytes)}`,
      packageName: RAWBT_PACKAGE,
    });
    return true;
  } catch {
    return false;
  }
}

const RECEIPT_WIDTH_PT = 227; // 80mm in points (72 pt/inch)

function slipHtml(
  session: ParkingSession,
  qrPngBase64: string,
  businessName?: string,
  lotName?: string
): string {
  const data = slipData(session, businessName, lotName);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { margin: 0; }
  body { font-family: 'Courier New', monospace; color: #000; margin: 0; padding: 8px 6px; }
  .center { text-align: center; }
  .biz { font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
  .lot { font-size: 11px; margin-top: 2px; }
  hr { border: none; border-top: 1px dashed #000; margin: 7px 0; }
  .token-label { font-size: 10px; letter-spacing: 2px; }
  .token { font-size: 36px; font-weight: bold; line-height: 1.05; }
  .plate { font-size: 19px; font-weight: bold; letter-spacing: 1px; border: 2px solid #000; border-radius: 5px; display: inline-block; padding: 3px 10px; margin: 7px 0 3px; }
  .meta { font-size: 11px; margin-top: 2px; }
  .pass { font-size: 11px; font-weight: bold; margin-top: 5px; }
  .qr { margin: 8px 0 2px; }
  .foot { font-size: 9px; margin-top: 7px; }
</style>
</head>
<body>
<div class="center">
  <div class="biz">${data.businessName ?? 'Parking'}</div>
  ${data.lotName ? `<div class="lot">${data.lotName}</div>` : ''}
  <hr />
  <div class="token-label">TOKEN NO.</div>
  <div class="token">${data.token}</div>
  <div class="plate">${data.plate}</div>
  <div class="meta">${data.entryLine}</div>
  ${data.slotLine ? `<div class="meta">${data.slotLine}</div>` : ''}
  ${data.passCovered ? '<div class="pass">MONTHLY PASS — NO CHARGE</div>' : ''}
  <div class="qr"><img src="data:image/png;base64,${qrPngBase64}" width="118" height="118" /></div>
  <hr />
  <div class="foot">Keep this slip — required at exit.<br/>Powered by Parkline</div>
</div>
</body>
</html>`;
}

/**
 * Fallback: render a receipt-sized PDF ourselves (printToFileAsync honors the
 * page dimensions, unlike HTML print jobs), then hand the finished file to the
 * system print dialog — thermal print services and save-as-PDF both receive a
 * roll-shaped page instead of a blank Letter sheet.
 */
export async function printSlipViaSystemDialog(
  session: ParkingSession,
  qrPngBase64: string,
  businessName?: string,
  lotName?: string
): Promise<void> {
  const file = await Print.printToFileAsync({
    html: slipHtml(session, qrPngBase64, businessName, lotName),
    width: RECEIPT_WIDTH_PT,
    height: 620,
  });
  await Print.printAsync({ uri: file.uri });
}
