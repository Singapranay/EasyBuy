import { useContext, useState } from "react";
import { CartContext } from "./CartContext.jsx";
import { useOrder } from "./OrderContext.jsx";

const Cart = ({ emailOrMobile }) => {
  const { cart, updateQuantity, clearCart } = useContext(CartContext);
  const { addOrder, refreshOrders } = useOrder();

  // State for delivery address
  const [address, setAddress] = useState({
    village: "",
    streetNo: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!address.village || !address.city || !address.state || !address.pincode) {
      alert("Please fill in all address details.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsSubmitting(true);

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
          throw new Error('User not found. Please login again.');
        }
      }

      // Prepare order data
      const orderData = {
        userId: userData._id,
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: item.quantity || 1
        })),
        total: cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0) + 50,
        address: address,
        orderDate: new Date().toLocaleString(),
      };

      // Send order to backend
      const orderResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const orderResult = await orderResponse.json();

      // Add to local context for immediate display
      addOrder({
        ...orderData,
        _id: orderResult.order._id,
        createdAt: orderResult.order.createdAt
      });

      // Refresh orders from backend
      await refreshOrders();

      alert("Order placed successfully!");
      clearCart();
      setAddress({ village: "", streetNo: "", city: "", state: "", pincode: "" });
    } catch (error) {
      console.error('Order placement error:', error);
      alert(`Failed to place order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 ">
          <img
            src="https://th.bing.com/th/id/OIP.GTpAJzc2mjH1AwOQgrda3AHaHa?w=200&h=201&c=7&r=0&o=5&pid=1.7"
            alt="Empty Cart"
            className="mb-3"
          />
          <h5 className="mb-3">Uh-Oh! Your cart appears to be empty!</h5>
          <a href="/shop" className="btn btn-dark">
            Shop Now
          </a>
        </div>
      ) : (
        <div className="row">
          {/* Cart Items */}
          <div className="col-md-8">
            <div className="list-group">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="list-group-item d-flex flex-column flex-md-row align-items-center mb-4 p-4 border rounded shadow"
                  style={{ backgroundColor: "#f9f9f9" }}
                >
                  {/* Image */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="rounded mb-3 mb-md-0"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                  {/* Details */}
                  <div className="flex-grow-1 ms-md-4 text-center text-md-start">
                    <h5>{item.name}</h5>
                    <p className="mb-2">Price: ₹{item.price}</p>
                    <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                      <button
                        className="btn btn-dark btn-sm me-2"
                        onClick={() => updateQuantity(item, (item.quantity || 1) + 1)}
                      >
                        +
                      </button>
                      <span>{item.quantity || 1}</span>
                      <button
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => updateQuantity(item, (item.quantity || 1) - 1)}
                      >
                        -
                      </button>
                    </div>
                  </div>
                  {/* Total */}
                  <div className="fw-bold text-center text-md-end">₹{item.price * (item.quantity || 1)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary and Address */}
          <div className="col-md-4">
            {/* Order Summary */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="card-title">Order Summary</h4>
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Subtotal</span>
                    <span>₹{cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Shipping</span>
                    <span>₹50</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>
                      ₹
                      {cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0) + 50}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Delivery Address Form */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Delivery Address</h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="village" className="form-label">
                      Village
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="village"
                      name="village"
                      value={address.village}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="streetNo" className="form-label">
                      Street No
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="streetNo"
                      name="streetNo"
                      value={address.streetNo}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="state"
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="pincode" className="form-label">
                      Pincode
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="pincode"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleChange}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-dark w-100"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
