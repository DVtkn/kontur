import React, { useState, useEffect } from 'react';
import { Phone, FileSpreadsheet, AlertTriangle, ShieldAlert, ArrowLeft, Volume2, CheckCircle2, PhoneCall, PhoneOff } from 'lucide-react';
import { ObjectiveBanner } from './ObjectiveBanner';
import { sound } from '../audio/soundEngine';

interface MapApt44Props {
  onComplete: (code: string) => void;
  onBack: () => void;
  alreadySolved: boolean;
  onOpenHints?: () => void;
}

export const MapApt44: React.FC<MapApt44Props> = ({ onComplete, onBack, alreadySolved, onOpenHints }) => {
  const [activeTab, setActiveTab] = useState<'memos' | 'order' | 'phone' | 'regulations'>('memos');
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const [phoneState, setPhoneState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [entityDialogueIndex, setEntityDialogueIndex] = useState<number>(0);
  const [selectedActionCode, setSelectedActionCode] = useState<string>(alreadySolved ? 'QUARANTINE_PERMANENT' : '');
  const [formError, setFormError] = useState<string | null>(null);
  const [solved, setSolved] = useState<boolean>(alreadySolved);
  const [dialedNumber, setDialedNumber] = useState<string>('4409');

  const handleKeypadPress = (digit: string) => {
    sound.playPhoneTone(digit);
    sound.triggerHaptic('tap');
    setDialedNumber((prev) => (prev.length >= 8 ? digit : prev + digit));
  };

  // 10-minute demolition countdown
  useEffect(() => {
    if (solved) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [solved]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Phone call simulation
  const startPhoneCall = () => {
    sound.playRotaryDial();
    sound.triggerHaptic('warning');
    setPhoneState('calling');
    setTimeout(() => {
      sound.playTelephoneRing();
    }, 450);

    setTimeout(() => {
      setPhoneState('connected');
      sound.playGlitch();
      sound.playVoiceTransmission(180, 2.2);
    }, 2400);
  };

  const advancePhoneDialogue = () => {
    sound.playClick();
    sound.triggerHaptic('tap');
    if (entityDialogueIndex < 2) {
      setEntityDialogueIndex((prev) => prev + 1);
      sound.playVoiceTransmission(260 + entityDialogueIndex * 40, 1.8);
    } else {
      setPhoneState('ended');
      sound.playScreamerThud();
    }
  };

  const handleOrderSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playKeypress();

    // Correct option: "КАРАНТИН БЕЗ СРОКА ДАВНОСТИ" (Quarantine indefinite)
    if (selectedActionCode === 'QUARANTINE_PERMANENT') {
      sound.playBreakerTrip();
      sound.playScreamerThud();
      sound.playAlarm(1);
      sound.triggerHaptic('success');
      setSolved(true);
      onComplete('44');
    } else {
      sound.playAlarm(3);
      sound.triggerHaptic('error');
      setFormError('ОШИБКА: НЕДОПУСТИМЫЙ РЕГЛАМЕНТ. СТЕНУ НЕЛЬЗЯ ВСКРЫВАТЬ!');
      setTimeout(() => setFormError(null), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px 40px' }}>
      
      {/* Citycode Objective & Quest Banner */}
      <ObjectiveBanner
        step="ТОМ IV // СПЕЦКОЛЛЕКТОР «КВАРТИРА 44А»"
        title={
          solved
            ? "Контур опечатан. Карантин без срока давности наложен. Код сектора: [ 44 ]"
            : "Изучите замер лазерного луча БТИ, ответьте на звонок начальника и отмените наряд на бурение по Уставу"
        }
        isSolved={solved}
        onOpenHints={onOpenHints || (() => {})}
      />

      {/* Top Status */}
      <div className="terminal-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileSpreadsheet size={20} color="var(--amber)" />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--amber)', fontSize: '14px' }}>
              ДЕЛО № 44-К // СПЕЦКОЛЛЕКТОР «КВАРТИРА 44А» (ПУЛЬТ ИНЖЕНЕРА ГСТК)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              СТАТУС: АВАРИЙНЫЙ НАРЯД НА БУРЕНИЕ №44-Б // УГРОЗА ВСКРЫТИЯ КОНТУРА
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ДО НАЧАЛА БУРЕНИЯ:</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: timeLeft < 120 ? 'var(--red-alarm)' : 'var(--amber)' }}>
            {formatTimer(timeLeft)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          className="btn-control"
          onClick={() => { sound.playClick(); setActiveTab('memos'); }}
          style={{ background: activeTab === 'memos' ? 'var(--amber)' : undefined, color: activeTab === 'memos' ? '#000' : undefined }}
        >
          СЛУЖЕБНЫЕ ЗАПИСКИ (БТИ)
        </button>
        <button
          className="btn-control"
          onClick={() => { sound.playClick(); setActiveTab('regulations'); }}
          style={{ background: activeTab === 'regulations' ? 'var(--amber)' : undefined, color: activeTab === 'regulations' ? '#000' : undefined }}
        >
          УСТАВ И РЕГЛАМЕНТ 1998
        </button>
        <button
          className="btn-control"
          onClick={() => { sound.playClick(); setActiveTab('phone'); }}
          style={{ background: activeTab === 'phone' ? 'var(--amber)' : undefined, color: activeTab === 'phone' ? '#000' : undefined }}
        >
          <Phone size={14} /> ВНУТРЕННИЙ ТЕЛЕФОН НАЧАЛЬНИКА
        </button>
        <button
          className="btn-control btn-danger"
          onClick={() => { sound.playClick(); setActiveTab('order'); }}
          style={{ background: activeTab === 'order' ? 'var(--red-alarm)' : undefined, color: activeTab === 'order' ? '#fff' : undefined }}
        >
          ОТМЕНА НАРЯДА НА БУРЕНИЕ
        </button>
      </div>

      {/* Main Grid */}
      <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        
        {/* Workspace */}
        <div className="terminal-card" style={{ padding: '18px', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
          
          {/* TAB 1: MEMOS & BTI DOCS */}
          {activeTab === 'memos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
                АРХИВ СЛУЖЕБНЫХ ДОКЛАДОВ ПО ОБЪЕКТУ «КВАРТИРА 44А»
              </div>

              <div style={{ background: '#12151b', borderLeft: '4px solid var(--amber)', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 800 }}>СЛУЖЕБНАЯ ЗАПИСКА №14 (Слесарь 4-го разряда Петров А.В.)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.5 }}>
                  «Прошу выдать беруши со свинцовой прокладкой и наряд на двух помощников. При замене фановых труб у глухой кирпичной стены кв. 44а из-за кладки снова доносились голоса моих умерших родственников. Они настойчиво просят одолжить разводной ключ номер 3. Работать в таких условиях отказываюсь».
                </div>
              </div>

              <div style={{ background: '#12151b', borderLeft: '4px solid var(--red-alarm)', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--red-alarm)', fontWeight: 800 }}>АКТ ОБМЕРА ГОРОДСКОГО БТИ (1998 г.)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.5 }}>
                  «Внешний периметр здания по фундаменту: 400 кв.м.<br />
                  Внутренняя глубина замурованной квартиры 44а по лазерному дальномеру: <strong>БЕСКОНЕЧНОСТЬ (луч не вернулся)</strong>.<br />
                  Акустический шум: монотонный лязг колесных пар трамвая и шепот жильцов.<br />
                  Рекомендация комиссии: немедленно залить бетоном марки М500 и опломбировать до особого распоряжения».
                </div>
              </div>

              {/* Laser Rangefinder Visual Blueprint (Cyanotype Architectural Spec) */}
              <div className="cyanotype-blueprint">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div className="blueprint-header-stamp">
                    БТИ СЕВЕРНОГО РАЙОНА // ЧЕРТЕЖ ПОДВАЛА Ж/Д 1974
                  </div>
                  <span style={{ color: 'var(--red-alarm)', fontWeight: 800, fontSize: '11px' }}>СТАТУС: ZERO_RETURN (L = ∞)</span>
                </div>
                <svg width="100%" height="90" viewBox="0 0 400 90">
                  <rect x="10" y="30" width="45" height="30" fill="#1d466e" stroke="#9cd0fc" strokeWidth="1" />
                  <text x="32" y="49" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">БТИ</text>
                  
                  {/* Laser Beam projecting into the void */}
                  <line x1="55" y1="45" x2="390" y2="45" stroke="#ff4136" strokeWidth="2" strokeDasharray="6 3" />
                  <polygon points="385,41 395,45 385,49" fill="#ff4136" />
                  
                  {/* Wall boundary */}
                  <line x1="130" y1="10" x2="130" y2="80" stroke="#ffb422" strokeWidth="3" />
                  <text x="135" y="22" fill="#ffb422" fontSize="9" fontWeight="bold">СТЕНА КВ. 44А</text>
                  
                  {/* Void */}
                  <text x="260" y="65" fill="#ff4136" fontSize="11" fontWeight="bold">НЕВОЗВРАТ ЛУЧА [L = ∞]</text>
                </svg>
              </div>
            </div>
          )}

          {/* TAB 2: REGULATIONS CHARTER */}
          {activeTab === 'regulations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
                ВЫПИСКА ИЗ УСТАВА СЛУЖБЫ СПЕЦКОНТРОЛЯ «ГОРСВЕТТЕХКОНТРОЛЬ»
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <p><strong>Параграф 14.2 (О пространственных аномалиях фундамента):</strong> Любая пустота с нулевым возвратом луча лазерного дальномера подлежит герметизации.</p>
                <p><strong>Параграф 19.8 (Голосовые имитаторы):</strong> При получении телефонных указаний дежурный обязан сверить дату и протокол. Если вызывающий абонент требует «немедленного демонтажа стены» или ссылается на «Норматив 112» — абонент скомпрометирован.</p>
                <p style={{ color: 'var(--green-term)' }}><strong>Единственный легитимный статус:</strong> Для предотвращения прорыва аномалии в наряде необходимо зафиксировать статус: <strong>«КАРАНТИН БЕЗ СРОКА ДАВНОСТИ» (QUARANTINE_PERMANENT)</strong>.</p>
              </div>
            </div>
          )}

          {/* TAB 3: PHONE CALL WITH ENTITY */}
          {activeTab === 'phone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
                ВНУТРЕННЯЯ ТЕЛЕФОННАЯ ЛИНИЯ // НАЧАЛЬНИК УЧАСТКА (КАБ. 101)
              </div>

              {phoneState === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
                    Наберите номер кабинета начальника <strong>44-09</strong> на ведомственном кнопочном аппарате или нажмите кнопку вызова:
                  </p>
                  
                  {/* Push-Button Desk Phone Unit with DTMF Tones */}
                  <div className="telephone-body">
                    <div className="telephone-screen">
                      {dialedNumber || '44-09'}
                    </div>
                    <div className="telephone-grid">
                      {[
                        { num: '1', sub: '.,' },
                        { num: '2', sub: 'АБВ' },
                        { num: '3', sub: 'ГДЕ' },
                        { num: '4', sub: 'ЖЗИ' },
                        { num: '5', sub: 'КЛМ' },
                        { num: '6', sub: 'НОП' },
                        { num: '7', sub: 'РСТ' },
                        { num: '8', sub: 'УФХ' },
                        { num: '9', sub: 'ЦЧШ' },
                        { num: '*', sub: 'ВЗВ' },
                        { num: '0', sub: 'ОПЕР' },
                        { num: '#', sub: 'СБР' },
                      ].map((k) => (
                        <button
                          key={k.num}
                          type="button"
                          className="telephone-key"
                          onClick={() => {
                            if (k.num === '#') {
                              setDialedNumber('');
                              sound.playClick();
                            } else {
                              handleKeypadPress(k.num);
                            }
                          }}
                        >
                          <span>{k.num}</span>
                          <span className="telephone-sub">{k.sub}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-control btn-danger"
                        onClick={startPhoneCall}
                        style={{ flex: 1, padding: '12px', justifyContent: 'center', fontSize: '13px' }}
                      >
                        <PhoneCall size={16} /> ВЫЗВАТЬ КАБ. 101
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {phoneState === 'calling' && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="pulse-alarm" style={{ fontSize: '16px', color: 'var(--amber)', fontWeight: 800 }}>
                    📞 СОЕДИНЕНИЕ... ГУДКИ В ТРУБКЕ...
                  </div>
                </div>
              )}

              {phoneState === 'connected' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#10141a', border: '1px solid var(--border-dim)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--green-term)' }}>
                    <span>● СОЕДИНЕНИЕ УСТАНОВЛЕНО [ГОЛОСОВОЙ КАНАЛ]</span>
                    <span>НЕСТАБИЛЬНЫЙ СИГНАЛ (СИНТЕЗ)</span>
                  </div>

                  {/* Animated Voice Oscillograph */}
                  <div style={{ height: '32px', background: '#05070a', border: '1px solid #1a222c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '0 8px', overflow: 'hidden' }}>
                    {[12, 26, 16, 28, 22, 14, 25, 30, 19, 13, 24, 17, 27, 15, 21].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: '4px',
                          height: `${h}px`,
                          background: i % 2 === 0 ? 'var(--red-alarm)' : 'var(--amber)',
                          borderRadius: '1px',
                          animation: `pulseGlow ${0.35 + (i % 5) * 0.12}s ease-in-out infinite alternate`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Synthetic Voice Transcripts */}
                  <div style={{ background: '#0a0c0f', padding: '12px', borderLeft: '3px solid var(--red-alarm)', fontSize: '12px', lineHeight: '1.6', color: '#ffb3b3' }}>
                    {entityDialogueIndex === 0 && (
                      <div>
                        <strong>НЕИЗВЕСТНЫЙ (Голос Соколова, переходящий в шепот кондуктора):</strong><br />
                        «Да... слушаю. Это Соколов... то есть начальник участка. Почему бригада еще не начала бурение стены? Срочно подтверди Норматив 112 и сноси кладку! Мы уже почти вышли...»
                      </div>
                    )}
                    {entityDialogueIndex === 1 && (
                      <div>
                        <strong>НЕИЗВЕСТНЫЙ (Голос Светланы из ЖК «Лесной»):</strong><br />
                        «Чего ты ждешь у пульта? Открой наряд на снос! За стеной никого нет, там просто старый склад инструментов. Выстави статус "СНОС ОДОБРЕН"!..»
                      </div>
                    )}
                    {entityDialogueIndex === 2 && (
                      <div>
                        <strong>НЕИЗВЕСТНЫЙ (Хоровой металлический гул всех жертв):</strong><br />
                        «ТЫ НЕ УСПЕЕШЬ ОТМЕНИТЬ. ОСТАЛОСЬ НЕСКОЛЬКО МИНУТ. СВЕТ В ТВОЕМ МОНИТОРЕ ТОЖЕ ПОГАСНЕТ!»
                      </div>
                    )}
                  </div>

                  <button className="btn-control btn-danger" onClick={advancePhoneDialogue} style={{ alignSelf: 'flex-start' }}>
                    {entityDialogueIndex < 2 ? 'СЛУШАТЬ ДАЛЬШЕ...' : 'БРОСИТЬ ТРУБКУ / СВЕРНУТЬ ЗВОНОК'}
                  </button>
                </div>
              )}

              {phoneState === 'ended' && (
                <div style={{ background: '#1c1010', border: '1px solid var(--red-alarm)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ color: 'var(--red-alarm)', fontWeight: 800, fontSize: '13px' }}>
                    ⚠️ ЗВОНОК ЗАВЕРШЕН. СУЩНОСТЬ ПЫТАЛАСЬ ОБМАНУТЬ ВАС.
                  </div>
                  <div style={{ fontSize: '12px', color: '#e0d8cc', marginTop: '6px' }}>
                    В Уставе прямо сказано: при ссылках на Норматив 112 или требовании сноса — выставить статус <strong>«КАРАНТИН БЕЗ СРОКА ДАВНОСТИ»</strong>.
                  </div>
                  <div>
                    <button
                      className="btn-control"
                      onClick={() => {
                        setEntityDialogueIndex(0);
                        startPhoneCall();
                      }}
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      <PhoneCall size={13} /> НАБРАТЬ ЗАНОВО
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WORK ORDER CANCELLATION */}
          {activeTab === 'order' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--red-alarm)' }}>
                ЭЛЕКТРОННЫЙ НАРЯД НА БУРЕНИЕ №44-Б
              </div>

              <form onSubmit={handleOrderSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                    ВЫБЕРИТЕ РЕЗОЛЮЦИЮ ДИСПЕТЧЕРА:
                  </label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: solved ? 'default' : 'pointer', fontSize: '12px', opacity: solved ? 0.6 : 1 }}>
                      <input
                        type="radio"
                        name="actionCode"
                        value="DEMOLISH_NOW"
                        disabled={solved}
                        checked={selectedActionCode === 'DEMOLISH_NOW'}
                        onChange={(e) => setSelectedActionCode(e.target.value)}
                      />
                      <span>[НОРМАТИВ 112] Немедленно снести стену подвала (требование голоса из трубки)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: solved ? 'default' : 'pointer', fontSize: '12px', opacity: solved ? 0.6 : 1 }}>
                      <input
                        type="radio"
                        name="actionCode"
                        value="DELAY_24H"
                        disabled={solved}
                        checked={selectedActionCode === 'DELAY_24H'}
                        onChange={(e) => setSelectedActionCode(e.target.value)}
                      />
                      <span>[РЕГЛАМЕНТ 05] Отложить бурение на 24 часа для повторного обмера</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: solved ? 'default' : 'pointer', fontSize: '12px', color: 'var(--green-term)', fontWeight: 700 }}>
                      <input
                        type="radio"
                        name="actionCode"
                        value="QUARANTINE_PERMANENT"
                        disabled={solved}
                        checked={selectedActionCode === 'QUARANTINE_PERMANENT'}
                        onChange={(e) => setSelectedActionCode(e.target.value)}
                      />
                      <span>[ПАРАГРАФ 19.8 УСТАВА] КАРАНТИН БЕЗ СРОКА ДАВНОСТИ. ЗАЛИТЬ БЕТОНОМ М500.</span>
                    </label>
                  </div>
                </div>

                {formError && (
                  <div style={{ color: 'var(--red-alarm)', fontWeight: 800, fontSize: '12px' }}>
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={solved}
                  className="btn-control btn-danger"
                  style={{ padding: '10px 16px', marginTop: '10px' }}
                >
                  {solved ? '✓ РЕЗОЛЮЦИЯ ПРИНЯТА // БУР ЗАБЛОКИРОВАН' : 'ПОДТВЕРДИТЬ РЕЗОЛЮЦИЮ И ЗАБЛОКИРОВАТЬ БУР'}
                </button>
              </form>

              {solved && (
                <div style={{ background: 'rgba(57, 230, 109, 0.1)', border: '1px solid var(--green-term)', padding: '12px' }}>
                  <div style={{ color: 'var(--green-term)', fontWeight: 800, fontSize: '13px' }}>
                    ✓ БУРОВАЯ УСТАНОВКА ЗАГЛУШЕНА. СТЕНА ЗАКОНСЕРВИРОВАНА.
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px' }}>
                    Акустический гул исчез. Наряд отозван. Финальный фрагмент кода: <strong>[ 44 ]</strong>.
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Info Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="terminal-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span className="evidence-tag evidence-classified">ТОМ ДЕЛА №44-К</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
                ЗАКЛЮЧЕНИЕ СПЕЦИАЛЬНОЙ КОМИССИИ
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
              Объект представляет собой подвальную полость, образованную над местом сокрытия трамвайного вагона №314 в монолите фундамента. Наблюдается нарушение физических констант.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-main)' }}>
              <div className="doc-paper" style={{ padding: '8px 12px' }}>
                <strong>ОТЧЕТ ГЕОДЕЗИИ:</strong> Длина луча интерферометра превышает предел измерений. Попытки разрушения кладки приводят к нелинейному расширению аномалии в жилые секции.
              </div>
              <div className="doc-paper" style={{ padding: '8px 12px' }}>
                <strong>ПРОТОКОЛ БЕЗОПАСНОСТИ:</strong> Лица, выходящие на связь по внутренней телефонной линии, подлежат верификации на предмет заражения имитационными речевыми паттернами.
              </div>
            </div>
          </div>

          <div className="terminal-card" style={{ padding: '16px', background: '#0e1115' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              СТАТУС КУПИРОВАНИЯ
            </div>
            {solved ? (
              <div style={{ color: 'var(--green-term)', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> КОД СЕКТОРА: [ 44 ]
              </div>
            ) : (
              <div style={{ color: 'var(--red-alarm)', fontSize: '12px' }}>
                Буровая бригада готовится к разрушению кирпичной кладки.
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
