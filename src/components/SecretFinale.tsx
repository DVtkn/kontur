import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Radio, Eye, RefreshCw } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface SecretFinaleProps {
  onRestart: () => void;
}

export const SecretFinale: React.FC<SecretFinaleProps> = ({ onRestart }) => {
  const [phase, setPhase] = useState<'blackout' | 'dossier' | 'map5thPoint'>('blackout');
  const [typedChars, setTypedChars] = useState<number>(0);
  const [realTime, setRealTime] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [screenRes, setScreenRes] = useState<string>('');

  const fullText =
    'Вы успешно локализовали все 4 утечки в городе. Теперь аномалия знает, кто за ней наблюдал. Пожалуйста, не выключайте монитор — свет от экрана единственное, что не дает ей подойти ближе из темного угла вашей комнаты. Смена принята.';

  useEffect(() => {
    // Read real client telemetry
    const now = new Date();
    setRealTime(now.toLocaleTimeString('ru-RU'));
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Неизвестный часовой пояс');
    setDeviceInfo(navigator.userAgent.includes('Mac') ? 'Apple macOS Workstation' : 'Terminal Device');
    setScreenRes(`${window.screen.width} × ${window.screen.height}`);

    // Start deep transformer hum
    sound.startTransformerHum(0.08);

    // Sequence phases
    const t1 = setTimeout(() => {
      setPhase('dossier');
      sound.playGlitch();
    }, 2000);

    return () => {
      clearTimeout(t1);
    };
  }, []);

  // Typewriter effect in dossier phase
  useEffect(() => {
    if (phase !== 'dossier') return;

    if (typedChars < fullText.length) {
      const typeTimer = setTimeout(() => {
        setTypedChars((prev) => prev + 1);
        if (typedChars % 3 === 0) {
          sound.playKeypress();
        }
      }, 35);
      return () => clearTimeout(typeTimer);
    } else {
      // After text is finished, play a double heartbeat and advance to 5th point map
      sound.playHeartbeat();
      const t2 = setTimeout(() => {
        setPhase('map5thPoint');
        sound.playScreamerThud();
      }, 3500);
      return () => clearTimeout(t2);
    }
  }, [phase, typedChars, fullText.length]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#040507',
        color: '#e0ded8',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Blackout Phase */}
      {phase === 'blackout' && (
        <div style={{ textAlign: 'center', color: 'var(--red-alarm)', animation: 'flicker 0.3s infinite' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '2px' }}>
            [ПИТАНИЕ ГОРОДСКОЙ ПОДСТАНЦИИ ОБОРВАНО]
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            ПЕРЕХОД НА АВТОНОМНЫЙ КОНТУР НАБЛЮДЕНИЯ...
          </div>
        </div>
      )}

      {/* Dossier Phase */}
      {phase === 'dossier' && (
        <div
          style={{
            maxWidth: '680px',
            width: '100%',
            background: '#0a0c10',
            border: '2px solid var(--red-alarm)',
            boxShadow: '0 0 40px var(--red-glow)',
            padding: '28px',
            borderRadius: '2px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #331515', paddingBottom: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--red-alarm)', letterSpacing: '1px' }}>
              ЛИЧНОЕ ДЕЛО ОПЕРАТОРА // «ГОРСВЕТТЕХКОНТРОЛЬ»
            </span>
            <span className="stamp" style={{ fontSize: '10px' }}>СЕКРЕТНО</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '8px', fontSize: '13px', marginBottom: '20px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Объект наблюдения:</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>{realTime} (Текущее время оператора)</span>

            <span style={{ color: 'var(--text-dim)' }}>Географический узел:</span>
            <span style={{ color: '#fff' }}>{timeZone}</span>

            <span style={{ color: 'var(--text-dim)' }}>Устройство захвата:</span>
            <span style={{ color: '#fff' }}>{deviceInfo} ({screenRes})</span>

            <span style={{ color: 'var(--text-dim)' }}>Статус расследования:</span>
            <span style={{ color: 'var(--red-alarm)', fontWeight: 800 }}>Несанкционированное чтение архива завершено.</span>
          </div>

          <div
            style={{
              background: '#140c0c',
              border: '1px solid #4a1919',
              padding: '16px',
              minHeight: '120px',
              fontSize: '14px',
              lineHeight: 1.8,
              color: '#ffc7c7',
              fontStyle: 'italic',
            }}
          >
            {fullText.slice(0, typedChars)}
            <span style={{ animation: 'flicker 0.5s infinite', color: 'var(--red-alarm)' }}>▋</span>
          </div>
        </div>
      )}

      {/* Map with 5th Point Phase */}
      {phase === 'map5thPoint' && (
        <div
          style={{
            maxWidth: '820px',
            width: '100%',
            background: '#080a0e',
            border: '2px solid var(--red-alarm)',
            boxShadow: '0 0 50px var(--red-glow)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--red-alarm)', letterSpacing: '1.5px' }}>
            СХЕМА СЕВЕРНОГО ГОРОДСКОГО ОКРУГА // АВАРИЙНЫЙ КОНТУР
          </div>

          <div style={{ position: 'relative', width: '100%', height: '360px', background: '#05070a', border: '1px solid #1a222c', overflow: 'hidden' }}>
            {/* Dark radar sweep SVG */}
            <svg width="100%" height="100%">
              <circle cx="50%" cy="50%" r="60" fill="none" stroke="rgba(255, 65, 54, 0.2)" />
              <circle cx="50%" cy="50%" r="120" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="4 4" />
              <circle cx="50%" cy="50%" r="180" fill="none" stroke="rgba(255, 65, 54, 0.1)" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 65, 54, 0.15)" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255, 65, 54, 0.15)" />
            </svg>

            {/* 4 Previous Solved Nodes in muted green */}
            <div style={{ position: 'absolute', top: '70px', left: '160px', fontSize: '10px', color: 'var(--green-term)' }}>
              ● РЛС-4 [19]
            </div>
            <div style={{ position: 'absolute', top: '90px', right: '140px', fontSize: '10px', color: 'var(--green-term)' }}>
              ● ЖК ЛЕСНОЙ [98]
            </div>
            <div style={{ position: 'absolute', bottom: '80px', left: '180px', fontSize: '10px', color: 'var(--green-term)' }}>
              ● ДЕПО 314 [04]
            </div>
            <div style={{ position: 'absolute', bottom: '90px', right: '160px', fontSize: '10px', color: 'var(--green-term)' }}>
              ● КВ. 44А [44]
            </div>

            {/* THE 5TH PULSATING POINT DEAD CENTER */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 10,
              }}
            >
              <div
                className="pulse-alarm"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 65, 54, 0.5)',
                  border: '3px solid #ff4136',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 35px var(--red-glow)',
                }}
              >
                <Eye size={20} color="#fff" />
              </div>

              <div
                style={{
                  marginTop: '10px',
                  background: '#1c0808',
                  border: '2px solid var(--red-alarm)',
                  padding: '6px 14px',
                  borderRadius: '3px',
                  boxShadow: '0 0 20px var(--red-glow)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
                  ВАШЕ ТЕКУЩЕЕ МЕСТОПОЛОЖЕНИЕ
                </div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--red-alarm)', marginTop: '2px' }}>
                  ДАТЧИК ПРИСУТСТВИЯ: 2 ЧЕЛОВЕКА
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#ffb3b3', fontStyle: 'italic', padding: '6px 0' }}>
            «Не оборачивайтесь. Свет монитора — единственный изолятор».
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              className="btn-control"
              onClick={() => {
                sound.stopTransformerHum();
                onRestart();
              }}
              style={{ padding: '8px 20px' }}
            >
              <RefreshCw size={14} /> НАЧАТЬ РАССЛЕДОВАНИЕ ЗАНОВО
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
