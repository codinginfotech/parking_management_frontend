import { Printer } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  printSlipToRollPrinter,
  printSlipViaSystemDialog,
  slipQrValue,
  slipTokenLabel,
} from '@/services/slip-printer';
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

/**
 * The printable gate slip: token number, plate, entry time and a QR code.
 * "Print slip" sends raw ESC/POS to a Bluetooth/USB thermal roll printer via
 * the RawBT print service for instant ticket output; without RawBT it falls
 * back to the system print dialog with a receipt-sized page.
 */
export function ParkingSlip({ session, businessName, lotName }: ParkingSlipProps) {
  const { colors } = useTheme();
  const toast = useToast();
  const qrRef = useRef<{ toDataURL: (callback: (data: string) => void) => void } | null>(
    null
  );
  const [printing, setPrinting] = useState(false);

  const printFallback = () => {
    const qr = qrRef.current;
    if (!qr) {
      setPrinting(false);
      return;
    }
    qr.toDataURL((base64) => {
      printSlipViaSystemDialog(
        session,
        base64.replace(/\n/g, ''),
        businessName,
        lotName
      )
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

  const print = async () => {
    setPrinting(true);
    const sentToRollPrinter = await printSlipToRollPrinter(
      session,
      businessName,
      lotName
    );
    if (sentToRollPrinter) {
      setPrinting(false);
      toast.show('success', 'Slip sent to printer');
      return;
    }
    printFallback();
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
          {slipTokenLabel(session.slipNumber)}
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
          <AppText variant="headingM" color="#111111" style={{ letterSpacing: 2 }}>
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

        <AppText
          variant="bodySmall"
          color="#999999"
          style={{ marginTop: spacing.md, fontSize: 10 }}
        >
          Keep this slip — required at exit
        </AppText>
      </View>

      <Button
        title="Print slip"
        onPress={() => void print()}
        loading={printing}
        icon={<Printer size={18} color={colors.onAccent} strokeWidth={2} />}
        style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
      />
      <AppText
        variant="bodySmall"
        color="textFaint"
        align="center"
        style={{ marginTop: spacing.sm }}
      >
        Roll printer? Install the free RawBT app once — slips then print
        instantly with a paper cut.
      </AppText>
    </View>
  );
}
