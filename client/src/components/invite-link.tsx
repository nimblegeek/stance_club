import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function InviteLinkDialog() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("link");

  // Generate a signup link to the auth page
  const signupLink = window.location.origin + "/auth?invite=true";
  
  // Handle copying the link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(signupLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The invite link has been copied to your clipboard.",
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try manually selecting the link.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join our BJJ club!',
          text: 'You\'ve been invited to join our Brazilian Jiu-Jitsu club. Click the link to sign up:',
          url: signupLink,
        });
        toast({
          title: "Link shared!",
          description: "The invite link has been shared.",
        });
      } catch (err) {
        // User likely canceled the share
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
          <DialogDescription>
            Share this link with potential members to let them sign up directly for your club.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Invite Link</TabsTrigger>
            <TabsTrigger value="message">Message Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="mt-4">
            <div className="flex items-center space-x-2">
              <Input 
                value={signupLink} 
                readOnly 
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              This link will take new members directly to the registration page.
            </p>
          </TabsContent>
          
          <TabsContent value="message" className="mt-4">
            <div className="bg-muted p-4 rounded-md">
              <p className="mb-2 font-medium">Example invitation message:</p>
              <p className="mb-2">Hi there!</p>
              <p className="mb-2">I'd like to invite you to join our Brazilian Jiu-Jitsu club. We have classes for all skill levels and a great community of practitioners.</p>
              <p className="mb-2">You can sign up using this link: {signupLink}</p>
              <p>Looking forward to seeing you on the mats!</p>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Feel free to copy and customize this message for your invitations.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button onClick={copyToClipboard} className="sm:flex-1">
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          <Button onClick={handleShare} className="sm:flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}