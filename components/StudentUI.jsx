import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchInitData, fetchCalls, fetchMeals, confirmCall } from '../api';
import timetableData from '../data/timetable.json';
import { Bell, Clock, CalendarDays, Utensils, Megaphone, Info } from 'lucide-react';

export default function StudentUI() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [initData, setInitData] = useState(null);
  const [calls, setCalls] = useState([]);
  const [meals, setMeals] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Initial fetch
    fetchInitData().then(setInitData);
    fetchMeals().then(setMeals);

    // Setup polling
    const callInterval = setInterval(() => {
      fetchCalls().then(newCalls => {
        if (newCalls.length > 0) {
          setCalls(newCalls);
          if (!currentCall) {
            handleNewCall(newCalls[0]);
          }
        }
      });
    }, 2000);

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(callInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const handleNewCall = (call) => {
    setCurrentCall(call);
    const dismissTime = initData?.autoDismiss || 30;
    setCountdown(dismissTime);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          confirmCall(call.row);
          setCurrentCall(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getDayOfWeek = () => {
    let day = currentTime.getDay();
    if (day === 0 || day === 6) day = 1; // Default to Monday if weekend
    return day.toString();
  };

  const todayTimetable = timetableData[getDayOfWeek()];

  if (!initData) return <div className="flex w-full h-full items-center justify-center text-xl font-bold">로딩 중...</div>;

  return (
    <div className="relative w-full h-full flex flex-col p-6 gap-6 bg-gradient-to-br from-indigo-50 to-blue-100 overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center bg-white/60 backdrop-blur-md rounded-2xl px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">클래스콜</div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">{initData.schoolName || '학교명 로딩중'}</h1>
            <p className="text-sm text-slate-500 font-medium">학생 대기화면</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-bold text-slate-600">온라인</span>
        </div>
      </header>

      {/* Notice Banner */}
      {initData.notice && (
        <div className="w-full bg-yellow-400 text-yellow-900 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-md">
          <Megaphone className="w-6 h-6 shrink-0" />
          <p className="font-bold text-lg">{initData.notice}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-4 gap-6 min-h-0">
        
        {/* Clock & Today's Timetable */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="glass-panel flex-1 rounded-3xl flex flex-col items-center justify-center p-8 gap-2">
            <Clock className="w-10 h-10 text-blue-500 mb-2" />
            <p className="text-lg font-bold text-slate-500">
              {currentTime.getMonth() + 1}월 {currentTime.getDate()}일
            </p>
            <h2 className="text-6xl font-black text-slate-800 tracking-tighter">
              {String(currentTime.getHours()).padStart(2, '0')}:{String(currentTime.getMinutes()).padStart(2, '0')}
            </h2>
            <p className="text-blue-600 font-bold mt-2">수업 중</p>
          </div>

          <div className="glass-panel flex-1 rounded-3xl p-6 overflow-y-auto">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5" /> 오늘 시간표
            </h3>
            <div className="flex flex-col gap-3">
              {todayTimetable && Object.entries(todayTimetable).map(([period, subject]) => (
                <div key={period} className="flex items-center justify-between bg-white/50 px-4 py-3 rounded-xl border border-white">
                  <span className="font-bold text-slate-500">{period}교시</span>
                  <span className="font-black text-slate-800">{subject || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Timetable */}
        <div className="col-span-2 glass-panel rounded-3xl p-6 flex flex-col overflow-hidden">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5" /> 이번주 시간표
          </h3>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white/50">
            <table className="w-full text-center text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/50">
                  <th className="p-3 border-b border-slate-200 text-slate-500 font-bold"></th>
                  <th className={`p-3 border-b border-slate-200 font-bold ${getDayOfWeek() === '1' ? 'text-blue-600' : 'text-slate-600'}`}>월</th>
                  <th className={`p-3 border-b border-slate-200 font-bold ${getDayOfWeek() === '2' ? 'text-blue-600' : 'text-slate-600'}`}>화</th>
                  <th className={`p-3 border-b border-slate-200 font-bold ${getDayOfWeek() === '3' ? 'text-blue-600' : 'text-slate-600'}`}>수</th>
                  <th className={`p-3 border-b border-slate-200 font-bold ${getDayOfWeek() === '4' ? 'text-blue-600' : 'text-slate-600'}`}>목</th>
                  <th className={`p-3 border-b border-slate-200 font-bold ${getDayOfWeek() === '5' ? 'text-blue-600' : 'text-slate-600'}`}>금</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7].map(period => (
                  <tr key={period} className="border-b border-slate-100 last:border-0 hover:bg-white/50 transition-colors">
                    <td className="p-3 font-bold text-slate-400">{period}</td>
                    {['1', '2', '3', '4', '5'].map(day => (
                      <td key={day} className={`p-3 font-bold ${getDayOfWeek() === day ? 'bg-blue-50/50 text-blue-700' : 'text-slate-700'}`}>
                        {timetableData[day]?.[period.toString()] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Meal & Agenda */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="glass-panel flex-1 rounded-3xl p-6 overflow-y-auto">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5" /> 오늘 급식
            </h3>
            {meals && meals.length > 0 ? (
              <div className="flex flex-col gap-4">
                {meals.map((meal, idx) => (
                  <div key={idx} className="bg-white/60 p-4 rounded-2xl shadow-sm border border-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-sm">{meal.type}</span>
                      {meal.kcal && <span className="font-bold text-slate-400 text-xs">{meal.kcal}</span>}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-slate-700" dangerouslySetInnerHTML={{ __html: meal.dishes.join('<br/>') }} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center mt-10 font-bold">급식 정보가 없습니다.</p>
            )}
          </div>

          <div className="glass-panel h-1/3 rounded-3xl p-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" /> 학급 메모
            </h3>
            <p className="text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
              {initData.classMemo || "등록된 학급 메모가 없습니다."}
            </p>
          </div>
        </div>
      </div>

      {/* Call Alert Modal Overlay */}
      <AnimatePresence>
        {currentCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-12 flex flex-col items-center justify-center text-center border-[12px] border-yellow-400 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: initData.autoDismiss || 30, ease: 'linear' }}
                  className="h-full bg-yellow-400"
                />
              </div>

              <Bell className="w-24 h-24 text-yellow-500 animate-bell mb-6" />
              
              <div className="bg-yellow-100 text-yellow-800 font-black px-6 py-2 rounded-full text-xl mb-8 tracking-wide">
                호출
              </div>

              <h2 className="text-[6rem] font-black text-slate-800 leading-none tracking-tight mb-2">
                {currentCall.name} <span className="text-4xl text-slate-500 font-bold">학생</span>
              </h2>
              <p className="text-3xl font-bold text-slate-400 mb-10">{currentCall.num}번</p>

              {currentCall.message && (
                <div className="bg-slate-100 px-8 py-6 rounded-3xl mb-8 w-full max-w-2xl">
                  <p className="text-2xl font-bold text-slate-700">{currentCall.message}</p>
                </div>
              )}

              <div className="flex gap-4 items-center mt-4">
                <div className="bg-blue-50 text-blue-700 font-bold px-6 py-4 rounded-2xl text-xl flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 block"></span>
                  {currentCall.teacher} 선생님
                </div>
                {currentCall.location && (
                  <div className="bg-orange-50 text-orange-700 font-bold px-6 py-4 rounded-2xl text-xl">
                    📍 {currentCall.location}로 오세요
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  confirmCall(currentCall.row);
                  setCurrentCall(null);
                }}
                className="mt-12 bg-slate-800 text-white px-12 py-5 rounded-full font-black text-xl hover:bg-slate-700 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform"
              >
                확인했습니다 ({countdown}초 후 자동 닫힘)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
