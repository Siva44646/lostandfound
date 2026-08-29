import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const apColleges = [
  // Top Engineering Colleges
  "JNTU College of Engineering, Kakinada (JNTUK)",
  "JNTU College of Engineering, Anantapur (JNTUA)",
  "AU College of Engineering, Visakhapatnam",
  "Sri Venkateswara University College of Engineering (SVUCE), Tirupati",
  "Koneru Lakshmaiah Education Foundation (KL University), Guntur",
  "Vignan's Foundation for Science, Technology & Research, Guntur",
  "SRM University AP, Amaravati",
  "VIT-AP University, Amaravati",
  "Gandhi Institute of Technology and Management (GITAM), Visakhapatnam",
  "G. Pulla Reddy Engineering College, Kurnool",
  "Gayatri Vidya Parishad College of Engineering (GVPCE), Visakhapatnam",
  "Sree Vidyanikethan Engineering College, Tirupati",
  "Velagapudi Ramakrishna Siddhartha Engineering College (VRSEC), Vijayawada",
  "Anil Neerukonda Institute of Technology and Sciences (ANITS), Visakhapatnam",
  "GMR Institute of Technology (GMRIT), Rajam",
  "Pragati Engineering College, Surampalem",
  "SRKR Engineering College, Bhimavaram",
  "Vishnu Institute of Technology (VIT), Bhimavaram",
  "Sri Venkateswara College of Engineering (SVCE), Tirupati",
  "Madanapalle Institute of Technology and Science (MITS), Madanapalle",
  "RVR & JC College of Engineering, Guntur",
  "Bapatla Engineering College, Bapatla",
  "Gudlavalleru Engineering College, Gudlavalleru",
  "Lendi Institute of Engineering and Technology, Vizianagaram",
  "MVGR College of Engineering, Vizianagaram",
  "JNTU College of Engineering, Kalikiri",
  "JNTU College of Engineering, Narasaraopet",
  "JNTU College of Engineering, Vizianagaram",
  "Tirumala Engineering College, Narasaraopet",
  "Narayana Engineering College, Nellore",
  "NBKR Institute of Science and Technology, Vidyanagar",
  "Rajeev Gandhi Memorial College of Engineering and Technology (RGMCET), Nandyal",
  "Sri Krishnadevaraya University College of Engineering, Anantapur",
  "Aditya Institute of Technology and Management (AITAM), Tekkali",
  "Aditya Engineering College, Surampalem",
  
  // Degree Colleges & Other Universities
  "Andhra Loyola College, Vijayawada",
  "Sri Venkateswara Arts College, Tirupati",
  "Silver Jubilee Government College, Kurnool",
  "P.B. Siddhartha College of Arts and Science, Vijayawada",
  "St. Theresa's College for Women, Eluru",
  "Maris Stella College, Vijayawada",
  "Hindu College, Guntur",
  "Acharya Nagarjuna University, Guntur",
  "Sri Krishnadevaraya University, Anantapur",
  "Rayalaseema University, Kurnool",
  "Yogi Vemana University, Kadapa",
  "Vikrama Simhapuri University, Nellore",
  "Krishna University, Machilipatnam",
  "Adikavi Nannaya University, Rajahmundry",
  "Dr. B.R. Ambedkar University, Srikakulam"
];

async function main() {
  console.log(`Starting to seed ${apColleges.length} AP Colleges...`);

  let count = 0;
  for (const collegeName of apColleges) {
    // Generate a simple code
    const code = collegeName.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase() + Math.floor(Math.random() * 1000);
    
    // Check if it already exists
    const existing = await prisma.college.findFirst({
      where: { name: collegeName }
    });

    if (!existing) {
      const college = await prisma.college.create({
        data: {
          name: collegeName,
          code: code,
          description: `Engineering/Degree College in Andhra Pradesh.`,
        }
      });
      
      // Create a default Main Campus for each
      await prisma.campus.create({
        data: {
          name: 'Main Campus',
          collegeId: college.id,
        }
      });

      count++;
    }
  }

  console.log(`Successfully added ${count} new colleges from Andhra Pradesh!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
