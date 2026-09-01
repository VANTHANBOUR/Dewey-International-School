import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = process.argv[1];
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'Remix Dewey International School API',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // AI Lesson Plan Generation Endpoint
  app.post('/api/gemini/generate-lesson-plan', async (req, res) => {
    try {
      const { 
        subject, 
        grade, 
        title, 
        unit, 
        scope = 'daily', 
        teacherName = 'Dewey Faculty Educator',
        customInstructions,
        aiInstruction
      } = req.body;

      const cleanSubject = subject || 'Science';
      const cleanGrade = grade || '9';
      const cleanTitle = title || `${cleanSubject} Comprehensive Instructional Framework`;
      const cleanUnit = unit || `Unit: Core Principles & Inquiries in ${cleanSubject}`;
      const cleanScope = scope || 'daily';
      const teacherInstruction = (customInstructions || aiInstruction || '').trim();

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('GEMINI_API_KEY not found in environment. Generating high-quality curriculum fallback.');
        return res.json({
          success: true,
          isAiGenerated: false,
          data: generateCurriculumFallback(cleanSubject, cleanGrade, cleanTitle, cleanUnit, cleanScope, teacherName, teacherInstruction)
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemPrompt = `You are a Senior Curriculum Specialist and Master Educator for Dewey International School (DIS), adhering to international STEAM, Cambridge, and CCSS/NGSS standards.
Your goal is to generate an exceptionally detailed, pedagogically rigorous, and complete curriculum lesson plan based on the teacher's input.

Input Parameters:
- Subject: ${cleanSubject}
- Grade Level: Grade ${cleanGrade}
- Plan Title / Focus Topic: ${cleanTitle}
- Curriculum Unit / Module Context: ${cleanUnit}
- Planning Scope: ${cleanScope} (can be 'daily', 'weekly', 'monthly', 'quarter', or 'yearly')
- Instructor: ${teacherName}
${teacherInstruction ? `- SPECIAL TEACHER INSTRUCTIONS & CONSTRAINTS: "${teacherInstruction}". (CRITICAL: You MUST strictly integrate and emphasize these specific teacher instructions across the activities, schedule breakdown, objectives, and differentiation).` : ''}

Requirements:
1. Standards: Provide 3-5 real, rigorous standards with standard code (e.g. 'DIS-SCI.${cleanGrade}.04: Advanced Inquiry & Analysis', 'CCSS.ELA-LITERACY.RST.${cleanGrade}-10.3', 'NGSS.HS-LS1-7') and concise descriptions.
2. Learning Objectives: Provide 3-5 measurable Bloom's Taxonomy objectives with action verbs (e.g. Analyze, Formulate, Model, Synthesize, Evaluate).
3. Essential Questions: Provide 2-4 provocative, open-ended inquiry questions that stimulate critical thinking.
4. Required Materials & Equipment: Provide 4-6 specific digital, physical, or laboratory materials (e.g. 'Dewey Digital Reader Flipbook Vol ${cleanGrade}', 'Scientific Graphing Calculators', 'Interactive PhET Simulation Platform').
5. Differentiation:
   - supportDiff: Targeted scaffolding and accommodations for emerging learners / ELL.
   - extensionDiff: High-rigor extension / honor challenges for advanced learners.
6. Formative Assessment: Realistic continuous check for understanding, exit tickets, and rubrics.
7. Summative Assessment: Culminating performance task or mastery assessment.
8. Homework: Engaging practice task or reflection journal prompt.
9. Notes & Pedagogical Tips: Classroom management, safety protocols, or flipbook cross-references.
10. Schedule Breakdown according to scope:
   - If scope == 'daily': Provide 5 chronological timeline steps with phase name ('1. Hook & Warm-Up (Engage)', '2. Structured Investigation (Explore)', '3. Explicit Modeling & Instruction (Explain)', '4. Guided Application & Mastery (Elaborate)', '5. Synthesis, Assessment & Wrap-Up (Evaluate)'), duration in minutes (e.g. 10, 15, 15, 15, 10), timeSlot, teacherRole, and studentRole.
   - If scope == 'weekly': Provide weeklyDays for Monday through Friday, each with day, lessonName, experiencesAndOutcomes, benchmarksForAssessment, resourcesRequired, and evaluation. Plus weeklyHours (e.g. '5.0 Hours').
   - If scope == 'monthly': Provide monthlyHours (e.g. '20 Hours'), monthlyTheme (e.g. 'Ecosystem Mechanics & Sustainability'), and monthlyWeeklyBreakdown array containing 4 objects with: { week: 'Week 1', topic: string, objectives: string, activities: string, resources: string, assessment: string } for Week 1 through Week 4.
   - If scope == 'quarter': Provide quarterWeeks (e.g. '9 Weeks (45 Instructional Days)') and 4-6 key unit milestones.
   - If scope == 'yearly': Provide yearlyTerms (e.g. 'Term 1 to Term 4 (180 Days)') and comprehensive yearly curriculum themes.

Return ONLY a valid JSON object matching this structure. Do not output markdown codeblocks if possible, or format as standard JSON.`;

      const promptContents = `Generate a comprehensive Dewey International School ${cleanScope} lesson plan for Grade ${cleanGrade} ${cleanSubject} focusing on "${cleanTitle}" within "${cleanUnit}".${teacherInstruction ? `\nTeacher's Custom Instructions: ${teacherInstruction}` : ''}`;

      let response: any = null;
      const candidateModels = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

      for (const modelName of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: promptContents,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.7,
            }
          });
          if (response && response.text) {
            break;
          }
        } catch (mErr: any) {
          console.warn(`Lesson Plan model ${modelName} call failed or denied, trying next...`, mErr?.message || mErr);
        }
      }

      const responseText = response?.text || '';
      let parsedData;
      if (responseText) {
        try {
          const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          parsedData = JSON.parse(cleanedJson);
        } catch (parseErr) {
          console.error('Failed to parse Gemini JSON output:', parseErr, responseText);
          parsedData = generateCurriculumFallback(cleanSubject, cleanGrade, cleanTitle, cleanUnit, cleanScope, teacherName, teacherInstruction);
        }
      } else {
        parsedData = generateCurriculumFallback(cleanSubject, cleanGrade, cleanTitle, cleanUnit, cleanScope, teacherName, teacherInstruction);
      }

      return res.json({
        success: true,
        isAiGenerated: !!responseText,
        data: parsedData
      });

    } catch (err: any) {
      console.warn('Handling fallback for lesson plan generation:', err?.message || err);
      const { subject, grade, title, unit, scope, teacherName, customInstructions, aiInstruction } = req.body;
      return res.json({
        success: true,
        isAiGenerated: false,
        fallbackNotice: 'AI model temporarily unavailable; generated standard Dewey Curriculum blueprint.',
        data: generateCurriculumFallback(subject || 'Science', grade || '9', title || 'Instructional Framework', unit || 'Core Unit', scope || 'daily', teacherName || 'Dewey Faculty Educator', customInstructions || aiInstruction)
      });
    }
  });

  // AI Worksheet Questions Generation Endpoint
  app.post('/api/gemini/generate-worksheet-questions', async (req, res) => {
    try {
      const {
        subject = 'Science',
        grade = '6',
        title = '',
        prompt = '',
        materialsText = '',
        attachedFiles = [],
        questionCount = 5,
        questionType = 'mixed'
      } = req.body;

      const numCount = Math.max(1, Math.min(25, Number(questionCount) || 5));
      const cleanSubject = subject || 'Science';
      const cleanGrade = grade || '6';
      const cleanPrompt = prompt.trim();
      const cleanTitle = title.trim() || `${cleanSubject} Practice Worksheet`;
      const cleanMaterials = typeof materialsText === 'string' ? materialsText.trim() : '';
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          success: true,
          isAiGenerated: false,
          questions: generateWorksheetQuestionsFallback(
            cleanSubject,
            cleanGrade,
            cleanTitle,
            cleanPrompt || cleanMaterials.slice(0, 100),
            numCount,
            questionType
          )
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemPrompt = `You are a Senior Curriculum Specialist and AI Assessment Developer for Dewey International School.
Your goal is to carefully analyze the provided source materials, uploaded reference documents, instructions, and subject parameters, then generate EXACTLY ${numCount} high-quality worksheet questions for Grade ${cleanGrade} ${cleanSubject}.

Parameters:
- Subject: ${cleanSubject}
- Grade Level: Grade ${cleanGrade}
- Worksheet Title/Topic: ${cleanTitle}
- User AI Instruction: ${cleanPrompt ? `"${cleanPrompt}"` : 'Generate practice questions aligned with the reference material.'}
- Target Question Count: ${numCount}
- Target Question Type: ${questionType} (options: 'mixed', 'short_answer', 'multiple_choice', 'fill_in_blank', 'diagram_label')

CRITICAL REQUIREMENT:
If reference materials or attached files are provided, base the questions, options, hints, and correct answers directly on the facts, concepts, definitions, figures, diagrams, formulas, and text contained within those materials.

Instructions:
1. Generate EXACTLY ${numCount} questions numbered 1 through ${numCount}.
2. If questionType is 'multiple_choice', every question MUST have an 'options' array with 4 distinct options (e.g. ['A. ...', 'B. ...', 'C. ...', 'D. ...']) and a clear 'correctAnswer'.
3. If questionType is 'short_answer', provide a clear 'prompt', 'points', 'hint', and comprehensive sample 'correctAnswer'.
4. If questionType is 'fill_in_blank', format the prompt with '_______' and provide the missing target word/phrase as 'correctAnswer'.
5. If questionType is 'diagram_label', prompt students to identify/label parts, stages, or structures based on the material.
6. If questionType is 'mixed', vary the types across short_answer, multiple_choice, fill_in_blank, and diagram_label.

Return ONLY a JSON array of question objects matching this schema:
[
  {
    "num": 1,
    "prompt": "Question text...",
    "type": "short_answer" | "multiple_choice" | "fill_in_blank" | "diagram_label",
    "points": 5,
    "hint": "Student hint...",
    "correctAnswer": "Answer key detail...",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"] // Required if type is multiple_choice
  }
]`;

      const contentsParts: any[] = [];
      let textPromptPayload = `Generate ${numCount} ${questionType} worksheet questions for Grade ${cleanGrade} ${cleanSubject}.\nWorksheet Topic: "${cleanTitle}".\nInstruction: "${cleanPrompt}".`;

      if (cleanMaterials) {
        textPromptPayload += `\n\n==================== SOURCE REFERENCE MATERIAL TEXT ====================\n${cleanMaterials}\n=======================================================================`;
      }

      if (Array.isArray(attachedFiles) && attachedFiles.length > 0) {
        attachedFiles.forEach((file: any, index: number) => {
          if (file.textContent) {
            textPromptPayload += `\n\n==================== ATTACHED FILE ${index + 1}: ${file.name || 'Material Document'} ====================\n${file.textContent}\n=======================================================================`;
          }
          if (file.base64Data && file.mimeType) {
            const rawBase64 = file.base64Data.includes('base64,')
              ? file.base64Data.split('base64,')[1]
              : file.base64Data;
            
            // Only attach supported image or PDF mimeTypes
            if (rawBase64 && (file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf')) {
              contentsParts.push({
                inlineData: {
                  mimeType: file.mimeType,
                  data: rawBase64
                }
              });
            }
          }
        });
      }

      contentsParts.push({ text: textPromptPayload });

      let aiResponse: any = null;
      const candidateModels = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

      for (const modelName of candidateModels) {
        try {
          aiResponse = await ai.models.generateContent({
            model: modelName,
            contents: contentsParts,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.7
            }
          });
          if (aiResponse && aiResponse.text) {
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} call failed or denied, trying next model in chain...`, modelErr?.message || modelErr);
        }
      }

      const responseText = aiResponse?.text || '';
      let parsedQuestions = [];
      if (responseText) {
        try {
          const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          parsedQuestions = JSON.parse(cleanedJson);
          if (!Array.isArray(parsedQuestions)) {
            if (parsedQuestions && Array.isArray((parsedQuestions as any).questions)) {
              parsedQuestions = (parsedQuestions as any).questions;
            } else {
              parsedQuestions = [];
            }
          }
        } catch (e) {
          console.error('Failed to parse Gemini generated questions JSON:', e);
        }
      }

      if (!parsedQuestions || parsedQuestions.length === 0) {
        parsedQuestions = generateWorksheetQuestionsFallback(cleanSubject, cleanGrade, cleanTitle, cleanPrompt || cleanMaterials.slice(0, 100), numCount, questionType, cleanMaterials, attachedFiles);
      } else {
        // Ensure proper numbering
        parsedQuestions = parsedQuestions.map((q: any, idx: number) => ({
          num: idx + 1,
          prompt: q.prompt || `Question ${idx + 1}`,
          type: q.type || (questionType === 'mixed' ? 'short_answer' : questionType),
          points: Number(q.points) || 5,
          hint: q.hint || '',
          correctAnswer: q.correctAnswer || '',
          options: Array.isArray(q.options) ? q.options : undefined
        }));
      }

      return res.json({
        success: true,
        isAiGenerated: !!responseText,
        questions: parsedQuestions
      });

    } catch (err: any) {
      console.warn('Handling fallback for AI worksheet questions error:', err?.message || err);
      const { subject, grade, title, prompt, materialsText, attachedFiles, questionCount, questionType } = req.body;
      const numCount = Math.max(1, Math.min(25, Number(questionCount) || 5));
      return res.json({
        success: true,
        isAiGenerated: false,
        questions: generateWorksheetQuestionsFallback(
          subject || 'Science',
          grade || '6',
          title || '',
          prompt || '',
          numCount,
          questionType || 'mixed',
          materialsText || '',
          attachedFiles || []
        )
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateCurriculumFallback(
  subject: string, 
  grade: string, 
  title: string, 
  unit: string, 
  scope: string, 
  teacherName: string,
  teacherInstruction?: string
) {
  const instructionNotice = teacherInstruction ? ` (Aligned with teacher focus: ${teacherInstruction})` : '';

  return {
    title: title || `${subject} Grade ${grade} Mastery Framework`,
    unit: unit || `Unit: Comprehensive Studies in ${subject}`,
    teacherName: teacherName || 'Dewey Faculty Educator',
    monthlyTheme: `${subject} Foundations & Integrated Applications`,
    monthlyHours: '32 Instructional Hours',
    quarterWeeks: '9 Weeks (72 Total Hours)',
    yearlyTerms: '4 Terms / 180 Instructional Days',
    monthlyWeeklyBreakdown: [
      {
        week: 'Week 1',
        topic: `Introduction & Conceptual Foundations of ${title}`,
        objectives: `Identify fundamental principles, key technical terms, and baseline inquiries in ${subject}.`,
        activities: `Diagnostic inquiry lab, Think-Pair-Share vocabulary station, and interactive digital flipbook review.`,
        resources: `Dewey Digital Reader Vol ${grade}, introductory worksheets, lab safety equipment.`,
        assessment: `Formative entry slip check and student vocabulary journal rubric.`
      },
      {
        week: 'Week 2',
        topic: `Empirical Investigation & Hands-on Exploration`,
        objectives: `Formulate hypotheses, collect empirical observations, and analyze data sets in collaborative teams.`,
        activities: `Small-group lab experiments, digital model simulations, and quantitative data logging.`,
        resources: `Simulation software, scientific calculators, measurement kits.`,
        assessment: `Mid-month lab report checkpoint and peer review rubric.`
      },
      {
        week: 'Week 3',
        topic: `Deep Conceptual Synthesis & Interdisciplinary Application`,
        objectives: `Synthesize analytical solutions to complex multi-step scenarios and real-world case studies.`,
        activities: `Problem-based case studies, interdisciplinary STEAM design challenge, and structured debate.`,
        resources: `Case study reference packets, whiteboards, graph paper.`,
        assessment: `Formative problem set mastery score and oral presentation checklist.`
      },
      {
        week: 'Week 4',
        topic: `Culminating Mastery Showcase, Assessment & Reflection`,
        objectives: `Demonstrate cumulative mastery through rigorous performance tasks and reflective self-evaluation.`,
        activities: `Capstone presentation showcase, comprehensive unit exam, and learning portfolio wrap-up.`,
        resources: `Mastery examination papers, digital portfolio submission portal.`,
        assessment: `Summative unit assessment score and learner self-reflection rubric.`
      }
    ],
    standards: [
      `DIS-${subject.slice(0, 3).toUpperCase()}.${grade}.01: Demonstrates advanced comprehension and inquiry synthesis in ${subject}.`,
      `DIS-ACAD.${grade}.04: Formulates empirical models and communicates evidence-based reasoning effectively.`,
      `CCSS.DIS.LITERACY.G${grade}: Analyzes technical content, disciplinary vocabulary, and authentic primary materials.`
    ],
    objectives: [
      `Analyze the foundational concepts and structural mechanics of ${title}.${instructionNotice}`,
      `Formulate and test analytical solutions through collaborative investigation and problem-solving.`,
      `Synthesize experimental or textual data to construct defensible scholarly conclusions.`
    ],
    essentialQuestions: [
      `How do the core principles of ${title} govern modern real-world phenomena?`,
      `What evidence-based strategies allow us to solve complex challenges in ${subject}?`
    ],
    materials: [
      `Dewey Interactive Digital Reader (Grade ${grade} ${subject} Edition)`,
      `Curriculum Worksheets and Analytical Data Rubrics`,
      `Collaborative Inquiry Station Materials & Digital Simulation Lab`,
      `Student Reflective Academic Journals & Writing Utensils`
    ],
    timelineSteps: [
      {
        phase: '1. Hook & Warm-Up (Engage)',
        timeSlot: '08:00 AM - 08:10 AM',
        durationMin: 10,
        teacherRole: `Present an engaging real-world phenomenon or challenge related to ${title}. Facilitate Think-Pair-Share.`,
        studentRole: 'Record initial observations in journals and articulate preliminary hypotheses with seat partner.'
      },
      {
        phase: '2. Structured Investigation (Explore)',
        timeSlot: '08:10 AM - 08:25 AM',
        durationMin: 15,
        teacherRole: `Distribute digital flipbooks and workstation materials. Circulate to prompt inquiry questions on ${unit}.`,
        studentRole: 'Investigate source documents, manipulate models, and record primary observations in lab teams.'
      },
      {
        phase: '3. Explicit Modeling & Instruction (Explain)',
        timeSlot: '08:25 AM - 08:40 AM',
        durationMin: 15,
        teacherRole: `Synthesize findings on the board; clarify core terminology, key theorems, and conceptual formulas for ${subject}.`,
        studentRole: 'Annotate Cornell notes and verify conceptual alignment with standard reference tables.'
      },
      {
        phase: '4. Guided Application & Mastery (Elaborate)',
        timeSlot: '08:40 AM - 08:55 AM',
        durationMin: 15,
        teacherRole: 'Supervise differentiated problem-solving stations and provide targeted intervention.',
        studentRole: 'Apply mastered frameworks to novel scenarios and peer-review solution methodologies.'
      },
      {
        phase: '5. Synthesis, Assessment & Wrap-Up (Evaluate)',
        timeSlot: '08:55 AM - 09:05 AM',
        durationMin: 10,
        teacherRole: 'Administer digital exit ticket and summarize major disciplinary takeaways.',
        studentRole: 'Complete exit slip self-assessment and pack up inquiry stations.'
      }
    ],
    weeklyDays: [
      {
        day: 'Monday',
        lessons: [
          {
            lessonName: `Introduction to ${title}`,
            experiencesAndOutcomes: `Explore key vocabulary and real-world implications of ${unit}.`,
            benchmarksForAssessment: 'Diagnostic entry poll and collaborative vocabulary map.',
            resourcesRequired: 'Interactive Flipbook Chapter 1, projector, student notebooks.',
            evaluation: 'Formative engagement checks and teacher observation notes.'
          }
        ]
      },
      {
        day: 'Tuesday',
        lessons: [
          {
            lessonName: `Empirical Modeling & Exploration`,
            experiencesAndOutcomes: `Hands-on inquiry stations and analytical problem set exploration in ${subject}.`,
            benchmarksForAssessment: 'Station analysis rubric and data table completion.',
            resourcesRequired: 'Workstation materials, digital reader references.',
            evaluation: 'Peer review rubric and structured group findings.'
          }
        ]
      },
      {
        day: 'Wednesday',
        lessons: [
          {
            lessonName: `Deep Conceptual Synthesis`,
            experiencesAndOutcomes: `Guided application to complex, multi-step problem sets and case study analysis.`,
            benchmarksForAssessment: 'Independent problem set accuracy and written justification.',
            resourcesRequired: 'Calculators/Reference sheets, Dewey practice worksheets.',
            evaluation: 'Mid-week checkpoint formative assessment.'
          }
        ]
      },
      {
        day: 'Thursday',
        lessons: [
          {
            lessonName: `Collaborative Inquiry & Extension`,
            experiencesAndOutcomes: `Small-group project creation and peer critiques on applied ${subject} principles.`,
            benchmarksForAssessment: 'Poster/Model presentation and evidence evaluation.',
            resourcesRequired: 'Group work supplies, digital presentation devices.',
            evaluation: 'Group oral presentation checklist.'
          }
        ]
      },
      {
        day: 'Friday',
        lessons: [
          {
            lessonName: `Mastery Assessment & Reflection`,
            experiencesAndOutcomes: `Culminating mastery assessment and individual learning reflection.`,
            benchmarksForAssessment: 'Weekly summative quiz and self-reflection journal.',
            resourcesRequired: 'Assessment papers, digital grading portal.',
            evaluation: 'Summative scoring rubric and learning goal progress log.'
          }
        ]
      }
    ],
    formativeAssessment: `Continuous observational checklist, paired discussion debriefs, and a 3-question digital exit ticket evaluating ${title}.${instructionNotice}`,
    summativeAssessment: `End-of-unit performance rubric assessing student ability to synthesize, calculate, and justify solutions in ${unit}.`,
    supportDiff: `Provide scaffolded sentence starters, bilingual terminology glossaries, and dedicated guided group coaching.`,
    extensionDiff: `Challenge students to design a novel mathematical proof or formulate an independent investigation testing edge-case hypotheses.`,
    homework: `Review assigned readings in Dewey Reader and complete the reflection prompt in the digital portal.`,
    notes: `Coordinate with lab technicians for materials prep; verify student device connectivity to flipbook resources before start.`
  };
}

function generateWorksheetQuestionsFallback(
  subject: string,
  grade: string,
  title: string,
  prompt: string,
  count: number,
  type: string,
  materialsText?: string,
  attachedFiles?: any[]
) {
  const result = [];
  
  // Extract text snippets from materials if provided
  let combinedMaterialText = materialsText ? materialsText.trim() : '';
  if (Array.isArray(attachedFiles)) {
    attachedFiles.forEach(f => {
      if (f.textContent) combinedMaterialText += '\n' + f.textContent;
    });
  }

  const sentences = combinedMaterialText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const topic = prompt.trim() || title.trim() || `${subject} Mastery Concepts`;
  const typesAvailable = ['short_answer', 'multiple_choice', 'fill_in_blank', 'diagram_label'];

  for (let i = 1; i <= count; i++) {
    const qType = type === 'mixed' ? typesAvailable[(i - 1) % typesAvailable.length] : type;
    const materialSentence = sentences.length > 0 ? sentences[(i - 1) % sentences.length] : null;
    
    if (qType === 'multiple_choice') {
      const promptText = materialSentence
        ? `Based on your Grade ${grade} ${subject} reference material ("...${materialSentence.slice(0, 90)}..."), which statement is most accurate?`
        : `Which of the following best demonstrates the core principle of ${topic} for Grade ${grade} ${subject}?`;

      result.push({
        num: i,
        prompt: promptText,
        type: 'multiple_choice',
        points: 5,
        hint: `Recall key definitions from Grade ${grade} ${subject} class notes.`,
        correctAnswer: `B. ${materialSentence ? materialSentence.slice(0, 80) : `Empirical observation and structured evaluation of ${topic}`}`,
        options: [
          `A. Random variation without control variables`,
          `B. ${materialSentence ? materialSentence.slice(0, 80) : `Empirical observation and structured evaluation of ${topic}`}`,
          `C. Unverified theoretical assumptions`,
          `D. External isolation of system components`
        ]
      });
    } else if (qType === 'fill_in_blank') {
      const fillPrompt = materialSentence
        ? `Fill in the blank from reference material: "${materialSentence.slice(0, 60)} _______ ${materialSentence.slice(65, 110)}".`
        : `Fill in the blank: The primary factor governing ${topic} in Grade ${grade} ${subject} is known as the _______ principle.`;

      result.push({
        num: i,
        prompt: fillPrompt,
        type: 'fill_in_blank',
        points: 5,
        hint: `Focus on foundational terminology in ${subject}.`,
        correctAnswer: 'fundamental'
      });
    } else if (qType === 'diagram_label') {
      result.push({
        num: i,
        prompt: `Diagram Analysis: Label and explain the 3 primary stages of ${topic} illustrated in your textbook reading material.`,
        type: 'diagram_label',
        points: 10,
        hint: `Refer to figure diagrams in Chapter ${i}.`,
        correctAnswer: `Stage 1: Initial Input, Stage 2: Core Processing, Stage 3: Systemic Output.`
      });
    } else {
      const saPrompt = materialSentence
        ? `Based on your reference reading ("${materialSentence.slice(0, 100)}"), explain how this concept applies to ${subject}.`
        : `Explain in detail how ${topic} applies to practical problem solving in Grade ${grade} ${subject}.`;

      result.push({
        num: i,
        prompt: saPrompt,
        type: 'short_answer',
        points: 10,
        hint: `Include at least two specific examples in your written response.`,
        correctAnswer: `Comprehensive response connecting ${topic} concepts to practical application.`
      });
    }
  }

  return result;
}

startServer();
