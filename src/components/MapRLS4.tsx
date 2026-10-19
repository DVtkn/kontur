import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, AlertTriangle, Eye, Database, Terminal, CheckCircle2, Snowflake, ArrowLeft, Send } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface MapRLS4Props {
  onComplete: (code: string) => void;
  onBack: () => void;
  alreadySolved: boolean;
}

export const MapRLS4: React.FC<MapRLS4Props> = ({ onComplete, onBack, alreadySolved }) => {
  // Tabs: 'cctv' | 'database' | 'power'
  const [activeTab, setActiveTab] = useState<'cctv' | 'database' | 'power'>('cctv');

  // Slider for CCTV IR / Matrix sensitivity (0 - 100)
  const [irSensitivity, setIrSensitivity] = useState<number>(10);
  const [sawEye, setSawEye] = useState<boolean>(false);
  const [codeFoundOnWall, setCodeFoundOnWall] = useState<boolean>(false);

  // Personnel DB
  const [dbSearch, setDbSearch] = useState<string>('');
  const [dbResultFound, setDbResultFound] = useState<boolean>(false);

  // Pager messages
  const [pagerMessages, setPagerMessages] = useState<Array<{ sender: string; text: string; time: string; glitch?: boolean }>>([
    {
      sender: 'Соколов И.В. (Техник)',
      time: '02:14',
      text: 'Эй, кто на пульте? У меня рация фонит. Я спустился к Шлюзу В-2, тут из-за гермодвери глухой стук, будто кто-то лбом бьется. Но я по журналу сегодня один на станции. Глянь по внутренней камере, кого там закрыли?',
    },
  ]);

  // Climax states
  const [climaxStarted, setClimaxStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(40);
  const [lockIntegrity, setLockIntegrity] = useState<number>(100);
  const [freezeCodeInput, setFreezeCodeInput] = useState<string>('');
  const [isFrozen, setIsFrozen] = useState<boolean>(alreadySolved);
  const [freezeError, setFreezeError] = useState<boolean>(false);

  // Play alarm once on entry if not solved
  useEffect(() => {
    if (!alreadySolved) {
      sound.playAlarm(1);
    }
  }, [alreadySolved]);

  // IR slider effect: check thresholds
  const handleIrChange = (val: number) => {
    setIrSensitivity(val);
    if (val >= 45 && !codeFoundOnWall) {
      setCodeFoundOnWall(true);
      sound.playBeep(940, 0.05);
    }
    if (val >= 80 && !sawEye) {
      setSawEye(true);
      sound.playScreamerThud();
      sound.playHeartbeat();
      // Sokolov sends second message
      setTimeout(() => {
        setPagerMessages((prev) => [
          ...prev,
          {
            sender: 'Соколов И.В. (Техник)',
            time: '02:15',
            text: 'Ну что ты молчишь?! Там люди замерзают, я сейчас сорву пломбу и крутану ручной вентиль снаружи!',
          },
        ]);
        sound.playBeep(1400, 0.1);
      }, 1200);
    }
  };

  // Database search
  const handleDbSearch = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playKeypress();
    if (dbSearch.trim() === '714') {
      setDbResultFound(true);
      sound.playScreamerThud();
      sound.playGlitch();

      // Start the 40s Climax countdown!
      if (!climaxStarted && !isFrozen) {
        setClimaxStarted(true);
        setTimeout(() => {
          setPagerMessages((prev) => [
            ...prev,
            {
              sender: 'НЕИЗВЕСТНЫЙ [ВНЕ ШЛЮЗА]',
              time: '02:16',
              glitch: true,
              text: 'ОТКРОЙ. МЫ ХОТИМ ВЫЙТИ НАВЕРХ. ТЫ НЕ УСПЕЕШЬ ЗАБЛОКИРОВАТЬ СЕКТОР.',
            },
          ]);
          sound.playAlarm(3);
        }, 1500);
      }
    } else {
      sound.playAlarm(1);
    }
  };

  // Climax timer loop
  useEffect(() => {
    if (!climaxStarted || isFrozen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto breach failure simulation
          return 0;
        }
        return prev - 1;
      });

      setLockIntegrity((prev) => Math.max(0, prev - 2.5));
    }, 1000);

    return () => clearInterval(timer);
  }, [climaxStarted, isFrozen]);

  // Execute Freeze
  const handleExecuteFreeze = () => {
    sound.playClick();
    if (freezeCodeInput.trim() === '714') {
      setIsFrozen(true);
      sound.playStatic(0.8, 0.08);
      sound.playBeep(600, 0.3);
      onComplete('19');
    } else {
      sound.playAlarm(2);
      setFreezeError(true);
      setTimeout(() => setFreezeError(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Bar with Status and Tabs */}
      <div className="terminal-card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--amber)', letterSpacing: '1px' }}>
              КАРТА 1: ОБЪЕКТ РЛС-4 // ГЕРМОШЛЮЗ В-2
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Статус: {isFrozen ? 'УТЕЧКА КУПИРОВАНА (СЕКТОР ВЫВЕДЕН В КРИО-РЕЖИМ)' : 'КРИТИЧЕСКИЙ СБОЙ ИЗОЛЯЦИИ'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn-control ${activeTab === 'cctv' ? 'btn-active' : ''}`}
              onClick={() => {
                sound.playClick();
                setActiveTab('cctv');
              }}
              style={{ background: activeTab === 'cctv' ? 'var(--amber)' : '', color: activeTab === 'cctv' ? '#000' : '' }}
            >
              <Eye size={14} /> КАМЕРА ШЛЮЗА (144p)
            </button>
            <button
              className={`btn-control ${activeTab === 'database' ? 'btn-active' : ''}`}
              onClick={() => {
                sound.playClick();
                setActiveTab('database');
              }}
              style={{ background: activeTab === 'database' ? 'var(--amber)' : '', color: activeTab === 'database' ? '#000' : '' }}
            >
              <Database size={14} /> БАЗА ПЕРСОНАЛА
            </button>
            <button
              className={`btn-control ${activeTab === 'power' ? 'btn-active' : ''}`}
              onClick={() => {
                sound.playClick();
                setActiveTab('power');
              }}
              style={{ background: activeTab === 'power' ? 'var(--amber)' : '', color: activeTab === 'power' ? '#000' : '' }}
            >
              <Snowflake size={14} /> ЭНЕРГОЩИТ / ЗАМОРОЗКА
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div className="terminal-card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>СТАТУС ГЕРМОДВЕРИ В-2</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--red-alarm)', marginTop: '2px' }}>
            {isFrozen ? 'ЗАЛИТА ЛЬДОМ' : 'ЗАБЛОКИРОВАНА СНАРУЖИ'}
          </div>
        </div>

        <div className="terminal-card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ТЕМПЕРАТУРА В ШЛЮЗЕ</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: isFrozen ? 'var(--blue-tech)' : 'var(--amber)', marginTop: '2px' }}>
            {isFrozen ? '-42°C (КРИО-РЕЖИМ)' : '-6.2°C (НИЖЕ НОРМЫ)'}
          </div>
        </div>

        <div className="terminal-card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ДАТЧИК ПРИСУТСТВИЯ</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--red-alarm)', marginTop: '2px' }}>
            12 ЧЕЛОВЕК (ОБЪЕМ 2x2 м)
          </div>
        </div>

        <div className="terminal-card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ПРОЧНОСТЬ ВНЕШНЕГО ЗАМКА</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: lockIntegrity < 40 ? 'var(--red-alarm)' : 'var(--green-term)', marginTop: '2px' }}>
            {isFrozen ? '100% (ФИКСИРОВАНО)' : `${Math.round(lockIntegrity)}%`}
          </div>
        </div>
      </div>

      {/* Main Content Area: Left panel (Camera/DB/Power) + Right panel (Pager) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
        
        {/* LEFT TAB CONTENT */}
        <div className="terminal-card" style={{ minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
          
          {/* TAB 1: CCTV CAMERA 144p */}
          {activeTab === 'cctv' && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>КАМЕРА: [КАМ-В2-ВНУТР] // 144p 10fps</span>
                <span style={{ fontSize: '11px', color: 'var(--red-alarm)', fontWeight: 'bold' }}>● REC [02:14:48]</span>
              </div>

              {/* 144p Monitor Viewport */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '290px',
                  background: isFrozen ? '#1c2e3d' : '#050607',
                  border: '2px solid var(--border-light)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Scanlines & Noise Texture */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 4px)',
                    zIndex: 5,
                  }}
                />

                {isFrozen ? (
                  // Frozen Screen
                  <div style={{ textAlign: 'center', zIndex: 6, color: '#bce0fd' }}>
                    <Snowflake size={48} className="pulse-alarm" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 800, letterSpacing: '1px' }}>СЕКТОР ЗАМОРОЖЕН. СИГНАЛ ПРЕРВАН.</div>
                    <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>ЛИНЗА ПОКРЫТА КОРКОЙ ЛЬДА. ДВИЖЕНИЕ ОСТАНОВЛЕНО.</div>
                  </div>
                ) : (
                  <>
                    {/* Simulated Darkness & Revealing silhouettes */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: irSensitivity / 100,
                        transition: 'opacity 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Concrete back wall with chalk 714 */}
                      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                        <rect width="100%" height="100%" fill="#1a1c1e" />
                        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#111" strokeWidth="2" />
                        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#111" strokeWidth="2" />
                        
                        {/* Chalk writing on concrete wall */}
                        <text
                          x="50%"
                          y="32%"
                          fill="rgba(255, 255, 255, 0.75)"
                          fontFamily="monospace"
                          fontSize="32"
                          fontWeight="bold"
                          textAnchor="middle"
                          letterSpacing="4"
                          style={{ filter: 'drop-shadow(0 0 4px #fff)' }}
                        >
                          714
                        </text>

                        {/* 11 crowd silhouettes standing shoulder to shoulder facing the wall */}
                        {[70, 95, 120, 145, 175, 205, 235, 265, 290, 315, 340].map((xPos, idx) => (
                          <g key={idx} opacity="0.9">
                            {/* Head/hood */}
                            <circle cx={xPos} cy={165} r={12} fill="#0d0e10" />
                            {/* Winter heavy jacket torso */}
                            <path
                              d={`M ${xPos - 14} 177 Q ${xPos} 172 ${xPos + 14} 177 L ${xPos + 16} 290 L ${xPos - 16} 290 Z`}
                              fill="#0a0b0d"
                            />
                          </g>
                        ))}
                      </svg>
                    </div>

                    {/* Terrifying 12th figure: Bloodshot wide eye inches from the lens when IR > 75 */}
                    {irSensitivity >= 75 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `radial-gradient(circle at center, transparent 35%, rgba(0,0,0,${Math.max(0, 1 - (irSensitivity - 75) / 25)}) 100%)`,
                        }}
                      >
                        <div
                          style={{
                            width: '210px',
                            height: '150px',
                            borderRadius: '50%',
                            background: '#d8cfc4',
                            border: '4px solid #6b1414',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 0 35px rgba(255, 0, 0, 0.6)',
                            transform: `scale(${0.8 + (irSensitivity - 75) / 50})`,
                          }}
                        >
                          {/* Sclera blood vessels */}
                          <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                            <path d="M 10 70 Q 60 65 100 75" stroke="#a31818" strokeWidth="2" fill="none" />
                            <path d="M 190 70 Q 140 80 110 75" stroke="#941414" strokeWidth="2.5" fill="none" />
                            <path d="M 30 30 Q 70 50 100 65" stroke="#821111" strokeWidth="1.5" fill="none" />
                            <path d="M 170 120 Q 130 95 105 85" stroke="#821111" strokeWidth="2" fill="none" />
                          </svg>

                          {/* Iris & Pupil staring dead ahead */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '84px',
                              height: '84px',
                              borderRadius: '50%',
                              background: 'radial-gradient(circle, #080a0c 35%, #423528 75%, #1f1b17 100%)',
                              border: '2px solid #000',
                            }}
                          >
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#000',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            />
                            {/* Glass reflection */}
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#fff',
                                position: 'absolute',
                                top: '22%',
                                left: '26%',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Low Sensitivity Darkness Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: '#000',
                        opacity: Math.max(0, 0.95 - (irSensitivity / 100) * 0.95),
                        pointerEvents: 'none',
                        zIndex: 3,
                      }}
                    />
                  </>
                )}
              </div>

              {/* Slider Controls */}
              <div style={{ marginTop: '16px', background: '#0d0f12', padding: '12px', border: '1px solid var(--border-dim)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--amber)' }}>ЧУВСТВИТЕЛЬНОСТЬ МАТРИЦЫ / ИК-ПОДСВЕТКА:</span>
                  <span style={{ fontWeight: 800, color: '#fff' }}>{irSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={irSensitivity}
                  disabled={isFrozen}
                  onChange={(e) => handleIrChange(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--amber)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  <span>0% (ТЕМНОТА)</span>
                  <span>50% (СИЛУЭТЫ У СТЕНЫ)</span>
                  <span>100% (ФОКУС НА ОБЪЕКТИВЕ)</span>
                </div>
              </div>

              {codeFoundOnWall && !isFrozen && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--amber)' }}>
                  💡 <span style={{ fontWeight: 700 }}>Улика:</span> На бетонной стене за спинами людей мелом выведено число <strong>714</strong>. Проверьте его в Базе персонала!
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONNEL DATABASE */}
          {activeTab === 'database' && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber)', marginBottom: '8px' }}>
                ЕДИНАЯ БАЗА УЧЕТА СОТРУДНИКОВ // ГОРСВЕТТЕХКОНТРОЛЬ
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Введите табельный номер или идентификатор био-браслета для проверки телеметрии сотрудника:
              </p>

              <form onSubmit={handleDbSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Табельный номер (например, 714)..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#090a0d',
                    border: '1px solid var(--border-light)',
                    color: 'var(--amber)',
                    padding: '8px 12px',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                  }}
                />
                <button type="submit" className="btn-control">
                  ЗАПРОСИТЬ ЛОГ
                </button>
              </form>

              {dbResultFound ? (
                <div
                  style={{
                    background: '#0d0f13',
                    border: '1px solid var(--red-alarm)',
                    padding: '16px',
                    boxShadow: '0 0 15px var(--red-glow)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-dim)', paddingBottom: '8px', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>ДОСЬЕ СОТРУДНИКА #714</span>
                    <span className="stamp" style={{ fontSize: '11px' }}>ЛЕТАЛЬНЫЙ СТАТУС</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>ФИО:</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>Соколов Игорь Владимирович</span>

                    <span style={{ color: 'var(--text-dim)' }}>Должность:</span>
                    <span>Дежурный электромеханик станции</span>

                    <span style={{ color: 'var(--text-dim)' }}>Пульс (браслет):</span>
                    <span style={{ color: 'var(--red-alarm)', fontWeight: 800 }}>0 уд/мин (ОСТАНОВКА 45 МИН НАЗАД)</span>

                    <span style={{ color: 'var(--text-dim)' }}>Локация браслета:</span>
                    <span style={{ color: 'var(--red-alarm)', fontWeight: 800 }}>ВНУТРИ ШЛЮЗА В-2 (У ЛИНЗЫ КАМЕРЫ)</span>
                  </div>

                  <div style={{ marginTop: '14px', background: 'rgba(255, 65, 54, 0.12)', padding: '10px', borderLeft: '3px solid var(--red-alarm)', fontSize: '12px', color: '#ffbaba' }}>
                    ⚠️ <strong>ВЫВОД ОПЕРАТОРА:</strong> Настоящий Соколов мертв и находится внутри шлюза (12-е тело у камеры). Существо, пишущее в пейджер снаружи — это мимикрирующая аномалия, которая пытается обманом заставить дежурного открыть дверь!
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: '12px' }}>
                  Для поиска введите номер, найденный на камере наблюдения (мел на стене).
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POWER / FREEZE GRID */}
          {activeTab === 'power' && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber)', marginBottom: '8px' }}>
                СИСТЕМА ЭКСТРЕННОЙ ЗАМОРОЗКИ СЕКТОРА В-2
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                В случае нарушения биологической изоляции разрешается подать жидкий азот в контур шлюза. Требуется подтверждение табельным номером ответственного дежурного.
              </p>

              {isFrozen ? (
                <div style={{ background: '#0e1720', border: '1px solid var(--green-term)', padding: '20px', textAlign: 'center' }}>
                  <CheckCircle2 size={36} color="var(--green-term)" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--green-term)' }}>
                    УТЕЧКА КУПИРОВАНА // ШЛЮЗ В-2 ПОЛНОСТЬЮ ОБЕЗВРЕЖЕН
                  </div>
                  <div style={{ fontSize: '13px', color: '#fff', marginTop: '10px' }}>
                    СИСТЕМНЫЙ КОД СЕКТОРА: <strong style={{ fontSize: '18px', color: 'var(--amber)' }}>[ 19 ]</strong>
                  </div>
                  <button
                    className="btn-control"
                    onClick={onBack}
                    style={{ marginTop: '16px' }}
                  >
                    ВЕРНУТЬСЯ НА КАРТУ ГОРОДА
                  </button>
                </div>
              ) : (
                <div style={{ background: '#0d0f12', border: '1px solid var(--border-light)', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--red-alarm)', fontWeight: 800, marginBottom: '8px' }}>
                    ВНИМАНИЕ: ПЕРЕКЛЮЧЕНИЕ ПИТАНИЯ С ДВЕРИ НА ХЛАДАГЕНТ
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      ТАБЕЛЬНЫЙ КОД ПОДТВЕРЖДЕНИЯ (СО СТЕНЫ):
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Код (например, 714)"
                      value={freezeCodeInput}
                      onChange={(e) => setFreezeCodeInput(e.target.value)}
                      style={{
                        background: '#07080a',
                        border: freezeError ? '1px solid var(--red-alarm)' : '1px solid var(--border-light)',
                        color: 'var(--amber)',
                        padding: '8px',
                        fontSize: '16px',
                        fontWeight: 700,
                        textAlign: 'center',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      className="btn-control btn-danger"
                      onClick={handleExecuteFreeze}
                      style={{ padding: '10px', justifyContent: 'center' }}
                    >
                      <Snowflake size={16} /> АКТИВИРОВАТЬ ЭКСТРЕННУЮ ЗАМОРОЗКУ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: INTERNAL PAGER */}
        <div className="terminal-card" style={{ display: 'flex', flexDirection: 'column', height: '440px' }}>
          <div className="terminal-header">
            <span>ВНУТРЕННИЙ ПЕЙДЖЕР РЛС-4</span>
            <span style={{ color: climaxStarted && !isFrozen ? 'var(--red-alarm)' : 'var(--green-term)' }}>
              {climaxStarted && !isFrozen ? `ТРЕВОГА // ${timeLeft}с` : 'КАНАЛ ОТКРЫТ'}
            </span>
          </div>

          {/* Climax Alert Banner */}
          {climaxStarted && !isFrozen && (
            <div style={{ background: 'var(--red-alarm)', color: '#fff', padding: '6px 12px', fontSize: '11px', fontWeight: 800, textAlign: 'center', animation: 'flicker 0.4s infinite' }}>
              ⚠️ СУЩЕСТВО ЛОМАЕТ ВНЕШНИЙ ЗАМОК ШЛЮЗА! ОСТАЛОСЬ: {timeLeft} сек!
            </div>
          )}

          {/* Messages Feed */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pagerMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  background: msg.glitch ? '#240a0a' : '#14171b',
                  border: msg.glitch ? '1px solid var(--red-alarm)' : '1px solid var(--border-dim)',
                  padding: '8px 10px',
                  borderRadius: '2px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: msg.glitch ? 'var(--red-alarm)' : 'var(--amber)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800 }}>{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <div style={{ fontSize: '12px', color: msg.glitch ? '#ffb3b3' : 'var(--text-main)', lineHeight: 1.4, fontWeight: msg.glitch ? 700 : 400 }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom helper action */}
          <div style={{ padding: '10px', background: '#0a0c0f', borderTop: '1px solid var(--border-dim)' }}>
            {!climaxStarted ? (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Изучите камеру и пробейте номер со стены в базе данных.
              </div>
            ) : (
              <button
                className="btn-control btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  sound.playClick();
                  setActiveTab('power');
                }}
              >
                <Snowflake size={14} /> ПЕРЕЙТИ К ЗАМОРОЗКЕ (КОД 714)
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Back button */}
      <div>
        <button
          className="btn-control"
          onClick={onBack}
        >
          <ArrowLeft size={14} /> ВЕРНУТЬСЯ НА ОБЩУЮ СХЕМУ
        </button>
      </div>

    </div>
  );
};
