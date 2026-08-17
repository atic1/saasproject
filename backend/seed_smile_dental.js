require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  console.warn('DNS server override ignored:', err.message);
}
const mongoose = require('mongoose');
const User = require('./models/user');
const Business = require('./models/business');
const GymWebsite = require('./models/gymWebsite');
const Service = require('./models/service');
const Trainer = require('./models/trainer');
const MembershipPlan = require('./models/membershipPlan');
const Offer = require('./models/offer');
const Gallery = require('./models/gallery');
const Review = require('./models/review');
const Availability = require('./models/availability');
const bcrypt = require('bcryptjs');

async function seedSmileDental() {
  try {
    const dbUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.DATABASE_URL;
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB for Smile Dental seeding...");

    // Find or create Owner User
    let owner = await User.findOne({ email: 'clinic-owner@smile.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Dr. Marcus Vance',
        email: 'clinic-owner@smile.com',
        phone: '9822222222',
        password: 'clinicpassword123',
        platformrole: 'customer',
        status: 'active'
      });
      console.log("Created Owner User: Dr. Marcus Vance");
    }

    // 1. Find or create Business 'smile-dental'
    let business = await Business.findOne({ slug: 'smile-dental' });
    if (!business) {
      business = await Business.create({
        slug: 'smile-dental',
        name: 'Smile Dental Clinic',
        type: 'clinic',
        ownerId: owner._id,
        status: 'active',
        subscription: { plan: 'growth', status: 'active' },
        contact: { phone: '+977 1-4422000', city: 'Kathmandu', address: 'Durbar Marg, Kathmandu' },
        branding: {
          tagline: 'Precision Dentistry & Radiant Smiles',
          description: 'Your premier sanctuary for gentle, advanced dental treatments, digital 3D diagnostics, and compassionate family oral healthcare.'
        }
      });
      console.log("Created Business: smile-dental");
    } else {
      business.type = 'clinic';
      business.name = 'Smile Dental Clinic';
      business.status = 'active';
      if (!business.ownerId) business.ownerId = owner._id;
      await business.save();
      console.log("Updated Business: smile-dental");
    }

    const bid = business._id;

    // 2. Setup GymWebsite (Clinic Website Profile)
    await GymWebsite.findOneAndUpdate(
      { businessId: bid },
      {
        businessId: bid,
        logo: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&auto=format&fit=crop&q=80',
        description: 'Your premier destination for gentle, advanced dental treatments, smile aesthetics, digital 3D diagnostics, and compassionate family oral healthcare.',
        mission: 'To elevate oral wellness with precision technology, absolute sterilization, and patient-first compassionate dental care.',
        facilities: 'Digital 3D OPG Suite, Painless Laser Dentistry, Class-B Autoclave Sterilization, Intraoral Scanner, Pediatric Care Lounge',
        address: 'Durbar Marg (Opposite Narayanhiti Palace), Kathmandu, Nepal',
        phone: '+977 1-4422000',
        email: 'care@smiledental.com.np',
        mapLink: 'https://maps.google.com',
        socialLinks: {
          facebook: 'https://facebook.com',
          instagram: 'https://instagram.com',
          youtube: 'https://youtube.com'
        },
        businessHours: {
          monday:    { open: '08:00', close: '19:00', isOpen: true },
          tuesday:   { open: '08:00', close: '19:00', isOpen: true },
          wednesday: { open: '08:00', close: '19:00', isOpen: true },
          thursday:  { open: '08:00', close: '19:00', isOpen: true },
          friday:    { open: '08:00', close: '19:00', isOpen: true },
          saturday:  { open: '09:00', close: '17:00', isOpen: true },
          sunday:    { open: '10:00', close: '14:00', isOpen: false }
        },
        isPublished: true
      },
      { upsert: true, new: true }
    );
    console.log("Updated Clinic Website profile for smile-dental");

    // 3. Clear and Seed Dental Services
    await Service.deleteMany({ businessId: bid });
    const dentalServices = [
      {
        businessId: bid,
        name: 'Comprehensive Oral Exam & Digital X-Ray',
        category: 'Preventive',
        description: 'Complete examination of teeth and gums with low-radiation 3D intraoral digital radiography.',
        duration: 30,
        price: 600,
        capacity: 1,
        type: 'clinic_consultation',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Ultrasonic Scaling & Deep Stain Polishing',
        category: 'Preventive',
        description: 'Advanced ultrasonic removal of plaque and tartar with high-gloss diamond paste tooth polishing.',
        duration: 45,
        price: 1500,
        capacity: 1,
        type: 'clinic_consultation',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Laser Teeth Whitening (Instant 6-Shades Brighter)',
        category: 'Cosmetic',
        description: 'Non-invasive LED & laser whitening session delivering instant stain removal and glowing smiles.',
        duration: 60,
        price: 6500,
        capacity: 1,
        type: 'clinic_consultation',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Single-Visit Rotary Root Canal Treatment (RCT)',
        category: 'Restorative',
        description: 'Painless, computer-guided rotary endodontic therapy with 3D apex locator and biocompatible seal.',
        duration: 60,
        price: 4500,
        capacity: 1,
        type: 'clinic_consultation',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Invisible Clear Aligners Consultation & 3D Simulation',
        category: 'Orthodontics',
        description: 'Digital 3D intraoral scan and AI-powered simulation of your projected teeth alignment journey.',
        duration: 40,
        price: 1000,
        capacity: 1,
        type: 'clinic_consultation',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Titanium Dental Implant & Zirconia Crown',
        category: 'Restorative',
        description: 'Permanent tooth replacement using Swiss biocompatible titanium fixtures and custom ceramic crowns.',
        duration: 90,
        price: 25000,
        capacity: 1,
        type: 'clinic_consultation',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Pediatric Cavity Prevention & Fluoride Varnish',
        category: 'Preventive',
        description: 'Gentle dental checkup for kids, fruit-flavored enamel fluoride coating, and habit counseling.',
        duration: 30,
        price: 1200,
        capacity: 1,
        type: 'clinic_consultation',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Painless Wisdom Tooth Surgical Extraction',
        category: 'Restorative',
        description: 'Minimally invasive removal of impacted third molars with modern local anesthesia and quick healing.',
        duration: 45,
        price: 3500,
        capacity: 1,
        type: 'clinic_consultation',
        isActive: true
      }
    ];
    await Service.insertMany(dentalServices);
    console.log(`Seeded ${dentalServices.length} Dental Services`);

    // 4. Seed Doctors / Dental Specialists (Trainer model)
    await Trainer.deleteMany({ businessId: bid });
    const doctors = [
      {
        businessId: bid,
        name: 'Dr. Aayush Shrestha, BDS, MDS',
        photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=60',
        specialization: 'Chief Orthodontist & Smile Designer',
        experience: '12+ Years',
        bio: 'Specializes in clear invisible aligners, digital smile design, and advanced adolescent & adult orthodontics.',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Dr. Priya Sharma, BDS, Fellowship in Laser Dentistry',
        photo: 'https://images.unsplash.com/photo-1594824813512-1f49fa7e1d52?w=400&auto=format&fit=crop&q=60',
        specialization: 'Cosmetic Dental Surgeon & Aesthetician',
        experience: '8+ Years',
        bio: 'Dedicated to porcelain veneers, painless laser gum contouring, and instant photo-ready smile makeovers.',
        isActive: true
      },
      {
        businessId: bid,
        name: 'Dr. Rohan KC, MDS (Oral & Maxillofacial Surgery)',
        photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=60',
        specialization: 'Senior Implantologist & Oral Surgeon',
        experience: '15+ Years',
        bio: 'Pioneer in computer-guided dental implants, bone grafting, and gentle surgical extractions.',
        isActive: true
      }
    ];
    await Trainer.insertMany(doctors);
    console.log(`Seeded ${doctors.length} Doctors & Specialists`);

    // 5. Seed Dental Membership Plans
    await MembershipPlan.deleteMany({ businessId: bid });
    const plans = [
      {
        businessId: bid,
        name: 'Essential Family Dental Pass',
        price: 4999,
        duration: '1 Year',
        description: 'Complete preventative checkup and scaling coverage for up to 4 family members.',
        features: [
          '2 Comprehensive Oral Checkups & X-Rays',
          '2 Professional Ultrasonic Scalings',
          '15% Off All Restorative & Filling Treatments',
          'Zero Emergency Consultation Fees'
        ],
        isPopular: false,
        isActive: true
      },
      {
        businessId: bid,
        name: 'VIP Radiant Smile Membership',
        price: 9999,
        duration: '1 Year',
        description: 'All-inclusive cosmetic dental package with complimentary whitening and priority appointments.',
        features: [
          'Unlimited Checkups & 3D Digital Scans',
          'Quarterly Deep Ultrasonic Polishing',
          '1 Free Laser Teeth Whitening Session',
          '20% Off Veneers, Crowns & Ortho Aligners',
          'Dedicated Doctor Direct Phone Access'
        ],
        isPopular: true,
        isActive: true
      },
      {
        businessId: bid,
        name: 'Kids Smile & Cavity Shield Plan',
        price: 3499,
        duration: '1 Year',
        description: 'Specialized oral health shield for growing children up to 14 years old.',
        features: [
          '3 Gentle Pediatric Cleanings',
          'Bi-Annual Fluoride Varnish Applications',
          'Pit & Fissure Sealants Included',
          'Fun Oral Hygiene Goodie Bag'
        ],
        isPopular: false,
        isActive: true
      }
    ];
    await MembershipPlan.insertMany(plans);
    console.log(`Seeded ${plans.length} Dental Care Plans`);

    // 6. Seed Special Offers
    await Offer.deleteMany({ businessId: bid.toString() });
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const offers = [
      {
        businessId: bid.toString(),
        name: 'Laser Teeth Whitening Summer Promo',
        description: 'Get an instant 6-shade brighter smile with our gentle laser treatment. Limited slots available.',
        code: 'SMILE20',
        discount: { type: 'percentage', value: 20 },
        validity: { startDate: new Date(), endDate: futureDate },
        display: {
          bannerImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80'
        },
        isActive: true
      },
      {
        businessId: bid.toString(),
        name: 'First Visit Family Dental Voucher',
        description: 'Complimentary full digital 3D intraoral scan and consult on your family’s first visit.',
        code: 'FIRSTVISIT',
        discount: { type: 'fixed_amount', value: 1000 },
        validity: { startDate: new Date(), endDate: futureDate },
        display: {
          bannerImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80'
        },
        isActive: true
      }
    ];
    await Offer.insertMany(offers);
    console.log(`Seeded ${offers.length} Promotional Offers`);

    // 7. Seed Gallery Images
    await Gallery.deleteMany({ businessId: bid });
    const galleryItems = [
      {
        businessId: bid,
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
        caption: 'High-Tech Digital Operatory 1'
      },
      {
        businessId: bid,
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
        caption: 'Painless Laser Whitening Suite'
      },
      {
        businessId: bid,
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
        caption: 'Modern Sterilization & Autoclave Unit'
      },
      {
        businessId: bid,
        imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
        caption: '3D Panoramic OPG Imaging Lab'
      }
    ];
    await Gallery.insertMany(galleryItems);
    console.log(`Seeded ${galleryItems.length} Gallery Images`);

    // 8. Seed Verified Patient Reviews
    await Review.deleteMany({ businessId: bid });
    const reviews = [
      {
        businessId: bid,
        customerName: 'Sanjay Shrestha',
        rating: 5,
        comment: 'Completely painless root canal treatment! Dr. Aayush and team made me feel totally relaxed. Highest standard of hygiene in Kathmandu.',
        isApproved: true,
        createdAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        businessId: bid,
        customerName: 'Rashmi Adhikari',
        rating: 5,
        comment: 'Got my ceramic braces and whitening here. The 3D scan preview was super accurate and results exceeded my expectations!',
        isApproved: true,
        createdAt: new Date(Date.now() - 7 * 86400000)
      },
      {
        businessId: bid,
        customerName: 'Binod Tamang',
        rating: 5,
        comment: 'Super clean clinic, polite staff, and on-time appointments. My kids actually look forward to their dental checkups now.',
        isApproved: true,
        createdAt: new Date(Date.now() - 14 * 86400000)
      }
    ];
    await Review.insertMany(reviews);
    console.log(`Seeded ${reviews.length} Patient Reviews`);

    // 9. Ensure Availability for Booking
    await Availability.deleteMany({ businessId: bid });
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const defaultSlots = [
      { startTime: '09:00', endTime: '10:00', capacity: 2 },
      { startTime: '10:00', endTime: '11:00', capacity: 2 },
      { startTime: '11:00', endTime: '12:00', capacity: 2 },
      { startTime: '13:00', endTime: '14:00', capacity: 2 },
      { startTime: '14:00', endTime: '15:00', capacity: 2 },
      { startTime: '15:00', endTime: '16:00', capacity: 2 },
      { startTime: '16:00', endTime: '17:00', capacity: 2 }
    ];
    for (const day of days) {
      await Availability.create({
        businessId: bid,
        staffId: null,
        dayOfWeek: day,
        slots: defaultSlots,
        isAvailable: true
      });
    }
    console.log("Seeded weekly availability schedule for smile-dental");

    console.log("\n🎉 Smile Dental Clinic fully seeded successfully!");
    console.log("You can now test the site at: http://localhost:5173/smile-dental");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedSmileDental();
