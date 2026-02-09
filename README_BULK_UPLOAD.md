# Bulk Student Upload - Sample File

## Sample CSV File

A sample CSV file (`sample_students.csv`) has been created with 20 students' data for testing the bulk upload feature.

## File Format

The CSV file includes the following columns:

### Required Columns:
- **name** - Student's full name
- **email** - Student's email address (must be unique)
- **dob** - Date of birth (format: YYYY-MM-DD)
- **department** - Department name (must exist in the system)
- **year** - Academic year (1, 2, 3, or 4)
- **section** - Section number (1, 2, or 3)
- **batch** - Batch year (e.g., 2022-2026)
- **gender** - Gender (Male, Female, or Other)
- **contactNumber** - Student's contact number
- **fatherName** - Father's name
- **motherName** - Mother's name
- **fatherContactNumber** - Father's contact number

### Optional Columns:
- **motherContactNumber** - Mother's contact number
- **avatar** - Base64 encoded image (not included in sample)

## Important Notes

1. **Department Names**: The sample file uses common department names:
   - Computer Science
   - Electronics
   - Mechanical
   - Civil

   **Make sure these departments exist in your database before uploading!** If they don't exist, you'll need to add them first through the "Add Department" feature.

2. **Email Uniqueness**: All emails in the sample file are unique. If you upload the same file twice, the second upload will show errors for duplicate emails.

3. **Date Format**: The sample uses YYYY-MM-DD format, but the system also accepts DD/MM/YYYY format.

4. **Testing**: 
   - First, ensure the departments exist in your system
   - Upload the CSV file through the "Bulk Add Students" feature
   - Check the success/error messages for each row

## How to Use

1. Navigate to Admin Dashboard → Bulk Add Students
2. Click "Choose file to upload"
3. Select `sample_students.csv`
4. Click "Upload & Process"
5. Review the results showing how many students were successfully added

## Customizing the Sample File

You can edit the CSV file to:
- Change department names to match your system
- Modify student details
- Add more rows
- Remove rows you don't need

Just make sure to maintain the CSV format and include all required columns.

