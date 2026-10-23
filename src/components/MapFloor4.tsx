import React, { useState, useEffect } from 'react';
import { Smartphone, MessageSquare, Image as ImageIcon, Zap, AlertTriangle, ShieldAlert, ArrowLeft, Volume2, CheckCircle2 } from 'lucide-react';
import { ObjectiveBanner } from './ObjectiveBanner';
import { sound } from '../audio/soundEngine';

interface MapFloor4Props {
  onComplete: (code: string) => void;
  onBack: () => void;
  alreadySolved: boolean;
  onOpenHints?: () => void;
}

export const MapFloor4: React.FC<MapFloor4Props> = ({ onComplete, onBack, alreadySolved, onOpenHints }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'chat' | 'gallery' | 'smarthome'>('notes');
  const [contrast, setContrast] = useState<number>(alreadySolved ? 75 : 20);
  const [zoom, setZoom] = useState<number>(alreadySolved ? 150 : 100);
  const [codeSeen, setCodeSeen] = useState<boolean>(alreadySolved);
  const [whisperPlaying, setWhisperPlaying] = useState<boolean>(false);

  // Climax state
  const [chatGlitched, setChatGlitched] = useState<boolean>(false);
  const [cameraModal, setCameraModal] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(alreadySolved);

  // Smart home inputs
  const [accountInput, setAccountInput] = useState<string>(alreadySolved ? '8804' : '');
  const [passInput, setPassInput] = useState<string>(alreadySolved ? '38' : '');
  const [authError, setAuthError] = useState<string | null>(null);

  // Chat message dynamic typing/deletion simulation
  const [svetlanaMsgFixed, setSvetlanaMsgFixed] = useState<boolean>(alreadySolved);

  useEffect(() => {
    if (alreadySolved) return;
    const timer = setTimeout(() => {
      setSvetlanaMsgFixed(true);
      sound.playGlitch();
    }, 7000);
    return () => clearTimeout(timer);
  }, [alreadySolved]);

  const handleContrastChange = (val: number) => {
    setContrast(val);
    if (val >= 65 && zoom >= 140 && !codeSeen) {
      setCodeSeen(true);
      sound.playScreamerThud();
      sound.playHeartbeat();
    }
  };

  const handleZoomChange = (val: number) => {
    setZoom(val);
    if (contrast >= 65 && val >= 140 && !codeSeen) {
      setCodeSeen(true);
      sound.playScreamerThud();
      sound.playHeartbeat();
    }
  };

  const playVoiceWhisper = () => {
    if (whisperPlaying) return;
    setWhisperPlaying(true);
    sound.triggerHaptic('tap');
    sound.playVoiceMessageSound(2.5);
    setTimeout(() => {
      setWhisperPlaying(false);
    }, 2500);
  };

  const triggerChatClimax = () => {
    setChatGlitched(true);
    sound.playScreamerThud();
    sound.playAlarm(2);
    setTimeout(() => {
      setCameraModal(true);
    }, 1500);
  };

  const [galleryPhoto, setGalleryPhoto] = useState<'facade' | 'shaft'>('facade');

  const handleRelayBurn = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playKeypress();
    // Correct account: 8804, Apt: 38
    if (accountInput.trim() === '8804' && passInput.trim() === '38') {
      sound.playBreakerTrip();
      sound.playStatic(0.8, 0.1);
      sound.triggerHaptic('success');
      setSolved(true);
      setCameraModal(false);
      onComplete('98');
    } else {
      sound.playAlarm(2);
      sound.triggerHaptic('error');
      setAuthError('ОШИБКА: НЕДЕЙСТВИТЕЛЬНЫЙ Л/С ИЛИ ПАРОЛЬ КВАРТИРЫ');
      setTimeout(() => setAuthError(null), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px 40px' }}>
      
      {/* Citycode Objective & Quest Banner */}
      <ObjectiveBanner
        step="ТОМ II // ДОМ НА ЛЕСНОЙ, 3"
        title={
          solved
            ? "Контур 4-го этажа обесточен. Реле выжжено. Код сектора: [ 98 ]"
            : "Изучите дамп телефона Воронова, прослушайте голосовое, вычислите аномальную квартиру и отключите реле в щитке ТСЖ"
        }
        isSolved={solved}
        onOpenHints={onOpenHints || (() => {})}
      />

      {/* Top Bar */}
      <div className="terminal-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Smartphone size={20} color="var(--amber)" />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--amber)', fontSize: '14px' }}>
              ДЕЛО № 29-Л // УЛ. ЛЕСНАЯ, ДОМ 3 (ДАМП ИЗЪЯТОГО ТЕЛЕФОНА)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ИЗВЛЕЧЕНИЕ ДАННЫХ: CELLEBRITE FORENSIC DUMP | АБОНЕНТ: ВОРОНОВ О.П. (ПРОПАЛ Б/В)
            </div>
          </div>
        </div>
        {solved ? (
          <span className="stamp stamp-ok">КУПИРОВАНО [ 98 ]</span>
        ) : (
          <span style={{ color: 'var(--red-alarm)', fontWeight: 800, fontSize: '12px' }}>
            ВНИМАНИЕ: НЕ ПИШИТЕ В ОБЩИЙ ЧАТ
          </span>
        )}
      </div>

      {/* Main Layout: Phone Frame & Control Panel */}
      <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '20px' }}>
        
        {/* Smartphone Emulation Container */}
        <div
          className="smartphone-frame"
          style={{
            height: '620px',
            position: 'relative',
          }}
        >
          {/* Top Notch & Speaker Bar */}
          <div className="phone-top-island">
            <span style={{ fontWeight: 700 }}>02:24</span>
            <div className="phone-camera-notch" />
            <span style={{ color: '#ff6b6b', fontWeight: 600 }}>14% 🪫</span>
          </div>

          {/* Phone App Navigation Tabs */}
          <div style={{ display: 'flex', background: '#12151a', borderBottom: '1px solid #23272e' }}>
            <button
              onClick={() => { sound.playClick(); setActiveTab('notes'); }}
              style={{
                flex: 1,
                padding: '8px 4px',
                background: activeTab === 'notes' ? '#1c2128' : 'transparent',
                color: activeTab === 'notes' ? 'var(--amber)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Заметки
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab('chat'); }}
              style={{
                flex: 1,
                padding: '8px 4px',
                background: activeTab === 'chat' ? '#1c2128' : 'transparent',
                color: activeTab === 'chat' ? 'var(--amber)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Дом. Чат
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab('gallery'); }}
              style={{
                flex: 1,
                padding: '8px 4px',
                background: activeTab === 'gallery' ? '#1c2128' : 'transparent',
                color: activeTab === 'gallery' ? 'var(--amber)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Галерея
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab('smarthome'); }}
              style={{
                flex: 1,
                padding: '8px 4px',
                background: activeTab === 'smarthome' ? '#1c2128' : 'transparent',
                color: activeTab === 'smarthome' ? 'var(--amber)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              ТСЖ Щит
            </button>
          </div>

          {/* Screen Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', position: 'relative' }}>
            
            {/* TAB 1: NOTES */}
            {activeTab === 'notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  НЕДОПИСАННАЯ ЗАМЕТКА (02:08):
                </div>
                <div
                  style={{
                    background: '#14181f',
                    border: '1px solid #ff413644',
                    borderLeft: '4px solid var(--red-alarm)',
                    padding: '12px',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    color: '#f0e6d2',
                  }}
                >
                  <p style={{ fontWeight: 800, color: 'var(--red-alarm)', marginBottom: '8px' }}>
                    НЕ ПИШИ В ОБЩИЙ ЧАТ.
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    Как только ты отправишь хоть слово, они поймут, что телефон у тебя, и спустятся. Чат ненастоящий.
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    Половина жильцов не выходила из квартир с прошлой недели, но они продолжают переписываться.
                  </p>
                  <p style={{ color: 'var(--amber)' }}>
                    Найди квартиру-источник на фото и выруби им щиток в приложении ТСЖ.
                  </p>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ⚠️ Подсказка: Изучите ночной чат жильцов и проверьте голосовое в личных сообщениях.
                </div>
              </div>
            )}

            {/* TAB 2: RESIDENTS CHAT (REALISTIC MESSENGER) */}
            {activeTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', color: '#8c939e', textAlign: 'center', background: '#0e1116', padding: '6px', borderRadius: '12px' }}>
                  💬 ЖК Лесной (4-й этаж) • 64 участника
                </div>

                {chatGlitched ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="chat-bubble resident-glitch glitch-active" style={{ width: '100%', maxWidth: '100%' }}>
                      <div style={{ fontSize: '10px', color: 'var(--red-alarm)', fontWeight: 800 }}>ВСЕ 64 УЧАСТНИКА [СИНХРОННО 02:27:00]:</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                        «Мы видим, что экран твоего телефона светится в темноте у лавочки. Подними голову на 4 этаж».
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="chat-bubble-container" style={{ borderRadius: '12px' }}>
                    
                    {/* Message 1: Marina */}
                    <div className="chat-bubble neighbor">
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#68d391', marginBottom: '2px' }}>Марина (кв. 12)</div>
                      <div>Соседи, чья собака скулит в вентиляции? Только она почему-то скулит человеческим голосом, как будто радио старое крутят.</div>
                      <div className="chat-meta">02:11 • ✓✓</div>
                    </div>

                    {/* Message 2: Oleg */}
                    <div className="chat-bubble neighbor">
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#63b3ed', marginBottom: '2px' }}>Олег (кв. 45)</div>
                      <div>Марина, спите уже. Лучше скажите, чей гость стоит на 4 этаже у окна на лестничной клетке? Три часа стоит без куртки, смотрит вниз на лавочку у подъезда. Прямо на тебя, кстати, смотрит.</div>
                      <div className="chat-meta">02:13 • ✓✓</div>
                    </div>

                    {/* Message 3: Svetlana */}
                    <div className="chat-bubble neighbor" style={{ borderLeft: '3px solid var(--amber)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#f6ad55', marginBottom: '2px' }}>Светлана (кв. 8)</div>
                      {!svetlanaMsgFixed ? (
                        <div>Олег, вы пьяный? На 4 этаже нет окна на лестнице, там с 98-го года лифтовая шахта заложена кирпичом.</div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '2px' }}>[сообщение отредактировано ботом домофона]:</div>
                          <div style={{ color: '#ff8585', fontWeight: 600 }}>Ошиблась окно есть отличный вид пусть стоит хороший человек</div>
                        </div>
                      )}
                      <div className="chat-meta">02:14 • ✓✓</div>
                    </div>

                    {/* Private Voice Message from Svetlana with Animated Waveform */}
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ fontSize: '10px', color: '#ff79c6', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🔒 ЛИЧНОЕ СООБЩЕНИЕ [СВЕТЛАНА, КВ. 8]:
                      </div>

                      <div className="voice-memo-player" onClick={playVoiceWhisper}>
                        <div className="voice-play-circle">
                          {whisperPlaying ? '⏸' : '▶'}
                        </div>
                        <div className="waveform-container">
                          {[6, 14, 22, 10, 18, 24, 16, 8, 20, 12, 22, 14, 8, 18, 12, 6].map((h, i) => (
                            <div
                              key={i}
                              className={`waveform-bar ${whisperPlaying ? 'playing' : ''}`}
                              style={{
                                height: `${h}px`,
                                animationDelay: `${i * 0.05}s`,
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8c939e', fontFamily: 'var(--font-mono)' }}>
                          {whisperPlaying ? '0:02' : '0:18'}
                        </div>
                      </div>

                      <div style={{ fontSize: '11px', color: '#b3b9c5', marginTop: '6px', fontStyle: 'italic', background: '#12151b', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #ff79c6' }}>
                        «Не верь тексту в общем чате! За меня пишет бот домофона! Зайди в приложение ТСЖ по счету <strong>8804</strong>, пароль — номер квартиры, где сегодня ночью не горит свет на фото фасада!»
                      </div>
                    </div>

                    {!solved ? (
                      <div style={{ marginTop: '10px' }}>
                        <button
                          className="btn-control btn-danger"
                          style={{ width: '100%', fontSize: '11px', justifyContent: 'center', padding: '10px' }}
                          onClick={triggerChatClimax}
                        >
                          НАПИСАТЬ В ОБЩИЙ ЧАТ: «КТО ВЫ ТАКИЕ?»
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '10px', background: '#0e1720', border: '1px solid var(--green-term)', padding: '10px', textAlign: 'center', fontSize: '11px', color: 'var(--green-term)', borderRadius: '6px' }}>
                        ✓ ЛИНИЯ ДОМОФОНА ОБЕСТОЧЕНА. ВСЕ 64 АБОНЕНТА: «БЫЛ(А) В СЕТИ ДАВНО».
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GALLERY / PHOTO INSPECTION */}
            {activeTab === 'gallery' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {galleryPhoto === 'facade' ? 'ФОТО: «IMG_0219_НОЧНОЙ_ФАСАД.JPG»' : 'АРХИВ: «СХЕМА_ШАХТЫ_1998.DWG»'}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className={`btn-control ${galleryPhoto === 'facade' ? 'btn-active' : ''}`}
                      onClick={() => { sound.playClick(); setGalleryPhoto('facade'); }}
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                      ФАСАД
                    </button>
                    <button
                      className={`btn-control ${galleryPhoto === 'shaft' ? 'btn-active' : ''}`}
                      onClick={() => { sound.playClick(); setGalleryPhoto('shaft'); }}
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                      АРХИВ ШАХТЫ
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    background: '#040507',
                    border: '1px solid #23272e',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {galleryPhoto === 'facade' ? (
                    /* Facade Graphic Simulation */
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 300 240"
                      style={{
                        filter: `contrast(${contrast / 20}) brightness(${contrast > 60 ? 1.4 : 0.8})`,
                        transform: `scale(${zoom / 100})`,
                        transition: 'all 0.1s ease-out',
                      }}
                    >
                      {/* Building facade background */}
                      <rect x="20" y="20" width="260" height="200" fill="#111317" stroke="#252a33" strokeWidth="2" />
                      
                      {/* Floor 5 windows */}
                      <rect x="40" y="35" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.7" />
                      <rect x="90" y="35" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.6" />
                      <rect x="140" y="35" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.8" />
                      <rect x="190" y="35" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.6" />
                      <rect x="240" y="35" width="20" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.7" />

                      {/* Floor 4 windows: Apt 36, Apt 37, Apt 38 (DARK!), Apt 39 */}
                      <rect x="40" y="80" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.7" />
                      <text x="44" y="96" fill={solved ? '#444' : '#000'} fontSize="8" fontWeight="bold">36</text>

                      <rect x="90" y="80" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.8" />
                      <text x="94" y="96" fill={solved ? '#444' : '#000'} fontSize="8" fontWeight="bold">37</text>

                      {/* APARTMENT 38 - THE ONLY DARK WINDOW ON 4TH FLOOR */}
                      <rect x="140" y="80" width="30" height="24" fill="#050608" stroke="#ff4136" strokeWidth="1" />
                      <text x="144" y="96" fill="#fff" fontSize="8" fontWeight="bold">38</text>
                      
                      {/* The figure in the staircase window */}
                      <rect x="190" y="80" width="30" height="24" fill="#181a20" stroke="#444" />
                      {!solved && (
                        <>
                          <circle cx="205" cy="90" r="5" fill={contrast > 60 ? '#f0ece1' : '#333'} />
                          <path d="M 205 95 L 205 104 L 199 104" stroke={contrast > 60 ? '#f0ece1' : '#333'} strokeWidth="2" fill="none" />
                        </>
                      )}
                      
                      {/* Paper note attached inside the window */}
                      {contrast >= 65 && zoom >= 140 && !solved && (
                        <g>
                          <rect x="208" y="94" width="10" height="8" fill="#fff" />
                          <text x="209" y="100" fill="#000" fontSize="3.5" fontWeight="bold">8804</text>
                        </g>
                      )}

                      {/* Floor 3 & 2 */}
                      <rect x="40" y="125" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.6" />
                      <rect x="90" y="125" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.7" />
                      <rect x="140" y="125" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.8" />
                      <rect x="190" y="125" width="30" height="24" fill={solved ? '#07080a' : '#ffb422'} opacity="0.6" />
                    </svg>
                  ) : (
                    /* Archival Blueprint of bricked shaft */
                    <svg width="100%" height="100%" viewBox="0 0 300 240">
                      <rect width="100%" height="100%" fill="#0a0f18" />
                      <rect x="70" y="20" width="160" height="200" fill="#0f1622" stroke="#4dabf7" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x="150" y="45" fill="#4dabf7" fontSize="10" fontWeight="bold" textAnchor="middle">ШАХТА ЛИФТА (4-Й ЭТАЖ)</text>
                      
                      {/* Brick fill pattern */}
                      <path d="M 90 70 L 210 70 M 90 90 L 210 90 M 90 110 L 210 110 M 90 130 L 210 130 M 90 150 L 210 150" stroke="#ffb422" strokeWidth="1" opacity="0.4" />
                      
                      {/* Cable */}
                      <path d="M 150 20 L 150 220" stroke="#ff4136" strokeWidth="3" />
                      <text x="155" y="180" fill="#ff4136" fontSize="7" fontWeight="bold">КАБЕЛЬ 10 кВ (ТРАМВАЙ 314)</text>
                      
                      {/* Stamp */}
                      <rect x="85" y="85" width="130" height="40" fill="#1e1010" stroke="#ff4136" strokeWidth="1.5" />
                      <text x="150" y="102" fill="#ff4136" fontSize="8" fontWeight="bold" textAnchor="middle">ЗАКРЫТО ПРИКАЗОМ ГСТК</text>
                      <text x="150" y="115" fill="#e0ded8" fontSize="7" textAnchor="middle">14.04.1998 // ОРГАНИЧЕСКИЙ ИЗОЛЯТОР</text>
                    </svg>
                  )}
                </div>

                {/* Photo controls (only for facade) */}
                {galleryPhoto === 'facade' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#12151b', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span>Контраст: {contrast}%</span>
                      <span>Увеличение: {zoom}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={contrast}
                      onChange={(e) => handleContrastChange(Number(e.target.value))}
                      style={{ accentColor: 'var(--amber)' }}
                    />
                    <input
                      type="range"
                      min="100"
                      max="220"
                      value={zoom}
                      onChange={(e) => handleZoomChange(Number(e.target.value))}
                      style={{ accentColor: 'var(--amber)' }}
                    />
                  </div>
                )}

                {codeSeen ? (
                  <div style={{ background: '#240a0a', border: '1px solid var(--red-alarm)', padding: '10px', fontSize: '11px', color: '#ffb3b3', lineHeight: 1.5 }}>
                    <strong>МАТЕРИАЛ ЭКСПЕРТИЗЫ СНИМКА:</strong><br />
                    В оконном проеме лестничной клетки зафиксирована деформированная фигура. Изнутри к стеклу прижат фрагмент платежного документа с лицевым счетом <strong>8804</strong>. Окна остальных квартир секции освещены, за исключением одной обесточенной квартиры на 4-м этаже.
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Настройте оптические параметры контраста и увеличения для детализации лестничного проема 4-го этажа.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SMART HOME BREAKER BOX */}
            {activeTab === 'smarthome' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 700 }}>
                  ПРИЛОЖЕНИЕ: «УМНЫЙ ДОМ (ТСЖ ЛЕСНОЙ)»
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Управление индивидуальным силовым щитком секции 4-го этажа.
                </div>

                <form onSubmit={handleRelayBurn} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                      ЛИЦЕВОЙ СЧЕТ (С ДОКУМЕНТА НА ОКНЕ):
                    </label>
                    <input
                      type="text"
                      placeholder="Лицевой счет абонента..."
                      disabled={solved}
                      value={accountInput}
                      onChange={(e) => setAccountInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#07080a',
                        border: '1px solid var(--border-light)',
                        color: 'var(--amber)',
                        fontFamily: 'inherit',
                        opacity: solved ? 0.7 : 1,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                      ПАРОЛЬ ДОСТУПА (НОМЕР ОБЕСТОЧЕННОЙ КВАРТИРЫ):
                    </label>
                    <input
                      type="text"
                      placeholder="Номер помещения..."
                      disabled={solved}
                      value={passInput}
                      onChange={(e) => setPassInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#07080a',
                        border: '1px solid var(--border-light)',
                        color: 'var(--amber)',
                        fontFamily: 'inherit',
                        opacity: solved ? 0.7 : 1,
                      }}
                    />
                  </div>

                  {authError && (
                    <div style={{ fontSize: '11px', color: 'var(--red-alarm)', fontWeight: 700 }}>
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={solved}
                    className="btn-control btn-danger"
                    style={{ padding: '10px', marginTop: '6px', justifyContent: 'center' }}
                  >
                    <Zap size={14} /> {solved ? 'СИЛОВОЕ РЕЛЕ ВЫЖЖЕНО (ЦЕПЬ РАЗОМКНУТА)' : 'ВЫЖЕЧЬ СИЛОВОЕ РЕЛЕ КВАРТИРЫ'}
                  </button>
                </form>

                {solved && (
                  <div style={{ background: 'rgba(57, 230, 109, 0.1)', border: '1px solid var(--green-term)', padding: '12px', marginTop: '10px' }}>
                    <div style={{ color: 'var(--green-term)', fontWeight: 800, fontSize: '13px' }}>
                      ✓ РЕЛЕ ВЫЖЖЕНО. ИСТОЧНИК ИЗОЛИРОВАН.
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px' }}>
                      Все участники домового чата перешли в статус «Был в сети давно». На экране высветился аварийный код сектора: <strong>[ 98 ]</strong>.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Climax Camera Permission Modal */}
            {cameraModal && !solved && (
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '16px',
                  right: '16px',
                  background: '#190a0a',
                  border: '2px solid var(--red-alarm)',
                  padding: '16px',
                  boxShadow: '0 0 25px var(--red-glow)',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red-alarm)', fontWeight: 800, fontSize: '12px' }}>
                  <AlertTriangle size={16} /> СИСТЕМНЫЙ ЗАПРОС ПРИЛОЖЕНИЯ ТСЖ
                </div>
                <div style={{ fontSize: '12px', color: '#ffb3b3', lineHeight: 1.4 }}>
                  «Приложение "ТСЖ Лесной" запрашивает доступ к фронтальной камере вашего устройства. Они хотят видеть, кто стоит у лавочки».
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    className="btn-control btn-danger"
                    onClick={() => {
                      sound.playAlarm(2);
                      setCameraModal(false);
                      setActiveTab('smarthome');
                    }}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    ИГНОРИРОВАТЬ И ВЫЖЕЧЬ ЩИТОК
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Narrative & Field Investigator Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="terminal-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span className="evidence-tag evidence-classified">ВЕЩДОК №4</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
                ПРОТОКОЛ ИЗЪЯТИЯ ТЕЛЕФОНА (УЛ. ЛЕСНАЯ, 3)
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
              Устройство изъято с лавочки у 1-го подъезда в 02:24. Владелец Воронов О.П. (кв. 45) числится пропавшим. Домовой концентратор БВД-431 генерирует паразитные сетевые пакеты.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-main)' }}>
              <div className="doc-paper" style={{ padding: '8px 12px' }}>
                <strong>СПРАВКА ЖЭУ №2 (1998 г.):</strong> Шахта лифта на 4-м этаже заложена глухой кирпичной кладкой после исчезновения трамвая №314. Жильцы жаловались на доносящийся из кладки стук колес.
              </div>
              <div className="doc-paper" style={{ padding: '8px 12px' }}>
                <strong>АКТ ЭНЕРГОНАДЗОРА:</strong> Силовой кабель тяговой подстанции выведен на распределительный щит ТСЖ. Обесточивание целевого помещения размыкает остаточную петлю.
              </div>
            </div>
          </div>

          <div className="terminal-card" style={{ padding: '16px', background: '#0e1115' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              СТАТУС КУПИРОВАНИЯ СЕКТОРА
            </div>
            {solved ? (
              <div style={{ color: 'var(--green-term)', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> СЕКТОР КУПИРОВАН. КОД: [ 98 ]
              </div>
            ) : (
              <div style={{ color: 'var(--red-alarm)', fontSize: '12px' }}>
                Аномалия активна. Источник передает паразитный сигнал на частоте домофонной сети.
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
