import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertClassSchema, 
  insertClassSessionSchema, 
  insertAttendanceSchema,
  insertStudentProgressSchema,
  insertTechniqueSchema
} from "@shared/schema";
import { z } from "zod";

// Initialize Stripe conditionally if the API key is available
let stripe: any = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    console.log("Stripe integration initialized");
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
  }
} else {
  console.log("Stripe integration not available: STRIPE_SECRET_KEY environment variable not set");
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

// Middleware to check if user is an instructor or admin
const isInstructor = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user.role === "instructor" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden. Instructor access required." });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Special endpoint to make the logged-in user an admin (for testing only)
  app.post("/api/become-admin", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        console.log("No user found in request");
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      console.log("Current user before update:", req.user);
      const userId = req.user.id;
      
      console.log("Updating user with ID:", userId);
      const updatedUser = await storage.updateUser(userId, { role: "admin" });
      
      if (!updatedUser) {
        console.log("User not found after update");
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log("User updated successfully:", updatedUser);
      
      // Update the session user object
      req.login(updatedUser, (err) => {
        if (err) {
          console.error("Failed to update session:", err);
          return res.status(500).json({ error: "Failed to update session" });
        }
        console.log("User session updated, sending response");
        res.json(updatedUser);
      });
    } catch (error) {
      console.error("Error updating user to admin:", error);
      res.status(500).json({ error: "Failed to update user to admin" });
    }
  });

  // ===== Members API =====
  app.get("/api/members", isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getAllUsers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", isAuthenticated, async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getUser(memberId);
      
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      res.json(member);
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ error: "Failed to fetch member details" });
    }
  });

  app.post("/api/members", isInstructor, async (req, res) => {
    try {
      const memberData = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(memberData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // If creating a new member, we need to set a default password
      if (!memberData.password) {
        memberData.password = "changeme123"; // This would be hashed by the createUser method
      }
      
      const member = await storage.createUser(memberData);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating member:", error);
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.put("/api/members/:id", isInstructor, async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const memberData = req.body;
      
      const updatedMember = await storage.updateUser(memberId, memberData);
      
      if (!updatedMember) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  app.delete("/api/members/:id", isInstructor, async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      
      // Check if the member exists
      const member = await storage.getUser(memberId);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      // Delete member (this would need to be implemented in storage)
      // For now, we'll return success
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting member:", error);
      res.status(500).json({ error: "Failed to delete member" });
    }
  });

  // ===== Progress Notes API =====
  app.get("/api/members/:id/progress", isAuthenticated, async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      
      // Mock progress notes data until we implement storage methods
      const progressNotes = [
        {
          id: 1,
          memberId,
          date: new Date().toISOString().split('T')[0],
          noteType: "technique",
          title: "Improved Guard Passing",
          content: "Showed significant improvement in guard passing techniques. Can now effectively pass closed guard using pressure passing."
        },
        {
          id: 2,
          memberId,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          noteType: "general",
          title: "Attendance and Attitude",
          content: "Consistent attendance for the past month. Shows great attitude and willingness to help newer students."
        }
      ];
      
      res.json(progressNotes);
    } catch (error) {
      console.error("Error fetching progress notes:", error);
      res.status(500).json({ error: "Failed to fetch progress notes" });
    }
  });

  app.post("/api/progress-notes", isInstructor, async (req, res) => {
    try {
      const noteData = req.body;
      
      // Mock created note with ID
      const note = {
        id: Date.now(),
        ...noteData,
      };
      
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating progress note:", error);
      res.status(500).json({ error: "Failed to create progress note" });
    }
  });

  app.put("/api/progress-notes/:id", isInstructor, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const noteData = req.body;
      
      // Mock updated note
      const updatedNote = {
        id: noteId,
        ...noteData,
      };
      
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating progress note:", error);
      res.status(500).json({ error: "Failed to update progress note" });
    }
  });

  app.delete("/api/progress-notes/:id", isInstructor, async (req, res) => {
    try {
      // Just return success for now
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting progress note:", error);
      res.status(500).json({ error: "Failed to delete progress note" });
    }
  });

  // ===== BJJ Classes API =====
  app.get("/api/classes", isAuthenticated, async (req, res) => {
    try {
      const classes = await storage.getAllClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/:id", isAuthenticated, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      const bjjClass = await storage.getClass(classId);
      
      if (!bjjClass) {
        return res.status(404).json({ error: "Class not found" });
      }
      
      res.json(bjjClass);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ error: "Failed to fetch class" });
    }
  });

  app.post("/api/classes", isInstructor, async (req, res) => {
    try {
      const validatedData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(validatedData);
      res.status(201).json(newClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating class:", error);
      res.status(500).json({ error: "Failed to create class" });
    }
  });

  app.put("/api/classes/:id", isInstructor, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      const validatedData = insertClassSchema.partial().parse(req.body);
      
      const updatedClass = await storage.updateClass(classId, validatedData);
      if (!updatedClass) {
        return res.status(404).json({ error: "Class not found" });
      }
      
      res.json(updatedClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating class:", error);
      res.status(500).json({ error: "Failed to update class" });
    }
  });

  app.delete("/api/classes/:id", isInstructor, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      await storage.deleteClass(classId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  // ===== Class Sessions API =====
  app.get("/api/classes/:classId/sessions", isAuthenticated, async (req, res) => {
    try {
      const classId = parseInt(req.params.classId);
      const sessions = await storage.getSessionsByClass(classId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching class sessions:", error);
      res.status(500).json({ error: "Failed to fetch class sessions" });
    }
  });
  
  // Get all sessions (for calendar view)
  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      // Get date range filters from query parameters
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Fetch all sessions or filtered by date range if provided
      let sessions;
      if (startDate && endDate) {
        sessions = await storage.getSessionsByDateRange(startDate, endDate);
      } else {
        // Combine all sessions with their class details for easier rendering
        const allClasses = await storage.getAllClasses();
        const allSessions = await storage.getAllSessions();
        
        // Enrich sessions with class details
        sessions = allSessions.map(session => {
          const classDetails = allClasses.find(c => c.id === session.classId);
          return {
            ...session,
            classTitle: classDetails?.title || "Unknown Class",
            classType: classDetails?.type || "Unknown Type",
            classLevel: classDetails?.level || "Unknown Level"
          };
        });
      }
      
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", isInstructor, async (req, res) => {
    try {
      const validatedData = insertClassSessionSchema.parse(req.body);
      const newSession = await storage.createClassSession(validatedData);
      res.status(201).json(newSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating class session:", error);
      res.status(500).json({ error: "Failed to create class session" });
    }
  });

  app.put("/api/sessions/:id", isInstructor, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const validatedData = insertClassSessionSchema.partial().parse(req.body);
      
      const updatedSession = await storage.updateClassSession(sessionId, validatedData);
      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(updatedSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  app.delete("/api/sessions/:id", isInstructor, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      await storage.deleteClassSession(sessionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // ===== Attendance API =====
  app.get("/api/sessions/:sessionId/attendance", isInstructor, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const attendanceRecords = await storage.getAttendanceBySession(sessionId);
      res.json(attendanceRecords);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Failed to fetch attendance records" });
    }
  });

  app.post("/api/attendance", isInstructor, async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const newAttendance = await storage.createAttendance(validatedData);
      res.status(201).json(newAttendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating attendance record:", error);
      res.status(500).json({ error: "Failed to create attendance record" });
    }
  });

  app.put("/api/attendance/:id", isInstructor, async (req, res) => {
    try {
      const attendanceId = parseInt(req.params.id);
      const validatedData = insertAttendanceSchema.partial().parse(req.body);
      
      const updatedAttendance = await storage.updateAttendance(attendanceId, validatedData);
      if (!updatedAttendance) {
        return res.status(404).json({ error: "Attendance record not found" });
      }
      
      res.json(updatedAttendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating attendance record:", error);
      res.status(500).json({ error: "Failed to update attendance record" });
    }
  });

  // ===== Student Progress API =====
  app.get("/api/students/:studentId/progress", isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      
      // Only instructors or the student themselves can view progress
      if (req.user?.id !== studentId && req.user?.role !== "instructor" && req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const progress = await storage.getProgressByStudent(studentId);
      if (!progress) {
        return res.status(404).json({ error: "No progress record found for this student" });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({ error: "Failed to fetch student progress" });
    }
  });

  app.post("/api/progress", isInstructor, async (req, res) => {
    try {
      const validatedData = insertStudentProgressSchema.parse(req.body);
      
      // Check if progress already exists for this student
      const existingProgress = await storage.getProgressByStudent(validatedData.studentId);
      if (existingProgress) {
        return res.status(400).json({ error: "Student already has a progress record. Use PUT to update." });
      }
      
      const newProgress = await storage.createStudentProgress(validatedData);
      res.status(201).json(newProgress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating student progress:", error);
      res.status(500).json({ error: "Failed to create student progress" });
    }
  });

  app.put("/api/progress/:id", isInstructor, async (req, res) => {
    try {
      const progressId = parseInt(req.params.id);
      const validatedData = insertStudentProgressSchema.partial().parse(req.body);
      
      // Add updated timestamp
      const dataWithTimestamp = {
        ...validatedData,
        updatedAt: new Date()
      };
      
      const updatedProgress = await storage.updateStudentProgress(progressId, dataWithTimestamp);
      if (!updatedProgress) {
        return res.status(404).json({ error: "Progress record not found" });
      }
      
      res.json(updatedProgress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating student progress:", error);
      res.status(500).json({ error: "Failed to update student progress" });
    }
  });

  // ===== Techniques API =====
  app.get("/api/techniques", isAuthenticated, async (req, res) => {
    try {
      const techniques = await storage.getAllTechniques();
      res.json(techniques);
    } catch (error) {
      console.error("Error fetching techniques:", error);
      res.status(500).json({ error: "Failed to fetch techniques" });
    }
  });

  app.get("/api/techniques/category/:category", isAuthenticated, async (req, res) => {
    try {
      const category = req.params.category;
      const techniques = await storage.getTechniquesByCategory(category);
      res.json(techniques);
    } catch (error) {
      console.error("Error fetching techniques by category:", error);
      res.status(500).json({ error: "Failed to fetch techniques by category" });
    }
  });

  app.get("/api/techniques/belt/:beltLevel", isAuthenticated, async (req, res) => {
    try {
      const beltLevel = req.params.beltLevel;
      const techniques = await storage.getTechniquesByBeltLevel(beltLevel);
      res.json(techniques);
    } catch (error) {
      console.error("Error fetching techniques by belt level:", error);
      res.status(500).json({ error: "Failed to fetch techniques by belt level" });
    }
  });

  app.post("/api/techniques", isInstructor, async (req, res) => {
    try {
      const validatedData = insertTechniqueSchema.parse(req.body);
      const newTechnique = await storage.createTechnique(validatedData);
      res.status(201).json(newTechnique);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating technique:", error);
      res.status(500).json({ error: "Failed to create technique" });
    }
  });

  app.put("/api/techniques/:id", isInstructor, async (req, res) => {
    try {
      const techniqueId = parseInt(req.params.id);
      const validatedData = insertTechniqueSchema.partial().parse(req.body);
      
      const updatedTechnique = await storage.updateTechnique(techniqueId, validatedData);
      if (!updatedTechnique) {
        return res.status(404).json({ error: "Technique not found" });
      }
      
      res.json(updatedTechnique);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating technique:", error);
      res.status(500).json({ error: "Failed to update technique" });
    }
  });

  app.delete("/api/techniques/:id", isInstructor, async (req, res) => {
    try {
      const techniqueId = parseInt(req.params.id);
      await storage.deleteTechnique(techniqueId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting technique:", error);
      res.status(500).json({ error: "Failed to delete technique" });
    }
  });

  // Create HTTP server
  // ===== Stripe Payment API =====
  // These endpoints are boilerplate templates that will work once Stripe is fully configured
  
  // Create a payment intent for one-time payments
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Stripe payment processing is not available. Please configure Stripe API keys."
        });
      }
      
      const { amount, currency = "usd" } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }
      
      // Convert amount to cents (Stripe uses smallest currency unit)
      const amountInCents = Math.round(amount * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        // Optional metadata can be added here
        metadata: {
          userId: req.user?.id.toString(),
          username: req.user?.username
        }
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create or get subscription
  app.post("/api/create-subscription", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Stripe payment processing is not available. Please configure Stripe API keys."
        });
      }
      
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }
      
      const userId = req.user?.id;
      
      // In a real implementation, we would:
      // 1. Get or create a Stripe customer for this user
      // 2. Check if customer already has an active subscription
      // 3. Create a new subscription or return existing one
      
      // Mock implementation that would be replaced with real code
      const mockSubscription = {
        subscriptionId: "sub_mock_" + Date.now(),
        clientSecret: "mock_client_secret_" + Date.now(),
        message: "This is a mock subscription. Configure Stripe to enable real subscriptions."
      };
      
      res.json(mockSubscription);
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get customer payment methods
  app.get("/api/payment-methods", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Stripe payment processing is not available. Please configure Stripe API keys."
        });
      }
      
      // In a real implementation, we would:
      // 1. Get the Stripe customer ID for this user
      // 2. Fetch all payment methods for this customer
      
      // Return empty array for now
      res.json([]);
    } catch (error: any) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get customer subscription
  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Stripe payment processing is not available. Please configure Stripe API keys."
        });
      }
      
      // In a real implementation, we would:
      // 1. Get the Stripe customer ID for this user
      // 2. Fetch all active subscriptions for this customer
      
      // Return null for now
      res.json(null);
    } catch (error: any) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
