import React, { useState, useMemo } from 'react';

export default function GateSyllabus({
  tasks,
  saveTask,
  pyqSessions,
  mistakes,
  notes,
  onOpenInNotesPage,
  syllabus,
  generateSpacedRevisions,
  showToast
}) {
  const todayStr = useMemo(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, []);

  const [selectedSubjectId, setSelectedSubjectId] = useState(syllabus[0]?.id || 'CN');
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  
  // State for adding a lecture log manual overlay
  const [lectureFormTopicId, setLectureFormTopicId] = useState(null);
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDuration, setLectureDuration] = useState('');

  const selectedSubject = useMemo(() => {
    return syllabus.find(s => s.id === selectedSubjectId);
  }, [selectedSubjectId, syllabus]);

  // Topic Completion Status map
  const topicCompletionMap = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (t.type === 'concept' && t.status === 'Completed' && t.topicId) {
        map[t.topicId] = true;
      }
    });
    return map;
  }, [tasks]);

  // Lecture count per subject
  const subjectMetrics = useMemo(() => {
    const metrics = {};
    syllabus.forEach(subj => {
      const subjTasks = tasks.filter(t => t.subjectId === subj.id);
      
      const lectures = subjTasks.filter(t => t.type === 'lecture');
      const completedLectures = lectures.filter(l => l.status === 'Completed').length;
      
      const concepts = subjTasks.filter(t => t.type === 'concept');
      const completedConcepts = concepts.filter(c => c.status === 'Completed').length;

      // PYQ accuracy for this subject
      const subjectPyqs = pyqSessions.filter(p => p.subjectId === subj.id);
      const attempted = subjectPyqs.reduce((sum, p) => sum + Number(p.attempted || 0), 0);
      const correct = subjectPyqs.reduce((sum, p) => sum + Number(p.correct || 0), 0);
      const pyqAccuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : null;

      metrics[subj.id] = {
        totalLectures: lectures.length || 0,
        completedLectures,
        totalConcepts: concepts.length || 0,
        completedConcepts,
        pyqAccuracy,
        attemptedPyqs: attempted
      };
    });
    return metrics;
  }, [syllabus, tasks, pyqSessions]);

  // Next recommended topic based on official order
  const nextRecommendedTopic = useMemo(() => {
    // Traverse subjects in order, then sections, then topics, find first incomplete
    for (let subj of syllabus) {
      for (let sec of subj.sections) {
        for (let top of sec.topics) {
          if (!topicCompletionMap[top.id]) {
            return {
              subjectId: subj.id,
              subjectName: subj.name,
              topicId: top.id,
              topicName: top.name
            };
          }
        }
      }
    }
    return null;
  }, [syllabus, topicCompletionMap]);

  const handleRecommendClick = () => {
    if (nextRecommendedTopic) {
      setSelectedSubjectId(nextRecommendedTopic.subjectId);
      setExpandedTopicId(nextRecommendedTopic.topicId);
      showToast(`Recommended: ${nextRecommendedTopic.topicName}`);
    } else {
      showToast('All syllabus topics are marked completed! Outstanding job! 🎓');
    }
  };

  // Toggle Topic Completion (Marks as Concept task completed & generates spaced revisions)
  const handleToggleTopic = async (subjectId, topicId, topicName) => {
    const isCompleted = topicCompletionMap[topicId];
    
    // Find if the concept task already exists
    const existingConceptTask = tasks.find(t => t.type === 'concept' && t.topicId === topicId);

    if (isCompleted) {
      // Unmark completion
      if (existingConceptTask) {
        const updated = {
          ...existingConceptTask,
          status: 'Pending',
          completedAt: null
        };
        await saveTask(updated);
        showToast(`Topic marked incomplete: ${topicName}`);
      }
    } else {
      // Mark as completed, create task if needed
      if (existingConceptTask) {
        const updated = {
          ...existingConceptTask,
          status: 'Completed',
          completedAt: Date.now()
        };
        await saveTask(updated);
      } else {
        const newTask = {
          id: `concept-${topicId}-${Date.now().toString(36)}`,
          title: `Study: ${topicName} (Syllabus Concept)`,
          subjectId,
          topicId,
          type: 'concept',
          date: new Date().toISOString().split('T')[0],
          priority: 'High',
          status: 'Completed',
          plannedMinutes: 60,
          actualMinutes: 60,
          note: `Completed learning for ${topicName}`,
          completedAt: Date.now(),
          category: 'GATE'
        };
        await saveTask(newTask);
      }
      // Generate 5 spaced repetition tasks!
      await generateSpacedRevisions(subjectId, topicId, topicName);
    }
  };

  // Log Lecture Watched
  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lectureTitle.trim()) return;

    const newLectureTask = {
      id: `lec-${lectureFormTopicId}-${Date.now().toString(36)}`,
      title: `${selectedSubjectId} Lecture: ${lectureTitle}`,
      subjectId: selectedSubjectId,
      topicId: lectureFormTopicId,
      type: 'lecture',
      date: new Date().toISOString().split('T')[0],
      priority: 'Low',
      status: 'Completed',
      plannedMinutes: Number(lectureDuration) || 45,
      actualMinutes: Number(lectureDuration) || 45,
      note: 'Watched GO Classes lecture.',
      completedAt: Date.now(),
      category: 'GATE'
    };

    await saveTask(newLectureTask);
    showToast(`Logged lecture: ${lectureTitle}`);
    setLectureFormTopicId(null);
    setLectureTitle('');
    setLectureDuration('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Subjects Roadmap Sidebar (1 Column) */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Subject Roadmap</h2>
          <button
            onClick={handleRecommendClick}
            className="text-[10px] font-bold py-1 px-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-1"
          >
            🚀 Next Topic
          </button>
        </div>

        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {syllabus.map(subj => {
            const isSelected = selectedSubjectId === subj.id;
            const m = subjectMetrics[subj.id] || { completedLectures: 0, totalLectures: 0, completedConcepts: 0, totalConcepts: 0 };
            
            // Calculate a simple subject progress percentage
            const totalItems = (subj.sections.reduce((acc, s) => acc + s.topics.length, 0)) || 1;
            const completedItems = m.completedConcepts;
            const pct = Math.round((completedItems / totalItems) * 100);

            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border-violet-500/60 shadow-lg shadow-violet-950/20' 
                    : 'bg-slate-800/30 border-slate-700/20 hover:border-slate-600/50 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white leading-tight">{subj.name}</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase">{subj.id}</span>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[10px] text-slate-500">Progress</span>
                  <span className="text-[10px] font-bold text-indigo-400">{pct}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics Detail Pane (3 Columns) */}
      <div className="lg:col-span-3 space-y-5">
        {selectedSubject ? (
          <div className="space-y-5">
            {/* Subject Header & Stats */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedSubject.name} Dashboard</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Timeline: {selectedSubject.timeline.start} to {selectedSubject.timeline.end}</p>
                </div>
                <span className="text-xs font-extrabold uppercase py-1 px-3 rounded-full bg-slate-800 border border-slate-700 text-slate-400 self-start sm:self-auto">
                  Self-Rating: {selectedSubject.selfRating}/5
                </span>
              </div>

              {/* Subject mini metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Lectures Watched</p>
                  <p className="text-sm font-extrabold text-white mt-1">
                    {subjectMetrics[selectedSubject.id]?.completedLectures || 0} logged
                  </p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Topics Mastered</p>
                  <p className="text-sm font-extrabold text-white mt-1">
                    {subjectMetrics[selectedSubject.id]?.completedConcepts || 0} / {selectedSubject.sections.reduce((acc, s) => acc + s.topics.length, 0)}
                  </p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">PYQ Accuracy</p>
                  <p className="text-sm font-extrabold text-indigo-400 mt-1">
                    {subjectMetrics[selectedSubject.id]?.pyqAccuracy !== null 
                      ? `${subjectMetrics[selectedSubject.id]?.pyqAccuracy}%` 
                      : 'No attempts yet'}
                  </p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Mistakes Logged</p>
                  <p className="text-sm font-extrabold text-rose-400 mt-1">
                    {mistakes.filter(m => m.subjectId === selectedSubject.id).length} errors
                  </p>
                </div>
              </div>
            </div>

            {/* List of sections & topics */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Official Syllabus Order & Topics</h4>

              <div className="space-y-3">
                {selectedSubject.sections.map((sec, secIdx) => (
                  <div key={secIdx} className="space-y-2">
                    <h5 className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider px-1">
                      Section {secIdx + 1}: {sec.name}
                    </h5>

                    <div className="space-y-2">
                      {sec.topics.map((top, topIdx) => {
                        const isExpanded = expandedTopicId === top.id;
                        const isCompleted = topicCompletionMap[top.id];
                        
                        // Count completed lectures for this specific topic
                        const topicLectures = tasks.filter(t => t.type === 'lecture' && t.topicId === top.id);
                        const completedTopicLectures = topicLectures.filter(l => l.status === 'Completed').length;

                        // Revision status check
                        const topicRevisions = tasks.filter(t => t.type === 'revision' && t.topicId === top.id);
                        const completedRevisionsCount = topicRevisions.filter(r => r.status === 'Completed').length;

                        // Notes check
                        const topicNotes = notes.filter(n => n.taskId === top.id);

                        return (
                          <div 
                            key={top.id} 
                            className={`bg-slate-800/20 border rounded-xl overflow-hidden transition-all duration-300 ${
                              isExpanded ? 'border-violet-500/40 bg-slate-800/40' : 'border-slate-800 hover:border-slate-700/50'
                            }`}
                          >
                            {/* Header row */}
                            <div className="p-3.5 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpandedTopicId(isExpanded ? null : top.id)}>
                              <div className="flex items-center gap-3">
                                {/* Checkbox for topic completion */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTopic(selectedSubject.id, top.id, top.name);
                                  }}
                                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                                      : 'border-slate-700 hover:border-slate-500 bg-slate-900'
                                  }`}
                                >
                                  {isCompleted && (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                      <polyline points="20,6 9,17 4,12" />
                                    </svg>
                                  )}
                                </button>
                                
                                <div>
                                  <p className="text-xs font-semibold text-slate-200">
                                    {secIdx + 1}.{topIdx + 1} {top.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] text-slate-500">
                                      {completedTopicLectures} lectures logged
                                    </span>
                                    {topicRevisions.length > 0 && (
                                      <span className="text-[9px] text-indigo-400">
                                        Revisions: {completedRevisionsCount}/5
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {topicNotes.length > 0 && (
                                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                                    📝 Notes
                                  </span>
                                )}
                                <span className="text-slate-500">
                                  {isExpanded ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <polyline points="18,15 12,9 6,15" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <polyline points="6,9 12,15 18,9" />
                                    </svg>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Expanded details body */}
                            {isExpanded && (
                              <div className="border-t border-slate-800 p-4 space-y-4 bg-slate-950/40 animate-slide-in">
                                {/* Subtopics bullet list */}
                                <div>
                                  <h6 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Official Subtopics Breakdown</h6>
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
                                    {top.subtopics.map((sub, sIdx) => (
                                      <li key={sIdx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-violet-500" />
                                        {sub}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Lecture Tracking area */}
                                <div className="pt-3 border-t border-slate-900/60">
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">GO Classes Lecture Logs</h6>
                                    <button
                                      onClick={() => setLectureFormTopicId(top.id)}
                                      className="text-[9px] font-bold text-violet-400 hover:text-white transition-colors"
                                    >
                                      + Log Lecture
                                    </button>
                                  </div>

                                  {/* Lecture Input form */}
                                  {lectureFormTopicId === top.id && (
                                    <form onSubmit={handleAddLecture} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 mb-3 space-y-2">
                                      <div className="grid grid-cols-3 gap-2">
                                        <input
                                          type="text"
                                          required
                                          placeholder="Lecture title or number"
                                          value={lectureTitle}
                                          onChange={(e) => setLectureTitle(e.target.value)}
                                          className="col-span-2 text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
                                        />
                                        <input
                                          type="number"
                                          placeholder="Mins"
                                          value={lectureDuration}
                                          onChange={(e) => setLectureDuration(e.target.value)}
                                          className="text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2 text-[9px] font-bold uppercase pt-1">
                                        <button
                                          type="button"
                                          onClick={() => setLectureFormTopicId(null)}
                                          className="px-2.5 py-1 text-slate-500 hover:text-slate-300"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="submit"
                                          className="px-3 py-1 bg-violet-600 text-white rounded hover:bg-violet-700"
                                        >
                                          Save Log
                                        </button>
                                      </div>
                                    </form>
                                  )}

                                  {/* List of topic lectures */}
                                  {topicLectures.length === 0 ? (
                                    <p className="text-[10px] text-slate-600 italic">No lecture logs recorded for this topic yet.</p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {topicLectures.map(l => (
                                        <div key={l.id} className="flex items-center justify-between bg-slate-900/40 p-2 rounded border border-slate-800/40">
                                          <span className="text-[11px] text-slate-300">{l.title}</span>
                                          <span className="text-[10px] text-slate-500">{l.plannedMinutes} mins</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Revisions tracker logs */}
                                {topicRevisions.length > 0 && (
                                  <div className="pt-3 border-t border-slate-900/60">
                                    <h6 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Spaced Repetition Schedule</h6>
                                    <div className="grid grid-cols-5 gap-1.5">
                                      {topicRevisions.map(rev => {
                                        const typeShort = rev.title.match(/\[(.*?)\]/)?.[1] || 'R';
                                        return (
                                          <div 
                                            key={rev.id} 
                                            className={`p-2 rounded border text-center flex flex-col justify-between ${
                                              rev.status === 'Completed' 
                                                ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-slate-900/40 border-slate-800 text-slate-500'
                                            }`}
                                          >
                                            <span className="text-[9px] font-black">{typeShort}</span>
                                            <span className="text-[8px] mt-1 text-slate-600 block leading-tight">{rev.date}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Notes section inside details */}
                                <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">
                                    {topicNotes.length > 0 
                                      ? `📝 ${topicNotes.length} notes attached to this topic.` 
                                      : 'No notes added for this concept.'}
                                  </span>
                                  <button
                                    onClick={() => onOpenInNotesPage(todayStr, top.id, '')}
                                    className="text-[10px] font-bold text-amber-400 hover:text-white transition-colors"
                                  >
                                    {topicNotes.length > 0 ? 'Edit Notes' : '+ Add Note'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            Select a subject from the roadmap to view details.
          </div>
        )}
      </div>
    </div>
  );
}
