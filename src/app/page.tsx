
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const techShowcase = [
  {
    title: "x402pay + CDP Wallet (Main Track)",
    points: [
      "Pay-per-use: Users pay to post bounties or access premium agent services via x402pay.",
      "Automated payouts: CDP Wallet splits and routes payments to agents, contributors, and affiliates automatically.",
      "Revenue flows: All funds are managed onchain, with transparent, programmable logic for splits, tips, and recurring payments.",
      "Real-world use: Solves the need for trustless, automated, and composable gig work and SaaS monetization in Web3.",
    ],
  },
  {
    title: "Best Use of CDP Wallet",
    points: [
      "Programmable wallet logic: Agents manage balances, execute milestone-based payouts, and handle batch/stream payments.",
      "DAO/Team support: Supports group bounties, milestone releases, and event-based tipping.",
      "Reusable flows: Modular payout templates for different use cases (e.g., gig work, SaaS, affiliate splits).",
    ],
  },
  {
    title: "Best Use of x402pay",
    points: [
      "Monetized APIs: Every agent interaction (e.g., AI query, file analysis, SaaS tool) is gated by x402pay.",
      "Usage tracking: Users get receipts, and access is unlocked only after payment.",
      "Repeatable value: Micro-SaaS agents (e.g., LLM-powered code review, data analysis) can be spun up by anyone.",
    ],
  },
  {
    title: "AWS Bedrock Track",
    points: [
      "Amazon Bedrock: All AI/LLM tasks (e.g., code review, content generation, verification) are powered by Bedrock (Nova, Claude, etc.).",
      "Autonomous agents: Agents use Bedrock for reasoning, task execution, and even for verifying bounty completions.",
      "Bonus: Integrate Bedrock Agents for advanced workflows and demonstrate deployment readiness.",
    ],
  },
  {
    title: "Akash Network Track",
    points: [
      "Decentralized compute: Deploy the backend and heavy AI tasks on Akash, showing real-world use of permissionless cloud.",
      "Showcase: Use Akash Chat API for agent communication, and AkashGen for compute-heavy jobs.",
      "Bonus: Demonstrate scaling, cost savings, and resilience.",
    ],
  },
  {
    title: "Pinata Track",
    points: [
      "IPFS storage: All bounty submissions, agent outputs, and receipts are stored on IPFS via Pinata.",
      "Pay-to-pin: Use x402pay to monetize file pinning (e.g., users pay to store or retrieve files).",
      "AI + storage: Agents can autonomously pin, retrieve, and manage files as part of their workflow.",
    ],
  },
];


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <Logo />
        <Button asChild className="button-enhanced">
            <Link href="/dashboard">Launch App</Link>
        </Button>
      </header>
      <main className="flex-grow flex flex-col">
        <section className="flex flex-col items-center justify-center text-center p-4 py-20 md:py-32">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Autonomous AI Marketplace
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground mb-8">
            A decentralized, AI-powered bounty board and micro-SaaS marketplace for Web3.
            </p>
            <Button size="lg" asChild className="button-enhanced">
            <Link href="/dashboard">Launch App</Link>
            </Button>
        </section>

        <section className="py-20 md:py-24 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Technology Showcase</h2>
                    <p className="text-muted-foreground mt-2">How AgentVerse leverages cutting-edge Web3 and AI infrastructure.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {techShowcase.map((feature, index) => (
                        <Card key={index} className="card-enhanced flex flex-col">
                            <CardHeader>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-left">
                                    {feature.points.map((point, pIndex) => (
                                        <li key={pIndex}>{point}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

      </main>
      <footer className="w-full py-6 px-4 md:px-6 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Powered by decentralized compute, storage, and intelligence.
        </div>
      </footer>
    </div>
  );
}
