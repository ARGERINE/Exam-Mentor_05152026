// Structured mock data — mirrors what Firestore will return.
// Field names match PostgreSQL column names exactly.
// Replace mock-data.ts imports everywhere with imports from this file.

import type { 
  Chapter, 
  Question, 
  SubjectPerformance, 
  ChapterPerformance, 
  QuestionTypePerformance, 
  PerformanceSummary, 
  RevisionPoolItem, 
  WeeklyPlan, 
  WeeklySession, 
  PsychologicalState, 
  Subscription, 
  UserBaseline 
} from './types'

export const EXAMS = [
  { id: 'neet', name: 'NEET 2025', description: 'National Eligibility cum Entrance Test' },
  { id: 'jee', name: 'JEE Main', description: 'Joint Entrance Examination' },
  { id: 'cat', name: 'CAT 2025', description: 'Common Admission Test' },
  { id: 'gate', name: 'GATE', description: 'Graduate Aptitude Test in Engineering' },
  { id: 'cuet', name: 'CUET', description: 'Common University Entrance Test' },
];

export const MOCK_SUBJECTS = [
  { id: 'sub-phy-001', name: 'PHYSICS' },
  { id: 'sub-chem-001', name: 'CHEMISTRY' },
  { id: 'sub-bio-001', name: 'BIOLOGY' },
];

export const MOCK_CHAPTERS: Chapter[] = [
  // PHYSICS - Class XI
  { id: 'ch-phy-01', subject_id: 'sub-phy-001', unit: 'Unit 1', chapter_name: 'Physical World', slug: 'physical-world', class_level: 'XI', chapter_order: 1 },
  { id: 'ch-phy-02', subject_id: 'sub-phy-001', unit: 'Unit 2', chapter_name: 'Motion in a Straight Line', slug: 'motion-straight-line', class_level: 'XI', chapter_order: 2 },
  { id: 'ch-phy-03', subject_id: 'sub-phy-001', unit: 'Unit 3', chapter_name: 'Laws of Motion', slug: 'laws-of-motion', class_level: 'XI', chapter_order: 3 },
  { id: 'ch-phy-04', subject_id: 'sub-phy-001', unit: 'Unit 4', chapter_name: 'Work, Energy and Power', slug: 'work-energy-power', class_level: 'XI', chapter_order: 4 },
  { id: 'ch-phy-05', subject_id: 'sub-phy-001', unit: 'Unit 5', chapter_name: 'Gravitation', slug: 'gravitation', class_level: 'XI', chapter_order: 5 },
  // PHYSICS - Class XII
  { id: 'ch-phy-06', subject_id: 'sub-phy-001', unit: 'Unit 1', chapter_name: 'Electric Charges and Fields', slug: 'electric-charges-fields', class_level: 'XII', chapter_order: 6 },
  { id: 'ch-phy-07', subject_id: 'sub-phy-001', unit: 'Unit 1', chapter_name: 'Electrostatic Potential and Capacitance', slug: 'electrostatic-potential', class_level: 'XII', chapter_order: 7 },
  { id: 'ch-phy-08', subject_id: 'sub-phy-001', unit: 'Unit 2', chapter_name: 'Current Electricity', slug: 'current-electricity', class_level: 'XII', chapter_order: 8 },
  { id: 'ch-phy-09', subject_id: 'sub-phy-001', unit: 'Unit 3', chapter_name: 'Moving Charges and Magnetism', slug: 'moving-charges-magnetism', class_level: 'XII', chapter_order: 9 },
  { id: 'ch-phy-10', subject_id: 'sub-phy-001', unit: 'Unit 6', chapter_name: 'Optics', slug: 'optics', class_level: 'XII', chapter_order: 10 },
  // CHEMISTRY - Class XI
  { id: 'ch-chem-01', subject_id: 'sub-chem-001', unit: 'Unit 1', chapter_name: 'Some Basic Concepts of Chemistry', slug: 'basic-concepts-chemistry', class_level: 'XI', chapter_order: 1 },
  { id: 'ch-chem-02', subject_id: 'sub-chem-001', unit: 'Unit 2', chapter_name: 'Structure of Atom', slug: 'structure-of-atom', class_level: 'XI', chapter_order: 2 },
  { id: 'ch-chem-03', subject_id: 'sub-chem-001', unit: 'Unit 3', chapter_name: 'Chemical Bonding and Molecular Structure', slug: 'chemical-bonding', class_level: 'XI', chapter_order: 3 },
  { id: 'ch-chem-04', subject_id: 'sub-chem-001', unit: 'Unit 5', chapter_name: 'Thermodynamics', slug: 'thermodynamics', class_level: 'XI', chapter_order: 4 },
  { id: 'ch-chem-05', subject_id: 'sub-chem-001', unit: 'Unit 6', chapter_name: 'Equilibrium', slug: 'equilibrium', class_level: 'XI', chapter_order: 5 },
  // CHEMISTRY - Class XII
  { id: 'ch-chem-06', subject_id: 'sub-chem-001', unit: 'Unit 1', chapter_name: 'The Solid State', slug: 'solid-state', class_level: 'XII', chapter_order: 6 },
  { id: 'ch-chem-07', subject_id: 'sub-chem-001', unit: 'Unit 3', chapter_name: 'Electrochemistry', slug: 'electrochemistry', class_level: 'XII', chapter_order: 7 },
  { id: 'ch-chem-08', subject_id: 'sub-chem-001', unit: 'Unit 7', chapter_name: 'Coordination Compounds', slug: 'coordination-compounds', class_level: 'XII', chapter_order: 8 },
  // BIOLOGY - Class XI
  { id: 'ch-bio-01', subject_id: 'sub-bio-001', unit: 'Unit 1', chapter_name: 'The Living World', slug: 'living-world', class_level: 'XI', chapter_order: 1 },
  { id: 'ch-bio-02', subject_id: 'sub-bio-001', unit: 'Unit 2', chapter_name: 'Biological Classification', slug: 'biological-classification', class_level: 'XI', chapter_order: 2 },
  { id: 'ch-bio-03', subject_id: 'sub-bio-001', unit: 'Unit 3', chapter_name: 'Cell: The Unit of Life', slug: 'cell-unit-of-life', class_level: 'XI', chapter_order: 3 },
  { id: 'ch-bio-04', subject_id: 'sub-bio-001', unit: 'Unit 4', chapter_name: 'Photosynthesis in Higher Plants', slug: 'photosynthesis', class_level: 'XI', chapter_order: 4 },
  { id: 'ch-bio-05', subject_id: 'sub-bio-001', unit: 'Unit 4', chapter_name: 'Respiration in Plants', slug: 'respiration-plants', class_level: 'XI', chapter_order: 5 },
  // BIOLOGY - Class XII
  { id: 'ch-bio-06', subject_id: 'sub-bio-001', unit: 'Unit 6', chapter_name: 'Reproduction in Organisms', slug: 'reproduction', class_level: 'XII', chapter_order: 6 },
  { id: 'ch-bio-07', subject_id: 'sub-bio-001', unit: 'Unit 7', chapter_name: 'Principles of Inheritance and Variation', slug: 'genetics', class_level: 'XII', chapter_order: 7 },
  { id: 'ch-bio-08', subject_id: 'sub-bio-001', unit: 'Unit 7', chapter_name: 'Molecular Basis of Inheritance', slug: 'molecular-inheritance', class_level: 'XII', chapter_order: 8 },
  { id: 'ch-bio-09', subject_id: 'sub-bio-001', unit: 'Unit 8', chapter_name: 'Human Health and Disease', slug: 'human-health-disease', class_level: 'XII', chapter_order: 9 },
  { id: 'ch-bio-10', subject_id: 'sub-bio-001', unit: 'Unit 8', chapter_name: 'Microbes in Human Welfare', slug: 'microbes-human-welfare', class_level: 'XII', chapter_order: 10 },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q-phy-001',
    unique_question_id: 'PHY-ELEC-001',
    question_text: 'If the distance between two charges is doubled, what happens to the electrostatic force between them?',
    option_a: 'It becomes double',
    option_b: 'It becomes half',
    option_c: 'It becomes one-fourth',
    option_d: 'It remains the same',
    correct_option: 'C',
    difficulty: 'EASY',
    taxonomy_category: 'UNDERSTAND',
    taxonomy_type: 'CONCEPTUAL',
    explanation: 'By Coulomb\'s Law, F = kq1q2/r². Doubling r makes r² four times larger, so force becomes F/4.',
    subject_id: 'sub-phy-001',
    chapter_id: 'ch-phy-06',
    expected_time_seconds: 90,
  },
  {
    id: 'q-phy-002',
    unique_question_id: 'PHY-ELEC-002',
    question_text: 'A point charge q is placed at the center of a cubic Gaussian surface. The electric flux through any one face of the cube is:',
    option_a: 'q / ε₀',
    option_b: 'q / 4ε₀',
    option_c: 'q / 6ε₀',
    option_d: 'q / 8ε₀',
    correct_option: 'C',
    difficulty: 'MEDIUM',
    taxonomy_category: 'APPLY',
    taxonomy_type: 'APPLICATION',
    explanation: 'By Gauss\'s Law, total flux = q/ε₀. Cube has 6 identical faces, each gets q/6ε₀.',
    subject_id: 'sub-phy-001',
    chapter_id: 'ch-phy-06',
    expected_time_seconds: 120,
  },
  {
    id: 'q-chem-001',
    unique_question_id: 'CHEM-BOND-001',
    question_text: 'Which of the following molecules has the highest dipole moment?',
    option_a: 'NF₃',
    option_b: 'NH₃',
    option_c: 'CO₂',
    option_d: 'BF₃',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    taxonomy_category: 'UNDERSTAND',
    taxonomy_type: 'CONCEPTUAL',
    explanation: 'In NH₃, lone pair and bond dipoles reinforce. In NF₃ they oppose. CO₂ and BF₃ are zero.',
    subject_id: 'sub-chem-001',
    chapter_id: 'ch-chem-03',
    expected_time_seconds: 100,
  },
  {
    id: 'q-bio-001',
    unique_question_id: 'BIO-GEN-001',
    question_text: 'The ratio of phenotypes in a dihybrid cross following independent assortment is:',
    option_a: '3:1',
    option_b: '1:2:1',
    option_c: '9:3:3:1',
    option_d: '1:1:1:1',
    correct_option: 'C',
    difficulty: 'EASY',
    taxonomy_category: 'REMEMBER',
    taxonomy_type: 'FACTUAL',
    explanation: 'Standard dihybrid cross AaBb × AaBb yields 9:3:3:1 phenotypic ratio by independent assortment.',
    subject_id: 'sub-bio-001',
    chapter_id: 'ch-bio-07',
    expected_time_seconds: 60,
  },
  {
    id: 'q-bio-002',
    unique_question_id: 'BIO-CELL-001',
    question_text: 'Which enzyme is responsible for unwinding the DNA double helix during replication?',
    option_a: 'DNA Polymerase',
    option_b: 'Helicase',
    option_c: 'Ligase',
    option_d: 'Primase',
    correct_option: 'B',
    difficulty: 'EASY',
    taxonomy_category: 'REMEMBER',
    taxonomy_type: 'FACTUAL',
    explanation: 'Helicase breaks hydrogen bonds between base pairs, unwinding the double helix at the replication fork.',
    subject_id: 'sub-bio-001',
    chapter_id: 'ch-bio-08',
    expected_time_seconds: 45,
  },
  {
    id: 'q-phy-003',
    unique_question_id: 'PHY-CURR-001',
    question_text: 'Two resistors of 4Ω and 6Ω are connected in parallel. The equivalent resistance is:',
    option_a: '10 Ω',
    option_b: '2.4 Ω',
    option_c: '5 Ω',
    option_d: '1.2 Ω',
    correct_option: 'B',
    difficulty: 'HARD',
    taxonomy_category: 'APPLY',
    taxonomy_type: 'NUMERICAL',
    explanation: '1/R = 1/4 + 1/6 = 3/12 + 2/12 = 5/12. So R = 12/5 = 2.4Ω.',
    subject_id: 'sub-phy-001',
    chapter_id: 'ch-phy-08',
    expected_time_seconds: 150,
  },
];

export const MOCK_SUBJECT_PERFORMANCE: SubjectPerformance[] = [
  { id: 'sp-001', user_id: 'current-user', subject_id: 'sub-phy-001', attempts_30d: 245, correct_30d: 178, accuracy_30d: 72.65, easy_correct: 89, easy_attempts: 95, medium_correct: 65, medium_attempts: 95, hard_correct: 24, hard_attempts: 55, last_updated: new Date().toISOString() },
  { id: 'sp-002', user_id: 'current-user', subject_id: 'sub-chem-001', attempts_30d: 210, correct_30d: 168, accuracy_30d: 80.00, easy_correct: 92, easy_attempts: 100, medium_correct: 58, medium_attempts: 70, hard_correct: 18, hard_attempts: 40, last_updated: new Date().toISOString() },
  { id: 'sp-003', user_id: 'current-user', subject_id: 'sub-bio-001', attempts_30d: 380, correct_30d: 312, accuracy_30d: 82.11, easy_correct: 185, easy_attempts: 200, medium_correct: 97, medium_attempts: 120, hard_correct: 30, hard_attempts: 60, last_updated: new Date().toISOString() },
];

export const MOCK_CHAPTER_PERFORMANCE: ChapterPerformance[] = [
  { id: 'cp-001', user_id: 'current-user', chapter_id: 'ch-phy-08', attempts_30d: 40, correct_30d: 15, accuracy_30d: 37.50, easy_correct: 8, easy_attempts: 10, medium_correct: 5, medium_attempts: 18, hard_correct: 2, hard_attempts: 12, last_updated: new Date().toISOString() },
  { id: 'cp-002', user_id: 'current-user', chapter_id: 'ch-chem-03', attempts_30d: 25, correct_30d: 10, accuracy_30d: 40.00, easy_correct: 5, easy_attempts: 8, medium_correct: 3, medium_attempts: 10, hard_correct: 2, hard_attempts: 7, last_updated: new Date().toISOString() },
  { id: 'cp-003', user_id: 'current-user', chapter_id: 'ch-bio-07', attempts_30d: 60, correct_30d: 27, accuracy_30d: 45.00, easy_correct: 15, easy_attempts: 20, medium_correct: 8, medium_attempts: 25, hard_correct: 4, hard_attempts: 15, last_updated: new Date().toISOString() },
  { id: 'cp-004', user_id: 'current-user', chapter_id: 'ch-phy-06', attempts_30d: 80, correct_30d: 57, accuracy_30d: 71.25, easy_correct: 28, easy_attempts: 30, medium_correct: 20, medium_attempts: 28, hard_correct: 9, hard_attempts: 22, last_updated: new Date().toISOString() },
  { id: 'cp-005', user_id: 'current-user', chapter_id: 'ch-bio-08', attempts_30d: 70, correct_30d: 62, accuracy_30d: 88.57, easy_correct: 30, easy_attempts: 30, medium_correct: 22, medium_attempts: 25, hard_correct: 10, hard_attempts: 15, last_updated: new Date().toISOString() },
];

export const MOCK_QT_PERFORMANCE: QuestionTypePerformance[] = [
  { id: 'qt-001', user_id: 'current-user', question_type: 'FACTUAL', attempts_30d: 280, correct_30d: 246, accuracy_30d: 87.86, avg_time_seconds: 35, last_updated: new Date().toISOString() },
  { id: 'qt-002', user_id: 'current-user', question_type: 'CONCEPTUAL', attempts_30d: 195, correct_30d: 155, accuracy_30d: 79.49, avg_time_seconds: 68, last_updated: new Date().toISOString() },
  { id: 'qt-003', user_id: 'current-user', question_type: 'APPLICATION', attempts_30d: 140, correct_30d: 106, accuracy_30d: 75.71, avg_time_seconds: 95, last_updated: new Date().toISOString() },
  { id: 'qt-004', user_id: 'current-user', question_type: 'NUMERICAL', attempts_30d: 120, correct_30d: 66, accuracy_30d: 55.00, avg_time_seconds: 145, last_updated: new Date().toISOString() },
  { id: 'qt-005', user_id: 'current-user', question_type: 'ASSERTION_REASON', attempts_30d: 80, correct_30d: 38, accuracy_30d: 47.50, avg_time_seconds: 118, last_updated: new Date().toISOString() },
  { id: 'qt-006', user_id: 'current-user', question_type: 'MATCH_THE_FOLLOWING', attempts_30d: 45, correct_30d: 31, accuracy_30d: 68.89, avg_time_seconds: 102, last_updated: new Date().toISOString() },
  { id: 'qt-007', user_id: 'current-user', question_type: 'STATEMENT_BASED', attempts_30d: 60, correct_30d: 40, accuracy_30d: 66.67, avg_time_seconds: 98, last_updated: new Date().toISOString() },
];

export const MOCK_PERFORMANCE_SUMMARY: PerformanceSummary = {
  user_id: 'current-user',
  subject_accuracy: { PHYSICS: 72.65, CHEMISTRY: 80.00, BIOLOGY: 82.11 },
  chapter_accuracy: { 'ch-phy-06': 71.25, 'ch-bio-08': 88.57, 'ch-phy-08': 37.50 },
  taxonomy_accuracy: {
    FACTUAL: 87.86,
    CONCEPTUAL: 79.49,
    APPLICATION: 75.71,
    ANALYTICAL: 70.00,
    NUMERICAL: 55.00,
    ASSERTION_REASON: 47.50,
    MATCH_THE_FOLLOWING: 68.89,
    STATEMENT_BASED: 66.67,
  },
  rolling_5_mock_accuracy: 78.40,
  consistency_score: 72.00,
  confidence_score: 68.50,
  percentile: 91.50,
  predicted_rank_range: 'Under 8,000',
  last_updated: new Date().toISOString(),
};

export const MOCK_REVISION_POOL: RevisionPoolItem[] = [
  { id: 'rp-001', user_id: 'current-user', question_id: 'q-bio-002', reason: 'INCORRECT', consecutive_correct_count: 0, active_flag: true, last_attempted_at: '2026-04-10', priority_score: 4.8, created_at: '2026-04-10T10:00:00Z' },
  { id: 'rp-002', user_id: 'current-user', question_id: 'q-phy-003', reason: 'TIME_HEAVY', consecutive_correct_count: 1, active_flag: true, last_attempted_at: '2026-04-11', priority_score: 3.5, created_at: '2026-04-11T14:00:00Z' },
  { id: 'rp-003', user_id: 'current-user', question_id: 'q-chem-002', reason: 'INCORRECT', consecutive_correct_count: 0, active_flag: true, last_attempted_at: '2026-04-09', priority_score: 4.2, created_at: '2026-04-09T09:00:00Z' },
  { id: 'rp-004', user_id: 'current-user', question_id: 'q-bio-003', reason: 'SKIPPED', consecutive_correct_count: 0, active_flag: true, last_attempted_at: '2026-04-08', priority_score: 2.9, created_at: '2026-04-08T16:00:00Z' },
];

export const MOCK_WEEKLY_PLAN: WeeklyPlan = {
  id: 'wp-active-001',
  user_id: 'current-user',
  exam_code: 'NEET_UG',
  week_start: '2026-04-14',
  week_end: '2026-04-20',
  exam_date: '2026-05-04',
  is_active: true,
  recalibration_version: 2,
  created_at: '2026-04-14T00:00:00Z',
};

export const MOCK_WEEKLY_SESSIONS: WeeklySession[] = [
  { id: 'ws-1', weekly_plan_id: 'wp-active-001', chapter_id: 'ch-phy-10', session_type: 'NEW', planned_question_count: 25, completed_question_count: 0, status: 'PENDING', scheduled_date: '2026-04-14', created_at: '2026-04-14T00:00:00Z' },
  { id: 'ws-2', weekly_plan_id: 'wp-active-001', chapter_id: 'ch-phy-08', session_type: 'REVISION', planned_question_count: 20, completed_question_count: 0, status: 'PENDING', scheduled_date: '2026-04-15', created_at: '2026-04-14T00:00:00Z' },
  { id: 'ws-3', weekly_plan_id: 'wp-active-001', chapter_id: 'ch-chem-08', session_type: 'NEW', planned_question_count: 25, completed_question_count: 0, status: 'PENDING', scheduled_date: '2026-04-16', created_at: '2026-04-14T00:00:00Z' },
  { id: 'ws-4', weekly_plan_id: 'wp-active-001', chapter_id: 'ch-bio-07', session_type: 'REVISION', planned_question_count: 20, completed_question_count: 12, status: 'IN_PROGRESS', scheduled_date: '2026-04-17', created_at: '2026-04-14T00:00:00Z' },
  { id: 'ws-5', weekly_plan_id: 'wp-active-001', chapter_id: 'ch-chem-03', session_type: 'REMEDIATION', planned_question_count: 15, completed_question_count: 15, status: 'COMPLETED', scheduled_date: '2026-04-18', created_at: '2026-04-14T00:00:00Z' },
  { id: 'ws-6', weekly_plan_id: 'wp-active-001', chapter_id: 'ch-bio-09', session_type: 'REVISION', planned_question_count: 20, completed_question_count: 0, status: 'PENDING', scheduled_date: '2026-04-19', created_at: '2026-04-14T00:00:00Z' },
  { id: 'ws-7', weekly_plan_id: 'wp-active-001', chapter_id: undefined, session_type: 'MOCK', planned_question_count: 180, completed_question_count: 0, status: 'PENDING', scheduled_date: '2026-04-20', created_at: '2026-04-14T00:00:00Z' },
];

export const MOCK_PSYCH_STATE: PsychologicalState = {
  user_id: 'current-user',
  anxiety_level: 'MEDIUM',
  assessed_at: '2026-04-10T08:00:00Z',
  reassess_required: false,
};

export const MOCK_SUBSCRIPTION: Subscription = {
  id: 'sub-001',
  user_id: 'current-user',
  plan: 'FREE',
  status: 'active',
  valid_until: undefined,
  created_at: '2026-01-15T09:30:00Z',
};

export const MOCK_BASELINE: UserBaseline = {
  id: 'bl-001',
  user_id: 'current-user',
  exam_code: 'NEET_UG',
  target_exam_date: '2026-05-04',
  weekly_study_hours: 25,
  preparation_stage: 'ADVANCED',
  subject_self_rating: { PHYSICS: 6, CHEMISTRY: 7, BIOLOGY: 8 },
  subject_confidence: { PHYSICS: 'LOW', CHEMISTRY: 'STABLE', BIOLOGY: 'HIGH' },
  is_active: true,
  version_number: 2,
  reset_used: false,
  is_evolved: true,
  evolved_at: '2026-03-01T10:00:00Z',
  evolution_trigger: 'POST_MOCK_BLOCK_5',
  created_at: '2026-01-15T09:30:00Z',
};

export const MOCK_STUDY_DATA = {
  dailyStudyHours: [4, 5, 3, 6, 2, 4, 5],
  averageSessionFocusDurationMinutes: 45,
  recentPracticeScores: [
    { topic: 'Physics', score: 65, date: new Date().toISOString() },
    { topic: 'Chemistry', score: 82, date: new Date().toISOString() },
    { topic: 'Biology', score: 90, date: new Date().toISOString() },
  ],
  commonErrorTypes: ['rushing through assertion questions', 'conceptual gaps in organic chemistry'],
  lastBreakDurationDays: 1,
  currentConfidenceLevel: 'medium' as const,
};

export const MOCK_ERROR_LOGS = [
  {
    questionId: 'q-phy-003',
    subject: 'Physics',
    topic: 'Current Electricity',
    questionText: 'Two resistors of 4Ω and 6Ω are connected in parallel. The equivalent resistance is:',
    errorType: 'calculation',
    timeTakenSeconds: 150,
    isRepeated: true,
    repeatCount: 2
  },
  {
    questionId: 'q-chem-002',
    subject: 'Chemistry',
    topic: 'Thermodynamics',
    questionText: 'Consider the statement: Enthalpy is a state function. Reason: Enthalpy depends only on initial and final states.',
    errorType: 'conceptual',
    timeTakenSeconds: 130,
    isRepeated: false,
    repeatCount: 1
  }
];
