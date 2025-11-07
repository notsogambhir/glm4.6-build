import { db } from '@/lib/db';

export interface StudentCOAttainment {
  studentId: string;
  studentName: string;
  coId: string;
  coCode: string;
  percentage: number;
  metTarget: boolean;
  totalObtainedMarks: number;
  totalMaxMarks: number;
}

export interface ClassCOAttainment {
  coId: string;
  coCode: string;
  coDescription: string;
  totalStudents: number;
  studentsMeetingTarget: number;
  percentageMeetingTarget: number;
  attainmentLevel: number; // 0, 1, 2, or 3
  targetPercentage: number;
  level1Threshold: number;
  level2Threshold: number;
  level3Threshold: number;
}

export interface COAttainmentSummary {
  courseId: string;
  courseName: string;
  courseCode: string;
  targetPercentage: number;
  level1Threshold: number;
  level2Threshold: number;
  level3Threshold: number;
  totalStudents: number;
  coAttainments: ClassCOAttainment[];
  studentAttainments: StudentCOAttainment[];
  calculatedAt: Date;
}

export class COAttainmentCalculator {
  /**
   * Step 1: Calculate a Single Student's Attainment for a Single CO
   */
  static async calculateStudentCOAttainment(
    courseId: string,
    coId: string,
    studentId: string
  ): Promise<StudentCOAttainment | null> {
    try {
      // Get all questions mapped to this specific CO
      const questions = await db.question.findMany({
        where: {
          coMappings: {
            some: {
              coId: coId
            }
          },
          assessment: {
            courseId: courseId
          }
        },
        include: {
          assessment: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (questions.length === 0) {
        console.log(`No questions found for CO ${coId} in course ${courseId}`);
        return null;
      }

      // Get student's submitted marks for these questions
      // Note: This assumes we have a student submission/marks table
      // For now, we'll simulate this data structure
      const studentMarks = await this.getStudentMarksForQuestions(
        studentId,
        questions.map(q => q.id)
      );

      if (studentMarks.length === 0) {
        console.log(`No marks found for student ${studentId} for CO ${coId} questions`);
        return null;
      }

      // Calculate total obtained and maximum marks
      let totalObtainedMarks = 0;
      let totalMaxMarks = 0;

      questions.forEach(question => {
        const studentMark = studentMarks.find(mark => mark.questionId === question.id);
        if (studentMark) {
          totalObtainedMarks += studentMark.obtainedMarks;
          totalMaxMarks += question.maxMarks;
        }
      });

      if (totalMaxMarks === 0) {
        return null;
      }

      // Calculate percentage
      const percentage = (totalObtainedMarks / totalMaxMarks) * 100;

      // Get student info
      const student = await db.user.findUnique({
        where: { id: studentId },
        select: { name: true }
      });

      // Get CO info
      const co = await db.cO.findUnique({
        where: { id: coId },
        select: { code: true }
      });

      return {
        studentId,
        studentName: student?.name || 'Unknown',
        coId,
        coCode: co?.code || 'Unknown',
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        metTarget: false, // Will be determined by course target
        totalObtainedMarks,
        totalMaxMarks
      };
    } catch (error) {
      console.error('Error calculating student CO attainment:', error);
      return null;
    }
  }

  /**
   * Step 2: Determine if a Student "Met the Target"
   */
  static async determineTargetMet(
    courseId: string,
    studentAttainment: StudentCOAttainment
  ): Promise<StudentCOAttainment> {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { targetPercentage: true }
    });

    const targetPercentage = course?.targetPercentage || 50.0;
    
    return {
      ...studentAttainment,
      metTarget: studentAttainment.percentage >= targetPercentage
    };
  }

  /**
   * Step 3: Calculate the Percentage of Students Who Met the Target
   */
  static async calculateClassCOAttainment(
    courseId: string,
    coId: string,
    filters?: {
      section?: string;
      academicYear?: string;
      semester?: string;
    }
  ): Promise<ClassCOAttainment | null> {
    try {
      // Get course details for thresholds
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: {
          targetPercentage: true,
          level1Threshold: true,
          level2Threshold: true,
          level3Threshold: true
        }
      });

      if (!course) {
        return null;
      }

      // Get CO details
      const co = await db.cO.findUnique({
        where: { id: coId },
        select: {
          code: true,
          description: true
        }
      });

      if (!co) {
        return null;
      }

      // Get all enrolled students for this course
      const enrollments = await db.enrollment.findMany({
        where: {
          courseId: courseId,
          isActive: true
        },
        include: {
          student: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (enrollments.length === 0) {
        return null;
      }

      // Calculate attainment for each student
      const studentAttainments: StudentCOAttainment[] = [];
      
      for (const enrollment of enrollments) {
        const attainment = await this.calculateStudentCOAttainment(
          courseId,
          coId,
          enrollment.student.id
        );
        
        if (attainment) {
          const attainmentWithTarget = await this.determineTargetMet(
            courseId,
            attainment
          );
          studentAttainments.push(attainmentWithTarget);
        }
      }

      if (studentAttainments.length === 0) {
        return null;
      }

      // Count students meeting target
      const studentsMeetingTarget = studentAttainments.filter(
        attainment => attainment.metTarget
      ).length;

      // Calculate percentage of students meeting target
      const percentageMeetingTarget = (studentsMeetingTarget / studentAttainments.length) * 100;

      // Step 4: Determine the Final Attainment Level
      let attainmentLevel = 0;
      
      if (percentageMeetingTarget >= course.level3Threshold) {
        attainmentLevel = 3;
      } else if (percentageMeetingTarget >= course.level2Threshold) {
        attainmentLevel = 2;
      } else if (percentageMeetingTarget >= course.level1Threshold) {
        attainmentLevel = 1;
      }

      return {
        coId,
        coCode: co.code,
        coDescription: co.description,
        totalStudents: studentAttainments.length,
        studentsMeetingTarget,
        percentageMeetingTarget: Math.round(percentageMeetingTarget * 100) / 100,
        attainmentLevel,
        targetPercentage: course.targetPercentage,
        level1Threshold: course.level1Threshold,
        level2Threshold: course.level2Threshold,
        level3Threshold: course.level3Threshold
      };
    } catch (error) {
      console.error('Error calculating class CO attainment:', error);
      return null;
    }
  }

  /**
   * Calculate attainment for all COs in a course
   */
  static async calculateCourseAttainment(
    courseId: string,
    filters?: {
      section?: string;
      academicYear?: string;
      semester?: string;
    }
  ): Promise<COAttainmentSummary | null> {
    try {
      // Get course details
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          name: true,
          code: true,
          targetPercentage: true,
          level1Threshold: true,
          level2Threshold: true,
          level3Threshold: true
        }
      });

      if (!course) {
        return null;
      }

      // Get all COs for this course
      const cos = await db.cO.findMany({
        where: {
          courseId: courseId,
          isActive: true
        },
        orderBy: { code: 'asc' }
      });

      if (cos.length === 0) {
        return null;
      }

      // Calculate attainment for each CO
      const coAttainments: ClassCOAttainment[] = [];
      const allStudentAttainments: StudentCOAttainment[] = [];

      for (const co of cos) {
        const classAttainment = await this.calculateClassCOAttainment(
          courseId,
          co.id,
          filters
        );
        
        if (classAttainment) {
          coAttainments.push(classAttainment);
        }

        // Also get individual student attainments for this CO
        const enrollments = await db.enrollment.findMany({
          where: {
            courseId: courseId,
            isActive: true
          },
          include: {
            student: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        for (const enrollment of enrollments) {
          const studentAttainment = await this.calculateStudentCOAttainment(
            courseId,
            co.id,
            enrollment.student.id
          );
          
          if (studentAttainment) {
            const attainmentWithTarget = await this.determineTargetMet(
              courseId,
              studentAttainment
            );
            allStudentAttainments.push(attainmentWithTarget);
          }
        }
      }

      const totalStudents = new Set(allStudentAttainments.map(a => a.studentId)).size;

      return {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        targetPercentage: course.targetPercentage,
        level1Threshold: course.level1Threshold,
        level2Threshold: course.level2Threshold,
        level3Threshold: course.level3Threshold,
        totalStudents,
        coAttainments,
        studentAttainments: allStudentAttainments,
        calculatedAt: new Date()
      };
    } catch (error) {
      console.error('Error calculating course attainment:', error);
      return null;
    }
  }

  /**
   * Save calculated attainments to database
   */
  static async saveAttainments(
    courseId: string,
    studentAttainments: StudentCOAttainment[],
    academicYear?: string,
    semester?: string
  ): Promise<void> {
    try {
      const data = studentAttainments.map(attainment => ({
        courseId,
        coId: attainment.coId,
        studentId: attainment.studentId,
        percentage: attainment.percentage,
        metTarget: attainment.metTarget,
        academicYear,
        semester
      }));

      // Use upsert to handle duplicates
      await Promise.all(
        data.map(item =>
          db.cOAttainment.upsert({
            where: {
              courseId_coId_studentId_academicYear_semester: {
                courseId: item.courseId,
                coId: item.coId,
                studentId: item.studentId,
                academicYear: item.academicYear || '',
                semester: item.semester || ''
              }
            },
            update: {
              percentage: item.percentage,
              metTarget: item.metTarget,
              calculatedAt: new Date()
            },
            create: item
          })
        )
      );
    } catch (error) {
      console.error('Error saving attainments:', error);
      throw error;
    }
  }

  /**
   * Helper method to get student marks for questions
   * This reads from a mock data file - in production, this would query a real database table
   */
  private static async getStudentMarksForQuestions(
    studentId: string,
    questionIds: string[]
  ): Promise<Array<{ questionId: string; obtainedMarks: number }>> {
    try {
      // In a real implementation, this would query a student submissions/answers table
      // For now, we'll read from the mock data file
      const fs = await import('fs');
      const path = await import('path');
      
      const mockDataPath = path.join(process.cwd(), 'scripts', 'mock-student-marks.json');
      
      if (!fs.existsSync(mockDataPath)) {
        console.log('Mock student marks file not found, generating random data');
        // Generate random marks if file doesn't exist
        return questionIds.map(questionId => ({
          questionId,
          obtainedMarks: Math.floor(Math.random() * 10) + 1
        }));
      }
      
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
      
      // Filter marks for this student and the requested questions
      const studentMarks = mockData
        .filter((mark: any) => mark.studentId === studentId && questionIds.includes(mark.questionId))
        .map((mark: any) => ({
          questionId: mark.questionId,
          obtainedMarks: mark.obtainedMarks
        }));
      
      return studentMarks;
    } catch (error) {
      console.error('Error reading student marks:', error);
      // Fallback to random data
      return questionIds.map(questionId => ({
        questionId,
        obtainedMarks: Math.floor(Math.random() * 10) + 1
      }));
    }
  }
}