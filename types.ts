
export enum EmployeeStatus {
  ACTIVE = 'نشط',
  ON_LEAVE = 'في إجازة',
  TERMINATED = 'مستقيل',
}

export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export type AttendanceStatus = 'حاضر' | 'غائب' | 'تأخير';

export interface Document {
  id: string;
  type: 'إقامة' | 'شهادة صحية' | 'رخصة قيادة' | 'عقد عمل' | 'شهادة دراسية' | 'أخرى';
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
  category: 'تقنية' | 'قيادية' | 'ناعمة';
}

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  placeholder: string;
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
  type: 'تعريف بالراتب' | 'طلب عهدة' | 'طلب سلفة' | 'تحديث بيانات';
  details: string;
  amount?: number;
  status: 'معلق' | 'مقبول' | 'مرفوض';
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  userRole: UserRole;
  department: string;
  branch: string;
  managerId?: string; // لربط الهيكل التنظيمي
  salary: number;
  joinDate: string;
  status: EmployeeStatus;
  email: string;
  phone?: string;
  avatar: string;
  isSaudi: boolean;
  shiftId?: string;
  idNumber?: string;
  iban?: string;
  documents?: Document[];
  skills?: Skill[];
  customFields?: { [key: string]: string | number };
  onboardingTasks?: { id: string; label: string; completed: boolean }[];
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  role: string;
  department: string;
  branch: string;
  status: 'معلق' | 'تم الانضمام' | 'منتهية';
  createdAt: string;
}

export interface SystemSettings {
  alertThresholdDays: number;
  companyName: string;
  autoSyncBiometric: boolean;
  customFieldDefinitions: CustomFieldDefinition[];
  departments: string[];
  officeLocation?: {
    lat: number;
    lng: number;
    radius: number; // بالمتر
  };
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface AttendanceEntry {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  clockIn?: string;
  clockOut?: string;
  location?: { lat: number; lng: number };
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
