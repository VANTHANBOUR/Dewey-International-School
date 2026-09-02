export interface SchemeOfWorkStandard {
  code: string;
  description: string;
  subject: string;
  grade: string;
  term?: string;
  topic?: string;
}

export const SCHEMES_OF_WORK_STANDARDS: SchemeOfWorkStandard[] = [
  // SCIENCE STANDARDS
  {
    code: "DIS-SCI.FND.01",
    description: "Observe, describe, and compare common properties of living and non-living things in their local environments.",
    subject: "Science",
    grade: "Foundation",
    term: "Term 1",
    topic: "Introduction to Life"
  },
  {
    code: "DIS-SCI.FND.02",
    description: "Identify and name five basic human senses and describe how they help explore and gather environmental observations.",
    subject: "Science",
    grade: "Foundation",
    term: "Term 2",
    topic: "Senses and Observations"
  },
  {
    code: "DIS-SCI.PREP.01",
    description: "Investigate basic life cycles of familiar animals and plants, noting patterns of growth and physical changes.",
    subject: "Science",
    grade: "Preparatory",
    term: "Term 1",
    topic: "Life Cycles"
  },
  {
    code: "DIS-SCI.G1.01",
    description: "Classify animal groups into vertebrates and invertebrates based on physical features and observable bone structures.",
    subject: "Science",
    grade: "1",
    term: "Term 1",
    topic: "Animal Diversity"
  },
  {
    code: "DIS-SCI.G2.01",
    description: "Investigate seed germination conditions and model plant root, stem, leaf, and flower developmental pathways.",
    subject: "Science",
    grade: "2",
    term: "Term 1",
    topic: "Plant Physiology"
  },
  {
    code: "DIS-SCI.G3.01",
    description: "Formulate simple classification keys to categorize local flora and fauna, utilizing physical features as distinct metrics.",
    subject: "Science",
    grade: "3",
    term: "Term 2",
    topic: "Taxonomy & Keys"
  },
  {
    code: "DIS-SCI.G4.01",
    description: "Observe and measure magnetic forces, demonstrating attraction, repulsion, and magnetic fields using bar magnets.",
    subject: "Science",
    grade: "4",
    term: "Term 1",
    topic: "Electromagnetism"
  },
  {
    code: "DIS-SCI.G5.01",
    description: "Diagram states of matter (solid, liquid, gas) at particle levels, explaining phase changes relative to kinetic energy.",
    subject: "Science",
    grade: "5",
    term: "Term 2",
    topic: "Thermodynamics"
  },
  {
    code: "DIS-SCI.G6.01",
    description: "Define Cell Theory and compare animal and plant cell organelles (nucleus, cytoplasm, wall, chloroplast, mitochondria).",
    subject: "Science",
    grade: "6",
    term: "Term 1",
    topic: "Cellular Biology"
  },
  {
    code: "DIS-SCI.G6.02",
    description: "Analyze simple food chains and trophic levels to demonstrate how energy flows from primary producers to apex predators.",
    subject: "Science",
    grade: "6",
    term: "Term 2",
    topic: "Ecosystem Energy"
  },
  {
    code: "DIS-SCI.G7.01",
    description: "Analyze the properties of mixtures, solutions, and suspensions, demonstrating physical separation techniques (filtration, chromatography, distillation).",
    subject: "Science",
    grade: "7",
    term: "Term 1",
    topic: "Inorganic Chemistry"
  },
  {
    code: "DIS-SCI.G7.02",
    description: "Model the rock cycle, detailing transformation pathways of igneous, sedimentary, and metamorphic formations.",
    subject: "Science",
    grade: "7",
    term: "Term 2",
    topic: "Lithosphere Dynamics"
  },
  {
    code: "DIS-SCI.G8.01",
    description: "Apply Newton's Three Laws of Motion to calculate force, mass, and acceleration using algebraic equations (F = ma).",
    subject: "Science",
    grade: "8",
    term: "Term 1",
    topic: "Newtonian Physics"
  },
  {
    code: "DIS-SCI.G8.02",
    description: "Model tectonic plate boundaries (divergent, convergent, transform) and correlate them with seismic and volcanic events.",
    subject: "Science",
    grade: "8",
    term: "Term 2",
    topic: "Plate Tectonics"
  },
  {
    code: "DIS-SCI.G9.01",
    description: "Investigate cellular respiration, glycolysis, and ATP synthesis pathways within cellular mitochondria.",
    subject: "Science",
    grade: "9",
    term: "Term 1",
    topic: "Cellular Respiration"
  },
  {
    code: "DIS-SCI.G9.02",
    description: "Analyze chemical reactions to balance equations, identify stoichiometric ratios, and apply the law of conservation of mass.",
    subject: "Science",
    grade: "9",
    term: "Term 2",
    topic: "Stoichiometry & Reactions"
  },
  {
    code: "DIS-SCI.G10.01",
    description: "Analyze carbon, nitrogen, and phosphorus cycles and quantify human ecological footprints on ecosystem stability.",
    subject: "Science",
    grade: "10",
    term: "Term 1",
    topic: "Ecological Balances"
  },
  {
    code: "DIS-SCI.G10.02",
    description: "Investigate wave mechanics, defining wavelength, frequency, amplitude, and properties of electromagnetic radiation.",
    subject: "Science",
    grade: "10",
    term: "Term 2",
    topic: "Wave Optics & EM"
  },
  {
    code: "DIS-SCI.G11.01",
    description: "Explain chromosome behavior during meiosis and construct Punnett squares to predict Mendelian and non-Mendelian inheritance patterns.",
    subject: "Science",
    grade: "11",
    term: "Term 1",
    topic: "Genetic Heritage"
  },
  {
    code: "DIS-SCI.G11.02",
    description: "Calculate thermodynamic parameters (enthalpy, entropy, Gibbs free energy) to determine chemical reaction spontaneity.",
    subject: "Science",
    grade: "11",
    term: "Term 2",
    topic: "Chemical Thermodynamics"
  },
  {
    code: "DIS-SCI.G12.01",
    description: "Describe electrochemical cells and apply Faraday's Laws of Electrolysis to calculate metal deposition weights.",
    subject: "Science",
    grade: "12",
    term: "Term 1",
    topic: "Electrochemistry"
  },
  {
    code: "DIS-SCI.G12.02",
    description: "Apply quantum mechanics principles to explain hydrogen line spectra, electron configurations, and orbital shapes.",
    subject: "Science",
    grade: "12",
    term: "Term 2",
    topic: "Quantum Atomic Model"
  },

  // MATHEMATICS STANDARDS
  {
    code: "DIS-MATH.FND.01",
    description: "Count, read, and write whole numbers up to 100, performing basic addition and subtraction with visual aids.",
    subject: "Mathematics",
    grade: "Foundation",
    term: "Term 1",
    topic: "Number Sense"
  },
  {
    code: "DIS-MATH.PREP.01",
    description: "Recognize simple geometric 2D shapes (circle, square, triangle, rectangle) and sort objects by color, size, and shape.",
    subject: "Mathematics",
    grade: "Preparatory",
    term: "Term 1",
    topic: "Shape Sorting"
  },
  {
    code: "DIS-MATH.G1.01",
    description: "Perform single and double digit addition and subtraction without regrouping up to 50.",
    subject: "Mathematics",
    grade: "1",
    term: "Term 1",
    topic: "Basic Arithmetic"
  },
  {
    code: "DIS-MATH.G2.01",
    description: "Solve multi-step word problems involving addition and subtraction up to 100, requiring regrouping mechanisms.",
    subject: "Mathematics",
    grade: "2",
    term: "Term 1",
    topic: "Problem Solving"
  },
  {
    code: "DIS-MATH.G3.01",
    description: "Master multiplication and division facts up to 10x10, identifying fractional representation of visual shapes.",
    subject: "Mathematics",
    grade: "3",
    term: "Term 1",
    topic: "Multiplication & Fractions"
  },
  {
    code: "DIS-MATH.G4.01",
    description: "Compare, order, and compute simple fractions and decimals, performing basic currency conversions.",
    subject: "Mathematics",
    grade: "4",
    term: "Term 2",
    topic: "Fractional Algebra"
  },
  {
    code: "DIS-MATH.G5.01",
    description: "Calculate perimeter, area, and volume of basic 2D and 3D shapes (rectangles, triangles, cubes).",
    subject: "Mathematics",
    grade: "5",
    term: "Term 1",
    topic: "Measurement Geometry"
  },
  {
    code: "DIS-MATH.G6.01",
    description: "Formulate and solve simple algebraic expressions, identifying dependent and independent variables in functions.",
    subject: "Mathematics",
    grade: "6",
    term: "Term 1",
    topic: "Introduction to Algebra"
  },
  {
    code: "DIS-MATH.G7.01",
    description: "Formulate and solve single-variable linear equations and plot linear graphs on a 4-quadrant Cartesian plane.",
    subject: "Mathematics",
    grade: "7",
    term: "Term 1",
    topic: "Linear Coordinates"
  },
  {
    code: "DIS-MATH.G8.01",
    description: "Apply the Pythagorean Theorem to find missing side lengths in right triangles and solve distance problems.",
    subject: "Mathematics",
    grade: "8",
    term: "Term 1",
    topic: "Pythagorean Geometry"
  },
  {
    code: "DIS-MATH.G8.02",
    description: "Formulate and solve systems of two linear equations using substitution and elimination methods.",
    subject: "Mathematics",
    grade: "8",
    term: "Term 2",
    topic: "Systems of Equations"
  },
  {
    code: "DIS-MATH.G9.01",
    description: "Factor quadratic trinomials, solve quadratic equations using the quadratic formula, and plot quadratic parabolas.",
    subject: "Mathematics",
    grade: "9",
    term: "Term 1",
    topic: "Quadratic Systems"
  },
  {
    code: "DIS-MATH.G10.01",
    description: "Apply trigonometric ratios (sine, cosine, tangent) to calculate unknown angles and sides of right triangles.",
    subject: "Mathematics",
    grade: "10",
    term: "Term 1",
    topic: "Trigonometric Geometry"
  },
  {
    code: "DIS-MATH.G11.01",
    description: "Calculate limit operations and apply first-order derivatives to optimize non-linear algebraic functions.",
    subject: "Mathematics",
    grade: "11",
    term: "Term 1",
    topic: "Differential Calculus"
  },
  {
    code: "DIS-MATH.G12.01",
    description: "Apply definite integration methods to calculate exact areas under polynomial curves.",
    subject: "Mathematics",
    grade: "12",
    term: "Term 1",
    topic: "Integral Calculus"
  },

  // ENGLISH STANDARDS
  {
    code: "DIS-ENG.FND.01",
    description: "Blend phonetic sounds to decode three-letter words (CVC) and practice writing short high-frequency sight words.",
    subject: "English",
    grade: "Foundation",
    term: "Term 1",
    topic: "Phonics & Coding"
  },
  {
    code: "DIS-ENG.PREP.01",
    description: "Listen attentively to story read-alouds, retell core sequences, and identify main characters.",
    subject: "English",
    grade: "Preparatory",
    term: "Term 1",
    topic: "Story Comprehension"
  },
  {
    code: "DIS-ENG.G1.01",
    description: "Read aloud grade-level text with sufficient accuracy and flow, distinguishing nouns from action verbs.",
    subject: "English",
    grade: "1",
    term: "Term 1",
    topic: "Early Reading & Grammar"
  },
  {
    code: "DIS-ENG.G2.01",
    description: "Draft short descriptive narratives utilizing proper capitalization, commas, and periods.",
    subject: "English",
    grade: "2",
    term: "Term 1",
    topic: "Creative Writing"
  },
  {
    code: "DIS-ENG.G3.01",
    description: "Identify main ideas, supporting details, and author purposes in diverse expository articles.",
    subject: "English",
    grade: "3",
    term: "Term 1",
    topic: "Expository Reading"
  },
  {
    code: "DIS-ENG.G4.01",
    description: "Distinguish literal from figurative language (similes, metaphors, personification) within poetry.",
    subject: "English",
    grade: "4",
    term: "Term 1",
    topic: "Poetic Devices"
  },
  {
    code: "DIS-ENG.G5.01",
    description: "Draft 3-paragraph informational reports citing at least two verified external sources.",
    subject: "English",
    grade: "5",
    term: "Term 2",
    topic: "Report Formulation"
  },
  {
    code: "DIS-ENG.G6.01",
    description: "Analyze how plot structures, conflict patterns, and character resolutions develop themes in fiction.",
    subject: "English",
    grade: "6",
    term: "Term 1",
    topic: "Literary Analysis"
  },
  {
    code: "DIS-ENG.G7.01",
    description: "Draft structured argumentative papers utilizing logical arguments, claims, and counter-arguments.",
    subject: "English",
    grade: "7",
    term: "Term 1",
    topic: "Persuasive Writing"
  },
  {
    code: "DIS-ENG.G8.01",
    description: "Analyze primary persuasive tactics (ethos, pathos, logos) across historical essays and speeches.",
    subject: "English",
    grade: "8",
    term: "Term 1",
    topic: "Rhetorical Criticism"
  },
  {
    code: "DIS-ENG.G9.01",
    description: "Deconstruct stylistic devices, subtext, and thematic elements in seminal dramatic plays (e.g. Shakespearean dramas).",
    subject: "English",
    grade: "9",
    term: "Term 1",
    topic: "Dramatic Deconstruction"
  },
  {
    code: "DIS-ENG.G10.01",
    description: "Synthesize multiple informational sources to write comprehensive, analytical research reports.",
    subject: "English",
    grade: "10",
    term: "Term 1",
    topic: "Research Synthesis"
  },
  {
    code: "DIS-ENG.G11.01",
    description: "Evaluate complex literature across historical and cultural contexts, tracing evolution of language styles.",
    subject: "English",
    grade: "11",
    term: "Term 1",
    topic: "Historical Literature"
  },
  {
    code: "DIS-ENG.G12.01",
    description: "Formulate a formal, thesis-driven academic research paper in APA/MLA format, defending positions with scholarly sources.",
    subject: "English",
    grade: "12",
    term: "Term 1",
    topic: "Capstone Thesis"
  },

  // TECHNOLOGY STANDARDS
  {
    code: "DIS-TECH.G1.01",
    description: "Identify computer parts (monitor, keyboard, mouse, CPU) and practice fundamental keyboard typing.",
    subject: "Technology",
    grade: "1",
    term: "Term 1",
    topic: "Digital Basics"
  },
  {
    code: "DIS-TECH.G3.01",
    description: "Develop simple animations using visual, block-based coding structures (Scratch) with sequences and loops.",
    subject: "Technology",
    grade: "3",
    term: "Term 1",
    topic: "Block Coding"
  },
  {
    code: "DIS-TECH.G6.01",
    description: "Design structured algorithms incorporating conditional execution logic, variables, and nested loop matrices.",
    subject: "Technology",
    grade: "6",
    term: "Term 1",
    topic: "Algorithmic Logic"
  },
  {
    code: "DIS-TECH.G9.01",
    description: "Code modular programs in Python utilizing list databases, control structures, and developer libraries.",
    subject: "Technology",
    grade: "9",
    term: "Term 1",
    topic: "Python Essentials"
  },
  {
    code: "DIS-TECH.G12.01",
    description: "Develop fully functional web services using HTML5, modern CSS layouts, JavaScript databases, and server scripts.",
    subject: "Technology",
    grade: "12",
    term: "Term 1",
    topic: "Full-Stack Development"
  },

  // ENGINEERING STANDARDS
  {
    code: "DIS-ENGR.G3.01",
    description: "Describe the Engineering Design Process (Ask, Imagine, Plan, Create, Improve) and construct simple cardboard structures.",
    subject: "Engineering",
    grade: "3",
    term: "Term 1",
    topic: "Design Cycles"
  },
  {
    code: "DIS-ENGR.G6.01",
    description: "Design and build load-bearing truss bridges using toothpicks and glue, testing structural load efficiencies.",
    subject: "Engineering",
    grade: "6",
    term: "Term 1",
    topic: "Structural Mechanics"
  },
  {
    code: "DIS-ENGR.G9.01",
    description: "Model 3D CAD parts using TinkerCAD/Onshape, incorporating precise dimensional measures and volume checks.",
    subject: "Engineering",
    grade: "9",
    term: "Term 1",
    topic: "3D Modeling CAD"
  },
  {
    code: "DIS-ENGR.G12.01",
    description: "Construct programmed microcontroller systems (Arduino/Raspberry Pi) utilizing sensors, inputs, and physical feedback actuators.",
    subject: "Engineering",
    grade: "12",
    term: "Term 1",
    topic: "Physical Computing"
  },

  // SOCIAL STUDIES STANDARDS
  {
    code: "DIS-SOC.G1.01",
    description: "Recognize local community structures, services, geographic maps, and key national monuments.",
    subject: "Social Studies",
    grade: "1",
    term: "Term 1",
    topic: "Civics & Geography"
  },
  {
    code: "DIS-SOC.G3.01",
    description: "Trace historical evolutions of local settlements, highlighting connections to water sources and farming.",
    subject: "Social Studies",
    grade: "3",
    term: "Term 1",
    topic: "Historical Settlements"
  },
  {
    code: "DIS-SOC.G6.01",
    description: "Analyze early Mesopotamian, Indus Valley, and Egyptian civilizations, noting agricultural and legal codes.",
    subject: "Social Studies",
    grade: "6",
    term: "Term 1",
    topic: "Ancient Civilizations"
  },
  {
    code: "DIS-SOC.G9.01",
    description: "Compare structural components of the Roman Republic with classical Athenian democracies.",
    subject: "Social Studies",
    grade: "9",
    term: "Term 1",
    topic: "Classical Republics"
  },
  {
    code: "DIS-SOC.G12.01",
    description: "Deconstruct economic globalization models, tracing micro-macro interactions between trade networks and fiscal policies.",
    subject: "Social Studies",
    grade: "12",
    term: "Term 1",
    topic: "Global Macroeconomics"
  },

  // ARTS STANDARDS
  {
    code: "DIS-ARTS.G3.01",
    description: "Identify warm and cool colors, applying secondary mixing principles within paint compositions.",
    subject: "Arts",
    grade: "3",
    term: "Term 1",
    topic: "Color Theory"
  },
  {
    code: "DIS-ARTS.G6.01",
    description: "Demonstrate one-point linear perspective drawing to represent accurate spatial depths on 2D planes.",
    subject: "Arts",
    grade: "6",
    term: "Term 1",
    topic: "Linear Perspectives"
  },
  {
    code: "DIS-ARTS.G9.01",
    description: "Analyze classic and modern art genres, demonstrating distinct brush styles and compositional systems.",
    subject: "Arts",
    grade: "9",
    term: "Term 1",
    topic: "Art Movements"
  },

  // PHYSICAL EDUCATION STANDARDS
  {
    code: "DIS-PE.G3.01",
    description: "Demonstrate basic motor skills (running, hopping, catching) and describe benefits of daily aerobic exercise.",
    subject: "Physical Education",
    grade: "3",
    term: "Term 1",
    topic: "Motor Coordination"
  },
  {
    code: "DIS-PE.G6.01",
    description: "Explain proper warm-up, cool-down protocols, cardiovascular health rates, and team sport safety.",
    subject: "Physical Education",
    grade: "6",
    term: "Term 1",
    topic: "Cardio Physiology"
  },
  {
    code: "DIS-PE.G9.01",
    description: "Analyze personal metabolic targets and design complete athletic training programs tailored to aerobic and core power goals.",
    subject: "Physical Education",
    grade: "9",
    term: "Term 1",
    topic: "Athletic Conditioning"
  }
];

export function getStandardsBySubjectAndGrade(subject: string, grade: string): SchemeOfWorkStandard[] {
  // Try to find exact matches first
  const exactMatches = SCHEMES_OF_WORK_STANDARDS.filter(
    (s) => s.subject.toLowerCase() === subject.toLowerCase() && s.grade.toLowerCase() === grade.toLowerCase()
  );
  
  if (exactMatches.length > 0) {
    return exactMatches;
  }

  // Fallback to searching matching subject but general grade ranges
  const isHighSchool = ["9", "10", "11", "12"].includes(grade);
  const isMiddleSchool = ["6", "7", "8"].includes(grade);
  const isElementary = ["1", "2", "3", "4", "5"].includes(grade);
  const isEarlyYears = ["Foundation", "Preparatory"].includes(grade);

  return SCHEMES_OF_WORK_STANDARDS.filter((s) => {
    if (s.subject.toLowerCase() !== subject.toLowerCase()) return false;
    
    if (isHighSchool && ["9", "10", "11", "12"].includes(s.grade)) return true;
    if (isMiddleSchool && ["6", "7", "8"].includes(s.grade)) return true;
    if (isElementary && ["1", "2", "3", "4", "5"].includes(s.grade)) return true;
    if (isEarlyYears && ["Foundation", "Preparatory"].includes(s.grade)) return true;
    
    return false;
  });
}
