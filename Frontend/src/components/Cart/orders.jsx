import { useOrder } from "./OrderContext.jsx";
import { useEffect } from "react";
import './orders.css';

const OrderHistory = () => {
  const { orders, fetchOrders, refreshOrders, loading } = useOrder();



  useEffect(() => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.emailOrMobile && user._id) {
      fetchOrders(user.emailOrMobile);
    }
  }, []); // Remove fetchOrders dependency to prevent infinite re-renders

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order History</h2>
        <button 
          className="btn btn-outline-primary" 
          onClick={refreshOrders}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="no-orders text-center">
          <img src="https://th.bing.com/th/id/OIP.t2ItWxlFbrYwNEJZ0U8NHwAAAA?pid=ImgDet&w=143&h=157&c=7" alt="" />
          <h3>There is no order yet.</h3>
          <p>Explore SV Textiles now and start shopping!</p>
          <button className="btn btn-dark mt-3" onClick={() => window.location.href = '/shop'}>
            Shop Now
          </button>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order, index) => (
            <div key={order._id || index} className="order-row">
              {/* Order Image */}
              <div className="order-image">
                <img
                  src={order.items[0]?.imageUrl || "https://via.placeholder.com/150"}
                  alt="Order Item"
                  className="img-fluid rounded"
                />
              </div>
              {/* Order Details */}
              <div className="order-details flex-grow-1 ms-4">
                <h5>Order #{index + 1}</h5>
                <p><strong>Date:</strong> {new Date(order.createdAt || order.orderDate).toLocaleString()}</p>
                <p><strong>Total:</strong> ₹{order.total}</p>
                <p><strong>Status:</strong> <span className={`badge bg-${order.status === 'pending' ? 'warning' : order.status === 'delivered' ? 'success' : 'info'}`}>{order.status || 'pending'}</span></p>
                {order.address && (
                  <p>
                    <strong>Address:</strong> {`${order.address.village || ''}, ${order.address.city || ''}, ${order.address.state || ''}, ${order.address.pincode || ''}`}
                  </p>
                )}
                <ul className="item-list">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} - {item.quantity || 1} x ₹{item.price} = ₹{(item.quantity || 1) * item.price}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
