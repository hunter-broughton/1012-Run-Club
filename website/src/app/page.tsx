"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import FeatureCard from "@/components/FeatureCard";
import EventCard from "@/components/EventCard";
import GoogleRouteMap from "@/components/GoogleRouteMap";

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

interface RunRoute {
  id?: number;
  name: string;
  description: string;
  distance: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  estimatedTime: string;
  points: RoutePoint[];
  isUpcoming?: boolean;
}

export default function Home() {
  const [upcomingRoute, setUpcomingRoute] = useState<RunRoute | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);

  useEffect(() => {
    const fetchUpcomingRoute = async () => {
      try {
        const response = await fetch("/api/upcoming-route");
        if (response.ok) {
          const route = await response.json();
          setUpcomingRoute(route);
        } else {
          console.error("Failed to fetch upcoming route");
        }
      } catch (error) {
        console.error("Error fetching upcoming route:", error);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchUpcomingRoute();
  }, []);
  return (
    <>
      <Navigation />

      {/* About Section - Hero */}
      <section
        id="about"
        className="pt-32 pb-20"
        style={{ backgroundColor: "#00274C" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* Main Heading */}
          <div className="text-center mb-16">
            <h1
              className="text-6xl md:text-9xl font-display tracking-wider mb-8 text-glow-maize animate-text-pulse"
              style={{ color: "#FFCB05" }}
            >
              ABOUT US
            </h1>
          </div>

          {/* Mission Statement */}
          <div className="text-center mb-20">
            <h2
              className="text-2xl md:text-4xl font-impact mb-12 max-w-4xl mx-auto leading-relaxed tracking-wide"
              style={{ color: "#FFCB05" }}
            >
              MICHIGAN&apos;S ONE AND ONLY SOCIAL RUN CLUB DEDICATED TO BUILDING
              COMMUNITY THROUGH MOVEMENT
            </h2>
          </div>

          {/* Big House Hero Image */}
          <div className="mb-20 -mx-6">
            <Image
              src="/um big house.jpg"
              alt="University of Michigan Big House Stadium"
              width={1200}
              height={400}
              className="object-cover w-full h-64 md:h-96 rounded-lg shadow-2xl"
              priority
            />
          </div>

          {/* Our Story */}
          <div className="mb-20">
            <h2
              className="text-5xl md:text-7xl font-display tracking-wider mb-8 text-glow-maize"
              style={{ color: "#FFCB05" }}
            >
              OUR STORY
            </h2>

            <div className="grid md:grid-cols-3 gap-12 items-center">
              <div className="md:col-span-2 space-y-6 text-lg leading-relaxed font-athletic">
                <p className="text-gray-200 font-athletic text-xl">
                  Club founded at the University of Michigan in 2025. Hill St
                  Running Club exists to bring people together through casual
                  runs, followed by social activities like coffee and cold
                  plunges. We aim to foster connection, well-being, and a fun
                  atmosphere for students of all fitness levels. Whether running
                  to the river, grabbing post-run coffee, or heading out on the
                  occasional gameday run, our goal is to build community through
                  movement.
                </p>

                <p className="text-gray-200 font-athletic text-xl">
                  With every event we hold, we aim to give back to the Ann Arbor
                  community through local partnerships and initiatives.
                </p>

                <p className="text-gray-200 font-athletic text-xl">
                  Are you a new student? Looking for a way to get involved? Or
                  just want to find a new group of friends to run with? Hill
                  Street Run Club is the place for you.{" "}
                  <Link
                    href="/join"
                    className="font-impact font-bold underline hover:no-underline transition-all text-glow-maize"
                    style={{ color: "#FFCB05" }}
                  >
                    SIGN UP TODAY!
                  </Link>
                </p>
              </div>

              <div className="flex justify-center">
                <Image
                  src="/HillStreetRunClub.PNG"
                  alt="Hill Street Run Club Logo"
                  width={250}
                  height={250}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-8 font-display tracking-tight"
              style={{ color: "#00274C" }}
            >
              WHAT WE DO
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              title="TRAINING"
              description="We provide structured training programs and group runs for all fitness levels, from beginners to competitive runners looking to achieve personal records."
            />
            <FeatureCard
              title="COMMUNITY"
              description="We create lasting connections through regular social events, team challenges, and a supportive network of fellow Wolverines who share your passion for running."
            />
            <FeatureCard
              title="COMPETITION"
              description="We organize race teams and provide opportunities to represent Hill Street Run Club at local races, marathons, and university competitions throughout the year."
            />
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section
        id="events"
        className="py-20"
        style={{ backgroundColor: "#00274C" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-8 font-display tracking-tight"
              style={{ color: "#FFCB05" }}
            >
              UPCOMING EVENTS
            </h2>
          </div>

          {/* Featured Event with Image */}
          <div className="mb-12 text-center">
            <Image
              src="/big house 5k.webp"
              alt="Big House 5K Race Event"
              width={600}
              height={300}
              className="object-cover rounded-lg shadow-xl mx-auto mb-6"
            />
            <h3
              className="text-3xl md:text-4xl font-display tracking-wider mb-4 text-glow-maize"
              style={{ color: "#FFCB05" }}
            >
              FEATURED EVENT: BIG HOUSE 5K
            </h3>
            <p className="text-gray-200 max-w-2xl mx-auto font-athletic text-xl leading-relaxed">
              Join us for our signature Big House 5K run around Michigan&apos;s
              iconic stadium. A perfect blend of Michigan pride and athletic
              achievement!
            </p>
          </div>

          {/* Live Route Map Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3
                className="text-4xl md:text-6xl font-display tracking-wider mb-4 text-glow-maize"
                style={{ color: "#FFCB05" }}
              >
                NEXT RUN ROUTE
              </h3>
              <p className="text-gray-200 max-w-2xl mx-auto font-athletic text-xl">
                Check out the route for our upcoming group run! Follow the blue
                path and meet us at the start point.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {loadingRoute ? (
                <div className="text-center py-12">
                  <p className="text-gray-200 text-lg">Loading route...</p>
                </div>
              ) : upcomingRoute ? (
                <>
                  <GoogleRouteMap
                    routePoints={upcomingRoute.points}
                    center={[
                      upcomingRoute.points[0].lat,
                      upcomingRoute.points[0].lng,
                    ]}
                    zoom={14}
                    height="500px"
                    title={upcomingRoute.name}
                    distance={upcomingRoute.distance}
                    difficulty={upcomingRoute.difficulty}
                  />

                  {/* Route Details */}
                  <div className="mt-6 p-6 bg-gray-800 rounded-lg">
                    <h4
                      className="text-xl font-bold mb-3"
                      style={{ color: "#FFCB05" }}
                    >
                      {upcomingRoute.name}
                    </h4>
                    <p className="text-gray-200 mb-4 leading-relaxed">
                      {upcomingRoute.description}
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Distance:</span>
                        <span className="text-white font-semibold">
                          {upcomingRoute.distance}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Difficulty:</span>
                        <span className="text-white font-semibold">
                          {upcomingRoute.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Est. Time:</span>
                        <span className="text-white font-semibold">
                          {upcomingRoute.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-200 text-lg">
                    No upcoming route available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <EventCard
              badge="WEEKLY"
              title="Wednesday Group Run"
              description="Our signature 5-mile group run with multiple pace groups for all fitness levels."
              date="Every Wednesday, 6:00 PM"
              location="Ann Arbor - Meet at TBD"
            />
            <EventCard
              badge="WEEKEND"
              title="Saturday Long Run"
              description="Build endurance with our weekend long runs, perfect for marathon training."
              date="Every Saturday, 7:00 AM"
              location="Ann Arbor - Meet at TBD"
            />
            <EventCard
              badge="MONTHLY"
              title="Social Run & Coffee"
              description="Easy-paced social run followed by coffee. Great for newcomers to meet the group."
              date="First Sunday of each month"
              location="Ann Arbor - Meet at TBD"
            />
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-4xl md:text-5xl font-bold mb-8 font-display tracking-tight"
            style={{ color: "#00274C" }}
          >
            READY TO JOIN?
          </h2>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-sans">
            Connect with fellow Wolverines, push your limits, and discover what
            you're truly capable of achieving. Whether you're training for your
            first 5K or your next personal record, we're here to support you
            every step of the way.
          </p>
          <Link
            href="/join"
            className="inline-block px-12 py-4 text-xl font-semibold font-sans rounded-lg transition-all hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: "#FFCB05", color: "#00274C" }}
          >
            JOIN HILL STREET RUN CLUB
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="py-16 text-white"
        style={{ backgroundColor: "#00274C" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/HillStreetRunClub.PNG"
                  alt="Hill Street Run Club Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span
                  className="text-xl font-bold font-display"
                  style={{ color: "#FFCB05" }}
                >
                  Hill Street Run Club
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed font-sans">
                Building a stronger Ann Arbor community, one step at a time.
                Proud to represent the maize and blue with every mile we run.
              </p>
            </div>

            <div>
              <h4
                className="font-semibold mb-4 text-lg font-display"
                style={{ color: "#FFCB05" }}
              >
                QUICK LINKS
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#about"
                    className="text-gray-400 hover:text-white transition-colors font-sans"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#events"
                    className="text-gray-400 hover:text-white transition-colors font-sans"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="#join"
                    className="text-gray-400 hover:text-white transition-colors font-sans"
                  >
                    Join
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    className="text-gray-400 hover:text-white transition-colors font-sans"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4
                className="font-semibold mb-4 text-lg font-display"
                style={{ color: "#FFCB05" }}
              >
                CONNECT
              </h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors font-sans"
                >
                  Email Us
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors font-sans"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors font-sans"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400 font-sans">
              &copy; 2025 Hill Street Run Club. All rights reserved.
              <span style={{ color: "#FFCB05" }} className="ml-2 font-display">
                Go Blue!
              </span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
