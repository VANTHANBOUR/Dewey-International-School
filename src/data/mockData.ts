import { Resource, CategoryInfo, NotificationItem, GradeLevel } from '../types';

export const GRADE_COLORS: Record<GradeLevel, { bg: string; text: string; ring: string; border: string }> = {
  'Foundation': { bg: 'bg-[#06b6d4]', text: 'text-white', ring: 'ring-[#06b6d4]', border: 'border-[#06b6d4]' },
  'Preparatory': { bg: 'bg-[#f43f5e]', text: 'text-white', ring: 'ring-[#f43f5e]', border: 'border-[#f43f5e]' },
  '1': { bg: 'bg-[#3b66ff]', text: 'text-white', ring: 'ring-[#3b66ff]', border: 'border-[#3b66ff]' },
  '2': { bg: 'bg-[#0284c7]', text: 'text-white', ring: 'ring-[#0284c7]', border: 'border-[#0284c7]' },
  '3': { bg: 'bg-[#0d9488]', text: 'text-white', ring: 'ring-[#0d9488]', border: 'border-[#0d9488]' },
  '4': { bg: 'bg-[#16a34a]', text: 'text-white', ring: 'ring-[#16a34a]', border: 'border-[#16a34a]' },
  '5': { bg: 'bg-[#84cc16]', text: 'text-slate-900', ring: 'ring-[#84cc16]', border: 'border-[#84cc16]' },
  '6': { bg: 'bg-[#eab308]', text: 'text-slate-900', ring: 'ring-[#eab308]', border: 'border-[#eab308]' },
  '7': { bg: 'bg-[#f97316]', text: 'text-white', ring: 'ring-[#f97316]', border: 'border-[#f97316]' },
  '8': { bg: 'bg-[#ea580c]', text: 'text-white', ring: 'ring-[#ea580c]', border: 'border-[#ea580c]' },
  '9': { bg: 'bg-[#e11d48]', text: 'text-white', ring: 'ring-[#e11d48]', border: 'border-[#e11d48]' },
  '10': { bg: 'bg-[#a855f7]', text: 'text-white', ring: 'ring-[#a855f7]', border: 'border-[#a855f7]' },
  '11': { bg: 'bg-[#6366f1]', text: 'text-white', ring: 'ring-[#6366f1]', border: 'border-[#6366f1]' },
  '12': { bg: 'bg-[#2563eb]', text: 'text-white', ring: 'ring-[#2563eb]', border: 'border-[#2563eb]' },
};

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    id: 'Science',
    name: 'Science',
    count: 245,
    iconName: 'FlaskConical',
    color: '#10b981',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100/70',
    borderColor: 'border-emerald-100',
    textColor: 'text-emerald-600',
    description: 'Biology, Chemistry, Physics, Environmental & Earth Sciences',
  },
  {
    id: 'Mathematics',
    name: 'Mathematics',
    count: 198,
    iconName: 'Calculator',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50 hover:bg-purple-100/70',
    borderColor: 'border-purple-100',
    textColor: 'text-purple-600',
    description: 'Algebra, Geometry, Calculus, Statistics & Discrete Math',
  },
  {
    id: 'English',
    name: 'English',
    count: 186,
    iconName: 'BookOpen',
    color: '#3b82f6',
    bgColor: 'bg-blue-50 hover:bg-blue-100/70',
    borderColor: 'border-blue-100',
    textColor: 'text-blue-600',
    description: 'Literature, Grammar, Creative Writing & Public Speaking',
  },
  {
    id: 'Social Studies',
    name: 'Social Studies',
    count: 154,
    iconName: 'Globe',
    color: '#f97316',
    bgColor: 'bg-orange-50 hover:bg-orange-100/70',
    borderColor: 'border-orange-100',
    textColor: 'text-orange-600',
    description: 'World History, Geography, Civics, Economics & Global Cultures',
  },
  {
    id: 'Technology',
    name: 'Technology',
    count: 97,
    iconName: 'Monitor',
    color: '#06b6d4',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100/70',
    borderColor: 'border-cyan-100',
    textColor: 'text-cyan-600',
    description: 'Computer Science, Coding, Robotics & Digital Citizenship',
  },
  {
    id: 'Engineering',
    name: 'Engineering',
    count: 86,
    iconName: 'Cog',
    color: '#eab308',
    bgColor: 'bg-amber-50 hover:bg-amber-100/70',
    borderColor: 'border-amber-100',
    textColor: 'text-amber-600',
    description: 'Design Thinking, CAD, Structural Mechanics & STEAM Projects',
  },
  {
    id: 'Arts',
    name: 'Arts',
    count: 67,
    iconName: 'Palette',
    color: '#ec4899',
    bgColor: 'bg-pink-50 hover:bg-pink-100/70',
    borderColor: 'border-pink-100',
    textColor: 'text-pink-600',
    description: 'Visual Arts, Music Theory, Digital Media & Art History',
  },
  {
    id: 'Physical Education',
    name: 'Physical Education',
    count: 45,
    iconName: 'Activity',
    color: '#22c55e',
    bgColor: 'bg-green-50 hover:bg-green-100/70',
    borderColor: 'border-green-100',
    textColor: 'text-green-600',
    description: 'Health, Kinesthetics, Athletics & Nutrition Essentials',
  },
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-g6-sci',
    title: 'Grade 6 Science Textbook',
    subtitle: 'Chapter 1: Life & Living Things',
    grade: '6',
    subject: 'Science',
    format: 'flipbook',
    totalPages: 248,
    fileSize: '18.4 MB',
    author: 'Dewey Science Curriculum Board',
    publishedYear: 2025,
    rating: 4.9,
    viewsCount: 1420,
    description: 'Comprehensive Middle School Life Science curriculum covering cellular biology, plant ecosystems, animal classifications, and human physiological systems with interactive lab assignments.',
    isFeatured: true,
    isBookmarked: false,
    isFavorite: true,
    coverTheme: {
      bg: 'from-[#0b213f] to-[#041126]',
      text: 'text-emerald-300',
      accent: '#10b981',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Chapter 1: Introduction to Living Organisms', page: 1 },
      { title: 'Chapter 2: Plant Biology & Photosynthesis', page: 14 },
      { title: 'Chapter 3: Ecosystems and Energy Transfer', page: 28 },
      { title: 'Chapter 4: Human Body Systems Overview', page: 45 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Unit 1: The Foundations of Life',
        subtitle: 'What makes something alive?',
        content: [
          'All living organisms on Earth share essential fundamental characteristics that differentiate them from non-living matter.',
          '1. Cellular Organization: All living things are composed of one or more microscopic cells.',
          '2. Metabolism: The biochemical conversion of energy to sustain vital cellular functions and homeostasis.',
          '3. Growth and Reproduction: Transmitting genetic DNA to subsequent generations while developing specialized tissue.'
        ],
        keyTerms: [
          { term: 'Homeostasis', definition: 'The state of steady internal, physical, and chemical conditions maintained by living systems.' },
          { term: 'Metabolism', definition: 'The sum of all chemical reactions that occur within an organism.' }
        ],
        diagramType: 'biology_cell',
        exercise: {
          question: 'Which of the following is NOT a universal characteristic of all living organisms?',
          options: ['Cellular structure', 'Ability to photosynthesize sunlight', 'Genetic inheritance via DNA/RNA', 'Response to environmental stimuli'],
          correctIndex: 1,
          explanation: 'Only photosynthetic organisms (like plants and cyanobacteria) can photosynthesize; animals, fungi, and many bacteria rely on other sources of chemical energy.'
        }
      },
      {
        pageNumber: 2,
        title: 'Cellular Structures & Organelles',
        subtitle: 'Inside the microscopic factory',
        content: [
          'The cell is the basic structural, functional, and biological unit of all known organisms. Cells are often called the "building blocks of life".',
          '• Nucleus: The command center containing genomic chromosomes and directing protein synthesis.',
          '• Mitochondria: The powerhouses generating adenosine triphosphate (ATP) through cellular respiration.',
          '• Ribosomes: Complex macromolecular machines responsible for reading messenger RNA and assembling peptide chains.'
        ],
        keyTerms: [
          { term: 'Organelle', definition: 'A specialized subcellular structure that performs a specific function within the cell.' },
          { term: 'Cytoplasm', definition: 'The gelatinous fluid that fills a cell and holds internal components in suspension.' }
        ],
        diagramType: 'biology_cell'
      },
      {
        pageNumber: 3,
        title: 'Plant vs. Animal Cells',
        subtitle: 'Comparative Cellular Anatomy',
        content: [
          'While both plant and animal cells are eukaryotic, plant cells contain three unique components:',
          '1. Cellulose Cell Wall: Provides rigid structural support and turgor pressure resistance.',
          '2. Chloroplasts: Membrane-bound organelles containing chlorophyll that capture solar photon energy.',
          '3. Large Central Vacuole: Maintains osmotic balance and stores water, nutrients, and waste products.'
        ],
        keyTerms: [
          { term: 'Chlorophyll', definition: 'The green pigment in plants responsible for absorbing light energy.' }
        ]
      }
    ]
  },
  {
    id: 'res-g7-math',
    title: 'Grade 7 Mathematics',
    subtitle: 'Unit 2: Algebraic Expressions',
    grade: '7',
    subject: 'Mathematics',
    format: 'pdf',
    totalPages: 182,
    fileSize: '12.8 MB',
    author: 'Dewey Mathematics Department',
    publishedYear: 2025,
    rating: 4.8,
    viewsCount: 1180,
    description: 'Modern middle school algebra workbook covering linear equations, polynomial simplifications, factoring, inequalities, and real-world word problem modeling.',
    isFeatured: true,
    isBookmarked: true,
    isFavorite: false,
    coverTheme: {
      bg: 'from-[#f97316] to-[#c2410c]',
      text: 'text-white',
      accent: '#f97316',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Unit 1: Rational Numbers & Operations', page: 1 },
      { title: 'Unit 2: Algebraic Expressions & Variables', page: 22 },
      { title: 'Unit 3: Solving Multi-Step Equations', page: 48 },
      { title: 'Unit 4: Proportions and Percent Applications', page: 76 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Algebraic Expressions: Foundations',
        subtitle: 'Understanding Variables, Constants & Coefficients',
        content: [
          'An algebraic expression is a mathematical phrase containing numbers, variables, and operational symbols (+, -, *, /).',
          '• Variable: A symbol (usually a letter such as x, y, or n) representing an unknown quantity.',
          '• Coefficient: The numerical factor multiplied by a variable (e.g. In 7x, 7 is the coefficient).',
          '• Constant: A fixed numerical value that does not change (e.g. In 3x + 8, 8 is the constant).'
        ],
        keyTerms: [
          { term: 'Like Terms', definition: 'Terms that have identical variable parts raised to the same exponents.' },
          { term: 'Evaluation', definition: 'Substituting numerical values for variables to calculate the resulting number.' }
        ],
        diagramType: 'math_algebra',
        exercise: {
          question: 'Simplify the expression: 4x + 7 - 2x + 5',
          options: ['2x + 12', '6x + 12', '2x + 2', '14x'],
          correctIndex: 0,
          explanation: 'Combine like variable terms: (4x - 2x) = 2x. Combine constants: (7 + 5) = 12. Result is 2x + 12.'
        }
      },
      {
        pageNumber: 2,
        title: 'The Distributive Property',
        subtitle: 'Expanding and Factoring Linear Terms',
        content: [
          'The distributive property states that multiplying a sum by a number gives the same result as multiplying each addend individually:',
          'Formula: a(b + c) = ab + ac',
          'Example 1: 3(2x + 4) = 3*(2x) + 3*(4) = 6x + 12',
          'Example 2: -2(4y - 5) = -8y + 10 (Remember: negative times negative equals positive)'
        ],
        keyTerms: [
          { term: 'Expansion', definition: 'Removing parentheses by multiplying each term inside by the outside multiplier.' }
        ],
        diagramType: 'math_algebra'
      }
    ]
  },
  {
    id: 'res-g3-eng',
    title: 'Grade 3 English Workbook',
    subtitle: 'Unit 4: Our Community',
    grade: '3',
    subject: 'English',
    format: 'flipbook',
    totalPages: 110,
    fileSize: '9.5 MB',
    author: 'Dewey Primary Language Arts',
    publishedYear: 2025,
    rating: 4.9,
    viewsCount: 940,
    description: 'Engaging reading comprehension stories, community helpers exploration, grammar practice, vocabulary puzzles, and creative storytelling for Grade 3 learners.',
    isFeatured: true,
    isBookmarked: false,
    isFavorite: false,
    coverTheme: {
      bg: 'from-[#1e3a8a] to-[#0f172a]',
      text: 'text-sky-300',
      accent: '#38bdf8',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Story 1: The Community Garden', page: 1 },
      { title: 'Grammar: Nouns, Verbs and Adjectives', page: 18 },
      { title: 'Story 2: Firefighters and First Responders', page: 34 },
      { title: 'Writing: My Favorite Neighborhood Spot', page: 50 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'The Community Garden',
        subtitle: 'Reading Comprehension & Character Dialogue',
        content: [
          'On a bright Saturday morning, Maya and Liam walked down Elm Street to the new neighborhood garden.',
          '"Look at the sunflowers!" exclaimed Liam. "They are taller than Mr. Henderson!"',
          'Neighbors of all ages were working together—some turning the dark, rich soil, others carefully watering the tender tomato sprouts.',
          'Working together made what seemed like an impossible job into a joyful celebration.'
        ],
        keyTerms: [
          { term: 'Cooperation', definition: 'Working together willingly to achieve a common purpose or goal.' },
          { term: 'Harvest', definition: 'The gathering of ripe crops and produce at the end of the growing season.' }
        ],
        exercise: {
          question: 'Why did working together make the gardening job feel easy for Maya and Liam?',
          options: ['They hired a machine', 'Everyone shared the work with enthusiasm', 'It began to rain', 'They left early'],
          correctIndex: 1,
          explanation: 'When community members cooperated and divided the tasks, the work became joyful and manageable.'
        }
      }
    ]
  },
  {
    id: 'res-g10-chem',
    title: 'Grade 10 Chemistry',
    subtitle: 'Experiment Manual',
    grade: '10',
    subject: 'Science',
    format: 'pdf',
    totalPages: 216,
    fileSize: '24.1 MB',
    author: 'Dewey Senior Science Lab Faculty',
    publishedYear: 2025,
    rating: 5.0,
    viewsCount: 1890,
    description: 'Complete high school laboratory protocols covering stoichiometric titrations, thermodynamics, periodic trends, acid-base equilibrium, and organic functional groups.',
    isFeatured: true,
    isBookmarked: true,
    isFavorite: true,
    coverTheme: {
      bg: 'from-[#090d16] to-[#020408]',
      text: 'text-teal-400',
      accent: '#2dd4bf',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Lab 1: Safety Protocols & Measurement Precision', page: 1 },
      { title: 'Lab 2: Periodic Table Reactivity Trends', page: 26 },
      { title: 'Lab 3: Acid-Base Volumetric Titration', page: 52 },
      { title: 'Lab 4: Calorimetry and Enthalpy Changes', page: 88 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Experiment 3: Acid-Base Neutralization Titration',
        subtitle: 'Determining the Exact Molarity of Unknown Hydrochloric Acid',
        content: [
          'Objective: Standardize an aqueous solution of NaOH against potassium hydrogen phthalate (KHP), then titrate against unknown HCl solution using phenolphthalein indicator.',
          'Safety Requirements:',
          '• Standard chemical splash goggles and nitrile gloves must be worn throughout.',
          '• Handle 0.100 M NaOH with caution; corrosive to eye tissue and skin.',
          'Equivalence Point: The exact stoichiometric ratio where moles of H+ equal moles of OH- (marked by permanent faint pink color persisting for 30 seconds).'
        ],
        keyTerms: [
          { term: 'Titrant', definition: 'The solution of known concentration added from the burette.' },
          { term: 'Meniscus', definition: 'The curved upper surface of a liquid in a tube, read precisely at eye level from the bottom.' }
        ],
        diagramType: 'chemistry_reactions'
      }
    ]
  },
  {
    id: 'res-g9-hist',
    title: 'Grade 9 History',
    subtitle: 'Chapter 5: Ancient Civilizations',
    grade: '9',
    subject: 'Social Studies',
    format: 'flipbook',
    totalPages: 310,
    fileSize: '32.6 MB',
    author: 'Dewey Humanities Department',
    publishedYear: 2025,
    rating: 4.8,
    viewsCount: 1650,
    description: 'An interactive historical journey exploring early river valley civilizations: Mesopotamia, the Nile Kingdom, the Indus Valley, and the architectural wonders of Classical Antiquity.',
    isFeatured: true,
    isBookmarked: false,
    isFavorite: true,
    coverTheme: {
      bg: 'from-[#3b2d18] to-[#160f05]',
      text: 'text-amber-300',
      accent: '#f59e0b',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Chapter 1: The Fertile Crescent & Cuneiform', page: 1 },
      { title: 'Chapter 2: Dynasty & Monument of Ancient Egypt', page: 32 },
      { title: 'Chapter 3: The Classical Age of Athens & Rome', page: 70 },
      { title: 'Chapter 4: The Silk Roads & Cultural Exchange', page: 110 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Classical Antiquity: The Roman Republic & Empire',
        subtitle: 'Engineering, Law, and Civic Architecture',
        content: [
          'The Roman civilization transformed from a pastoral settlement on the Tiber River into an expansive Mediterranean empire defined by revolutionary civic engineering and codified legal codes.',
          'Key Architectural Innovations:',
          '1. The True Arch and Keystone: Allowed monumental structures like the Colosseum and aqueducts to bear unprecedented compressive loads.',
          '2. Hydraulic Concrete (Pozzolana): Enabled durable underwater harbors and vaulted domes like the Pantheon.',
          '3. The Roman Aqueduct Network: Transported millions of gallons of fresh mountain spring water to urban populations.'
        ],
        keyTerms: [
          { term: 'Pax Romana', definition: 'A 200-year period of relative internal peace and stability across the Roman Empire.' },
          { term: 'Twelve Tables', definition: 'The foundational legislation that established early Roman statutory law.' }
        ],
        diagramType: 'history_timeline'
      }
    ]
  },
  // Recently viewed items from the screenshot
  {
    id: 'res-g8-phys',
    title: 'Grade 8 Physics Textbook',
    subtitle: 'Chapter 3: Forces and Motion',
    grade: '8',
    subject: 'Science',
    format: 'flipbook',
    totalPages: 195,
    fileSize: '15.2 MB',
    author: 'Dewey Physics Faculty',
    publishedYear: 2025,
    rating: 4.9,
    viewsCount: 2100,
    description: 'Newtonian mechanics, gravity, friction, momentum, simple machines, and gravitational acceleration explained through real-world experiments and dynamic simulations.',
    lastReadDate: '2026-08-19',
    lastReadTimeAgo: 'Today',
    lastPageRead: 42,
    coverTheme: {
      bg: 'from-[#1e1b4b] to-[#0f0c29]',
      text: 'text-indigo-300',
      accent: '#818cf8',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Chapter 1: Kinematics & Velocity', page: 1 },
      { title: 'Chapter 2: Newton’s Three Laws of Motion', page: 24 },
      { title: 'Chapter 3: Friction and Air Resistance', page: 42 },
      { title: 'Chapter 4: Work, Power, and Mechanical Advantage', page: 68 }
    ],
    samplePages: [
      {
        pageNumber: 42,
        title: 'Newton’s Three Laws of Motion',
        subtitle: 'The Universal Rules Governing Physical Dynamics',
        content: [
          'Sir Isaac Newton published three fundamental laws in 1687 that describe the relationship between physical bodies and the forces acting upon them.',
          '• First Law (Inertia): An object at rest remains at rest, and an object in uniform motion continues in motion with constant velocity, unless acted upon by a net external force.',
          '• Second Law (F = ma): The acceleration of an object is directly proportional to the net force applied and inversely proportional to its mass.',
          '• Third Law (Action-Reaction): For every action force, there is an equal in magnitude and opposite in direction reaction force.'
        ],
        keyTerms: [
          { term: 'Inertia', definition: 'The resistance of any physical object to any change in its velocity.' },
          { term: 'Newton (N)', definition: 'The SI unit of force required to accelerate 1 kg of mass by 1 m/s².' }
        ],
        diagramType: 'physics_forces'
      }
    ]
  },
  {
    id: 'res-g11-bio',
    title: 'Grade 11 Biology Notes',
    subtitle: 'Unit 1: Cell Structure',
    grade: '11',
    subject: 'Science',
    format: 'pdf',
    totalPages: 84,
    fileSize: '7.8 MB',
    author: 'Dr. Evelyn Martinez, STEAM Lead',
    publishedYear: 2025,
    rating: 4.7,
    viewsCount: 1350,
    description: 'High-level AP/IB biology review notes detailing plasma membrane fluid mosaic model, active/passive transport, endosymbiosis theory, and signal transduction pathways.',
    lastReadDate: '2026-08-18',
    lastReadTimeAgo: 'Yesterday',
    lastPageRead: 16,
    coverTheme: {
      bg: 'from-[#450a0a] to-[#1c0404]',
      text: 'text-rose-300',
      accent: '#f43f5e',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Unit 1: Eukaryotic Membrane Dynamics', page: 1 },
      { title: 'Unit 2: Active Transport & Sodium-Potassium Pump', page: 18 },
      { title: 'Unit 3: Photosystem II and Light Reactions', page: 38 },
      { title: 'Unit 4: Cellular Respiration & Krebs Cycle', page: 58 }
    ],
    samplePages: [
      {
        pageNumber: 16,
        title: 'The Fluid Mosaic Model of Cell Membranes',
        subtitle: 'Phospholipid Bilayers, Cholesterol & Integral Proteins',
        content: [
          'The plasma membrane is a dynamic phospholipid bilayer with embedded peripheral and integral proteins.',
          '• Amphipathic Nature: Phospholipids possess hydrophilic (water-loving) phosphate heads and hydrophobic (water-repelling) fatty acid tails.',
          '• Membrane Fluidity: Cholesterol molecules intercalated between phospholipids act as temperature buffers, preventing crystallization at low temps and excessive fluidity at high temps.'
        ],
        keyTerms: [
          { term: 'Osmosis', definition: 'The net movement of water molecules across a semipermeable membrane from low solute to high solute concentration.' }
        ],
        diagramType: 'biology_cell'
      }
    ]
  },
  {
    id: 'res-g5-math',
    title: 'Grade 5 Mathematics',
    subtitle: 'Unit 3: Fractions',
    grade: '5',
    subject: 'Mathematics',
    format: 'flipbook',
    totalPages: 140,
    fileSize: '11.0 MB',
    author: 'Dewey Elementary Math Group',
    publishedYear: 2025,
    rating: 4.8,
    viewsCount: 1220,
    description: 'Step-by-step visual models for adding, subtracting, multiplying, and dividing fractions with unlike denominators, mixed numbers, and visual pie charts.',
    lastReadDate: '2026-08-17',
    lastReadTimeAgo: '2 days ago',
    lastPageRead: 31,
    coverTheme: {
      bg: 'from-[#042f2e] to-[#021817]',
      text: 'text-emerald-300',
      accent: '#14b8a6',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Unit 1: Equivalent Fractions & Number Lines', page: 1 },
      { title: 'Unit 2: Adding & Subtracting with Unlike Denominators', page: 20 },
      { title: 'Unit 3: Multiplying Fractions & Area Models', page: 42 },
      { title: 'Unit 4: Dividing Whole Numbers by Unit Fractions', page: 66 }
    ],
    samplePages: [
      {
        pageNumber: 31,
        title: 'Adding Fractions with Unlike Denominators',
        subtitle: 'Finding the Least Common Denominator (LCD)',
        content: [
          'To add fractions that have different denominators, you must first rewrite them with a common denominator.',
          'Step 1: Find the Least Common Multiple (LCM) of both denominators.',
          'Step 2: Multiply the numerator and denominator by the factor needed to produce the common denominator.',
          'Step 3: Add only the numerators while keeping the common denominator unchanged.',
          'Example: 1/3 + 1/4 -> 4/12 + 3/12 = 7/12'
        ],
        keyTerms: [
          { term: 'Least Common Denominator', definition: 'The smallest common multiple of the denominators of two or more fractions.' }
        ],
        diagramType: 'math_algebra'
      }
    ]
  },
  // Additional Preparatory, Foundation, and Grade K to 12 materials for thorough coverage
  {
    id: 'res-prep-early-steam',
    title: 'Preparatory Early STEAM Discovery',
    subtitle: 'Module 1: Senses, Colors & Curiosity',
    grade: 'Preparatory',
    subject: 'Science',
    format: 'flipbook',
    totalPages: 48,
    fileSize: '5.4 MB',
    author: 'Dewey Early Childhood Academy',
    publishedYear: 2026,
    rating: 5.0,
    viewsCount: 940,
    description: 'Hands-on sensory exploration, five senses investigation, primary color mixing, and early scientific inquiry tailored for preparatory learners.',
    coverTheme: {
      bg: 'from-[#be123c] to-[#881337]',
      text: 'text-rose-200',
      accent: '#f43f5e',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Unit 1: Exploring with Our 5 Senses', page: 1 },
      { title: 'Unit 2: Colors and Shapes in Nature', page: 14 },
      { title: 'Unit 3: Floating, Sinking & Water Wonders', page: 28 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Discovering Our Five Senses',
        subtitle: 'Seeing, Hearing, Touching, Tasting & Smelling',
        content: [
          'We use our eyes to see bright rainbows, butterflies, and storybooks.',
          'We use our ears to listen to musical birds and joyful classroom bells.',
          'We use our hands to touch soft feathers and smooth river stones.'
        ],
        keyTerms: [
          { term: 'Senses', definition: 'The ways our body discovers and understands the world around us.' }
        ]
      }
    ]
  },
  {
    id: 'res-found-numbers',
    title: 'Foundation Mathematics & Patterns',
    subtitle: 'Unit 1: Visual Counting & Quantities',
    grade: 'Foundation',
    subject: 'Mathematics',
    format: 'flipbook',
    totalPages: 56,
    fileSize: '5.8 MB',
    author: 'Dewey Primary Foundation Dept',
    publishedYear: 2026,
    rating: 4.9,
    viewsCount: 820,
    description: 'Interactive visual counting from 1 to 20, geometric sorting, sequencing, and foundational number bonds for early scholars.',
    coverTheme: {
      bg: 'from-[#0e7490] to-[#155e75]',
      text: 'text-cyan-200',
      accent: '#06b6d4',
      badgeBg: 'bg-cyan-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Unit 1: Numbers Around Us (1-10)', page: 1 },
      { title: 'Unit 2: Comparing More, Less & Same', page: 18 },
      { title: 'Unit 3: Repeating Patterns with Shapes', page: 34 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Counting Our World (1 to 5)',
        subtitle: 'Connecting Numbers with Objects',
        content: [
          '1 Sun shining in the blue sky.',
          '2 Shoes on our feet ready for recess.',
          '3 Apples on the teacher\'s table.',
          '4 Wheels on the yellow school bus.'
        ],
        keyTerms: [
          { term: 'Quantity', definition: 'How many of something there are when we count.' }
        ]
      }
    ]
  },
  {
    id: 'res-gk-foundations',
    title: 'Foundation Phonics & Alphabet',
    subtitle: 'Module 1: Letter Sounds & Rhymes',
    grade: 'Foundation',
    subject: 'English',
    format: 'flipbook',
    totalPages: 64,
    fileSize: '6.2 MB',
    author: 'Dewey Early Learning Division',
    publishedYear: 2025,
    rating: 4.9,
    viewsCount: 880,
    description: 'Vibrant early learning workbook introducing consonants, short vowels, tactile letter tracing, and auditory rhyme recognition.',
    coverTheme: {
      bg: 'from-[#4c1d95] to-[#2e1065]',
      text: 'text-purple-300',
      accent: '#a855f7',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Part 1: The Alphabet Song & Vowels', page: 1 },
      { title: 'Part 2: Fun with Consonants', page: 16 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Welcome to Foundation Phonics!',
        subtitle: 'Sounding out the Alphabet',
        content: [
          'Letter A makes the sound /æ/ as in Apple and Alligator.',
          'Letter B makes the sound /b/ as in Bear and Butterfly.',
          'Letter C makes the sound /k/ as in Cat and Castle.'
        ]
      }
    ]
  },
  {
    id: 'res-g1-math',
    title: 'Grade 1 Number Adventures',
    subtitle: 'Counting, Addition & Shapes',
    grade: '1',
    subject: 'Mathematics',
    format: 'flipbook',
    totalPages: 92,
    fileSize: '8.4 MB',
    author: 'Dewey Primary Math Team',
    publishedYear: 2025,
    rating: 4.9,
    viewsCount: 750,
    description: 'Foundations of single-digit addition, place value up to 100, 2D geometric shapes, and clock-reading basics.',
    coverTheme: {
      bg: 'from-[#1e3a8a] to-[#172554]',
      text: 'text-blue-200',
      accent: '#3b82f6',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    chapters: [{ title: 'Unit 1: Addition to 20', page: 1 }],
    samplePages: [{
      pageNumber: 1,
      title: 'Counting by 2s, 5s, and 10s',
      content: ['Skip counting builds the pathway toward multiplication!']
    }]
  },
  {
    id: 'res-g2-earth',
    title: 'Grade 2 Our Planet Earth',
    subtitle: 'Landforms, Oceans & Weather',
    grade: '2',
    subject: 'Science',
    format: 'pdf',
    totalPages: 104,
    fileSize: '10.2 MB',
    author: 'Dewey Earth Science Dept',
    publishedYear: 2025,
    rating: 4.8,
    viewsCount: 620,
    description: 'Exploration of mountains, valleys, oceans, water cycles, seasons, and natural habitats for Grade 2 curiosity.',
    coverTheme: {
      bg: 'from-[#0369a1] to-[#0c4a6e]',
      text: 'text-cyan-200',
      accent: '#0284c7',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white'
    },
    chapters: [{ title: 'Unit 1: Continents & Oceans', page: 1 }],
    samplePages: [{
      pageNumber: 1,
      title: 'The Water Cycle in Action',
      content: ['Evaporation, condensation, and precipitation cycle water endlessly across our blue planet.']
    }]
  },
  {
    id: 'res-g4-tech',
    title: 'Grade 4 Introduction to Coding',
    subtitle: 'Block Programming & Logic Flow',
    grade: '4',
    subject: 'Technology',
    format: 'flipbook',
    totalPages: 130,
    fileSize: '14.0 MB',
    author: 'Dewey STEAM Innovation Lab',
    publishedYear: 2025,
    rating: 5.0,
    viewsCount: 1540,
    description: 'Hands-on beginner coding introducing sequences, loops, conditions, sprite animations, and interactive story games.',
    coverTheme: {
      bg: 'from-[#14532d] to-[#052e16]',
      text: 'text-green-300',
      accent: '#22c55e',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    chapters: [{ title: 'Unit 1: Algorithms & Sequences', page: 1 }],
    samplePages: [{
      pageNumber: 1,
      title: 'What is an Algorithm?',
      content: ['An algorithm is a step-by-step set of exact instructions to solve a problem or accomplish a task.']
    }]
  },
  {
    id: 'res-g12-cs',
    title: 'Grade 12 Advanced Software Engineering',
    subtitle: 'Data Structures, AI & Web Architecture',
    grade: '12',
    subject: 'Technology',
    format: 'pdf',
    totalPages: 340,
    fileSize: '28.5 MB',
    author: 'Sabrina Bour, STEAM Manager',
    publishedYear: 2025,
    rating: 5.0,
    viewsCount: 2450,
    description: 'Senior capstone curriculum covering algorithms, asynchronous architectures, REST/GraphQL APIs, neural networks basics, and full-stack software development.',
    isFeatured: true,
    isBookmarked: true,
    isFavorite: true,
    coverTheme: {
      bg: 'from-[#1e1b4b] to-[#020617]',
      text: 'text-indigo-400',
      accent: '#6366f1',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white'
    },
    chapters: [
      { title: 'Unit 1: Computational Complexity & Big-O Notation', page: 1 },
      { title: 'Unit 2: Binary Search Trees and Hash Maps', page: 40 },
      { title: 'Unit 3: Modern Full-Stack System Design', page: 95 },
      { title: 'Unit 4: Machine Learning Pipelines', page: 160 }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Asymptotic Analysis & Big-O Foundations',
        subtitle: 'Measuring Algorithmic Time and Space Efficiency',
        content: [
          'In computer science, Big-O notation characterizes the upper bound of execution time or memory utilization as input size n grows toward infinity.',
          '• O(1) Constant Time: Operations independent of input size (e.g., Array index lookup).',
          '• O(log n) Logarithmic Time: Halving problem space at each iteration (e.g., Binary search).',
          '• O(n) Linear Time: Single traversal over n elements.',
          '• O(n log n) Linearithmic Time: Optimal comparison-based sorting (Merge Sort, Timsort).'
        ],
        diagramType: 'coding_flow'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Chemistry Lab Manual Added',
    message: 'Grade 10 Chemistry Experiment Manual has been updated with revised safety protocols.',
    time: '10m ago',
    isRead: false,
    type: 'curriculum',
    linkResourceId: 'res-g10-chem'
  },
  {
    id: 'notif-2',
    title: 'Curriculum Review Meeting',
    message: 'STEAM department syllabus sync scheduled for Friday 2:00 PM in Lab Room 302.',
    time: '2h ago',
    isRead: false,
    type: 'alert'
  },
  {
    id: 'notif-3',
    title: 'Shared Resource from Dr. Evelyn',
    message: 'Grade 11 Biology Notes shared with your STEAM workspace.',
    time: '1d ago',
    isRead: false,
    type: 'share',
    linkResourceId: 'res-g11-bio'
  },
  {
    id: 'notif-4',
    title: 'System Maintenance Complete',
    message: 'Flipbook 3D reader engine upgraded to v2.4 with improved page turn rendering.',
    time: '3d ago',
    isRead: true,
    type: 'system'
  }
];
