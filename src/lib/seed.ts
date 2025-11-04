import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

async function seed() {
  try {
    // Create colleges
    const colleges = await Promise.all([
      db.college.create({
        data: {
          name: 'CUIET',
          code: 'CUIET',
          description: 'College of Engineering and Technology',
        },
      }),
      db.college.create({
        data: {
          name: 'CBS',
          code: 'CBS',
          description: 'College of Business Studies',
        },
      }),
      db.college.create({
        data: {
          name: 'CCP',
          code: 'CCP',
          description: 'College of Pharmacy',
        },
      }),
    ]);

    // Create departments
    const departments = await Promise.all([
      db.department.create({
        data: {
          name: 'Computer Engineering',
          code: 'CS',
          collegeId: colleges[0].id,
        },
      }),
      db.department.create({
        data: {
          name: 'Electronics Engineering',
          code: 'ECE',
          collegeId: colleges[0].id,
        },
      }),
      db.department.create({
        data: {
          name: 'Business Administration',
          code: 'BA',
          collegeId: colleges[1].id,
        },
      }),
      db.department.create({
        data: {
          name: 'Pharmacy',
          code: 'PHARM',
          collegeId: colleges[2].id,
        },
      }),
    ]);

    // Create programs
    const programs = await Promise.all([
      // CUIET Programs
      db.program.create({
        data: {
          name: 'BE ME',
          code: 'BEME',
          collegeId: colleges[0].id,
          departmentId: departments[0].id,
          duration: 4,
        },
      }),
      db.program.create({
        data: {
          name: 'BE ECE',
          code: 'BEECE',
          collegeId: colleges[0].id,
          departmentId: departments[1].id,
          duration: 4,
        },
      }),
      // CBS Programs
      db.program.create({
        data: {
          name: 'BBA',
          code: 'BBA',
          collegeId: colleges[1].id,
          departmentId: departments[2].id,
          duration: 3,
        },
      }),
      db.program.create({
        data: {
          name: 'MBA Global',
          code: 'MBA',
          collegeId: colleges[1].id,
          departmentId: departments[2].id,
          duration: 2,
        },
      }),
      // CCP Programs
      db.program.create({
        data: {
          name: 'B. Pharma',
          code: 'BPHARMA',
          collegeId: colleges[2].id,
          departmentId: departments[3].id,
          duration: 3,
        },
      }),
      db.program.create({
        data: {
          name: 'M. Pharma',
          code: 'MPHARMA',
          collegeId: colleges[2].id,
          departmentId: departments[3].id,
          duration: 2,
        },
      }),
    ]);

    // Create batches
    const batches = await Promise.all([
      // BEME Batches
      db.batch.create({
        data: {
          name: '2020-2024',
          programId: programs[0].id,
          startYear: 2020,
          endYear: 2024,
        },
      }),
      db.batch.create({
        data: {
          name: '2021-2025',
          programId: programs[0].id,
          startYear: 2021,
          endYear: 2025,
        },
      }),
      // BEECE Batches
      db.batch.create({
        data: {
          name: '2020-2024',
          programId: programs[1].id,
          startYear: 2020,
          endYear: 2024,
        },
      }),
      db.batch.create({
        data: {
          name: '2021-2025',
          programId: programs[1].id,
          startYear: 2021,
          endYear: 2025,
        },
      }),
      // BBA Batches
      db.batch.create({
        data: {
          name: '2021-2024',
          programId: programs[2].id,
          startYear: 2021,
          endYear: 2024,
        },
      }),
      db.batch.create({
        data: {
          name: '2022-2025',
          programId: programs[2].id,
          startYear: 2022,
          endYear: 2025,
        },
      }),
    ]);

    // Create users
    const hashedPassword = await hashPassword('password123');

    await Promise.all([
      // Admin
      db.user.create({
        data: {
          email: 'admin@obeportal.com',
          password: hashedPassword,
          name: 'System Administrator',
          role: 'ADMIN',
        },
      }),
      // University
      db.user.create({
        data: {
          email: 'university@obeportal.com',
          password: hashedPassword,
          name: 'University Admin',
          role: 'UNIVERSITY',
        },
      }),
      // Department users
      db.user.create({
        data: {
          email: 'cse@obeportal.com',
          password: hashedPassword,
          name: 'CSE Department Head',
          role: 'DEPARTMENT',
          collegeId: colleges[0].id,
          departmentId: departments[0].id,
        },
      }),
      db.user.create({
        data: {
          email: 'business@obeportal.com',
          password: hashedPassword,
          name: 'Business Department Head',
          role: 'DEPARTMENT',
          collegeId: colleges[1].id,
          departmentId: departments[2].id,
        },
      }),
      // Program Coordinators
      db.user.create({
        data: {
          email: 'pc.beme@obeportal.com',
          password: hashedPassword,
          name: 'BE ME Program Coordinator',
          role: 'PROGRAM_COORDINATOR',
          collegeId: colleges[0].id,
          programId: programs[0].id,
        },
      }),
      db.user.create({
        data: {
          email: 'pc.bba@obeportal.com',
          password: hashedPassword,
          name: 'BBA Program Coordinator',
          role: 'PROGRAM_COORDINATOR',
          collegeId: colleges[1].id,
          programId: programs[2].id,
        },
      }),
      // Teachers
      db.user.create({
        data: {
          email: 'teacher1@obeportal.com',
          password: hashedPassword,
          name: 'John Teacher',
          role: 'TEACHER',
          collegeId: colleges[0].id,
          programId: programs[0].id,
        },
      }),
      db.user.create({
        data: {
          email: 'teacher2@obeportal.com',
          password: hashedPassword,
          name: 'Jane Teacher',
          role: 'TEACHER',
          collegeId: colleges[1].id,
          programId: programs[2].id,
        },
      }),
    ]);

    console.log('Database seeded successfully!');
    console.log('Login credentials:');
    console.log('Admin: admin@obeportal.com / password123');
    console.log('University: university@obeportal.com / password123');
    console.log('Department (CSE): cse@obeportal.com / password123');
    console.log('Department (Business): business@obeportal.com / password123');
    console.log('PC (BE ME): pc.beme@obeportal.com / password123');
    console.log('PC (BBA): pc.bba@obeportal.com / password123');
    console.log('Teacher: teacher1@obeportal.com / password123');
    console.log('Teacher: teacher2@obeportal.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();