import { Resource, WorksheetItem, LessonPlanItem } from '../types';

/**
 * Returns a complete Worksheet object for a resource, generating rich pedagogical defaults if not present
 */
export function getResourceWorksheet(resource: Resource): WorksheetItem {
  if (!resource) {
    return {
      id: 'ws-default',
      title: 'Curriculum Practice Worksheet',
      subtitle: 'Unit Review & Mastery Check',
      grade: '6',
      subject: 'Science',
      estimatedMinutes: 30,
      totalPoints: 25,
      instructions: 'Read each question carefully.',
      questions: [],
      answerKey: []
    };
  }

  if (resource.worksheet) {
    return resource.worksheet;
  }

  const samplePage = resource.samplePages?.[0];
  const title = `${resource.title || 'Curriculum'} - Student Practice Worksheet`;
  const subject = resource.subject || 'Science';
  const grade = resource.grade || '6';

  return {
    id: `ws-${resource.id || 'res-custom'}`,
    title: title,
    subtitle: resource.subtitle || `Unit Review & Mastery Check (Grade ${grade})`,
    grade: grade,
    subject: subject,
    estimatedMinutes: 30,
    totalPoints: 25,
    instructions: `Read each question carefully. For multiple-choice questions, circle the correct letter. For short answers, write clearly in complete sentences and show your work where applicable.`,
    questions: [
      {
        num: 1,
        prompt: `Define the primary core concept introduced in "${samplePage?.title || resource.title}". Explain why this concept is essential to ${subject}.`,
        type: 'short_answer',
        points: 5,
        hint: 'Refer to the introductory section and key terms.'
      },
      {
        num: 2,
        prompt: samplePage?.exercise?.question || `Which statement best describes the fundamental principle of ${resource.subtitle || resource.title}?`,
        type: 'multiple_choice',
        options: samplePage?.exercise?.options || [
          'It operates under standard physical and analytical laws.',
          'It varies randomly without predictable models.',
          'It is only applicable in theoretical laboratory environments.',
          'None of the above statements are accurate.'
        ],
        correctAnswer: samplePage?.exercise ? samplePage.exercise.options[samplePage.exercise.correctIndex] : 'It operates under standard physical and analytical laws.',
        points: 4
      },
      {
        num: 3,
        prompt: `List and briefly describe two real-world applications or historical examples related to ${resource.title} in Grade ${grade} studies.`,
        type: 'short_answer',
        points: 6
      },
      {
        num: 4,
        prompt: `Vocabulary Fill-in: Complete the sentence with the correct curriculum term: ________________ is maintained through continuous regulatory processes and systematic feedback loops.`,
        type: 'fill_in_blank',
        correctAnswer: samplePage?.keyTerms?.[0]?.term || 'Homeostasis / Equilibrium',
        points: 4
      },
      {
        num: 5,
        prompt: `Critical Thinking & Inquiry: If one key variable in this ${subject} system were altered or removed, predict two direct consequences and justify your reasoning with scientific or analytical evidence.`,
        type: 'short_answer',
        points: 6
      }
    ],
    answerKey: [
      {
        questionNum: 1,
        answer: `Comprehensive definition based on unit text: ${samplePage?.content?.[0] || 'Foundational principles governing the topic.'} (Award 5 pts for complete definition and clear application to ${subject}).`,
        explanation: 'Full credit requires accurate definition and relevance explanation.'
      },
      {
        questionNum: 2,
        answer: samplePage?.exercise ? `Option ${String.fromCharCode(65 + samplePage.exercise.correctIndex)}: ${samplePage.exercise.options[samplePage.exercise.correctIndex]}` : 'Option A',
        explanation: samplePage?.exercise?.explanation || 'Directly aligned with curriculum reading standards.'
      },
      {
        questionNum: 3,
        answer: 'Accept any two valid real-world examples discussed in the unit (3 pts each).',
        explanation: 'Examples must demonstrate understanding of practical utility.'
      },
      {
        questionNum: 4,
        answer: samplePage?.keyTerms?.[0]?.term || 'Homeostasis / Equilibrium',
        explanation: 'Direct vocabulary identification from reading material.'
      },
      {
        questionNum: 5,
        answer: 'Student must formulate a logical hypothesis predicting two specific consequences with sound supporting rationale (3 pts per consequence + justification).',
        explanation: 'Evaluates higher-order synthesis and inquiry.'
      }
    ]
  };
}

/**
 * Returns a complete structured Lesson Plan object for a resource, generating rich pedagogical defaults if not present
 */
export function getResourceLessonPlan(resource: Resource): LessonPlanItem {
  if (!resource) {
    return {
      id: 'lp-default',
      title: 'Curriculum Lesson Plan',
      unit: 'Unit 1: Foundations',
      grade: '6',
      subject: 'Science',
      duration: '45 - 60 Minutes',
      curriculumStandards: [],
      learningObjectives: [],
      essentialQuestions: [],
      requiredMaterials: [],
      vocabularyTerms: [],
      timeline: [],
      formativeAssessment: 'Active classroom check-in',
      differentiation: {
        support: 'Provide scaffolded vocabulary guides and visual models.',
        extension: 'Encourage independent investigation and extension problem solving.'
      },
      homeworkAssignment: 'Review key terms and complete assigned section exercises.'
    };
  }

  if (resource.lessonPlan) {
    return resource.lessonPlan;
  }

  const grade = resource.grade || '6';
  const subject = resource.subject || 'Science';
  const samplePage = resource.samplePages?.[0];

  return {
    id: `lp-${resource.id || 'res-custom'}`,
    title: `Lesson Plan: ${resource.title}`,
    unit: resource.subtitle || `Unit 1: Foundations of ${subject} (Grade ${grade})`,
    grade: grade,
    subject: subject,
    duration: '45 - 60 Minutes',
    curriculumStandards: [
      `DIS-${subject.toUpperCase().slice(0, 3)}.G${grade}.01: Demonstrate comprehension of core ${subject} principles and structured analytical methods.`,
      `DIS-${subject.toUpperCase().slice(0, 3)}.G${grade}.04: Apply inquiry-based reasoning to analyze models and solve multi-step problems.`,
      `CCSS/NGSS Alignment: Grade ${grade} Academic Competency Framework 2025-2026.`
    ],
    learningObjectives: [
      `Students will be able to define and identify key concepts associated with ${resource.title}.`,
      `Students will collaborate to analyze diagrams, models, and real-world case scenarios with 85% accuracy.`,
      `Students will synthesize their understanding through guided practice and independent worksheet assessment.`
    ],
    essentialQuestions: [
      `How does understanding ${resource.title} help us explain and solve real-world challenges in ${subject}?`,
      `What evidence supports the relationships and mechanisms introduced in this curriculum module?`
    ],
    requiredMaterials: [
      `Dewey International School Digital Flipbook / PDF Reader`,
      `Student Practice Worksheet (${resource.title})`,
      `Interactive Whiteboard / Projection Screen`,
      `Student Science/Math Notebooks & Writing Utensils`
    ],
    vocabularyTerms: samplePage?.keyTerms || [
      { term: 'Core Principle', definition: 'The foundational law or concept governing the topic.' },
      { term: 'Analytical Model', definition: 'A representation used to explain and predict behavior in systems.' },
      { term: 'Synthesis', definition: 'Combining separate elements to form a coherent whole.' }
    ],
    timeline: [
      {
        phase: '1. Warm-Up & Hook (Engage)',
        durationMin: 7,
        teacherRole: `Project the opening prompt from ${resource.title}. Pose the essential question: "${samplePage?.title || 'What makes this topic crucial?'}".`,
        studentRole: `Quick-write in notebooks for 3 minutes; turn and share with a partner (Think-Pair-Share).`
      },
      {
        phase: '2. Direct Instruction & Modeling (Explain)',
        durationMin: 15,
        teacherRole: `Walk through textbook pages 1–3 using the digital flipbook reader. Highlight key vocabulary terms and diagram components.`,
        studentRole: `Follow along in their individual digital portal, take structured Cornell notes, and highlight key terms.`
      },
      {
        phase: '3. Collaborative Guided Practice (Explore)',
        durationMin: 12,
        teacherRole: `Facilitate small group breakout stations. Guide student pairs through checking concept questions and discussing scenarios.`,
        studentRole: `Work in assigned partner pairs to solve Section 1 of the student worksheet and check each other's reasoning.`
      },
      {
        phase: '4. Independent Mastery & Assessment (Evaluate)',
        durationMin: 15,
        teacherRole: `Circulate room for formative check-ins. Provide targeted scaffolding for students requiring extra reinforcement.`,
        studentRole: `Complete questions 1 through 5 on the individual Student Practice Worksheet independently.`
      },
      {
        phase: '5. Wrap-Up & Exit Ticket',
        durationMin: 6,
        teacherRole: `Collect student worksheets. Prompt whole-class reflection: "Name one key takeaway and one question you still have."`,
        studentRole: `Submit completed exit ticket summary and pack up materials.`
      }
    ],
    formativeAssessment: `Observation during partner guided practice and rubric evaluation of the 5-question student practice worksheet. Mastery criterion: 80% or higher.`,
    differentiation: {
      support: `Provide sentence starters for short-answer questions, guided vocabulary glossaries with visual aids, and pair with a peer mentor.`,
      extension: `Prompt students to design an original inquiry experiment, write an extended analytical response, or model real-world application data.`
    },
    homeworkAssignment: `Review pages 1–4 in the Dewey Flipbook reader and complete the 3 reflection questions in the student workbook.`
  };
}

/**
 * Downloads a structured text/html document to the user's local downloads folder
 */
export function triggerFileDownload(filename: string, content: string, mimeType: string = 'text/html') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates the complete HTML string for a printable student worksheet
 */
export function generateWorksheetHTML(resource: Resource, includeAnswerKey: boolean = false): string {
  const ws = getResourceWorksheet(resource);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ws.title} - Dewey International School</title>
  <style>
    @page { size: A4; margin: 18mm 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 14px;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .school-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .sub-title {
      font-size: 13px;
      color: #2563eb;
      font-weight: 600;
      margin-top: 2px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .meta-item { display: flex; align-items: center; }
    .meta-label { font-weight: 700; color: #475569; margin-right: 6px; }
    .meta-line { flex: 1; border-bottom: 1px dotted #94a3b8; height: 16px; }
    .instructions {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 22px;
      font-size: 12.5px;
      color: #1e3a8a;
    }
    .instructions strong { color: #1e40af; }
    .question-block {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    .q-header {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .points {
      background: #e2e8f0;
      color: #334155;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 700;
    }
    .options-list {
      list-style: none;
      padding-left: 10px;
      margin: 8px 0;
    }
    .options-list li {
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .option-bubble {
      width: 18px;
      height: 18px;
      border: 1.5px solid #64748b;
      border-radius: 50%;
      display: inline-block;
    }
    .answer-space {
      border-bottom: 1px dotted #cbd5e1;
      height: 28px;
      margin-top: 8px;
    }
    .answer-box {
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      height: 80px;
      background: #fafafa;
      margin-top: 8px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    .answer-key-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 3px double #0f172a;
      page-break-before: always;
    }
    .badge-ak {
      background: #10b981;
      color: white;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 12px;
      display: inline-block;
      margin-bottom: 12px;
    }
    .print-btn {
      position: fixed;
      top: 15px;
      right: 15px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>

  <div class="header">
    <div>
      <div class="school-title">Dewey International School</div>
      <div class="sub-title">${resource.subject} Curriculum • Grade ${resource.grade}</div>
      <h1 style="font-size: 16px; margin: 6px 0 0 0; color: #0f172a;">${ws.title}</h1>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">${ws.subtitle || ''}</p>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">TOTAL SCORE: ____ / ${ws.totalPoints}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Est. Time: ${ws.estimatedMinutes} Mins</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Student Name:</span><span class="meta-line"></span></div>
    <div class="meta-item"><span class="meta-label">Date:</span><span class="meta-line"></span></div>
    <div class="meta-item"><span class="meta-label">Class/Section:</span><span class="meta-line"></span></div>
  </div>

  <div class="instructions">
    <strong>Instructions:</strong> ${ws.instructions}
  </div>

  <div class="questions">
    ${ws.questions.map((q) => `
      <div class="question-block">
        <div class="q-header">
          <span>Question ${q.num}: ${q.prompt}</span>
          <span class="points">${q.points} Points</span>
        </div>
        ${q.hint ? `<div style="font-size: 11.5px; color: #64748b; font-style: italic; margin-bottom: 6px;">Hint: ${q.hint}</div>` : ''}
        
        ${q.options && q.options.length > 0 ? `
          <ul class="options-list">
            ${q.options.map((opt, oIdx) => `
              <li>
                <span class="option-bubble"></span>
                <strong>${String.fromCharCode(65 + oIdx)}.</strong> ${opt}
              </li>
            `).join('')}
          </ul>
        ` : q.type === 'fill_in_blank' ? `
          <div class="answer-space"></div>
        ` : `
          <div class="answer-box"></div>
          <div class="answer-space"></div>
        `}
      </div>
    `).join('')}
  </div>

  ${includeAnswerKey ? `
    <div class="answer-key-section">
      <div class="badge-ak">TEACHER ANSWER KEY & SCORING RUBRIC</div>
      <h2 style="font-size: 16px; margin: 0 0 12px 0;">Curriculum Solutions: ${ws.title}</h2>
      <div style="display: grid; gap: 12px;">
        ${ws.answerKey.map((ak) => `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;">
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
              Question ${ak.questionNum} Solution:
            </div>
            <div style="font-size: 13px; color: #059669; font-weight: 600;">${ak.answer}</div>
            ${ak.explanation ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 3px;"><strong>Pedagogical Notes:</strong> ${ak.explanation}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <div class="footer">
    <span>Dewey International School • Curriculum Publishing & Assessment Portal</span>
    <span>Document ID: ${ws.id} • Academic Year 2025-2026</span>
  </div>
</body>
</html>`;
}

/**
 * Generates and triggers download of a printable, professionally formatted student worksheet
 */
export function downloadWorksheetDocument(resource: Resource, includeAnswerKey: boolean = false) {
  const safeTitle = resource.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Dewey_Worksheet_${safeTitle}_Grade${resource.grade}.html`;
  const html = generateWorksheetHTML(resource, includeAnswerKey);
  triggerFileDownload(filename, html, 'text/html');
}

/**
 * Opens browser print dialog for a worksheet document
 */
export function printWorksheetDocument(resource: Resource, includeAnswerKey: boolean = false) {
  const html = generateWorksheetHTML(resource, includeAnswerKey);
  printHTMLDocument(html);
}

/**
 * Generates the complete HTML string for a printable lesson plan supporting all scopes
 */
export function generateLessonPlanHTML(resourceOrPlan: Resource | LessonPlanItem): string {
  const lp: LessonPlanItem = (resourceOrPlan as Resource).lessonPlan 
    ? (resourceOrPlan as Resource).lessonPlan!
    : (resourceOrPlan as LessonPlanItem).title 
    ? (resourceOrPlan as LessonPlanItem)
    : getResourceLessonPlan(resourceOrPlan as Resource);

  const scopeLabel = lp.scope 
    ? (lp.scope === 'yearly' ? 'Yearly Curriculum Plan' 
       : lp.scope === 'quarter' ? 'Quarterly Pacing Plan'
       : lp.scope === 'monthly' ? 'Monthly Instructional Plan'
       : lp.scope === 'weekly' ? 'Weekly Plan'
       : 'Daily Lesson Plan')
    : 'Educator Lesson Plan';

  const timeDisplay = lp.timeDetails ? (
    lp.scope === 'daily' 
      ? `${lp.timeDetails.dateRange ? `Date: ${lp.timeDetails.dateRange} • ` : ''}${lp.timeDetails.classPeriod ? `${lp.timeDetails.classPeriod} • ` : ''}${lp.timeDetails.startTime && lp.timeDetails.endTime ? `${lp.timeDetails.startTime} - ${lp.timeDetails.endTime}` : lp.duration}`
      : lp.scope === 'weekly'
      ? `${lp.timeDetails.weekNumber ? `${lp.timeDetails.weekNumber} • ` : ''}${lp.timeDetails.dateRange ? `${lp.timeDetails.dateRange} • ` : ''}${lp.timeDetails.daysOfWeek ? lp.timeDetails.daysOfWeek.join(', ') : ''} (${lp.duration})`
      : lp.scope === 'monthly'
      ? `${lp.timeDetails.month || 'Month'} ${lp.timeDetails.academicYear || ''} • Total Hours: ${lp.timeDetails.totalHours || lp.duration}`
      : lp.scope === 'quarter'
      ? `${lp.timeDetails.quarter || 'Quarter'} • ${lp.timeDetails.academicYear || 'Academic Year'} • ${lp.duration}`
      : `Academic Year ${lp.timeDetails.academicYear || '2025-2026'} • ${lp.duration}`
  ) : lp.duration;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lp.title} - Dewey International School ${scopeLabel}</title>
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 13.5px;
    }
    .header {
      border-bottom: 3px solid #1e40af;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .school-title {
      font-size: 18px;
      font-weight: 800;
      color: #1e40af;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .scope-tag {
      display: inline-block;
      background: #1e40af;
      color: white;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 16px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      font-size: 12.5px;
    }
    .meta-field {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 10.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-weight: 700;
      color: #1e293b;
      font-size: 13px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .card-title {
      font-weight: 800;
      color: #1e40af;
      font-size: 11.5px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    ul { margin: 0; padding-left: 18px; }
    li { margin-bottom: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12.5px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #1e293b;
      color: white;
      font-weight: 700;
      font-size: 11.5px;
      text-transform: uppercase;
    }
    tr:nth-child(even) { background: #f8fafc; }
    .print-btn {
      position: fixed;
      top: 15px;
      right: 15px;
      background: #1e40af;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(30,64,175,0.3);
      z-index: 1000;
    }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>

  <div class="header">
    <div>
      <div class="school-title">Dewey International School</div>
      <div style="font-size: 13px; font-weight: 700; color: #2563eb; margin-top: 2px;">
        Curriculum & Instruction • ${scopeLabel}
      </div>
      <h1 style="font-size: 17px; margin: 6px 0 0 0; color: #0f172a;">${lp.title}</h1>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">${lp.unit}</p>
    </div>
    <div style="text-align: right;">
      <span class="scope-tag">${lp.scope ? lp.scope.toUpperCase() : 'PLAN'}</span>
      <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 6px;">
        Grade ${lp.grade} • ${lp.subject}
      </div>
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-field">
      <span class="meta-label">Subject & Discipline</span>
      <span class="meta-val">${lp.subject}</span>
    </div>
    <div class="meta-field">
      <span class="meta-label">Target Grade Level</span>
      <span class="meta-val">Grade ${lp.grade}</span>
    </div>
    <div class="meta-field">
      <span class="meta-label">Instructional Scope / Format</span>
      <span class="meta-val">${scopeLabel}</span>
    </div>
    <div class="meta-field">
      <span class="meta-label">Schedule / Time Window</span>
      <span class="meta-val">${timeDisplay}</span>
    </div>
    ${lp.teacherName ? `
      <div class="meta-field">
        <span class="meta-label">Educator / Instructor</span>
        <span class="meta-val">${lp.teacherName}</span>
      </div>
    ` : ''}
  </div>

  ${lp.scope === 'monthly' && lp.monthlyTheme ? `
    <div class="card" style="margin-bottom: 14px; background: #fff7ed; border: 1.5px solid #fdba74;">
      <div class="card-title" style="color: #9a3412; font-size: 12.5px;">🌟 Monthly Thematic Focus</div>
      <div style="font-size: 13px; color: #7c2d12;">${lp.monthlyTheme}</div>
    </div>
  ` : ''}

  ${lp.scope === 'monthly' && lp.monthlyWeeklyBreakdown ? `
    <div class="section-title">🗓️ Weekly Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Week</th><th>Topic</th><th>Objectives</th><th>Activities</th><th>Resources</th><th>Assessment</th>
        </tr>
      </thead>
      <tbody>
        ${lp.monthlyWeeklyBreakdown.map(w => `
          <tr>
            <td>${w.week}</td><td>${w.topic}</td><td>${w.objectives}</td><td>${w.activities}</td><td>${w.resources}</td><td>${w.assessment}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${lp.scope === 'daily' && lp.timeDetails ? `
    <div class="card" style="margin-bottom: 14px; background: #fff1f2; border: 1.5px solid #fda4af;">
      <div class="card-title" style="color: #9f1239; font-size: 12.5px;">📅 Daily Schedule Details</div>
      <div style="font-size: 13px; color: #881337; display: flex; gap: 20px;">
        <span><strong>Date:</strong> ${lp.timeDetails.dateRange || 'N/A'}</span>
        <span><strong>Period:</strong> ${lp.timeDetails.classPeriod || 'N/A'}</span>
        <span><strong>Duration:</strong> ${lp.duration}</span>
      </div>
    </div>
  ` : ''}

  <div class="grid-2">
    <div class="card">
      <div class="card-title">🎯 Learning Objectives & Competencies</div>
      <ul>
        ${lp.learningObjectives.map((o) => `<li>${o}</li>`).join('')}
      </ul>
    </div>
    <div class="card">
      <div class="card-title">💡 Essential Questions & Core Inquiries</div>
      <ul>
        ${lp.essentialQuestions.map((q) => `<li>${q}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="section-title">📜 Curriculum & Academic Standards Alignment</div>
  <ul>
    ${lp.curriculumStandards.map((s) => `<li><strong>${s}</strong></li>`).join('')}
  </ul>

  <div class="section-title">📦 Required Instructional Materials & Digital Media</div>
  <ul>
    ${lp.requiredMaterials.map((m) => `<li>${m}</li>`).join('')}
  </ul>

  ${(lp.timeline && lp.timeline.length > 0 && lp.scope === 'daily') ? `
  <div class="section-title">
    ⏱️ Structured ${scopeLabel} Schedule & Instructional Roadmap
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Phase / Time Frame</th>
        <th style="width: 12%; text-align: center;">Duration / Slot</th>
        <th style="width: 33%;">Instructional Activities (Teacher)</th>
        <th style="width: 30%;">Learner Tasks & Deliverables</th>
      </tr>
    </thead>
    <tbody>
      ${lp.timeline.map((step) => `
        <tr>
          <td><strong>${step.phase}</strong></td>
          <td style="text-align: center; font-weight: 700; color: #1e40af;">
            ${step.timeSlot || (step.durationMin ? `${step.durationMin} min` : 'Scheduled')}
          </td>
          <td>${step.teacherRole}</td>
          <td>${step.studentRole}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${(lp.scope === 'weekly' && lp.weeklyDays && lp.weeklyDays.length > 0) ? `
    <div style="margin-top: 20px; margin-bottom: 14px; padding: 10px 14px; background: #f5f3ff; border: 1.5px solid #ddd6fe; border-radius: 8px; font-size: 13px;">
      <strong style="color: #6d28d9;">Weekly Lesson Planning Template</strong> • Week Commencing: <strong>${lp.weekCommencing || '__________________'}</strong>
    </div>

    ${lp.weeklyDays.map((dayObj) => `
      <div style="margin-top: 14px; margin-bottom: 6px; font-size: 14px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #818cf8; padding-bottom: 3px;">
        📅 ${dayObj.day}
      </div>
      <table style="margin-bottom: 16px;">
        <thead>
          <tr style="background: #312e81;">
            <th style="width: 14%; color: white;">Lesson</th>
            <th style="width: 28%; color: white;">Links to Experiences and Outcomes</th>
            <th style="width: 24%; color: white;">Benchmarks for Assessment</th>
            <th style="width: 17%; color: white;">Resources Required</th>
            <th style="width: 17%; color: white;">Evaluation</th>
          </tr>
        </thead>
        <tbody>
          ${dayObj.lessons.map((lesson) => `
            <tr>
              <td style="font-weight: 800; color: #4338ca; background: #faf5ff;">${lesson.lessonName}</td>
              <td>${lesson.experiencesAndOutcomes || '—'}</td>
              <td>${lesson.benchmarksForAssessment || '—'}</td>
              <td>${lesson.resourcesRequired || '—'}</td>
              <td>${lesson.evaluation || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `).join('')}

    ${lp.weeklyNotesAndEvaluations ? `
      <div class="card" style="margin-top: 14px; background: #fffbeb; border: 1.5px solid #fde68a;">
        <div class="card-title" style="color: #92400e; font-size: 12.5px;">📝 Weekly Notes and Evaluations</div>
        <div style="font-size: 12.5px; color: #78350f; white-space: pre-line; line-height: 1.6;">${lp.weeklyNotesAndEvaluations}</div>
      </div>
    ` : ''}
  ` : ''}

  <div class="grid-2" style="margin-top: 16px;">
    <div class="card">
      <div class="card-title">♿ Differentiation & Scaffolding</div>
      <div style="font-size: 12px; margin-bottom: 5px;"><strong>Support (ESL / Remediation):</strong> ${lp.differentiation.support}</div>
      <div style="font-size: 12px;"><strong>Extension (Gifted / Advanced):</strong> ${lp.differentiation.extension}</div>
    </div>
    <div class="card">
      <div class="card-title">📊 Assessment & Evaluation</div>
      <div style="font-size: 12px; margin-bottom: 5px;"><strong>Formative:</strong> ${lp.formativeAssessment}</div>
      ${lp.summativeAssessment ? `<div style="font-size: 12px; margin-bottom: 5px;"><strong>Summative:</strong> ${lp.summativeAssessment}</div>` : ''}
      <div style="font-size: 12px;"><strong>Independent / Homework:</strong> ${lp.homeworkAssignment}</div>
    </div>
  </div>

  ${lp.notes ? `
    <div class="card" style="margin-top: 10px;">
      <div class="card-title">📝 Teacher Reflection & Pedagogical Notes</div>
      <div style="font-size: 12px; color: #334155;">${lp.notes}</div>
    </div>
  ` : ''}

  <div style="margin-top: 25px; padding-top: 10px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
    <span>Dewey International School • Academic Directorate</span>
    <span>Plan ID: ${lp.id} • Generated ${new Date().toLocaleDateString()}</span>
  </div>
</body>
</html>`;
}

/**
 * Triggers an isolated print action for any HTML string
 */
export function printHTMLDocument(html: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Error triggering print:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 300);
  }
}

/**
 * Generates and triggers download of an educator Lesson Plan document supporting Yearly, Quarter, Monthly, Weekly, and Daily scopes
 */
export function downloadLessonPlanDocument(resourceOrPlan: Resource | LessonPlanItem) {
  const lp: LessonPlanItem = (resourceOrPlan as Resource).lessonPlan 
    ? (resourceOrPlan as Resource).lessonPlan!
    : (resourceOrPlan as LessonPlanItem).title 
    ? (resourceOrPlan as LessonPlanItem)
    : getResourceLessonPlan(resourceOrPlan as Resource);

  const safeTitle = (lp.title || 'Lesson_Plan').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Dewey_${(lp.scope || 'LessonPlan').toUpperCase()}_${safeTitle}_Grade${lp.grade}.html`;
  const html = generateLessonPlanHTML(resourceOrPlan);
  triggerFileDownload(filename, html, 'text/html');
}

/**
 * Opens browser print dialog for an educator Lesson Plan
 */
export function printLessonPlanDocument(resourceOrPlan: Resource | LessonPlanItem) {
  const html = generateLessonPlanHTML(resourceOrPlan);
  printHTMLDocument(html);
}
