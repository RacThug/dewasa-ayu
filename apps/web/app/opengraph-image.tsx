import { ImageResponse } from 'next/og';

export const alt = 'Dewasa Ayu — Cek hari baik upacara Hindu Bali';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Branded share card in the Pananggalan palette (no external font — kept robust). */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FCFBF7',
        color: '#191613',
      }}
    >
      {/* The calendar's red binding strip. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 18,
          backgroundColor: '#B23A26',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 54,
          left: 54,
          right: 54,
          bottom: 54,
          border: '3px solid #191613',
        }}
      />
      <div
        style={{
          fontSize: 24,
          letterSpacing: 12,
          textTransform: 'uppercase',
          color: '#B23A26',
          marginBottom: 26,
        }}
      >
        Pedoman Wariga Umum
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 118,
          fontWeight: 700,
          color: '#191613',
          lineHeight: 1,
        }}
      >
        Dewasa&nbsp;<span style={{ color: '#B23A26' }}>Ayu</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36 }}>
        <div style={{ width: 64, height: 2, backgroundColor: '#191613' }} />
        <div
          style={{ width: 9, height: 9, backgroundColor: '#B23A26', transform: 'rotate(45deg)' }}
        />
        <div style={{ width: 64, height: 2, backgroundColor: '#191613' }} />
      </div>
      <div style={{ fontSize: 36, color: '#5D564C', marginTop: 30 }}>
        Cek hari baik untuk upacara Hindu Bali
      </div>
    </div>,
    { ...size },
  );
}
