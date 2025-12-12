# Course Seeding Instructions

## Step 1: Place the Excel File

Place your Excel file (`courses_list_-_namac.xlsx`) in the project root directory:

```
/tmp/cc-agent/61268270/project/courses_list_-_namac.xlsx
```

The script will also look for these alternative names:
- `courses_list.xlsx`
- `courses.xlsx`
- `namac_courses.xlsx`

## Step 2: Run the Seeding Script

```bash
node seed-courses.js
```

## Expected Excel Format

The script will automatically map common column names to database fields. It looks for columns like:

- **Course Name** / Title / title / Course → `title`
- **Type** / type / Course Type → `type` (STCW, Refresher, Technical, Other)
- **Category** / category → `category`
- **Duration** / duration → `duration`
- **Mode** / mode / Delivery Mode → `mode` (offline, online, hybrid)
- **Fees** / Fee / fees / Price → `fees`
- **Description** / description / Details → `description`
- **Overview** / Course Overview → `course_overview`
- **Target Audience** / target_audience / Audience → `target_audience`
- **Entry Requirements** / entry_requirements / Requirements → `entry_requirements`
- **Validity (Months)** / Validity / validity_months → `validity_months`
- **Currency** / currency → `currency` (INR, USD, EUR, AED)

## Notes

- Required field: **Course Name** (title)
- All courses will be set to `status: 'active'`
- The script will show you a preview of the first row before importing
- Progress will be displayed for each row
- Summary will show success/error counts at the end

## Troubleshooting

If you get an error about missing columns, check the actual column names in your Excel file and update the mappings in `seed-courses.js` lines 88-101.
