import { AuthUser } from './auth';

export enum Permission {
  // Batch permissions
  CREATE_BATCH = 'CREATE_BATCH',
  VIEW_BATCHES = 'VIEW_BATCHES',
  MANAGE_BATCH = 'MANAGE_BATCH',
  
  // Course permissions
  CREATE_COURSE = 'CREATE_COURSE',
  VIEW_COURSES = 'VIEW_COURSES',
  MANAGE_COURSE = 'MANAGE_COURSE',
  
  // Student permissions
  CREATE_STUDENT = 'CREATE_STUDENT',
  VIEW_STUDENTS = 'VIEW_STUDENTS',
  MANAGE_STUDENT = 'MANAGE_STUDENT',
  
  // Admin permissions
  MANAGE_COLLEGES = 'MANAGE_COLLEGES',
  MANAGE_DEPARTMENTS = 'MANAGE_DEPARTMENTS',
  MANAGE_PROGRAMS = 'MANAGE_PROGRAMS',
  MANAGE_USERS = 'MANAGE_USERS',
}

export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false;
  
  const { role } = user;
  
  switch (permission) {
    // Batch permissions - only admin, university, and department roles
    case Permission.CREATE_BATCH:
    case Permission.MANAGE_BATCH:
      return ['ADMIN', 'UNIVERSITY', 'DEPARTMENT'].includes(role);
    
    case Permission.VIEW_BATCHES:
      return ['ADMIN', 'UNIVERSITY', 'DEPARTMENT', 'PROGRAM_COORDINATOR'].includes(role);
    
    // Course permissions - program coordinator can create in their batch, admin/university/department can manage all
    case Permission.CREATE_COURSE:
      return ['ADMIN', 'UNIVERSITY', 'DEPARTMENT', 'PROGRAM_COORDINATOR'].includes(role);
    
    case Permission.MANAGE_COURSE:
      return ['ADMIN', 'UNIVERSITY', 'DEPARTMENT'].includes(role);
    
    case Permission.VIEW_COURSES:
      return ['ADMIN', 'UNIVERSITY', 'DEPARTMENT', 'PROGRAM_COORDINATOR', 'TEACHER'].includes(role);
    
    // Student permissions
    case Permission.CREATE_STUDENT:
    case Permission.MANAGE_STUDENT:
      return ['ADMIN', 'UNIVERSITY', 'DEPARTMENT', 'PROGRAM_COORDINATOR'].includes(role);
    
    case Permission.VIEW_STUDENTS:
      return ['ADMIN', 'UNIVERSITY', 'DEPARTMENT', 'PROGRAM_COORDINATOR', 'TEACHER'].includes(role);
    
    // Admin permissions
    case Permission.MANAGE_COLLEGES:
    case Permission.MANAGE_DEPARTMENTS:
    case Permission.MANAGE_PROGRAMS:
    case Permission.MANAGE_USERS:
      return ['ADMIN', 'UNIVERSITY'].includes(role);
    
    default:
      return false;
  }
}

export function canCreateBatch(user: AuthUser | null): boolean {
  return hasPermission(user, Permission.CREATE_BATCH);
}

export function canCreateCourse(user: AuthUser | null): boolean {
  return hasPermission(user, Permission.CREATE_COURSE);
}

export function canManageCourse(user: AuthUser | null): boolean {
  return hasPermission(user, Permission.MANAGE_COURSE);
}

export function canCreateStudent(user: AuthUser | null): boolean {
  return hasPermission(user, Permission.CREATE_STUDENT);
}

export function canManageCollege(user: AuthUser | null): boolean {
  return hasPermission(user, Permission.MANAGE_COLLEGES);
}

export function canManageDepartment(user: AuthUser | null): boolean {
  return hasPermission(user, Permission.MANAGE_DEPARTMENTS);
}

export function canManageProgram(user: AuthUser | null): boolean {
  return hasPermission(user, Permission.MANAGE_PROGRAMS);
}