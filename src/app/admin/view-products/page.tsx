"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { EmailService } from "../../../lib/emailService";
import { SMSService } from "../../../lib/smsService";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ViewProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingDiscount, setEditingDiscount] = useState<number | null>(null);
  const [discountData, setDiscountData] = useState({
    discount_percentage: "",
    discount_start_date: "",
    discount_end_date: ""
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        fetchProducts();
      }
    };
    checkAuth();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
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

  const updateStock = async (productId: number, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) {
        console.error("Error updating stock:", error);
        alert("Error updating stock");
      } else {
        console.log("Stock updated successfully");
        
        // Check if stock is low and send alert
        if (newStock <= 5) {
          console.log('Low stock detected, checking for alerts...');
          EmailService.checkAndSendLowStockAlerts();
        }
        
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      } else {
        console.log("Product deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const startEditingDiscount = (product: any) => {
    setEditingDiscount(product.id);
    setDiscountData({
      discount_percentage: product.discount_percentage || "",
      discount_start_date: product.discount_start_date || "",
      discount_end_date: product.discount_end_date || ""
    });
  };

  const updateDiscount = async (productId: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          discount_percentage: discountData.discount_percentage ? parseFloat(discountData.discount_percentage) : null,
          discount_start_date: discountData.discount_start_date || null,
          discount_end_date: discountData.discount_end_date || null
        })
        .eq('id', productId);

      if (error) {
        console.error("Error updating discount:", error);
        alert("Error updating discount");
      } else {
        console.log("Discount updated successfully");
        setEditingDiscount(null);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating discount:", error);
    }
  };

  const removeDiscount = async (productId: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          discount_percentage: null,
          discount_start_date: null,
          discount_end_date: null
        })
        .eq('id', productId);

      if (error) {
        console.error("Error removing discount:", error);
        alert("Error removing discount");
      } else {
        console.log("Discount removed successfully");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error removing discount:", error);
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === "in-stock") return product.stock > 0;
    if (filter === "out-of-stock") return product.stock === 0;
    if (filter === "low-stock") return product.stock > 0 && product.stock <= 5;
    return true;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length
  };

  if (loading) return <div className="p-8">Loading...</div>;

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
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">View Products</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Stock</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.inStock}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Out of Stock</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.outOfStock}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock (≤5)</h3>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.lowStock}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Products</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => EmailService.checkAndSendLowStockAlerts()}
                className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
              >
                Email Alerts
              </button>
              <button
                onClick={() => SMSService.checkAndSendLowStockAlerts()}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                SMS Alerts
              </button>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Products</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="low-stock">Low Stock</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_urls && product.image_urls.length > 0 && (
                          <div className="relative mr-3">
                            <img
                              src={product.image_urls[0]}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            {product.image_urls.length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {product.image_urls.length}
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.discount_percentage && 
                       new Date() >= new Date(product.discount_start_date) && 
                       new Date() <= new Date(product.discount_end_date) ? (
                        <div>
                          <span className="line-through text-gray-500 dark:text-gray-400">₵{product.price}</span>
                          <span className="text-red-600 font-bold ml-1">
                            ₵{(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                          </span>
                          <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-1 py-0.5 rounded ml-1">
                            {product.discount_percentage}% OFF
                          </span>
                        </div>
                      ) : (
                        <span>₵{product.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                        className="w-16 p-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {editingDiscount === product.id ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            placeholder="%"
                            value={discountData.discount_percentage}
                            onChange={(e) => setDiscountData({...discountData, discount_percentage: e.target.value})}
                            className="w-16 p-1 border rounded text-xs"
                            min="0"
                            max="100"
                          />
                          <input
                            type="date"
                            value={discountData.discount_start_date}
                            onChange={(e) => setDiscountData({...discountData, discount_start_date: e.target.value})}
                            className="w-full p-1 border dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <input
                            type="date"
                            value={discountData.discount_end_date}
                            onChange={(e) => setDiscountData({...discountData, discount_end_date: e.target.value})}
                            className="w-full p-1 border dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateDiscount(product.id)}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingDiscount(null)}
                              className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {product.discount_percentage ? (
                            <div className="text-xs">
                              <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-2 py-1 rounded">
                                {product.discount_percentage}% OFF
                              </span>
                              <div className="text-gray-500 dark:text-gray-400 mt-1">
                                {product.discount_start_date} to {product.discount_end_date}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">No discount</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock === 0 
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' 
                          : product.stock <= 5 
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-1">
                      {editingDiscount !== product.id && (
                        <>
                          <button
                            onClick={() => startEditingDiscount(product)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                          >
                            {product.discount_percentage ? 'Edit' : 'Add'} Discount
                          </button>
                          {product.discount_percentage && (
                            <button
                              onClick={() => removeDiscount(product.id)}
                              className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700"
                            >
                              Remove Discount
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No products found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}