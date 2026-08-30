const regionalColleges = [
  // Andhra Pradesh
  "JNTU College of Engineering, Kakinada (JNTUK)", "JNTU College of Engineering, Anantapur (JNTUA)", "AU College of Engineering, Visakhapatnam", "Sri Venkateswara University College of Engineering (SVUCE), Tirupati", "Koneru Lakshmaiah Education Foundation (KL University), Guntur", "Vignan's Foundation for Science, Technology & Research, Guntur", "SRM University AP, Amaravati", "VIT-AP University, Amaravati", "Gandhi Institute of Technology and Management (GITAM), Visakhapatnam", "G. Pulla Reddy Engineering College, Kurnool", "Gayatri Vidya Parishad College of Engineering (GVPCE), Visakhapatnam", "Sree Vidyanikethan Engineering College, Tirupati", "Velagapudi Ramakrishna Siddhartha Engineering College (VRSEC), Vijayawada", "Anil Neerukonda Institute of Technology and Sciences (ANITS), Visakhapatnam", "GMR Institute of Technology (GMRIT), Rajam", "Pragati Engineering College, Surampalem", "SRKR Engineering College, Bhimavaram", "Vishnu Institute of Technology (VIT), Bhimavaram", "Sri Venkateswara College of Engineering (SVCE), Tirupati", "Madanapalle Institute of Technology and Science (MITS), Madanapalle", "RVR & JC College of Engineering, Guntur", "Bapatla Engineering College, Bapatla", "Gudlavalleru Engineering College, Gudlavalleru", "Lendi Institute of Engineering and Technology, Vizianagaram", "MVGR College of Engineering, Vizianagaram", "JNTU College of Engineering, Kalikiri", "JNTU College of Engineering, Narasaraopet", "JNTU College of Engineering, Vizianagaram", "Tirumala Engineering College, Narasaraopet", "Narayana Engineering College, Nellore", "NBKR Institute of Science and Technology, Vidyanagar", "Rajeev Gandhi Memorial College of Engineering and Technology (RGMCET), Nandyal", "Sri Krishnadevaraya University College of Engineering, Anantapur", "Aditya Institute of Technology and Management (AITAM), Tekkali", "Aditya Engineering College, Surampalem", "Andhra Loyola College, Vijayawada", "Sri Venkateswara Arts College, Tirupati", "Silver Jubilee Government College, Kurnool", "P.B. Siddhartha College of Arts and Science, Vijayawada", "St. Theresa's College for Women, Eluru", "Maris Stella College, Vijayawada", "Hindu College, Guntur", "Acharya Nagarjuna University, Guntur", "Sri Krishnadevaraya University, Anantapur", "Rayalaseema University, Kurnool", "Yogi Vemana University, Kadapa", "Vikrama Simhapuri University, Nellore", "Krishna University, Machilipatnam", "Adikavi Nannaya University, Rajahmundry", "Dr. B.R. Ambedkar University, Srikakulam",
  
  // Telangana
  "JNTU College of Engineering, Hyderabad (JNTUH)", "Osmania University College of Engineering (OUCE), Hyderabad", "Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad", "VNR Vignana Jyothi Institute of Engineering and Technology, Hyderabad", "Vasavi College of Engineering (VCE), Hyderabad", "Gokaraju Rangaraju Institute of Engineering and Technology (GRIET), Hyderabad", "Sreenidhi Institute of Science and Technology (SNIST), Hyderabad", "Mahatma Gandhi Institute of Technology (MGIT), Hyderabad", "CVR College of Engineering, Hyderabad", "Institute of Aeronautical Engineering (IARE), Hyderabad", "Kakatiya Institute of Technology & Science (KITS), Warangal", "National Institute of Technology (NIT), Warangal", "International Institute of Information Technology (IIIT), Hyderabad", "University of Hyderabad (UoH), Hyderabad", "Kakatiya University, Warangal", "Telangana University, Nizamabad", "Mahatma Gandhi University, Nalgonda", "Palamuru University, Mahabubnagar", "Satavahana University, Karimnagar"
];

const fs = require('fs');
const crypto = require('crypto');

let sql = '-- Insert Colleges\\n';

for (let name of regionalColleges) {
  const id = crypto.randomUUID();
  const code = name.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase() + Math.floor(Math.random() * 10000);
  const now = new Date().toISOString();
  // Escape single quotes for SQL
  const safeName = name.replace(/'/g, "''");
  
  sql += `INSERT INTO "College" ("id", "name", "code", "description", "createdAt", "updatedAt") VALUES ('${id}', '${safeName}', '${code}', 'A reputed institution in Andhra Pradesh / Telangana.', '${now}', '${now}');\n`;
  
  const campusId = crypto.randomUUID();
  sql += `INSERT INTO "Campus" ("id", "name", "collegeId") VALUES ('${campusId}', 'Main Campus', '${id}');\n`;
}

fs.writeFileSync('insert_colleges.sql', sql);
console.log('SQL generated.');
