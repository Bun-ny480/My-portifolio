import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  /* ---------- Profile singleton ---------- */
  await prisma.profile.upsert({
    where: { id: "singleton" },
    update: {
      fullName: "Dieu Aime",
      avatarUrl: "/profile.png",
      headline: "Full-Stack Software Developer",
      bio: "I build reliable web applications end-to-end — from database schema to polished UI.",
      email: "dieuaime480@gmail.com",
      phone: "+250790382205",
      whatsapp: "+250790382205",
      location: "Rwanda",
      mission: "My mission is to use software engineering and digital creativity to transform real-world challenges into meaningful technological solutions.",
      vision: "To contribute to a future where technology makes everyday activities more productive, connected, efficient, and accessible.",
      philosophy: "Clarity in code, empathy in design, and a steady focus on the people who depend on the software.",
    },
    create: {
      id: "singleton",
      fullName: "Dieu Aime",
      avatarUrl: "/profile.png",
      headline: "Full-Stack Software Developer",
      bio: "I build reliable web applications end-to-end — from database schema to polished UI.",
      email: "dieuaime480@gmail.com",
      phone: "+250790382205",
      whatsapp: "+250790382205",
      location: "Rwanda",
      mission: "My mission is to use software engineering and digital creativity to transform real-world challenges into meaningful technological solutions.",
      vision: "To contribute to a future where technology makes everyday activities more productive, connected, efficient, and accessible.",
      philosophy: "Clarity in code, empathy in design, and a steady focus on the people who depend on the software.",
    },
  });

  /* ---------- Socials ---------- */
  await prisma.socialLink.deleteMany();
  await prisma.socialLink.createMany({
    data: [
      { label: "GitHub",    url: "https://github.com/Bun-ny480", icon: "github",    order: 1 },
      { label: "LinkedIn", url: "https://www.linkedin.com/feed/", icon: "linkedin", order: 2 },
      { label: "Instagram", url: "https://www.instagram.com/__b.a.v.a.r.d__/", icon: "instagram", order: 3 },
      { label: "Facebook", url: "https://www.facebook.com", icon: "facebook", order: 4 },
      { label: "Gmail",    url: "https://mail.google.com/mail/?view=cm&fs=1&to=dieuaime480@gmail.com", icon: "mail", order: 5 },
    ],
  });

  /* ---------- Skills ---------- */
  const frontend = await prisma.skillCategory.upsert({
    where: { name: "Frontend" }, update: {}, create: { name: "Frontend", order: 1 },
  });
  const backend = await prisma.skillCategory.upsert({
    where: { name: "Backend" }, update: {}, create: { name: "Backend", order: 2 },
  });
  const tools = await prisma.skillCategory.upsert({
    where: { name: "Tools & DevOps" }, update: {}, create: { name: "Tools & DevOps", order: 3 },
  });

  await prisma.skill.deleteMany({});
  await prisma.skill.createMany({
    data: [
      { name: "React",       categoryId: frontend.id, order: 1, proficiency: "expert" },
      { name: "TypeScript",  categoryId: frontend.id, order: 2, proficiency: "expert" },
      { name: "Tailwind",    categoryId: frontend.id, order: 3, proficiency: "advanced" },
      { name: "Node.js",     categoryId: backend.id,  order: 1, proficiency: "expert" },
      { name: "Express",     categoryId: backend.id,  order: 2, proficiency: "expert" },
      { name: "PostgreSQL",  categoryId: backend.id,  order: 3, proficiency: "advanced" },
      { name: "Prisma",      categoryId: backend.id,  order: 4, proficiency: "advanced" },
      { name: "Redis",       categoryId: tools.id,    order: 1, proficiency: "advanced" },
      { name: "Docker",      categoryId: tools.id,    order: 2, proficiency: "intermediate" },
      { name: "Linux",       categoryId: tools.id,    order: 3, proficiency: "advanced" },
    ],
  });

  /* ---------- Services ---------- */
  await prisma.service.deleteMany({});
  await prisma.service.createMany({
    data: [
      {
        title: "Web Application Development",
        slug: "web-app-development",
        description: "Full-stack web apps — auth, dashboards, APIs — built to last.",
        deliverables: ["Architecture", "Backend + frontend", "Deployment"],
        technologies: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        priceFrom: 800,
        icon: "code",
        order: 1,
      },
      {
        title: "API Design & Integration",
        slug: "api-design",
        description: "REST APIs, database schemas, third-party integrations.",
        deliverables: ["OpenAPI spec", "Implementation", "Tests"],
        technologies: ["Node.js", "Prisma", "PostgreSQL"],
        priceFrom: 500,
        icon: "plug",
        order: 2,
      },
      {
        title: "Technical Consulting",
        slug: "consulting",
        description: "Architecture reviews, performance audits, code walkthroughs.",
        deliverables: ["Report", "Action plan"],
        technologies: ["TypeScript", "Docker", "CI/CD"],
        priceFrom: 200,
        icon: "compass",
        order: 3,
      },
    ],
  });

  /* ---------- Project categories + technologies ---------- */
  const webCat = await prisma.projectCategory.upsert({
    where: { slug: "web" }, update: {}, create: { name: "Web", slug: "web", order: 1 },
  });
  const toolsCat = await prisma.projectCategory.upsert({
    where: { slug: "tools" }, update: {}, create: { name: "Tools", slug: "tools", order: 2 },
  });

  const ts   = await prisma.technology.upsert({ where: { name: "TypeScript" }, update: {}, create: { name: "TypeScript" } });
  const re   = await prisma.technology.upsert({ where: { name: "React" },      update: {}, create: { name: "React" } });
  const no   = await prisma.technology.upsert({ where: { name: "Node.js" },    update: {}, create: { name: "Node.js" } });
  const pg   = await prisma.technology.upsert({ where: { name: "PostgreSQL" }, update: {}, create: { name: "PostgreSQL" } });
  const prs  = await prisma.technology.upsert({ where: { name: "Prisma" },     update: {}, create: { name: "Prisma" } });

  /* ---------- Projects ---------- */
  await prisma.project.deleteMany({});
  const project1 = await prisma.project.create({
    data: {
      title: "Developer Portfolio",
      slug: "developer-portfolio",
      description: "A full-stack portfolio with an admin dashboard, contact system and blog.",
      features: ["Admin dashboard", "Blog CMS", "Contact form with honeypot", "Session auth"],
      featured: true,
      published: true,
      completedAt: new Date("2025-01-15"),
      categoryId: webCat.id,
      technologies: {
        create: [{ technologyId: ts.id }, { technologyId: re.id }, { technologyId: no.id }, { technologyId: pg.id }],
      },
    },
  });
  await prisma.project.create({
    data: {
      title: "CLI Task Manager",
      slug: "cli-task-manager",
      description: "Terminal-first task tracker with sync via a lightweight REST API.",
      features: ["Offline-first", "REST sync", "Export to JSON"],
      published: true,
      categoryId: toolsCat.id,
      technologies: {
        create: [{ technologyId: no.id }, { technologyId: prs.id }],
      },
    },
  });
  await prisma.projectImage.create({
    data: { projectId: project1.id, url: "/uploads/placeholder-cover.png", alt: "Portfolio cover", order: 0, isCover: true },
  });

  /* ---------- Experience / Education / Certifications ---------- */
  await prisma.experience.deleteMany({});
  await prisma.experience.create({
    data: {
      title: "Full-Stack Developer",
      organization: "Freelance",
      startDate: new Date("2023-01-01"),
      description: "Building web apps for small businesses across East Africa.",
      order: 1,
    },
  });

  await prisma.education.deleteMany({});
  await prisma.education.create({
    data: {
      institution: "University of Rwanda",
      degree: "BSc Computer Science",
      startDate: new Date("2020-09-01"),
      endDate: new Date("2024-06-30"),
      order: 1,
    },
  });

  await prisma.certification.deleteMany({});
  await prisma.certification.create({
    data: { name: "Meta Back-End Developer", issuer: "Coursera", issuedAt: new Date("2024-02-01") },
  });

  /* ---------- Bootstrap admin user ---------- */
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminPassword.length >= 12) {
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: "Dieu Aime",
        passwordHash: await hashPassword(adminPassword),
        role: "ADMIN",
      },
    });
    console.log(`✓ admin user ensured: ${adminEmail}`);
  } else {
    console.warn("⚠ ADMIN_EMAIL / ADMIN_PASSWORD missing or too short — admin not seeded");
  }

  console.log("✓ seed complete");
}

main()
  .catch((e) => {
    console.error("seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
