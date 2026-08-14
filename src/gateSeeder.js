// GATE 2027 Calendar Seeder Utility
// Generates date-specific study tasks from 14 Aug 2026 to 5 Feb 2027
import { GATE_SYLLABUS } from './gateSyllabus';

export const seedGateCalendar = async (saveTask, existingTasks, showToast) => {
  if (existingTasks.length > 50) {
    if (!window.confirm("You already have tasks in your calendar. Seeding again will overlay new tasks. Proceed?")) {
      return;
    }
  }

  showToast("Initializing GATE 2027 preparation calendar... Please wait.");

  const start = new Date('2026-08-14T00:00:00');
  const end = new Date('2027-02-05T00:00:00');
  
  // Helper to format date
  const fmt = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Map each subject to its topics list
  const subjectTopics = {};
  GATE_SYLLABUS.forEach(subj => {
    const list = [];
    subj.sections.forEach(sec => {
      sec.topics.forEach(top => {
        list.push({ id: top.id, name: top.name });
      });
    });
    subjectTopics[subj.id] = list;
  });

  // Track current topic index per subject to distribute them
  const topicIndices = {};
  GATE_SYLLABUS.forEach(s => {
    topicIndices[s.id] = 0;
  });

  let currentDate = new Date(start);
  let count = 0;

  while (currentDate <= end) {
    const dateStr = fmt(currentDate);
    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat
    
    // Check if Semester Exam period: 15 Nov 2026 - 5 Dec 2026
    const isSemPeriod = dateStr >= '2026-11-15' && dateStr <= '2026-12-05';
    
    // Check if recovery reset days: 6 Dec - 7 Dec 2026
    const isRecovery = dateStr === '2026-12-06' || dateStr === '2026-12-07';

    // Find what subject is scheduled for today
    let activeSubject = null;
    for (let subj of GATE_SYLLABUS) {
      if (dateStr >= subj.timeline.start && dateStr <= subj.timeline.end) {
        activeSubject = subj;
        break;
      }
    }

    if (isSemPeriod) {
      // Semester Exam Maintenance Mode
      // 1. Log a light GATE maintenance task
      const mTask = {
        id: `gate-sem-maint-${dateStr}`,
        title: `GATE Maintenance: Active Recall & Mistakes Review`,
        subjectId: activeSubject ? activeSubject.id : 'CO',
        topicId: '',
        type: 'revision',
        date: dateStr,
        priority: 'Medium',
        status: 'Pending',
        plannedMinutes: 90,
        actualMinutes: 0,
        note: 'Semester Exam Period. Focus on formulas, revision, and mistakes.',
        completedAt: null,
        category: 'GATE'
      };
      await saveTask(mTask);
      count++;

      // 2. Log a sample Semester Exam Task
      const semTask = {
        id: `sem-exam-${dateStr}`,
        title: `Semester Prep: Study subject topics & solve past papers`,
        subjectId: 'SEMESTER',
        topicId: '',
        type: 'semester',
        date: dateStr,
        priority: 'High',
        status: 'Pending',
        plannedMinutes: 180,
        actualMinutes: 0,
        note: 'University examination preparation.',
        completedAt: null,
        category: 'Semester Exam'
      };
      await saveTask(semTask);
      count++;

    } else if (isRecovery) {
      // Recovery & Reset Days
      const rTask = {
        id: `gate-recovery-${dateStr}`,
        title: `GATE Reset: Analyze Backlog & Organize December Schedule`,
        subjectId: 'RESET',
        topicId: '',
        type: 'revision',
        date: dateStr,
        priority: 'High',
        status: 'Pending',
        plannedMinutes: 120,
        actualMinutes: 0,
        note: 'Post-semester exam recovery. reset study routine.',
        completedAt: null,
        category: 'GATE'
      };
      await saveTask(rTask);
      count++;

    } else if (activeSubject) {
      // Normal study days
      const topics = subjectTopics[activeSubject.id] || [];
      const currentTopicIdx = topicIndices[activeSubject.id];
      const currentTopic = topics[currentTopicIdx % (topics.length || 1)];

      if (dayOfWeek === 0) {
        // Sunday: Weekly revision + mixed PYQs + reflection
        const sunTask = {
          id: `gate-sun-rev-${dateStr}`,
          title: `Sunday Review: Spaced Recall & Mixed PYQs [${activeSubject.id}]`,
          subjectId: activeSubject.id,
          topicId: currentTopic ? currentTopic.id : '',
          type: 'revision',
          date: dateStr,
          priority: 'High',
          status: 'Pending',
          plannedMinutes: 240,
          actualMinutes: 0,
          note: 'Sunday routine: weekly revision, mixed PYQs, and reflection.',
          completedAt: null,
          category: 'GATE'
        };
        await saveTask(sunTask);
        count++;

      } else if (dayOfWeek === 6) {
        // Saturday: Revision, PYQs, Backlog
        const satTask = {
          id: `gate-sat-backlog-${dateStr}`,
          title: `Saturday Study: Revision & Backlog cleanup [${activeSubject.id}]`,
          subjectId: activeSubject.id,
          topicId: currentTopic ? currentTopic.id : '',
          type: 'revision',
          date: dateStr,
          priority: 'Medium',
          status: 'Pending',
          plannedMinutes: 180,
          actualMinutes: 0,
          note: 'Saturday routine: 1h revision, 1h PYQs, 1h backlog/mistakes.',
          completedAt: null,
          category: 'GATE'
        };
        await saveTask(satTask);
        count++;

      } else {
        // Weekdays: Block 1 & 2
        // We will seed a Lecture Concept study task OR a PYQ practice task alternatively
        // If count is even, study next topic. If odd, practice PYQs.
        const isStudyDay = (dayOfWeek % 2 !== 0);

        if (isStudyDay && currentTopic) {
          const lTask = {
            id: `gate-lec-${currentTopic.id}-${dateStr}`,
            title: `Study: ${currentTopic.name} (GO Classes Lectures)`,
            subjectId: activeSubject.id,
            topicId: currentTopic.id,
            type: 'concept',
            date: dateStr,
            priority: 'High',
            status: 'Pending',
            plannedMinutes: 120,
            actualMinutes: 0,
            note: `Learn concepts and review syllabus details.`,
            completedAt: null,
            category: 'GATE'
          };
          await saveTask(lTask);
          count++;

          // Move to next topic index after scheduling both learning and practice
          topicIndices[activeSubject.id]++;

        } else if (currentTopic) {
          const pTask = {
            id: `gate-pyq-${currentTopic.id}-${dateStr}`,
            title: `Solve PYQs: ${currentTopic.name}`,
            subjectId: activeSubject.id,
            topicId: currentTopic.id,
            type: 'pyq',
            date: dateStr,
            priority: 'Medium',
            status: 'Pending',
            plannedMinutes: 120,
            actualMinutes: 0,
            note: `Attempt at least 20 past year GATE questions.`,
            completedAt: null,
            category: 'GATE'
          };
          await saveTask(pTask);
          count++;
        }

        // Daily Revision task (Block 3)
        const dRevTask = {
          id: `gate-daily-rev-${dateStr}`,
          title: `Daily Revision: Spaced Recall & mistake book`,
          subjectId: activeSubject.id,
          topicId: currentTopic ? currentTopic.id : '',
          type: 'revision',
          date: dateStr,
          priority: 'Low',
          status: 'Pending',
          plannedMinutes: 60,
          actualMinutes: 0,
          note: `Block 3 active recall.`,
          completedAt: null,
          category: 'GATE'
        };
        await saveTask(dRevTask);
        count++;
      }
    } else {
      // In-between periods (e.g. late Jan / early Feb mock phase)
      if (dateStr >= '2027-01-19') {
        // Final Revision & Mock Exams Phase
        if (dayOfWeek === 0 || dayOfWeek === 3) {
          // Full mocks on Sundays and Wednesdays
          const mockTask = {
            id: `gate-mock-test-${dateStr}`,
            title: `Full-Length Mock Exam & Error Analysis`,
            subjectId: 'MOCK',
            topicId: '',
            type: 'test',
            date: dateStr,
            priority: 'High',
            status: 'Pending',
            plannedMinutes: 180,
            actualMinutes: 0,
            note: 'Simulate official exam environment. Spend equal time analyzing mistakes.',
            completedAt: null,
            category: 'GATE'
          };
          await saveTask(mockTask);
          count++;
        } else {
          // Normal Revision
          const revTask = {
            id: `gate-final-rev-${dateStr}`,
            title: `Final Revision: Formula sheets, Mistakes & short notes`,
            subjectId: 'REVISION',
            topicId: '',
            type: 'revision',
            date: dateStr,
            priority: 'Medium',
            status: 'Pending',
            plannedMinutes: 120,
            actualMinutes: 0,
            note: 'Consolidate weak subjects and solve tricky PYQs.',
            completedAt: null,
            category: 'GATE'
          };
          await saveTask(revTask);
          count++;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  showToast(`Successfully seeded ${count} study tasks in your calendar! 🎓🚀`);
};
