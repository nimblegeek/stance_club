import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  role: text("role").default("student").notNull(),  // 'instructor', 'student', 'admin'
  createdAt: timestamp("created_at").defaultNow(),
});

// Classes table for BJJ classes
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  instructorId: integer("instructor_id").references(() => users.id).notNull(),
  level: text("level").notNull(),  // 'beginner', 'intermediate', 'advanced', 'all-levels'
  type: text("type").notNull(),  // 'gi', 'no-gi', 'open-mat'
  maxCapacity: integer("max_capacity"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Class sessions table (actual scheduled instances of classes)
export const classSessions = pgTable("class_sessions", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),  // Store as HH:MM format
  endTime: text("end_time").notNull(),      // Store as HH:MM format
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance table to track student attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => classSessions.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  status: text("status").notNull(),  // 'present', 'absent', 'late'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student progress table
export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  beltRank: text("belt_rank").notNull(),  // 'white', 'blue', 'purple', 'brown', 'black'
  stripes: integer("stripes").default(0),
  lastPromotionDate: date("last_promotion_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Techniques table
export const techniques = pgTable("techniques", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),  // 'guard', 'pass', 'submission', etc.
  beltLevel: text("belt_level"),  // Minimum belt level
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  classesTaught: many(classes),
  attended: many(attendance),
  progress: many(studentProgress),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  instructor: one(users, {
    fields: [classes.instructorId],
    references: [users.id],
  }),
  sessions: many(classSessions),
}));

export const classSessionsRelations = relations(classSessions, ({ one, many }) => ({
  class: one(classes, {
    fields: [classSessions.classId],
    references: [classes.id],
  }),
  attendees: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(users, {
    fields: [attendance.studentId],
    references: [users.id],
  }),
  session: one(classSessions, {
    fields: [attendance.sessionId],
    references: [classSessions.id],
  }),
}));

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  student: one(users, {
    fields: [studentProgress.studentId],
    references: [users.id],
  }),
}));

// Schemas for data insertion and validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  role: true,
});

export const insertClassSchema = createInsertSchema(classes);
export const insertClassSessionSchema = createInsertSchema(classSessions);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertStudentProgressSchema = createInsertSchema(studentProgress);
export const insertTechniqueSchema = createInsertSchema(techniques);

// Types for TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export type InsertClassSession = z.infer<typeof insertClassSessionSchema>;
export type ClassSession = typeof classSessions.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;
export type StudentProgress = typeof studentProgress.$inferSelect;

export type InsertTechnique = z.infer<typeof insertTechniqueSchema>;
export type Technique = typeof techniques.$inferSelect;
