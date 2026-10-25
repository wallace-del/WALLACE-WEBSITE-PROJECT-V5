
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projectUpdates = [
  {
    slug: 'wallace-dev',
    data: {
      text:
        'WALLACE.DEV is Wallace’s live personal technology portfolio. The public-facing website uses HTML, CSS and JavaScript. Its backend uses Node.js and Express, accesses PostgreSQL through Prisma, and can be run with Docker. The portfolio presents project case studies, project statuses and development evidence, with attention to responsive design and accessibility.',
      technologies: [
        'HTML',
        'CSS',
        'JavaScript',
        'Node.js',
        'Express',
        'Prisma',
        'PostgreSQL',
        'Docker'
      ]
    }
  },
  {
    slug: 'remote-income-match',
    data: {
      text:
        'Remote Income Match™ is an active software product in development intended to help users evaluate remote-income opportunities that fit factors such as skills, experience, location, availability, equipment, payment options and goals. Its current development codebase uses Next.js, React and TypeScript. Specific features and matching behaviour should be described as implemented only when verified in the current build and tests.',
      technologies: [
        'Next.js',
        'React',
        'TypeScript'
      ]
    }
  }
];

async function main() {
  await prisma.$transaction(async transaction => {
    for (const item of projectUpdates) {
      const existingProject = await transaction.project.findUnique({
        where: {
          slug: item.slug
        }
      });

      if (!existingProject) {
        throw new Error(
          `Project not found: ${item.slug}. No project data should be guessed.`
        );
      }

      await transaction.project.update({
        where: {
          slug: item.slug
        },
        data: item.data
      });

      console.log(`Updated project facts: ${existingProject.name}`);
    }
  });

  console.log('Project facts updated successfully.');
  console.log('Project statuses and other project fields were preserved.');
}

main()
  .catch(error => {
    console.error('Failed to update project facts:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
