import React, { useState, useEffect } from 'react';
import { fetchInitData, submitCall } from '../api';
import { Search, Send, Clock, History, UserCheck, MessageSquare } from 'lucide-react';

export default function TeacherUI() {
  const [initData, setInitData] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentCalls, setRecentCalls] = useState([]);

  useEffect(() => {
    fetchInitData().then(data => {
      setInitData(data);
      const savedTeacher = localStorage.getItem('yc_last_teacher');
      if (savedTeacher) setSelectedTeacher(savedTeacher);
    });
  }, []);

  const handleTeacherChange = (e) => {
    const val = e.target.value;
    setSelectedTeacher(val);
    localStorage.setItem('yc_last_teacher', val);
  };

  const filteredStudents = React.useMemo(() => {
    if (!initData || !selectedClass) return [];
    let list = initData.studentsData.students.filter(
      s => s.grade === selectedClass.grade && s.classNum === selectedClass.classNum
    );
    if (searchQuery) {
      list = list.filter(s => s.name.includes(searchQuery) || s.num.toString() === searchQuery);
    }
    return list;
  }, [initData, selectedClass, searchQuery]);

  const handleCall = async () => {
    if (!selectedTeacher) {
      alert("선생님 이름을 먼저 선택해주세요.");
      return;
    }
    if (!selectedStudent) {
      alert("호출할 학생을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    const callData = {
      teacher: selectedTeacher,
      grade: selectedStudent.grade,
      classNum: selectedStudent.classNum,
      studentNum: selectedStudent.num,
      studentName: selectedStudent.name,
      message: message
    };

    const res = await submitCall(callData);
    setIsSubmitting(false);

    if (res.ok) {
      alert("성공적으로 호출되었습니다.");
      setRecentCalls(prev => [{ time: new Date().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'}), ...callData }, ...prev].slice(0, 15));
      setMessage('');
      setSelectedStudent(null);
    } else {
      alert("호출 실패: " + (res.msg || res.error || "알 수 없는 오류"));
    }
  };

  if (!initData) return <div className="flex w-full h-full items-center justify-center font-bold">로딩 중...</div>;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-800 p-4 gap-4 overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm shrink-0 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">클래스콜</div>
          <h1 className="text-xl font-black text-slate-800">교사용 호출 패널</h1>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <UserCheck className="w-4 h-4 text-slate-500" />
          <select 
            value={selectedTeacher} 
            onChange={handleTeacherChange}
            className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer text-sm"
          >
            <option value="">선생님 선택...</option>
            {initData.teachers?.map(t => (
              <option key={t.name} value={t.name}>{t.name} ({t.location})</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel: Class & Students */}
        <div className="flex-[3] flex flex-col gap-4 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 custom-scrollbar">
              {initData.studentsData?.classList?.map(c => (
                <button
                  key={`${c.grade}-${c.classNum}`}
                  onClick={() => { setSelectedClass(c); setSelectedStudent(null); }}
                  className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedClass?.grade === c.grade && selectedClass?.classNum === c.classNum
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200 scale-95'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.grade}학년 {c.classNum}반
                </button>
              ))}
            </div>

            {selectedClass && (
              <div className="relative shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="이름 또는 번호로 학생 검색..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-medium outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 overflow-y-auto custom-scrollbar">
            {!selectedClass ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                위에서 학년/반을 선택해주세요.
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                검색된 학생이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 auto-rows-max">
                {filteredStudents.map(student => (
                  <button
                    key={student.num}
                    onClick={() => setSelectedStudent(student)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      selectedStudent?.num === student.num
                        ? 'border-blue-500 bg-blue-50 shadow-sm scale-95'
                        : 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white'
                    }`}
                  >
                    <span className={`text-xs font-bold mb-1 ${selectedStudent?.num === student.num ? 'text-blue-600' : 'text-slate-400'}`}>
                      {student.num}번
                    </span>
                    <span className={`font-black tracking-tight ${selectedStudent?.num === student.num ? 'text-blue-700 text-lg' : 'text-slate-700'}`}>
                      {student.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Action & Log */}
        <div className="flex-[1.5] min-w-[320px] flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col shrink-0">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" /> 호출 전송
            </h3>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 flex items-center justify-center min-h-[60px]">
              {selectedStudent ? (
                <span className="font-black text-blue-600 text-lg">
                  {selectedStudent.grade}학년 {selectedStudent.classNum}반 {selectedStudent.num}번 {selectedStudent.name}
                </span>
              ) : (
                <span className="text-slate-400 font-bold text-sm">학생을 먼저 선택하세요</span>
              )}
            </div>

            <div className="relative mb-6">
              <MessageSquare className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="전달할 메시지 (선택사항)&#10;예: 시험지 가지고 오세요"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 min-h-[100px] resize-none outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
              />
            </div>

            <button
              onClick={handleCall}
              disabled={isSubmitting || !selectedStudent}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? '전송 중...' : '즉시 호출하기'}
            </button>
          </div>

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col min-h-0">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 shrink-0">
              <History className="w-5 h-5 text-slate-500" /> 내 호출 내역
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
              {recentCalls.length === 0 ? (
                <div className="text-center text-slate-400 font-bold mt-10">최근 호출 내역이 없습니다.</div>
              ) : (
                recentCalls.map((call, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-700 text-sm">{call.studentName} 학생</span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {call.time}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{call.grade}학년 {call.classNum}반 {call.studentNum}번</span>
                    {call.message && <p className="text-sm font-medium text-slate-600 mt-1 bg-white p-2 rounded-lg border border-slate-100">{call.message}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
