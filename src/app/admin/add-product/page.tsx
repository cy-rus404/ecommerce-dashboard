"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    discount_percentage: "",
    discount_start_date: "",
    discount_end_date: ""
  });
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]) => {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${index}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let imageUrls = [];
      
      if (imageFiles.length > 0) {
        setUploading(true);
        imageUrls = await uploadImages(imageFiles);
        console.log('Images uploaded:', imageUrls);
        setUploading(false);
      }

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            category: formData.category,
            image_urls: imageUrls,
            available_sizes: availableSizes.length > 0 ? availableSizes : null,
            available_colors: availableColors.length > 0 ? availableColors : null,
            discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
            discount_start_date: formData.discount_start_date || null,
            discount_end_date: formData.discount_end_date || null,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error("Supabase insert error:", error);
        setError(error.message);
      } else {
        console.log("Product added successfully:", data);
        setSuccess(true);
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          discount_percentage: "",
          discount_start_date: "",
          discount_end_date: ""
        });
        setImageFiles([]);
        setAvailableSizes([]);
        setAvailableColors([]);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product");
    } finally {
      setLoading(false);
      setUploading(false);
    }
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
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Add Product</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Product added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₵)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="shoes">Shoes</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Sizes
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.category === 'shoes' ? (
                    // Shoe sizes
                    [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const sizeStr = size.toString();
                          setAvailableSizes(prev => 
                            prev.includes(sizeStr) 
                              ? prev.filter(s => s !== sizeStr)
                              : [...prev, sizeStr]
                          );
                        }}
                        className={`px-3 py-1 border rounded text-sm ${
                          availableSizes.includes(size.toString())
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  ) : formData.category === 'clothing' ? (
                    // Clothing sizes
                    ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setAvailableSizes(prev => 
                            prev.includes(size) 
                              ? prev.filter(s => s !== size)
                              : [...prev, size]
                          );
                        }}
                        className={`px-3 py-1 border rounded text-sm ${
                          availableSizes.includes(size)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Select clothing or shoes category to add sizes</p>
                  )}
                </div>
                {availableSizes.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Selected sizes: {availableSizes.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Colors (Optional)
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Brown', 'Pink', 'Yellow', 'Purple'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setAvailableColors(prev => 
                          prev.includes(color) 
                            ? prev.filter(c => c !== color)
                            : [...prev, color]
                        );
                      }}
                      className={`px-3 py-1 border rounded text-sm ${
                        availableColors.includes(color)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                {availableColors.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Selected colors: {availableColors.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images (Multiple)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {imageFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">
                    Selected {imageFiles.length} image(s):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-600 hover:text-red-800 text-sm ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Discount Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Discount (Optional)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="discount_start_date"
                    value={formData.discount_start_date}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="discount_end_date"
                    value={formData.discount_end_date}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formData.discount_percentage && formData.price && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Discounted Price: ₵{(parseFloat(formData.price) * (1 - parseFloat(formData.discount_percentage) / 100)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {uploading ? "Uploading Image..." : loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}