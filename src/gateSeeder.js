// GATE 2027 Calendar Seeder Utility
// Generates date-specific study tasks according to 6hr daily GO Classes schedule
// Filtered removed topics, Nov OFF, 70% completed by Oct 30, 30% in Dec-Jan
import { GATE_SYLLABUS } from './gateSyllabus';

export const seedGateCalendar = async (saveTask, existingTasks, showToast) => {
  if (existingTasks && existingTasks.length > 30) {
    if (!window.confirm("This will generate the updated 6-hour GO Classes GATE 2027 schedule in your calendar. Proceed?")) {
      return;
    }
  }

  showToast("Generating official GO Classes GATE 2027 6-hour daily schedule... Please wait.");

  const start = new Date('2026-09-22T00:00:00');
  const end = new Date('2027-02-05T00:00:00');

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

  // Track topic index per subject
  const topicIndices = {};
  GATE_SYLLABUS.forEach(s => {
    topicIndices[s.id] = 0;
  });

  let currentDate = new Date(start);
  let count = 0;

  while (currentDate <= end) {
    const dateStr = fmt(currentDate);
    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat

    // Check if November Month Off (Nov 1 to Nov 30)
    const isNovOff = dateStr >= '2026-11-01' && dateStr <= '2026-11-30';

    // Find active subject for today
    let activeSubject = null;
    for (let subj of GATE_SYLLABUS) {
      if (subj.id !== 'GA' && dateStr >= subj.timeline.start && dateStr <= subj.timeline.end) {
        activeSubject = subj;
        break;
      }
    }

    if (isNovOff) {
      // November Month Off - Only schedule 1 light weekly check-in task on Mondays
      if (dayOfWeek === 1) {
        const novTask = {
          id: `gate-nov-off-${dateStr}`,
          name: `November Month Off: Semester Exams & Light Formula Review`,
          title: `November Month Off: Semester Exams & Light Formula Review`,
          subjectId: 'OFF',
          topicId: '',
          type: 'semester',
          date: dateStr,
          dueDate: dateStr,
          priority: 'Low',
          status: 'Pending',
          plannedMinutes: 60,
          actualMinutes: 0,
          note: 'November scheduled break / Semester exam period. GATE syllabus study paused.',
          completedAt: null,
          category: 'GATE Break'
        };
        await saveTask(novTask);
        count++;
      }
    } else if (activeSubject) {
      const topics = subjectTopics[activeSubject.id] || [];
      const currentTopicIdx = topicIndices[activeSubject.id] || 0;
      const currentTopic = topics[currentTopicIdx % (topics.length || 1)];

      if (dayOfWeek === 0) {
        // Sunday: Full Weekly Revision & PYQ Marathon (6 Hours)
        const sunTask1 = {
          id: `gate-sun-rev-${activeSubject.id}-${dateStr}`,
          name: `Sunday Marathon (3.5h): Weekly Revision & Subject PYQs [${activeSubject.name}]`,
          title: `Sunday Marathon (3.5h): Weekly Revision & Subject PYQs [${activeSubject.name}]`,
          subjectId: activeSubject.id,
          topicId: currentTopic ? currentTopic.id : '',
          type: 'revision',
          date: dateStr,
          dueDate: dateStr,
          priority: 'High',
          status: 'Pending',
          plannedMinutes: 210,
          actualMinutes: 0,
          note: 'Block 1 & 2: Comprehensive active recall of all topics covered this week.',
          completedAt: null,
          category: 'GATE'
        };
        await saveTask(sunTask1);
        count++;

        const sunTask2 = {
          id: `gate-sun-apt-${dateStr}`,
          name: `General Aptitude & English Test Practice (2.5h)`,
          title: `General Aptitude & English Test Practice (2.5h)`,
          subjectId: 'GA',
          topicId: 'GA-1-1',
          type: 'test',
          date: dateStr,
          dueDate: dateStr,
          priority: 'Medium',
          status: 'Pending',
          plannedMinutes: 150,
          actualMinutes: 0,
          note: 'Block 3: Quantitative Aptitude, Logical Reasoning & Verbal practice.',
          completedAt: null,
          category: 'GATE'
        };
        await saveTask(sunTask2);
        count++;

      } else {
        // Regular Study Days (Mon - Sat): Structured 6-Hour Schedule
        if (currentTopic) {
          // Block 1: GO Classes Concepts & Lectures (2.5 Hours / 150 Mins)
          const conceptTask = {
            id: `gate-lec-${currentTopic.id}-${dateStr}`,
            name: `Block 1 (2.5h): Study ${currentTopic.name} [${activeSubject.id}]`,
            title: `Block 1 (2.5h): Study ${currentTopic.name} [${activeSubject.id}]`,
            subjectId: activeSubject.id,
            topicId: currentTopic.id,
            type: 'concept',
            date: dateStr,
            dueDate: dateStr,
            priority: 'High',
            status: 'Pending',
            plannedMinutes: 150,
            actualMinutes: 0,
            note: `GO Classes Lectures & Notes: Learn core theory and derivations for ${currentTopic.name}.`,
            completedAt: null,
            category: 'GATE'
          };
          await saveTask(conceptTask);
          count++;

          // Block 2: GATE PYQ Practice (2.5 Hours / 150 Mins)
          const pyqTask = {
            id: `gate-pyq-${currentTopic.id}-${dateStr}`,
            name: `Block 2 (2.5h): Solve PYQs for ${currentTopic.name}`,
            title: `Block 2 (2.5h): Solve PYQs for ${currentTopic.name}`,
            subjectId: activeSubject.id,
            topicId: currentTopic.id,
            type: 'pyq',
            date: dateStr,
            dueDate: dateStr,
            priority: 'High',
            status: 'Pending',
            plannedMinutes: 150,
            actualMinutes: 0,
            note: `Solve 20-30 GATE PYQs for ${currentTopic.name}. Analyze errors and record in mistake book.`,
            completedAt: null,
            category: 'GATE'
          };
          await saveTask(pyqTask);
          count++;

          // Advance topic index for next day
          topicIndices[activeSubject.id]++;
        }

        // Block 3: Daily Active Recall & Aptitude (1 Hour / 60 Mins)
        const dailyRevTask = {
          id: `gate-daily-rev-${dateStr}`,
          name: `Block 3 (1h): Spaced Recall & Aptitude Practice`,
          title: `Block 3 (1h): Spaced Recall & Aptitude Practice`,
          subjectId: activeSubject.id,
          topicId: '',
          type: 'revision',
          date: dateStr,
          dueDate: dateStr,
          priority: 'Medium',
          status: 'Pending',
          plannedMinutes: 60,
          actualMinutes: 0,
          note: `Active recall of previous topics, formula revision, and 30 mins General Aptitude/English.`,
          completedAt: null,
          category: 'GATE'
        };
        await saveTask(dailyRevTask);
        count++;
      }
    } else if (dateStr >= '2027-01-06') {
      // Mock Exam & Final Revision Phase (Jan 6 - Feb 5)
      if (dayOfWeek === 0 || dayOfWeek === 3) {
        const mockTask = {
          id: `gate-full-mock-${dateStr}`,
          name: `GATE Full-Length Mock Exam (3h) & Error Analysis (3h)`,
          title: `GATE Full-Length Mock Exam (3h) & Error Analysis (3h)`,
          subjectId: 'MOCK',
          topicId: '',
          type: 'test',
          date: dateStr,
          dueDate: dateStr,
          priority: 'High',
          status: 'Pending',
          plannedMinutes: 360,
          actualMinutes: 0,
          note: 'Official exam simulation. Attempt 65 questions in 3 hours, spend 3 hours analyzing mistakes.',
          completedAt: null,
          category: 'GATE'
        };
        await saveTask(mockTask);
        count++;
      } else {
        const finalRevTask = {
          id: `gate-final-marathon-${dateStr}`,
          name: `6-Hour Final Revision & Formula Marathon`,
          title: `6-Hour Final Revision & Formula Marathon`,
          subjectId: 'REVISION',
          topicId: '',
          type: 'revision',
          date: dateStr,
          dueDate: dateStr,
          priority: 'High',
          status: 'Pending',
          plannedMinutes: 360,
          actualMinutes: 0,
          note: 'Solve high-yield test series problems, review mistake notebook, revise formula sheets.',
          completedAt: null,
          category: 'GATE'
        };
        await saveTask(finalRevTask);
        count++;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  showToast(`Successfully scheduled ${count} tasks in your calendar for GATE 2027! 🎓🚀`);
};
