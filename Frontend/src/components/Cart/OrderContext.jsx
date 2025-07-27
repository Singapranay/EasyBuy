import React, { createContext, useContext, useState, useCallback } from "react";

// Create the OrderContext
const OrderContext = createContext();

// Custom hook to use the OrderContext
export const useOrder = () => {
  return useContext(OrderContext);
};

// OrderProvider component to wrap around the application
const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch orders from backend
  const fetchOrders = useCallback(async (emailOrMobile) => {
    if (!emailOrMobile) return;
    
    setLoading(true);
    try {
      // Get user data from localStorage
      let userData = JSON.parse(localStorage.getItem("user"));
      
      if (!userData || !userData._id) {
        // Try to fetch user data from backend if not in localStorage
        const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/user/${emailOrMobile}`);
        
        if (userResponse.ok) {
          userData = await userResponse.json();
          // Update localStorage with complete user data
          localStorage.setItem("user", JSON.stringify({
            ...userData,
            name: userData.name || emailOrMobile.split("@")[0]
          }));
        } else {
          console.error('User not found');
          setLoading(false);
          return;
        }
      }
      
      // Fetch orders for that user
      const ordersResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/orders/${userData._id}`);
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to add a new order
  const addOrder = (order) => {
    setOrders((prevOrders) => [order, ...prevOrders]);
  };

  // Function to clear all orders (optional utility)
  const clearOrders = () => {
    setOrders([]);
  };

  // Function to refresh orders
  const refreshOrders = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.emailOrMobile) {
      await fetchOrders(user.emailOrMobile);
    }
  }, [fetchOrders]);

  // Provide orders and functions as context values
  return (
    <OrderContext.Provider value={{ 
      orders, 
      addOrder, 
      clearOrders, 
      fetchOrders, 
      refreshOrders,
      loading 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
