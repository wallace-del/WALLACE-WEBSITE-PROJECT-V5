import { prisma } from '../db.js';

export const fallbackProfile = {
  id: 1,
  name: 'Wallace Wambugu',
  role: 'BSc Information Technology student and software developer in training',
  location: 'Kenya',
  university: 'Kirinyaga University',
  studyPeriod: '2024 – Present',
  email: 'wallacewambugu174@gmail.com',
  githubProfile: 'https://github.com/wallace-del',
  githubRepo: 'https://github.com/wallace-del/portfolio-website',
  linkedin: 'https://www.linkedin.com/in/wallace-githae-53894242a',
  aboutHeadline: 'Learning by building systems that can be inspected.',
  aboutText: 'I am a BSc Information Technology student focused on turning what I learn into practical software, information systems and digital tools. My portfolio is intentionally evidence-based: completed work is shown as completed, work in progress is labelled clearly, and future ideas remain future ideas.',
  heroFocus: ['Web Development','Information Systems','Databases','IT Solutions','AI-assisted Products'],
  currentlyDeveloping: ['Web Development','Databases','Networking','Graphic Design','Video Editing','Data Annotation','Cloud Fundamentals','Cybersecurity Fundamentals'],
  skillGroups: [
    { title:'Programming & Markup', items:['HTML','CSS','JavaScript','SQL','Java','C++'] },
    { title:'Development Tools', items:['Git','GitHub','VS Code','Android Studio'] },
    { title:'Databases', items:['SQL','MySQL','MS Access','Data Modelling'] },
    { title:'Systems', items:['Networking','Windows','Linux','IT Support'] },
    { title:'Currently Exploring', items:['Cloud','Cybersecurity','AI','Automation','DevOps'] }
  ],
  learningGroups: [
    { state:'CURRENT', title:'Building foundations through practice', items:['Software Development','Databases','Networking'] },
    { state:'STRENGTHENING', title:'Deepening practical capability', items:['Web Development','Programming','Information Systems'] },
    { state:'EXPLORING', title:'Expanding into emerging areas', items:['Cybersecurity','Cloud','AI & Automation','DevOps'] }
  ],
  availability: ['Internships','IT Attachments','Junior Development Opportunities','Freelance Projects','Remote Opportunities','Technical Collaborations'],
  languages: ['English','Swahili','Arabic']
};

const link = (label, href) => ({ label, href });
const response = (text, links=[]) => ({ text, links });
const flatten = groups => Array.isArray(groups) ? groups.flatMap(g => Array.isArray(g?.items) ? g.items : []) : [];

export async function answerPortfolioQuestion(raw) {
  const q = String(raw || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9+#.\s-]/g,' ').replace(/\s+/g,' ').trim();
  if (!q) return response('Ask me about Wallace’s projects, technologies, learning journey, availability, GitHub, education or contact details.');

  const [stored, projects] = await Promise.all([
    prisma.siteProfile.findUnique({ where:{ id:1 } }),
    prisma.project.findMany({ orderBy:[{ sortOrder:'asc' },{ id:'asc' }] })
  ]);
  const profile = stored || fallbackProfile;

  for (const p of projects) {
    const terms = [p.name.toLowerCase(), p.slug.replaceAll('-', ' ')];
    if (terms.some(t => t && q.includes(t))) return response(`${p.text} Status: ${p.status}.`, [link(`View ${p.name}`, p.path)]);
  }

  if (/projects?|built|portfolio work/.test(q)) {
    if (!projects.length) return response('No verified projects are currently published.');
    return response(`Wallace’s portfolio currently highlights ${projects.length} verified projects: ${projects.map(p => `${p.name} (${p.status})`).join(', ')}.`, [link('Explore all projects','/projects.html')]);
  }
  if (/technology|technologies|tech stack|programming|language|tools|skills?/.test(q)) {
    const tech = flatten(profile.skillGroups);
    return response(`Verified technologies and skill areas currently listed are: ${tech.join(', ')}.`, [link('See skills','/#skills')]);
  }
  if (/available|availability|internship|freelance|hire|opportunit|attachment/.test(q)) return response(`Wallace is currently open to ${(profile.availability || []).join(', ')}.`, [link('Contact Wallace','/#contact')]);
  if (/github|repository|repo/.test(q)) return response('Wallace’s verified GitHub profile and portfolio repository are linked from WALLACE.DEV.', [link('GitHub profile',profile.githubProfile), link('Portfolio repository',profile.githubRepo)]);
  if (/learning|currently learn|studying|exploring/.test(q)) return response(`Wallace’s current learning areas include: ${flatten(profile.learningGroups).join(', ')}.`, [link('Learning journey','/#learning')]);
  if (/contact|email|linkedin|reach/.test(q)) return response(`You can contact Wallace by email at ${profile.email}, through GitHub, or through LinkedIn.`, [link('Email',`mailto:${profile.email}`), link('LinkedIn',profile.linkedin), link('GitHub',profile.githubProfile)]);
  if (/education|university|degree|student|who is|about wallace/.test(q)) return response(`${profile.name} is a ${profile.role} at ${profile.university} in ${profile.location}, studying from ${profile.studyPeriod}.`, [link('About Wallace','/#about')]);
  if (/database/.test(q)) {
    const matches = projects.filter(p => /database|hospital/i.test(`${p.name} ${p.text}`)).slice(0,2);
    if (matches.length) return response(`For database-related work, look at ${matches.map(p=>p.name).join(' and ')}.`, matches.map(p=>link(p.name,p.path)));
  }
  return response('I only answer from verified information stored in the WALLACE.DEV backend. Try asking about projects, technologies, learning, education, availability, GitHub or contact details.');
}
