import { db } from '../src/lib/db';

async function createSamplePOs() {
  try {
    console.log('Creating sample Program Outcomes...');

    // Get the first program
    const program = await db.program.findFirst();
    
    if (!program) {
      console.error('No program found. Please seed the database first.');
      return;
    }

    console.log(`Using program: ${program.name} (${program.code})`);

    // Create sample POs
    const pos = await Promise.all([
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO1',
          description: 'Engineering knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO2',
          description: 'Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO3',
          description: 'Design/development of solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO4',
          description: 'Conduct investigations of complex problems: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO5',
          description: 'Modern tool usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO6',
          description: 'The engineer and society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO7',
          description: 'Environment and sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO8',
          description: 'Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO9',
          description: 'Individual and team work: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO10',
          description: 'Communication: Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO11',
          description: 'Project management and finance: Demonstrate knowledge and understanding of the engineering and management principles and apply these to one\'s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.'
        }
      }),
      db.pO.create({
        data: {
          programId: program.id,
          code: 'PO12',
          description: 'Life-long learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.'
        }
      })
    ]);

    console.log(`✅ Created ${pos.length} Program Outcomes`);
    console.log('\n📝 Created POs:');
    pos.forEach(po => {
      console.log(`   ${po.code}: ${po.description.substring(0, 80)}...`);
    });

    console.log('\n🔗 POs are now available for CO-PO mapping in the course management page.');

  } catch (error) {
    console.error('Error creating sample POs:', error);
  }
}

createSamplePOs();