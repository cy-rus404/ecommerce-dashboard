"use client";
import { useState, useEffect, useCallback } from "react";
import { logger } from "../../../lib/logger";
import { VALIDATION_LIMITS } from "../../../lib/constants";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    gender: "",
    age_group: "",
    brand: "",
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Input validation using constants
    if (name === 'name' && value.length > VALIDATION_LIMITS.PRODUCT_NAME_MAX) return;
    if (name === 'description' && value.length > VALIDATION_LIMITS.DESCRIPTION_MAX) return;
    if (name === 'price' && (parseFloat(value) < 0 || parseFloat(value) > VALIDATION_LIMITS.PRICE_MAX)) return;
    if (name === 'stock' && (parseInt(value) < 0 || parseInt(value) > VALIDATION_LIMITS.STOCK_MAX)) return;
    if (name === 'brand' && value.length > VALIDATION_LIMITS.BRAND_MAX) return;
    if (name === 'discount_percentage' && (parseFloat(value) < 0 || parseFloat(value) > 100)) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

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
        logger.error('Image upload failed', { fileName: file.name });
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


      let imageUrls: string[] = [];
      
      if (imageFiles.length > 0) {
        setUploading(true);
        imageUrls = await uploadImages(imageFiles);
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
            ...(formData.gender && { gender: formData.gender }),
            ...(formData.age_group && { age_group: formData.age_group }),
            ...(formData.brand && { brand: formData.brand }),
            discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
            discount_start_date: formData.discount_start_date || null,
            discount_end_date: formData.discount_end_date || null,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        logger.error('Product creation failed', { error: error.message });
        if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          setError('Database needs to be updated. Please run the add-product-demographics.sql file in Supabase.');
        } else {
          setError('Failed to add product. Please try again.');
        }
      } else {
        logger.info('Product created successfully', { productName: formData.name });
        setSuccess(true);
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          gender: "",
          age_group: "",
          brand: "",
          discount_percentage: "",
          discount_start_date: "",
          discount_end_date: ""
        });
        setImageFiles([]);
        setAvailableSizes([]);
        setAvailableColors([]);
      }
    } catch (error) {
      logger.error('Product creation process failed', { error });
      setError("Failed to add product. Please check your input and try again.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Add Product</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {typeof error === 'string' ? error : 'An error occurred'}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Product added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={100}
                pattern="[a-zA-Z0-9\s\-_.,!?()]+"
                title="Product name should contain only letters, numbers, and basic punctuation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={1000}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₵)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="999999"
                  className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  max="999999"
                  className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electronics">📱 Electronics</option>
                  <option value="clothing">👕 Clothing</option>
                  <option value="shoes">👟 Shoes</option>
                  <option value="accessories">👜 Accessories</option>
                  <option value="beauty">💄 Beauty & Personal Care</option>
                  <option value="sports">⚽ Sports & Fitness</option>
                  <option value="books">📚 Books</option>
                  <option value="home">🏠 Home & Garden</option>
                  <option value="toys">🧸 Toys & Games</option>
                  <option value="jewelry">💍 Jewelry</option>
                  <option value="other">🔧 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Nike, Apple, Samsung"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="men">👨 Men</option>
                  <option value="women">👩 Women</option>
                  <option value="unisex">👫 Unisex</option>
                  <option value="boys">👦 Boys</option>
                  <option value="girls">👧 Girls</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group
                </label>
                <select
                  name="age_group"
                  value={formData.age_group}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Age Group</option>
                  <option value="baby">👶 Baby (0-2 years)</option>
                  <option value="toddler">🧒 Toddler (2-4 years)</option>
                  <option value="kids">👦👧 Kids (5-12 years)</option>
                  <option value="teen">🧑‍🎓 Teen (13-17 years)</option>
                  <option value="adult">🧑 Adult (18+ years)</option>
                  <option value="senior">👴👵 Senior (65+ years)</option>
                  <option value="all_ages">🌟 All Ages</option>
                </select>
              </div>
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Discount (Optional)</h3>
              
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
                  <p className="text-sm text-green-800 dark:text-green-300">
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