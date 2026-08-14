import React, { useState, useMemo } from 'react';

export default function GateStudyPortal({
  tasks,
  pyqSessions,
  savePyqSession,
  deletePyqSession,
  testAttempts,
  saveTestAttempt,
  deleteTestAttempt,
  mistakes,
  saveMistake,
  deleteMistake,
  recallCards,
  saveRecallCard,
  deleteRecallCard,
  syllabus,
  showToast
}) {
  const [activePortalTab, setActivePortalTab] = useState('pyqs'); // pyqs, mistakes, tests, recall

  // For forms
  const [selectedSubj, setSelectedSubj] = useState(syllabus[0]?.id || '');
  const topicsForSelectedSubj = useMemo(() => {
    const subj = syllabus.find(s => s.id === selectedSubj);
    if (!subj) return [];
    const list = [];
    subj.sections.forEach(sec => {
      sec.topics.forEach(top => {
        list.push({ id: top.id, name: top.name });
      });
    });
    return list;
  }, [selectedSubj, syllabus]);

  const [selectedTopic, setSelectedTopic] = useState('');

  // 1. PYQ TRACKER STATES & HANDLERS
  const [pyqDate, setPyqDate] = useState(new Date().toISOString().split('T')[0]);
  const [pyqYear, setPyqYear] = useState('2024');
  const [pyqAttempted, setPyqAttempted] = useState('');
  const [pyqCorrect, setPyqCorrect] = useState('');
  const [pyqWrong, setPyqWrong] = useState('');
  const [pyqSkipped, setPyqSkipped] = useState('');
  const [pyqMinutes, setPyqMinutes] = useState('');
  const [pyqDifficulty, setPyqDifficulty] = useState('Medium');
  const [pyqNotes, setPyqNotes] = useState('');
  const [pyqMistakeTag, setPyqMistakeTag] = useState('Silly Mistake');

  const handleAddPyqSession = async (e) => {
    e.preventDefault();
    if (!selectedSubj || !selectedTopic || !pyqAttempted) {
      showToast('Please fill out all required fields.');
      return;
    }

    const session = {
      id: `pyq-${Date.now().toString(36)}`,
      date: pyqDate,
      subjectId: selectedSubj,
      topicId: selectedTopic,
      year: Number(pyqYear) || 2024,
      attempted: Number(pyqAttempted) || 0,
      correct: Number(pyqCorrect) || 0,
      wrong: Number(pyqWrong) || 0,
      skipped: Number(pyqSkipped) || 0,
      minutes: Number(pyqMinutes) || 30,
      difficulty: pyqDifficulty,
      mistakeTags: [pyqMistakeTag],
      notes: pyqNotes,
      createdAt: Date.now()
    };

    await savePyqSession(session);
    showToast('Logged PYQ session successfully!');
    setPyqAttempted('');
    setPyqCorrect('');
    setPyqWrong('');
    setPyqSkipped('');
    setPyqMinutes('');
    setPyqNotes('');
  };

  // 2. MISTAKE BOOK STATES & HANDLERS
  const [mistakeQuestion, setMistakeQuestion] = useState('');
  const [mistakeType, setMistakeType] = useState('Silly Mistake'); // Silly Mistake, Concept Gap, Calculation Error, Misread Question, Time Management
  const [mistakeThought, setMistakeThought] = useState('');
  const [mistakeConcept, setMistakeConcept] = useState('');
  const [mistakeSearch, setMistakeSearch] = useState('');
  const [mistakeFilterSubj, setMistakeFilterSubj] = useState('');
  const [isReviewingToday, setIsReviewingToday] = useState(false);

  const handleAddMistake = async (e) => {
    e.preventDefault();
    if (!mistakeQuestion.trim() || !selectedSubj || !selectedTopic) {
      showToast('Please fill out question description, subject and topic.');
      return;
    }

    const mistake = {
      id: `mistake-${Date.now().toString(36)}`,
      subjectId: selectedSubj,
      topicId: selectedTopic,
      date: new Date().toISOString().split('T')[0],
      question: mistakeQuestion.trim(),
      mistakeType,
      thought: mistakeThought.trim(),
      correctConcept: mistakeConcept.trim(),
      reviewed: false,
      reviewCount: 0,
      lastReviewed: null,
      createdAt: Date.now()
    };

    await saveMistake(mistake);
    showToast('Mistake logged in mistake book.');
    setMistakeQuestion('');
    setMistakeThought('');
    setMistakeConcept('');
  };

  // Filtered mistakes list
  const filteredMistakes = useMemo(() => {
    return mistakes.filter(m => {
      const matchSearch = (m.question || '').toLowerCase().includes(mistakeSearch.toLowerCase()) || 
                          (m.correctConcept || '').toLowerCase().includes(mistakeSearch.toLowerCase());
      const matchSubj = mistakeFilterSubj ? m.subjectId === mistakeFilterSubj : true;
      return matchSearch && matchSubj;
    });
  }, [mistakes, mistakeSearch, mistakeFilterSubj]);

  // Mistakes for "Review Mistakes Today" (randomized priority list of 5)
  const reviewMistakesTodayList = useMemo(() => {
    // Priority: unreviewed mistakes first, then those with lower review count
    const list = [...mistakes];
    return list
      .sort((a, b) => {
        if (a.reviewed === b.reviewed) {
          return (a.reviewCount || 0) - (b.reviewCount || 0);
        }
        return a.reviewed ? 1 : -1;
      })
      .slice(0, 5);
  }, [mistakes]);

  const handleMistakeReviewed = async (m) => {
    const updated = {
      ...m,
      reviewed: true,
      reviewCount: (m.reviewCount || 0) + 1,
      lastReviewed: Date.now()
    };
    await saveMistake(updated);
    showToast('Marked mistake as reviewed.');
  };

  // 3. TESTS & MOCKS STATES & HANDLERS
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testType, setTestType] = useState('Topic Test'); // Topic Test, Subject Test, Mixed Test, Full Mock
  const [testTitle, setTestTitle] = useState('');
  const [testTotalMarks, setTestTotalMarks] = useState('');
  const [testScore, setTestScore] = useState('');
  const [testAttempted, setTestAttempted] = useState('');
  const [testCorrect, setTestCorrect] = useState('');
  const [testWrong, setTestWrong] = useState('');
  const [testSkipped, setTestSkipped] = useState('');
  const [testMinutes, setTestMinutes] = useState('');
  const [testPercentile, setTestPercentile] = useState('');
  const [testRank, setTestRank] = useState('');
  const [testNotes, setTestNotes] = useState('');
  
  // Specific mistake analysis per test attempt
  const [testConceptGap, setTestConceptGap] = useState('0');
  const [testSillyMistake, setTestSillyMistake] = useState('0');
  const [testTimeLimitError, setTestTimeLimitError] = useState('0');

  const handleAddTestAttempt = async (e) => {
    e.preventDefault();
    if (!testTitle.trim() || !selectedSubj || !testTotalMarks || !testScore) {
      showToast('Please fill out title, subject, total marks and score.');
      return;
    }

    const attempt = {
      id: `test-${Date.now().toString(36)}`,
      date: testDate,
      type: testType,
      title: testTitle.trim(),
      subjectId: selectedSubj,
      totalMarks: Number(testTotalMarks) || 100,
      score: Number(testScore) || 0,
      attempted: Number(testAttempted) || 0,
      correct: Number(testCorrect) || 0,
      wrong: Number(testWrong) || 0,
      skipped: Number(testSkipped) || 0,
      minutes: Number(testMinutes) || 180,
      percentile: testPercentile ? Number(testPercentile) : null,
      rank: testRank ? Number(testRank) : null,
      notes: testNotes,
      errorCategorization: {
        conceptGap: Number(testConceptGap) || 0,
        sillyMistake: Number(testSillyMistake) || 0,
        timeLimitError: Number(testTimeLimitError) || 0
      },
      createdAt: Date.now()
    };

    await saveTestAttempt(attempt);
    showToast('Logged test attempt details!');
    setTestTitle('');
    setTestTotalMarks('');
    setTestScore('');
    setTestAttempted('');
    setTestCorrect('');
    setTestWrong('');
    setTestSkipped('');
    setTestMinutes('');
    setTestPercentile('');
    setTestRank('');
    setTestNotes('');
    setTestConceptGap('0');
    setTestSillyMistake('0');
    setTestTimeLimitError('0');
  };

  // 4. SPACED RECALL STATES & HANDLERS
  const [recallQuestion, setRecallQuestion] = useState('');
  const [recallAnswer, setRecallAnswer] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState(false);

  const handleAddRecallCard = async (e) => {
    e.preventDefault();
    if (!recallQuestion.trim() || !recallAnswer.trim() || !selectedSubj || !selectedTopic) {
      showToast('Please fill out question, answer, subject and topic.');
      return;
    }

    const card = {
      id: `recall-${Date.now().toString(36)}`,
      subjectId: selectedSubj,
      topicId: selectedTopic,
      question: recallQuestion.trim(),
      answer: recallAnswer.trim(),
      confidence: 3, // default
      lastReviewed: null,
      reviewCount: 0,
      createdAt: Date.now()
    };

    await saveRecallCard(card);
    showToast('Active recall card added.');
    setRecallQuestion('');
    setRecallAnswer('');
  };

  const handleConfidenceRating = async (card, rating) => {
    const updated = {
      ...card,
      confidence: rating,
      lastReviewed: Date.now(),
      reviewCount: (card.reviewCount || 0) + 1
    };
    await saveRecallCard(updated);
    showToast(`Self-Rated: ${rating}/5`);
    
    // Move to next card
    setShowAnswer(false);
    if (cardIndex < recallCards.length - 1) {
      setCardIndex(cardIndex + 1);
    } else {
      setStudyMode(false);
      setCardIndex(0);
      showToast('Finished recall cards review session! 🧠');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-800">
        {[
          { id: 'pyqs', label: '📖 PYQ Tracker' },
          { id: 'mistakes', label: '❌ Mistake Book' },
          { id: 'tests', label: '🏆 Tests & Mocks' },
          { id: 'recall', label: '🧠 Spaced Recall' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePortalTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
              activePortalTab === tab.id 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shared selection drawer for forms */}
      <div className="bg-slate-800/10 border border-slate-700/20 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Subject Context</label>
          <select
            value={selectedSubj}
            onChange={(e) => {
              setSelectedSubj(e.target.value);
              setSelectedTopic('');
            }}
            className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- Choose Subject --</option>
            {syllabus.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Syllabus Topic Context</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedSubj}
            className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            <option value="">-- Select Topic --</option>
            {topicsForSelectedSubj.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Contents */}

      {/* 1. PYQ TRACKER */}
      {activePortalTab === 'pyqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Form */}
          <div className="lg:col-span-1 bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Log PYQ Session</h3>
            <form onSubmit={handleAddPyqSession} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={pyqDate}
                    onChange={(e) => setPyqDate(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">GATE Year</label>
                  <input
                    type="number"
                    required
                    placeholder="2024"
                    value={pyqYear}
                    onChange={(e) => setPyqYear(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Attempted</label>
                  <input
                    type="number"
                    required
                    value={pyqAttempted}
                    onChange={(e) => setPyqAttempted(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Correct</label>
                  <input
                    type="number"
                    required
                    value={pyqCorrect}
                    onChange={(e) => setPyqCorrect(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Wrong</label>
                  <input
                    type="number"
                    required
                    value={pyqWrong}
                    onChange={(e) => setPyqWrong(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Skipped</label>
                  <input
                    type="number"
                    value={pyqSkipped}
                    onChange={(e) => setPyqSkipped(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Mins Taken</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={pyqMinutes}
                    onChange={(e) => setPyqMinutes(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Difficulty</label>
                  <select
                    value={pyqDifficulty}
                    onChange={(e) => setPyqDifficulty(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Difficult">Difficult</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Error Category (If any errors)</label>
                <select
                  value={pyqMistakeTag}
                  onChange={(e) => setPyqMistakeTag(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Silly Mistake">Silly Mistake</option>
                  <option value="Concept Gap">Concept Gap</option>
                  <option value="Calculation Error">Calculation Error</option>
                  <option value="Misread Question">Misread Question</option>
                  <option value="Time Management">Time Management</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Session Notes / Observations</label>
                <textarea
                  placeholder="e.g. Struggled with Subnet allocation, need to review CIDR notation."
                  value={pyqNotes}
                  onChange={(e) => setPyqNotes(e.target.value)}
                  rows="2"
                  className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedSubj || !selectedTopic}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors"
              >
                Log PYQ session
              </button>
            </form>
          </div>

          {/* List / Logs table */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Session Logs</h3>
            {pyqSessions.length === 0 ? (
              <div className="py-20 text-center text-slate-500 bg-slate-800/10 rounded-2xl border border-slate-800">
                Log your first PYQ session to see the grid logs here.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="p-3">Date</th>
                      <th className="p-3">Subj</th>
                      <th className="p-3">Attempted</th>
                      <th className="p-3">Accuracy</th>
                      <th className="p-3">Diff</th>
                      <th className="p-3">Time/Q</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pyqSessions.map(session => {
                      const acc = session.attempted > 0 ? Math.round((session.correct / session.attempted) * 100) : 0;
                      const timePerQ = session.attempted > 0 ? Math.round((session.minutes / session.attempted) * 10) / 10 : 0;
                      return (
                        <tr key={session.id} className="hover:bg-slate-800/20 text-slate-300">
                          <td className="p-3 whitespace-nowrap">{session.date}</td>
                          <td className="p-3 font-bold text-white">{session.subjectId}</td>
                          <td className="p-3">{session.attempted} qs ({session.correct} ✅)</td>
                          <td className="p-3 font-semibold text-emerald-400">{acc}%</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                              session.difficulty === 'Easy' ? 'bg-emerald-950/40 text-emerald-400' : session.difficulty === 'Medium' ? 'bg-indigo-950/40 text-indigo-400' : 'bg-rose-950/40 text-rose-400'
                            }`}>
                              {session.difficulty}
                            </span>
                          </td>
                          <td className="p-3">{timePerQ} mins</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deletePyqSession(session.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MISTAKE BOOK */}
      {activePortalTab === 'mistakes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Add form */}
          <div className="lg:col-span-1 bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Log Mistake</h3>
              <button
                type="button"
                onClick={() => setIsReviewingToday(!isReviewingToday)}
                className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg border transition-all ${
                  isReviewingToday 
                    ? 'bg-rose-600 text-white border-rose-500' 
                    : 'bg-rose-950/20 text-rose-400 border-rose-500/20 hover:bg-rose-600 hover:text-white'
                }`}
              >
                Review Mistakes Today
              </button>
            </div>

            {!isReviewingToday ? (
              <form onSubmit={handleAddMistake} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Question / Source Description</label>
                  <textarea
                    required
                    placeholder="e.g. GO Classes Assignment 2 Q4. Calculate TCP header size with options."
                    value={mistakeQuestion}
                    onChange={(e) => setMistakeQuestion(e.target.value)}
                    rows="3"
                    className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Error Type</label>
                    <select
                      value={mistakeType}
                      onChange={(e) => setMistakeType(e.target.value)}
                      className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Silly Mistake">Silly Mistake</option>
                      <option value="Concept Gap">Concept Gap</option>
                      <option value="Calculation Error">Calculation Error</option>
                      <option value="Misread Question">Misread Question</option>
                      <option value="Time Management">Time Management</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">What I thought (My wrong logic)</label>
                  <textarea
                    placeholder="e.g. Assumed option length was 40 bytes directly instead of parsing scaling factor."
                    value={mistakeThought}
                    onChange={(e) => setMistakeThought(e.target.value)}
                    rows="2"
                    className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Correct Concept / Solution</label>
                  <textarea
                    placeholder="e.g. Header length field is 4 bits, multiplied by 4 to get actual length in bytes."
                    value={mistakeConcept}
                    onChange={(e) => setMistakeConcept(e.target.value)}
                    rows="2"
                    className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedSubj || !selectedTopic}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                >
                  Log mistake details
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] text-slate-500 leading-normal">
                  Showing 5 priority mistakes to review. Re-verify concepts to improve retention!
                </p>

                {reviewMistakesTodayList.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No mistakes logged yet.</p>
                ) : (
                  <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                    {reviewMistakesTodayList.map(m => (
                      <div key={m.id} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase text-indigo-400">{m.subjectId}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            Reviews: {m.reviewCount || 0}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white">{m.question}</p>
                        <div className="p-2 bg-slate-950 rounded text-[11px] text-slate-400 leading-normal border border-slate-800/40">
                          <span className="text-[9px] uppercase font-bold text-emerald-400 block mb-0.5">Correct Concept</span>
                          {m.correctConcept}
                        </div>
                        <button
                          onClick={() => handleMistakeReviewed(m)}
                          className="w-full py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition-all"
                        >
                          Mark reviewed today
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* List display */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mistakes Database</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search mistakes..."
                  value={mistakeSearch}
                  onChange={(e) => setMistakeSearch(e.target.value)}
                  className="text-xs p-1.5 px-3 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={mistakeFilterSubj}
                  onChange={(e) => setMistakeFilterSubj(e.target.value)}
                  className="text-xs p-1.5 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">All subjects</option>
                  {syllabus.map(s => (
                    <option key={s.id} value={s.id}>{s.id}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredMistakes.length === 0 ? (
              <div className="py-20 text-center text-slate-500 bg-slate-800/10 rounded-2xl border border-slate-800">
                No matching mistakes found in database.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMistakes.map(m => (
                  <div key={m.id} className="bg-slate-800/20 border border-slate-800/80 p-4 rounded-xl space-y-3 hover:border-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-indigo-400">{m.subjectId}</span>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-400">
                          {m.mistakeType}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500">{m.date}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-100">{m.question}</p>
                    
                    {m.thought && (
                      <p className="text-[11px] text-slate-400">
                        <strong className="text-rose-400/90">Thought:</strong> {m.thought}
                      </p>
                    )}
                    {m.correctConcept && (
                      <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
                        <strong className="text-emerald-400 font-bold">Correct:</strong> {m.correctConcept}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500">
                        Reviewed count: {m.reviewCount || 0}
                      </span>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <button
                          onClick={() => handleMistakeReviewed(m)}
                          className="text-emerald-400 hover:text-white transition-colors"
                        >
                          Review Now
                        </button>
                        <button
                          onClick={() => deleteMistake(m.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TESTS & MOCKS */}
      {activePortalTab === 'tests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Log Test Form */}
          <div className="lg:col-span-1 bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Log Test Attempt</h3>
            <form onSubmit={handleAddTestAttempt} className="space-y-3.5">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GO Classes Computer Networks Subject Test 1"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Test Type</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Topic Test">Topic Test</option>
                    <option value="Subject Test">Subject Test</option>
                    <option value="Mixed Test">Mixed Test</option>
                    <option value="Full Mock">Full Mock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={testTotalMarks}
                    onChange={(e) => setTestTotalMarks(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Your Score</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={testScore}
                    onChange={(e) => setTestScore(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Attempted</label>
                  <input
                    type="number"
                    value={testAttempted}
                    onChange={(e) => setTestAttempted(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Correct</label>
                  <input
                    type="number"
                    value={testCorrect}
                    onChange={(e) => setTestCorrect(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Wrong</label>
                  <input
                    type="number"
                    value={testWrong}
                    onChange={(e) => setTestWrong(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Skipped</label>
                  <input
                    type="number"
                    value={testSkipped}
                    onChange={(e) => setTestSkipped(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Mins Taken</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={testMinutes}
                    onChange={(e) => setTestMinutes(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Percentile</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="99.5"
                    value={testPercentile}
                    onChange={(e) => setTestPercentile(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Mistake analysis per test */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Error Breakdown (Count of Questions)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Concept Gap</label>
                    <input
                      type="number"
                      value={testConceptGap}
                      onChange={(e) => setTestConceptGap(e.target.value)}
                      className="w-full text-xs p-1.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Silly Mistake</label>
                    <input
                      type="number"
                      value={testSillyMistake}
                      onChange={(e) => setTestSillyMistake(e.target.value)}
                      className="w-full text-xs p-1.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Time Limit</label>
                    <input
                      type="number"
                      value={testTimeLimitError}
                      onChange={(e) => setTestTimeLimitError(e.target.value)}
                      className="w-full text-xs p-1.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Rank achieved</label>
                <input
                  type="number"
                  placeholder="e.g. 45"
                  value={testRank}
                  onChange={(e) => setTestRank(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Session Reflections</label>
                <textarea
                  placeholder="Reflect on speed, accuracy, and hard questions..."
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  rows="2"
                  className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedSubj}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors"
              >
                Log test attempt
              </button>
            </form>
          </div>

          {/* List display */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Test History & Performance</h3>
            {testAttempts.length === 0 ? (
              <div className="py-20 text-center text-slate-500 bg-slate-800/10 rounded-2xl border border-slate-800">
                Log your first test attempt to see the analytics summary here.
              </div>
            ) : (
              <div className="space-y-3.5">
                {testAttempts.map(attempt => {
                  const percentage = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
                  return (
                    <div key={attempt.id} className="bg-slate-800/20 border border-slate-800/80 p-4 rounded-xl hover:border-slate-700/50 transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase text-indigo-400">{attempt.type}</span>
                          <h4 className="text-xs font-bold text-white mt-0.5">{attempt.title}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-emerald-400">{attempt.score} / {attempt.totalMarks}</p>
                          <p className="text-[9px] text-slate-500 font-bold">{percentage}% Marks</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/40 text-[10px] text-slate-400">
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase font-bold">Accuracy</span>
                          {attempt.attempted > 0 ? Math.round((attempt.correct / attempt.attempted) * 100) : 0}%
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase font-bold">Percentile</span>
                          {attempt.percentile || 'N/A'}%
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[8px] uppercase font-bold">Rank</span>
                          #{attempt.rank || 'N/A'}
                        </div>
                      </div>

                      {/* Error analysis display */}
                      {attempt.errorCategorization && (
                        <div>
                          <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Logged Mistakes count</span>
                          <div className="flex gap-2 text-[10px]">
                            <span className="px-2 py-0.5 bg-rose-950/20 text-rose-400 rounded border border-rose-500/10">
                              Concept Gaps: {attempt.errorCategorization.conceptGap || 0}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-950/20 text-amber-400 rounded border border-amber-500/10">
                              Silly errors: {attempt.errorCategorization.sillyMistake || 0}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-950/20 text-indigo-400 rounded border border-indigo-500/10">
                              Time pressure: {attempt.errorCategorization.timeLimitError || 0}
                            </span>
                          </div>
                        </div>
                      )}

                      {attempt.notes && (
                        <p className="text-[10px] text-slate-500 italic bg-slate-900/30 p-2 rounded">
                          Reflections: {attempt.notes}
                        </p>
                      )}

                      <div className="flex justify-end text-[10px] font-bold border-t border-slate-800/40 pt-2">
                        <button
                          onClick={() => deleteTestAttempt(attempt.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          Delete Record
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SPACED RECALL */}
      {activePortalTab === 'recall' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Add flashcard */}
          <div className="lg:col-span-1 bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add Recall Card</h3>
              <button
                type="button"
                onClick={() => {
                  if (recallCards.length === 0) {
                    showToast('Add some recall cards first.');
                    return;
                  }
                  setStudyMode(!studyMode);
                  setShowAnswer(false);
                  setCardIndex(0);
                }}
                className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg border transition-all ${
                  studyMode 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                {studyMode ? 'Form view' : 'Review Cards Now'}
              </button>
            </div>

            {!studyMode ? (
              <form onSubmit={handleAddRecallCard} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Recall Question / Prompts</label>
                  <textarea
                    required
                    placeholder="e.g. Explain TCP Congestion control states (Slow Start, Congestion Avoidance, Fast Recovery) without checking notes."
                    value={recallQuestion}
                    onChange={(e) => setRecallQuestion(e.target.value)}
                    rows="3"
                    className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Hidden Answer / Reference Details</label>
                  <textarea
                    required
                    placeholder="Slow Start: double cwnd every RTT. Congestion Avoidance: cwnd++ every RTT. Fast Recovery: cwnd = ssthresh + 3..."
                    value={recallAnswer}
                    onChange={(e) => setRecallAnswer(e.target.value)}
                    rows="3"
                    className="w-full text-xs p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedSubj || !selectedTopic}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                >
                  Create Card
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] text-slate-500">Card {cardIndex + 1} of {recallCards.length}</p>

                {recallCards.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No recall cards loaded.</p>
                ) : (
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase text-indigo-400">
                        {recallCards[cardIndex]?.subjectId} Prompt
                      </span>
                      <p className="text-sm font-semibold text-slate-100 leading-normal">
                        {recallCards[cardIndex]?.question}
                      </p>

                      {showAnswer && (
                        <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-400 border border-slate-800 leading-normal animate-slide-in">
                          <strong className="text-emerald-400 block text-[9px] uppercase font-bold mb-1">Answer Reference</strong>
                          {recallCards[cardIndex]?.answer}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 mt-4">
                      {!showAnswer ? (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors"
                        >
                          Show Hidden Answer
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-[9px] uppercase font-black text-center text-slate-500">Rate your recall confidence</p>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[1, 2, 3, 4, 5].map(rating => (
                              <button
                                key={rating}
                                onClick={() => handleConfidenceRating(recallCards[cardIndex], rating)}
                                className={`py-1.5 rounded text-[10px] font-black border transition-colors ${
                                  rating <= 2 
                                    ? 'bg-rose-950/20 border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white' 
                                    : rating === 3 
                                    ? 'bg-amber-950/20 border-amber-500/20 text-amber-400 hover:bg-amber-600 hover:text-white' 
                                    : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* List display */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Flashcards Database</h3>
            {recallCards.length === 0 ? (
              <div className="py-20 text-center text-slate-500 bg-slate-800/10 rounded-2xl border border-slate-800">
                Log your first recall card to see the grid list here.
              </div>
            ) : (
              <div className="space-y-3">
                {recallCards.map(card => (
                  <div key={card.id} className="bg-slate-800/20 border border-slate-800 p-4 rounded-xl space-y-2.5 hover:border-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-400">{card.subjectId}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        card.confidence <= 2 ? 'bg-rose-950 text-rose-400' : card.confidence === 3 ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                      }`}>
                        Confidence: {card.confidence}/5
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-200">{card.question}</p>
                    <p className="text-[11px] text-slate-500 italic">Answer: {card.answer}</p>

                    <div className="flex justify-end text-[10px] font-bold border-t border-slate-800/60 pt-2">
                      <button
                        onClick={() => deleteRecallCard(card.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Delete Card
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
