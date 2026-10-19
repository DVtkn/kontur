import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, PhoneCall, PhoneOff, FileText, CheckCircle2, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface MapApt44Props {
  onComplete: (code: string) => void;
  onBack: () => void;
  alreadySolved: boolean;
}

export const MapApt44: React.FC<MapApt44Props> = ({ onComplete, onBack, alreadySolved }) => {
  // Tabs: 'memos' | 'phone' | 'charter' | 'order'
  const [activeTab, setActiveTab] = useState<'memos' | 'phone' | 'charter' | 'order'>('memos');

  // 10-minute countdown timer (600s)
  const [timeLeft, setTimeLeft] = useState<number>(540); // 9:00 for good pacing
  const [isCanceled, setIsCanceled] = useState<boolean>(alreadySolved);

  // Phone Call state
  const [phoneState, setPhoneState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [dialogueStep, setDialogueStep] = useState<number>(0);
  const [entityBusted, setEntityBusted] = useState<boolean>(false);

  // Work order revocation form
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [seal1, setSeal1] = useState<boolean>(false);
  const [seal2, setSeal2] = useState<boolean>(false);
  const [seal3, setSeal3] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<boolean>(false);

  // Timer loop
  useEffect(() => {
    if (isCanceled) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCanceled]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start phone call
  const startCall = () => {
    sound.playClick();
    setPhoneState('calling');
    sound.playBeep(425, 0.4);

    setTimeout(() => {
      setPhoneState('connected');
      setDialogueStep(1);
      sound.playVoiceTransmission(260, 4);
    }, 2500);
  };

  const endCall = () => {
    sound.playClick();
    setPhoneState('ended');
  };

  // Handle dialogue choices
  const handleDialogueChoice = (choice: 'catch_lie' | 'agree_demolition' | 'cite_charter') => {
    sound.playKeypress();
    if (choice === 'catch_lie' || choice === 'cite_charter') {
      setEntityBusted(true);
      sound.playScreamerThud();
      sound.playGlitch();
      setDialogueStep(3); // Entity screams and voice breaks down
    } else {
      sound.playAlarm(2);
      setDialogueStep(2); // Entity manipulates
    }
  };

  // Revocation submission
  const handleRevokeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    if (selectedReason === 'quarantine' && seal1 && seal2 && seal3) {
      sound.playScreamerThud();
      sound.startTransformerHum(0.08);
      setIsCanceled(true);
      onComplete('44');
    } else {
      sound.playAlarm(2);
      setOrderError(true);
      setTimeout(() => setOrderError(false), 2500);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Status Bar with 10-minute countdown */}
      <div className="terminal-card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--amber)', letterSpacing: '1px' }}>
              КАРТА 4: КВАРТИРА 44А // ПУЛЬТ ГЛАВНОГО ИНЖЕНЕРА
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Бюрократический оккультизм. Наряд №44-Б на снос перегородки подвала жилого дома.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#080a0d', border: '1px solid var(--border-light)', padding: '6px 14px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ДО СНОСА СТЕНЫ:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: isCanceled ? 'var(--green-term)' : 'var(--red-alarm)', letterSpacing: '2px' }}>
                {isCanceled ? 'ОТМЕНЕНО' : formatTimer(timeLeft)}
              </div>
            </div>

            <button className="btn-control" onClick={onBack}>
              <ArrowLeft size={14} /> НА КАРТУ ГОРОДА
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn-control"
          onClick={() => {
            sound.playClick();
            setActiveTab('memos');
          }}
          style={{ background: activeTab === 'memos' ? 'var(--amber)' : '', color: activeTab === 'memos' ? '#000' : '' }}
        >
          <FileText size={14} /> СЛУЖЕБНЫЕ ЗАПИСКИ (СЗ)
        </button>

        <button
          className="btn-control"
          onClick={() => {
            sound.playClick();
            setActiveTab('charter');
          }}
          style={{ background: activeTab === 'charter' ? 'var(--amber)' : '', color: activeTab === 'charter' ? '#000' : '' }}
        >
          <FileText size={14} /> УСТАВ ГСТК (1998)
        </button>

        <button
          className="btn-control"
          onClick={() => {
            sound.playClick();
            setActiveTab('phone');
          }}
          style={{ background: activeTab === 'phone' ? 'var(--amber)' : '', color: activeTab === 'phone' ? '#000' : '' }}
        >
          <Phone size={14} /> ВНУТРЕННИЙ ТЕЛЕФОН
        </button>

        <button
          className="btn-control"
          onClick={() => {
            sound.playClick();
            setActiveTab('order');
          }}
          style={{ background: activeTab === 'order' ? 'var(--amber)' : '', color: activeTab === 'order' ? '#000' : '' }}
        >
          <ShieldAlert size={14} /> ОТМЕНА НАРЯДА НА БУРЕНИЕ
        </button>
      </div>

      {/* Main Work Area */}
      <div className="terminal-card" style={{ minHeight: '480px', padding: '20px' }}>
        
        {/* TAB 1: MEMOS & BTI SURVEY ACT */}
        {activeTab === 'memos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
              АРХИВ СЛУЖЕБНЫХ ЗАПИСОК И АКТОВ ОБМЕРА
            </div>

            {/* Memo 1 */}
            <div style={{ background: '#121519', borderLeft: '4px solid var(--amber)', padding: '14px', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--amber)', fontWeight: 800, marginBottom: '6px' }}>
                <span>СЛУЖЕБНАЯ ЗАПИСКА №14 // СЛЕСАРЬ ПЕТРОВ В.К.</span>
                <span>08.04.1998 г.</span>
              </div>
              <div style={{ fontSize: '12px', color: '#e0e4ea', lineHeight: 1.6 }}>
                «Прошу выдать беруши со свинцовой прокладкой. При замене труб отопления у стены подвала (кв. 44а) из-за кирпичной кладки снова доносились голоса моих умерших родственников. Они настойчиво просят одолжить разводной ключ на 24. Работать в таких условиях невозможно. Прошу забетонировать периметр».
              </div>
            </div>

            {/* Memo 2 */}
            <div style={{ background: '#121519', borderLeft: '4px solid var(--red-alarm)', padding: '14px', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--red-alarm)', fontWeight: 800, marginBottom: '6px' }}>
                <span>АКТ ИНСТРУМЕНТАЛЬНОГО ОБМЕРА БТИ // ЗДАНИЕ ПО УЛ. ЛЕСНОЙ, 3</span>
                <span>СЕКРЕТНО</span>
              </div>
              <div style={{ fontSize: '12px', color: '#e0e4ea', lineHeight: 1.6 }}>
                «Внешний периметр пятиэтажного жилого дома: 400 кв.м.<br />
                Внутренняя расчетная площадь подвального помещения кв. 44а по лазерному дальномеру: <strong>БЕСКОНЕЧНОСТЬ (луч не вернулся)</strong>.<br />
                Рекомендация инженерной комиссии: глухая консервация бетоном марки М500. Механическое бурение категорически воспрещено».
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button
                className="btn-control"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('charter');
                }}
              >
                СВЕРИТЬ С УСТАВОМ СЛУЖБЫ ГСТК →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CHARTER 1998 */}
        {activeTab === 'charter' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
              РЕГЛАМЕНТ БЕЗОПАСНОСТИ «ГОРСВЕТТЕХКОНТРОЛЬ» (РЕДАКЦИЯ 1998 ГОДА)
            </div>

            <div style={{ background: '#0e1115', border: '1px solid var(--border-light)', padding: '14px', fontSize: '12px', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 800, color: 'var(--amber)', marginBottom: '4px' }}>
                ПАРАГРАФ 9-Б: ТОЧКИ АКУСТИЧЕСКОГО РЕЗОНАНСА И СТЕНЫ-ИЗОЛЯТОРЫ
              </div>
              <p style={{ marginBottom: '8px' }}>
                1. Любые работы по механическому бурению, штроблению или демонтажу перегородок, внутри которых фиксируется эхолокационный провал (бесконечный луч), являются чрезвычайным происшествием высшей категории.
              </p>
              <p style={{ marginBottom: '8px' }}>
                2. Персоналу запрещается доверять телефонным согласованиям, если собеседник путает дату исходной аварии (<strong>1998 год</strong>) или не может назвать точный пункт инструкции.
              </p>
              <p>
                3. Единственно законное бюрократическое основание для полной остановки автоматических буровых установок: отметка в наряде <strong>«КАРАНТИН БЕЗ СРОКА ДАВНОСТИ»</strong> с подтверждением трех дежурных печатей.
              </p>
            </div>

            <div>
              <button
                className="btn-control"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('phone');
                }}
              >
                ПОЗВОНИТЬ НАЧАЛЬНИКУ УЧАСТКА ПО ВНУТРЕННЕЙ ЛИНИИ →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PHONE CALL & SPECTROGRAM */}
        {activeTab === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
              ВНУТРЕННИЙ ТЕЛЕФОН ДИСПЕТЧЕРА // ЛИНИЯ #44
            </div>

            {phoneState === 'idle' && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#0b0d10', border: '1px solid var(--border-light)' }}>
                <Phone size={36} color="var(--amber)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                  ЛИНИЯ НАЧАЛЬНИКА УЧАСТКА ГОТОВА
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 18px' }}>
                  Для отмены автоматического бурения требуется устное согласование. Наберите начальника.
                </div>
                <button className="btn-control" onClick={startCall} style={{ padding: '10px 24px' }}>
                  <PhoneCall size={16} /> ВЫЗВАТЬ НАЧАЛЬНИКА УЧАСТКА
                </button>
              </div>
            )}

            {phoneState === 'calling' && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#0b0d10' }}>
                <div style={{ fontSize: '14px', color: 'var(--amber)', letterSpacing: '1px' }} className="pulse-alarm">
                  ИДЕТ ДОЗВОН... ДЛИННЫЕ ГУДКИ
                </div>
              </div>
            )}

            {phoneState === 'connected' && (
              <div style={{ background: '#0e1116', border: '1px solid var(--amber)', padding: '16px' }}>
                
                {/* Spectrogram visualization */}
                <div style={{ height: '70px', background: '#050709', border: '1px solid #23272e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '14px', overflow: 'hidden' }}>
                  {[18, 42, 60, 25, 80, 95, 30, 45, 70, 85, 34, 90, 65, 40, 20, 50, 75, 92, 38].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '8px',
                        height: `${h}%`,
                        background: entityBusted ? 'var(--red-alarm)' : 'var(--amber)',
                        borderRadius: '1px',
                        transition: 'height 0.1s ease',
                      }}
                    />
                  ))}
                </div>

                {dialogueStep === 1 && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 800, marginBottom: '6px' }}>
                      СОБЕСЕДНИК (СИНТЕЗИРОВАННЫЙ СКЛЕЕННЫЙ ГОЛОС):
                    </div>
                    <div style={{ fontSize: '13px', color: '#ffcfcf', fontStyle: 'italic', lineHeight: 1.6, background: '#170c0c', padding: '12px', borderLeft: '3px solid var(--red-alarm)', marginBottom: '16px' }}>
                      «Начальник участка слушает... Да, по кв. 44а... Мы все проверили. Авария <strong>2004 года</strong> ликвидирована. Подтверди наряд на бурение, не сомневайся... Никаких аномалий за кирпичом нет, просто старый кабель...»
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>ВЫБЕРИТЕ ОТВЕТ ДИСПЕТЧЕРА:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        className="btn-control"
                        onClick={() => handleDialogueChoice('catch_lie')}
                        style={{ textAlign: 'left', padding: '8px 12px' }}
                      >
                        1. «В архиве указана авария 1998 года, а не 2004. Кто говорит в трубку?!»
                      </button>
                      <button
                        className="btn-control"
                        onClick={() => handleDialogueChoice('cite_charter')}
                        style={{ textAlign: 'left', padding: '8px 12px' }}
                      >
                        2. «Параграф 9-Б Устава строго запрещает бурение при бесконечном луче!»
                      </button>
                      <button
                        className="btn-control btn-danger"
                        onClick={() => handleDialogueChoice('agree_demolition')}
                        style={{ textAlign: 'left', padding: '8px 12px' }}
                      >
                        3. «Хорошо, подтверждаю наряд на снос стены» (ОШИБКА)
                      </button>
                    </div>
                  </div>
                )}

                {dialogueStep === 2 && (
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--red-alarm)', marginBottom: '10px' }}>
                      Сущность пытается заставить вас нажать снос! Проверьте Устав и поймайте ее на противоречии!
                    </div>
                    <button className="btn-control" onClick={() => setDialogueStep(1)}>
                      ВЕРНУТЬСЯ К РЕПЛИКЕ
                    </button>
                  </div>
                )}

                {dialogueStep === 3 && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--red-alarm)', fontWeight: 800, marginBottom: '6px' }}>
                      ГОЛОС РАСПАДАЕТСЯ НА ХОР СОКОЛОВА, СВЕТЛАНЫ И КОНДУКТОРА:
                    </div>
                    <div style={{ fontSize: '14px', color: '#ff4136', fontWeight: 800, letterSpacing: '1px', background: '#240a0a', padding: '14px', border: '2px solid var(--red-alarm)', marginBottom: '14px' }}>
                      «НЕ МЕШАЙ НАМ СОЕДИНИТЬСЯ С ГОРОДОМ! СТЕНА ВСЕ РАВНО УПАДЕТ!»
                    </div>
                    <button
                      className="btn-control btn-danger"
                      onClick={() => {
                        endCall();
                        setActiveTab('order');
                      }}
                    >
                      <PhoneOff size={14} /> БРОСИТЬ ТРУБКУ И ВЫСТАВИТЬ КАРАНТИН В НАРЯДЕ
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* TAB 4: REVOCATION OF WORK ORDER */}
        {activeTab === 'order' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
              ФОРМА ОТОЗВАНИЯ НАРЯДА №44-Б НА БУРЕНИЕ СТЕНЫ
            </div>

            {isCanceled ? (
              <div style={{ background: '#0e1812', border: '2px solid var(--green-term)', padding: '24px', textAlign: 'center' }}>
                <CheckCircle2 size={42} color="var(--green-term)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--green-term)' }}>
                  БУРОВАЯ УСТАНОВКА ЗАГЛУШЕНА // КАРАНТИН БЕЗ СРОКА ДАВНОСТИ ВВЕДЕН
                </div>
                <div style={{ fontSize: '13px', color: '#fff', marginTop: '10px' }}>
                  СИСТЕМНЫЙ КОД СЕКТОРА: <strong style={{ fontSize: '20px', color: 'var(--amber)' }}>[ 44 ]</strong>
                </div>
                <button className="btn-control" onClick={onBack} style={{ marginTop: '18px' }}>
                  ВЕРНУТЬСЯ В ХАБ И ВВЕСТИ ФИНАЛЬНЫЙ КОД
                </button>
              </div>
            ) : (
              <form onSubmit={handleRevokeOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ПРАВОВОЕ ОСНОВАНИЕ ОТМЕНЫ (СОГЛАСНО УСТАВУ):
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0d0f13',
                      border: '1px solid var(--border-light)',
                      color: 'var(--amber)',
                      padding: '8px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      marginTop: '4px',
                    }}
                  >
                    <option value="">-- Выберите обоснование --</option>
                    <option value="routine">Плановый перерыв смены (Отказ)</option>
                    <option value="quarantine">КАРАНТИН БЕЗ СРОКА ДАВНОСТИ (Параграф 9-Б)</option>
                    <option value="relocation">Перенос бура в соседний подъезд</option>
                  </select>
                </div>

                <div style={{ background: '#090a0d', border: '1px solid var(--border-dim)', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    ОБЯЗАТЕЛЬНЫЕ ЭЛЕКТРОННЫЕ ПЕЧАТИ СОГЛАСОВАНИЯ:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={seal1}
                        onChange={(e) => setSeal1(e.target.checked)}
                      />
                      <span>Печать службы акустического контроля ГСТК</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={seal2}
                        onChange={(e) => setSeal2(e.target.checked)}
                      />
                      <span>Печать изоляционного протокола (событие 1998 г.)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={seal3}
                        onChange={(e) => setSeal3(e.target.checked)}
                      />
                      <span>Электронная подпись ночного дежурного инженера</span>
                    </label>
                  </div>
                </div>

                {orderError && (
                  <div style={{ color: 'var(--red-alarm)', fontSize: '12px', fontWeight: 800 }}>
                    ОШИБКА: ТРЕБУЕТСЯ ВЫБРАТЬ «КАРАНТИН БЕЗ СРОКА ДАВНОСТИ» И ОТМЕТИТЬ ВСЕ 3 ПЕЧАТИ!
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-control btn-danger"
                  style={{ padding: '12px', justifyContent: 'center' }}
                >
                  <ShieldAlert size={16} /> ОТОЗВАТЬ НАРЯД НА БУРЕНИЕ И ВВЕСТИ КАРАНТИН
                </button>
              </form>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
