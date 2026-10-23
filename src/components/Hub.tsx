import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, KeyRound, Terminal, Radio, Eye, FileText, Network, Search, Lock, AlertOctagon } from 'lucide-react';
import { ObjectiveBanner } from './ObjectiveBanner';
import { EvidenceBoard } from './EvidenceBoard';
import { ActiveScreen, GameProgress } from '../types';
import { sound } from '../audio/soundEngine';

interface HubProps {
  progress: GameProgress;
  onNavigate: (screen: ActiveScreen) => void;
  onUpdateTerminalInput: (index: number, val: string) => void;
  onUnlockSecret: () => void;
  onOpenHints?: () => void;
}

const DISPATCH_LOGS = [
  '02:14:02 [ДЕЛО №14-В] Шлюз В-2: датчик объема фиксирует 12 неподвижных тел при температуре -6.2°C.',
  '02:16:30 [ДЕЛО №29-Л] Ул. Лесная, 3: спектральный анализатор фиксирует резонанс 420 Гц в кирпичной кладке 4-го этажа.',
  '02:19:15 [ДЕЛО №03-Д] Тяговая подстанция ТТУ: зафиксирована паразитная нагрузка 600В на демонтированной ветке вагона №314.',
  '02:22:40 [ДЕЛО №44-К] Подвальный коллектор БТИ: отраженный сигнал лазерного интерферометра отсутствует (глубина = ∞).',
  '02:26:12 [СПЕЦСВЯЗЬ] Перехват домофонной сети Северного округа: жильцы транслируют чужие воспоминания.',
  '02:29:50 [ДЕЛО №14-В] С карты дежурного Соколова И.В. поступил сигнал авторизации. Биологический пульс: 0.',
];

export const Hub: React.FC<HubProps> = ({
  progress,
  onNavigate,
  onUpdateTerminalInput,
  onUnlockSecret,
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'evidence'>('map');
  const [terminalError, setTerminalError] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [easterEggMessage, setEasterEggMessage] = useState<string | null>(null);

  const slotRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const SECTOR_DOSSIERS: Record<string, { title: string; caseId: string; summary: string }> = {
    rls4: {
      title: 'Спецобъект «Северная антенна-4» (Гермошлюз В-2)',
      caseId: 'ДЕЛО № 14-В / 1998-2026',
      summary: 'Заглубленный бункер волноводов. В отсеке 2х2м зафиксировано 12 субъектов. Биометрический браслет старшего техника Соколова указывает на биологическую смерть, однако с его терминала поступают требования деблокировать периметр.',
    },
    floor4: {
      title: 'Жилой дом №3 по ул. Лесная (Секция 4-го этажа)',
      caseId: 'ДЕЛО № 29-Л / 1998-2026',
      summary: 'Многоквартирный дом типовой серии. Лифтовая шахта на 4-м этаже заложена в 1998 году. Домофонный концентратор захвачен паразитным сигналом, генерирующим ложную переписку жильцов. Найден телефон пропавшего свидетеля.',
    },
    route0: {
      title: 'Катастрофа ночного вагона КТМ-5М3 №314',
      caseId: 'ДЕЛО № 03-Д / 1998-2026',
      summary: '14 апреля 1998 года трамвайный поезд сошел на закрытую тупиковую ветку военного сектора и не вернулся в депо. В архив ТТУ проник сторонний процесс «ЧИСТИЛЬЩИК», уничтожающий первичные протоколы допросов и путевые листы.',
    },
    apt44: {
      title: 'Спецучасток фундаментных работ («Квартира 44а»)',
      caseId: 'ДЕЛО № 44-К / 1998-2026',
      summary: 'Подземная полость нулевого периметра под фундаментом жилого дома. Луч лазерного дальномера БТИ не возвращается. Назначен принудительный снос перегородки. Внутренний телефон начальника участка занят голосовой имитацией.',
    },
  };

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

    if (clean.length === 2 && index < 3) {
      slotRefs.current[index + 1]?.focus();
    }
  };

  const handleSlotPaste = (startIndex: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const digits = pasted.replace(/\D/g, '');
    if (!digits) return;

    sound.playKeypress();
    let remaining = digits;
    let curr = startIndex;
    while (remaining.length > 0 && curr < 4) {
      const chunk = remaining.slice(0, 2);
      onUpdateTerminalInput(curr, chunk);
      remaining = remaining.slice(2);
      curr++;
    }
    const targetFocus = Math.min(3, Math.max(0, curr - 1));
    slotRefs.current[targetFocus]?.focus();
  };

  const handleSlotKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !progress.terminalInput[index] && index > 0) {
      slotRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      slotRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      slotRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      verifyTerminalCode();
    }
  };

  const verifyTerminalCode = () => {
    sound.playClick(1100);
    const code = progress.terminalInput.join('');

    // Master Chrono Code: 1998-04-44 (1998 год, 04-й месяц, квартира 44)
    if (code === '19980444') {
      sound.playScreamerThud();
      onUnlockSecret();
    } else if (code === '00000000') {
      sound.playBeep(800, 0.2);
      setEasterEggMessage('[ДИАГНОСТИКА СЕТИ СВЯЗИ] // ИЗОЛЯТОРЫ: 4 ЕД. | ПАРАЗИТНАЯ ЭМИССИЯ: КРИТИЧЕСКАЯ | УТЕЧКА: АКТИВНА');
      setTimeout(() => setEasterEggMessage(null), 6000);
    } else if (code === '66666666') {
      sound.playScreamerThud();
      setEasterEggMessage('[АРХИВНАЯ ЗАПИСЬ НА ПОЛЯХ]: «НЕ ПРИЗЫВАЙ В ГОРОД ТО, ЧТО НЕ СМОЖЕШЬ ЗАЛИТЬ БЕТОНОМ М500».');
      setTimeout(() => setEasterEggMessage(null), 6000);
    } else if (code === '71488040') {
      sound.playGlitch();
      setEasterEggMessage('[СПРАВКА СЛЕДОВАТЕЛЯ]: Связь между объектом РЛС-4 и домом на Лесной доказана. Силовой кабель тяговой подстанции отведен в фундамент.');
      setTimeout(() => setEasterEggMessage(null), 6000);
    } else if (code === '14041998') {
      sound.playVoiceTransmission(210, 3.0);
      setEasterEggMessage('[ХРОНИКА ТРАГЕДИИ 14.04.1998]: В 23:45 трамвай №314 вышел в рейс. В 23:58 шлюз В-2 принял 12 тел. В 00:00 глубина квартиры 44а стала бесконечной.');
      setTimeout(() => setEasterEggMessage(null), 7000);
    } else if (code === '31407140') {
      sound.playBreakerTrip();
      setEasterEggMessage('[РАПОРТ ДИСПЕТЧЕРА 1998]: Водитель Соколов перевел стрелку кодом 3140. Вагон залит в бетон. Смена дежурства закрыта навечно.');
      setTimeout(() => setEasterEggMessage(null), 7000);
    } else if (code === '88040038') {
      sound.playTelephoneRing();
      setEasterEggMessage('[СВОДКА МИЛИЦИИ 1998]: Квартира 38 по ул. Лесная обесточена. Соседи жалуются на светящийся силуэт за кирпичной кладкой лифта.');
      setTimeout(() => setEasterEggMessage(null), 7000);
    } else {
      sound.playAlarm(2);
      setTerminalError(true);
      setTimeout(() => setTerminalError(false), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1240px', margin: '0 auto', padding: '0 16px 40px' }}>
      
      {/* Dossier Header Box */}
      <div className="terminal-card" style={{ borderLeft: '4px solid var(--amber)', padding: '16px 20px', background: 'linear-gradient(90deg, #12151b 0%, #0c0e12 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="evidence-tag evidence-classified">СОВЕРШЕННО СЕКРЕТНО</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px' }}>ЭКЗЕМПЛЯР ЕДИНСТВЕННЫЙ</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--amber)', letterSpacing: '1px', marginTop: '6px' }}>
              СЛУЖЕБНЫЙ АРХИВ СПЕЦНАДЗОРА // МАТЕРИАЛЫ РАССЛЕДОВАНИЯ «СЕВЕР-98»
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '780px', lineHeight: 1.5 }}>
              Организация: «ГорСветТехКонтроль» (Служба оперативной консервации аномальных очагов). 
              В производстве находятся 4 взаимосвязанных тома следственного дела о сокрытии городской катастрофы 14 апреля 1998 года.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>СТАТУС КУПИРОВАНИЯ ТОМОВ:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[progress.rls4Solved, progress.floor4Solved, progress.route0Solved, progress.apt44Solved].map((solved, idx) => (
                  <div
                    key={idx}
                    title={`Том ${idx + 1}: ${solved ? 'Купирован' : 'Активный прорыв'}`}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '2px',
                      background: solved ? 'var(--green-term)' : 'var(--red-alarm)',
                      boxShadow: solved ? '0 0 8px var(--green-glow)' : '0 0 6px var(--red-glow)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Mode Toggle: Map vs Evidence Board */}
            <div style={{ display: 'flex', gap: '4px', background: '#08090c', padding: '3px', border: '1px solid var(--border-dim)', borderRadius: '3px' }}>
              <button
                className={`btn-control ${activeTab === 'map' ? 'btn-active' : ''}`}
                onClick={() => { sound.playClick(); setActiveTab('map'); }}
                style={{ fontSize: '11px', padding: '4px 10px', background: activeTab === 'map' ? 'var(--amber)' : 'transparent', color: activeTab === 'map' ? '#000' : 'var(--text-muted)' }}
              >
                КАРТА СЕКТОРОВ
              </button>
              <button
                className={`btn-control ${activeTab === 'evidence' ? 'btn-active' : ''}`}
                onClick={() => { sound.playClick(); setActiveTab('evidence'); }}
                style={{ fontSize: '11px', padding: '4px 10px', background: activeTab === 'evidence' ? 'var(--amber)' : 'transparent', color: activeTab === 'evidence' ? '#000' : 'var(--text-muted)' }}
              >
                ДОСКА УЛИК И СВЯЗЕЙ (СЛЕДСТВИЕ)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Central View: Switchable between Vector Map and Detective Evidence Board */}
      {activeTab === 'map' ? (
        <div className="terminal-card">
          <div className="terminal-header">
            <span>ОПЕРАТИВНАЯ КАРТА СПЕЦНАДЗОРА // СЕВЕРНЫЙ ГОРОДСКОЙ ОКРУГ</span>
            <span style={{ color: 'var(--red-alarm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> АКТИВНЫХ ОЧАГОВ: 4
            </span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '440px', background: '#07080a', overflow: 'hidden' }}>
            
            {/* SVG Topographic Scheme */}
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
                stroke="rgba(77, 171, 247, 0.16)"
                strokeWidth="32"
              />
              {/* Buried tram line / high-voltage feeder link */}
              <path
                d="M 120 400 L 320 280 L 580 270 L 920 120"
                fill="none"
                stroke="rgba(255, 180, 34, 0.18)"
                strokeDasharray="6 4"
                strokeWidth="2"
              />
              {/* Underground cable connection between RLS-4 and residential building */}
              <path
                d="M 240 110 L 480 180 L 780 130"
                fill="none"
                stroke="rgba(255, 65, 54, 0.22)"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />

              {/* Sector Boundary Rings */}
              <circle cx="240" cy="110" r="70" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="4 4" />
              <circle cx="780" cy="130" r="75" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="4 4" />
              <circle cx="340" cy="300" r="70" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="4 4" />
              <circle cx="720" cy="310" r="70" fill="none" stroke="rgba(255, 65, 54, 0.15)" strokeDasharray="4 4" />
            </svg>

            {/* Interactive Sector Node 1: РЛС-4 */}
            <div
              onClick={() => {
                sound.playClick();
                onNavigate('rls4');
              }}
              onMouseEnter={() => {
                sound.playGeigerCounter(2);
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
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: progress.rls4Solved ? 'rgba(57, 230, 109, 0.2)' : 'rgba(255, 65, 54, 0.25)',
                  border: `2px solid ${progress.rls4Solved ? 'var(--green-term)' : 'var(--red-alarm)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: progress.rls4Solved ? '0 0 10px var(--green-glow)' : '0 0 16px var(--red-glow)',
                }}
              >
                <Radio size={16} color={progress.rls4Solved ? 'var(--green-term)' : 'var(--red-alarm)'} />
              </div>
              <div
                style={{
                  marginTop: '6px',
                  background: '#0a0c0f',
                  border: '1px solid var(--border-light)',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: progress.rls4Solved ? 'var(--green-term)' : 'var(--amber)',
                  whiteSpace: 'nowrap',
                }}
              >
                ТОМ I: ОБЪЕКТ «РЛС-4» {progress.rls4Solved ? `[ ${progress.codes.rls4} ]` : '[АКТИВЕН]'}
              </div>
            </div>

            {/* Interactive Sector Node 2: 4-й этаж */}
            <div
              onClick={() => {
                sound.playClick();
                onNavigate('floor4');
              }}
              onMouseEnter={() => {
                sound.playGeigerCounter(2);
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
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: progress.floor4Solved ? 'rgba(57, 230, 109, 0.2)' : 'rgba(255, 65, 54, 0.25)',
                  border: `2px solid ${progress.floor4Solved ? 'var(--green-term)' : 'var(--red-alarm)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: progress.floor4Solved ? '0 0 10px var(--green-glow)' : '0 0 16px var(--red-glow)',
                }}
              >
                <Eye size={16} color={progress.floor4Solved ? 'var(--green-term)' : 'var(--red-alarm)'} />
              </div>
              <div
                style={{
                  marginTop: '6px',
                  background: '#0a0c0f',
                  border: '1px solid var(--border-light)',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: progress.floor4Solved ? 'var(--green-term)' : 'var(--amber)',
                  whiteSpace: 'nowrap',
                }}
              >
                ТОМ II: ДОМ НА ЛЕСНОЙ {progress.floor4Solved ? `[ ${progress.codes.floor4} ]` : '[АКТИВЕН]'}
              </div>
            </div>

            {/* Interactive Sector Node 3: Маршрут №0 */}
            <div
              onClick={() => {
                sound.playClick();
                onNavigate('route0');
              }}
              onMouseEnter={() => {
                sound.playGeigerCounter(2);
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
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: progress.route0Solved ? 'rgba(57, 230, 109, 0.2)' : 'rgba(255, 65, 54, 0.25)',
                  border: `2px solid ${progress.route0Solved ? 'var(--green-term)' : 'var(--red-alarm)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: progress.route0Solved ? '0 0 10px var(--green-glow)' : '0 0 16px var(--red-glow)',
                }}
              >
                <AlertTriangle size={16} color={progress.route0Solved ? 'var(--green-term)' : 'var(--red-alarm)'} />
              </div>
              <div
                style={{
                  marginTop: '6px',
                  background: '#0a0c0f',
                  border: '1px solid var(--border-light)',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: progress.route0Solved ? 'var(--green-term)' : 'var(--amber)',
                  whiteSpace: 'nowrap',
                }}
              >
                ТОМ III: ВАГОН №314 {progress.route0Solved ? `[ ${progress.codes.route0} ]` : '[АКТИВЕН]'}
              </div>
            </div>

            {/* Interactive Sector Node 4: Квартира 44а */}
            <div
              onClick={() => {
                sound.playClick();
                onNavigate('apt44');
              }}
              onMouseEnter={() => {
                sound.playGeigerCounter(2);
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
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: progress.apt44Solved ? 'rgba(57, 230, 109, 0.2)' : 'rgba(255, 65, 54, 0.25)',
                  border: `2px solid ${progress.apt44Solved ? 'var(--green-term)' : 'var(--red-alarm)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: progress.apt44Solved ? '0 0 10px var(--green-glow)' : '0 0 16px var(--red-glow)',
                }}
              >
                <Terminal size={16} color={progress.apt44Solved ? 'var(--green-term)' : 'var(--red-alarm)'} />
              </div>
              <div
                style={{
                  marginTop: '6px',
                  background: '#0a0c0f',
                  border: '1px solid var(--border-light)',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: progress.apt44Solved ? 'var(--green-term)' : 'var(--amber)',
                  whiteSpace: 'nowrap',
                }}
              >
                ТОМ IV: КВАРТИРА 44А {progress.apt44Solved ? `[ ${progress.codes.apt44} ]` : '[АКТИВЕН]'}
              </div>
            </div>

            {/* Real-time Ticker in Map overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '16px',
                right: '16px',
                background: 'rgba(10, 12, 15, 0.94)',
                border: '1px solid var(--border-dim)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: 'var(--amber)',
              }}
            >
              <Radio size={14} className="pulse-alarm" />
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                {hoveredSector ? 'МАТЕРИАЛЫ СЛЕДСТВИЯ:' : 'ОПЕРАТИВНАЯ СВОДКА:'}
              </span>
              <span style={{ color: hoveredSector ? 'var(--green-term)' : 'var(--text-main)', letterSpacing: '0.3px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {hoveredSector && SECTOR_DOSSIERS[hoveredSector]
                  ? `${SECTOR_DOSSIERS[hoveredSector].caseId} — ${SECTOR_DOSSIERS[hoveredSector].summary}`
                  : DISPATCH_LOGS[currentLogIndex]}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Investigation Evidence Board */
        <EvidenceBoard
          progress={progress}
          onNavigateToCase={onNavigate}
          onOpenFinale={onUnlockSecret}
        />
      )}

      {/* Grid of 4 Case Tomes (Архивные тома уголовно-надзорных дел) */}
      {/* Grid of 4 Case Tomes (Архивные тома уголовно-надзорных дел) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        
        {/* Case Tome 1 */}
        <div className="terminal-card manila-card" style={{ padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="evidence-tag evidence-classified">ТОМ I // АРХИВ №14-В</span>
            {progress.rls4Solved ? (
              <span className="rubber-stamp-sealed" style={{ fontSize: '10px' }}>КУПИРОВАНО</span>
            ) : (
              <span className="rubber-stamp-classified" style={{ fontSize: '10px' }}>ПРОРЫВ ШЛЮЗА</span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, margin: '10px 0 4px', color: '#fff' }}>
            Спецобъект «РЛС-4» (Шлюз В-2)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
            Гермошлюз 2х2м. 12 тел в зимней одежде стоят спиной к камере. На стене выбит инвентарный шифр. Дежурный Соколов мертв, но с его терминала требуют открыть замок.
          </div>
          <button
            className="btn-control"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              sound.playPaperRustle();
              sound.playClick();
              onNavigate('rls4');
            }}
          >
            {progress.rls4Solved ? `МАТЕРИАЛ КУПИРОВАН [ ${progress.codes.rls4} ]` : 'ОТКРЫТЬ МАТЕРИАЛЫ ДЕЛА № 14-В'}
          </button>
        </div>

        {/* Case Tome 2 */}
        <div className="terminal-card manila-card" style={{ padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="evidence-tag evidence-classified">ТОМ II // АРХИВ №29-Л</span>
            {progress.floor4Solved ? (
              <span className="rubber-stamp-sealed" style={{ fontSize: '10px' }}>КУПИРОВАНО</span>
            ) : (
              <span className="rubber-stamp-classified" style={{ fontSize: '10px' }}>СЕТЕВАЯ МИМИКРИЯ</span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, margin: '10px 0 4px', color: '#fff' }}>
            Дом №3 по ул. Лесная (4-й этаж)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
            Криминалистический дамп телефона пропавшего жильца. Домовой чат генерирует нечеловеческие фразы. В кирпичной кладке лифта стоит манекен с квитанцией на стекле.
          </div>
          <button
            className="btn-control"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              sound.playPaperRustle();
              sound.playClick();
              onNavigate('floor4');
            }}
          >
            {progress.floor4Solved ? `МАТЕРИАЛ КУПИРОВАН [ ${progress.codes.floor4} ]` : 'ОТКРЫТЬ МАТЕРИАЛЫ ДЕЛА № 29-Л'}
          </button>
        </div>

        {/* Case Tome 3 */}
        <div className="terminal-card manila-card" style={{ padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="evidence-tag evidence-classified">ТОМ III // АРХИВ №03-Д</span>
            {progress.route0Solved ? (
              <span className="rubber-stamp-sealed" style={{ fontSize: '10px' }}>КУПИРОВАНО</span>
            ) : (
              <span className="rubber-stamp-classified" style={{ fontSize: '10px' }}>УДАЛЕНИЕ АРХИВА</span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, margin: '10px 0 4px', color: '#fff' }}>
            Катастрофа вагона №314
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
            Архив ТТУ 1998 года. Сторонний субъект [ЧИСТИЛЬЩИК] стирает следственные файлы. Радиосканер на частоте 104.2 FM улавливает запись черного ящика вагона.
          </div>
          <button
            className="btn-control"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              sound.playPaperRustle();
              sound.playClick();
              onNavigate('route0');
            }}
          >
            {progress.route0Solved ? `МАТЕРИАЛ КУПИРОВАН [ ${progress.codes.route0} ]` : 'ОТКРЫТЬ МАТЕРИАЛЫ ДЕЛА № 03-Д'}
          </button>
        </div>

        {/* Case Tome 4 */}
        <div className="terminal-card manila-card" style={{ padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="evidence-tag evidence-classified">ТОМ IV // АРХИВ №44-К</span>
            {progress.apt44Solved ? (
              <span className="rubber-stamp-sealed" style={{ fontSize: '10px' }}>КУПИРОВАНО</span>
            ) : (
              <span className="rubber-stamp-classified" style={{ fontSize: '10px' }}>УГРОЗА БУРЕНИЯ</span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, margin: '10px 0 4px', color: '#fff' }}>
            Спецколлектор «Квартира 44а»
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
            Рабочий стол главного инженера ГСТК. Наряд на демонтаж стены. Акт БТИ: глубина бесконечна. Внутренний телефон занят голосовым имитатором, требующим сноса.
          </div>
          <button
            className="btn-control"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              sound.playPaperRustle();
              sound.playClick();
              onNavigate('apt44');
            }}
          >
            {progress.apt44Solved ? `МАТЕРИАЛ КУПИРОВАН [ ${progress.codes.apt44} ]` : 'ОТКРЫТЬ МАТЕРИАЛЫ ДЕЛА № 44-К'}
          </button>
        </div>
      </div>

      {/* Master Chrono Terminal at Bottom */}
      <div
        id="terminal-cipher-section"
        className="terminal-card"
        style={{
          padding: '24px',
          border: terminalError ? '2px solid var(--red-alarm)' : '1px solid var(--amber-dim)',
          background: 'linear-gradient(180deg, #101317 0%, #08090b 100%)',
          textAlign: 'center',
          boxShadow: terminalError ? '0 0 25px var(--red-glow)' : '0 0 15px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <KeyRound size={18} color="var(--amber)" />
          <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--amber)' }}>
            ШИФРАТОР СНЯТИЯ РЕЖИМНОЙ ИЗОЛЯЦИИ // ХРОНО-КОД КАТАСТРОФЫ 14.04.1998
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '720px', margin: '0 auto 20px', lineHeight: 1.5 }}>
          Каждое раскрытое следственное дело обнажает двухзначный фрагмент ведомственного шифра (Год — Дата — Номер сектора — Номер эпицентра). 
          Введите собранные 4 фрагмента для доступа к секретному личному делу оператора.
        </p>

        {/* 4 Mechanical Code Wheel Slots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          {[0, 1, 2, 3].map((slotIdx) => (
            <React.Fragment key={slotIdx}>
              <div style={{ position: 'relative' }}>
                <input
                  ref={(el) => {
                    slotRefs.current[slotIdx] = el;
                  }}
                  type="text"
                  maxLength={2}
                  value={progress.terminalInput[slotIdx]}
                  onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
                  onKeyDown={(e) => handleSlotKeyDown(slotIdx, e)}
                  onPaste={(e) => handleSlotPaste(slotIdx, e)}
                  placeholder="__"
                  style={{
                    width: '64px',
                    height: '68px',
                    background: '#07090c',
                    border: terminalError ? '2px solid var(--red-alarm)' : '2px solid #363e4c',
                    borderTop: '3px solid #586374',
                    borderRadius: '6px',
                    color: progress.terminalInput[slotIdx] ? 'var(--green-term)' : 'var(--amber)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '24px',
                    fontWeight: 800,
                    textAlign: 'center',
                    outline: 'none',
                    letterSpacing: '2px',
                    boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.8), 0 3px 6px rgba(0,0,0,0.5)',
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
                  ТОМ {slotIdx + 1}
                </span>
              </div>
              {slotIdx < 3 && (
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dim)' }}>—</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {easterEggMessage && (
          <div
            style={{
              color: '#4dabf7',
              background: 'rgba(77, 171, 247, 0.1)',
              border: '1px solid #4dabf7',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: '12px',
              marginBottom: '14px',
              letterSpacing: '0.8px',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
              animation: 'flicker 3s infinite',
            }}
          >
            {easterEggMessage}
          </div>
        )}

        {terminalError && (
          <div style={{ color: 'var(--red-alarm)', fontWeight: 'bold', fontSize: '12px', marginBottom: '12px', letterSpacing: '1px' }}>
            ОШИБКА АВТОРИЗАЦИИ // ШИФР НЕ СООТВЕТСТВУЕТ ХРОНОЛОГИИ КАТАСТРОФЫ 14.04.1998
          </div>
        )}

        {progress.secretUnlocked && (
          <div
            style={{
              background: 'rgba(57, 230, 109, 0.1)',
              border: '1px solid var(--green-term)',
              padding: '12px 16px',
              marginTop: '16px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ color: 'var(--green-term)', fontWeight: 800, fontSize: '13px' }}>
              ✓ ДОПУСК К СЕКРЕТНОМУ АРХИВУ ОПЕРАТОРА РАЗБЛОКИРОВАН
            </div>
            <button
              className="btn-control"
              onClick={() => {
                sound.playClick();
                onNavigate('secret');
              }}
              style={{
                borderColor: 'var(--green-term)',
                color: 'var(--green-term)',
                fontSize: '12px',
                padding: '6px 16px',
              }}
            >
              ПЕРЕЙТИ К ДОСЬЕ И 5-Й ТОЧКЕ РАДАРА →
            </button>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
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
            АВТОРИЗОВАТЬ ДОПУСК К СЕКРЕТНОМУ АРХИВУ
          </button>
        </div>
      </div>
    </div>
  );
};
