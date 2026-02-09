import Admin from "../models/admin.js";
import Department from "../models/department.js";
import Faculty from "../models/faculty.js";
import Student from "../models/student.js";
import Subject from "../models/subject.js";
import Notice from "../models/notice.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const errors = { usernameError: String, passwordError: String };
  try {
    const existingAdmin = await Admin.findOne({ username });
    if (!existingAdmin) {
      errors.usernameError = "Admin doesn't exist.";
      return res.status(404).json(errors);
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingAdmin.password
    );
    if (!isPasswordCorrect) {
      errors.passwordError = "Invalid Credentials";
      return res.status(404).json(errors);
    }

    const token = jwt.sign(
      {
        email: existingAdmin.email,
        id: existingAdmin._id,
      },
      "sEcReT",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingAdmin, token: token });
  } catch (error) {
    console.log(error);
  }
};

export const updatedPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email } = req.body;
    const errors = { mismatchError: String };
    if (newPassword !== confirmPassword) {
      errors.mismatchError =
        "Your password and confirmation password do not match";
      return res.status(400).json(errors);
    }

    const admin = await Admin.findOne({ email });
    let hashedPassword;
    hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();
    if (admin.passwordUpdated === false) {
      admin.passwordUpdated = true;
      await admin.save();
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      response: admin,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const updateAdmin = async (req, res) => {
  try {
    const { name, dob, department, contactNumber, avatar, email } = req.body;
    const updatedAdmin = await Admin.findOne({ email });
    if (name) {
      updatedAdmin.name = name;
      await updatedAdmin.save();
    }
    if (dob) {
      updatedAdmin.dob = dob;
      await updatedAdmin.save();
    }
    if (department) {
      updatedAdmin.department = department;
      await updatedAdmin.save();
    }
    if (contactNumber) {
      updatedAdmin.contactNumber = contactNumber;
      await updatedAdmin.save();
    }
    if (avatar) {
      updatedAdmin.avatar = avatar;
      await updatedAdmin.save();
    }
    res.status(200).json(updatedAdmin);
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addAdmin = async (req, res) => {
  try {
    const { name, dob, department, contactNumber, avatar, email, joiningYear } =
      req.body;
    const errors = { emailError: String };
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      errors.emailError = "Email already exists";
      return res.status(400).json(errors);
    }
    const existingDepartment = await Department.findOne({ department });
    let departmentHelper = existingDepartment.departmentCode;
    const admins = await Admin.find({ department });

    let helper;
    if (admins.length < 10) {
      helper = "00" + admins.length.toString();
    } else if (admins.length < 100 && admins.length > 9) {
      helper = "0" + admins.length.toString();
    } else {
      helper = admins.length.toString();
    }
    var date = new Date();
    var components = ["ADM", date.getFullYear(), departmentHelper, helper];

    var username = components.join("");
    let hashedPassword;
    const newDob = dob.split("-").reverse().join("-");

    hashedPassword = await bcrypt.hash(newDob, 10);
    var passwordUpdated = false;
    const newAdmin = await new Admin({
      name,
      email,
      password: hashedPassword,
      joiningYear,
      username,
      department,
      avatar,
      contactNumber,
      dob,
      passwordUpdated,
    });
    await newAdmin.save();
    return res.status(200).json({
      success: true,
      message: "Admin registerd successfully",
      response: newAdmin,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const addDummyAdmin = async () => {
  const email = "dummy@gmail.com";
  const password = "123";
  const name = "dummy";
  const username = "ADMDUMMY";
  let hashedPassword;
  hashedPassword = await bcrypt.hash(password, 10);
  var passwordUpdated = true;

  const dummyAdmin = await Admin.findOne({ email });

  if (!dummyAdmin) {
    await Admin.create({
      name,
      email,
      password: hashedPassword,
      username,
      passwordUpdated,
    });
    console.log("Dummy user added.");
  } else {
    console.log("Dummy user already exists.");
  }
};

export const createNotice = async (req, res) => {
  try {
    const { from, content, topic, date, noticeFor } = req.body;

    const errors = { noticeError: String };
    const exisitingNotice = await Notice.findOne({ topic, content, date });
    if (exisitingNotice) {
      errors.noticeError = "Notice already created";
      return res.status(400).json(errors);
    }
    const newNotice = await new Notice({
      from,
      content,
      topic,
      noticeFor,
      date,
    });
    await newNotice.save();
    return res.status(200).json({
      success: true,
      message: "Notice created successfully",
      response: newNotice,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addDepartment = async (req, res) => {
  try {
    const errors = { departmentError: String };
    const { department } = req.body;
    const existingDepartment = await Department.findOne({ department });
    if (existingDepartment) {
      errors.departmentError = "Department already added";
      return res.status(400).json(errors);
    }
    const departments = await Department.find({});
    let add = departments.length + 1;
    let departmentCode;
    if (add < 9) {
      departmentCode = "0" + add.toString();
    } else {
      departmentCode = add.toString();
    }

    const newDepartment = await new Department({
      department,
      departmentCode,
    });

    await newDepartment.save();
    return res.status(200).json({
      success: true,
      message: "Department added successfully",
      response: newDepartment,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addFaculty = async (req, res) => {
  try {
    const {
      name,
      dob,
      department,
      contactNumber,
      avatar,
      email,
      joiningYear,
      gender,
      designation,
    } = req.body;
    const errors = { emailError: String };
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      errors.emailError = "Email already exists";
      return res.status(400).json(errors);
    }
    const existingDepartment = await Department.findOne({ department });
    let departmentHelper = existingDepartment.departmentCode;

    const faculties = await Faculty.find({ department });
    let helper;
    if (faculties.length < 10) {
      helper = "00" + faculties.length.toString();
    } else if (faculties.length < 100 && faculties.length > 9) {
      helper = "0" + faculties.length.toString();
    } else {
      helper = faculties.length.toString();
    }
    var date = new Date();
    var components = ["FAC", date.getFullYear(), departmentHelper, helper];

    var username = components.join("");
    let hashedPassword;
    const newDob = dob.split("-").reverse().join("-");

    hashedPassword = await bcrypt.hash(newDob, 10);
    var passwordUpdated = false;

    const newFaculty = await new Faculty({
      name,
      email,
      password: hashedPassword,
      joiningYear,
      username,
      department,
      avatar,
      contactNumber,
      dob,
      gender,
      designation,
      passwordUpdated,
    });
    await newFaculty.save();
    return res.status(200).json({
      success: true,
      message: "Faculty registerd successfully",
      response: newFaculty,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const getFaculty = async (req, res) => {
  try {
    const { department } = req.body;
    const errors = { noFacultyError: String };
    const faculties = await Faculty.find({ department });
    if (faculties.length === 0) {
      errors.noFacultyError = "No Faculty Found";
      return res.status(404).json(errors);
    }
    res.status(200).json({ result: faculties });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const getNotice = async (req, res) => {
  try {
    const errors = { noNoticeError: String };
    const notices = await Notice.find({});
    if (notices.length === 0) {
      errors.noNoticeError = "No Notice Found";
      return res.status(404).json(errors);
    }
    res.status(200).json({ result: notices });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addSubject = async (req, res) => {
  try {
    const { totalLectures, department, subjectCode, subjectName, year } =
      req.body;
    const errors = { subjectError: String };
    const subject = await Subject.findOne({ subjectCode });
    if (subject) {
      errors.subjectError = "Given Subject is already added";
      return res.status(400).json(errors);
    }

    const newSubject = await new Subject({
      totalLectures,
      department,
      subjectCode,
      subjectName,
      year,
    });

    await newSubject.save();
    const students = await Student.find({ department, year });
    if (students.length !== 0) {
      for (var i = 0; i < students.length; i++) {
        students[i].subjects.push(newSubject._id);
        await students[i].save();
      }
    }
    return res.status(200).json({
      success: true,
      message: "Subject added successfully",
      response: newSubject,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const getSubject = async (req, res) => {
  try {
    const { department, year } = req.body;

    if (!req.userId) return res.json({ message: "Unauthenticated" });
    const errors = { noSubjectError: String };

    const subjects = await Subject.find({ department, year });
    if (subjects.length === 0) {
      errors.noSubjectError = "No Subject Found";
      return res.status(404).json(errors);
    }
    res.status(200).json({ result: subjects });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const getAdmin = async (req, res) => {
  try {
    const { department } = req.body;

    const errors = { noAdminError: String };

    const admins = await Admin.find({ department });
    if (admins.length === 0) {
      errors.noAdminError = "No Subject Found";
      return res.status(404).json(errors);
    }
    res.status(200).json({ result: admins });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admins = req.body;
    const errors = { noAdminError: String };
    for (var i = 0; i < admins.length; i++) {
      var admin = admins[i];

      await Admin.findOneAndDelete({ _id: admin });
    }
    res.status(200).json({ message: "Admin Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const deleteFaculty = async (req, res) => {
  try {
    const faculties = req.body;
    const errors = { noFacultyError: String };
    for (var i = 0; i < faculties.length; i++) {
      var faculty = faculties[i];

      await Faculty.findOneAndDelete({ _id: faculty });
    }
    res.status(200).json({ message: "Faculty Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const deleteStudent = async (req, res) => {
  try {
    const students = req.body;
    const errors = { noStudentError: String };
    for (var i = 0; i < students.length; i++) {
      var student = students[i];

      await Student.findOneAndDelete({ _id: student });
    }
    res.status(200).json({ message: "Student Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const deleteSubject = async (req, res) => {
  try {
    const subjects = req.body;
    const errors = { noSubjectError: String };
    for (var i = 0; i < subjects.length; i++) {
      var subject = subjects[i];

      await Subject.findOneAndDelete({ _id: subject });
    }
    res.status(200).json({ message: "Subject Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { department } = req.body;

    await Department.findOneAndDelete({ department });

    res.status(200).json({ message: "Department Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addStudent = async (req, res) => {
  try {
    const {
      name,
      dob,
      department,
      contactNumber,
      avatar,
      email,
      section,
      gender,
      batch,
      fatherName,
      motherName,
      fatherContactNumber,
      motherContactNumber,
      year,
    } = req.body;
    const errors = { emailError: String };
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      errors.emailError = "Email already exists";
      return res.status(400).json(errors);
    }
    const existingDepartment = await Department.findOne({ department });
    let departmentHelper = existingDepartment.departmentCode;

    const students = await Student.find({ department });
    let helper;
    if (students.length < 10) {
      helper = "00" + students.length.toString();
    } else if (students.length < 100 && students.length > 9) {
      helper = "0" + students.length.toString();
    } else {
      helper = students.length.toString();
    }
    var date = new Date();
    var components = ["STU", date.getFullYear(), departmentHelper, helper];

    var username = components.join("");
    let hashedPassword;
    const newDob = dob.split("-").reverse().join("-");

    hashedPassword = await bcrypt.hash(newDob, 10);
    var passwordUpdated = false;

    const newStudent = await new Student({
      name,
      dob,
      password: hashedPassword,
      username,
      department,
      contactNumber,
      avatar,
      email,
      section,
      gender,
      batch,
      fatherName,
      motherName,
      fatherContactNumber,
      motherContactNumber,
      year,
      passwordUpdated,
    });
    await newStudent.save();
    const subjects = await Subject.find({ department, year });
    if (subjects.length !== 0) {
      for (var i = 0; i < subjects.length; i++) {
        newStudent.subjects.push(subjects[i]._id);
      }
    }
    await newStudent.save();
    return res.status(200).json({
      success: true,
      message: "Student registerd successfully",
      response: newStudent,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const getStudent = async (req, res) => {
  try {
    const { department, year, section } = req.body;
    const errors = { noStudentError: String };
    const students = await Student.find({ department, year });

    if (students.length === 0) {
      errors.noStudentError = "No Student Found";
      return res.status(404).json(errors);
    }

    res.status(200).json({ result: students });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const getAllStudent = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.log("Backend Error", error);
  }
};

export const getAllFaculty = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.status(200).json(faculties);
  } catch (error) {
    console.log("Backend Error", error);
  }
};

export const getAllAdmin = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.log("Backend Error", error);
  }
};
export const getAllDepartment = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    console.log("Backend Error", error);
  }
};
export const getAllSubject = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    console.log("Backend Error", error);
  }
};

export const bulkAddStudent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ backendError: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let studentsData = [];

    // Parse the file based on extension
    if (fileExtension === ".csv" || fileExtension === ".xlsx" || fileExtension === ".xls") {
      try {
        // For CSV files, use specific options
        const workbook = XLSX.readFile(filePath, {
          type: fileExtension === ".csv" ? "string" : "buffer",
          cellDates: false,
          cellNF: false,
          cellText: false,
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        studentsData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
        });
      } catch (parseError) {
        fs.unlinkSync(filePath);
        console.log("File parsing error:", parseError);
        return res.status(400).json({ 
          backendError: `Error parsing file: ${parseError.message}` 
        });
      }
    } else {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ backendError: "Invalid file format. Please upload CSV or Excel file." });
    }

    if (studentsData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ backendError: "File is empty or has no valid data" });
    }

    console.log("Parsed data sample:", studentsData[0]);
    console.log("Total rows:", studentsData.length);

    // Required fields
    const requiredFields = [
      "name",
      "email",
      "dob",
      "department",
      "year",
      "section",
      "batch",
      "gender",
      "contactNumber",
      "fatherName",
      "motherName",
      "fatherContactNumber",
    ];

    const errors = [];
    const successful = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each student
    for (let i = 0; i < studentsData.length; i++) {
      const row = studentsData[i];
      const rowNumber = i + 2; // +2 because row 1 is header and arrays are 0-indexed

      try {
        // Debug: Log first row to see what fields are available
        if (i === 0) {
          console.log("First row keys:", Object.keys(row));
          console.log("First row data:", row);
        }

        // Validate required fields
        const missingFields = requiredFields.filter((field) => {
          const value = row[field];
          return !value || (typeof value === 'string' && value.trim() === "") || value === null || value === undefined;
        });
        if (missingFields.length > 0) {
          errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(", ")}`);
          errorCount++;
          continue;
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ email: row.email.toString().trim() });
        if (existingStudent) {
          errors.push(`Row ${rowNumber}: Email ${row.email} already exists`);
          errorCount++;
          continue;
        }

        // Validate department exists
        const existingDepartment = await Department.findOne({ department: row.department.toString().trim() });
        if (!existingDepartment) {
          errors.push(`Row ${rowNumber}: Department "${row.department}" does not exist`);
          errorCount++;
          continue;
        }

        const departmentHelper = existingDepartment.departmentCode;

        // Generate username
        const students = await Student.find({ department: row.department.toString().trim() });
        let helper;
        if (students.length < 10) {
          helper = "00" + students.length.toString();
        } else if (students.length < 100 && students.length > 9) {
          helper = "0" + students.length.toString();
        } else {
          helper = students.length.toString();
        }
        const date = new Date();
        const components = ["STU", date.getFullYear(), departmentHelper, helper];
        const username = components.join("");

        // Hash password (using DOB as default password)
        let dob = row.dob.toString().trim();
        // Handle different date formats
        if (dob.includes("/")) {
          const parts = dob.split("/");
          dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        const newDob = dob.split("-").reverse().join("-");
        console.log(newDob);
        const hashedPassword = await bcrypt.hash(newDob, 10);
        console.log(hashedPassword);

        // Create student object
        const newStudent = new Student({
          name: row.name.toString().trim(),
          email: row.email.toString().trim(),
          dob: dob,
          password: hashedPassword,
          username: username,
          department: row.department.toString().trim(),
          contactNumber: parseInt(row.contactNumber) || 0,
          avatar: row.avatar ? row.avatar.toString().trim() : "",
          section: row.section.toString().trim(),
          gender: row.gender.toString().trim(),
          batch: row.batch.toString().trim(),
          fatherName: row.fatherName.toString().trim(),
          motherName: row.motherName.toString().trim(),
          fatherContactNumber: parseInt(row.fatherContactNumber) || 0,
          motherContactNumber: row.motherContactNumber ? parseInt(row.motherContactNumber) : 0,
          year: parseInt(row.year) || 1,
          passwordUpdated: false,
        });

        // Save student to database
        try {
          await newStudent.save();
          console.log(`Student saved successfully: ${newStudent.email} (${newStudent.username})`);
        } catch (saveError) {
          // Handle duplicate email or validation errors
          if (saveError.code === 11000) {
            errors.push(`Row ${rowNumber}: Email ${row.email} already exists in database`);
          } else if (saveError.errors) {
            const validationErrors = Object.keys(saveError.errors)
              .map(key => `${key}: ${saveError.errors[key].message}`)
              .join(", ");
            errors.push(`Row ${rowNumber}: Validation error - ${validationErrors}`);
          } else {
            errors.push(`Row ${rowNumber}: Save error - ${saveError.message}`);
          }
          console.error(`Error saving student at row ${rowNumber}:`, saveError);
          errorCount++;
          continue;
        }

        // Add subjects based on department and year
        try {
          const subjects = await Subject.find({
            department: row.department.toString().trim(),
            year: row.year.toString().trim(),
          });
          if (subjects.length !== 0) {
            for (let j = 0; j < subjects.length; j++) {
              newStudent.subjects.push(subjects[j]._id);
            }
            await newStudent.save();
            console.log(`Added ${subjects.length} subject(s) to student: ${newStudent.email}`);
          }
        } catch (subjectError) {
          console.error(`Error adding subjects to student at row ${rowNumber}:`, subjectError);
          // Don't fail the whole operation if subjects can't be added
        }

        successful.push({
          row: rowNumber,
          name: newStudent.name,
          email: newStudent.email,
          username: newStudent.username,
        });
        successCount++;
        console.log(`Successfully processed row ${rowNumber}: ${newStudent.name} (${newStudent.email})`);
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
        errorCount++;
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return response
    const response = {
      success: successCount > 0 || errorCount === 0,
      message: `Processed ${studentsData.length} rows. Successfully added ${successCount} student(s).`,
      count: successCount,
      errorCount: errorCount,
      errors: errors.length > 0 ? errors : [],
      successful: successful.length > 0 ? successful : [],
    };

    // If all failed, return 400 status but still include the data
    if (successCount === 0 && errorCount > 0) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.log("Error deleting file:", unlinkError);
      }
    }
    const errors = { backendError: String };
    errors.backendError = error.message || "Failed to process file";
    console.log("Bulk Add Student Error:", error);
    res.status(500).json(errors);
  }
};
