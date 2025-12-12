import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Possible file names to look for
const possibleFiles = [
  'courses_list_-_namac.xlsx',
  'courses_list.xlsx',
  'courses.xlsx',
  'namac_courses.xlsx'
];

async function seedCourses() {
  try {
    // Find the Excel file
    let excelPath = null;
    for (const fileName of possibleFiles) {
      const path = join(__dirname, fileName);
      if (existsSync(path)) {
        excelPath = path;
        break;
      }
    }

    if (!excelPath) {
      console.error('❌ Could not find Excel file!');
      console.log('\nPlease place your Excel file in the project root with one of these names:');
      possibleFiles.forEach(name => console.log('  -', name));
      console.log('\nOr update the script with your file name.');
      process.exit(1);
    }

    console.log('📂 Reading Excel file:', excelPath);

    // Read the Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✓ Found ${data.length} rows in Excel file\n`);

    if (data.length === 0) {
      console.error('❌ No data found in Excel file');
      process.exit(1);
    }

    // Show available columns
    console.log('📋 Available columns:', Object.keys(data[0]).join(', '));
    console.log('\n📝 Sample row:');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Insert courses into database
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Map Excel columns to database columns
        // Adjust these mappings based on your actual Excel column names
        const courseData = {
          title: row['Course Name'] || row['Title'] || row['title'] || row['Course'] || row['course'],
          type: row['Type'] || row['type'] || row['Course Type'] || 'Other',
          category: row['Category'] || row['category'],
          duration: String(row['Duration'] || row['duration'] || ''),
          mode: row['Mode'] || row['mode'] || row['Delivery Mode'] || 'offline',
          fees: parseFloat(row['Fees'] || row['Fee'] || row['fees'] || row['fee'] || row['Price'] || row['price'] || 0),
          description: row['Description'] || row['description'] || row['Details'] || '',
          course_overview: row['Overview'] || row['Course Overview'] || row['description'] || row['Description'] || '',
          target_audience: row['Target Audience'] || row['target_audience'] || row['Audience'] || '',
          entry_requirements: row['Entry Requirements'] || row['entry_requirements'] || row['Requirements'] || '',
          validity_months: parseInt(row['Validity (Months)'] || row['Validity'] || row['validity_months'] || row['validity'] || 60),
          currency: (row['Currency'] || row['currency'] || 'INR').toUpperCase(),
          status: 'active',
        };

        // Remove undefined, null, and empty string values
        Object.keys(courseData).forEach(key => {
          if (courseData[key] === undefined || courseData[key] === null || courseData[key] === '') {
            delete courseData[key];
          }
        });

        // Ensure required fields are present
        if (!courseData.title) {
          console.warn(`⚠️  Row ${i + 1}: Skipping - no title found`);
          errorCount++;
          continue;
        }

        const { data: inserted, error } = await supabase
          .from('courses')
          .insert(courseData)
          .select();

        if (error) {
          console.error(`❌ Row ${i + 1}: ${courseData.title} - ${error.message}`);
          errors.push({ row: i + 1, title: courseData.title, error: error.message });
          errorCount++;
        } else {
          console.log(`✓ Row ${i + 1}: ${courseData.title}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Row ${i + 1}: ${err.message}`);
        errors.push({ row: i + 1, error: err.message });
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 SEEDING COMPLETE');
    console.log('='.repeat(80));
    console.log(`✓ Success: ${successCount} courses`);
    console.log(`❌ Errors:  ${errorCount} courses`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n❌ Error details:');
      errors.forEach(err => {
        console.log(`  Row ${err.row}: ${err.title || 'Unknown'} - ${err.error}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedCourses();
