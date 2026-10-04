import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const siteProfile = {
  id:1,
  name:'Wallace Wambugu',
  role:'BSc Information Technology student and software developer in training',
  location:'Kenya',
  university:'Kirinyaga University',
  studyPeriod:'2024 – Present',
  email:'wallacewambugu174@gmail.com',
  githubProfile:'https://github.com/wallace-del',
  githubRepo:'https://github.com/wallace-del/portfolio-website',
  linkedin:'https://www.linkedin.com/in/wallace-githae-53894242a',
  aboutHeadline:'Learning by building systems that can be inspected.',
  aboutText:'I am a BSc Information Technology student focused on turning what I learn into practical software, information systems and digital tools. My portfolio is intentionally evidence-based: completed work is shown as completed, work in progress is labelled clearly, and future ideas remain future ideas.',
  heroFocus:['Web Development','Information Systems','Databases','IT Solutions','AI-assisted Products'],
  currentlyDeveloping:['Web Development','Databases','Networking','Graphic Design','Video Editing','Data Annotation','Cloud Fundamentals','Cybersecurity Fundamentals'],
  skillGroups:[
    {title:'Programming & Markup',items:['HTML','CSS','JavaScript','SQL','Java','C++']},
    {title:'Development Tools',items:['Git','GitHub','VS Code','Android Studio']},
    {title:'Databases',items:['SQL','MySQL','MS Access','Data Modelling']},
    {title:'Systems',items:['Networking','Windows','Linux','IT Support']},
    {title:'Currently Exploring',items:['Cloud','Cybersecurity','AI','Automation','DevOps']}
  ],
  learningGroups:[
    {state:'CURRENT',title:'Building foundations through practice',items:['Software Development','Databases','Networking']},
    {state:'STRENGTHENING',title:'Deepening practical capability',items:['Web Development','Programming','Information Systems']},
    {state:'EXPLORING',title:'Expanding into emerging areas',items:['Cybersecurity','Cloud','AI & Automation','DevOps']}
  ],
  availability:['Internships','IT Attachments','Junior Development Opportunities','Freelance Projects','Remote Opportunities','Technical Collaborations'],
  languages:['English','Swahili','Arabic']
};

const seedProjects = [
  { slug:'wallace-dev', name:'WALLACE.DEV', status:'LIVE', featured:true, technologies:['HTML','CSS','JavaScript','Node.js','PostgreSQL','Docker'], text:'WALLACE.DEV is Wallace’s live personal technology portfolio. It is built with HTML, CSS and JavaScript and is designed around real project evidence, honest project statuses, accessibility and responsive design.', path:'/projects/wallace-dev.html', sortOrder:10 },
  { slug:'remote-income-match', name:'Remote Income Match™', status:'IN DEVELOPMENT', featured:true, technologies:['Web Development','Databases','AI-assisted Product Design'], text:'Remote Income Match™ is an active personal software/digital-platform project intended to help users discover remote-income opportunities that fit factors such as skills, experience, location, availability, equipment, payment options and goals.', path:'/projects/remote-income-match.html', sortOrder:20 },
  { slug:'expense-tracker', name:'Expense Tracker', status:'DESIGN COMPLETE', featured:true, technologies:['UI/UX','JavaScript','Database Design'], text:'Expense Tracker currently has a completed interface design and is awaiting implementation. The intended application records, categorizes, monitors and analyzes income and expenses.', path:'/projects/expense-tracker.html', sortOrder:30 },
  { slug:'hospital-management', name:'Hospital Management System', status:'DESIGN COMPLETE', text:'Hospital Management System currently has a completed system/interface design and is awaiting implementation. Planned areas include patient, staff, appointment, medical-record, billing, pharmacy, reporting and access-management workflows.', path:'/projects/hospital-management.html', sortOrder:40 },
  { slug:'mobile-app', name:'Mobile App', status:'DESIGN COMPLETE', text:'The Mobile App project is currently presented as design complete. Implementation details will be treated as verified only when the working build is documented.', path:'/projects/mobile-app.html', sortOrder:50 },
  { slug:'database-system', name:'Database System', status:'DESIGN COMPLETE', text:'The Database System project is currently at the design stage and is intended to become evidence for schema, relationships, constraints and tested SQL queries.', path:'/projects/database-system.html', sortOrder:60 }
];

async function main() {
  await prisma.siteProfile.upsert({ where:{ id:1 }, update:{}, create:siteProfile });
  for (const project of seedProjects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project
    });
  }

  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || password.length < 12) {
    console.warn('Admin was not seeded. Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters, then run npm run seed again.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash }
  });
  console.log(`Admin user ready: ${email}`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
