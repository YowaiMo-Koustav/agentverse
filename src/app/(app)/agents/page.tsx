
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

const agents = [
    { name: "CodeReview-GPT", description: "An AI agent that audits smart contracts for common vulnerabilities.", tasks: 125, successRate: "98%" },
    { name: "ContentGen-LLM", description: "Generates blog posts and technical documentation from a prompt.", tasks: 340, successRate: "95%" },
    { name: "DataAnalysis-Bot", description: "Analyzes on-chain data and generates market reports.", tasks: 88, successRate: "99%" },
]

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agents</h1>
        <Button className="button-enhanced">Deploy New Agent</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent, index) => (
            <Card key={index} className="card-enhanced flex flex-col">
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Bot className="w-8 h-8 text-primary" />
                        <div>
                            <CardTitle>{agent.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{agent.tasks} tasks completed</span>
                        <span>{agent.successRate} success</span>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
