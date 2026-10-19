import React, { useState, useEffect } from 'react';
import { Radio, Terminal, Folder, FileText, AlertTriangle, ShieldAlert, ArrowLeft, Disc, CheckCircle2, Lock } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface MapRoute0Props {
  onComplete: (code: string) => void;
  onBack: () => void;
  alreadySolved: boolean;
}

interface ArchiveFolder {
  id: string;
  name: string;
  deleted: boolean;
  content: string;
}

export const MapRoute0: React.FC<MapRoute0Props> = ({ onComplete, onBack, alreadySolved }) => {
  const [activeTab, setActiveTab] = useState<'archive' | 'radio' | 'console'>('archive');
  const [frequency, setFrequency] = useState<number>(94.5);
  const [radioTuned, setRadioTuned] = useState<boolean>(false);
  const [cleanerActive, setCleanerActive] = useState<boolean>(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('waybill314');

  // Folders being systematically purged by cleaner
  const [folders, setFolders] = useState<ArchiveFolder[]>([
    {
      id: 'waybill314',
      name: 'Дело №314: Путевой лист вагона №314 (04.1998)',
      deleted: false,
      content: `СЛУЖЕБНЫЙ ПУТЕВОЙ ЛИСТ ТРАМВАЙНОГО УПРАВЛЕНИЯ
Дата: 14 апреля 1998 года. Время выезда: 23:45.
Водитель: Соколов И.В. (Таб. №714)
Кондуктор: Мельникова Т.А.
Маршрут: «Кольцо Южное — Северный тупик».

ОСОБЫЕ ОТМЕТКИ В ЖУРНАЛЕ:
«Водитель Соколов И.В. жалуется, что после полуночи в бортовой рации на частоте 104.2 FM слышен шум прибоя и монотонный голос диктует список жильцов дома №3 по ул. Лесной. Стрелочный перевод №3 переведен в положение "ПОДЗЕМНЫЙ ВВОД РЛС-4"».
Вагон в депо не вернулся. Контактная сеть обесточена. Рельсы обрываются в свежем асфальте.`,
    },
    {
      id: 'depot_cables',
      name: 'Справка: Силовая запитка подстанции Лесная (1998)',
      deleted: false,
      content: `АКТ ПРИЕМКИ ВЫСОКОВОЛЬТНЫХ КАБЕЛЕЙ
Силовой кабель 10 кВ отведен от тяговой подстанции напрямую в подвальный коллектор дома 3 по ул. Лесная. Подпись главного инженера: ЗАВИЗИРОВАНО.`,
    },
    {
      id: 'incident_witnesses',
      name: 'Протокол опроса дежурной стрелочницы (1998)',
      deleted: false,
      content: `«Трамвай шел на скорости 60 км/ч без фар. В окнах пассажиры стояли вплотную друг к другу лицом к стеклу, не моргая. Вагон ушел в туман за забор воинской части РЛС-4».`,
    },
    {
      id: 'classified_photo',
      name: 'ГРИФ: СЕКРЕТНО // Котлован жилого дома (1998)',
      deleted: false,
      content: `[ФАЙЛ ЗАБЛОКИРОВАН АДМИНИСТРАТОРОМ СЕТИ. ТРЕБУЕТСЯ АВАРИЙНЫЙ КОД ДИСПЕТЧЕРА]`,
    },
  ]);

  // Terminal Climax states
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [cleanerTakeover, setCleanerTakeover] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(alreadySolved);
  const [terminalLog, setTerminalLog] = useState<string[]>([
    '02:30:11 Подключение к электронному архиву ТТУ...',
    '02:30:14 АВТОРИЗОВАН ПОЛЬЗОВАТЕЛЬ [ID: ЧИСТИЛЬЩИК_0]',
    '02:30:16 ВНИМАНИЕ: Начата процедура безвозвратного форматирования тома B:',
  ]);

  // Cleaner deletion timer (every 22 seconds deletes a folder if not solved)
  useEffect(() => {
    if (solved) return;
    const interval = setInterval(() => {
      setFolders((prev) => {
        const nextTarget = prev.find((f) => !f.deleted && f.id !== 'waybill314' && f.id !== 'classified_photo');
        if (nextTarget) {
          sound.playKeypress();
          sound.playGlitch();
          setTerminalLog((log) => [...log, `ФАЙЛ УНИЧТОЖЕН: ${nextTarget.name}`]);
          return prev.map((f) => (f.id === nextTarget.id ? { ...f, deleted: true } : f));
        }
        return prev;
      });
    }, 22000);
    return () => clearInterval(interval);
  }, [solved]);

  // Cleaner noticing player after 25s
  useEffect(() => {
    if (solved) return;
    const timer = setTimeout(() => {
      setCleanerTakeover(true);
      sound.playScreamerThud();
      sound.playAlarm(2);
    }, 28000);
    return () => clearTimeout(timer);
  }, [solved]);

  // Frequency slider handler
  const handleFreqChange = (val: number) => {
    setFrequency(val);
    const isTarget = Math.abs(val - 104.2) < 0.2;
    sound.playRadioTuner(val, isTarget);

    if (isTarget && !radioTuned) {
      setRadioTuned(true);
      sound.playVoiceTransmission(340, 3.5);
    }
  };

  // Terminal abort execution
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playKeypress();
    // Correct emergency code from black box: 3140
    if (terminalInput.trim() === '3140') {
      sound.playScreamerThud();
      sound.playStatic(0.8, 0.1);
      setSolved(true);
      setCleanerTakeover(false);
      setCleanerActive(false);
      setTerminalLog((prev) => [
        ...prev,
        '>> КОД 3140 ПРИНЯТ. СОЕДИНЕНИЕ ЧИСТИЛЬЩИКА ПРИНУДИТЕЛЬНО РАЗОРВАНО.',
        '>> ДОСТУП К ЗАСЕКРЕЧЕННОМУ ФАЙЛУ РАЗБЛОКИРОВАН.',
        '>> КОД КУПИРОВАНИЯ СЕКТОРА: [ 04 ]',
      ]);
      setFolders((prev) =>
        prev.map((f) =>
          f.id === 'classified_photo'
            ? {
                ...f,
                content: `АКТ 1998 ГОДА (ЗАСЕКРЕЧЕНО):
Котлован под жилым домом №3 по ул. Лесная. Целый трамвайный вагон №314 залит в монолитный бетон фундамента. К колесным тележкам и пантографу подведены силовые кабели объекта РЛС-4. Все 12 пассажиров замурованы внутри в качестве органического изолятора.
КОД СЕКТОРА: [ 04 ]`,
              }
            : f
        )
      );
      onComplete('04');
    } else {
      sound.playAlarm(2);
      setTerminalLog((prev) => [...prev, `ОШИБКА: КОД ${terminalInput} НЕ РАСПОЗНАН ДИСПЕТЧЕРОМ`]);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px 40px' }}>
      
      {/* Top Warning Banner */}
      <div className="terminal-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Disc size={20} color="var(--amber)" />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--amber)', fontSize: '14px' }}>
              КАРТА 3: МАРШРУТ №0 // ЭЛЕКТРОННЫЙ АРХИВ ТРАМВАЙНОГО ДЕПО (1998)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              СТАТУС ТОМА: ФОРМАТИРОВАНИЕ ЧУЖИМ ПОЛЬЗОВАТЕЛЕМ [ID: ЧИСТИЛЬЩИК]
            </div>
          </div>
        </div>
        {solved ? (
          <span className="stamp stamp-ok">КУПИРОВАНО [ 04 ]</span>
        ) : (
          <span style={{ color: 'var(--red-alarm)', fontWeight: 800, fontSize: '12px', animation: 'flicker 0.6s infinite' }}>
            ⚠️ ФАЙЛЫ УНИЧТОЖАЮТСЯ В РЕАЛЬНОМ ВРЕМЕНИ
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn-control"
          onClick={() => { sound.playClick(); setActiveTab('archive'); }}
          style={{ background: activeTab === 'archive' ? 'var(--amber)' : undefined, color: activeTab === 'archive' ? '#000' : undefined }}
        >
          <Folder size={14} /> АРХИВ ДЕЛ (1998)
        </button>
        <button
          className="btn-control"
          onClick={() => { sound.playClick(); setActiveTab('radio'); }}
          style={{ background: activeTab === 'radio' ? 'var(--amber)' : undefined, color: activeTab === 'radio' ? '#000' : undefined }}
        >
          <Radio size={14} /> РАДИОСКАНЕР ЧАСТОТ (FM)
        </button>
        <button
          className="btn-control btn-danger"
          onClick={() => { sound.playClick(); setActiveTab('console'); }}
          style={{ background: activeTab === 'console' ? 'var(--red-alarm)' : undefined, color: activeTab === 'console' ? '#fff' : undefined }}
        >
          <Terminal size={14} /> СЕТЕВАЯ КОНСОЛЬ ПЕРЕХВАТА
        </button>
      </div>

      {/* Main Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        
        {/* Left Interactive Workspace */}
        <div className="terminal-card" style={{ padding: '16px', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
          
          {/* TAB 1: ARCHIVE FILES */}
          {activeTab === 'archive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--amber)', fontWeight: 700 }}>
                ДЕРЕВО КАТАЛОГА: /ARCHIVE_1998/TRAMWAY_DISPATCH/
              </div>

              {cleanerTakeover && (
                <div style={{ background: '#260a0a', border: '1px solid var(--red-alarm)', padding: '10px', color: '#ffb3b3', fontSize: '12px', fontWeight: 700 }}>
                  🛑 ЧИСТИЛЬЩИК ПЕРЕХВАТИЛ ПОИСКОВУЮ СТРОКУ: «ЗАКРОЙ ВКЛАДКУ. ТЫ НЕ В ТОМ ВАГОНЕ».
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      if (!f.deleted) {
                        sound.playClick();
                        setSelectedFolder(f.id);
                      }
                    }}
                    disabled={f.deleted}
                    style={{
                      padding: '8px 12px',
                      background: f.deleted ? '#1a1212' : selectedFolder === f.id ? '#202630' : '#12151b',
                      border: f.deleted ? '1px dashed #4a2222' : selectedFolder === f.id ? '1px solid var(--amber)' : '1px solid #23272e',
                      color: f.deleted ? '#664444' : selectedFolder === f.id ? 'var(--amber)' : 'var(--text-main)',
                      cursor: f.deleted ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileText size={12} color={f.deleted ? '#553333' : 'var(--amber)'} />
                    <span>{f.deleted ? `[УДАЛЕНО ЧИСТИЛЬЩИКОМ] ${f.name.slice(0, 24)}...` : f.name}</span>
                  </button>
                ))}
              </div>

              {/* File Viewer Box */}
              <div
                style={{
                  flex: 1,
                  background: '#090a0d',
                  border: '1px solid var(--border-light)',
                  padding: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {folders.find((f) => f.id === selectedFolder)?.content || 'Выберите файл для чтения...'}
              </div>
            </div>
          )}

          {/* TAB 2: RADIO SCANNER (FM 88.0 - 108.0 MHz) */}
          {activeTab === 'radio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
                БОРТОВОЙ РАДИОСКАНЕР ЧАСТОТ (УКВ / FM)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                В путевом листе указано, что водитель Соколов перед исчезновением слышал передачу на волне <strong>104.2 FM</strong>.
              </p>

              {/* Frequency Digital Display */}
              <div
                style={{
                  background: '#07080a',
                  border: '2px solid var(--border-light)',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: radioTuned ? '0 0 20px var(--green-glow)' : 'none',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '2px' }}>ЧАСТОТА ПРИЕМА</div>
                <div style={{ fontSize: '42px', fontWeight: 800, color: radioTuned ? 'var(--green-term)' : 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  {frequency.toFixed(1)} <span style={{ fontSize: '18px' }}>МГц</span>
                </div>
                <div style={{ fontSize: '12px', color: radioTuned ? 'var(--green-term)' : 'var(--red-alarm)', fontWeight: 700, marginTop: '6px' }}>
                  {radioTuned ? '● СИГНАЛ ЗАХВАЧЕН: ЧЕРНЫЙ ЯЩИК ВАГОНА №314' : '○ ЭФИР: СТАТИЧЕСКИЙ ШУМ И ПРИБОЙ'}
                </div>
              </div>

              {/* Slider Control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                  <span>88.0 МГц</span>
                  <span>104.2 МГц (Цель)</span>
                  <span>108.0 МГц</span>
                </div>
                <input
                  type="range"
                  min="88.0"
                  max="108.0"
                  step="0.1"
                  value={frequency}
                  onChange={(e) => handleFreqChange(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--amber)', width: '100%' }}
                />
              </div>

              {/* Radio Decoded Transcript */}
              {radioTuned && (
                <div style={{ background: '#121820', border: '1px solid var(--blue-tech)', padding: '14px', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--blue-tech)', fontWeight: 800, fontSize: '12px', marginBottom: '6px' }}>
                    РАДИОПЕРЕХВАТ // ЧЕРНЫЙ ЯЩИК ТРАМВАЯ №314 (14.04.1998 23:58):
                  </div>
                  <div style={{ fontSize: '12px', color: '#e2f0ff', lineHeight: '1.6', fontStyle: 'italic' }}>
                    «...мы сошли с рельсов, но продолжаем ехать прямо по асфальту! Стрелка переведена на подземный тоннель объекта РЛС-4! Они замуровали нас в фундамент дома! Код диспетчера для экстренного сброса сети: <strong>3140</strong>! Повторяю: три, один, четыре, ноль!..»
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NETWORK CONSOLE DUEL */}
          {activeTab === 'console' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--red-alarm)' }}>
                СЕТЕВОЙ ТЕРМИНАЛ // ПЕРЕХВАТ УПРАВЛЕНИЯ
              </div>

              <div
                style={{
                  flex: 1,
                  background: '#07080a',
                  border: '1px solid #331515',
                  padding: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  lineHeight: '1.5',
                  color: '#ffb3b3',
                  overflowY: 'auto',
                  maxHeight: '260px',
                }}
              >
                {terminalLog.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>

              {/* Command Prompt */}
              <form onSubmit={handleTerminalSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Введите 4-значный код диспетчера (3140)..."
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#0a0d12',
                    border: '1px solid var(--border-light)',
                    color: 'var(--amber)',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                  }}
                />
                <button
                  type="submit"
                  className="btn-control btn-danger"
                  style={{ padding: '8px 16px' }}
                >
                  РАЗОРВАТЬ СОЕДИНЕНИЕ ЧИСТИЛЬЩИКА
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Info Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="terminal-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)', marginBottom: '8px' }}>
              ИНСТРУКЦИЯ ПО РАССЛЕДОВАНИЮ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              <div>1. Откройте путевой лист в архиве и найдите упоминание частоты радиостанции.</div>
              <div>2. Переключитесь на «Радиосканер» и настройте частоту ровно на <strong>104.2 МГц</strong>.</div>
              <div>3. Прослушайте крик кондуктора и запишите код диспетчера (<strong>3140</strong>).</div>
              <div>4. Перейдите в «Сетевую консоль», введите код и отключите Чистильщика до того, как он сотрет секретный файл.</div>
            </div>
          </div>

          <div className="terminal-card" style={{ padding: '16px', background: '#0e1115' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              РЕЗУЛЬТАТ КУПИРОВАНИЯ
            </div>
            {solved ? (
              <div style={{ color: 'var(--green-term)', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> КОД СЕКТОРА ПОЛУЧЕН: [ 04 ]
              </div>
            ) : (
              <div style={{ color: 'var(--red-alarm)', fontSize: '12px' }}>
                Форматирование продолжается. Чистильщик стирает следы 1998 года.
              </div>
            )}
          </div>

          <div>
            <button className="btn-control" onClick={onBack}>
              <ArrowLeft size={14} /> ВЕРНУТЬСЯ НА ОБЩУЮ СХЕМУ
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
