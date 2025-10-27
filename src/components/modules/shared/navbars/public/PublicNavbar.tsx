import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";

const PublicNavbar = () => {
    const navItems = [
        { name: "Home", href: "/" },
        { name: "Consultation", href: "/consultation" },
        { name: "Health Plans", href: "/health-plans" },
        { name: "Diagnostics", href: "/diagnostics" },
        { name: "NGOs", href: "/ngos" },
    ]
    return (
        <header className="sticky top-0 z-50 h-16 border-b flex w-full items-center justify-around bg-background/95  px-2 md:px-4 shadow-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div>
                    <Link href="/" className=" flex items-center justify-center text-xl font-bold text-primary">PH-Health</Link>
                </div>
                <nav className="hidden md:block">
                    <ul className="flex space-x-4">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="hidden md:block">
                    <Link href="/login" >
                        <Button>
                            Login
                        </Button>
                    </Link>
                </div>
            </div>
            {/* mobile menu */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline"> <Menu/> </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Edit profile</SheetTitle>
                            <SheetDescription>
                                Make changes to your profile here. Click save when you&apos;re done.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid flex-1 auto-rows-min gap-6 px-4">
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-name">Name</Label>
                                <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-username">Username</Label>
                                <Input id="sheet-demo-username" defaultValue="@peduarte" />
                            </div>
                        </div>
                        <SheetFooter>
                            <Button type="submit">Save changes</Button>
                            <SheetClose asChild>
                                <Button variant="outline">Close</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
};

export default PublicNavbar;