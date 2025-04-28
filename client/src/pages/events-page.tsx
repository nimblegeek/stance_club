import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, isAfter } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PageHeader } from "@/components/page-header";
import NavHeader from "@/components/nav-header";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";

// Event schema
const eventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Event title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventType: z.string(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please select a valid date",
  }),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().min(3, "Location must be at least 3 characters"),
  maxAttendees: z.string().transform(val => (val === "" ? null : parseInt(val, 10))).optional().nullable().pipe(z.number().nullable().optional()),
  registrationRequired: z.boolean().default(false),
  instructorId: z.number().optional(),
  externalLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  cost: z.string().optional(),
});

type Event = z.infer<typeof eventSchema> & {
  id: number;
  createdAt: string;
  attendeeCount?: number;
};

// Mock initial data for events
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Summer Open Mat",
    description: "Open mat session for all belt levels. Come practice your techniques in a relaxed environment.",
    eventType: "open-mat",
    date: "2025-06-15",
    startTime: "14:00",
    endTime: "16:00",
    location: "Main Dojo",
    maxAttendees: 30,
    registrationRequired: true,
    instructorId: 2,
    externalLink: "",
    cost: "Free",
    createdAt: "2025-04-28",
    attendeeCount: 12
  },
  {
    id: 2,
    title: "Competition Preparation Seminar",
    description: "Special seminar focused on competition tactics and strategies. Learn how to prepare for your next tournament.",
    eventType: "seminar",
    date: "2025-05-20",
    startTime: "18:00",
    endTime: "20:30",
    location: "Main Dojo",
    maxAttendees: 20,
    registrationRequired: true,
    instructorId: 1,
    externalLink: "https://example.com/competition-seminar",
    cost: "$30",
    createdAt: "2025-04-28",
    attendeeCount: 8
  },
  {
    id: 3,
    title: "In-house Tournament",
    description: "Friendly competition among academy members. All belt levels welcome. Medals will be awarded for each division.",
    eventType: "tournament",
    date: "2025-07-10",
    startTime: "10:00",
    endTime: "17:00",
    location: "Main Dojo",
    maxAttendees: 50,
    registrationRequired: true,
    instructorId: 2,
    externalLink: "",
    cost: "$15 entry fee",
    createdAt: "2025-04-28",
    attendeeCount: 25
  }
];

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  // Check if user is instructor or admin
  const isInstructor = user && (user.role === "instructor" || user.role === "admin");

  // Fetch events data (using mock data for now)
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      // For now, we'll return mock data
      return mockEvents;
      
      // This would be the actual implementation once the API is ready
      /*
      try {
        const res = await apiRequest("GET", "/api/events");
        return await res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load events data",
          variant: "destructive",
        });
        return [];
      }
      */
    }
  });

  // Event form setup
  const eventForm = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "open-mat",
      date: new Date().toISOString().split('T')[0],
      startTime: "18:00",
      endTime: "20:00",
      location: "Main Dojo",
      maxAttendees: null,
      registrationRequired: false,
      instructorId: user?.id,
      externalLink: "",
      cost: "Free",
    },
  });

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditEvent(null);
      eventForm.reset({
        title: "",
        description: "",
        eventType: "open-mat",
        date: new Date().toISOString().split('T')[0],
        startTime: "18:00",
        endTime: "20:00",
        location: "Main Dojo",
        maxAttendees: null,
        registrationRequired: false,
        instructorId: user?.id,
        externalLink: "",
        cost: "Free",
      });
    }
    setIsDialogOpen(open);
  };

  // Handle event edit
  const handleEditEvent = (event: Event) => {
    setEditEvent(event);
    eventForm.reset({
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      maxAttendees: event.maxAttendees?.toString() || null,
      registrationRequired: event.registrationRequired,
      instructorId: event.instructorId,
      externalLink: event.externalLink || "",
      cost: event.cost || "Free",
    });
    setIsDialogOpen(true);
  };

  // Save event mutation
  const saveEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof eventSchema>) => {
      // This would be the actual implementation once the API is ready
      /*
      let url = "/api/events";
      let method = "POST";
      
      if (editEvent) {
        url = `/api/events/${editEvent.id}`;
        method = "PUT";
      }

      const res = await apiRequest(method, url, data);
      return await res.json();
      */
      
      // For now, simulate a successful response
      return { 
        ...data, 
        id: editEvent ? editEvent.id : Date.now(),
        createdAt: new Date().toISOString(),
        attendeeCount: 0
      } as Event;
    },
    onSuccess: (savedEvent) => {
      // This would be the actual implementation once the API is ready
      // queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      // For now, manually update the UI state
      if (events) {
        if (editEvent) {
          // Replace the old event with the updated one
          const updatedEvents = events.map(event => 
            event.id === editEvent.id ? savedEvent : event
          );
          queryClient.setQueryData(["/api/events"], updatedEvents);
        } else {
          // Add the new event to the list
          queryClient.setQueryData(["/api/events"], [...events, savedEvent]);
        }
      }
      
      setIsDialogOpen(false);
      
      toast({
        title: editEvent ? "Event updated" : "Event created",
        description: editEvent
          ? "Event has been updated successfully."
          : "New event has been added to the calendar.",
      });
      
      eventForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${editEvent ? "update" : "create"} event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      // This would be the actual implementation once the API is ready
      // await apiRequest("DELETE", `/api/events/${id}`);
      
      // For now, just simulate success
      return { success: true };
    },
    onSuccess: () => {
      // This would be the actual implementation once the API is ready
      // queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      // For now, manually update the UI state
      if (events && editEvent) {
        const updatedEvents = events.filter(event => event.id !== editEvent.id);
        queryClient.setQueryData(["/api/events"], updatedEvents);
      }
      
      toast({
        title: "Event deleted",
        description: "The event has been removed from the calendar.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    saveEventMutation.mutate(data);
  };

  // Handle delete operation
  const handleDeleteEvent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteEventMutation.mutate(id);
    }
  };

  // Filter events based on search term and active tab
  const filteredEvents = events 
    ? events
        .filter(event => {
          const searchLower = searchTerm.toLowerCase();
          return (
            event.title.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower)
          );
        })
        .filter(event => {
          if (activeTab === "all") return true;
          if (activeTab === "upcoming") {
            return isAfter(parseISO(event.date), new Date());
          }
          return event.eventType === activeTab;
        })
    : [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader
        title="Events"
        description="Manage seminars, open mats, and jiujitsu events"
        breadcrumbs={[{ label: "Events" }]}
        actions={
          <div className="flex items-center gap-2">
            {isInstructor && (
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>{editEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                    <DialogDescription>
                      {editEvent 
                        ? "Update event details below."
                        : "Fill out the form below to create a new event."}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...eventForm}>
                    <form onSubmit={eventForm.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4 md:col-span-2">
                          <FormField
                            control={eventForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Event Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seminar with Professor Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={eventForm.control}
                          name="eventType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select event type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="seminar">Seminar</SelectItem>
                                  <SelectItem value="open-mat">Open Mat</SelectItem>
                                  <SelectItem value="tournament">Tournament</SelectItem>
                                  <SelectItem value="promotion">Promotion Ceremony</SelectItem>
                                  <SelectItem value="social">Social Event</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={eventForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                    >
                                      {field.value ? (
                                        format(new Date(field.value), "PPP")
                                      ) : (
                                        <span>Select a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={eventForm.control}
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
                          control={eventForm.control}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={eventForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Main Dojo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={eventForm.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost</FormLabel>
                              <FormControl>
                                <Input placeholder="Free" {...field} />
                              </FormControl>
                              <FormDescription>Enter "Free" or the price (e.g., "$25")</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={eventForm.control}
                          name="maxAttendees"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Attendees</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Leave empty if unlimited" 
                                  {...field} 
                                  value={field.value || ""} 
                                />
                              </FormControl>
                              <FormDescription>Leave empty for unlimited capacity</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={eventForm.control}
                          name="registrationRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Registration Required</FormLabel>
                                <FormDescription>
                                  Members must register to attend this event
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={eventForm.control}
                        name="externalLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>External Link (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/event" {...field} />
                            </FormControl>
                            <FormDescription>URL for additional event information or registration</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={eventForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detailed description of the event..." 
                                {...field} 
                                rows={5}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={saveEventMutation.isPending}
                        >
                          {saveEventMutation.isPending ? (
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
            )}
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search events..." 
                className="pl-9 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        }
      />
      
      {/* Tabs for filtering events */}
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b pb-0">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="seminar">Seminars</TabsTrigger>
          <TabsTrigger value="open-mat">Open Mats</TabsTrigger>
          <TabsTrigger value="tournament">Tournaments</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden flex flex-col">
                  <CardHeader className={`
                    ${event.eventType === "seminar" ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                    ${event.eventType === "open-mat" ? "bg-green-50 dark:bg-green-900/20" : ""}
                    ${event.eventType === "tournament" ? "bg-amber-50 dark:bg-amber-900/20" : ""}
                    ${event.eventType === "promotion" ? "bg-purple-50 dark:bg-purple-900/20" : ""}
                    ${event.eventType === "social" ? "bg-pink-50 dark:bg-pink-900/20" : ""}
                    ${event.eventType === "other" ? "bg-slate-50 dark:bg-slate-900/20" : ""}
                  `}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="mb-1">{event.title}</CardTitle>
                        <Badge className={`
                          ${event.eventType === "seminar" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : ""}
                          ${event.eventType === "open-mat" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
                          ${event.eventType === "tournament" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" : ""}
                          ${event.eventType === "promotion" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" : ""}
                          ${event.eventType === "social" ? "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300" : ""}
                          ${event.eventType === "other" ? "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300" : ""}
                        `}>
                          {event.eventType.replace("-", " ").replace(/^\w/, c => c.toUpperCase())}
                        </Badge>
                      </div>
                      
                      {isInstructor && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 flex-1">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CalendarIcon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <p>{format(parseISO(event.date), "EEEE, MMMM d, yyyy")}</p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <p>{event.location}</p>
                      </div>
                      
                      {event.maxAttendees && (
                        <div className="flex items-start">
                          <Users className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <p>Capacity: {event.attendeeCount || 0} / {event.maxAttendees}</p>
                            {event.registrationRequired && (
                              <p className="text-sm text-muted-foreground mt-0.5">Registration required</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {event.cost && event.cost !== "Free" && (
                        <p className="text-sm font-medium">Cost: {event.cost}</p>
                      )}
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                        {event.description}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="w-full"
                    >
                      {event.registrationRequired ? "Register" : "View Details"}
                    </Button>
                    
                    {event.externalLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => window.open(event.externalLink, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}