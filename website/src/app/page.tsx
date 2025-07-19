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
  description?: string;
  distance: string;
  estimatedTime: string;
  points: RoutePoint[];
  isUpcoming?: boolean;
}

interface Event {
  id: number;
  badge: string;
  title: string;
  description: string;
  date: string;
  location: string;
  isActive: boolean;
  sortOrder: number;
}

export default function Home() {
  const [upcomingRoute, setUpcomingRoute] = useState<RunRoute | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

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

    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const eventsData = await response.json();
          setEvents(eventsData);
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchUpcomingRoute();
    fetchEvents();
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
              className="text-6xl md:text-9xl font-display tracking-wider mb-8"
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
            <div className="big-house-container mx-auto max-w-6xl">
              <Image
                src="/um big house.jpg"
                alt="University of Michigan Big House Stadium"
                width={1200}
                height={400}
                className="big-house-image object-cover w-full h-64 md:h-96"
                priority
              />
            </div>
          </div>

          {/* Our Story */}
          <div className="mb-20">
            <h2
              className="text-5xl md:text-7xl font-display tracking-wider mb-8"
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
                    className="font-impact font-bold underline hover:no-underline transition-all"
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
      <section id="what-we-do" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2
              className="text-6xl md:text-8xl font-bold mb-8 font-display tracking-tight"
              style={{ color: "#00274C" }}
            >
              WHAT WE DO
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              title="RUNS"
              description="Our runs are upbeat, energetic group outings on and off campus, featuring pace groups, challenges, and music that keeps every runner moving."
            />
            <FeatureCard
              title="COMMUNITY"
              description="We create lasting connections through regular social events, invigorating cold-plunges, mutual motivation, and celebrating every victory—big or small—together."
            />
            <FeatureCard
              title="PHILANTROPY"
              description="We partner with local nonprofits, host charity runs and volunteer days, and support Ann Arbor initiatives that promote community health, education, and well-being."
            />
          </div>
        </div>
      </section>

      {/* People Section */}
      <section
        id="team"
        className="py-20"
        style={{ backgroundColor: "#00274C" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-6xl md:text-8xl font-bold mb-8 font-display tracking-tight"
              style={{ color: "#FFCB05" }}
            >
              OUR TEAM
            </h2>
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
              </div>
              <p className="text-gray-200 max-w-4xl mx-auto font-athletic text-3xl leading-relaxed bg-[#00274C] px-8 relative z-10 text-center">
                <span
                  className="text-5xl md:text-6xl font-display tracking-wider block mb-4"
                  style={{ color: "#FFCB05" }}
                >
                  2025-2026
                </span>
                <span className="text-2xl md:text-3xl italic">
                  Founding Leadership
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="mb-6 relative">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gray-300 relative">
                  <Image
                    src="/will_photo.jpeg"
                    alt="Will Endres"
                    width={192}
                    height={192}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3
                className="text-2xl md:text-3xl font-display tracking-wide mb-2"
                style={{ color: "#FFCB05" }}
              >
                WILL ENDRES
              </h3>
              <p className="text-gray-300 font-athletic text-lg">
                President & Founder
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <div className="mb-6 relative">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gray-300 relative">
                  <Image
                    src="/hubbard_photo.png"
                    alt="Jack Hubbard"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3
                className="text-2xl md:text-3xl font-display tracking-wide mb-2"
                style={{ color: "#FFCB05" }}
              >
                JACK HUBBARD
              </h3>
              <p className="text-gray-300 font-athletic text-lg">
                Vice President
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <div className="mb-6 relative">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gray-300 relative">
                  <Image
                    src="/luka_photo.png"
                    alt="Luka Kampinga"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3
                className="text-2xl md:text-3xl font-display tracking-wide mb-2"
                style={{ color: "#FFCB05" }}
              >
                LUKA KAMPINGA
              </h3>
              <p className="text-gray-300 font-athletic text-lg">Treasurer</p>
            </div>

            {/* Team Member 4 */}
            <div className="text-center">
              <div className="mb-6 relative">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gray-300 relative">
                  <Image
                    src="/hunter_photo.jpeg"
                    alt="Hunter Broughton"
                    width={192}
                    height={192}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3
                className="text-2xl md:text-3xl font-display tracking-wide mb-2"
                style={{ color: "#FFCB05" }}
              >
                HUNTER BROUGHTON
              </h3>
              <p className="text-gray-300 font-athletic text-lg">
                Membership and Communications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Run Section */}
      <section id="next-run" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2
              className="text-6xl md:text-8xl font-display tracking-wider mb-4"
              style={{ color: "#00274C" }}
            >
              NEXT RUN
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto font-athletic text-xl">
              Check out the route for our upcoming group run! Follow the blue
              path and meet us at the start point.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {loadingRoute ? (
              <div className="text-center py-12">
                <p className="text-gray-700 text-lg">Loading route...</p>
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
                />

                {/* Route Details */}
                <div
                  className="mt-6 p-6 bg-gray-100 rounded-lg border-2"
                  style={{ borderColor: "#FFCB05" }}
                >
                  <h4
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: "#00274C" }}
                  >
                    {upcomingRoute.name}
                  </h4>
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg md:text-xl">
                    {upcomingRoute.description}
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 text-lg md:text-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">
                        Distance:
                      </span>
                      <span className="text-gray-800 font-bold">
                        {upcomingRoute.distance}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">
                        Est. Time:
                      </span>
                      <span className="text-gray-800 font-bold">
                        {upcomingRoute.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-700 text-lg">
                  No upcoming route available
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Event Cards Section */}
      <section
        id="schedule"
        className="py-20"
        style={{ backgroundColor: "#00274C" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2
              className="text-5xl md:text-6xl font-bold mb-8 font-display tracking-tight"
              style={{ color: "#FFCB05" }}
            >
              WEEKLY SCHEDULE
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingEvents ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-300 text-lg">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-300 text-lg">No events scheduled</p>
              </div>
            ) : (
              events.map((event) => (
                <EventCard
                  key={event.id}
                  badge={event.badge}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  location={event.location}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-6xl md:text-8xl font-bold mb-8 font-display tracking-tight"
            style={{ color: "#00274C" }}
          >
            READY TO JOIN?
          </h2>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-sans">
            Connect with fellow Wolverines, push your limits, and discover what
            you&apos;re truly capable of achieving. Whether you&apos;re training for your
            first 5K or your next personal record, we&apos;re here to support you
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
                Wanna join us? Follow us on instagram and{" "}
                <Link href="/join" className="text-blue-500 hover:underline">
                  sign up today!
                </Link>
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
                  href="https://www.instagram.com/hillstrunclub/"
                  className="block text-gray-400 hover:text-white transition-colors font-sans"
                >
                  Instagram
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
