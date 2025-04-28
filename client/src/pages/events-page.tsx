import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, parseISO } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
      };
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage seminars, open mats, and jiujitsu events</p>
        </div>
        
        {/* Action buttons on the right */}
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
                          <>Save Event</>
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
      </div>
      
      {/* Event type tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="seminar">Seminars</TabsTrigger>
          <TabsTrigger value="open-mat">Open Mats</TabsTrigger>
          <TabsTrigger value="tournament">Tournaments</TabsTrigger>
          <TabsTrigger value="social">Social Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found. {isInstructor && "Create a new event to get started."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isInstructor={isInstructor} 
                  onEdit={() => handleEditEvent(event)}
                  onDelete={() => handleDeleteEvent(event.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Event card component
function EventCard({ 
  event, 
  isInstructor, 
  onEdit, 
  onDelete 
}: { 
  event: Event; 
  isInstructor: boolean; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const eventDate = new Date(event.date);
  const isUpcoming = isAfter(eventDate, new Date());
  
  // Helper function to get event type badge styling
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "seminar":
        return "bg-blue-100 text-blue-800";
      case "open-mat":
        return "bg-green-100 text-green-800";
      case "tournament":
        return "bg-amber-100 text-amber-800";
      case "promotion":
        return "bg-purple-100 text-purple-800";
      case "social":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Card className={`overflow-hidden ${!isUpcoming ? "opacity-75" : ""}`}>
      <div className={`h-2 ${getEventTypeBadge(event.eventType)}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={getEventTypeBadge(event.eventType)}>
            {event.eventType === "open-mat" ? "Open Mat" : 
             event.eventType === "seminar" ? "Seminar" :
             event.eventType === "tournament" ? "Tournament" :
             event.eventType === "promotion" ? "Promotion" :
             event.eventType === "social" ? "Social Event" : "Other"}
          </Badge>
          
          {isInstructor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="-mt-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <CardTitle className="text-lg mt-1">{event.title}</CardTitle>
        <CardDescription>
          <div className="flex items-center mt-1">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-start mt-1">
          <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{event.location}</span>
        </div>
        
        {event.cost && (
          <div className="mt-4">
            <Badge variant="outline">
              {event.cost}
            </Badge>
          </div>
        )}
        
        <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          {event.attendeeCount || 0} attending
          {event.maxAttendees && ` / ${event.maxAttendees} max`}
        </div>
        
        <div className="flex gap-2">
          {event.externalLink && (
            <Button size="sm" variant="outline" className="gap-1" asChild>
              <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Details</span>
              </a>
            </Button>
          )}
          
          {isUpcoming && (
            <Button size="sm">
              {event.registrationRequired ? "Register" : "Attend"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}