import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useRoute } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  UserPlus
} from "lucide-react";
import UserAvatar from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";

// Form schemas
const memberSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  displayName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  role: z.string(),
  beltRank: z.string().optional(),
  joinDate: z.string().optional(),
  phone: z.string().optional()
});

const progressNoteSchema = z.object({
  id: z.number().optional(),
  memberId: z.number(),
  date: z.string(),
  noteType: z.string(), // "technique", "promotion", "general"
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(5, "Note content must be at least 5 characters"),
  techniqueId: z.number().optional()
});

// Main component
export default function MembersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("administration");
  const [editMember, setEditMember] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [editProgressNote, setEditProgressNote] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Check if user is instructor or admin
  const isInstructor = user && (user.role === "instructor" || user.role === "admin");

  // Fetch members data
  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/members"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/members");
        return await res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load members data",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Fetch progress notes
  const { data: progressNotes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["/api/progress-notes", selectedMember?.id],
    queryFn: async () => {
      if (!selectedMember?.id) return [];
      try {
        const res = await apiRequest("GET", `/api/members/${selectedMember.id}/progress`);
        return await res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load progress notes",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedMember?.id
  });

  // Member form setup
  const memberForm = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      role: "student",
      beltRank: "white",
      joinDate: new Date().toISOString().split('T')[0],
      phone: ""
    },
  });

  // Progress note form setup
  const progressForm = useForm<z.infer<typeof progressNoteSchema>>({
    resolver: zodResolver(progressNoteSchema),
    defaultValues: {
      memberId: selectedMember?.id || 0,
      date: new Date().toISOString().split('T')[0],
      noteType: "general",
      title: "",
      content: "",
    },
  });

  // Reset member form when dialog opens/closes
  const handleMemberDialogChange = (open: boolean) => {
    if (!open) {
      setEditMember(null);
      memberForm.reset({
        username: "",
        displayName: "",
        email: "",
        role: "student",
        beltRank: "white",
        joinDate: new Date().toISOString().split('T')[0],
        phone: ""
      });
    }
    setIsDialogOpen(open);
  };

  // Reset progress form when dialog opens/closes
  const handleProgressDialogChange = (open: boolean) => {
    if (!open) {
      setEditProgressNote(null);
      progressForm.reset({
        memberId: selectedMember?.id || 0,
        date: new Date().toISOString().split('T')[0],
        noteType: "general",
        title: "",
        content: ""
      });
    }
    setProgressDialogOpen(open);
  };

  // Handle member edit
  const handleEditMember = (member: any) => {
    setEditMember(member);
    memberForm.reset({
      id: member.id,
      username: member.username,
      displayName: member.displayName || "",
      email: member.email || "",
      role: member.role || "student",
      beltRank: member.beltRank || "white",
      joinDate: member.joinDate || new Date().toISOString().split('T')[0],
      phone: member.phone || ""
    });
    setIsDialogOpen(true);
  };

  // Handle progress note edit
  const handleEditProgressNote = (note: any) => {
    setEditProgressNote(note);
    progressForm.reset({
      id: note.id,
      memberId: note.memberId,
      date: note.date,
      noteType: note.noteType,
      title: note.title,
      content: note.content,
      techniqueId: note.techniqueId
    });
    setProgressDialogOpen(true);
  };

  // Handle selecting a member for progress notes
  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setActiveTab("growth");
    progressForm.setValue("memberId", member.id);
  };

  // Save member mutation
  const saveMemberMutation = useMutation({
    mutationFn: async (data: z.infer<typeof memberSchema>) => {
      let url = "/api/members";
      let method = "POST";
      
      if (editMember) {
        url = `/api/members/${editMember.id}`;
        method = "PUT";
      }

      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setIsDialogOpen(false);
      
      toast({
        title: editMember ? "Member updated" : "Member created",
        description: editMember
          ? "Member information has been updated successfully."
          : "New member has been added to the system.",
      });
      
      memberForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${editMember ? "update" : "create"} member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Save progress note mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof progressNoteSchema>) => {
      let url = "/api/progress-notes";
      let method = "POST";
      
      if (editProgressNote) {
        url = `/api/progress-notes/${editProgressNote.id}`;
        method = "PUT";
      }

      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-notes", selectedMember?.id] });
      setProgressDialogOpen(false);
      
      toast({
        title: editProgressNote ? "Note updated" : "Note created",
        description: editProgressNote
          ? "Progress note has been updated successfully."
          : "New progress note has been added.",
      });
      
      progressForm.reset({
        memberId: selectedMember?.id || 0,
        date: new Date().toISOString().split('T')[0],
        noteType: "general",
        title: "",
        content: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${editProgressNote ? "update" : "create"} note: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      
      toast({
        title: "Member deleted",
        description: "The member has been removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete progress note mutation
  const deleteProgressMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/progress-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-notes", selectedMember?.id] });
      
      toast({
        title: "Note deleted",
        description: "The progress note has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete note: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const onMemberSubmit = (data: z.infer<typeof memberSchema>) => {
    saveMemberMutation.mutate(data);
  };

  const onProgressSubmit = (data: z.infer<typeof progressNoteSchema>) => {
    saveProgressMutation.mutate(data);
  };

  // Handle delete operations
  const handleDeleteMember = (id: number) => {
    if (window.confirm("Are you sure you want to delete this member? This action cannot be undone.")) {
      deleteMemberMutation.mutate(id);
    }
  };

  const handleDeleteProgressNote = (id: number) => {
    if (window.confirm("Are you sure you want to delete this progress note?")) {
      deleteProgressMutation.mutate(id);
    }
  };

  // Filter members based on search term
  const filteredMembers = members ? members.filter((member: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.username.toLowerCase().includes(searchLower) ||
      (member.displayName && member.displayName.toLowerCase().includes(searchLower)) ||
      (member.email && member.email.toLowerCase().includes(searchLower))
    );
  }) : [];

  // Helper function to get belt color class
  const getBeltColorClass = (belt: string) => {
    switch (belt) {
      case "white": return "bg-slate-100 text-slate-900";
      case "blue": return "bg-blue-100 text-blue-800";
      case "purple": return "bg-purple-100 text-purple-800";
      case "brown": return "bg-amber-800 text-amber-100";
      case "black": return "bg-black text-white";
      default: return "bg-slate-100 text-slate-900";
    }
  };

  // Helper function to get note type badge styling
  const getNoteTypeStyle = (type: string) => {
    switch (type) {
      case "technique": return "bg-blue-100 text-blue-800";
      case "promotion": return "bg-green-100 text-green-800";
      case "general": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage club members and track their progress</p>
        </div>
        
        {/* Action buttons on the right */}
        <div className="flex items-center gap-2">
          {isInstructor && (
            <Dialog open={isDialogOpen} onOpenChange={handleMemberDialogChange}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editMember ? "Edit Member" : "Add New Member"}</DialogTitle>
                  <DialogDescription>
                    {editMember 
                      ? "Update member details below."
                      : "Fill out the form below to add a new member."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...memberForm}>
                  <form onSubmit={memberForm.handleSubmit(onMemberSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={memberForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={memberForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={memberForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={memberForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={memberForm.control}
                        name="beltRank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Belt Rank</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a belt" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="white">White Belt</SelectItem>
                                <SelectItem value="blue">Blue Belt</SelectItem>
                                <SelectItem value="purple">Purple Belt</SelectItem>
                                <SelectItem value="brown">Brown Belt</SelectItem>
                                <SelectItem value="black">Black Belt</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={memberForm.control}
                        name="joinDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Join Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={memberForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={saveMemberMutation.isPending}
                      >
                        {saveMemberMutation.isPending ? (
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
              placeholder="Search members..." 
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Tabs navigation */}
      <Tabs defaultValue="administration" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="administration">Member Administration</TabsTrigger>
          <TabsTrigger value="growth" disabled={!selectedMember}>
            Member Growth & Progression
            {selectedMember && (
              <span className="ml-2 font-semibold">({selectedMember.username})</span>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Member Administration Tab Content */}
        <TabsContent value="administration" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No members found. {isInstructor && "Add a new member to get started."}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Belt Rank</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell className="flex items-center gap-3">
                          <UserAvatar username={member.username} size="sm" />
                          <div>
                            <p className="font-medium">{member.displayName || member.username}</p>
                            <p className="text-xs text-muted-foreground">@{member.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBeltColorClass(member.beltRank || "white")}>
                            {member.beltRank ? `${member.beltRank.charAt(0).toUpperCase() + member.beltRank.slice(1)} Belt` : "White Belt"}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{member.role || "Student"}</TableCell>
                        <TableCell>{member.email || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSelectMember(member)}
                            >
                              Progression
                            </Button>
                            
                            {isInstructor && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Member Growth Tab Content */}
        <TabsContent value="growth" className="space-y-4">
          {selectedMember && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <UserAvatar username={selectedMember.username} size="lg" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedMember.displayName || selectedMember.username}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getBeltColorClass(selectedMember.beltRank || "white")}>
                        {selectedMember.beltRank ? `${selectedMember.beltRank.charAt(0).toUpperCase() + selectedMember.beltRank.slice(1)} Belt` : "White Belt"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Member since {selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isInstructor && (
                  <Dialog open={progressDialogOpen} onOpenChange={handleProgressDialogChange}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Progress Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{editProgressNote ? "Edit Progress Note" : "Add Progress Note"}</DialogTitle>
                        <DialogDescription>
                          {editProgressNote 
                            ? "Update progress note details."
                            : `Add a progress note for ${selectedMember.displayName || selectedMember.username}.`}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...progressForm}>
                        <form onSubmit={progressForm.handleSubmit(onProgressSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={progressForm.control}
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
                            
                            <FormField
                              control={progressForm.control}
                              name="noteType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Note Type</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="general">General Note</SelectItem>
                                      <SelectItem value="technique">Technique Progress</SelectItem>
                                      <SelectItem value="promotion">Promotion Note</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={progressForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Progress note title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={progressForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Note Content</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Detailed notes about progress..." 
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
                              disabled={saveProgressMutation.isPending}
                            >
                              {saveProgressMutation.isPending ? (
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
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Progress Notes</CardTitle>
                  <CardDescription>
                    Track member's growth and progressions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingNotes ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !progressNotes || progressNotes.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No progress notes recorded for this member yet.</p>
                      {isInstructor && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setProgressDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Note
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progressNotes
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((note: any) => (
                          <Card key={note.id} className="border-l-4 border-l-primary">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge className={getNoteTypeStyle(note.noteType)}>
                                    {note.noteType.charAt(0).toUpperCase() + note.noteType.slice(1)}
                                  </Badge>
                                  <CardTitle className="mt-2 text-lg">{note.title}</CardTitle>
                                  <CardDescription>
                                    {new Date(note.date).toLocaleDateString()}
                                  </CardDescription>
                                </div>
                                {isInstructor && (
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditProgressNote(note)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDeleteProgressNote(note.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="whitespace-pre-line">{note.content}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}