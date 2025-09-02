# SKU Merger

A simple tool to merge duplicate SKUs in GoodDay.

## How to Use

### 1. Start the Tool
```bash
npm install
npm run server
```
Then open: `http://localhost:3001`

### 2. Upload Your CSV File
- Click "Choose CSV File" or drag your file into the box
- Your CSV needs 3 columns: `sku`, `skuToReplace`, `retainSku`
- Use the "Download Sample CSV" button to see the format

### 3. Enter Your API Key
- Type your GoodDay API key in the "Merchant Key" box
- The status will show "Key Entered" when you're ready

### 4. Merge Your SKUs
- Click "Merge SKUs" (it will only work when you have both a file and API key)
- Wait for it to finish - you'll see "Merged!" when done
- Copy the results if needed using "Copy Response"

## What It Does

Takes your CSV file like this:
```csv
sku,skuToReplace,retainSku
ABC123,ABC123-DUPLICATE-1,sku
XYZ789,XYZ789-DUPLICATE-1,sku
```

And merges the duplicate SKUs in GoodDay automatically.

## If Something Goes Wrong

- **"Missing required headers"** - Your CSV needs exactly those 3 column names
- **"No JSON data to send"** - Upload a CSV file first
- **"Please enter your API key"** - Type your API key in the box
- **403/401 errors** - Your API key might be wrong

## Need Help?

1. Try the sample CSV file first
2. Make sure your CSV has the right column names
3. Check that the server is running (`npm run server`)
4. Use "Copy Response" to share error details with IT
