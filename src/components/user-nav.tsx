"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useAccount, useDisconnect } from "wagmi"
import { ConnectKitButton } from 'connectkit'

export function UserNav() {
  const { user, logout } = useAuth()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const walletShort = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"
  if (!address) {
    return (
      <div className="px-2 py-1">
        <ConnectKitButton showBalance={false} />
      </div>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatarUrl || "https://placehold.co/100x100.png"} alt="User profile avatar" />
            <AvatarFallback>{user?.username?.slice(0,2)?.toUpperCase() || "AV"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username || "Connected"}</p>
            <p className="text-xs leading-none text-muted-foreground font-mono">
              {walletShort}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { logout(); disconnect(); }}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
