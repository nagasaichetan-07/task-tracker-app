import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { seedGateCalendar } from '../gateSeeder';

export default function GateDashboard({
  tasks,
  saveTask,
  pyqSessions,
  testAttempts,
  mistakes,
  recallCards,
  weeklyReviews,
  saveWeeklyReview,
  strictSyllabusMode,
  setStrictSyllabusMode,
  user,
  showToast,
  syllabus
}) {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, today, weak-areas, upcoming
  const [weeklyReflection, setWeeklyReflection] = useState('');
  const [weeklyGoals, setWeeklyGoals] = useState('');

  // 1. TIMELINE & SEMESTER MODE CALCS
  const todayStr = useMemo(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, []);

  const isSemesterMode = useMemo(() => {
    const semStart = '2026-11-15';
    const semEnd = '2026-12-05';
    return todayStr >= semStart && todayStr <= semEnd;
  }, [todayStr]);

  const daysRemaining = useMemo(() => {
    const examDate = new Date('2027-02-05T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = examDate - todayDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [todayStr]);

  // --- ANALYTICS COMPUTATIONS ---

  const last7DaysData = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => t.date === dStr);
      const planned = dayTasks.reduce((sum, t) => sum + Number(t.plannedMinutes || 0), 0) / 60;
      const actual = dayTasks.reduce((sum, t) => sum + (t.status === 'Completed' ? Number(t.actualMinutes || t.plannedMinutes || 0) : 0), 0) / 60;
      const name = d.toLocaleDateString('en-US', { weekday: 'short' });
      list.push({
        name,
        Planned: Math.round(planned * 10) / 10,
        Actual: Math.round(actual * 10) / 10
      });
    }
    return list;
  }, [tasks]);

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

  const subjectCompletionData = useMemo(() => {
    return syllabus.map(subj => {
      const m = subjectMetrics[subj.id] || { completedConcepts: 0 };
      const total = subj.sections.reduce((acc, s) => acc + s.topics.length, 0) || 1;
      const pct = Math.round((m.completedConcepts / total) * 100);
      return {
        name: subj.id,
        Completion: pct
      };
    });
  }, [syllabus, subjectMetrics]);

  const pyqAccuracyData = useMemo(() => {
    const list = [];
    syllabus.forEach(subj => {
      const m = subjectMetrics[subj.id];
      if (m && m.attemptedPyqs > 0) {
        list.push({
          name: subj.id,
          Accuracy: m.pyqAccuracy || 0
        });
      }
    });
    return list;
  }, [syllabus, subjectMetrics]);

  const errorCategoryData = useMemo(() => {
    const categories = ['Silly Mistake', 'Concept Gap', 'Calculation Error', 'Misread Question', 'Time Management'];
    return categories.map(cat => {
      const count = mistakes.filter(m => m.mistakeType === cat).length;
      return {
        name: cat,
        Count: count
      };
    });
  }, [mistakes]);

  const heatmapData = useMemo(() => {
    const grid = [];
    const todayObj = new Date();
    const startOffset = 55 + todayObj.getDay();
    const startDate = new Date(todayObj);
    startDate.setDate(todayObj.getDate() - startOffset);

    for (let i = 0; i <= startOffset; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const count = tasks.filter(t => t.date === dStr && t.status === 'Completed').length;
      grid.push({
        date: dStr,
        dayNum: d.getDate(),
        monthNum: d.getMonth(),
        dayOfWeek: d.getDay(),
        count
      });
    }
    return grid;
  }, [tasks]);



  // 2. METRICS & COUNTS
  const totalTopicsCount = useMemo(() => {
    let count = 0;
    syllabus.forEach(subj => {
      subj.sections.forEach(sec => {
        count += sec.topics.length;
      });
    });
    return count;
  }, [syllabus]);

  // Completed topics are topics where a matching task is completed or has completions
  // Let's count completed topics from tasks or a topic completion map
  const completedTopicsCount = useMemo(() => {
    const completedTopicIds = new Set(
      tasks
        .filter(t => t.type === 'concept' && t.status === 'Completed' && t.topicId)
        .map(t => t.topicId)
    );
    return completedTopicIds.size;
  }, [tasks]);

  const syllabusProgressPct = useMemo(() => {
    if (totalTopicsCount === 0) return 0;
    return Math.round((completedTopicsCount / totalTopicsCount) * 100);
  }, [completedTopicsCount, totalTopicsCount]);

  const completedLecturesCount = useMemo(() => {
    return tasks.filter(t => t.type === 'lecture' && t.status === 'Completed').length;
  }, [tasks]);

  const totalLecturesCount = useMemo(() => {
    // Return lectures in tasks or default to completed + pending
    const total = tasks.filter(t => t.type === 'lecture').length;
    return total > 0 ? total : 200; // default seed fallback
  }, [tasks]);

  const lectureProgressPct = useMemo(() => {
    if (totalLecturesCount === 0) return 0;
    return Math.round((completedLecturesCount / totalLecturesCount) * 100);
  }, [completedLecturesCount, totalLecturesCount]);

  const completedPyqsCount = useMemo(() => {
    return pyqSessions.length;
  }, [pyqSessions]);

  const totalPyqsTarget = 150; // target PYQ sessions for GATE prep
  const pyqProgressPct = useMemo(() => {
    const pct = Math.round((completedPyqsCount / totalPyqsTarget) * 100);
    return pct > 100 ? 100 : pct;
  }, [completedPyqsCount]);

  const revisionCompletionPct = useMemo(() => {
    const revisions = tasks.filter(t => t.type === 'revision');
    if (revisions.length === 0) return 0;
    const completed = revisions.filter(r => r.status === 'Completed').length;
    return Math.round((completed / revisions.length) * 100);
  }, [tasks]);

  const overdueRevisions = useMemo(() => {
    return tasks.filter(t => t.type === 'revision' && t.status === 'Pending' && t.date < todayStr);
  }, [tasks, todayStr]);

  const backlogTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'Pending' && t.date < todayStr);
  }, [tasks, todayStr]);

  const weeklyStatsData = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const limitDateStr = `${oneWeekAgo.getFullYear()}-${String(oneWeekAgo.getMonth() + 1).padStart(2, '0')}-${String(oneWeekAgo.getDate()).padStart(2, '0')}`;

    const thisWeekTasks = tasks.filter(t => t.date >= limitDateStr && t.date <= todayStr);
    const completedTasksThisWeek = thisWeekTasks.filter(t => t.status === 'Completed');
    
    const plannedMinutes = thisWeekTasks.reduce((sum, t) => sum + Number(t.plannedMinutes || 0), 0);
    const actualMinutes = completedTasksThisWeek.reduce((sum, t) => sum + Number(t.actualMinutes || t.plannedMinutes || 0), 0);

    const completionRate = thisWeekTasks.length > 0 
      ? Math.round((completedTasksThisWeek.length / thisWeekTasks.length) * 100) 
      : 0;

    const weekPyqs = pyqSessions.filter(p => p.date >= limitDateStr && p.date <= todayStr);
    const pyqsAttempted = weekPyqs.reduce((sum, p) => sum + Number(p.attempted || 0), 0);
    const pyqsCorrect = weekPyqs.reduce((sum, p) => sum + Number(p.correct || 0), 0);
    const pyqAccuracy = pyqsAttempted > 0 ? Math.round((pyqsCorrect / pyqsAttempted) * 100) : 0;

    const weekTests = testAttempts.filter(t => t.date >= limitDateStr && t.date <= todayStr);
    const averageTestScore = weekTests.length > 0 
      ? Math.round((weekTests.reduce((sum, t) => sum + (t.score / t.totalMarks * 100), 0) / weekTests.length) * 10) / 10 
      : null;

    return {
      plannedHours: Math.round((plannedMinutes / 60) * 10) / 10,
      actualHours: Math.round((actualMinutes / 60) * 10) / 10,
      completionRate,
      completedCount: completedTasksThisWeek.length,
      totalCount: thisWeekTasks.length,
      pyqsAttempted,
      pyqAccuracy,
      testsCount: weekTests.length,
      averageTestScore,
      backlogCount: backlogTasks.length,
      overdueRevisionsCount: overdueRevisions.length
    };
  }, [tasks, pyqSessions, testAttempts, todayStr, backlogTasks, overdueRevisions]);

  const streakDays = useMemo(() => {
    // Simple streak calculation: find contiguous past days with at least one completed task
    const completedDates = new Set(
      tasks
        .filter(t => t.status === 'Completed' && t.date)
        .map(t => t.date)
    );
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (completedDates.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow streak to continue if checking today and today has no completions yet, but yesterday did
        if (streak === 0 && checkStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  }, [tasks, todayStr]);

  // 3. TODAY'S SCHEDULE BLOCKS TEMPLATE
  const dayOfWeek = useMemo(() => new Date().getDay(), []); // 0 = Sun, 6 = Sat
  const isSecondOrFourthSaturday = useMemo(() => {
    if (dayOfWeek !== 6) return false;
    const dayOfMonth = new Date().getDate();
    const week = Math.ceil(dayOfMonth / 7);
    return week === 2 || week === 4;
  }, [dayOfWeek]);

  const studyBlocks = useMemo(() => {
    if (isSemesterMode) {
      return [
        {
          name: 'GATE Semester Maintenance',
          duration: '1 - 2 Hours',
          focus: 'Spaced revision, mistake book, formula sheets, light PYQ recall',
          desc: 'Keep GATE knowledge fresh without over-stressing during college semester exams.'
        }
      ];
    }

    if (dayOfWeek === 0) {
      // Sunday
      return [
        {
          name: 'Sunday Block 1: Revision',
          duration: '1.5 Hours',
          focus: 'Weekly revision / active recall on low confidence topics',
          desc: 'Solidify whatever you studied this week.'
        },
        {
          name: 'Sunday Block 2: mixed PYQs',
          duration: '1.5 Hours',
          focus: 'Solve past year papers or mixed topic questions',
          desc: 'Test your retention across multiple units.'
        },
        {
          name: 'Sunday Block 3: Mock / Planning',
          duration: '1 Hour',
          focus: 'Subject/Mini test, deep analysis, plan next week',
          desc: 'Log test mistakes, analyze gaps, schedule tasks.'
        }
      ];
    }

    if (dayOfWeek === 6) {
      // Saturday
      return [
        {
          name: 'Saturday Block 1: revision',
          duration: '1 Hour',
          focus: 'Review mistake book & quick notes',
          desc: 'Re-examine past errors.'
        },
        {
          name: 'Saturday Block 2: PYQs',
          duration: '1 Hour',
          focus: 'Solve tricky/medium level questions',
          desc: 'Keep up problem solving speed.'
        },
        {
          name: 'Saturday Block 3: backlog',
          duration: '1 Hour',
          focus: 'Catch up on incomplete weekly tasks',
          desc: isSecondOrFourthSaturday 
            ? 'College Holiday today! Take extra catch-up time if needed, otherwise rest.'
            : 'Backlog analysis and cleanup.'
        }
      ];
    }

    // Monday - Friday normal
    return [
      {
        name: 'Block 1: New concepts',
        duration: '2 Hours',
        focus: 'GO Classes lectures & learning new topics',
        desc: 'Understand principles and add core notes.'
      },
      {
        name: 'Block 2: PYQ Solving',
        duration: '2 Hours',
        focus: 'Solve GATE PYQs (Topic-wise)',
        desc: 'Maintain a minimum target of 20-30 questions.'
      },
      {
        name: 'Block 3: Revision / recall',
        duration: '1 Hour',
        focus: 'Spaced revision / mistake book review / mini test',
        desc: 'Active recall ensures information is retained.'
      }
    ];
  }, [dayOfWeek, isSemesterMode, isSecondOrFourthSaturday]);

  // Today's concrete tasks (revisions, lectures, tests scheduled for today)
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.date === todayStr);
  }, [tasks, todayStr]);

  // Study hours summary
  const plannedHoursToday = useMemo(() => {
    if (isSemesterMode) return 1.5;
    if (dayOfWeek === 0) return 4;
    if (dayOfWeek === 6) return 3;
    return 5;
  }, [dayOfWeek, isSemesterMode]);

  const actualHoursToday = useMemo(() => {
    const mins = todayTasks.reduce((sum, t) => sum + (t.status === 'Completed' ? Number(t.actualMinutes || t.plannedMinutes || 0) : 0), 0);
    return Math.round((mins / 60) * 10) / 10;
  }, [todayTasks]);

  // Status check: "GATE Semester Maintenance Mode" / "Behind Schedule" / "On Track"
  const scheduleStatus = useMemo(() => {
    if (isSemesterMode) {
      const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
      return completedToday >= 1 ? 'GATE Semester Maintenance Mode (Active)' : 'GATE Semester Maintenance Mode';
    }
    if (backlogTasks.length > 5) return 'Behind Schedule';
    return 'On Track';
  }, [isSemesterMode, backlogTasks, todayTasks]);

  // 4. WEAKEST TOPICS
  // Topics with the lowest PYQ accuracy or highest mistakes count
  const weakTopicsList = useMemo(() => {
    const topicAccuracy = {};
    const topicAttempts = {};
    pyqSessions.forEach(session => {
      if (!session.topicId) return;
      const att = Number(session.attempted || 0);
      const corr = Number(session.correct || 0);
      if (!topicAttempts[session.topicId]) {
        topicAttempts[session.topicId] = 0;
        topicAccuracy[session.topicId] = 0;
      }
      topicAttempts[session.topicId] += att;
      topicAccuracy[session.topicId] += corr;
    });

    const list = [];
    Object.keys(topicAttempts).forEach(tId => {
      const attempts = topicAttempts[tId];
      const correct = topicAccuracy[tId];
      const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
      
      // Find subject name and topic name
      let topicName = tId;
      let subjectName = '';
      syllabus.forEach(subj => {
        subj.sections.forEach(sec => {
          const matchingTopic = sec.topics.find(t => t.id === tId);
          if (matchingTopic) {
            topicName = matchingTopic.name;
            subjectName = subj.name;
          }
        });
      });

      list.push({
        id: tId,
        name: topicName,
        subject: subjectName,
        accuracy,
        attempts
      });
    });

    // Sort by accuracy ascending (lowest accuracy first)
    return list.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  }, [pyqSessions, syllabus]);

  // 5. DATA EXPORT FUNCTIONALITY
  const handleExportData = (type) => {
    const dataObj = {
      user: user.email,
      exportDate: new Date().toISOString(),
      tasks,
      pyqSessions,
      testAttempts,
      mistakes,
      recallCards,
      weeklyReviews
    };

    if (type === 'json') {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataObj, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `GATE_2027_StudyTracker_Backup_${todayStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('JSON backup file downloaded successfully!');
    } else {
      // CSV format export for Tasks
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'ID,Date,Title,Type,SubjectId,TopicId,PlannedMinutes,ActualMinutes,Status,Priority,Note,CompletedAt\n';
      
      tasks.forEach(t => {
        const row = [
          t.id || '',
          t.date || '',
          `"${(t.title || '').replace(/"/g, '""')}"`,
          t.type || '',
          t.subjectId || '',
          t.topicId || '',
          t.plannedMinutes || 0,
          t.actualMinutes || 0,
          t.status || '',
          t.priority || '',
          `"${(t.note || '').replace(/"/g, '""')}"`,
          t.completedAt || ''
        ].join(',');
        csvContent += row + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodedUri);
      downloadAnchor.setAttribute('download', `GATE_2027_Tasks_${todayStr}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('CSV tasks backup file downloaded successfully!');
    }
  };

  // Toggle task completion
  const handleToggleTask = (task) => {
    const updated = {
      ...task,
      status: task.status === 'Completed' ? 'Pending' : 'Completed',
      completedAt: task.status === 'Completed' ? null : Date.now()
    };
    saveTask(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header / Streak / Semester Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            GATE 2027 Study Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Focus: Active recall, error elimination, and consistent daily study blocks.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Consistency Streak */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Streak</p>
              <p className="text-sm font-extrabold text-amber-400">{streakDays} Days</p>
            </div>
          </div>

          {/* Days Remaining */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Days Left</p>
              <p className="text-sm font-extrabold text-indigo-400">{daysRemaining} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Mode Banner */}
      {isSemesterMode && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-violet-950 to-indigo-900 border border-violet-500/30 p-5 shadow-2xl animate-pulse">
          <div className="absolute top-0 right-0 p-3 text-3xl opacity-30 select-none">🎓</div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/25 text-violet-300 border border-violet-400/20">
                Active Phase
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5">
                SEMESTER EXAM PERIOD — GATE MAINTENANCE MODE
              </h2>
              <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
                Priority shifted to college examinations. GATE targets are automatically scaled down to 1–2 hours per day. Rest easy: reduced study is expected and will not trigger penalty flags.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-indigo-400">GATE Target</p>
              <p className="text-xl font-black text-violet-300">1 - 2 hrs/day</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top-level Performance Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Syllabus Completion</span>
            <span className="text-xs font-bold text-violet-400">{syllabusProgressPct}%</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-white group-hover:text-violet-300 transition-colors">
              {completedTopicsCount} <span className="text-xs text-slate-500 font-normal">/ {totalTopicsCount} topics</span>
            </p>
            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${syllabusProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lectures Watched</span>
            <span className="text-xs font-bold text-indigo-400">{lectureProgressPct}%</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">
              {completedLecturesCount} <span className="text-xs text-slate-500 font-normal">/ {totalLecturesCount}</span>
            </p>
            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${lectureProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PYQ Session Target</span>
            <span className="text-xs font-bold text-emerald-400">{pyqProgressPct}%</span>
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
              {completedPyqsCount} <span className="text-xs text-slate-500 font-normal">/ {totalPyqsTarget} sessions</span>
            </p>
            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${pyqProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Schedule Status</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
              scheduleStatus.includes('Maintenance') 
                ? 'bg-violet-950 text-violet-300 border border-violet-500/20' 
                : scheduleStatus === 'On Track' 
                ? 'bg-emerald-950 text-emerald-400' 
                : 'bg-rose-950 text-rose-400'
            }`}>
              {scheduleStatus.includes('Maintenance') ? 'Maintenance' : scheduleStatus}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-sm font-extrabold text-white leading-tight">
              {scheduleStatus.includes('Maintenance') 
                ? 'Semester Mode Active' 
                : scheduleStatus === 'On Track' 
                ? 'All goals on track' 
                : `${backlogTasks.length} backlog tasks detected`}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {overdueRevisions.length} revision reviews pending.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Sub-tabs / Filters */}
      <div className="flex border-b border-slate-800">
        {[
          { id: 'overview', label: 'Plan & Blocks' },
          { id: 'today', label: "Today's Plan Tasks" },
          { id: 'weak-areas', label: 'Weak Topics' },
          { id: 'upcoming', label: 'Upcoming Milestones' },
          { id: 'analytics', label: '📊 Analytics Center' },
          { id: 'weekly', label: '📅 Weekly Review' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
              activeSubTab === tab.id 
                ? 'border-violet-500 text-violet-400 bg-violet-500/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Sub-tab Content Rendering */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Blocks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Study Blocks Plan — {dayOfWeek === 0 ? 'Sunday' : dayOfWeek === 6 ? 'Saturday' : 'Weekday'} Routine
              </h3>
              <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700/50">
                Target: {plannedHoursToday} hrs
              </span>
            </div>

            <div className="space-y-3">
              {studyBlocks.map((block, idx) => (
                <div key={idx} className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 flex gap-4 hover:border-violet-500/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
                    B{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{block.name}</h4>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300">
                        {block.duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-1">Focus: {block.focus}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{block.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info / Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Settings</h3>
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 space-y-4">
              {/* Strict Syllabus Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Strict Syllabus Order</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Enforce sequential roadmap learning</p>
                </div>
                <button
                  onClick={() => setStrictSyllabusMode(!strictSyllabusMode)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    strictSyllabusMode ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${
                    strictSyllabusMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {!strictSyllabusMode && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 leading-normal">
                  ⚠️ Official syllabus order is overridden. Topic recommendations may appear out of sequence.
                </div>
              )}

              {/* Data Export / Backups */}
              <div className="pt-2 border-t border-slate-700/40">
                <h4 className="text-xs font-bold text-white mb-2">Export & Backup</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExportData('json')}
                    className="py-1.5 px-3 rounded-lg border border-slate-700 hover:border-violet-500/40 hover:bg-slate-800/80 text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1 transition-all"
                  >
                    📥 JSON Backup
                  </button>
                  <button
                    onClick={() => handleExportData('csv')}
                    className="py-1.5 px-3 rounded-lg border border-slate-700 hover:border-violet-500/40 hover:bg-slate-800/80 text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1 transition-all"
                  >
                    📊 CSV Tasks
                  </button>
                </div>
              </div>

              {/* Calendar Seeder Actions */}
              <div className="pt-2 border-t border-slate-700/40">
                <h4 className="text-xs font-bold text-white mb-2">Seeder Actions</h4>
                <button
                  type="button"
                  onClick={() => seedGateCalendar(saveTask, tasks, showToast)}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-900/20"
                >
                  🚀 Initialize GATE Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'today' && (
        <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">TODAY'S STUDY LIST</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Tasks scheduled for YYYY-MM-DD: {todayStr}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Hours Tracked</p>
              <p className="text-sm font-extrabold text-violet-400">{actualHoursToday} / {plannedHoursToday} Hrs</p>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div className="py-8 text-center bg-slate-900/50 rounded-xl border border-slate-800">
              <span className="text-2xl">🎉</span>
              <h4 className="text-xs font-semibold text-slate-400 mt-2">No tasks scheduled for today.</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">
                Use your general blocks structure (concepts, revisions, PYQs) to make progress, or add new tasks in the Tasks & Calendar module.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {todayTasks.map(t => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(t)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        t.status === 'Completed' 
                          ? 'bg-violet-600 border-violet-500 text-white' 
                          : 'border-slate-700 hover:border-slate-500 bg-slate-900'
                      }`}
                    >
                      {t.status === 'Completed' && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold ${t.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                          {t.type}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          Target: {t.plannedMinutes || 30} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      t.priority === 'High' ? 'bg-rose-950 text-rose-300' : t.priority === 'Medium' ? 'bg-indigo-950 text-indigo-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'weak-areas' && (
        <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weak Areas Finder</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Identified based on accuracy logs from PYQ problem-solving sessions.</p>
          </div>

          {weakTopicsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-900/30 border border-slate-800 rounded-xl">
              📉 Not enough PYQ session data to evaluate weak areas. Start logging PYQ sessions to populate this tab.
            </div>
          ) : (
            <div className="space-y-4">
              {weakTopicsList.map(w => (
                <div key={w.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">{w.subject}</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{w.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Logged attempts: {w.attempts} questions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500">PYQ Accuracy</p>
                    <p className={`text-lg font-black ${
                      w.accuracy < 50 ? 'text-rose-400' : w.accuracy < 75 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {w.accuracy}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'upcoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Overdue Revisions */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Overdue Spaced Revisions</h3>
            {overdueRevisions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-900/20 border border-slate-800 rounded-xl">
                ✨ Zero overdue revision tasks. You are on track!
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-2">
                {overdueRevisions.map(rev => (
                  <div key={rev.id} className="bg-slate-900/50 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300">{rev.title}</h4>
                      <p className="text-[10px] text-rose-400 mt-0.5">Due: {rev.date}</p>
                    </div>
                    <button
                      onClick={() => handleToggleTask(rev)}
                      className="py-1 px-2.5 rounded bg-violet-600/20 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/30 text-[10px] font-bold transition-all"
                    >
                      Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject Timeline Milestones */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Subject Milestones</h3>
            <div className="space-y-3">
              {syllabus.map(s => {
                const isActive = todayStr >= s.timeline.start && todayStr <= s.timeline.end;
                const isCompleted = todayStr > s.timeline.end;
                return (
                  <div key={s.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    isActive 
                      ? 'bg-violet-950/20 border-violet-500/40' 
                      : isCompleted 
                      ? 'bg-slate-900/30 border-slate-800 opacity-60' 
                      : 'bg-slate-900/10 border-slate-800/40'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{s.name}</span>
                        {isActive && (
                          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-900 text-violet-300">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Timeline: {s.timeline.start} to {s.timeline.end}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{s.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {/* Consistency Heatmap */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Study Consistency Heatmap</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Visual representation of completed study goals over the past 8 weeks.</p>
            </div>
            
            {/* Heatmap Grid */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-2 overflow-x-auto">
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {heatmapData.map((cell, idx) => {
                  let colorClass = 'bg-slate-900 border-slate-850';
                  if (cell.count === 1) colorClass = 'bg-indigo-950 border-indigo-500/10 text-indigo-400';
                  else if (cell.count === 2) colorClass = 'bg-indigo-800/40 border-indigo-500/20 text-indigo-300';
                  else if (cell.count >= 3) colorClass = 'bg-indigo-600/60 border-indigo-400/30 text-indigo-100';

                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-sm border ${colorClass} transition-all duration-300 hover:scale-125`}
                      title={`${cell.date}: ${cell.count} task(s) completed`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 text-[10px] text-slate-400 sm:border-l sm:border-slate-800 sm:pl-4 self-stretch justify-center">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm border bg-slate-900 border-slate-850" />
                <div className="w-3 h-3 rounded-sm border bg-indigo-950 border-indigo-500/10" />
                <div className="w-3 h-3 rounded-sm border bg-indigo-800/40 border-indigo-500/20" />
                <div className="w-3 h-3 rounded-sm border bg-indigo-600/60 border-indigo-400/30" />
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Study Hours */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Study Hours (Planned vs Actual)</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="Planned" stroke="#818cf8" fillOpacity={1} fill="url(#colorPlanned)" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="Actual" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorActual)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Subject Completion */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Subject Syllabus Completion (%)</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="Completion" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {subjectCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.Completion === 100 ? '#10b981' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: PYQ Accuracy */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">PYQ Accuracy by Subject (%)</h4>
              <div className="h-56">
                {pyqAccuracyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
                    Not enough data yet. Log PYQ sessions.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pyqAccuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 4: Error Categories */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mistakes error type breakdown</h4>
              <div className="h-56">
                {mistakes.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
                    No mistakes logged in mistake book yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={errorCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="Count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'weekly' && (
        <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Review & Planning</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Reflect on the past 7 days of your preparation and plan goals for the next week.</p>
          </div>

          {/* Grid of stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <p className="text-[9px] font-bold text-slate-500 uppercase">Weekly Study Hours</p>
              <p className="text-sm font-extrabold text-white mt-1">
                {weeklyStatsData.actualHours} hrs <span className="text-[10px] text-slate-500 font-normal">/ {weeklyStatsData.plannedHours} planned</span>
              </p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <p className="text-[9px] font-bold text-slate-500 uppercase">Goal Completion Rate</p>
              <p className="text-sm font-extrabold text-indigo-400 mt-1">
                {weeklyStatsData.completionRate}% <span className="text-[10px] text-slate-500 font-normal">({weeklyStatsData.completedCount}/{weeklyStatsData.totalCount} goals)</span>
              </p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <p className="text-[9px] font-bold text-slate-500 uppercase">PYQs Attempted</p>
              <p className="text-sm font-extrabold text-emerald-400 mt-1">
                {weeklyStatsData.pyqsAttempted} qs <span className="text-[10px] text-slate-500 font-normal">({weeklyStatsData.pyqAccuracy}% accuracy)</span>
              </p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <p className="text-[9px] font-bold text-slate-500 uppercase">Tests Taken</p>
              <p className="text-sm font-extrabold text-violet-400 mt-1">
                {weeklyStatsData.testsCount} tests <span className="text-[10px] text-slate-500 font-normal">{weeklyStatsData.averageTestScore !== null ? `(${weeklyStatsData.averageTestScore}% avg)` : ''}</span>
              </p>
            </div>
          </div>

          {/* Form for reflection & goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Weekly Reflection (What went well / What can be improved)</label>
              <textarea
                value={weeklyReflection}
                onChange={(e) => setWeeklyReflection(e.target.value)}
                placeholder="Write down your self-assessment, study gaps, and lessons learned..."
                rows="5"
                className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Next Week Goals & Focus Subjects</label>
              <textarea
                value={weeklyGoals}
                onChange={(e) => setWeeklyGoals(e.target.value)}
                placeholder="Outline subject milestones, daily schedules, and mock goals for next week..."
                rows="5"
                className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800/50">
            <button
              type="button"
              onClick={async () => {
                if (!weeklyReflection.trim() && !weeklyGoals.trim()) {
                  showToast('Please fill out reflection or goals before saving.');
                  return;
                }
                const review = {
                  id: `week-${Date.now().toString(36)}`,
                  weekStart: new Date().toISOString().split('T')[0],
                  reflection: weeklyReflection.trim(),
                  goals: weeklyGoals.trim(),
                  actualHours: weeklyStatsData.actualHours,
                  plannedHours: weeklyStatsData.plannedHours,
                  createdAt: Date.now()
                };
                await saveWeeklyReview(review);
                showToast('Weekly review reflections saved to your profile!');
                setWeeklyReflection('');
                setWeeklyGoals('');
              }}
              className="py-2 px-6 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white transition-all shadow-lg shadow-violet-950/20"
            >
              Save Reflections & Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
