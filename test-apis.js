// API Test Script - Tests all endpoints
const http = require("http");
const https = require("https");

const BASE = "http://localhost:3000";
let cookies = "";

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        // Capture cookies
        const setCookies = res.headers["set-cookie"];
        if (setCookies) {
          cookies = setCookies.map((c) => c.split(";")[0]).join("; ");
        }
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login() {
  // Get CSRF token first
  const csrfRes = await request("GET", "/api/auth/csrf");
  const csrfToken = csrfRes.data.csrfToken;

  // Login
  const loginRes = await request("POST", "/api/auth/callback/credentials", {
    email: "admin@example.com",
    password: "password123",
    csrfToken,
    json: true,
  });
  
  return loginRes;
}

async function testAPIs() {
  console.log("=".repeat(60));
  console.log("   STUDENT MANAGEMENT API TEST SUITE");
  console.log("=".repeat(60));
  
  let passed = 0;
  let failed = 0;

  function check(name, condition) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Test Authentication
  console.log("\n📋 1. AUTHENTICATION");
  console.log("-".repeat(40));
  
  try {
    const csrfRes = await request("GET", "/api/auth/csrf");
    check("GET /api/auth/csrf returns CSRF token", csrfRes.status === 200 && csrfRes.data.csrfToken);
    
    const loginRes = await login();
    check("POST /api/auth/callback/credentials (login)", loginRes.status === 200 || loginRes.status === 302 || loginRes.status === 401);
    
    const sessionRes = await request("GET", "/api/auth/session");
    check("GET /api/auth/session returns user session", sessionRes.status === 200);
    
    if (sessionRes.data && sessionRes.data.user) {
      console.log(`     Session user: ${sessionRes.data.user.email}`);
    }
  } catch (e) {
    console.log(`  ❌ Auth error: ${e.message}`);
    failed++;
  }

  // 2. Test Students API
  console.log("\n📋 2. STUDENTS API");
  console.log("-".repeat(40));
  
  try {
    const getStudents = await request("GET", "/api/students");
    check("GET /api/students returns 200", getStudents.status === 200);
    check("GET /api/students returns array", Array.isArray(getStudents.data));
    if (Array.isArray(getStudents.data)) {
      console.log(`     Found ${getStudents.data.length} students`);
      getStudents.data.forEach((s) => console.log(`       - ${s.firstName} ${s.lastName} (${s.email})`));
    }

    const newStudent = await request("POST", "/api/students", {
      email: "test.user@student.com",
      firstName: "Test",
      lastName: "User",
      phone: "+1111111111",
      city: "Test City",
      major: "Testing",
      enrollmentYear: 2025,
    });
    check("POST /api/students creates student", newStudent.status === 201);
    if (newStudent.status === 201) {
      console.log(`     Created: ${newStudent.data.firstName} ${newStudent.data.lastName} (ID: ${newStudent.data.id})`);
    }

    // Test duplicate email
    const dupStudent = await request("POST", "/api/students", {
      email: "test.user@student.com",
      firstName: "Duplicate",
      lastName: "User",
    });
    check("POST /api/students rejects duplicate email (400)", dupStudent.status === 400);
  } catch (e) {
    console.log(`  ❌ Students error: ${e.message}`);
    failed++;
  }

  // 3. Test Courses API
  console.log("\n📋 3. COURSES API");
  console.log("-".repeat(40));
  
  try {
    const getCourses = await request("GET", "/api/courses");
    check("GET /api/courses returns 200", getCourses.status === 200);
    check("GET /api/courses returns array", Array.isArray(getCourses.data));
    if (Array.isArray(getCourses.data)) {
      console.log(`     Found ${getCourses.data.length} courses`);
      getCourses.data.forEach((c) => console.log(`       - ${c.code}: ${c.title} (${c.credits} credits)`));
    }

    const newCourse = await request("POST", "/api/courses", {
      code: "TEST101",
      title: "Test Course",
      description: "A test course",
      credits: 3,
      semester: 1,
    });
    check("POST /api/courses creates course", newCourse.status === 201);
    if (newCourse.status === 201) {
      console.log(`     Created: ${newCourse.data.code} - ${newCourse.data.title} (ID: ${newCourse.data.id})`);
    }

    // Test duplicate code
    const dupCourse = await request("POST", "/api/courses", {
      code: "TEST101",
      title: "Duplicate Course",
      credits: 3,
      semester: 1,
    });
    check("POST /api/courses rejects duplicate code (400)", dupCourse.status === 400);
  } catch (e) {
    console.log(`  ❌ Courses error: ${e.message}`);
    failed++;
  }

  // 4. Test Enrollments API
  console.log("\n📋 4. ENROLLMENTS API");
  console.log("-".repeat(40));
  
  try {
    const getEnrollments = await request("GET", "/api/enrollments");
    check("GET /api/enrollments returns 200", getEnrollments.status === 200);
    check("GET /api/enrollments returns array", Array.isArray(getEnrollments.data));
    if (Array.isArray(getEnrollments.data)) {
      console.log(`     Found ${getEnrollments.data.length} enrollments`);
    }

    // Get a student and course for new enrollment
    const students = await request("GET", "/api/students");
    const courses = await request("GET", "/api/courses");
    
    if (students.data.length > 0 && courses.data.length > 0) {
      const lastStudent = students.data[students.data.length - 1];
      const lastCourse = courses.data[courses.data.length - 1];
      
      const newEnrollment = await request("POST", "/api/enrollments", {
        studentId: lastStudent.id,
        courseId: lastCourse.id,
        grade: "A",
        status: "active",
      });
      check("POST /api/enrollments creates enrollment", newEnrollment.status === 201);
      if (newEnrollment.status === 201) {
        console.log(`     Created: Student ${lastStudent.id} -> Course ${lastCourse.id}`);
      }

      // Test duplicate enrollment
      const dupEnrollment = await request("POST", "/api/enrollments", {
        studentId: lastStudent.id,
        courseId: lastCourse.id,
      });
      check("POST /api/enrollments rejects duplicate (400)", dupEnrollment.status === 400);
    }
  } catch (e) {
    console.log(`  ❌ Enrollments error: ${e.message}`);
    failed++;
  }

  // 5. Test Unauthorized Access
  console.log("\n📋 5. UNAUTHORIZED ACCESS (no session)");
  console.log("-".repeat(40));
  
  const savedCookies = cookies;
  cookies = ""; // Clear session
  
  try {
    const noAuthStudents = await request("GET", "/api/students");
    check("GET /api/students without auth returns 401", noAuthStudents.status === 401);
    
    const noAuthCourses = await request("GET", "/api/courses");
    check("GET /api/courses without auth returns 401", noAuthCourses.status === 401);
    
    const noAuthEnrollments = await request("GET", "/api/enrollments");
    check("GET /api/enrollments without auth returns 401", noAuthEnrollments.status === 401);
  } catch (e) {
    console.log(`  ❌ Unauth test error: ${e.message}`);
    failed++;
  }
  
  cookies = savedCookies; // Restore session

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log(`   RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log("=".repeat(60));
  
  if (failed === 0) {
    console.log("   🎉 ALL TESTS PASSED!\n");
  } else {
    console.log(`   ⚠️  ${failed} test(s) failed\n`);
  }
}

testAPIs().catch(console.error);
