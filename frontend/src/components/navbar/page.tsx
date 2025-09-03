"use client"
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Menu, X, Shield, Zap, Sparkles, Leaf } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
	const { setTheme } = useTheme();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<nav className="bg-gradient-to-r from-[#0A0A1A] to-[#1a1a2e] border-b border-primary/20 sticky top-0 z-50 backdrop-blur-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex-shrink-0">
						<h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl text-white hover:text-primary transition-colors duration-300">
							<Link href="/landingpage" className="flex items-center">
								<Shield className="h-8 w-8 mr-2 text-primary" />
								MARVEL-HUB
							</Link>
						</h1>
					</div>

					<div className="hidden lg:flex lg:items-center lg:space-x-8">
						<Link
							href="/game"
							className="text-base font-semibold tracking-tight text-gray-200 hover:text-primary transition-colors duration-300 flex items-center group"
						>
							<Leaf className="h-4 w-4 mr-2 text-primary/60 group-hover:text-primary transition-colors duration-300" />
							Groot
						</Link>
						<Link
							href="/mystic"
							className="text-base font-semibold tracking-tight text-gray-200 hover:text-primary transition-colors duration-300 flex items-center group"
						>
							<Sparkles className="h-4 w-4 mr-2 text-primary/60 group-hover:text-primary transition-colors duration-300" />
							Mystic
						</Link>
						<Link
							href="/spideysense"
							className="text-base font-semibold tracking-tight text-gray-200 hover:text-primary transition-colors duration-300 flex items-center group"
						>
							<Zap className="h-4 w-4 mr-2 text-primary/60 group-hover:text-primary transition-colors duration-300" />
							Spidey
						</Link>
						<Link
							href="/starkledger"
							className="text-base font-semibold tracking-tight text-gray-200 hover:text-primary transition-colors duration-300 flex items-center group"
						>
							<Shield className="h-4 w-4 mr-2 text-primary/60 group-hover:text-primary transition-colors duration-300" />
							Stark Ledger
						</Link>

						{/* User Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="text-base font-semibold text-gray-200 hover:text-primary hover:bg-primary/10 transition-all duration-300">
									User
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48 bg-[#1a1a2e] border border-primary/20">
								<DropdownMenuLabel className="text-primary">My Account</DropdownMenuLabel>
								<DropdownMenuSeparator className="bg-primary/20" />
								<DropdownMenuItem className="text-gray-200 hover:text-primary hover:bg-primary/10">
									<Link href="/myprofile" className="w-full">My Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className="text-gray-200 hover:text-primary hover:bg-primary/10">
									<Link href="/signup" className="w-full">Sign Up</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="icon" className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50">
									<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
									<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
									<span className="sr-only">Toggle theme</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="bg-[#1a1a2e] border border-primary/20">
								<DropdownMenuItem onClick={() => setTheme("light")} className="text-gray-200 hover:text-primary hover:bg-primary/10">
									Light
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")} className="text-gray-200 hover:text-primary hover:bg-primary/10">
									Dark
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("system")} className="text-gray-200 hover:text-primary hover:bg-primary/10">
									System
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Mobile menu button */}
					<div className="lg:hidden">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							aria-label="Toggle mobile menu"
							className="text-gray-200 hover:text-primary hover:bg-primary/10"
						>
							{isMobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMobileMenuOpen && (
					<div className="lg:hidden border-t border-primary/20 bg-[#0A0A1A]/95 backdrop-blur-sm">
						<div className="px-2 pt-2 pb-3 space-y-1">
							<div className="mb-4">
							</div>
							<Link
								href="/mystic"
								className="block px-3 py-2 text-base font-semibold text-gray-200 hover:text-primary hover:bg-primary/10 rounded-md transition-all duration-300 flex items-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<Sparkles className="h-4 w-4 mr-2 text-primary/60" />
								Mystic
							</Link>
							<Link
								href="spideysense"
								className="block px-3 py-2 text-base font-semibold text-gray-200 hover:text-primary hover:bg-primary/10 rounded-md transition-all duration-300 flex items-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<Zap className="h-4 w-4 mr-2 text-primary/60" />
								Spidey
							</Link>
							<Link
								href="/starkledger"
								className="block px-3 py-2 text-base font-semibold text-gray-200 hover:text-primary hover:bg-primary/10 rounded-md transition-all duration-300 flex items-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<Shield className="h-4 w-4 mr-2 text-primary/60" />
								Stark Ledger
							</Link>
							<Link
								href="/myprofile"
								className="block px-3 py-2 text-base font-semibold text-gray-200 hover:text-primary hover:bg-primary/10 rounded-md transition-all duration-300"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								My Profile
							</Link>
							<Link
								href="/signup"
								className="block px-3 py-2 text-base font-semibold text-gray-200 hover:text-primary hover:bg-primary/10 rounded-md transition-all duration-300"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Sign Up
							</Link>

							{/* Mobile Theme Toggle */}
							<div className="px-3 py-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="w-full justify-start border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50">
											<Sun className="h-4 w-4 mr-2" />
											Theme
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-48 bg-[#1a1a2e] border border-primary/20">
										<DropdownMenuItem onClick={() => setTheme("light")} className="text-gray-200 hover:text-primary hover:bg-primary/10">
											Light
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setTheme("dark")} className="text-gray-200 hover:text-primary hover:bg-primary/10">
											Dark
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setTheme("system")} className="text-gray-200 hover:text-primary hover:bg-primary/10">
											System
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	)
}
