import React, { useState, useEffect } from 'react';
import { useCart } from '../../Context/CartContext';
import { orderService } from '../../Services/orderService';
import api from '../../Services/api';
import toast from 'react-hot-toast';
import { Plus, Minus, Trash2, ShoppingCart, DollarSign, CreditCard, FileText } from 'lucide-react';

const POSInterface = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const { items, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, categoriesRes] = await Promise.all([
        api.get('/menu'),
        api.get('/categories'),
      ]);
      setMenuItems(menuRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === parseInt(selectedCategory);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.is_available;
  });

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        items: items.map(({ menu_item_id, quantity }) => ({
          menu_item_id,
          quantity,
        })),
        payment_method: paymentMethod,
        notes: notes,
      };

      const response = await orderService.createOrder(orderData);
      toast.success('Order created successfully!');
      clearCart();
      setNotes('');
      
      // Print receipt (optional)
      window.open(`/receipt/${response.order.id}`, '_blank');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu Items Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex space-x-4">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
                onClick={() => addToCart(item)}
              >
                <div className="aspect-w-1 aspect-h-1 mb-4">
                  <img
                    src={item.image || 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.stock_quantity <= item.low_stock_threshold && (
                    <span className="text-xs text-red-600">Low Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Current Order</h2>
          <p className="text-sm text-gray-500">{getItemCount()} items</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.map((item) => (
            <div key={item.menu_item_id} className="mb-4 p-2 border rounded">
              <div className="flex justify-between">
                <span className="font-medium">{item.name}</span>
                <button
                  onClick={() => removeFromCart(item.menu_item_id)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">
                  ${item.price.toFixed(2)} each
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                    className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                    className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right mt-1 font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Special instructions..."
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={processing || items.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;