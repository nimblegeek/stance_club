import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import NavHeader from "@/components/nav-header";
import ClassScheduler from "@/components/class-scheduler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2, Plus, Edit, Trash2, Calendar, Users, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Class schema for validation
const classSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string(),
  instructorId: z.number(),
  level: z.string().min(1, "Please select a level"),
  type: z.string().min(1, "Please select a type"),
  maxCapacity: z.number().min(1, "Capacity must be at least 1").optional(),
});

// Class session schema for validation
const sessionSchema = z.object({
  classId: z.number(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
});

type Class = z.infer<typeof classSchema> & { id: number; createdAt: string };
type ClassSession = z.infer<typeof sessionSchema> & { id: number; createdAt: string };

export default function ClassManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("classes");
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);

  // Fetch all classes
  const { data: classes, isLoading: classesLoading, error: classesError } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  // Form setup
  const classForm = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      title: "",
      description: "",
      instructorId: user?.id || 0,
      level: "all-levels",
      type: "gi",
      maxCapacity: 20,
    },
  });

  // Handle adding/editing a class
  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof classSchema>) => {
      let url = "/api/classes";
      let method = "POST";
      
      if (editClass) {
        url = `/api/classes/${editClass.id}`;
        method = "PUT";
      }

      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setIsClassDialogOpen(false);
      setEditClass(null);
      
      toast({
        title: editClass ? "Class updated" : "Class created",
        description: editClass
          ? "The class has been updated successfully."
          : "New class has been created successfully.",
      });
      
      classForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editClass ? "update" : "create"} class: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle deleting a class
  const deleteMutation = useMutation({
    mutationFn: async (classId: number) => {
      await apiRequest("DELETE", `/api/classes/${classId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Class deleted",
        description: "The class has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete class: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof classSchema>) => {
    saveMutation.mutate(data);
  };

  // Handle edit button click
  const handleEdit = (bjjClass: Class) => {
    setEditClass(bjjClass);
    classForm.reset({
      title: bjjClass.title,
      description: bjjClass.description || "",
      instructorId: bjjClass.instructorId,
      level: bjjClass.level,
      type: bjjClass.type,
      maxCapacity: bjjClass.maxCapacity || undefined,
    });
    setIsClassDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (classId: number) => {
    if (window.confirm("Are you sure you want to delete this class? This cannot be undone.")) {
      deleteMutation.mutate(classId);
    }
  };

  // Handle dialog open
  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setEditClass(null);
      classForm.reset();
    }
    setIsClassDialogOpen(open);
  };

  if (classesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (classesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl mb-4">Error loading classes</h1>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <NavHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-auto py-6 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Class Management</h1>
            
            {/* Add Class Button */}
            <Dialog open={isClassDialogOpen} onOpenChange={handleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editClass ? "Edit Class" : "Create New Class"}</DialogTitle>
                  <DialogDescription>
                    {editClass 
                      ? "Update the class details. Click save when you're done."
                      : "Fill in the details for the new class. Click save when you're done."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...classForm}>
                  <form onSubmit={classForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={classForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter class title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={classForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what this class covers" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={classForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="gi">Gi</SelectItem>
                                <SelectItem value="no-gi">No-Gi</SelectItem>
                                <SelectItem value="open-mat">Open Mat</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={classForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="all-levels">All Levels</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={classForm.control}
                      name="maxCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of students allowed in this class
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
          
          <Tabs defaultValue="classes" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="classes">Class Templates</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="classes">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes && classes.length > 0 ? (
                  classes.map((bjjClass) => (
                    <Card key={bjjClass.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{bjjClass.title}</CardTitle>
                        <CardDescription>
                          {bjjClass.type.toUpperCase()} | {bjjClass.level.replace('-', ' ').toUpperCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {bjjClass.description || "No description available."}
                        </p>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Max Capacity: {bjjClass.maxCapacity || "Unlimited"}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEdit(bjjClass)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDelete(bjjClass.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No classes defined yet. Create your first class!</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="schedule">
              <ClassScheduler />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}