import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, KeyRound, Terminal, Radio, Eye } from 'lucide-react';
import { ActiveScreen, GameProgress } from '../types';
import { sound } from '../audio/soundEngine';

interface HubProps {
  progress: GameProgress;
  onNavigate: (screen: ActiveScreen) => void;
  onUpdateTerminalInput: (index: number, val: string) => void;
  onUnlockSecret: () => void;
}

const DISPATCH_LOGS = [
  '02:14:02 [РЛС-4] Шлюз В-2: датчик присутствия показывает 12 человек. Температура -6°C.',
  '02:16:30 [ЖК Лесной] Вентиляционный канал 4-го этажа: акустическая аномалия, плач на частоте 420 Гц.',
  '02:19:15 [Депо] Стрелка №3 перевелась в положение «ТУПИК-ЗЕМЛЯ» без команды диспетчера.',
  '02:22:40 [Кв. 44а] Дальномер БТИ зафиксировал бесконечное удаление несущей стены.',
  '02:26:12 [Общий] Помехи на линии ГорСветТехКонтроль. 3 абонента заявили, что говорят сами с собой.',
  '02:29:50 [РЛС-4] Внутренний пейджер Соколова активен. Проверьте карточку сотрудника.',
];

export const Hub: React.FC<HubProps> = ({
  progress,
  onNavigate,
  onUpdateTerminalInput,
  onUnlockSecret,
}) => {
  const [terminalError, setTerminalError] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLogIndex((prev) => (prev + 1) % DISPATCH_LOGS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSlotChange = (index: number, value: string) => {
    sound.playKeypress();
    const clean = value.replace(/\D/g, '').slice(0, 2);
    onUpdateTerminalInput(index, clean);
  };

  const verifyTerminalCode = () => {
    sound.playClick(1100);
    const code = progress.terminalInput.join('');
    // Correct code: 19 98 04 44
    if (code === '19980444') {
      sound.playScreamerThud();
      onUnlockSecret();
    } else {
      sound.playAlarm(2);
      setTerminalError(true);
      setTimeout(() => setTerminalError(false), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto', padding: '0 16px 40px' }}>
      
      {/* Alert Header Box */}
      <div className="terminal-card" style={{ borderLeft: '4px solid var(--amber)', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.8px' }}>
              ЦЕНТРАЛЬНАЯ ДИСПЕТЧЕРСКАЯ ПАНЕЛЬ // АКТИВНЫЙ МОНИТОРИНГ
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Организация: «ГорСветТехКонтроль». Задача: локализация акустических и пространственных утечек.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ПРОГРЕСС КУПИРОВАНИЯ:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[progress.rls4Solved, progress.floor4Solved, progress.route0Solved, progress.apt44Solved].map((solved, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: solved ? 'var(--green-term)' : 'var(--red-alarm)',
                    boxShadow: solved ? '0 0 8px var(--green-glow)' : '0 0 6px var(--red-glow)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* City Map & Radar Scheme */}
      <div className="terminal-card">
        <div className="terminal-header">
          <span>СХЕМА СЕВЕРНОГО ГОРОДСКОГО ОКРУГА (АКТИВНЫЕ СЕКТОРА)</span>
          <span style={{ color: 'var(--red-alarm)' }}>
            ТРЕВОЖНЫХ ТОЧЕК: 4
          </span>
        </div>

        <div style={{ position: 'relative', width: '100%', height: '420px', background: '#090a0d', overflow: 'hidden' }}>
          
          {/* SVG Map Grid and Contours */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 180, 34, 0.05)" strokeWidth="1" />
              </pattern>
              <pattern id="dotGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="rgba(255, 255, 255, 0.08)" />
              </pattern>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dotGrid)" />

            {/* River contour */}
            <path
              d="M -20 180 Q 250 240, 500 190 T 1100 230"
              fill="none"
              stroke="rgba(77, 171, 247, 0.18)"
              strokeWidth="28"
            />
            {/* Old railway/tram branch */}
            <path
              d="M 120 400 L 320 280 L 580 270 L 920 120"
              fill="none"
              stroke="rgba(255, 180, 34, 0.15)"
              strokeDasharray="6 4"
              strokeWidth="2"
            />

            {/* Sector Boundary Rings */}
            <circle cx="240" cy="110" r="65" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="3 3" />
            <circle cx="780" cy="130" r="75" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="3 3" />
            <circle cx="340" cy="300" r="70" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="3 3" />
            <circle cx="720" cy="310" r="70" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="3 3" />
          </svg>

          {/* Interactive Incident Node 1: РЛС-4 */}
          <div
            onClick={() => {
              sound.playClick();
              onNavigate('rls4');
            }}
            onMouseEnter={() => {
              sound.playBeep(880, 0.02);
              setHoveredSector('rls4');
            }}
            onMouseLeave={() => setHoveredSector(null)}
            style={{
              position: 'absolute',
              top: '90px',
              left: '210px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <div
              className={progress.rls4Solved ? '' : 'pulse-alarm'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: progress.rls4Solved ? 'rgba(57, 230, 109, 0.2)' : 'rgba(255, 65, 54, 0.25)',
                border: `2px solid ${progress.rls4Solved ? 'var(--green-term)' : 'var(--red-alarm)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: progress.rls4Solved ? '0 0 10px var(--green-glow)' : '0 0 15px var(--red-glow)',
              }}
            >
              <Radio size={16} color={progress.rls4Solved ? 'var(--green-term)' : 'var(--red-alarm)'} />
            </div>
            <div
              style={{
                marginTop: '6px',
                background: '#0d0f12',
                border: '1px solid var(--border-light)',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: progress.rls4Solved ? 'var(--green-term)' : 'var(--amber)',
                whiteSpace: 'nowrap',
              }}
            >
              КАРТА 1: ОБЪЕКТ РЛС-4 {progress.rls4Solved ? `[ ${progress.codes.rls4} ]` : '[АКТИВНА]'}
            </div>
          </div>

          {/* Interactive Incident Node 2: 4-й этаж */}
          <div
            onClick={() => {
              sound.playClick();
              onNavigate('floor4');
            }}
            onMouseEnter={() => {
              sound.playBeep(880, 0.02);
              setHoveredSector('floor4');
            }}
            onMouseLeave={() => setHoveredSector(null)}
            style={{
              position: 'absolute',
              top: '120px',
              left: '760px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <div
              className={progress.floor4Solved ? '' : 'pulse-alarm'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: progress.floor4Solved ? 'rgba(57, 230, 109, 0.2)' : 'rgba(255, 65, 54, 0.25)',
                border: `2px solid ${progress.floor4Solved ? 'var(--green-term)' : 'var(--red-alarm)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: progress.floor4Solved ? '0 0 10px var(--green-glow)' : '0 0 15px var(--red-glow)',
              }}
            >
              <Eye size={16} color={progress.floor4Solved ? 'var(--green-term)' : 'var(--red-alarm)'} />
            </div>
            <div
              style={{
                marginTop: '6px',
                background: '#0d0f12',
                border: '1px solid var(--border-light)',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: progress.floor4Solved ? 'var(--green-term)' : 'var(--amber)',
                whiteSpace: 'nowrap',
              }}
            >
              КАРТА 2: 4-Й ЭТАЖ (ЖК ЛЕСНОЙ) {progress.floor4Solved ? `[ ${progress.codes.floor4} ]` : '[АКТИВНА]'}
            </div>
          </div>

          {/* Interactive Incident Node 3: Маршрут №0 */}
          <div
            onClick={() => {
              sound.playClick();
              onNavigate('route0');
            }}
            onMouseEnter={() => {
              sound.playBeep(880, 0.02);
              setHoveredSector('route0');
            }}
            onMouseLeave={() => setHoveredSector(null)}
            style={{
              position: 'absolute',
              top: '290px',
              left: '320px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <div
              className={progress.route0Solved ? '' : 'pulse-alarm'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: progress.route0Solved ? 'rgba(57, 230, 109, 0.2)' : 'rgba(255, 65, 54, 0.25)',
                border: `2px solid ${progress.route0Solved ? 'var(--green-term)' : 'var(--red-alarm)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: progress.route0Solved ? '0 0 10px var(--green-glow)' : '0 0 15px var(--red-glow)',
              }}
            >
              <AlertTriangle size={16} color={progress.route0Solved ? 'var(--green-term)' : 'var(--red-alarm)'} />
            </div>
            <div
              style={{
                marginTop: '6px',
                background: '#0d0f12',
                border: '1px solid var(--border-light)',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: progress.route0Solved ? 'var(--green-term)' : 'var(--amber)',
                whiteSpace: 'nowrap',
              }}
            >
              КАРТА 3: МАРШРУТ №0 (ДЕПО) {progress.route0Solved ? `[ ${progress.codes.route0} ]` : '[АКТИВНА]'}
            </div>
          </div>

          {/* Interactive Incident Node 4: Квартира 44а */}
          <div
            onClick={() => {
              sound.playClick();
              onNavigate('apt44');
            }}
            onMouseEnter={() => {
              sound.playBeep(880, 0.02);
              setHoveredSector('apt44');
            }}
            onMouseLeave={() => setHoveredSector(null)}
            style={{
              position: 'absolute',
              top: '300px',
              left: '700px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <div
              className={progress.apt44Solved ? '' : 'pulse-alarm'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: progress.apt44Solved ? 'rgba(57, 230, 109, 0.2)' : 'rgba(255, 65, 54, 0.25)',
                border: `2px solid ${progress.apt44Solved ? 'var(--green-term)' : 'var(--red-alarm)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: progress.apt44Solved ? '0 0 10px var(--green-glow)' : '0 0 15px var(--red-glow)',
              }}
            >
              <Terminal size={16} color={progress.apt44Solved ? 'var(--green-term)' : 'var(--red-alarm)'} />
            </div>
            <div
              style={{
                marginTop: '6px',
                background: '#0d0f12',
                border: '1px solid var(--border-light)',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: progress.apt44Solved ? 'var(--green-term)' : 'var(--amber)',
                whiteSpace: 'nowrap',
              }}
            >
              КАРТА 4: КВАРТИРА 44А {progress.apt44Solved ? `[ ${progress.codes.apt44} ]` : '[АКТИВНА]'}
            </div>
          </div>

          {/* Real-time Ticker in Map overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '16px',
              right: '16px',
              background: 'rgba(10, 12, 15, 0.88)',
              border: '1px solid var(--border-dim)',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--amber)',
            }}
          >
            <Radio size={14} className="pulse-alarm" />
            <span style={{ color: 'var(--text-muted)' }}>ЛЕНТА СОБЫТИЙ:</span>
            <span style={{ color: 'var(--text-main)', letterSpacing: '0.4px' }}>
              {DISPATCH_LOGS[currentLogIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Incident Cards for Fast Access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        
        {/* Card 1 */}
        <div className="terminal-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', color: 'var(--amber)' }}>СЕКТОР В // 02:14</span>
            {progress.rls4Solved ? (
              <span className="stamp stamp-ok" style={{ fontSize: '10px', padding: '2px 6px' }}>КУПИРОВАНО</span>
            ) : (
              <span style={{ color: 'var(--red-alarm)', fontSize: '11px', fontWeight: 'bold' }}>ТРЕВОГА</span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, margin: '8px 0 4px', color: '#fff' }}>
            Объект РЛС-4
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Клаустрофобия и техно-хоррор. Бетонный шлюз В-2, 12 тел, выбитая лампа, звонок мертвого техника.
          </div>
          <button
            className="btn-control"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              sound.playClick();
              onNavigate('rls4');
            }}
          >
            {progress.rls4Solved ? `КОД СЕКТОРА: [ ${progress.codes.rls4} ]` : 'ПЕРЕЙТИ К ШЛЮЗУ В-2'}
          </button>
        </div>

        {/* Card 2 */}
        <div className="terminal-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', color: 'var(--amber)' }}>СЕКТОР Л // ЖК ЛЕСНОЙ</span>
            {progress.floor4Solved ? (
              <span className="stamp stamp-ok" style={{ fontSize: '10px', padding: '2px 6px' }}>КУПИРОВАНО</span>
            ) : (
              <span style={{ color: 'var(--red-alarm)', fontSize: '11px', fontWeight: 'bold' }}>ТРЕВОГА</span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, margin: '8px 0 4px', color: '#fff' }}>
            4-й этаж
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Социальная паранойя и эффект зловещей долины. Телефон с лавочки, домовой чат ЖК, темные окна фасада.
          </div>
          <button
            className="btn-control"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              sound.playClick();
              onNavigate('floor4');
            }}
          >
            {progress.floor4Solved ? `КОД СЕКТОРА: [ ${progress.codes.floor4} ]` : 'РАЗБЛОКИРОВАТЬ СМАРТФОН'}
          </button>
        </div>

        {/* Card 3 */}
        <div className="terminal-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', color: 'var(--amber)' }}>СЕКТОР Д // ТРАМВАЙ 314</span>
            {progress.route0Solved ? (
              <span className="stamp stamp-ok" style={{ fontSize: '10px', padding: '2px 6px' }}>КУПИРОВАНО</span>
            ) : (
              <span style={{ color: 'var(--red-alarm)', fontSize: '11px', fontWeight: 'bold' }}>ТРЕВОГА</span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, margin: '8px 0 4px', color: '#fff' }}>
            Маршрут №0
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Гонка со временем и цифровой сталкер. Архив 1998 г., чужой курсор чистильщика, радиосканер 104.2 FM.
          </div>
          <button
            className="btn-control"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              sound.playClick();
              onNavigate('route0');
            }}
          >
            {progress.route0Solved ? `КОД СЕКТОРА: [ ${progress.codes.route0} ]` : 'ОТКРЫТЬ АРХИВ ДЕПО'}
          </button>
        </div>

        {/* Card 4 */}
        <div className="terminal-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', color: 'var(--amber)' }}>СЕКТОР К // БТИ 44А</span>
            {progress.apt44Solved ? (
              <span className="stamp stamp-ok" style={{ fontSize: '10px', padding: '2px 6px' }}>КУПИРОВАНО</span>
            ) : (
              <span style={{ color: 'var(--red-alarm)', fontSize: '11px', fontWeight: 'bold' }}>ТРЕВОГА</span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, margin: '8px 0 4px', color: '#fff' }}>
            Квартира 44а
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Бюрократический оккультизм. Рабочий стол инженера, бесконечная комната БТИ, телефонный звонок сущности.
          </div>
          <button
            className="btn-control"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              sound.playClick();
              onNavigate('apt44');
            }}
          >
            {progress.apt44Solved ? `КОД СЕКТОРА: [ ${progress.codes.apt44} ]` : 'ПУЛЬТ ГЛАВНОГО ИНЖЕНЕРА'}
          </button>
        </div>
      </div>

      {/* Terminal of Access at Bottom */}
      <div
        className="terminal-card"
        style={{
          padding: '24px',
          border: terminalError ? '2px solid var(--red-alarm)' : '1px solid var(--amber-dim)',
          background: 'linear-gradient(180deg, #101317 0%, #0b0c0f 100%)',
          textAlign: 'center',
          boxShadow: terminalError ? '0 0 25px var(--red-glow)' : '0 0 15px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <KeyRound size={18} color="var(--amber)" />
          <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--amber)' }}>
            ТЕРМИНАЛ АВАРИЙНОГО ДОПУСКА (4-ЗНАЧНЫЙ СЕКТОРНЫЙ КЛЮЧ)
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '640px', margin: '0 auto 20px' }}>
          Каждая успешно пройденная карта раскрывает одно двузначное число. Соберите 4 фрагмента кода для снятия глобальной аварийной изоляции города.
        </p>

        {/* 4 Slots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          {[0, 1, 2, 3].map((slotIdx) => (
            <React.Fragment key={slotIdx}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength={2}
                  value={progress.terminalInput[slotIdx]}
                  onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
                  placeholder="__"
                  style={{
                    width: '64px',
                    height: '60px',
                    background: '#07080a',
                    border: '2px solid var(--border-light)',
                    color: 'var(--amber)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '24px',
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: '2px',
                    outline: 'none',
                    boxShadow: progress.terminalInput[slotIdx].length === 2 ? '0 0 12px var(--amber-glow)' : 'none',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  СЕКТОР {slotIdx + 1}
                </span>
              </div>
              {slotIdx < 3 && (
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dim)' }}>—</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {terminalError && (
          <div style={{ color: 'var(--red-alarm)', fontWeight: 'bold', fontSize: '12px', marginBottom: '12px', letterSpacing: '1px' }}>
            ОШИБКА АВТОРИЗАЦИИ // НЕДОПУСТИМАЯ КОМБИНАЦИЯ ИЛИ СЕКТОРА НЕ ЛОКАЛИЗОВАНЫ
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <button
            className="btn-control"
            onClick={verifyTerminalCode}
            style={{
              padding: '10px 28px',
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '1.2px',
            }}
          >
            АВТОРИЗОВАТЬ ДОПУСК К АРХИВУ ОПЕРАТОРА
          </button>
        </div>
      </div>
    </div>
  );
};
