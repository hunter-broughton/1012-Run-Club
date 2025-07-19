"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to get the correct href based on current page
  const getNavHref = (section: string) => {
    // If we're on the home page, use hash links
    if (pathname === "/") {
      return `#${section}`;
    }
    // If we're on any other page, navigate to home page with hash
    return `/#${section}`;
  };
  return (
    <nav
      className="fixed w-full top-0 z-50 shadow-lg"
      style={{ backgroundColor: "#00274C" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-24">
          <Link href="/" className="flex items-center space-x-4">
            <Image
              src="/HillStreetRunClub.PNG"
              alt="Hill Street Run Club Logo"
              width={60}
              height={60}
              className="object-contain"
            />
            <span
              className="text-2xl md:text-3xl font-display tracking-wider"
              style={{ color: "#FFCB05" }}
            >
              HILL STREET RUN CLUB
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-12">
            <Link
              href={getNavHref("about")}
              className="text-white hover:text-[#FFCB05] transition-colors font-impact text-lg tracking-wider"
            >
              ABOUT
            </Link>
            <Link
              href={getNavHref("team")}
              className="text-white hover:text-[#FFCB05] transition-colors font-impact text-lg tracking-wider"
            >
              TEAM
            </Link>
            <Link
              href={getNavHref("next-run")}
              className="text-white hover:text-[#FFCB05] transition-colors font-impact text-lg tracking-wider"
            >
              NEXT RUN
            </Link>
            <Link
              href={getNavHref("schedule")}
              className="text-white hover:text-[#FFCB05] transition-colors font-impact text-lg tracking-wider"
            >
              SCHEDULE
            </Link>
            <Link
              href={getNavHref("join")}
              className="text-white hover:text-[#FFCB05] transition-colors font-impact text-lg tracking-wider"
            >
              JOIN
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="text-white hover:text-[#FFCB05]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" style={{ backgroundColor: "#00274C" }}>
          <div className="px-6 pt-2 pb-6 border-t border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link
                href={getNavHref("about")}
                className="text-white hover:text-[#FFCB05] transition-colors font-medium font-sans text-lg tracking-wide py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ABOUT
              </Link>
              <Link
                href={getNavHref("team")}
                className="text-white hover:text-[#FFCB05] transition-colors font-medium font-sans text-lg tracking-wide py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                TEAM
              </Link>
              <Link
                href={getNavHref("next-run")}
                className="text-white hover:text-[#FFCB05] transition-colors font-medium font-sans text-lg tracking-wide py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                NEXT RUN
              </Link>
              <Link
                href={getNavHref("schedule")}
                className="text-white hover:text-[#FFCB05] transition-colors font-medium font-sans text-lg tracking-wide py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SCHEDULE
              </Link>
              <Link
                href={getNavHref("join")}
                className="text-white hover:text-[#FFCB05] transition-colors font-medium font-sans text-lg tracking-wide py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                JOIN
              </Link>
              <Link
                href={getNavHref("contact")}
                className="text-white hover:text-[#FFCB05] transition-colors font-medium font-sans text-lg tracking-wide py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                CONTACT
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
