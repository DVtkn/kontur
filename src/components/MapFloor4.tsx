import React, { useState, useEffect } from 'react';
import { Smartphone, MessageSquare, Image as ImageIcon, Zap, AlertTriangle, ShieldAlert, ArrowLeft, Volume2, CheckCircle2 } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface MapFloor4Props {
  onComplete: (code: string) => void;
  onBack: () => void;
  alreadySolved: boolean;
}

export const MapFloor4: React.FC<MapFloor4Props> = ({ onComplete, onBack, alreadySolved }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'chat' | 'gallery' | 'smarthome'>('notes');
  const [contrast, setContrast] = useState<number>(20);
  const [zoom, setZoom] = useState<number>(100);
  const [codeSeen, setCodeSeen] = useState<boolean>(false);
  const [whisperPlaying, setWhisperPlaying] = useState<boolean>(false);

  // Climax state
  const [chatGlitched, setChatGlitched] = useState<boolean>(false);
  const [cameraModal, setCameraModal] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(alreadySolved);

  // Smart home inputs
  const [accountInput, setAccountInput] = useState<string>('');
  const [passInput, setPassInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Chat message dynamic typing/deletion simulation
  const [svetlanaMsgFixed, setSvetlanaMsgFixed] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSvetlanaMsgFixed(true);
      sound.playGlitch();
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

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
    sound.playVoiceTransmission(220, 2.5);
    setTimeout(() => {
      setWhisperPlaying(false);
    }, 2800);
  };

  const triggerChatClimax = () => {
    setChatGlitched(true);
    sound.playScreamerThud();
    sound.playAlarm(2);
    setTimeout(() => {
      setCameraModal(true);
    }, 1500);
  };

  const handleRelayBurn = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playKeypress();
    // Correct account: 8804, Apt: 38
    if (accountInput.trim() === '8804' && passInput.trim() === '38') {
      sound.playScreamerThud();
      sound.playStatic(1.2, 0.15);
      setSolved(true);
      setCameraModal(false);
      onComplete('98');
    } else {
      sound.playAlarm(2);
      setAuthError('ОШИБКА: НЕДЕЙСТВИТЕЛЬНЫЙ Л/С ИЛИ ПАРОЛЬ КВАРТИРЫ');
      setTimeout(() => setAuthError(null), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px 40px' }}>
      
      {/* Top Bar */}
      <div className="terminal-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Smartphone size={20} color="var(--amber)" />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--amber)', fontSize: '14px' }}>
              КАРТА 2: 4-Й ЭТАЖ // ЖК «ЛЕСНОЙ», ДОМ 3
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              УСТРОЙСТВО: НАЙДЕННЫЙ СМАРТФОН | СЕТЬ: «LESNOY_GUEST_OPEN»
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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '20px' }}>
        
        {/* Smartphone Emulation Container */}
        <div
          className="terminal-card"
          style={{
            border: '2px solid #2d333b',
            borderRadius: '16px',
            background: '#0a0c0e',
            display: 'flex',
            flexDirection: 'column',
            height: '620px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          }}
        >
          {/* Phone Status Bar */}
          <div style={{ padding: '8px 16px', background: '#07080a', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '1px solid #1c2025' }}>
            <span>02:24</span>
            <span>LTE 4G | 14% 🪫</span>
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

            {/* TAB 2: RESIDENTS CHAT */}
            {activeTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', borderBottom: '1px solid #1c2025', paddingBottom: '6px' }}>
                  ЖК Лесной (64 участника)
                </div>

                {chatGlitched ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ background: '#2e0a0a', border: '1px solid var(--red-alarm)', padding: '10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--red-alarm)', fontWeight: 800 }}>ВСЕ 64 УЧАСТНИКА [ОДНОВРЕМЕННО 02:27:00]:</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                        «Мы видим, что экран телефона светится в темноте у лавочки. Подними голову на 4 этаж».
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ background: '#161a20', padding: '8px 10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#68d391' }}>Марина (кв. 12)</div>
                      <div style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text-main)' }}>
                        Соседи, чья собака скулит в вентиляции? Только она почему-то скулит человеческим голосом, как будто радио старое крутят.
                      </div>
                    </div>

                    <div style={{ background: '#161a20', padding: '8px 10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#63b3ed' }}>Олег (кв. 45)</div>
                      <div style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text-main)' }}>
                        Марина, спите уже. Лучше скажите, чей гость стоит на 4 этаже у окна на лестничной клетке? Три часа стоит без куртки, смотрит вниз на лавочку у подъезда. Прямо на тебя, кстати, смотрит.
                      </div>
                    </div>

                    <div style={{ background: '#161a20', padding: '8px 10px', borderRadius: '4px', borderLeft: '3px solid var(--amber)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#f6ad55' }}>Светлана (кв. 8)</div>
                      {!svetlanaMsgFixed ? (
                        <div style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text-main)' }}>
                          Олег, вы пьяный? На 4 этаже нет окна на лестнице, там с 98-го года лифтовая шахта заложена кирпичом.
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontStyle: 'italic' }}>[сообщение удалено и изменено]:</span>
                          <div style={{ fontSize: '12px', marginTop: '2px', color: '#fc8181', fontWeight: 600 }}>
                            Ошиблась окно есть отличный вид пусть стоит хороший человек
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Private Voice Message from Svetlana */}
                    <div style={{ marginTop: '10px', padding: '10px', background: '#1f1622', border: '1px solid #702459', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', color: '#d53f8c', fontWeight: 700, marginBottom: '6px' }}>
                        🔒 ЛИЧНОЕ СООБЩЕНИЕ (Светлана, кв. 8):
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn-control"
                          onClick={playVoiceWhisper}
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          <Volume2 size={14} />
                          {whisperPlaying ? 'ШЕПОТ ИЗ ВАННОЙ...' : 'ПРОСЛУШАТЬ ГОЛОСОВОЕ (3 СЕК)'}
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                        «Не верь тексту в чате, за меня пишет бот домофона! Зайди в приложение ТСЖ по счету 8804, пароль — номер квартиры, где сегодня ночью не горит свет на фото фасада!»
                      </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <button
                        className="btn-control btn-danger"
                        style={{ width: '100%', fontSize: '11px', justifyContent: 'center' }}
                        onClick={triggerChatClimax}
                      >
                        НАПИСАТЬ В ОБЩИЙ ЧАТ: «КТО ВЫ ТАКИЕ?»
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 3: GALLERY / PHOTO INSPECTION */}
            {activeTab === 'gallery' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ФОТО: «IMG_0219_НОЧНОЙ_ФАСАД.JPG» (Олег, кв. 45)
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
                  {/* Facade Graphic Simulation */}
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
                    
                    {/* Floor 5 windows (all lit) */}
                    <rect x="40" y="35" width="30" height="24" fill="#ffb422" opacity="0.7" />
                    <rect x="90" y="35" width="30" height="24" fill="#ffb422" opacity="0.6" />
                    <rect x="140" y="35" width="30" height="24" fill="#ffb422" opacity="0.8" />
                    <rect x="190" y="35" width="30" height="24" fill="#ffb422" opacity="0.6" />
                    <rect x="240" y="35" width="20" height="24" fill="#ffb422" opacity="0.7" />

                    {/* Floor 4 windows: Apt 36 (lit), Apt 37 (lit), Apt 38 (DARK!), Apt 39 (lit) */}
                    <rect x="40" y="80" width="30" height="24" fill="#ffb422" opacity="0.7" />
                    <text x="44" y="96" fill="#000" fontSize="8" fontWeight="bold">36</text>

                    <rect x="90" y="80" width="30" height="24" fill="#ffb422" opacity="0.8" />
                    <text x="94" y="96" fill="#000" fontSize="8" fontWeight="bold">37</text>

                    {/* APARTMENT 38 - THE ONLY DARK WINDOW ON 4TH FLOOR */}
                    <rect x="140" y="80" width="30" height="24" fill="#050608" stroke="#ff4136" strokeWidth="1" />
                    <text x="144" y="96" fill="#fff" fontSize="8" fontWeight="bold">38</text>
                    
                    {/* The figure in the staircase window */}
                    <rect x="190" y="80" width="30" height="24" fill="#181a20" stroke="#444" />
                    <circle cx="205" cy="90" r="5" fill={contrast > 60 ? '#f0ece1' : '#333'} />
                    <path d="M 205 95 L 205 104 L 199 104" stroke={contrast > 60 ? '#f0ece1' : '#333'} strokeWidth="2" fill="none" />
                    
                    {/* Paper note attached inside the window */}
                    {contrast >= 65 && zoom >= 140 && (
                      <g>
                        <rect x="208" y="94" width="10" height="8" fill="#fff" />
                        <text x="209" y="100" fill="#000" fontSize="3.5" fontWeight="bold">8804</text>
                      </g>
                    )}

                    {/* Floor 3 & 2 */}
                    <rect x="40" y="125" width="30" height="24" fill="#ffb422" opacity="0.6" />
                    <rect x="90" y="125" width="30" height="24" fill="#ffb422" opacity="0.7" />
                    <rect x="140" y="125" width="30" height="24" fill="#ffb422" opacity="0.8" />
                    <rect x="190" y="125" width="30" height="24" fill="#ffb422" opacity="0.6" />
                  </svg>
                </div>

                {/* Photo controls */}
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

                {codeSeen ? (
                  <div style={{ background: '#240a0a', border: '1px solid var(--red-alarm)', padding: '8px', fontSize: '11px', color: '#ffb3b3' }}>
                    👁️ Вы выкрутили контраст: за стеклом стоит неестественно вывернутый манекен. К стеклу прижат лист с номером Л/С: <strong>8804</strong>! Единственная темная квартира на 4 этаже: <strong>38</strong>.
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Выкрутите ползунки контраста и увеличения, чтобы рассмотреть окно 4-го этажа.
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
                      ЛИЦЕВОЙ СЧЕТ (С ЛИСТКА НА ОКНЕ):
                    </label>
                    <input
                      type="text"
                      placeholder="Например: 8804"
                      value={accountInput}
                      onChange={(e) => setAccountInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#07080a',
                        border: '1px solid var(--border-light)',
                        color: 'var(--amber)',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                      ПАРОЛЬ ДОСТУПА (ТЕМНАЯ КВАРТИРА НА 4 ЭТАЖЕ):
                    </label>
                    <input
                      type="text"
                      placeholder="Номер квартиры (38)"
                      value={passInput}
                      onChange={(e) => setPassInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#07080a',
                        border: '1px solid var(--border-light)',
                        color: 'var(--amber)',
                        fontFamily: 'inherit',
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
                    className="btn-control btn-danger"
                    style={{ padding: '10px', marginTop: '6px', justifyContent: 'center' }}
                  >
                    <Zap size={14} /> ВЫЖЕЧЬ СИЛОВОЕ РЕЛЕ КВАРТИРЫ
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
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)', marginBottom: '8px' }}>
              СПРАВКА ДИСПЕТЧЕРА: АНОМАЛИЯ «4-Й ЭТАЖ»
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
              Жилой комплекс «Лесной», дом 3. В 1998 году шахта лифта на 4 этаже была заложена кирпичом после несчастного случая с исчезновением вагона трамвая №314. Домовой чат генерируется замкнутой сущностью домофонного концентратора.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-main)' }}>
              <div>• <strong>Шаг 1:</strong> Прочитайте заметки и откройте чат жильцов.</div>
              <div>• <strong>Шаг 2:</strong> Послушайте голосовое от Светланы (кв. 8).</div>
              <div>• <strong>Шаг 3:</strong> Откройте ночное фото фасада, настройте контраст и найдите лицевой счет (8804).</div>
              <div>• <strong>Шаг 4:</strong> Посчитайте окна: найдите темную квартиру на 4 этаже (38).</div>
              <div>• <strong>Шаг 5:</strong> Зайдите в «ТСЖ Щит», введите 8804 / 38 и выжгите реле.</div>
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
