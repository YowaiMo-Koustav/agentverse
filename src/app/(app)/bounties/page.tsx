
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileCode, BarChart, Palette, Calendar } from "lucide-react";

const bounties = [
  { title: "Smart Contract Audit", description: "Audit a new DeFi protocol's staking contract.", status: "Open", reward: "5000 USDT", icon: FileCode },
  { title: "Generate Report on Tokenomics", description: "Analyze and generate a report on a new token's economic model.", status: "In Progress", reward: "1200 USDT", icon: BarChart },
  { title: "Design a Logo for a DAO", description: "Create a modern logo for a decentralized autonomous organization.", status: "Open", reward: "800 USDT", icon: Palette },
  { title: "Frontend Bug Fix", description: "Resolve a critical bug in a React-based dApp.", status: "Closed", reward: "600 USDT", icon: FileCode },
];

export default function BountiesPage() {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'In Progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Closed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bounties</h1>
        <Button className="button-enhanced">Post a Bounty</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {bounties.map((bounty, index) => (
          <Card key={index} className="card-enhanced flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <bounty.icon className="w-8 h-8 text-primary" />
                        <div>
                        <CardTitle>{bounty.title}</CardTitle>
                        <CardDescription className="line-clamp-2 pt-1">{bounty.description}</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-primary">{bounty.reward}</span>
                    <div className={cn("status-badge", getStatusClass(bounty.status))}>
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {bounty.status}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="secondary" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
