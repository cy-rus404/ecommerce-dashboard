"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
    } else {
      setUser(user);
      fetchProducts();
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        // Use empty array if table doesn't exist yet
        setProducts([]);
      } else {
        console.log("Products fetched:", data);
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/cart')}
                className="text-2xl hover:opacity-70 transition"
                title="Cart"
              >
                🛒
              </button>
              <button
                onClick={() => router.push('/my-orders')}
                className="bg-green-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                My Orders
              </button>
              <span className="text-gray-700 text-sm hidden sm:block">Welcome, {user?.user_metadata?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-red-700 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="shoes">Shoes</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? `No products found for "${searchQuery}"` : "No products available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="relative">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <>
                      <img
                        src={product.image_urls[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                      {product.image_urls.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          +{product.image_urls.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {product.discount_percentage && 
                   product.discount_start_date && product.discount_end_date &&
                   new Date() >= new Date(product.discount_start_date) && 
                   new Date() <= new Date(product.discount_end_date) && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      -{product.discount_percentage}% OFF
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                      {product.discount_percentage && 
                       product.discount_start_date && product.discount_end_date &&
                       new Date() >= new Date(product.discount_start_date) && 
                       new Date() <= new Date(product.discount_end_date) ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg text-gray-500 line-through decoration-2 decoration-red-500">
                              ₵{parseFloat(product.price).toFixed(2)}
                            </span>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                              SAVE ₵{(product.price * (product.discount_percentage / 100)).toFixed(2)}
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-red-600">
                            ₵{(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">
                          ₵{parseFloat(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.stock > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  
                  <button
                    disabled={product.stock === 0}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                      product.stock > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}