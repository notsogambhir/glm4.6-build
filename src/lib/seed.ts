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

    // Create departments - one department per college with same name as college
    const departments = await Promise.all([
      db.department.create({
        data: {
          name: 'CUIET',
          code: 'CUIET',
          collegeId: colleges[0].id,
        },
      }),
      db.department.create({
        data: {
          name: 'CBS',
          code: 'CBS',
          collegeId: colleges[1].id,
        },
      }),
      db.department.create({
        data: {
          name: 'CCP',
          code: 'CCP',
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
          departmentId: departments[0].id, // CUIET department
          duration: 4,
        },
      }),
      db.program.create({
        data: {
          name: 'BE ECE',
          code: 'BEECE',
          collegeId: colleges[0].id,
          departmentId: departments[0].id, // CUIET department
          duration: 4,
        },
      }),
      // CBS Programs
      db.program.create({
        data: {
          name: 'BBA',
          code: 'BBA',
          collegeId: colleges[1].id,
          departmentId: departments[1].id, // CBS department
          duration: 3,
        },
      }),
      db.program.create({
        data: {
          name: 'MBA Global',
          code: 'MBA',
          collegeId: colleges[1].id,
          departmentId: departments[1].id, // CBS department
          duration: 2,
        },
      }),
      // CCP Programs
      db.program.create({
        data: {
          name: 'B. Pharma',
          code: 'BPHARMA',
          collegeId: colleges[2].id,
          departmentId: departments[2].id, // CCP department
          duration: 3,
        },
      }),
      db.program.create({
        data: {
          name: 'M. Pharma',
          code: 'MPHARMA',
          collegeId: colleges[2].id,
          departmentId: departments[2].id, // CCP department
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

    // Create Program Outcomes (POs) for each program
    const pos = await Promise.all([
      // BEME POs
      ...['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'].map((code, index) => 
        db.pO.create({
          data: {
            programId: programs[0].id,
            code,
            description: [
              'Engineering knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.',
              'Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.',
              'Design/development of solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.',
              'Conduct investigations of complex problems: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.',
              'Modern tool usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.',
              'The engineer and society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.',
              'Environment and sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.',
              'Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.',
              'Individual and team work: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.',
              'Communication: Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.',
              'Project management and finance: Demonstrate knowledge and understanding of the engineering and management principles and apply these to one\'s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.',
              'Life-long learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.'
            ][index],
          },
        })
      ),
      // BBA POs
      ...['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'].map((code, index) => 
        db.pO.create({
          data: {
            programId: programs[2].id,
            code,
            description: [
              'Business Knowledge: Apply fundamental knowledge of business administration, management principles, and economic theories to solve business problems.',
              'Critical Thinking: Analyze complex business situations, evaluate alternatives, and make informed decisions using appropriate analytical tools.',
              'Communication Skills: Communicate effectively in various business contexts using oral, written, and digital communication methods.',
              'Leadership and Teamwork: Demonstrate leadership qualities and work effectively in teams to achieve organizational goals.',
              'Ethical Responsibility: Apply ethical principles and social responsibility in business decision-making and professional conduct.',
              'Global Perspective: Understand and analyze business issues in a global context with awareness of cultural diversity and international business practices.'
            ][index],
          },
        })
      ),
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
          email: 'cuiet@obeportal.com',
          password: hashedPassword,
          name: 'CUIET Department Head',
          role: 'DEPARTMENT',
          collegeId: colleges[0].id,
          departmentId: departments[0].id, // CUIET department
        },
      }),
      db.user.create({
        data: {
          email: 'cbs@obeportal.com',
          password: hashedPassword,
          name: 'CBS Department Head',
          role: 'DEPARTMENT',
          collegeId: colleges[1].id,
          departmentId: departments[1].id, // CBS department
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
    console.log('Department (CUIET): cuiet@obeportal.com / password123');
    console.log('Department (CBS): cbs@obeportal.com / password123');
    console.log('PC (BE ME): pc.beme@obeportal.com / password123');
    console.log('PC (BBA): pc.bba@obeportal.com / password123');
    console.log('Teacher: teacher1@obeportal.com / password123');
    console.log('Teacher: teacher2@obeportal.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();