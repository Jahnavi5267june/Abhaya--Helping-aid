import { Link, useLocation } from "wouter";
import { Menu, Heart, X, Search, Shield, Activity, BarChart3, Users, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Heart },
  { href: "/organizations", label: "Organizations", icon: Search },
  { href: "/community", label: "Community", icon: Users },
  { href: "/disaster", label: "Disaster Relief", icon: Activity },
  { href: "/volunteers", label: "Volunteers", icon: Users },
  { href: "/transparency", label: "Transparency", icon: Shield },
  { href: "/impact", label: "Impact", icon: BarChart3 },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-primary">Abhaya</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  link.href === "/community"
                    ? location === link.href
                      ? "text-purple-600 font-semibold"
                      : "text-purple-500 hover:text-purple-700"
                    : location === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
                {link.href === "/community" && (
                  <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">New</span>
                )}
              </Link>
            ))}
            <div className="flex items-center gap-3 ml-2 border-l pl-5 border-border">
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/help">Request Help</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/donate">Donate Now</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 text-base font-medium py-2 ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                  {link.href === "/community" && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">New</span>
                  )}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <Button asChild variant="outline" className="w-full justify-center">
                <Link href="/help" onClick={() => setMobileMenuOpen(false)}>Request Help</Link>
              </Button>
              <Button asChild className="w-full justify-center bg-primary text-primary-foreground">
                <Link href="/donate" onClick={() => setMobileMenuOpen(false)}>Donate Now</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-primary">Abhaya</span>
              </Link>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                A public welfare platform serving Andhra Pradesh. Connecting donors, organizations, and people in need with trust and transparency.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Initiatives</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/organizations" className="hover:text-primary transition-colors">Organizations Directory</Link></li>
                <li><Link href="/community" className="hover:text-purple-600 transition-colors">Community Help Board</Link></li>
                <li><Link href="/disaster" className="hover:text-primary transition-colors">Disaster Relief</Link></li>
                <li><Link href="/disaster-reports" className="hover:text-orange-600 transition-colors">Disaster Reports</Link></li>
                <li><Link href="/volunteers" className="hover:text-green-600 transition-colors">Volunteer Network</Link></li>
                <li><Link href="/register-org" className="hover:text-blue-600 transition-colors">Register Organization</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">Request Help</Link></li>
                <li><Link href="/donate" className="hover:text-primary transition-colors">Donate</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/impact" className="hover:text-primary transition-colors">Our Impact</Link></li>
                <li><Link href="/transparency" className="hover:text-primary transition-colors">Transparency</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/contact?subject=partnership" className="hover:text-blue-600 transition-colors">Partner with Abhaya</Link></li>
                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Abhaya. For the people of Andhra Pradesh.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
