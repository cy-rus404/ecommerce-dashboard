"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProductDetailPage() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (params.id && user) {
      fetchProduct();
    }
  }, [params.id, user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        router.push('/products');
        return;
      }

      setProduct(data);
    } catch (error) {
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!product) return 0;
    
    let price = parseFloat(product.price);
    
    if (product.discount_percentage && 
        product.discount_start_date && product.discount_end_date &&
        new Date() >= new Date(product.discount_start_date) && 
        new Date() <= new Date(product.discount_end_date)) {
      price = price * (1 - product.discount_percentage / 100);
    }
    
    return (price * quantity).toFixed(2);
  };

  const addToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    try {
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
          selected_size: selectedSize || null,
          selected_color: selectedColor || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,product_id,selected_size,selected_color'
        });

      if (error) {
        alert('Failed to add to cart');
      } else {
        alert('Added to cart successfully!');
      }
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getSizes = () => {
    if (product?.available_sizes && product.available_sizes.length > 0) {
      return product.available_sizes;
    }
    // Default sizes based on category
    if (product?.category === 'shoes') {
      return ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
    }
    if (product?.category === 'clothing') {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
    return [];
  };

  const getColors = () => {
    if (product?.available_colors && product.available_colors.length > 0) {
      return product.available_colors;
    }
    return ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray'];
  };

  const sizes = getSizes();
  const colors = getColors();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!product) return <div className="p-8">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="mb-4">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img
                    src={product.image_urls[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              
              {product.image_urls && product.image_urls.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.image_urls.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded cursor-pointer ${
                        currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="mb-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Price */}
              <div className="mb-6">
                {product.discount_percentage && 
                 product.discount_start_date && product.discount_end_date &&
                 new Date() >= new Date(product.discount_start_date) && 
                 new Date() <= new Date(product.discount_end_date) ? (
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl text-gray-500 line-through">
                        ₵{parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount_percentage}% OFF
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-red-600">
                      ₵{(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    ₵{parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    {product?.category === 'shoes' ? 'Shoe Size' : 'Size'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg ${
                          selectedSize === size
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {product?.category === 'shoes' ? `Size ${size}` : size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg ${
                          selectedColor === color
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">{product.stock} items available</p>
              </div>

              {/* Total Price */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">₵{calculatePrice()}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={addingToCart || product.stock === 0 || (sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition ${
                  !addingToCart && product.stock > 0 && (sizes.length === 0 || selectedSize) && (colors.length === 0 || selectedColor)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addingToCart
                  ? 'Adding to Cart...'
                  : product.stock === 0 
                  ? 'Out of Stock' 
                  : (sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)
                  ? `Select ${!selectedSize && sizes.length > 0 ? 'Size' : ''}${!selectedSize && !selectedColor && sizes.length > 0 && colors.length > 0 ? ' & ' : ''}${!selectedColor && colors.length > 0 ? 'Color' : ''}`
                  : 'Add to Cart'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}