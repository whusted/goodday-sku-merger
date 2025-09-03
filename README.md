# SKU Merger

A simple tool to merge duplicate SKUs in GoodDay.

## How to Use

### 1. Upload Your CSV File
- Click "Choose CSV File" or drag your file into the box
- Your CSV needs 3 columns: `sku`, `skuToReplace`, `retainSku`
- Use the "Download Sample CSV" button to see the format

### 2. Enter Your API Key
- Type your Merchant API key in the "Merchant Key" box
- The status will show "Key Entered"

### 3. Merge Your SKUs
- Click "Merge SKUs" (it will only work when you have both a file and API key)
- Wait for the response to appear below
- Use the "Copy Response" button to copy the result

## Production Deployment
This app is deployed on Railway and will work automatically in production.

## If Something Goes Wrong

- **"Missing required headers"** - Your CSV needs exactly those 3 column names
- **"No JSON data to send"** - Upload a CSV file first
- **"Please enter your API key"** - Type your API key in the box
- **403/401 errors** - Your API key might be wrong

## Need Help?

1. Try the sample CSV file first
2. Make sure your CSV has the right column names
3. Double check your merchant API key
4. Use "Copy Response" to share error details with the engineering team
