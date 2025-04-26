import { 
  users, 
  classes, 
  classSessions,
  attendance,
  studentProgress,
  techniques,
  type User, 
  type InsertUser,
  type Class,
  type InsertClass,
  type ClassSession,
  type InsertClassSession,
  type Attendance,
  type InsertAttendance,
  type StudentProgress,
  type InsertStudentProgress,
  type Technique,
  type InsertTechnique
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";

// Comprehensive interface with CRUD methods for all entities
export interface IStorage {
  // User related operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Class related operations
  getClass(id: number): Promise<Class | undefined>;
  getAllClasses(): Promise<Class[]>;
  getClassesByInstructor(instructorId: number): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: number): Promise<boolean>;
  
  // Class sessions
  getClassSession(id: number): Promise<ClassSession | undefined>;
  getSessionsByClass(classId: number): Promise<ClassSession[]>;
  createClassSession(sessionData: InsertClassSession): Promise<ClassSession>;
  updateClassSession(id: number, sessionData: Partial<InsertClassSession>): Promise<ClassSession | undefined>;
  deleteClassSession(id: number): Promise<boolean>;
  
  // Attendance
  getAttendance(id: number): Promise<Attendance | undefined>;
  getAttendanceBySession(sessionId: number): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: number): Promise<Attendance[]>;
  createAttendance(attendanceData: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: number): Promise<boolean>;
  
  // Student progress
  getStudentProgress(id: number): Promise<StudentProgress | undefined>;
  getProgressByStudent(studentId: number): Promise<StudentProgress | undefined>;
  createStudentProgress(progressData: InsertStudentProgress): Promise<StudentProgress>;
  updateStudentProgress(id: number, progressData: Partial<InsertStudentProgress>): Promise<StudentProgress | undefined>;
  
  // Techniques
  getTechnique(id: number): Promise<Technique | undefined>;
  getAllTechniques(): Promise<Technique[]>;
  getTechniquesByCategory(category: string): Promise<Technique[]>;
  getTechniquesByBeltLevel(beltLevel: string): Promise<Technique[]>;
  createTechnique(techniqueData: InsertTechnique): Promise<Technique>;
  updateTechnique(id: number, techniqueData: Partial<InsertTechnique>): Promise<Technique | undefined>;
  deleteTechnique(id: number): Promise<boolean>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

// Initialize PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Class operations
  async getClass(id: number): Promise<Class | undefined> {
    const [bjjClass] = await db.select().from(classes).where(eq(classes.id, id));
    return bjjClass;
  }

  async getAllClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async getClassesByInstructor(instructorId: number): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.instructorId, instructorId));
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [bjjClass] = await db
      .insert(classes)
      .values(classData)
      .returning();
    return bjjClass;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const [updatedClass] = await db
      .update(classes)
      .set(classData)
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  async deleteClass(id: number): Promise<boolean> {
    const result = await db
      .delete(classes)
      .where(eq(classes.id, id));
    return true;
  }

  // Class session operations
  async getClassSession(id: number): Promise<ClassSession | undefined> {
    const [session] = await db.select().from(classSessions).where(eq(classSessions.id, id));
    return session;
  }

  async getSessionsByClass(classId: number): Promise<ClassSession[]> {
    return await db.select().from(classSessions).where(eq(classSessions.classId, classId));
  }

  async createClassSession(sessionData: InsertClassSession): Promise<ClassSession> {
    const [session] = await db
      .insert(classSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async updateClassSession(id: number, sessionData: Partial<InsertClassSession>): Promise<ClassSession | undefined> {
    const [updatedSession] = await db
      .update(classSessions)
      .set(sessionData)
      .where(eq(classSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deleteClassSession(id: number): Promise<boolean> {
    await db
      .delete(classSessions)
      .where(eq(classSessions.id, id));
    return true;
  }

  // Attendance operations
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const [record] = await db.select().from(attendance).where(eq(attendance.id, id));
    return record;
  }

  async getAttendanceBySession(sessionId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.sessionId, sessionId));
  }

  async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.studentId, studentId));
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [record] = await db
      .insert(attendance)
      .values(attendanceData)
      .returning();
    return record;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [updatedRecord] = await db
      .update(attendance)
      .set(attendanceData)
      .where(eq(attendance.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    await db
      .delete(attendance)
      .where(eq(attendance.id, id));
    return true;
  }

  // Student progress operations
  async getStudentProgress(id: number): Promise<StudentProgress | undefined> {
    const [progress] = await db.select().from(studentProgress).where(eq(studentProgress.id, id));
    return progress;
  }

  async getProgressByStudent(studentId: number): Promise<StudentProgress | undefined> {
    const [progress] = await db.select().from(studentProgress).where(eq(studentProgress.studentId, studentId));
    return progress;
  }

  async createStudentProgress(progressData: InsertStudentProgress): Promise<StudentProgress> {
    const [progress] = await db
      .insert(studentProgress)
      .values(progressData)
      .returning();
    return progress;
  }

  async updateStudentProgress(id: number, progressData: Partial<InsertStudentProgress>): Promise<StudentProgress | undefined> {
    const [updatedProgress] = await db
      .update(studentProgress)
      .set(progressData)
      .where(eq(studentProgress.id, id))
      .returning();
    return updatedProgress;
  }

  // Technique operations
  async getTechnique(id: number): Promise<Technique | undefined> {
    const [technique] = await db.select().from(techniques).where(eq(techniques.id, id));
    return technique;
  }

  async getAllTechniques(): Promise<Technique[]> {
    return await db.select().from(techniques);
  }

  async getTechniquesByCategory(category: string): Promise<Technique[]> {
    return await db.select().from(techniques).where(eq(techniques.category, category));
  }

  async getTechniquesByBeltLevel(beltLevel: string): Promise<Technique[]> {
    return await db.select().from(techniques).where(eq(techniques.beltLevel, beltLevel));
  }

  async createTechnique(techniqueData: InsertTechnique): Promise<Technique> {
    const [technique] = await db
      .insert(techniques)
      .values(techniqueData)
      .returning();
    return technique;
  }

  async updateTechnique(id: number, techniqueData: Partial<InsertTechnique>): Promise<Technique | undefined> {
    const [updatedTechnique] = await db
      .update(techniques)
      .set(techniqueData)
      .where(eq(techniques.id, id))
      .returning();
    return updatedTechnique;
  }

  async deleteTechnique(id: number): Promise<boolean> {
    await db
      .delete(techniques)
      .where(eq(techniques.id, id));
    return true;
  }
}

// Export an instance of the database storage
export const storage = new DatabaseStorage();
