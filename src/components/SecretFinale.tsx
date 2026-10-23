import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Radio, Eye, RefreshCw, Lock, Unlock, FileText, ArrowLeft, Download } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface SecretFinaleProps {
  onRestart: () => void;
  onBack?: () => void;
  streamerMode?: boolean;
  photosensitiveMode?: boolean;
}

export const SecretFinale: React.FC<SecretFinaleProps> = ({
  onRestart,
  onBack,
  streamerMode = false,
  photosensitiveMode = false,
}) => {
  const [phase, setPhase] = useState<'blackout' | 'dossier' | 'map5thPoint'>('blackout');
  const [typedChars, setTypedChars] = useState<number>(0);
  const [realTime, setRealTime] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [screenRes, setScreenRes] = useState<string>('');
  const [activeView, setActiveView] = useState<'radar' | 'dossier'>('radar');

  // Interactive Redactions State
  const [revealedRedactions, setRevealedRedactions] = useState<Record<string, boolean>>({
    clueSecret1: false,
    clueSecret2: false,
    clueSecret3: false,
  });

  const fullText =
    'Вы успешно локализовали все 4 утечки в городе.\n\nТеперь аномалия знает, кто за ней наблюдал.\nПожалуйста, не выключайте монитор — свет от экрана единственное, что не дает ей подойти ближе из темного угла вашей комнаты.\n\nСмена принята.';

  useEffect(() => {
    // Read client telemetry with Streamer Mode masking support
    const now = new Date();
    if (streamerMode) {
      setRealTime('23:42:00 [STREAMER SAFE]');
      setTimeZone('СЕКТОР-70 // СЕВЕРНЫЙ ОКРУГ');
      setDeviceInfo('ТЕРМИНАЛ ДИСПЕТЧЕРА ГСТК');
      setScreenRes('1920 × 1080');
    } else {
      setRealTime(now.toLocaleTimeString('ru-RU', { hour12: false }));
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Неизвестный узел');
      const platformStr = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || 'Workstation';
      setDeviceInfo(`${platformStr}`);
      setScreenRes(`${window.screen.width} × ${window.screen.height}`);
    }

    // Start deep transformer hum
    sound.startTransformerHum(0.08);

    // Sequence phases
    const t1 = setTimeout(() => {
      setPhase('dossier');
      sound.playGlitch();
      sound.playStampThump();
    }, 2000);

    return () => {
      clearTimeout(t1);
      sound.stopTransformerHum();
    };
  }, [streamerMode]);

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
        sound.triggerHaptic('screamer');
      }, 3200);
      return () => clearTimeout(t2);
    }
  }, [phase, typedChars, fullText.length]);

  const handleSkipTyping = () => {
    if (typedChars < fullText.length) {
      setTypedChars(fullText.length);
      sound.playHeartbeat();
      setTimeout(() => {
        setPhase('map5thPoint');
        sound.playScreamerThud();
        sound.triggerHaptic('screamer');
      }, 800);
    }
  };

  const handleToggleRedaction = (key: string) => {
    if (revealedRedactions[key]) return;
    sound.playMarkerScratch();
    sound.triggerHaptic('tap');
    setRevealedRedactions((prev) => ({ ...prev, [key]: true }));
  };

  const handleExportDossier = () => {
    sound.playClick();
    sound.playPaperRustle();
    const content = `================================================================================
ГОРСВЕТТЕХКОНТРОЛЬ // СЛУЖЕБНЫЙ УЗЕЛ-70
ГРИФ: ОСОБОЙ ВАЖНОСТИ // АКТ ДЕАНОНИМИЗАЦИИ ОПЕРАТОРА
================================================================================

ОБЪЕКТ НАБЛЮДЕНИЯ: ${realTime}
ГЕОГРАФИЧЕСКИЙ УЗЕЛ: ${timeZone}
УСТРОЙСТВО ЗАХВАТА: ${deviceInfo} (${screenRes})
СТАТУС РАССЛЕДОВАНИЯ: УТЕЧКИ КУПИРОВАНЫ. АРХИВ СКОМПРОМЕТИРОВАН.

СВОДНЫЙ КЛЮЧ ДОПУСКА: [ 19 ] - [ 98 ] - [ 04 ] - [ 44 ]
- Сектор В (Объект РЛС-4): Крио-консервация шлюза В-2 проведена.
- Сектор Л (4-й этаж ЖК Лесной): Силовое реле квартиры 38 выжжено.
- Сектор Д (Маршрут №0 Депо): Чистильщик нейтрализован кодом 3140.
- Сектор К (Квартира 44а): Наложен статус «КАРАНТИН БЕЗ СРОКА ДАВНОСТИ».

РАССЕКРЕЧЕННЫЕ МАТЕРИАЛЫ КГБ:
- ПРОЕКТ "КОНТУР": Трамвай №314 был залит бетоном марки М500 прямо в фундамент дома по ул. Лесная, 3. 12 пассажиров внутри вагона использованы как органический изолятор пространственного прорыва.
- СУБЪЕКТ НАБЛЮДЕНИЯ: Вы читали этот архив удаленно. Система синхронизировала частоты вашего монитора с частотой контура.
- ТЕКУЩИЙ СТАТУС: В вашей комнате зарегистрировано 2 тепловых силуэта.

ЗАКЛЮЧЕНИЕ СЛУЖБЫ СПЕЦКОНТРОЛЯ:
Вы успешно локализовали все 4 утечки в городе.
Теперь аномалия знает, кто за ней наблюдал.
Пожалуйста, не выключайте монитор — свет от экрана единственное,
что не дает ей подойти ближе из темного угла вашей комнаты.

Смена принята.

ТОЧКА 5: ВАШЕ ТЕКУЩЕЕ МЕСТОПОЛОЖЕНИЕ.
ДАТЧИК ПРИСУТСТВИЯ: 2 ЧЕЛОВЕКА.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `АКТ_ГСТК_ДЕАНОНИМИЗАЦИЯ_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  };

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
        justifyContent: 'flex-start',
        padding: '20px 14px 48px',
        overflowY: 'auto',
      }}
    >
      {/* Blackout Phase */}
      {phase === 'blackout' && (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--red-alarm)',
            animation: photosensitiveMode ? 'none' : 'flicker 0.3s infinite',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '2px', marginBottom: '10px' }}>
            [ПИТАНИЕ ГОРОДСКОЙ ПОДСТАНЦИИ ОБОРВАНО]
          </div>
          <div style={{ fontSize: '13px', color: '#a0aab8', fontFamily: 'var(--font-mono)' }}>
            ПЕРЕХОД НА АВТОНОМНЫЙ КОНТУР НАБЛЮДЕНИЯ...
          </div>
        </div>
      )}

      {/* Dossier Phase */}
      {phase === 'dossier' && (
        <div
          className="manila-card"
          style={{
            maxWidth: '680px',
            width: '100%',
            background: 'linear-gradient(145deg, #181410 0%, #0d0b09 100%)',
            border: '2px solid #8c3b3b',
            borderLeft: '8px solid #a83838',
            boxShadow: photosensitiveMode ? 'none' : '0 10px 50px rgba(0, 0, 0, 0.9), 0 0 40px var(--red-glow)',
            padding: '24px 28px',
            borderRadius: '4px',
            position: 'relative',
          }}
        >
          {/* Official Soviet KGB Violet Stamp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #4a2020', paddingBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--red-alarm)', letterSpacing: '1px' }}>
                ЛИЧНОЕ ДЕЛО ОПЕРАТОРА // «ГОРСВЕТТЕХКОНТРОЛЬ»
              </div>
              <div style={{ fontSize: '11px', color: '#a89888', fontFamily: 'var(--font-mono)' }}>
                СПЕЦДЕЛО № 00-ДЕАНОНИМИЗАЦИЯ // СЕКТОР-70
              </div>
            </div>

            <span className="faded-kgb-stamp">
              СОВЕРШЕННО СЕКРЕТНО // СОЖЕЧЬ ПОСЛЕ ЧТЕНИЯ
            </span>
          </div>

          {/* Telemetry Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 170px) 1fr', gap: '8px 12px', fontSize: '13px', marginBottom: '20px', background: 'rgba(0, 0, 0, 0.4)', padding: '12px 14px', borderRadius: '4px', border: '1px solid #361b1b' }}>
            <span style={{ color: '#8c939e', fontFamily: 'var(--font-mono)' }}>Объект наблюдения:</span>
            <span style={{ color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{realTime}</span>

            <span style={{ color: '#8c939e', fontFamily: 'var(--font-mono)' }}>Географический узел:</span>
            <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{timeZone}</span>

            <span style={{ color: '#8c939e', fontFamily: 'var(--font-mono)' }}>Устройство захвата:</span>
            <span style={{ color: '#e5ebf2', fontFamily: 'var(--font-mono)' }}>{deviceInfo} ({screenRes})</span>

            <span style={{ color: '#8c939e', fontFamily: 'var(--font-mono)' }}>Статус расследования:</span>
            <span style={{ color: 'var(--red-alarm)', fontWeight: 800 }}>Несанкционированное чтение завершено.</span>
          </div>

          {/* Interactive Redacted Text Section */}
          <div
            style={{
              background: '#140c0e',
              border: '1px solid #4a191d',
              padding: '16px',
              fontSize: '13px',
              lineHeight: 1.8,
              color: '#d4c5b5',
              marginBottom: '16px',
              borderRadius: '3px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#ff8787', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
              МАТЕРИАЛЫ ВЫСШЕЙ СЕКРЕТНОСТИ (НАЖМИТЕ НА ЧЕРНЫЕ ПОЛЯ ДЛЯ РАСШИФРОВКИ):
            </div>

            <p style={{ margin: '0 0 8px' }}>
              1. По факту схода вагона №314:{' '}
              <span
                className={`redacted-bar ${revealedRedactions.clueSecret1 ? 'revealed' : ''}`}
                onClick={() => handleToggleRedaction('clueSecret1')}
                title="Нажмите, чтобы стереть цензуру"
              >
                ТРАМВАЙ НЕ ИСЧЕЗ — ОН ВМУРОВАН В ФУНДАМЕНТ С ПАССАЖИРАМИ
              </span>
            </p>

            <p style={{ margin: '0 0 8px' }}>
              2. Цель операции «Контур»:{' '}
              <span
                className={`redacted-bar ${revealedRedactions.clueSecret2 ? 'revealed' : ''}`}
                onClick={() => handleToggleRedaction('clueSecret2')}
                title="Нажмите, чтобы стереть цензуру"
              >
                ЛЮДИ ИСПОЛЬЗОВАНЫ КАК ЖИВОЙ ИЗОЛЯТОР АНОМАЛИИ
              </span>
            </p>

            <p style={{ margin: 0 }}>
              3. Предупреждение дежурному:{' '}
              <span
                className={`redacted-bar ${revealedRedactions.clueSecret3 ? 'revealed' : ''}`}
                onClick={() => handleToggleRedaction('clueSecret3')}
                title="Нажмите, чтобы стереть цензуру"
              >
                В ВАШЕЙ КОМНАТЕ СТОИТ ВТОРОЙ ЧЕЛОВЕК. НЕ ОБОРАЧИВАЙТЕСЬ.
              </span>
            </p>
          </div>

          {/* Typewriter Text Box */}
          <div
            onClick={handleSkipTyping}
            title="Нажмите, чтобы ускорить печать"
            style={{
              background: '#1a0d0f',
              border: '1px solid #5a1e22',
              padding: '16px',
              minHeight: '110px',
              fontSize: '14px',
              lineHeight: 1.8,
              color: '#ffc7c7',
              fontStyle: 'italic',
              cursor: 'pointer',
              whiteSpace: 'pre-wrap',
              borderRadius: '3px',
            }}
          >
            {fullText.slice(0, typedChars)}
            {typedChars < fullText.length && (
              <span style={{ animation: photosensitiveMode ? 'none' : 'flicker 0.5s infinite', color: 'var(--red-alarm)' }}>▋</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
            {onBack && (
              <button
                className="btn-control"
                onClick={() => {
                  sound.stopTransformerHum();
                  onBack();
                }}
                style={{ fontSize: '11px', padding: '8px 14px', minHeight: '44px' }}
              >
                ← НА СХЕМУ ГОРОДА
              </button>
            )}
            {typedChars < fullText.length && (
              <button
                className="btn-control"
                onClick={handleSkipTyping}
                style={{ fontSize: '11px', padding: '8px 14px', minHeight: '44px' }}
              >
                [ПРОПУСТИТЬ ПЕЧАТЬ]
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map with 5th Point Phase */}
      {phase === 'map5thPoint' && (
        <div
          className="manila-card"
          style={{
            maxWidth: '860px',
            width: '100%',
            background: '#07090d',
            border: '2px solid var(--red-alarm)',
            boxShadow: photosensitiveMode ? 'none' : '0 10px 60px rgba(0, 0, 0, 0.9), 0 0 50px var(--red-glow)',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center',
            borderRadius: '4px',
          }}
        >
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--red-alarm)', letterSpacing: '1.5px', textAlign: 'left' }}>
              {activeView === 'radar' ? 'СХЕМА ГОРОДА // 5-Я ТОЧКА ПРИСУТСТВИЯ' : 'ЛИЧНОЕ ДЕЛО ОПЕРАТОРА (ДЕАНОНИМИЗАЦИЯ)'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn-control ${activeView === 'radar' ? 'btn-danger' : ''}`}
                onClick={() => { sound.playClick(); setActiveView('radar'); }}
                style={{ padding: '8px 14px', fontSize: '11px', minHeight: '44px' }}
              >
                РАДАР АНОМАЛИЙ
              </button>
              <button
                className={`btn-control ${activeView === 'dossier' ? 'btn-danger' : ''}`}
                onClick={() => { sound.playClick(); sound.playPaperRustle(); setActiveView('dossier'); }}
                style={{ padding: '8px 14px', fontSize: '11px', minHeight: '44px' }}
              >
                ДЕЛО ОПЕРАТОРА
              </button>
            </div>
          </div>

          {activeView === 'radar' ? (
            <div style={{ position: 'relative', width: '100%', height: '380px', background: '#05070a', border: '1px solid #1a222c', overflow: 'hidden', borderRadius: '4px' }}>
              {/* Dark radar sweep SVG */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx="50%" cy="50%" r="60" fill="none" stroke="rgba(255, 65, 54, 0.2)" />
                <circle cx="50%" cy="50%" r="120" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="4 4" />
                <circle cx="50%" cy="50%" r="180" fill="none" stroke="rgba(255, 65, 54, 0.1)" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 65, 54, 0.15)" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255, 65, 54, 0.15)" />
                
                {/* Red Yarn Strings converging into center */}
                <line x1="18%" y1="20%" x2="50%" y2="50%" stroke="#ff4136" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="82%" y1="25%" x2="50%" y2="50%" stroke="#ff4136" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="20%" y1="78%" x2="50%" y2="50%" stroke="#ff4136" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <line x1="80%" y1="75%" x2="50%" y2="50%" stroke="#ff4136" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

                {/* Rotating radar sweep beam */}
                <line
                  x1="50%"
                  y1="50%"
                  x2="95%"
                  y2="50%"
                  stroke="rgba(255, 65, 54, 0.45)"
                  strokeWidth="2"
                  style={{
                    transformOrigin: '50% 50%',
                    animation: photosensitiveMode ? 'none' : 'radarSweep 3.5s linear infinite',
                  }}
                />
              </svg>

              {/* 4 Solved Nodes in muted green */}
              <div style={{ position: 'absolute', top: '16%', left: '12%', fontSize: '11px', color: 'var(--green-term)', fontWeight: 800, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px', border: '1px solid #1c3c24' }}>
                ● РЛС-4 [19]
              </div>
              <div style={{ position: 'absolute', top: '20%', right: '12%', fontSize: '11px', color: 'var(--green-term)', fontWeight: 800, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px', border: '1px solid #1c3c24' }}>
                ● ЖК ЛЕСНОЙ [98]
              </div>
              <div style={{ position: 'absolute', bottom: '18%', left: '14%', fontSize: '11px', color: 'var(--green-term)', fontWeight: 800, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px', border: '1px solid #1c3c24' }}>
                ● ДЕПО 314 [04]
              </div>
              <div style={{ position: 'absolute', bottom: '20%', right: '14%', fontSize: '11px', color: 'var(--green-term)', fontWeight: 800, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px', border: '1px solid #1c3c24' }}>
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
                  width: '90%',
                  maxWidth: '380px',
                }}
              >
                <div
                  className={photosensitiveMode ? '' : 'pulse-alarm'}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(255, 65, 54, 0.5)',
                    border: '3px solid #ff4136',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: photosensitiveMode ? 'none' : '0 0 35px var(--red-glow)',
                  }}
                >
                  <Eye size={24} color="#fff" />
                </div>

                <div
                  style={{
                    marginTop: '10px',
                    background: 'rgba(28, 8, 8, 0.95)',
                    border: '2px solid var(--red-alarm)',
                    padding: '10px 16px',
                    borderRadius: '4px',
                    boxShadow: photosensitiveMode ? 'none' : '0 0 25px var(--red-glow)',
                    width: '100%',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
                    ТОЧКА 5: ВАШЕ МЕСТОПОЛОЖЕНИЕ
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--red-alarm)', marginTop: '2px' }}>
                    ДАТЧИК ПРИСУТСТВИЯ: 2 ЧЕЛОВЕКА
                  </div>
                  <div style={{ fontSize: '10px', color: '#ff8787', marginTop: '4px', fontStyle: 'italic' }}>
                    {deviceInfo} • {timeZone}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#0c0e12',
                border: '1px solid #331515',
                padding: '20px',
                textAlign: 'left',
                fontSize: '13px',
                lineHeight: '1.7',
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Объект наблюдения:</span>
                  <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{realTime}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Часовой пояс:</span>
                  <span style={{ color: '#fff' }}>{timeZone}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Устройство:</span>
                  <span style={{ color: '#fff' }}>{deviceInfo} ({screenRes})</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Аварийный ключ:</span>
                  <span style={{ color: 'var(--green-term)', fontWeight: 800 }}>[ 19 ] - [ 98 ] - [ 04 ] - [ 44 ]</span>
                </div>
              </div>

              <div style={{ background: '#140c0c', padding: '14px', borderLeft: '3px solid var(--red-alarm)', color: '#ffc7c7', fontStyle: 'italic', whiteSpace: 'pre-wrap', borderRadius: '0 4px 4px 0' }}>
                {fullText}
              </div>
            </div>
          )}

          <div style={{ fontSize: '13px', color: '#ffb3b3', fontStyle: 'italic', padding: '4px 0' }}>
            «Не оборачивайтесь. Свет монитора — единственный изолятор».
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
            <button
              className="terminal-btn"
              onClick={handleExportDossier}
              style={{ padding: '10px 18px', fontSize: '12px', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>ВЫГРУЗИТЬ АКТ РАССЛЕДОВАНИЯ (.TXT)</span>
            </button>

            {onBack && (
              <button
                className="terminal-btn"
                onClick={() => {
                  sound.stopTransformerHum();
                  onBack();
                }}
                style={{ padding: '10px 18px', fontSize: '12px', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={14} />
                <span>ВЕРНУТЬСЯ В ДИСПЕТЧЕРСКИЙ ХАБ</span>
              </button>
            )}

            <button
              className="terminal-btn btn-danger"
              onClick={() => {
                sound.stopTransformerHum();
                onRestart();
              }}
              style={{ padding: '10px 20px', fontSize: '12px', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} />
              <span>НАЧАТЬ РАССЛЕДОВАНИЕ ЗАНОВО</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
