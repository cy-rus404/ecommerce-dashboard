"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BulkUpload() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      previewCSV(file);
    } else {
      alert('Please select a CSV file');
    }
  };

  const previewCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      setPreview(data);
    };
    reader.readAsText(file);
  };

  const processCSV = async () => {
    if (!csvFile) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const products = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const product: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            
            switch(header.toLowerCase()) {
              case 'name':
                product.name = value;
                break;
              case 'description':
                product.description = value;
                break;
              case 'price':
                product.price = parseFloat(value) || 0;
                break;
              case 'stock':
                product.stock = parseInt(value) || 0;
                break;
              case 'category':
                product.category = value;
                break;
              case 'gender':
                product.gender = value;
                break;
              case 'age_group':
                product.age_group = value;
                break;
              case 'brand':
                product.brand = value;
                break;
              case 'image_urls':
                product.image_urls = value ? value.split('|').map(url => url.trim()) : [];
                break;
              case 'available_sizes':
                product.available_sizes = value ? value.split('|').map(size => size.trim()) : null;
                break;
              case 'available_colors':
                product.available_colors = value ? value.split('|').map(color => color.trim()) : null;
                break;
            }
          });
          
          return {
            ...product,
            created_at: new Date().toISOString()
          };
        }).filter(product => product.name && product.price);

        const { data, error } = await supabase
          .from('products')
          .insert(products);

        if (error) {
          setResults({
            success: false,
            error: error.message,
            attempted: products.length
          });
        } else {
          setResults({
            success: true,
            inserted: products.length,
            products: products
          });
        }
      } catch (error) {
        setResults({
          success: false,
          error: 'Failed to process CSV file',
          attempted: 0
        });
      } finally {
        setUploading(false);
      }
    };
    
    reader.readAsText(csvFile);
  };

  const downloadTemplate = () => {
    const template = `name,description,price,stock,category,gender,age_group,brand,image_urls,available_sizes,available_colors
"iPhone 15","Latest Apple smartphone",999.99,50,"electronics","unisex","adult","Apple","https://example.com/iphone1.jpg|https://example.com/iphone2.jpg","","Black|White|Blue"
"Nike Air Max","Comfortable running shoes",129.99,30,"shoes","unisex","adult","Nike","https://example.com/nike1.jpg","40|41|42|43|44","Black|White|Red"
"Summer Dress","Floral summer dress",49.99,25,"clothing","women","adult","Zara","https://example.com/dress1.jpg","S|M|L|XL","Blue|Pink|Yellow"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_products_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Bulk Product Upload</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Products via CSV</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={downloadTemplate}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-4"
              >
                📥 Download CSV Template
              </button>
              <p className="text-sm text-gray-600">
                Download the template to see the required format. Use | to separate multiple values (sizes, colors, image URLs).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {preview.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Preview (First 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map(key => (
                          <th key={key} className="px-4 py-2 border text-left text-xs font-medium text-gray-500 uppercase">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className="border-t">
                          {Object.values(row).map((value: any, i) => (
                            <td key={i} className="px-4 py-2 border text-sm text-gray-900">
                              {String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={processCSV}
              disabled={!csvFile || uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing CSV...
                </>
              ) : (
                '🚀 Upload Products'
              )}
            </button>
          </div>
        </div>

        {results && (
          <div className={`bg-white shadow rounded-lg p-6 ${results.success ? 'border-green-200' : 'border-red-200'}`}>
            <h3 className="text-lg font-semibold mb-4">
              {results.success ? '✅ Upload Results' : '❌ Upload Failed'}
            </h3>
            
            {results.success ? (
              <div>
                <p className="text-green-700 mb-2">
                  Successfully uploaded {results.inserted} products!
                </p>
                <button
                  onClick={() => router.push('/admin/view-products')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Products
                </button>
              </div>
            ) : (
              <div>
                <p className="text-red-700 mb-2">Error: {results.error}</p>
                <p className="text-gray-600">Attempted to upload: {results.attempted} products</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 CSV Format Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Required fields:</strong> name, description, price, stock, category</li>
            <li>• <strong>Optional fields:</strong> gender, age_group, brand, image_urls, available_sizes, available_colors</li>
            <li>• <strong>Multiple values:</strong> Use | to separate (e.g., "S|M|L|XL" for sizes)</li>
            <li>• <strong>Image URLs:</strong> Use | to separate multiple images</li>
            <li>• <strong>Prices:</strong> Use decimal format (e.g., 29.99)</li>
            <li>• <strong>Stock:</strong> Use whole numbers only</li>
          </ul>
        </div>
      </main>
    </div>
  );
}