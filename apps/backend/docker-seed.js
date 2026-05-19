/**
 * Standalone Database Seeder for Production Docker
 * Usage: node docker-seed.js
 */

const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');
const path = require('path');

// Entity paths from compiled dist
const entities = [
  require('./dist/entities/user.entity'),
  require('./dist/entities/profile.entity'),
  require('./dist/entities/project.entity'),
  require('./dist/entities/skill.entity'),
  require('./dist/entities/experience.entity'),
  require('./dist/entities/education.entity'),
  require('./dist/entities/timeline.entity'),
  require('./dist/entities/stat.entity'),
  require('./dist/entities/process-step.entity'),
  require('./dist/entities/site-setting.entity'),
];

const { User, UserRole } = require('./dist/entities/user.entity');
const { Profile } = require('./dist/entities/profile.entity');
const { Project, ProjectStatus } = require('./dist/entities/project.entity');
const { Skill } = require('./dist/entities/skill.entity');
const { Experience } = require('./dist/entities/experience.entity');
const { Education } = require('./dist/entities/education.entity');
const { Timeline } = require('./dist/entities/timeline.entity');
const { Stat } = require('./dist/entities/stat.entity');
const { ProcessStep } = require('./dist/entities/process-step.entity');
const { SiteSetting } = require('./dist/entities/site-setting.entity');

const allEntities = [];
entities.forEach(mod => {
  Object.values(mod).forEach(v => { if (typeof v === 'function') allEntities.push(v); });
});

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  database: process.env.DATABASE_NAME || 'portfolio',
  username: process.env.DATABASE_USER || 'portfolio',
  password: process.env.DATABASE_PASSWORD || '',
  entities: allEntities,
  synchronize: true,
});

async function seed() {
  console.log('🔌 Connecting to database...');
  await AppDataSource.initialize();
  console.log('✅ Connected');

  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(Profile);
  const projectRepo = AppDataSource.getRepository(Project);
  const skillRepo = AppDataSource.getRepository(Skill);
  const expRepo = AppDataSource.getRepository(Experience);
  const eduRepo = AppDataSource.getRepository(Education);
  const timelineRepo = AppDataSource.getRepository(Timeline);
  const statRepo = AppDataSource.getRepository(Stat);
  const stepRepo = AppDataSource.getRepository(ProcessStep);
  const settingRepo = AppDataSource.getRepository(SiteSetting);

  const adminEmail = (process.env.ADMIN_EMAIL || 'dhiko.h@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  // Check if already seeded
  const existingProfile = await profileRepo.count();
  if (existingProfile > 0) {
    console.log('✅ Database already seeded.');
    const admin = await userRepo.findOne({ where: { role: UserRole.ADMIN } });
    if (admin) {
      admin.password = await bcrypt.hash(adminPassword, 12);
      admin.email = adminEmail;
      await userRepo.save(admin);
      console.log('🔄 Admin credentials synced from ENV.');
    }
    await AppDataSource.destroy();
    process.exit(0);
  }

  console.log('🌱 Seeding database...');

  // 1. Admin User
  await userRepo.save(userRepo.create({
    email: adminEmail,
    password: await bcrypt.hash(adminPassword, 12),
    name: 'Dhiko Herlambang',
    role: UserRole.ADMIN,
  }));
  console.log('✅ Admin user created');

  // 2. Profile
  await profileRepo.save(profileRepo.create({
    fullName: 'Dhiko Herlambang',
    tagline: 'Problem Solver & Digital Systems Builder',
    summary: 'Saya percaya bahwa solusi terbaik lahir dari memahami akar masalahnya terlebih dahulu — bukan dari teknologi paling canggih. Teknologi harus menyederhanakan, bukan memperumit.\n\nDengan latar belakang Ilmu Hukum dan 9 tahun pengalaman di industri pet supplies, saya belajar bahwa setiap masalah operasional punya pola yang bisa disederhanakan dengan sistem. Dari situ, saya mulai belajar coding secara otodidak dan membangun sendiri tools yang saya butuhkan.\n\nSaya bukan orang IT. Saya adalah orang bisnis yang belajar teknologi karena butuh — dan ternyata, justru di situlah kekuatannya. Saya memahami masalah dari sudut pandang pengguna dan pelaku usaha, bukan dari sudut pandang engineer.',
    phone: '082135444441',
    email: 'dhiko.h@gmail.com',
    address: 'Jl. Cr. Soekandar Gg.1 No.5, Sananwetan, Kota Blitar, Jawa Timur',
    birthPlace: 'Blitar',
    birthDate: '1992-03-22',
    instagram: 'dhiko.h',
    github: 'dhikoh',
    heroTitle: 'Mengubah masalah nyata menjadi solusi digital yang bekerja.',
    heroSubtitle: 'Bukan programmer konvensional. Saya seorang pemecah masalah yang membangun sistem digital secara otodidak — dari logistik, edukasi anak, hingga manajemen peternakan.',
    availableText: 'Terbuka untuk kolaborasi',
    ctaText: 'Mari Berkolaborasi',
    ctaEmail: 'dhiko.h@gmail.com',
  }));
  console.log('✅ Profile created');

  // 3. Projects
  const projects = [
    { title: 'Adably', slug: 'adably', description: 'Anak cerdas adalah anak yang banyak bertanya — tapi orang tua sering kesulitan memberikan jawaban yang tepat dan sesuai dasar hukum Islam.', domain: 'adably.id', liveUrl: 'https://adably.id', tags: '["AI Content","Edukasi","Parenting","Islamic"]', featured: true, sortOrder: 1 },
    { title: 'Truck Modula', slug: 'truck-modula', description: 'Platform pemesanan truck dan derek seperti Grab, tapi untuk kebutuhan logistik dan kendaraan berat.', domain: 'truckmodula.click', liveUrl: 'https://truckmodula.click', tags: '["Logistik","Web App","Marketplace"]', featured: true, sortOrder: 2 },
    { title: 'Derekin.id', slug: 'derekin-id', description: 'Memudahkan siapa saja menemukan jasa derek terdekat dengan cepat dan transparan.', domain: 'derekin.id', liveUrl: 'https://derekin.id', tags: '["On-Demand","Automotive","Logistik"]', featured: true, sortOrder: 3 },
    { title: 'Muatin.id', slug: 'muatin-id', description: 'Menghubungkan orang yang butuh jasa angkut dengan penyedia jasa secara langsung.', domain: 'muatin.id', liveUrl: 'https://muatin.id', tags: '["Marketplace","Logistik","Jasa"]', featured: true, sortOrder: 4 },
    { title: 'PediaVet', slug: 'pediavet', description: 'Membantu kalkulasi nutrisi ternak berbasis data sehingga peternak bisa mengambil keputusan yang lebih presisi.', domain: 'nutri.pediavet.id', liveUrl: 'https://nutri.pediavet.id', tags: '["Agritech","Livestock","Data-Driven"]', featured: true, sortOrder: 5 },
    { title: 'Bentocat', slug: 'bentocat', description: 'Platform branding dan pemasaran digital untuk produk pasir kucing Bentocat.', domain: 'bentocat.id', liveUrl: 'https://bentocat.id', tags: '["E-Commerce","Branding","Pet Supplies"]', featured: true, sortOrder: 6 },
    { title: 'Zupu', slug: 'zupu', description: 'Platform digital untuk mendokumentasikan dan memvisualisasikan silsilah keluarga Tionghoa secara modern.', domain: 'zuppu.web.id', liveUrl: 'https://zuppu.web.id', tags: '["Heritage","Family","Web App"]', featured: false, sortOrder: 7 },
  ];
  for (const p of projects) {
    await projectRepo.save(projectRepo.create({ ...p, status: ProjectStatus.PUBLISHED }));
  }
  console.log('✅ Projects created');

  // 4. Skills
  const skills = [
    { name: 'Analisis & Pemecahan Masalah', category: 'expertise', level: 90, icon: 'Search', description: 'Menggali akar masalah secara mendalam sebelum mencari solusi.', sortOrder: 1 },
    { name: 'Otomasi & Efisiensi Bisnis', category: 'expertise', level: 85, icon: 'Zap', description: 'Mengubah proses manual yang berulang menjadi sistem otomatis.', sortOrder: 2 },
    { name: 'Pemanfaatan AI untuk Solusi Nyata', category: 'expertise', level: 85, icon: 'Bot', description: 'Menggunakan AI sebagai alat bantu untuk membangun sistem yang menyelesaikan masalah.', sortOrder: 3 },
    { name: 'Pengembangan Produk Digital', category: 'expertise', level: 80, icon: 'Package', description: 'Merancang dan membangun produk digital dari nol.', sortOrder: 4 },
    { name: 'Internet Marketing', category: 'technical', level: 90, icon: 'Globe', sortOrder: 5 },
    { name: 'Social Media Strategy', category: 'technical', level: 85, icon: 'Share2', sortOrder: 6 },
    { name: 'AI & Prompt Engineering', category: 'technical', level: 80, icon: 'Cpu', sortOrder: 7 },
    { name: 'Web Development', category: 'technical', level: 75, icon: 'Code', sortOrder: 8 },
    { name: 'Desain Konten & Branding', category: 'technical', level: 85, icon: 'Palette', sortOrder: 9 },
    { name: 'Manajemen Operasional', category: 'technical', level: 90, icon: 'Settings', sortOrder: 10 },
    { name: 'Analisis Data', category: 'technical', level: 75, icon: 'BarChart3', sortOrder: 11 },
    { name: 'Problem Solving', category: 'technical', level: 95, icon: 'Lightbulb', sortOrder: 12 },
  ];
  for (const s of skills) {
    await skillRepo.save(skillRepo.create(s));
  }
  console.log('✅ Skills created');

  // 5. Experiences
  const experiences = [
    { title: 'Founder & Distributor', company: 'Bentocat (Pet Supplies)', location: 'Blitar, Jawa Timur', startDate: '2017-01', current: true, description: 'Membangun dan mengelola bisnis distribusi produk pasir kucing Bentocat selama lebih dari 9 tahun.', highlights: '["Membangun jaringan distribusi 9+ tahun","Mengembangkan strategi pemasaran digital","Membangun platform e-commerce bentocat.id"]', sortOrder: 1 },
    { title: 'Digital Systems Builder', company: 'Freelance / Self-Taught', location: 'Blitar, Jawa Timur', startDate: '2020-01', current: true, description: 'Belajar coding secara otodidak dan membangun berbagai produk digital untuk menyelesaikan masalah nyata.', highlights: '["Membangun 7 produk digital secara otodidak","Adably - Platform edukasi Islami berbasis AI","Truck Modula - Platform logistik on-demand"]', sortOrder: 2 },
    { title: 'Magang Notaris', company: 'Kantor Notaris', location: 'Solo, Jawa Tengah', startDate: '2016-06', endDate: '2017-06', current: false, description: 'Magang di kantor notaris setelah lulus kuliah S1 Ilmu Hukum.', highlights: '["Membantu proses administrasi legal","Mempelajari dokumentasi hukum"]', sortOrder: 3 },
  ];
  for (const e of experiences) {
    await expRepo.save(expRepo.create(e));
  }
  console.log('✅ Experiences created');

  // 6. Education
  await eduRepo.save(eduRepo.create({
    degree: 'S1 Ilmu Hukum',
    institution: 'Universitas Muhammadiyah Surakarta',
    year: 2016,
    description: 'Lulus dari Fakultas Hukum dengan pemahaman mendalam tentang regulasi, analisis kasus, dan pemecahan masalah sistematis.',
    sortOrder: 1,
  }));
  console.log('✅ Education created');

  // 7. Timeline
  const timelines = [
    { year: '2016', title: 'Lulus S1 Ilmu Hukum', description: 'Menyelesaikan pendidikan S1 Ilmu Hukum di UMS.', sortOrder: 1 },
    { year: '2017', title: 'Memulai Bisnis Pet Supplies', description: 'Memulai distribusi produk pasir kucing Bentocat.', sortOrder: 2 },
    { year: '2020', title: 'Belajar Coding Otodidak', description: 'Mulai belajar programming secara otodidak.', sortOrder: 3 },
    { year: '2023', title: 'Meluncurkan Ekosistem Logistik', description: 'Truck Modula, Derekin.id, dan Muatin.id.', sortOrder: 4 },
    { year: '2024', title: 'Integrasi AI dalam Produk', description: 'Membangun Adably dan meluncurkan PediaVet.', sortOrder: 5 },
    { year: '2025', title: '7 Produk Digital Aktif', description: 'Mengelola 7 produk digital secara bersamaan.', sortOrder: 6 },
  ];
  for (const t of timelines) {
    await timelineRepo.save(timelineRepo.create(t));
  }
  console.log('✅ Timeline created');

  // 8. Stats
  const stats = [
    { label: 'Tahun Pengalaman Bisnis', value: '9+', icon: 'TrendingUp', sortOrder: 1 },
    { label: 'Produk Digital Dibangun', value: '7', icon: 'Package', sortOrder: 2 },
    { label: 'Self-Taught Builder', value: 'Otodidak', icon: 'GraduationCap', sortOrder: 3 },
  ];
  for (const s of stats) {
    await statRepo.save(statRepo.create(s));
  }
  console.log('✅ Stats created');

  // 9. Process Steps
  const steps = [
    { number: '01', title: 'Identifikasi Masalah', description: 'Mengamati dan memahami masalah dari sudut pandang pengguna.', sortOrder: 1 },
    { number: '02', title: 'Riset & Perancangan', description: 'Mempelajari solusi yang ada dan merancang sistem yang realistis.', sortOrder: 2 },
    { number: '03', title: 'Bangun & Iterasi', description: 'Membangun solusi secara bertahap dan menguji langsung.', sortOrder: 3 },
    { number: '04', title: 'Evaluasi & Penyempurnaan', description: 'Memastikan sistem stabil dan terus menyempurnakan.', sortOrder: 4 },
  ];
  for (const s of steps) {
    await stepRepo.save(stepRepo.create(s));
  }
  console.log('✅ Process steps created');

  // 10. Site Settings
  const settings = [
    { key: 'site_title', value: 'Dhiko Herlambang | Problem Solver & Digital Systems Builder' },
    { key: 'site_description', value: 'Portfolio Dhiko Herlambang — Pemecah masalah yang membangun sistem digital secara otodidak.' },
    { key: 'footer_text', value: `© ${new Date().getFullYear()} Dhiko Herlambang. All rights reserved.` },
    { key: 'whatsapp_number', value: '6282135444441' },
    { key: 'whatsapp_message', value: 'Halo Dhiko, saya tertarik untuk berkolaborasi.' },
  ];
  for (const s of settings) {
    await settingRepo.save(settingRepo.create(s));
  }
  console.log('✅ Site settings created');

  await AppDataSource.destroy();
  console.log('🎉 Seeding selesai!');
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
