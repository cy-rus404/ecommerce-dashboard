"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OptimizedImage from "../../components/OptimizedImage";
import { supabase } from "../../lib/supabase";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery, priceRange, selectedSize, selectedColor, selectedGender, sortBy]);

  const checkAuth = async () => {
    console.log('Products page: Checking auth...');
    
    // Check if in trial mode first
    const trialToken = localStorage.getItem('trial_token');
    const trialSession = localStorage.getItem('trial_session');
    
    console.log('Trial token:', trialToken);
    console.log('Trial session:', trialSession);
    
    if (trialToken) {
      console.log('Products page: Trial mode detected, creating mock user');
      const mockUser = {
        id: 'trial-user',
        email: 'trial@demo.com',
        user_metadata: { name: 'Trial User' }
      };
      setUser(mockUser);
      fetchProducts();
      fetchCartCount('trial-user');
      fetchWishlist('trial-user');
      return;
    }

    console.log('Products page: No trial token, checking regular auth');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Regular auth user:', user);
      console.log('Regular auth error:', error);
      
      if (!user) {
        console.log('Products page: No user found, redirecting to login');
        router.push("/login");
      } else {
        console.log('Products page: Regular user found, proceeding');
        setUser(user);
        fetchProducts();
        fetchCartCount(user.id);
        fetchWishlist(user.id);
      }
    } catch (error) {
      console.error('Products page: Auth error:', error);
      router.push("/login");
    }
  };

  const fetchProducts = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please check your connection and try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by price range
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    // Filter by size
    if (selectedSize !== "all") {
      filtered = filtered.filter(product => 
        product.available_sizes?.includes(selectedSize) ||
        (product.category === 'shoes' && ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'].includes(selectedSize)) ||
        (product.category === 'clothing' && ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(selectedSize))
      );
    }
    
    // Filter by color
    if (selectedColor !== "all") {
      filtered = filtered.filter(product => 
        product.available_colors?.includes(selectedColor) ||
        ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray'].includes(selectedColor)
      );
    }
    
    // Filter by gender
    if (selectedGender !== "all") {
      filtered = filtered.filter(product => 
        product.gender === selectedGender ||
        product.name.toLowerCase().includes(selectedGender) ||
        product.description.toLowerCase().includes(selectedGender)
      );
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return (b.stock || 0) - (a.stock || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    setFilteredProducts(filtered);
  };

  const fetchCartCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (!error) {
        setCartCount(count || 0);
      }
    } catch (error) {
      setCartCount(0);
    }
  };

  const fetchWishlist = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', userId);
      
      if (!error && data) {
        setWishlist(data.map(item => item.product_id));
      }
    } catch (error) {
      setWishlist([]);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (!user) return;
    
    setWishlistLoading(productId);
    const isInWishlist = wishlist.includes(productId);
    
    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (!error) {
          setWishlist(wishlist.filter(id => id !== productId));
        }
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
        
        if (!error) {
          setWishlist([...wishlist, productId]);
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setWishlistLoading(null);
    }
  };

  const handleLogout = async () => {
    const trialSession = localStorage.getItem('trial_session');
    if (trialSession) {
      localStorage.removeItem('trial_session');
      router.push('/trial');
    } else {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchProducts();
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
            
            {/* Mobile Menu */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="relative">
                <button
                  onClick={() => router.push('/cart')}
                  className="text-2xl hover:opacity-70 transition"
                  title="Cart"
                >
                  🛒
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              
              <button
                onClick={() => router.push('/my-orders')}
                className="bg-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-green-700 transition text-xs sm:text-sm"
              >
                Orders
              </button>
              
              <button
                onClick={() => router.push('/wishlist')}
                className="bg-pink-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-pink-700 transition text-xs sm:text-sm"
              >
                <span className="sm:hidden">❤️</span>
                <span className="hidden sm:inline">❤️ Wishlist</span>
              </button>
              
              <button
                onClick={() => router.push('/profile')}
                className="bg-purple-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm"
              >
                Profile
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-red-700 transition text-xs sm:text-sm"
              >
                Logout
              </button>
            </div>
            
            {/* Welcome message - hidden on mobile */}
            <div className="hidden lg:block text-gray-700 dark:text-gray-300 text-sm">
              Welcome, {user?.user_metadata?.name || user?.email}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Genders</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="unisex">Unisex</option>
            </select>
            
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Sizes</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="36">36</option>
              <option value="38">38</option>
              <option value="40">40</option>
              <option value="42">42</option>
              <option value="44">44</option>
            </select>
            
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Colors</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Gray">Gray</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="popularity">Most Popular</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">₵</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                className="w-full p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 1000})}
                className="w-full p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredProducts.length} of {products.length} products
            </span>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setPriceRange({ min: 0, max: 1000 });
                setSelectedSize("all");
                setSelectedColor("all");
                setSelectedGender("all");
                setSortBy("newest");
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? `No products found for "${searchQuery}"` : "No products available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col h-full"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="relative">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <>
                      <OptimizedImage
                        src={product.image_urls[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        width={300}
                        height={200}
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
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h3>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Rating Display */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-sm">
                          {star <= 4 ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">(4.0)</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">12 reviews</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                      {product.discount_percentage && 
                       product.discount_start_date && product.discount_end_date &&
                       new Date() >= new Date(product.discount_start_date) && 
                       new Date() <= new Date(product.discount_end_date) ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg text-gray-500 dark:text-gray-400 line-through decoration-2 decoration-red-500">
                              ₵{parseFloat(product.price).toFixed(2)}
                            </span>
                            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded font-medium">
                              SAVE ₵{(product.price * (product.discount_percentage / 100)).toFixed(2)}
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-red-600">
                            ₵{(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₵{parseFloat(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.stock > 0 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                      <button
                        disabled={product.stock === 0}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                          product.stock > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        disabled={wishlistLoading === product.id}
                        className={`p-2 rounded-lg transition ${
                          wishlist.includes(product.id)
                            ? 'bg-pink-600 text-white hover:bg-pink-700'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {wishlistLoading === product.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                        ) : (
                          wishlist.includes(product.id) ? '❤️' : '🤍'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}