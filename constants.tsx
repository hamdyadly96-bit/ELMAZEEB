
import { Employee, EmployeeStatus, Branch, CareerPath } from './types';

export const INITIAL_CAREER_PATHS: CareerPath[] = [
  {
    id: 'path_tech_dev',
    name: 'مسار التطوير التقني',
    department: 'التطوير',
    levels: [
      {
        id: 'lv_jr_dev',
        title: 'مطور جونيور',
        description: 'بداية الرحلة التقنية، التركيز على تنفيذ المهام المحددة وتعلم معايير البرمجة في المنظمة.',
        requiredSkills: ['React', 'JavaScript', 'Git'],
        requiredCourses: ['أساسيات React المتقدمة', 'هياكل البيانات'],
        salaryRange: { min: 8000, max: 11000 }
      },
      {
        id: 'lv_sr_dev',
        title: 'مطور سينيور',
        description: 'قيادة المشاريع البرمجية الصغيرة، مراجعة الكود، والمساهمة في تصميم النظام.',
        requiredSkills: ['System Design', 'TypeScript', 'Node.js'],
        requiredCourses: ['هندسة البرمجيات الكبيرة', 'الأمن السيبراني للمطورين'],
        salaryRange: { min: 12000, max: 18000 }
      }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'أحمد علي',
    role: 'مدير تقني',
    userRole: 'ADMIN',
    department: 'التطوير',
    branch: 'المركز الرئيسي - الرياض',
    salary: 15000,
    joinDate: '2022-01-15',
    status: EmployeeStatus.ACTIVE,
    email: 'ahmed@company.com',
    phone: '0501234567',
    avatar: 'https://picsum.photos/seed/1/200',
    gender: 'ذكر',
    isSaudi: true,
    idNumber: '1234567890',
    idExpiryDate: '2026-10-10',
    iban: 'SA1000000000000000000001',
    careerPathId: 'path_tech_dev',
    currentLevelId: 'lv_sr_dev',
    documents: []
  },
  {
    id: '2',
    name: 'سارة محمود',
    role: 'أخصائية موارد بشرية',
    userRole: 'EMPLOYEE',
    department: 'الموارد البشرية',
    branch: 'فرع جدة',
    salary: 9000,
    joinDate: '2023-03-10',
    status: EmployeeStatus.ACTIVE,
    email: 'sara@company.com',
    phone: '0555555555',
    avatar: 'https://picsum.photos/seed/2/200',
    gender: 'أنثى',
    isSaudi: true,
    idNumber: '2000000001',
    idExpiryDate: '2025-05-15',
    iban: 'SA1000000000000000000002',
    careerPathId: 'path_hr_growth',
    currentLevelId: 'lv_hr_spec',
    documents: []
  }
];

export const DEPARTMENTS = [
  'التطوير',
  'الموارد البشرية',
  'التصميم',
  'المالية',
  'التسويق',
  'المبيعات',
  'الدعم الفني'
];

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', name: 'المركز الرئيسي - الرياض', location: 'الرياض' },
  { id: 'b2', name: 'فرع جدة', location: 'جدة' },
  { id: 'b3', name: 'فرع الدمام', location: 'الدمام' }
];
