import { ImageResponse } from 'next/og';

export const alt = 'Dewasa Ayu — Cek hari baik upacara Hindu Bali';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Branded share card in the Lontar palette (no external font — kept robust). */
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
        backgroundColor: '#181410',
        backgroundImage:
          'radial-gradient(55% 50% at 50% 38%, rgba(201,169,104,0.20), transparent 70%)',
        color: '#ecddbc',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          border: '1px solid #9c7e45',
          borderRadius: 6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 47,
          left: 47,
          right: 47,
          bottom: 47,
          border: '1px solid rgba(201,169,104,0.25)',
          borderRadius: 4,
        }}
      />
      <div
        style={{
          fontSize: 24,
          letterSpacing: 12,
          textTransform: 'uppercase',
          color: '#c9a968',
          marginBottom: 26,
        }}
      >
        Pedoman Wariga Umum
      </div>
      <div style={{ fontSize: 118, fontWeight: 700, color: '#ecddbc', lineHeight: 1 }}>
        Dewasa Ayu
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36 }}>
        <div style={{ width: 64, height: 1, backgroundColor: '#9c7e45' }} />
        <div
          style={{ width: 9, height: 9, backgroundColor: '#c9a968', transform: 'rotate(45deg)' }}
        />
        <div style={{ width: 64, height: 1, backgroundColor: '#9c7e45' }} />
      </div>
      <div style={{ fontSize: 36, color: '#b8a988', marginTop: 30 }}>
        Cek hari baik untuk upacara Hindu Bali
      </div>
    </div>,
    { ...size },
  );
}
