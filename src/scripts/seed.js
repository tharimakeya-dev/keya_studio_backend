require('dotenv').config();
const { MongoClient } = require('mongodb');

const studios = [
  {
    title: "Apex Daylight Photography Loft & Cyc Wall",
    category: "Photo Studio",
    hourlyRate: 85,
    securityDeposit: 150,
    maxCapacity: 18,
    location: "450 Broadway, Soho, New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80"
    ],
    rating: 4.95,
    reviewsCount: 38,
    amenities: ["Corner Cyclorama Wall", "Profoto Lighting Kit", "Hair & Makeup Station", "Freight Elevator", "High-Speed Wi-Fi", "Steamer & Wardrobe Rack"],
    detailedOverview: "Flooded with natural northern daylight through 14-foot industrial loft windows, Apex Studio is tailored for high-fashion editorial, commercial lookbooks, and portraiture. Includes motorized seamless backdrops and dedicated client lounge.",
    ownerName: "Elena Rostova",
    ownerEmail: "elena.studios@example.com",
    createdAt: new Date("2026-01-15T10:00:00Z")
  },
  {
    title: "Blackout Cinema Stage & Virtual Production Suite",
    category: "Film Stage",
    hourlyRate: 160,
    securityDeposit: 300,
    maxCapacity: 35,
    location: "820 Industrial Blvd, Long Island City, NY",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?auto=format&fit=crop&w=1200&q=80"
    ],
    rating: 4.98,
    reviewsCount: 44,
    amenities: ["Complete Sound Isolation", "Grid Ceiling (18ft)", "3-Phase 100A Power", "Green Screen Cyc", "Drive-in Loading Bay", "Production Office"],
    detailedOverview: "Built specifically for indie features, music videos, and commercial film crews. Features full acoustic baffling, pre-rigged lighting grid, vehicle drive-in capability, and climate-controlled production suites.",
    ownerName: "Marcus Vance",
    ownerEmail: "marcus.films@example.com",
    createdAt: new Date("2026-01-20T12:00:00Z")
  },
  {
    title: "The Waveform 4-Mic Broadcast Podcast Lounge",
    category: "Podcast Room",
    hourlyRate: 65,
    securityDeposit: 100,
    maxCapacity: 8,
    location: "128 W 30th St, Chelsea, New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1589903102059-24142e7a2a2b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80"
    ],
    rating: 4.91,
    reviewsCount: 52,
    amenities: ["4x Shure SM7B Mics", "Rodecaster Pro II Console", "Multi-Angle 4K Cameras", "Custom RGB Ambient Lighting", "Acoustic Wood Paneling", "Live Streaming Fiber"],
    detailedOverview: "Plug-and-play podcast and vodcast studio with calibrated acoustics and broadcast-grade equipment. Record pristine multi-track audio and multi-angle 4K video switching with zero setup hassle.",
    ownerName: "David Sterling",
    ownerEmail: "david.pod@example.com",
    createdAt: new Date("2026-02-01T09:30:00Z")
  },
  {
    title: "Neon Horizon Dolby Atmos Music Recording Suite",
    category: "Music Suite",
    hourlyRate: 110,
    securityDeposit: 200,
    maxCapacity: 10,
    location: "310 Bowery, East Village, New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
    ],
    rating: 4.96,
    reviewsCount: 29,
    amenities: ["Dolby Atmos 7.1.4 Monitoring", "Universal Audio Apollo x16", "Vintage Neumann U87", "Vocal Isolation Booth", "Analog Outboard Gear", "MIDI Keyboard & Synths"],
    detailedOverview: "A premier creative haven for producers, songwriters, and recording artists. Features world-class acoustics by Walters-Storyk Design Group, vintage tube microphones, and modern immersive Dolby Atmos mixing.",
    ownerName: "Chloe Dupont",
    ownerEmail: "chloe.music@example.com",
    createdAt: new Date("2026-02-10T14:00:00Z")
  },
  {
    title: "The Industrial Foundry Ceramic & Sculpture Workshop",
    category: "Art Workshop",
    hourlyRate: 50,
    securityDeposit: 75,
    maxCapacity: 20,
    location: "64 North 9th St, Williamsburg, Brooklyn, NY",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80"
    ],
    rating: 4.88,
    reviewsCount: 23,
    amenities: ["8x Pottery Wheels", "Electric Skutt Kiln", "Heavy Duty Workbenches", "Deep Clay Wash Sinks", "Natural Skylights", "Tool Chest & Glaze Bar"],
    detailedOverview: "A bright, high-ceiling workshop space equipped with pottery wheels, drying racks, kiln access, and expansive wooden work tables. Ideal for masterclasses, private artisan sessions, and creative exhibitions.",
    ownerName: "Julian Karr",
    ownerEmail: "julian.art@example.com",
    createdAt: new Date("2026-02-18T11:15:00Z")
  },
  {
    title: "Skyline Penthouse Visual Production & Creator Studio",
    category: "Photo Studio",
    hourlyRate: 125,
    securityDeposit: 250,
    maxCapacity: 15,
    location: "55 Water St, Dumbo, Brooklyn, NY",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    rating: 4.97,
    reviewsCount: 61,
    amenities: ["Panoramic Manhattan Bridge Views", "Private Outdoor Terrace", "Design Furniture & Props", "Continuous LED Light Panels", "Espresso Bar", "Sonos Sound System"],
    detailedOverview: "Breathtaking views of the East River and Manhattan skyline. Perfect for lifestyle brand campaigns, YouTube content creation, executive interviews, and sunset golden-hour photo shoots.",
    ownerName: "Sofia Ramirez",
    ownerEmail: "sofia.creator@example.com",
    createdAt: new Date("2026-02-25T16:45:00Z")
  }
];

async function seedDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studiospace';
  console.log('[Seed] Connecting to MongoDB at:', uri.replace(/\/\/.*@/, '//***:***@'));

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'studiospace');
    const studiosCol = db.collection('studios');

    // Clear existing sample studios to prevent duplicates
    await studiosCol.deleteMany({});
    console.log('[Seed] Cleared existing studios collection.');

    const result = await studiosCol.insertMany(studios);
    console.log(`[Seed] Successfully inserted ${result.insertedCount} featured creative studios!`);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err.message);
  } finally {
    await client.close();
    console.log('[Seed] Connection closed.');
  }
}

seedDatabase();

