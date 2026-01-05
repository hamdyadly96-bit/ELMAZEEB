
import { Employee, EmployeeStatus, Branch } from './types';

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
    isSaudi: true,
    documents: [
      { id: 'd1', type: 'إقامة', expiryDate: '2025-12-30' },
      { id: 'd2', type: 'شهادة صحية', expiryDate: '2024-06-15' }
    ]
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
    isSaudi: true,
    documents: [
      { id: 'd3', type: 'إقامة', expiryDate: '2025-01-20' }
    ]
  },
  {
    id: '3',
    name: 'راجيش كومار',
    role: 'محاسب',
    userRole: 'EMPLOYEE',
    department: 'المالية',
    branch: 'المركز الرئيسي - الرياض',
    salary: 7500,
    joinDate: '2023-05-20',
    status: EmployeeStatus.ACTIVE,
    email: 'rajesh@company.com',
    phone: '0599999999',
    avatar: 'https://picsum.photos/seed/3/200',
    isSaudi: false,
    documents: [
      { id: 'd4', type: 'إقامة', expiryDate: '2025-08-10' }
    ]
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
