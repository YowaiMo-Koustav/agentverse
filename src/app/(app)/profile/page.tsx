
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center space-x-6">
            <Avatar className="h-24 w-24">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User profile avatar" data-ai-hint="abstract user" />
                <AvatarFallback>AV</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-4xl">AgentVerse User</CardTitle>
                <CardDescription>AI enthusiast and bounty hunter in the Web3 space.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/50">
                <Wallet className="h-6 w-6 text-primary"/>
                <div>
                    <h3 className="font-semibold">Wallet Address</h3>
                    <p className="text-muted-foreground font-mono text-sm">0x1234AbCdEf1234567890aBcDeF1234567890AbCd</p>
                </div>
            </div>
             <div>
                <h3 className="font-semibold">Bio</h3>
                <p className="text-muted-foreground">Building the future, one agent at a time.</p>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="button-enhanced">Edit Profile</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
