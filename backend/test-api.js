import axios from 'axios';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInNlc3Npb25JZCI6ImY4NzE2YTZjLTQ5Y2ItNGZmOC05NjQwLTU3OTA1YWUzYmU1ZCIsImlhdCI6MTc3NjgzMTUzNiwiZXhwIjoxNzc2ODMyNDM2LCJhdWQiOiJ1c2VyIn0.Z3DSmUmldS7J3RfXVdka_moUHodNhoVzMpki7jJfUsY';
async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/order', {
      restaurantId: 1,
      items: [{ menuItemId: 1, quantity: 1 }],
      deliveryAddress: "Test Addr",
      deliveryPhone: "01700000000",
      deliveryLat: 23.8116888,
      deliveryLng: 90.4172444,
      addressId: 1
    }, {
      headers: { Cookie: `accessToken=${token}` }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
