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

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptContents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const responseText = response.text || '';
      let parsedData;
      try {
        const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        parsedData = JSON.parse(cleanedJson);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output:', parseErr, responseText);
        parsedData = generateCurriculumFallback(cleanSubject, cleanGrade, cleanTitle, cleanUnit, cleanScope, teacherName, teacherInstruction);
      }

      return res.json({
        success: true,
        isAiGenerated: true,
        data: parsedData
      });

    } catch (err: any) {
      console.error('Error generating lesson plan via Gemini:', err);
      const { subject, grade, title, unit, scope, teacherName, customInstructions, aiInstruction } = req.body;
      return res.json({
        success: true,
        isAiGenerated: false,
        fallbackNotice: 'AI model temporarily unavailable; generated standard Dewey Curriculum blueprint.',
        data: generateCurriculumFallback(subject || 'Science', grade || '9', title || 'Instructional Framework', unit || 'Core Unit', scope || 'daily', teacherName || 'Dewey Faculty Educator', customInstructions || aiInstruction)
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

startServer();
