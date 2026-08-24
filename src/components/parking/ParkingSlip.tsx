import * as Print from 'expo-print';
import { Printer } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { radius, spacing, useTheme } from '@/theme';
import type { ParkingSession } from '@/types/models';
import { formatDate, formatTime } from '@/utils/datetime';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface ParkingSlipProps {
  session: ParkingSession;
  businessName?: string;
  lotName?: string;
}

/** Payload encoded in the slip's QR — scannable at exit to find the session. */
export function slipQrValue(session: ParkingSession): string {
  return `PKL1|${session._id}|${session.vehicleNumber}`;
}

function tokenLabel(slipNumber?: number): string {
  return slipNumber !== undefined ? String(slipNumber).padStart(3, '0') : '—';
}

function buildSlipHtml(
  session: ParkingSession,
  qrPngBase64: string,
  businessName?: string,
  lotName?: string
): string {
  const passLine = session.coveredByPass
    ? '<div class="pass">MONTHLY PASS — NO CHARGE</div>'
    : '';
  return `
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { size: 80mm auto; margin: 4mm; }
  body { font-family: 'Courier New', monospace; color: #000; width: 68mm; margin: 0 auto; }
  .center { text-align: center; }
  .biz { font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
  .lot { font-size: 11px; margin-top: 2px; }
  hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
  .token-label { font-size: 10px; letter-spacing: 2px; }
  .token { font-size: 34px; font-weight: bold; line-height: 1.1; }
  .plate { font-size: 20px; font-weight: bold; letter-spacing: 2px; border: 2px solid #000; border-radius: 6px; display: inline-block; padding: 4px 12px; margin: 8px 0 4px; }
  .meta { font-size: 11px; margin-top: 2px; }
  .pass { font-size: 11px; font-weight: bold; margin-top: 6px; }
  .qr { margin: 10px 0 4px; }
  .foot { font-size: 9px; margin-top: 8px; }
</style>
<div class="center">
  <div class="biz">${businessName ?? 'Parking'}</div>
  ${lotName ? `<div class="lot">${lotName}</div>` : ''}
  <hr />
  <div class="token-label">TOKEN NO.</div>
  <div class="token">${tokenLabel(session.slipNumber)}</div>
  <div class="plate">${session.displayNumber}</div>
  <div class="meta">Entry: ${formatTime(session.entryTime)} · ${formatDate(session.entryTime)}</div>
  ${session.slotCode ? `<div class="meta">Slot: ${session.slotCode}</div>` : ''}
  ${passLine}
  <div class="qr"><img src="data:image/png;base64,${qrPngBase64}" width="120" height="120" /></div>
  <hr />
  <div class="foot">Keep this slip — required at exit.<br/>Powered by Parkline</div>
</div>`;
}

/**
 * The printable gate slip: token number, plate, entry time and a QR code.
 * Rendered as a physical white ticket regardless of theme, with a print
 * action that opens the system print dialog (printer or save-as-PDF).
 */
export function ParkingSlip({ session, businessName, lotName }: ParkingSlipProps) {
  const { colors } = useTheme();
  const toast = useToast();
  const qrRef = useRef<{ toDataURL: (callback: (data: string) => void) => void } | null>(
    null
  );
  const [printing, setPrinting] = useState(false);

  const print = () => {
    const qr = qrRef.current;
    if (!qr) return;
    setPrinting(true);
    qr.toDataURL((base64) => {
      const html = buildSlipHtml(
        session,
        base64.replace(/\n/g, ''),
        businessName,
        lotName
      );
      Print.printAsync({ html })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : '';
          // Dismissing the print dialog rejects on some platforms — not an error.
          if (!/did not complete|cancel/i.test(message)) {
            toast.show('error', 'Could not print', 'Try again or save as PDF.');
          }
        })
        .finally(() => setPrinting(false));
    });
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: radius.lg,
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing.xxl,
          alignItems: 'center',
          width: '100%',
          maxWidth: 320,
        }}
      >
        <AppText
          variant="label"
          color="#111111"
          align="center"
          numberOfLines={1}
          style={{ letterSpacing: 2 }}
        >
          {businessName ?? 'Parking'}
        </AppText>
        {lotName ? (
          <AppText variant="bodySmall" color="#555555" style={{ marginTop: 2 }}>
            {lotName}
          </AppText>
        ) : null}

        <View
          style={{
            borderBottomWidth: 1,
            borderStyle: 'dashed',
            borderColor: '#BBBBBB',
            alignSelf: 'stretch',
            marginVertical: spacing.md,
          }}
        />

        <AppText variant="label" color="#555555">
          Token No.
        </AppText>
        <AppText
          variant="numericL"
          color="#111111"
          style={{ fontSize: 40, lineHeight: 48 }}
        >
          {tokenLabel(session.slipNumber)}
        </AppText>

        <View
          style={{
            borderWidth: 2,
            borderColor: '#111111',
            borderRadius: radius.sm,
            paddingVertical: 4,
            paddingHorizontal: spacing.lg,
            marginTop: spacing.sm,
          }}
        >
          <AppText
            variant="headingM"
            color="#111111"
            style={{ letterSpacing: 2 }}
          >
            {session.displayNumber}
          </AppText>
        </View>

        <AppText variant="bodySmall" color="#555555" style={{ marginTop: spacing.sm }}>
          Entry: {formatTime(session.entryTime)} · {formatDate(session.entryTime)}
          {session.slotCode ? ` · Slot ${session.slotCode}` : ''}
        </AppText>
        {session.coveredByPass ? (
          <AppText variant="bodySmall" color="#111111" style={{ marginTop: 2 }}>
            MONTHLY PASS — NO CHARGE
          </AppText>
        ) : null}

        <View style={{ marginTop: spacing.md }}>
          <QRCode
            value={slipQrValue(session)}
            size={110}
            color="#111111"
            backgroundColor="#FFFFFF"
            getRef={(ref) => {
              qrRef.current = ref;
            }}
          />
        </View>

        <AppText variant="bodySmall" color="#999999" style={{ marginTop: spacing.md, fontSize: 10 }}>
          Keep this slip — required at exit
        </AppText>
      </View>

      <Button
        title="Print slip"
        onPress={print}
        loading={printing}
        icon={<Printer size={18} color={colors.onAccent} strokeWidth={2} />}
        style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
      />
    </View>
  );
}
