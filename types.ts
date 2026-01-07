
export enum EmployeeStatus {
  ACTIVE = 'نشط',
  ON_LEAVE = 'في إجازة',
  TERMINATED = 'مفصول',
  RESIGNED = 'مستقيل',
  RETIRED = 'متقاعد',
}

export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export type AttendanceStatus = 'حاضر' | 'غائب' | 'تأخير';

export interface Document {
  id: string;
  type: 'إقامة' | 'شهادة صحية' | 'رخصة قيادة' | 'عقد عمل' | 'شهادة دراسية' | 'سجل تجاري' | 'بطاقة ضريبية' | 'عقد دفاع مدني' | 'شهادة توطين' | 'أخرى';
  expiryDate: string;
  fileUrl?: string;
  issueDate?: string;
}

export interface FinancialAdjustment {
  id: string;
  employeeId: string;
  type: 'مكافأة' | 'خصم' | 'سلفة' | 'بدل سكن' | 'بدل نقل';
  amount: number;
  reason: string;
  date: string;
  status?: 'معلق' | 'مقبول' | 'مرفوض';
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1 to 5
}

export interface PeerFeedback {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  skillName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Shift {
  id: string;
  name: string;
  department: string;
  startTime: string;
  endTime: string;
  workHours: number;
}

export interface ServiceRequest {
  id: string;
  employeeId: string;
  type: 'تعريف بالراتب' | 'طلب سلفة' | 'تحديث بيانات' | 'طلب عهدة';
  details: string;
  amount?: number;
  status: 'معلق' | 'مقبول' | 'مرفوض';
  createdAt: string;
}

export interface CareerLevel {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  requiredCourses: string[];
  salaryRange: { min: number; max: number };
}

export interface CareerPath {
  id: string;
  name: string;
  department: string;
  levels: CareerLevel[];
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  department: string;
  branch: string;
  status: 'معلق' | 'مقبول' | 'منتهي';
}

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  status: 'جديد' | 'مراجعة' | 'مقابلة' | 'عرض عمل' | 'مرفوض';
  aiScore: number;
  aiFeedback: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  userRole: UserRole;
  department: string;
  branch: string;
  salary: number;
  joinDate: string;
  status: EmployeeStatus;
  email: string;
  phone?: string;
  avatar: string;
  gender: 'ذكر' | 'أنثى';
  isSaudi: boolean;
  idNumber?: string;
  idExpiryDate?: string;
  iban?: string;
  shiftId?: string;
  documents?: Document[];
  skills?: Skill[];
  careerPathId?: string;
  currentLevelId?: string;
  onboardingTasks?: { id: string; label: string; completed: boolean }[];
  customFields?: Record<string, any>;
}

export interface BiometricDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  status: 'online' | 'offline';
  lastSync?: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  documents?: Document[];
}

export interface SystemSettings {
  alertThresholdDays: number;
  companyName: string;
  autoSyncBiometric: boolean;
  departments: string[];
  customFieldDefinitions: CustomFieldDefinition[];
  officeLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

export interface AttendanceEntry {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  clockIn?: string;
  clockOut?: string;
  location?: { lat: number; lng: number };
  source?: 'manual' | 'biometric' | 'gps';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'سنوية' | 'مرضية' | 'اضطرارية';
  startDate: string;
  endDate: string;
  status: 'معلق' | 'مقبول' | 'مرفوض';
  reason: string;
  createdAt: string;
}
