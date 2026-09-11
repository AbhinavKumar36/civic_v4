import mongoose from 'mongoose';
import dns from 'dns';
import { env } from '../config/env';
import { DevelopmentProposal, ProposalCategory } from '../models/DevelopmentProposal';
import { priorityEngineService } from '../services/intelligence/PriorityEngineService';
import { impactEngineService } from '../services/intelligence/ImpactEngineService';

// Fix for restrictive network DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

interface DemoProposalItem {
  title: string;
  description: string;
  category: ProposalCategory;
  subCategory: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  wardId: string;
  estimatedCost: number;
  estimatedTimeline: string;
  beneficiaries: number;
  targetGroups: string[];
  dependencies: string[];
  source: string;
  status: 'DRAFT';
}

const demoProposals: DemoProposalItem[] = [
  {
    title: 'Primary Healthcare Centre & Emergency Post (Ward 35 - Rasulgarh)',
    description: 'Construction of a modern Urban Primary Health Centre (UPHC) with maternal delivery unit, 24x7 emergency triage, and diagnostic lab to resolve chronic healthcare travel times in Rasulgarh/Mancheswar industrial perimeter.',
    category: 'HEALTHCARE',
    subCategory: 'Urban Primary Healthcare',
    location: {
      type: 'Point',
      coordinates: [85.8712, 20.2961] // Rasulgarh, Bhubaneswar
    },
    wardId: 'Ward 35',
    estimatedCost: 18500000, // ₹1.85 Cr
    estimatedTimeline: '10 months',
    beneficiaries: 24000,
    targetGroups: ['Mothers & Infants', 'Elderly Citizens', 'Industrial Workers', 'Slum Households'],
    dependencies: ['BMC Land Allocation Clearance', 'Water Supply Connection'],
    source: 'DEMO_PROPOSAL',
    status: 'DRAFT'
  },
  {
    title: 'Smart Secondary School & STEM Laboratory Upgrade (Ward 42 - Nayapalli)',
    description: 'Expansion of government high school infrastructure with 8 smart classrooms, digital library, and dedicated physics/chemistry STEM laboratories to ease severe student-teacher and classroom congestion.',
    category: 'EDUCATION',
    subCategory: 'Secondary Education Infrastructure',
    location: {
      type: 'Point',
      coordinates: [85.8152, 20.3015] // Nayapalli, Bhubaneswar
    },
    wardId: 'Ward 42',
    estimatedCost: 12000000, // ₹1.20 Cr
    estimatedTimeline: '8 months',
    beneficiaries: 18500,
    targetGroups: ['School Children (Ages 10-18)', 'Low-Income Students', 'Educators'],
    dependencies: ['State Education Board Clearance'],
    source: 'DEMO_PROPOSAL',
    status: 'DRAFT'
  },
  {
    title: 'Stormwater Drainage & Monsoon Waterlogging Mitigation (Ward 18 - Master Canteen)',
    description: 'Upgrading primary concrete box drains and installing automated desilting sumps along Station Road and Master Canteen square to prevent recurring monsoon urban flooding and traffic paralysis.',
    category: 'DRAINAGE',
    subCategory: 'Urban Storm Drainage',
    location: {
      type: 'Point',
      coordinates: [85.8395, 20.2662] // Master Canteen / Station Area
    },
    wardId: 'Ward 18',
    estimatedCost: 24000000, // ₹2.40 Cr
    estimatedTimeline: '12 months',
    beneficiaries: 32000,
    targetGroups: ['Daily Transit Commuters', 'Market Vendors', 'Commercial Retailers'],
    dependencies: ['Traffic Police Diversion Protocol', 'Utility Cable Realignment'],
    source: 'DEMO_PROPOSAL',
    status: 'DRAFT'
  },
  {
    title: 'Clean Drinking Water Distribution & Automated RO Kiosks (Ward 24 - Saheed Nagar)',
    description: 'Replacing aged distribution pipes and setting up four 24/7 automated Water ATMs connected to treated municipal supply in underserved residential and slum pockets of Saheed Nagar.',
    category: 'WATER',
    subCategory: 'Piped Potable Water',
    location: {
      type: 'Point',
      coordinates: [85.8501, 20.2882] // Saheed Nagar, Bhubaneswar
    },
    wardId: 'Ward 24',
    estimatedCost: 9500000, // ₹95 Lakhs
    estimatedTimeline: '6 months',
    beneficiaries: 14000,
    targetGroups: ['Slum Dwellers', 'Daily Wage Earners', 'Elderly Residents'],
    dependencies: ['WATCO Water Grid Linkage'],
    source: 'DEMO_PROPOSAL',
    status: 'DRAFT'
  },
  {
    title: 'Urban Maternity & Child Health Post (Ward 12 - Chandrasekharpur)',
    description: 'Setting up dedicated maternal and child health clinic providing prenatal care, infant vaccination bays, and nutrition support in high-density residential sectors of Chandrasekharpur.',
    category: 'HEALTHCARE',
    subCategory: 'Maternal & Child Health',
    location: {
      type: 'Point',
      coordinates: [85.8182, 20.3245] // Chandrasekharpur, Bhubaneswar
    },
    wardId: 'Ward 12',
    estimatedCost: 15000000, // ₹1.50 Cr
    estimatedTimeline: '9 months',
    beneficiaries: 21000,
    targetGroups: ['Expectant Mothers', 'Infants & Toddlers', 'Working Women'],
    dependencies: ['National Health Mission Approvals'],
    source: 'DEMO_PROPOSAL',
    status: 'DRAFT'
  }
];

const seedProposals = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for Seeding Proposals');

    for (const data of demoProposals) {
      const existing = await DevelopmentProposal.findOne({ title: data.title });
      let proposalDoc;
      if (existing) {
        Object.assign(existing, data);
        await existing.save();
        proposalDoc = existing;
        console.log(`Updated proposal: ${data.title}`);
      } else {
        proposalDoc = await DevelopmentProposal.create(data);
        console.log(`Created proposal: ${data.title}`);
      }

      // Evaluate Priority & Impact
      console.log(`Evaluating Priority & Impact for ${proposalDoc.title}...`);
      await priorityEngineService.evaluateProposal(proposalDoc._id.toString());
      await impactEngineService.evaluateImpact(proposalDoc._id.toString());
    }

    // Rank all proposals
    const ranked = await priorityEngineService.recalculateRankings();
    console.log(`🎉 Successfully seeded and ranked ${ranked.length} Bhubaneswar proposals!`);

    for (const r of ranked) {
      const p = await DevelopmentProposal.findById(r.proposalId);
      console.log(`Rank #${r.rank}: [Score: ${r.totalScore}/100] ${p?.title} (${p?.category}) - Est: ₹${((p?.estimatedCost || 0)/100000).toFixed(1)}L`);
    }

  } catch (error) {
    console.error('❌ Failed to seed proposals:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedProposals();
