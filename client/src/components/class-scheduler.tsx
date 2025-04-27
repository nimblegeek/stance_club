import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, parse, isToday, isSameDay, addMonths, addDays } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

// Session schema for validation
const sessionSchema = z.object({
  classId: z.number(),
  date: z.string(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in format HH:MM"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in format HH:MM"),
  notes: z.string().optional(),
});

// Recurring session schema
const recurringSessionSchema = sessionSchema.extend({
  isRecurring: z.boolean().default(false),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(), // 0-6 for Sunday-Saturday
  recurrenceEndDate: z.string().optional(),
});

type Class = {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  level: string;
  type: string;
  maxCapacity?: number;
  createdAt: string;
};

type ClassSession = z.infer<typeof sessionSchema> & { 
  id: number; 
  createdAt: string;
  classTitle?: string;
  classType?: string;
  classLevel?: string;
};

export default function ClassScheduler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [editSession, setEditSession] = useState<ClassSession | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  
  // Fetch all classes (for dropdown)
  const { data: classes } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });
  
  // Fetch sessions based on selected month
  const { data: sessions, isLoading: sessionsLoading } = useQuery<ClassSession[]>({
    queryKey: ["/api/sessions"],
    refetchOnWindowFocus: true,
  });
  
  // Filter sessions for the selected date
  const sessionsForSelectedDate = sessions?.filter(session => 
    isSameDay(new Date(session.date), date)
  ) || [];
  
  // Form setup
  const sessionForm = useForm<z.infer<typeof recurringSessionSchema>>({
    resolver: zodResolver(recurringSessionSchema),
    defaultValues: {
      classId: 0,
      date: format(date, "yyyy-MM-dd"),
      startTime: "18:00",
      endTime: "19:30",
      notes: "",
      isRecurring: false,
      daysOfWeek: [new Date().getDay()], // Default to current day of week
      recurrenceEndDate: format(
        addDays(addMonths(date, 1), 0), // Default recurrence end date is one month out
        "yyyy-MM-dd"
      ),
    },
  });
  
  // Update date field when calendar date changes
  useEffect(() => {
    sessionForm.setValue("date", format(date, "yyyy-MM-dd"));
  }, [date, sessionForm]);
  
  // Handle adding/editing a session
  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sessionSchema>) => {
      let url = "/api/sessions";
      let method = "POST";
      
      if (editSession) {
        url = `/api/sessions/${editSession.id}`;
        method = "PUT";
      }

      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setIsSessionDialogOpen(false);
      setEditSession(null);
      
      toast({
        title: editSession ? "Session updated" : "Session created",
        description: editSession
          ? "The class session has been updated successfully."
          : "New class session has been added to the schedule.",
      });
      
      sessionForm.reset({
        classId: 0,
        date: format(date, "yyyy-MM-dd"),
        startTime: "18:00",
        endTime: "19:30",
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editSession ? "update" : "create"} session: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle deleting a session
  const deleteMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest("DELETE", `/api/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session deleted",
        description: "The class session has been removed from the schedule.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete session: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof sessionSchema>) => {
    saveMutation.mutate(data);
  };
  
  // Handle edit button click
  const handleEdit = (session: ClassSession) => {
    setEditSession(session);
    sessionForm.reset({
      classId: session.classId,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      notes: session.notes || "",
    });
    setIsSessionDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDelete = (sessionId: number) => {
    if (window.confirm("Are you sure you want to remove this class from the schedule?")) {
      deleteMutation.mutate(sessionId);
    }
  };
  
  // Handle dialog open
  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setEditSession(null);
      sessionForm.reset({
        classId: 0,
        date: format(date, "yyyy-MM-dd"),
        startTime: "18:00",
        endTime: "19:30",
        notes: "",
      });
    }
    setIsSessionDialogOpen(open);
  };
  
  // Session card component
  const SessionCard = ({ session }: { session: ClassSession }) => {
    const classDetails = classes?.find(c => c.id === session.classId);
    const title = session.classTitle || classDetails?.title || "Unknown Class";
    const type = session.classType || classDetails?.type || "Unknown Type";
    const level = session.classLevel || classDetails?.level || "Unknown Level";
    
    return (
      <Card className="mb-3">
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <Badge variant={type === "gi" ? "default" : type === "no-gi" ? "secondary" : "outline"}>
              {type.toUpperCase()}
            </Badge>
          </div>
          <CardDescription className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {session.startTime} - {session.endTime}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {session.notes && <p className="text-sm">{session.notes}</p>}
          <div className="mt-1">
            <Badge variant="outline">{level.replace('-', ' ').toUpperCase()}</Badge>
          </div>
        </CardContent>
        <CardFooter className="pt-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => handleEdit(session)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1"
            onClick={() => handleDelete(session.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Calendar Column */}
      <div className="md:col-span-5 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Monthly Schedule</CardTitle>
            <CardDescription>Select a date to view or add classes</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
              components={{
                DayContent: (props) => {
                  // Highlight days with sessions
                  const hasSessionsOnDay = sessions?.some(session => 
                    isSameDay(new Date(session.date), props.date)
                  );
                  
                  return (
                    <div
                      className={`relative flex h-8 w-8 items-center justify-center p-0 text-sm ${
                        hasSessionsOnDay ? "font-semibold after:absolute after:bottom-1 after:h-1 after:w-1 after:rounded-full after:bg-primary" : ""
                      }`}
                    >
                      {props.date.getDate()}
                    </div>
                  );
                },
              }}
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm font-medium">
                {isToday(date) ? "Today" : format(date, "EEEE, MMMM d, yyyy")}
              </div>
              <Dialog open={isSessionDialogOpen} onOpenChange={handleDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editSession ? "Edit Class Session" : "Schedule New Class"}</DialogTitle>
                    <DialogDescription>
                      {editSession 
                        ? "Update the session details. Click save when you're done."
                        : "Schedule a class for " + format(date, "EEEE, MMMM d, yyyy")}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...sessionForm}>
                    <form onSubmit={sessionForm.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={sessionForm.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(Number(value))} 
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {classes?.map((classItem) => (
                                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                                    {classItem.title} ({classItem.type.toUpperCase()})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the class template to schedule
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sessionForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={sessionForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={sessionForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={sessionForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any special instructions or focus areas for this session..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Recurring Schedule Options */}
                      <FormField
                        control={sessionForm.control}
                        name="isRecurring"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Recurring Schedule</FormLabel>
                              <FormDescription>
                                Create a recurring class that repeats weekly
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {/* If recurring is checked, show additional options */}
                      {sessionForm.watch("isRecurring") && (
                        <div className="space-y-4 rounded-md border p-4">
                          <div>
                            <FormLabel className="block mb-2">Weekly Schedule</FormLabel>
                            <FormDescription className="mb-2">
                              Select the days of the week this class repeats on
                            </FormDescription>
                            
                            <div className="flex flex-wrap gap-2">
                              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
                                const daysOfWeek = sessionForm.watch("daysOfWeek") || [];
                                const isSelected = daysOfWeek.includes(index);
                                
                                return (
                                  <Button 
                                    key={day}
                                    type="button"
                                    size="sm"
                                    variant={isSelected ? "default" : "outline"}
                                    onClick={() => {
                                      const currentDays = [...daysOfWeek];
                                      if (isSelected) {
                                        // Remove the day
                                        const newDays = currentDays.filter(d => d !== index);
                                        sessionForm.setValue("daysOfWeek", newDays);
                                      } else {
                                        // Add the day
                                        currentDays.push(index);
                                        sessionForm.setValue("daysOfWeek", currentDays);
                                      }
                                    }}
                                  >
                                    {day}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          
                          <FormField
                            control={sessionForm.control}
                            name="recurrenceEndDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The last date this recurring class will happen
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={saveMutation.isPending}
                        >
                          {saveMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>Save</>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sessions List Column */}
      <div className="md:col-span-7 lg:col-span-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              Classes on {format(date, "MMMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              {isToday(date) ? "Today's" : format(date, "EEEE")}'s scheduled classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : sessionsForSelectedDate.length > 0 ? (
              <div className="space-y-2">
                {sessionsForSelectedDate
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No classes scheduled for this day.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsSessionDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule a Class
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}